from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from . import models
from . import permissions as custom_permissions
from .serializers import (
    UserProfileSerializer, UserRegistrationSerializer, WorkExperienceSerializer,
    EducationSerializer, JobSerializer, JobApplicationSerializer,
    HiringDriveSerializer, MentorProfileSerializer, MentoringSessionSerializer,
    MentoringRequestSerializer, PostSerializer, CommentSerializer,
    ForumTopicSerializer, EventSerializer, NotificationSerializer
)

# ==========================================
# 1. AUTHENTICATION & REGISTRATION
# ==========================================

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserRegistrationSerializer

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_profile(request):
    try:
        profile = request.user.profile
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    except models.UserProfile.DoesNotExist:
        return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = models.UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

class WorkExperienceViewSet(viewsets.ModelViewSet):
    queryset = models.WorkExperience.objects.all()
    serializer_class = WorkExperienceSerializer
    permission_classes = [permissions.IsAuthenticated]

class EducationViewSet(viewsets.ModelViewSet):
    queryset = models.Education.objects.all()
    serializer_class = EducationSerializer
    permission_classes = [permissions.IsAuthenticated]

class JobViewSet(viewsets.ModelViewSet):
    queryset = models.Job.objects.all()
    serializer_class = JobSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [custom_permissions.IsAlumniOrAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)

class JobApplicationViewSet(viewsets.ModelViewSet):
    queryset = models.JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [custom_permissions.IsStudent()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)

class HiringDriveViewSet(viewsets.ModelViewSet):
    queryset = models.HiringDrive.objects.all()
    serializer_class = HiringDriveSerializer
    permission_classes = [permissions.IsAuthenticated]

class MentorProfileViewSet(viewsets.ModelViewSet):
    queryset = models.MentorProfile.objects.all()
    serializer_class = MentorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

class MentoringSessionViewSet(viewsets.ModelViewSet):
    queryset = models.MentoringSession.objects.all()
    serializer_class = MentoringSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

class MentoringRequestViewSet(viewsets.ModelViewSet):
    queryset = models.MentoringRequest.objects.all()
    serializer_class = MentoringRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(mentee=self.request.user)

class PostViewSet(viewsets.ModelViewSet):
    queryset = models.Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = models.Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class ForumTopicViewSet(viewsets.ModelViewSet):
    queryset = models.ForumTopic.objects.all()
    serializer_class = ForumTopicSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class EventViewSet(viewsets.ModelViewSet):
    queryset = models.Event.objects.all()
    serializer_class = EventSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [custom_permissions.IsAlumniOrAdmin()]
        return [permissions.IsAuthenticated()]

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return models.Notification.objects.filter(user=self.request.user)