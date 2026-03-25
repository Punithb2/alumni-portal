# backend/app/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

# Directory & Profiles
router.register(r'profiles', views.UserProfileViewSet, basename='profile')
router.register(r'work-experiences', views.WorkExperienceViewSet, basename='work-experience')
router.register(r'educations', views.EducationViewSet, basename='education')

# Job Board
router.register(r'jobs', views.JobViewSet, basename='job')
router.register(r'job-applications', views.JobApplicationViewSet, basename='job-application')
router.register(r'hiring-drives', views.HiringDriveViewSet, basename='hiring-drive')

# Mentorship
router.register(r'mentors', views.MentorProfileViewSet, basename='mentor')
router.register(r'mentoring-sessions', views.MentoringSessionViewSet, basename='mentoring-session')
router.register(r'mentoring-requests', views.MentoringRequestViewSet, basename='mentoring-request')

# Social Feed
router.register(r'posts', views.PostViewSet, basename='post')
router.register(r'comments', views.CommentViewSet, basename='comment')

# Forums & Events
router.register(r'forum-topics', views.ForumTopicViewSet, basename='forum-topic')
router.register(r'events', views.EventViewSet, basename='event')
router.register(r'notifications', views.NotificationViewSet, basename='notification')

urlpatterns = [
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/me/', views.get_user_profile, name='get_user_profile'),
    path('', include(router.urls)),
]