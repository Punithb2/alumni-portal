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
router.register(r'saved-jobs', views.SavedJobViewSet, basename='saved-job')
router.register(r'hiring-drives', views.HiringDriveViewSet, basename='hiring-drive')

# Mentorship
router.register(r'mentors', views.MentorProfileViewSet, basename='mentor')
router.register(r'mentoring-sessions', views.MentoringSessionViewSet, basename='mentoring-session')
router.register(r'mentoring-requests', views.MentoringRequestViewSet, basename='mentoring-request')

# Social Feed
router.register(r'posts', views.PostViewSet, basename='post')
router.register(r'comments', views.CommentViewSet, basename='comment')

# Forums
router.register(r'forum-categories', views.ForumCategoryViewSet, basename='forum-category')
router.register(r'forum-topics', views.ForumTopicViewSet, basename='forum-topic')
router.register(r'forum-replies', views.ForumReplyViewSet, basename='forum-reply')

# Events
router.register(r'events', views.EventViewSet, basename='event')

# Notifications & News
router.register(r'notifications', views.NotificationViewSet, basename='notification')
router.register(r'news', views.NewsArticleViewSet, basename='news')
router.register(r'portal-settings', views.PortalSettingsViewSet, basename='portal-settings')
router.register(r'audit-logs', views.AuditLogViewSet, basename='audit-log')

# Messaging
router.register(r'conversations', views.ConversationViewSet, basename='conversation')
router.register(r'messages', views.MessageViewSet, basename='message')

# Campaigns & Donations
router.register(r'campaigns', views.CampaignViewSet, basename='campaign')
router.register(r'donations', views.DonationViewSet, basename='donation')

# Clubs
router.register(r'clubs', views.ClubViewSet, basename='club')
router.register(r'club-memberships', views.ClubMembershipViewSet, basename='club-membership')
router.register(r'club-posts', views.ClubPostViewSet, basename='club-post')

urlpatterns = [
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/me/', views.get_user_profile, name='get_user_profile'),
    path('auth/change-password/', views.change_password, name='change_password'),
    path('auth/sessions/', views.list_active_sessions, name='list_active_sessions'),
    path('auth/delete-account/', views.delete_account, name='delete_account'),
    path('admin-users/invite/', views.admin_invite_user, name='admin_invite_user'),
    path('admin-users/bulk-import/', views.admin_bulk_import_users, name='admin_bulk_import_users'),
    path('admin-analytics/', views.admin_dashboard_analytics, name='admin_dashboard_analytics'),
    path('', include(router.urls)),
]
