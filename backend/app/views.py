from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db import transaction
from . import models
from . import permissions as custom_permissions
from .serializers import (
    UserProfileSerializer, UserRegistrationSerializer, WorkExperienceSerializer,
    EducationSerializer, JobSerializer, JobApplicationSerializer,
    HiringDriveSerializer, MentorProfileSerializer, MentoringSessionSerializer,
    MentoringRequestSerializer, PostSerializer, CommentSerializer,
    ForumTopicSerializer, ForumCategorySerializer, ForumReplySerializer,
    EventSerializer, NotificationSerializer, NewsArticleSerializer,
    ConversationSerializer, MessageSerializer,
    CampaignSerializer, DonationSerializer,
    ClubSerializer, ClubMembershipSerializer, ClubJoinRequestSerializer,
    ClubPostSerializer, ClubMessageSerializer,
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
        serializer = UserProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)
    except models.UserProfile.DoesNotExist:
        return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

# ==========================================
# 2. PROFILES
# ==========================================

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = models.UserProfile.objects.select_related('user').prefetch_related('work_experiences', 'education').all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        return {'request': self.request}

class WorkExperienceViewSet(viewsets.ModelViewSet):
    queryset = models.WorkExperience.objects.all()
    serializer_class = WorkExperienceSerializer
    permission_classes = [permissions.IsAuthenticated]

class EducationViewSet(viewsets.ModelViewSet):
    queryset = models.Education.objects.all()
    serializer_class = EducationSerializer
    permission_classes = [permissions.IsAuthenticated]

# ==========================================
# 3. JOB BOARD
# ==========================================

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
    serializer_class = JobApplicationSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [custom_permissions.IsStudent()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        # Students only see their own applications
        user = self.request.user
        try:
            if user.profile.role == 'student':
                return models.JobApplication.objects.filter(applicant=user)
        except Exception:
            pass
        return models.JobApplication.objects.all()

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)

class HiringDriveViewSet(viewsets.ModelViewSet):
    queryset = models.HiringDrive.objects.all()
    serializer_class = HiringDriveSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        return {'request': self.request}

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def register(self, request, pk=None):
        drive = self.get_object()
        drive.registered_users.add(request.user)
        return Response({'status': 'registered'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def unregister(self, request, pk=None):
        drive = self.get_object()
        drive.registered_users.remove(request.user)
        return Response({'status': 'unregistered'})

# ==========================================
# 4. MENTORSHIP
# ==========================================

class MentorProfileViewSet(viewsets.ModelViewSet):
    queryset = models.MentorProfile.objects.select_related('user__user').all()
    serializer_class = MentorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

class MentoringSessionViewSet(viewsets.ModelViewSet):
    serializer_class = MentoringSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return models.MentoringSession.objects.filter(mentee=user) | models.MentoringSession.objects.filter(mentor__user__user=user)

class MentoringRequestViewSet(viewsets.ModelViewSet):
    serializer_class = MentoringRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return models.MentoringRequest.objects.filter(mentee=user) | models.MentoringRequest.objects.filter(mentor__user__user=user)

    def perform_create(self, serializer):
        serializer.save(mentee=self.request.user)

# ==========================================
# 5. SOCIAL FEED
# ==========================================

class PostViewSet(viewsets.ModelViewSet):
    queryset = models.Post.objects.select_related('author').prefetch_related('comments').order_by('-created_at').all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = models.Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

# ==========================================
# 6. FORUMS
# ==========================================

class ForumCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = models.ForumCategory.objects.all()
    serializer_class = ForumCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class ForumTopicViewSet(viewsets.ModelViewSet):
    queryset = models.ForumTopic.objects.select_related('author', 'category').prefetch_related('replies').order_by('-is_pinned', '-created_at').all()
    serializer_class = ForumTopicSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['get'])
    def replies(self, request, pk=None):
        topic = self.get_object()
        serializer = ForumReplySerializer(topic.replies.all(), many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        topic = self.get_object()
        serializer = ForumReplySerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(author=request.user, topic=topic)
            topic.views += 1
            topic.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ForumReplyViewSet(viewsets.ModelViewSet):
    queryset = models.ForumReply.objects.all()
    serializer_class = ForumReplySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

# ==========================================
# 7. EVENTS
# ==========================================

class EventViewSet(viewsets.ModelViewSet):
    queryset = models.Event.objects.order_by('date').all()
    serializer_class = EventSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [custom_permissions.IsAlumniOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_serializer_context(self):
        return {'request': self.request}

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def rsvp(self, request, pk=None):
        event = self.get_object()
        event.attendees.add(request.user)
        return Response({'status': 'registered', 'attendees_count': event.attendees.count()})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def cancel_rsvp(self, request, pk=None):
        event = self.get_object()
        event.attendees.remove(request.user)
        return Response({'status': 'cancelled', 'attendees_count': event.attendees.count()})

# ==========================================
# 8. NOTIFICATIONS & NEWS
# ==========================================

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return models.Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.status = 'read'
        notification.save()
        return Response({'status': 'read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().update(status='read')
        return Response({'status': 'all read'})

class NewsArticleViewSet(viewsets.ModelViewSet):
    queryset = models.NewsArticle.objects.order_by('-published_at').all()
    serializer_class = NewsArticleSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [custom_permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

# ==========================================
# 9. MESSAGING
# ==========================================

class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return models.Conversation.objects.filter(participants=self.request.user).order_by('-updated_at')

    def get_serializer_context(self):
        return {'request': self.request}

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        conversation = self.get_object()
        msgs = conversation.messages.order_by('sent_at').all()
        # Mark messages as read
        msgs.exclude(sender=request.user).update(is_read=True)
        serializer = MessageSerializer(msgs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        conversation = self.get_object()
        msg = models.Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=request.data.get('content', '')
        )
        serializer = MessageSerializer(msg, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return models.Message.objects.filter(conversation__participants=self.request.user)

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

# ==========================================
# 10. CAMPAIGNS & DONATIONS
# ==========================================

class CampaignViewSet(viewsets.ModelViewSet):
    queryset = models.Campaign.objects.prefetch_related('donations').order_by('-featured', '-created_at').all()
    serializer_class = CampaignSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [custom_permissions.IsAlumniOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def donate(self, request, pk=None):
        campaign = self.get_object()
        amount = request.data.get('amount')
        anonymous = request.data.get('anonymous', False)
        recurring = request.data.get('recurring', False)
        frequency = request.data.get('frequency', None)

        if not amount:
            return Response({'error': 'Amount is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount = float(amount)
        except (TypeError, ValueError):
            return Response({'error': 'Invalid amount.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            donation = models.Donation.objects.create(
                campaign=campaign,
                donor=request.user,
                amount=amount,
                anonymous=anonymous,
                recurring=recurring,
                frequency=frequency if recurring else None,
                status='completed',
                campaign_type=campaign.campaign_type,
            )
            campaign.raised = float(campaign.raised) + amount
            campaign.donor_count += 1
            campaign.save()

        serializer = DonationSerializer(donation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def participate(self, request, pk=None):
        campaign = self.get_object()
        with transaction.atomic():
            donation = models.Donation.objects.create(
                campaign=campaign,
                donor=request.user,
                amount=1,
                anonymous=False,
                recurring=False,
                status='completed',
                campaign_type='participation',
            )
            campaign.raised = float(campaign.raised) + 1
            campaign.donor_count += 1
            campaign.save()
        serializer = DonationSerializer(donation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class DonationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return models.Donation.objects.filter(donor=self.request.user).order_by('-created_at')

# ==========================================
# 11. CLUBS
# ==========================================

class ClubViewSet(viewsets.ModelViewSet):
    queryset = models.Club.objects.prefetch_related('memberships', 'join_requests').order_by('-created_at').all()
    serializer_class = ClubSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_create(self, serializer):
        with transaction.atomic():
            club = serializer.save(created_by=self.request.user)
            # Creator automatically becomes owner
            models.ClubMembership.objects.create(
                club=club,
                user=self.request.user,
                role='owner',
                title='Founder'
            )
            club.members_count = 1
            club.save()

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        club = self.get_object()
        # Already a member?
        if club.memberships.filter(user=request.user).exists():
            return Response({'error': 'Already a member.'}, status=status.HTTP_400_BAD_REQUEST)

        if club.is_private:
            # Send join request
            req, created = models.ClubJoinRequest.objects.get_or_create(
                club=club, user=request.user,
                defaults={'status': 'pending'}
            )
            if not created and req.status == 'rejected':
                req.status = 'pending'
                req.save()
            return Response({'status': 'pending'})
        else:
            # Direct join
            models.ClubMembership.objects.create(club=club, user=request.user, role='member')
            club.members_count += 1
            club.save()
            return Response({'status': 'joined'})

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        club = self.get_object()
        membership = club.memberships.filter(user=request.user).first()
        if not membership:
            return Response({'error': 'Not a member.'}, status=status.HTTP_400_BAD_REQUEST)
        if membership.role == 'owner':
            return Response({'error': 'Owner cannot leave. Transfer ownership first.'}, status=status.HTTP_400_BAD_REQUEST)
        membership.delete()
        club.members_count = max(0, club.members_count - 1)
        club.save()
        return Response({'status': 'left'})

    @action(detail=True, methods=['post'])
    def cancel_request(self, request, pk=None):
        club = self.get_object()
        models.ClubJoinRequest.objects.filter(club=club, user=request.user, status='pending').delete()
        return Response({'status': 'cancelled'})

    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        club = self.get_object()
        serializer = ClubMembershipSerializer(club.memberships.all(), many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def join_requests(self, request, pk=None):
        club = self.get_object()
        serializer = ClubJoinRequestSerializer(club.join_requests.filter(status='pending'), many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def approve_request(self, request, pk=None):
        club = self.get_object()
        req_id = request.data.get('request_id')
        req = club.join_requests.filter(id=req_id, status='pending').first()
        if not req:
            return Response({'error': 'Request not found.'}, status=status.HTTP_404_NOT_FOUND)
        with transaction.atomic():
            req.status = 'approved'
            req.save()
            models.ClubMembership.objects.get_or_create(club=club, user=req.user, defaults={'role': 'member'})
            club.members_count += 1
            club.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject_request(self, request, pk=None):
        club = self.get_object()
        req_id = request.data.get('request_id')
        req = club.join_requests.filter(id=req_id, status='pending').first()
        if not req:
            return Response({'error': 'Request not found.'}, status=status.HTTP_404_NOT_FOUND)
        req.status = 'rejected'
        req.save()
        return Response({'status': 'rejected'})

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Admin approves a pending club"""
        club = self.get_object()
        club.status = 'active'
        club.save()
        return Response({'status': 'active'})

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        club = self.get_object()
        club.status = 'suspended'
        club.save()
        return Response({'status': 'suspended'})

    @action(detail=True, methods=['get'])
    def posts(self, request, pk=None):
        club = self.get_object()
        serializer = ClubPostSerializer(
            club.posts.order_by('-is_pinned', '-created_at').all(),
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def create_post(self, request, pk=None):
        club = self.get_object()
        serializer = ClubPostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(author=request.user, club=club)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def chat(self, request, pk=None):
        club = self.get_object()
        msgs = club.messages.order_by('sent_at').all()
        serializer = ClubMessageSerializer(msgs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        club = self.get_object()
        msg = models.ClubMessage.objects.create(
            club=club,
            sender=request.user,
            text=request.data.get('text', '')
        )
        serializer = ClubMessageSerializer(msg, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ClubPostViewSet(viewsets.ModelViewSet):
    queryset = models.ClubPost.objects.all()
    serializer_class = ClubPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = self.get_object()
        post.likes += 1
        post.save()
        return Response({'likes': post.likes})

    @action(detail=True, methods=['post'])
    def unlike(self, request, pk=None):
        post = self.get_object()
        post.likes = max(0, post.likes - 1)
        post.save()
        return Response({'likes': post.likes})

    @action(detail=True, methods=['post'])
    def pin(self, request, pk=None):
        post = self.get_object()
        post.is_pinned = not post.is_pinned
        post.save()
        return Response({'is_pinned': post.is_pinned})