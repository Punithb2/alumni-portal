# backend/app/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from collections import Counter
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from .models import (
    UserProfile, WorkExperience, Education, Job, JobApplication, SavedJob,
    HiringDrive, MentorProfile, MentoringSession, MentorGoal,
    MentoringRequest, Post, Comment, ForumCategory, ForumTopic,
    ForumReply, Conversation, Message, ConnectionRequest, Event, NewsArticle, Notification,
    Campaign, Donation, Club, ClubMembership, ClubJoinRequest, ClubPost, ClubPostComment,
    ClubPostLike, ClubMessage,
    PortalSettings, AuditLog
)


def get_user_avatar(user):
    profile = getattr(user, 'profile', None)
    avatar = getattr(profile, 'avatar', '')
    return avatar or ''

def validate_text_length(value, field_name, max_length):
    text = (value or '').strip()
    if text and len(text) > max_length:
        raise serializers.ValidationError(f'{field_name} cannot exceed {max_length} characters.')
    return value


def get_connection_relationship(current_user, other_user):
    if not current_user or not current_user.is_authenticated or not other_user or current_user.id == other_user.id:
        return None
    return ConnectionRequest.objects.filter(
        Q(requester=current_user, recipient=other_user) |
        Q(requester=other_user, recipient=current_user)
    ).order_by('-created_at').first()


def get_connection_status_for_user(current_user, other_user):
    if not current_user or not current_user.is_authenticated:
        return 'none'
    if not other_user:
        return 'none'
    if current_user.id == other_user.id:
        return 'self'

    rel = get_connection_relationship(current_user, other_user)
    if not rel:
        return 'none'
    if rel.status == 'accepted':
        return 'connected'
    if rel.status == 'pending':
        if rel.requester_id == current_user.id:
            return 'outgoing_pending'
        return 'incoming_pending'
    return 'none'


def get_connection_request_id_for_user(current_user, other_user):
    rel = get_connection_relationship(current_user, other_user)
    if rel and rel.status == 'pending':
        return rel.id
    return None

# ==========================================
# 1. CORE DIRECTORY & PROFILES
# ==========================================

class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'last_login']


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        return super().get_token(user)

    def validate(self, attrs):
        identifier = attrs.get(self.username_field)
        password = attrs.get('password')
        if identifier is None or password is None:
            raise AuthenticationFailed('No active account found with the given credentials')

        username_value = identifier
        user = User.objects.filter(email__iexact=identifier).first()
        if user:
            username_value = user.username

        auth_kwargs = {self.username_field: username_value, 'password': password}
        request = self.context.get('request')
        if request is not None:
            auth_kwargs['request'] = request
        self.user = authenticate(**auth_kwargs)

        if self.user is None or not self.user.is_active:
            raise AuthenticationFailed('No active account found with the given credentials')

        return super().validate({self.username_field: username_value, 'password': password})

class UserRegistrationSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        validators=[UniqueValidator(queryset=User.objects.all(), message='This username is already taken.')]
    )
    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=User.objects.all(), message='This email is already registered.')]
    )
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, required=True, write_only=True)
    
    # Extra profile fields
    phone = serializers.CharField(required=False, allow_blank=True, write_only=True)
    city = serializers.CharField(required=False, allow_blank=True, write_only=True)
    department = serializers.CharField(required=False, allow_blank=True, write_only=True)
    graduation_year = serializers.IntegerField(required=False, allow_null=True, write_only=True)
    current_company = serializers.CharField(required=False, allow_blank=True, write_only=True)
    current_position = serializers.CharField(required=False, allow_blank=True, write_only=True)
    linkedin_url = serializers.URLField(required=False, allow_null=True, allow_blank=True, write_only=True)
    student_id = serializers.CharField(required=False, allow_blank=True, write_only=True)
    gender = serializers.CharField(required=False, allow_blank=True, write_only=True)
    college = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'first_name', 'last_name', 'role',
            'phone', 'city', 'department', 'graduation_year', 'current_company',
            'current_position', 'linkedin_url', 'student_id', 'gender', 'college'
        ]

    def validate_username(self, value):
        return value.strip()

    def validate_email(self, value):
        return value.strip().lower()

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        linkedin = validated_data.pop('linkedin_url', None)
        if not linkedin:
            linkedin = None

        profile_data = {
            'role': validated_data.pop('role'),
            'phone': validated_data.pop('phone', ''),
            'city': validated_data.pop('city', ''),
            'department': validated_data.pop('department', ''),
            'graduation_year': validated_data.pop('graduation_year', None),
            'current_company': validated_data.pop('current_company', ''),
            'current_position': validated_data.pop('current_position', ''),
            'linkedin_url': linkedin,
            'student_id': validated_data.pop('student_id', ''),
            'gender': validated_data.pop('gender', ''),
            'college': validated_data.pop('college', ''),
        }
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        
        UserProfile.objects.create(user=user, **profile_data)
        return user

class WorkExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkExperience
        fields = '__all__'

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):
    # This nests the user email, work history, and education directly into the profile JSON
    user = UserBasicSerializer(read_only=True)
    first_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    last_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    email = serializers.EmailField(write_only=True, required=False)
    work_experiences = WorkExperienceSerializer(many=True, read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    connection_status = serializers.SerializerMethodField()
    connection_request_id = serializers.SerializerMethodField()
    account_status = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'role', 'avatar', 'headline', 'bio', 'city', 'country', 
                  'department', 'graduation_year', 'current_company', 'current_position',
                  'linkedin_url', 'github_url', 'website', 'phone', 'student_id', 
                  'skills', 'willing_to_mentor', 'willing_to_hire', 'visibility',
                  'supplemental_profile', 'professional_preferences', 'mentorship_preferences',
                  'notification_preferences', 'privacy_preferences',
                  'work_experiences', 'education', 'connection_status', 'connection_request_id',
                  'account_status',
                  'first_name', 'last_name', 'email']

    def update(self, instance, validated_data):
        first_name = validated_data.pop('first_name', None)
        last_name = validated_data.pop('last_name', None)
        email = validated_data.pop('email', None)

        user = instance.user
        user_update_fields = []

        if first_name is not None:
            user.first_name = first_name.strip()
            user_update_fields.append('first_name')
        if last_name is not None:
            user.last_name = last_name.strip()
            user_update_fields.append('last_name')
        if email is not None:
            normalized_email = email.strip().lower()
            if User.objects.exclude(id=user.id).filter(email__iexact=normalized_email).exists():
                raise serializers.ValidationError({'email': ['This email is already registered.']})
            user.email = normalized_email
            user_update_fields.append('email')

        if user_update_fields:
            user.save(update_fields=user_update_fields)

        return super().update(instance, validated_data)

    def _get_relationship(self, obj):
        request = self.context.get('request')
        current_user = getattr(request, 'user', None)
        return get_connection_relationship(current_user, obj.user)

    def get_connection_status(self, obj):
        request = self.context.get('request')
        current_user = getattr(request, 'user', None)
        return get_connection_status_for_user(current_user, obj.user)

    def get_connection_request_id(self, obj):
        rel = self._get_relationship(obj)
        if rel and rel.status == 'pending':
            return rel.id
        return None

    def get_account_status(self, obj):
        user = getattr(obj, 'user', None)
        if not user:
            return 'Active'
        if not user.is_active:
            return 'Suspended'
        invited = bool((obj.supplemental_profile or {}).get('invited'))
        if invited and not user.last_login:
            return 'Pending'
        return 'Active'

# ==========================================
# 2. JOB BOARD & CAREERS
# ==========================================

class JobSerializer(serializers.ModelSerializer):
    posted_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = '__all__'
        
    def get_posted_by_name(self, obj):
        if obj.posted_by:
            return obj.posted_by.get_full_name()
        return "Admin"

    def validate_description(self, value):
        return validate_text_length(value, 'Description', 5000)

    def validate_requirements(self, value):
        return validate_text_length(value, 'Requirements', 5000)

class JobApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_company = serializers.CharField(source='job.company', read_only=True)

    class Meta:
        model = JobApplication
        fields = '__all__'

    def validate_cover_letter(self, value):
        return validate_text_length(value, 'Cover letter', 3000)

class SavedJobSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_company = serializers.CharField(source='job.company', read_only=True)

    class Meta:
        model = SavedJob
        fields = '__all__'
        read_only_fields = ['user']

class HiringDriveSerializer(serializers.ModelSerializer):
    registered = serializers.SerializerMethodField()

    class Meta:
        model = HiringDrive
        fields = '__all__'
        
    def get_registered(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.registered_users.filter(id=request.user.id).exists()
        return False

# ==========================================
# 3. MENTORSHIP MODULE
# ==========================================

class MentorProfileSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True) # Full profile details included

    class Meta:
        model = MentorProfile
        fields = '__all__'

class MentoringSessionSerializer(serializers.ModelSerializer):
    mentor = MentorProfileSerializer(read_only=True)
    mentee_name = serializers.CharField(source='mentee.get_full_name', read_only=True)

    class Meta:
        model = MentoringSession
        fields = '__all__'

class MentoringRequestSerializer(serializers.ModelSerializer):
    mentor_name = serializers.CharField(source='mentor.user.user.get_full_name', read_only=True)
    mentee_name = serializers.CharField(source='mentee.get_full_name', read_only=True)

    class Meta:
        model = MentoringRequest
        fields = '__all__'

    def validate_message(self, value):
        return validate_text_length(value, 'Message', 2000)

# ==========================================
# 4. SOCIAL FEED & COMMUNITY
# ==========================================

class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    author_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ['author', 'created_at']

    def get_author_avatar(self, obj):
        return get_user_avatar(obj.author)

    def validate_content(self, value):
        return validate_text_length(value, 'Comment', 2000)

class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    author_avatar = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    comment_count = serializers.SerializerMethodField()
    author_id = serializers.IntegerField(source='author.id', read_only=True)
    author_profile_id = serializers.SerializerMethodField()
    author_role = serializers.SerializerMethodField()
    author_connection_status = serializers.SerializerMethodField()
    author_connection_request_id = serializers.SerializerMethodField()
    current_user_reaction = serializers.SerializerMethodField()
    reaction_counts = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = '__all__'
        read_only_fields = ['author', 'created_at']
        
    def get_comment_count(self, obj):
        return obj.comments.count()

    def get_author_avatar(self, obj):
        return get_user_avatar(obj.author)

    def get_author_profile_id(self, obj):
        profile = getattr(obj.author, 'profile', None)
        return getattr(profile, 'id', None)

    def get_author_role(self, obj):
        profile = getattr(obj.author, 'profile', None)
        return getattr(profile, 'role', '') or ''

    def get_author_connection_status(self, obj):
        request = self.context.get('request')
        current_user = getattr(request, 'user', None)
        return get_connection_status_for_user(current_user, obj.author)

    def get_author_connection_request_id(self, obj):
        request = self.context.get('request')
        current_user = getattr(request, 'user', None)
        return get_connection_request_id_for_user(current_user, obj.author)

    def get_current_user_reaction(self, obj):
        request = self.context.get('request')
        current_user = getattr(request, 'user', None)
        if not current_user or not current_user.is_authenticated:
            return None
        reaction = obj.reactions.filter(user=current_user).first()
        return reaction.reaction if reaction else None

    def get_reaction_counts(self, obj):
        values = list(obj.reactions.values_list('reaction', flat=True))
        if values:
            return dict(Counter(values))
        return obj.reaction_counts or {}

    def validate_content(self, value):
        return validate_text_length(value, 'Post content', 5000)

# ==========================================
# 5. FORUMS, EVENTS, & NOTIFICATIONS
# ==========================================

class ForumCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ForumCategory
        fields = '__all__'

class ForumReplySerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    author_avatar = serializers.SerializerMethodField()

    class Meta:
        model = ForumReply
        fields = '__all__'

    def get_author_avatar(self, obj):
        return get_user_avatar(obj.author)

    def validate_content(self, value):
        return validate_text_length(value, 'Reply', 3000)

class ForumTopicSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    reply_count = serializers.SerializerMethodField()
    replies = ForumReplySerializer(many=True, read_only=True)

    class Meta:
        model = ForumTopic
        fields = '__all__'

    def get_reply_count(self, obj):
        return obj.replies.count()

    def validate_content(self, value):
        return validate_text_length(value, 'Topic content', 6000)

class EventSerializer(serializers.ModelSerializer):
    attendees_count = serializers.SerializerMethodField()
    is_registered = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    club_name = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ['created_by']

    def get_attendees_count(self, obj):
        return obj.attendees.count()

    def get_is_registered(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.attendees.filter(id=request.user.id).exists()
        return False

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name().strip() or obj.created_by.username
        return ''

    def get_club_name(self, obj):
        return obj.club.name if obj.club else ''

class NotificationSerializer(serializers.ModelSerializer):
    can_respond = serializers.SerializerMethodField()
    connection_request_status = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = '__all__'

    def _get_connection_request(self, obj):
        if obj.notification_type != 'connection_request':
            return None
        req_id = (obj.metadata or {}).get('connection_request_id')
        if not req_id:
            return None
        return ConnectionRequest.objects.filter(id=req_id).first()

    def get_can_respond(self, obj):
        req = self._get_connection_request(obj)
        request = self.context.get('request')
        current_user = getattr(request, 'user', None)
        return bool(req and current_user and req.recipient_id == current_user.id and req.status == 'pending')

    def get_connection_request_status(self, obj):
        req = self._get_connection_request(obj)
        return req.status if req else None

class NewsArticleSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = NewsArticle
        fields = '__all__'
        read_only_fields = ['author', 'author_name', 'updated_at', 'published_at']

    def get_author_name(self, obj):
        if obj.author:
            return obj.author.get_full_name() or obj.author.username
        return 'Admin'


class PortalSettingsSerializer(serializers.ModelSerializer):
    updated_by_name = serializers.SerializerMethodField()

    class Meta:
        model = PortalSettings
        fields = '__all__'
        read_only_fields = ['updated_by', 'updated_at']

    def get_updated_by_name(self, obj):
        if obj.updated_by:
            return obj.updated_by.get_full_name()
        return ''


class AuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = '__all__'

    def get_actor_name(self, obj):
        if obj.actor:
            return obj.actor.get_full_name()
        return 'System'

# ==========================================
# 6. MESSAGING
# ==========================================

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    sender_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = '__all__'

    def get_sender_avatar(self, obj):
        return get_user_avatar(obj.sender)

    def validate_content(self, value):
        return validate_text_length(value, 'Message', 3000)

class ConversationSerializer(serializers.ModelSerializer):
    participants = UserBasicSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = '__all__'

    def get_last_message(self, obj):
        msg = obj.messages.order_by('-sent_at').first()
        if msg:
            return {'content': msg.content, 'sent_at': msg.sent_at}
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0

# ==========================================
# 7. CAMPAIGNS & DONATIONS
# ==========================================

class DonationSerializer(serializers.ModelSerializer):
    campaign_title = serializers.CharField(source='campaign.title', read_only=True)
    donor_name = serializers.SerializerMethodField()

    class Meta:
        model = Donation
        fields = '__all__'
        read_only_fields = ['donor']

    def get_donor_name(self, obj):
        if obj.anonymous:
            return 'Anonymous'
        if obj.donor:
            return obj.donor.get_full_name()
        return 'Anonymous'

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Amount must be greater than zero.')
        return value

class CampaignSerializer(serializers.ModelSerializer):
    recent_donors = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Campaign
        fields = '__all__'
        read_only_fields = ['raised', 'donor_count', 'created_by']

    def get_recent_donors(self, obj):
        donations = obj.donations.filter(status='completed').order_by('-created_at')[:10]
        return [
            {
                'name': 'Anonymous' if d.anonymous else (d.donor.get_full_name() if d.donor else 'Anonymous'),
                'amount': float(d.amount) if obj.campaign_type == 'donation' else 'Participating',
                'date': d.created_at.date().isoformat(),
                'anonymous': d.anonymous,
            }
            for d in donations
        ]

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name()
        return 'Admin'

    def validate_story(self, value):
        return validate_text_length(value, 'Story', 5000)

    def validate_long_story(self, value):
        return validate_text_length(value, 'Long story', 20000)

# ==========================================
# 8. CLUBS
# ==========================================

class ClubMembershipSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = ClubMembership
        fields = '__all__'
        read_only_fields = ['club', 'user', 'joined_at']

    def get_avatar(self, obj):
        return get_user_avatar(obj.user)

class ClubJoinRequestSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = ClubJoinRequest
        fields = '__all__'

    def get_avatar(self, obj):
        return get_user_avatar(obj.user)

class ClubPostCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    author_avatar = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = ClubPostComment
        fields = '__all__'
        read_only_fields = ['author', 'post', 'created_at']

    def get_author_avatar(self, obj):
        return get_user_avatar(obj.author)

    def get_replies(self, obj):
        reply_qs = obj.replies.select_related('author', 'author__profile').all()
        serializer = ClubPostCommentSerializer(reply_qs, many=True, context=self.context)
        return serializer.data

    def validate_content(self, value):
        return validate_text_length(value, 'Comment', 2000)

class ClubPostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    author_avatar = serializers.SerializerMethodField()
    author_id = serializers.IntegerField(source='author.id', read_only=True)
    comments = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    likes = serializers.SerializerMethodField()

    class Meta:
        model = ClubPost
        fields = '__all__'
        read_only_fields = ['author', 'club', 'is_pinned', 'created_at']

    def get_author_avatar(self, obj):
        return get_user_avatar(obj.author)

    def get_comments(self, obj):
        top_level_comments = (
            obj.comments.filter(parent__isnull=True)
            .select_related('author', 'author__profile')
            .prefetch_related('replies__author__profile')
        )
        serializer = ClubPostCommentSerializer(top_level_comments, many=True, context=self.context)
        return serializer.data

    def get_comment_count(self, obj):
        return obj.comments.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        current_user = getattr(request, 'user', None)
        if not current_user or not current_user.is_authenticated:
            return False
        return obj.user_likes.filter(user=current_user).exists()

    def get_likes(self, obj):
        return obj.user_likes.count() if hasattr(obj, 'user_likes') else obj.likes

    def validate_content(self, value):
        return validate_text_length(value, 'Post content', 5000)

class ClubMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    sender_avatar = serializers.SerializerMethodField()

    class Meta:
        model = ClubMessage
        fields = '__all__'
        read_only_fields = ['sender']

    def get_sender_avatar(self, obj):
        return get_user_avatar(obj.sender)

    def validate_text(self, value):
        return validate_text_length(value, 'Message', 3000)

class ClubSerializer(serializers.ModelSerializer):
    is_member = serializers.SerializerMethodField()
    is_pending = serializers.SerializerMethodField()
    member_role = serializers.SerializerMethodField()
    member_avatars = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Club
        fields = '__all__'
        read_only_fields = ['members_count', 'created_by', 'created_at']

    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.memberships.filter(user=request.user).exists()
        return False

    def get_is_pending(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.join_requests.filter(user=request.user, status='pending').exists()
        return False

    def get_member_role(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            membership = obj.memberships.filter(user=request.user).first()
            return membership.role if membership else None
        return None

    def get_member_avatars(self, obj):
        avatars = []
        for m in obj.memberships.all()[:5]:
            try:
                avatars.append(get_user_avatar(m.user))
            except (AttributeError, ObjectDoesNotExist):
                avatars.append('')
        return avatars

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name()
        return ''
