# backend/app/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    UserProfile, WorkExperience, Education, Job, JobApplication,
    HiringDrive, MentorProfile, MentoringSession, MentorGoal,
    MentoringRequest, Post, Comment, ForumCategory, ForumTopic,
    ForumReply, Conversation, Message, Event, NewsArticle, Notification
)

# ==========================================
# 1. CORE DIRECTORY & PROFILES
# ==========================================

class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class UserRegistrationSerializer(serializers.ModelSerializer):
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
    linkedin_url = serializers.URLField(required=False, allow_null=True, write_only=True)
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

    def create(self, validated_data):
        profile_data = {
            'role': validated_data.pop('role'),
            'phone': validated_data.pop('phone', ''),
            'city': validated_data.pop('city', ''),
            'department': validated_data.pop('department', ''),
            'graduation_year': validated_data.pop('graduation_year', None),
            'current_company': validated_data.pop('current_company', ''),
            'current_position': validated_data.pop('current_position', ''),
            'linkedin_url': validated_data.pop('linkedin_url', None),
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

class JobApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_company = serializers.CharField(source='job.company', read_only=True)

    class Meta:
        model = JobApplication
        fields = '__all__'

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

# ==========================================
# 4. SOCIAL FEED & COMMUNITY
# ==========================================

class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)

    class Meta:
        model = Comment
        fields = '__all__'

class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    comment_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = '__all__'
        
    def get_comment_count(self, obj):
        return obj.comments.count()

# ==========================================
# 5. FORUMS, EVENTS, & NOTIFICATIONS
# ==========================================

class ForumTopicSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    reply_count = serializers.SerializerMethodField()

    class Meta:
        model = ForumTopic
        fields = '__all__'

    def get_reply_count(self, obj):
        return obj.replies.count()

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'