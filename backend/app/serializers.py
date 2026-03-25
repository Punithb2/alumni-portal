# backend/app/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from .models import (
    UserProfile, WorkExperience, Education, Job, JobApplication,
    HiringDrive, MentorProfile, MentoringSession, MentorGoal,
    MentoringRequest, Post, Comment, ForumCategory, ForumTopic,
    ForumReply, Conversation, Message, Event, NewsArticle, Notification,
    Campaign, Donation, Club, ClubMembership, ClubJoinRequest, ClubPost, ClubMessage
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

# ==========================================
# 1. CORE DIRECTORY & PROFILES
# ==========================================

class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


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
    work_experiences = WorkExperienceSerializer(many=True, read_only=True)
    education = EducationSerializer(many=True, read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'role', 'avatar', 'headline', 'bio', 'city', 'country', 
                  'department', 'graduation_year', 'current_company', 'current_position',
                  'linkedin_url', 'github_url', 'website', 'phone', 'student_id', 
                  'skills', 'willing_to_mentor', 'willing_to_hire', 'visibility',
                  'work_experiences', 'education']

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

    def get_author_avatar(self, obj):
        return get_user_avatar(obj.author)

    def validate_content(self, value):
        return validate_text_length(value, 'Comment', 2000)

class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    author_avatar = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    comment_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = '__all__'
        
    def get_comment_count(self, obj):
        return obj.comments.count()

    def get_author_avatar(self, obj):
        return get_user_avatar(obj.author)

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

    class Meta:
        model = Event
        fields = '__all__'

    def get_attendees_count(self, obj):
        return obj.attendees.count()

    def get_is_registered(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.attendees.filter(id=request.user.id).exists()
        return False

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class NewsArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsArticle
        fields = '__all__'

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

    def get_avatar(self, obj):
        return get_user_avatar(obj.user)

class ClubJoinRequestSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)

    class Meta:
        model = ClubJoinRequest
        fields = '__all__'

class ClubPostCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)

    class Meta:
        model = Comment
        fields = '__all__'

class ClubPostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    author_avatar = serializers.SerializerMethodField()

    class Meta:
        model = ClubPost
        fields = '__all__'
        read_only_fields = ['author', 'likes']

    def get_author_avatar(self, obj):
        return get_user_avatar(obj.author)

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
