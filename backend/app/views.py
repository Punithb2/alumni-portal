from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.exceptions import ValidationError
from rest_framework.exceptions import NotFound
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.utils.crypto import get_random_string
from django.db import transaction
from django.db.models import Count, Q, Sum
from django.utils import timezone
from datetime import timedelta
from collections import Counter
from django.utils.dateparse import parse_datetime
from . import models
from . import permissions as custom_permissions
from .serializers import (
    UserProfileSerializer, UserRegistrationSerializer, WorkExperienceSerializer,
    EducationSerializer, JobSerializer, JobApplicationSerializer, SavedJobSerializer,
    HiringDriveSerializer, MentorProfileSerializer, MentoringSessionSerializer,
    MentoringRequestSerializer, PostSerializer, CommentSerializer,
    ForumTopicSerializer, ForumCategorySerializer, ForumReplySerializer,
    EventSerializer, NotificationSerializer, NewsArticleSerializer,
    ConversationSerializer, MessageSerializer,
    CampaignSerializer, DonationSerializer,
    ClubSerializer, ClubMembershipSerializer, ClubJoinRequestSerializer,
    ClubPostSerializer, ClubPostCommentSerializer, ClubMessageSerializer,
    PortalSettingsSerializer, AuditLogSerializer,
    EmailOrUsernameTokenObtainPairSerializer,
)
from rest_framework_simplejwt.views import TokenObtainPairView

# ==========================================
# 1. AUTHENTICATION & REGISTRATION
# ==========================================

class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainPairSerializer
    throttle_scope = 'auth'

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserRegistrationSerializer
    throttle_scope = 'register'

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_profile(request):
    try:
        profile = request.user.profile
        serializer = UserProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)
    except models.UserProfile.DoesNotExist:
        raise NotFound('Profile not found.')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    current_password = request.data.get('current_password') or ''
    new_password = request.data.get('new_password') or ''
    confirm_password = request.data.get('confirm_password') or ''

    if not request.user.check_password(current_password):
        raise ValidationError({'current_password': ['Current password is incorrect.']})
    if not new_password:
        raise ValidationError({'new_password': ['New password is required.']})
    if new_password != confirm_password:
        raise ValidationError({'confirm_password': ['Passwords do not match.']})

    validate_password(new_password, request.user)
    request.user.set_password(new_password)
    request.user.save(update_fields=['password'])
    models.AuditLog.objects.create(action='Password changed', actor=request.user)
    return Response({'status': 'password_updated'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_active_sessions(request):
    user_agent = request.META.get('HTTP_USER_AGENT', 'Current browser')
    forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR', '')
    ip_address = forwarded_for.split(',')[0].strip() if forwarded_for else request.META.get('REMOTE_ADDR', '')
    now = timezone.now()
    last_login = request.user.last_login or now

    session = {
        'id': 'current-session',
        'device': user_agent[:120] or 'Current browser',
        'ip': ip_address or 'Unavailable',
        'last_active_at': last_login,
        'current': True,
    }
    return Response([session])


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_account(request):
    user = request.user
    models.AuditLog.objects.create(
        action='Account deleted',
        actor=user,
        details={'user_id': user.id, 'email': user.email},
    )
    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


def _normalize_admin_role(value):
    normalized = (value or '').strip().lower()
    if normalized in {'admin', 'university'}:
        return 'admin'
    if normalized == 'student':
        return 'student'
    return 'alumni'


def _split_full_name(full_name):
    parts = (full_name or '').strip().split()
    if not parts:
        return '', ''
    first_name = parts[0]
    last_name = ' '.join(parts[1:])
    return first_name, last_name


def _generate_unique_username(email, fallback_prefix='user'):
    base = (email.split('@')[0] if email and '@' in email else fallback_prefix).strip().lower()
    base = ''.join(ch for ch in base if ch.isalnum() or ch in {'_', '.'}) or fallback_prefix
    candidate = base
    suffix = 1
    while User.objects.filter(username=candidate).exists():
        candidate = f'{base}{suffix}'
        suffix += 1
    return candidate


@api_view(['POST'])
@permission_classes([custom_permissions.IsAdminUser])
def admin_invite_user(request):
    full_name = (request.data.get('name') or '').strip()
    email = (request.data.get('email') or '').strip().lower()
    role = _normalize_admin_role(request.data.get('role'))

    if not full_name:
        raise ValidationError({'name': ['Full name is required.']})
    if not email:
        raise ValidationError({'email': ['Email is required.']})
    if User.objects.filter(email__iexact=email).exists():
        raise ValidationError({'email': ['A user with this email already exists.']})

    first_name, last_name = _split_full_name(full_name)
    temporary_password = get_random_string(12)

    with transaction.atomic():
        user = User.objects.create_user(
            username=_generate_unique_username(email),
            email=email,
            password=temporary_password,
            first_name=first_name,
            last_name=last_name,
            is_active=True,
        )
        profile = models.UserProfile.objects.create(
            user=user,
            role=role,
            supplemental_profile={'invited': True},
        )
        models.AuditLog.objects.create(
            action='User invited',
            actor=request.user,
            details={'user_id': user.id, 'email': email, 'role': role},
        )

    serializer = UserProfileSerializer(profile, context={'request': request})
    return Response(
        {
            'user': serializer.data,
            'temporary_password': temporary_password,
            'message': 'User invitation created successfully.',
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['POST'])
@permission_classes([custom_permissions.IsAdminUser])
def admin_bulk_import_users(request):
    rows = request.data.get('users')
    default_role = _normalize_admin_role(request.data.get('default_role'))

    if not isinstance(rows, list) or not rows:
        raise ValidationError({'users': ['At least one user row is required.']})

    created = []
    skipped = []

    with transaction.atomic():
        for index, row in enumerate(rows, start=1):
            full_name = (row.get('name') or row.get('full_name') or '').strip()
            email = (row.get('email') or '').strip().lower()
            role = _normalize_admin_role(row.get('role') or default_role)
            department = (row.get('department') or '').strip()
            current_company = (row.get('company') or '').strip()
            city = (row.get('location') or '').strip()
            graduation_year = row.get('graduation_year') or row.get('graduationYear')

            if not full_name or not email:
                skipped.append({'row': index, 'reason': 'Missing name or email.'})
                continue
            if User.objects.filter(email__iexact=email).exists():
                skipped.append({'row': index, 'reason': 'Email already exists.', 'email': email})
                continue

            first_name, last_name = _split_full_name(full_name)
            temporary_password = get_random_string(12)
            user = User.objects.create_user(
                username=_generate_unique_username(email),
                email=email,
                password=temporary_password,
                first_name=first_name,
                last_name=last_name,
                is_active=True,
            )
            profile = models.UserProfile.objects.create(
                user=user,
                role=role,
                department=department,
                city=city,
                current_company=current_company,
                graduation_year=int(graduation_year) if graduation_year not in (None, '', '—') else None,
                supplemental_profile={'invited': True, 'bulk_imported': True},
            )
            created.append({
                'profile': profile,
                'temporary_password': temporary_password,
            })

        models.AuditLog.objects.create(
            action='Bulk user import',
            actor=request.user,
            details={'created_count': len(created), 'skipped_count': len(skipped)},
        )

    serializer = UserProfileSerializer(
        [entry['profile'] for entry in created],
        many=True,
        context={'request': request},
    )
    return Response(
        {
            'created': [
                {**profile_data, 'temporary_password': created[idx]['temporary_password']}
                for idx, profile_data in enumerate(serializer.data)
            ],
            'skipped': skipped,
        },
        status=status.HTTP_201_CREATED,
    )

# ==========================================
# 2. PROFILES
# ==========================================

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = models.UserProfile.objects.select_related('user').prefetch_related('work_experiences', 'education').all()
    serializer_class = UserProfileSerializer
    permission_classes = [custom_permissions.IsProfileOwnerOrAdmin]

    def get_permissions(self):
        if self.action in ['send_connection_request', 'accept_connection_request', 'reject_connection_request']:
            return [permissions.IsAuthenticated()]
        return [custom_permissions.IsProfileOwnerOrAdmin()]

    def get_serializer_context(self):
        return {'request': self.request}

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def send_connection_request(self, request, pk=None):
        target_profile = self.get_object()
        recipient = target_profile.user
        sender = request.user

        if recipient.id == sender.id:
            raise ValidationError({'detail': ['You cannot send a connection request to yourself.']})

        existing_connected = models.ConnectionRequest.objects.filter(
            requester=sender,
            recipient=recipient,
            status='accepted',
        ).exists() or models.ConnectionRequest.objects.filter(
            requester=recipient,
            recipient=sender,
            status='accepted',
        ).exists()
        if existing_connected:
            raise ValidationError({'detail': ['You are already connected.']})

        pending_request = models.ConnectionRequest.objects.filter(
            requester=sender,
            recipient=recipient,
            status='pending',
        ).first()
        if pending_request:
            raise ValidationError({'detail': ['Connection request already sent.']})

        sender_name = sender.get_full_name().strip() or sender.username
        connection_request = models.ConnectionRequest.objects.create(
            requester=sender,
            recipient=recipient,
            status='pending',
        )
        notification = models.Notification.objects.create(
            user=recipient,
            title='New connection request',
            message=f'{sender_name} sent you a connection request.',
            notification_type='connection_request',
            metadata={'connection_request_id': connection_request.id, 'requester_user_id': sender.id},
            status='unread',
        )

        serializer = NotificationSerializer(notification, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def accept_connection_request(self, request, pk=None):
        target_profile = self.get_object()
        requester = target_profile.user
        recipient = request.user
        connection_request = models.ConnectionRequest.objects.filter(
            requester=requester,
            recipient=recipient,
            status='pending',
        ).first()
        if not connection_request:
            raise NotFound('Pending connection request not found.')

        with transaction.atomic():
            connection_request.status = 'accepted'
            connection_request.responded_at = timezone.now()
            connection_request.save(update_fields=['status', 'responded_at'])

            conversation = (
                models.Conversation.objects
                .filter(participants=requester)
                .filter(participants=recipient)
                .distinct()
                .first()
            )
            if not conversation:
                conversation = models.Conversation.objects.create(title='')
                conversation.participants.set([requester, recipient])

            models.Notification.objects.filter(
                user=recipient,
                notification_type='connection_request',
                metadata__connection_request_id=connection_request.id,
            ).update(status='read')

            accepter_name = recipient.get_full_name().strip() or recipient.username
            models.Notification.objects.create(
                user=requester,
                title='Connection request accepted',
                message=f'{accepter_name} accepted your connection request.',
                notification_type='connection_request_accepted',
                metadata={
                    'connection_request_id': connection_request.id,
                    'conversation_id': conversation.id,
                },
                status='unread',
            )

        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response({'status': 'accepted', 'conversation': serializer.data})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reject_connection_request(self, request, pk=None):
        target_profile = self.get_object()
        requester = target_profile.user
        recipient = request.user
        connection_request = models.ConnectionRequest.objects.filter(
            requester=requester,
            recipient=recipient,
            status='pending',
        ).first()
        if not connection_request:
            raise NotFound('Pending connection request not found.')

        connection_request.status = 'rejected'
        connection_request.responded_at = timezone.now()
        connection_request.save(update_fields=['status', 'responded_at'])

        models.Notification.objects.filter(
            user=recipient,
            notification_type='connection_request',
            metadata__connection_request_id=connection_request.id,
        ).update(status='read')
        return Response({'status': 'rejected'})

class WorkExperienceViewSet(viewsets.ModelViewSet):
    serializer_class = WorkExperienceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role = getattr(getattr(user, 'profile', None), 'role', None)
        if role == 'admin':
            return models.WorkExperience.objects.all()
        return models.WorkExperience.objects.filter(profile__user=user)

    def perform_create(self, serializer):
        profile = serializer.validated_data.get('profile')
        role = getattr(getattr(self.request.user, 'profile', None), 'role', None)
        if not profile:
            raise ValidationError({'profile': 'Profile is required.'})
        if role == 'admin' or profile.user_id == self.request.user.id:
            serializer.save()
            return
        raise PermissionDenied('You can only add your own work experience.')

class EducationViewSet(viewsets.ModelViewSet):
    serializer_class = EducationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role = getattr(getattr(user, 'profile', None), 'role', None)
        if role == 'admin':
            return models.Education.objects.all()
        return models.Education.objects.filter(profile__user=user)

    def perform_create(self, serializer):
        profile = serializer.validated_data.get('profile')
        role = getattr(getattr(self.request.user, 'profile', None), 'role', None)
        if not profile:
            raise ValidationError({'profile': 'Profile is required.'})
        if role == 'admin' or profile.user_id == self.request.user.id:
            serializer.save()
            return
        raise PermissionDenied('You can only add your own education.')

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
        role = getattr(getattr(user, 'profile', None), 'role', None)
        if role == 'student':
            return models.JobApplication.objects.filter(applicant=user)
        if role in ['alumni', 'admin']:
            return models.JobApplication.objects.all()
        return models.JobApplication.objects.none()

    def perform_create(self, serializer):
        job = serializer.validated_data.get('job')
        if models.JobApplication.objects.filter(job=job, applicant=self.request.user).exists():
            raise ValidationError({'non_field_errors': ['You have already applied for this job.']})
        serializer.save(applicant=self.request.user)

class SavedJobViewSet(viewsets.ModelViewSet):
    serializer_class = SavedJobSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        return models.SavedJob.objects.filter(user=self.request.user).select_related('job').order_by('-created_at')

    def perform_create(self, serializer):
        job = serializer.validated_data.get('job')
        if models.SavedJob.objects.filter(user=self.request.user, job=job).exists():
            raise ValidationError({'non_field_errors': ['This job is already saved.']})
        serializer.save(user=self.request.user)

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
    queryset = (
        models.Post.objects
        .select_related('author', 'author__profile')
        .prefetch_related('comments__author__profile', 'reactions')
        .order_by('-created_at')
        .all()
    )
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def react(self, request, pk=None):
        post = self.get_object()
        reaction = (request.data.get('reaction') or '').strip()
        if not reaction:
            raise ValidationError({'reaction': ['Reaction is required.']})

        existing_reaction = post.reactions.filter(user=request.user).first()
        if existing_reaction and existing_reaction.reaction == reaction:
            existing_reaction.delete()
        elif existing_reaction:
            existing_reaction.reaction = reaction
            existing_reaction.save(update_fields=['reaction'])
        else:
            models.PostReaction.objects.create(post=post, user=request.user, reaction=reaction)

        counts = dict(Counter(post.reactions.values_list('reaction', flat=True)))
        post.reaction_counts = counts
        post.save(update_fields=['reaction_counts'])

        serializer = self.get_serializer(post)
        return Response(serializer.data)

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
    queryset = models.Event.objects.select_related('club', 'created_by').order_by('date').all()
    serializer_class = EventSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [custom_permissions.IsAlumniOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_serializer_context(self):
        return {'request': self.request}

    @action(detail=True, methods=['post'], permission_classes=[custom_permissions.IsAdminUser])
    def set_status(self, request, pk=None):
        profile = self.get_object()
        status_value = (request.data.get('status') or '').strip().lower()

        if status_value not in {'active', 'suspended'}:
            raise ValidationError({'status': ['Status must be Active or Suspended.']})

        profile.user.is_active = status_value == 'active'
        profile.user.save(update_fields=['is_active'])

        if status_value == 'active':
            supplemental = dict(profile.supplemental_profile or {})
            supplemental.pop('invited', None)
            profile.supplemental_profile = supplemental
            profile.save(update_fields=['supplemental_profile'])

        models.AuditLog.objects.create(
            action='User status updated',
            actor=request.user,
            details={'user_id': profile.user_id, 'status': status_value},
        )

        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    def get_queryset(self):
        queryset = self.queryset
        club_id = self.request.query_params.get('club')
        if club_id:
            queryset = queryset.filter(club_id=club_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

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


@api_view(['GET'])
@permission_classes([custom_permissions.IsAdminUser])
def admin_dashboard_analytics(request):
    now = timezone.now()
    date_range = request.query_params.get('date_range', '30d')
    segment = request.query_params.get('segment', 'all')

    if date_range == '7d':
        period_start = now - timedelta(days=7)
    elif date_range == 'quarter':
        quarter_month = ((now.month - 1) // 3) * 3 + 1
        period_start = now.replace(month=quarter_month, day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        period_start = now - timedelta(days=30)

    previous_period_start = period_start - (now - period_start)

    profiles = models.UserProfile.objects.select_related('user').all()
    if segment in {'alumni', 'student', 'admin'}:
        profiles = profiles.filter(role=segment)

    total_users = profiles.count()
    new_users_period = profiles.filter(user__date_joined__gte=period_start).count()
    previous_new_users = profiles.filter(
        user__date_joined__gte=previous_period_start,
        user__date_joined__lt=period_start,
    ).count()
    trend_percent = 0
    if previous_new_users:
        trend_percent = round(((new_users_period - previous_new_users) / previous_new_users) * 100)
    elif new_users_period:
        trend_percent = 100

    alumni_profiles = models.UserProfile.objects.filter(role='alumni')
    mentors_total = models.MentorProfile.objects.count()
    mentoring_requests_pending = models.MentoringRequest.objects.filter(status='pending').count()
    active_matches = models.MentoringSession.objects.exclude(status='canceled').count()

    jobs_in_period = models.Job.objects.filter(created_at__gte=period_start)
    applications_in_period = models.JobApplication.objects.filter(applied_at__gte=period_start)
    referrals_in_period = applications_in_period.filter(job__can_refer=True).count()

    upcoming_events = models.Event.objects.filter(date__gte=now).annotate(attendee_count=Count('attendees'))
    sample_events = list(upcoming_events.order_by('date')[:10])
    avg_rsvps = (
        round(sum(event.attendee_count for event in sample_events) / len(sample_events))
        if sample_events
        else 0
    )

    active_campaigns = models.Campaign.objects.filter(status='active')
    campaign_goal = float(
        active_campaigns.aggregate(total=Sum('goal')).get('total') or 0
    )
    campaign_raised = float(
        active_campaigns.aggregate(total=Sum('raised')).get('total') or 0
    )

    current_week_start = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
    engagement_data = []
    jobs_data = []
    for weeks_ago in range(3, -1, -1):
        week_start = current_week_start - timedelta(weeks=weeks_ago)
        week_end = week_start + timedelta(days=7)
        week_profiles = models.UserProfile.objects.filter(
            user__date_joined__gte=week_start,
            user__date_joined__lt=week_end,
        )
        week_jobs = models.Job.objects.filter(created_at__gte=week_start, created_at__lt=week_end)
        week_applications = models.JobApplication.objects.filter(
            applied_at__gte=week_start,
            applied_at__lt=week_end,
        )
        label = week_start.strftime('%d %b')
        engagement_data.append({
            'name': label,
            'all': week_profiles.count(),
            'alumni': week_profiles.filter(role='alumni').count(),
            'student': week_profiles.filter(role='student').count(),
        })
        jobs_data.append({
            'name': label,
            'posted': week_jobs.count(),
            'applications': week_applications.count(),
            'referrals': week_applications.filter(job__can_refer=True).count(),
        })

    directory_data = [
        {'name': 'Alumni', 'value': models.UserProfile.objects.filter(role='alumni').count(), 'color': '#10b981'},
        {'name': 'Students', 'value': models.UserProfile.objects.filter(role='student').count(), 'color': '#3b82f6'},
        {'name': 'Admins', 'value': models.UserProfile.objects.filter(role='admin').count(), 'color': '#6366f1'},
    ]

    mentoring_data = [
        {'name': 'Mentors', 'value': mentors_total, 'fill': 'url(#mentorGrad)'},
        {
            'name': 'Mentees',
            'value': models.MentoringRequest.objects.values('mentee').distinct().count(),
            'fill': 'url(#menteeGrad)',
        },
        {'name': 'Requests', 'value': models.MentoringRequest.objects.count(), 'fill': 'url(#requestGrad)'},
        {'name': 'Matches', 'value': active_matches, 'fill': 'url(#matchGrad)'},
    ]

    event_data = [
        {
            'name': (event.title[:18] + '...') if len(event.title) > 18 else event.title,
            'Capacity': event.capacity or 0,
            'Registered': event.attendee_count,
        }
        for event in upcoming_events.order_by('date')[:4]
    ]

    campaign_data = []
    for campaign in active_campaigns.order_by('-featured', '-raised')[:3]:
        goal_value = float(campaign.goal or 0)
        raised_value = float(campaign.raised or 0)
        percent = raised_value / goal_value if goal_value else 0
        campaign_data.append({
            'id': campaign.id,
            'name': campaign.title,
            'raised': raised_value,
            'goal': goal_value,
            'donors': campaign.donor_count,
            'daysLeft': max(0, (campaign.deadline - now.date()).days) if campaign.deadline else 0,
            'status': 'green' if percent >= 0.75 else 'amber' if percent >= 0.35 else 'red',
            'isParticipation': campaign.campaign_type == 'participation',
        })

    actions = []
    pending_clubs = models.Club.objects.filter(status='pending').order_by('-created_at')[:2]
    for club in pending_clubs:
        creator_name = club.created_by.get_full_name().strip() if club.created_by else 'Unknown'
        actions.append({
            'id': f'club-{club.id}',
            'type': 'Club approval',
            'desc': f'{club.name} by {creator_name or "Unknown"}',
            'route': '/admin/clubs',
            'icon': 'users',
            'colorClasses': 'bg-purple-50 text-purple-600 border-purple-100',
        })
    pending_requests = models.MentoringRequest.objects.filter(status='pending').order_by('-requested_at')[:2]
    for req in pending_requests:
        mentee_name = req.mentee.get_full_name().strip() or req.mentee.username
        actions.append({
            'id': f'mentor-{req.id}',
            'type': 'Mentorship request',
            'desc': f'{mentee_name} is waiting for mentor review',
            'route': '/directory',
            'icon': 'user-plus',
            'colorClasses': 'bg-rose-50 text-rose-600 border-rose-100',
        })

    highlights = []
    for event in upcoming_events.order_by('date')[:2]:
        highlights.append({
            'id': f'event-{event.id}',
            'title': event.title,
            'subtitle': f'{event.attendee_count} registered',
            'month': event.date.strftime('%b'),
            'day': event.date.strftime('%d'),
            'tone': 'indigo',
        })
    for campaign in active_campaigns.filter(deadline__isnull=False).order_by('deadline')[:2]:
        highlights.append({
            'id': f'campaign-{campaign.id}',
            'title': campaign.title,
            'subtitle': f'Ends in {max(0, (campaign.deadline - now.date()).days)} days',
            'month': campaign.deadline.strftime('%b'),
            'day': campaign.deadline.strftime('%d'),
            'tone': 'amber',
        })

    return Response({
        'kpis': {
            'total_users': total_users,
            'new_users_period': new_users_period,
            'trend_percent': trend_percent,
            'alumni_total': alumni_profiles.count(),
            'new_alumni': alumni_profiles.filter(user__date_joined__gte=period_start).count(),
            'mentors_total': mentors_total,
            'mentoring_requests_pending': mentoring_requests_pending,
            'active_matches': active_matches,
            'jobs_posted': jobs_in_period.count(),
            'applications': applications_in_period.count(),
            'referrals': referrals_in_period,
            'upcoming_events': upcoming_events.count(),
            'avg_rsvps': avg_rsvps,
            'active_campaigns': active_campaigns.count(),
            'campaign_raised': campaign_raised,
            'campaign_goal': campaign_goal,
        },
        'charts': {
            'engagement': engagement_data,
            'directory': directory_data,
            'mentoring': mentoring_data,
            'jobs': jobs_data,
            'events': event_data,
            'campaigns': campaign_data,
        },
        'actions': actions[:4],
        'highlights': highlights[:4],
    })

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

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def accept_connection(self, request, pk=None):
        notification = self.get_object()
        if notification.notification_type != 'connection_request':
            raise ValidationError({'detail': ['This notification is not a connection request.']})

        req_id = (notification.metadata or {}).get('connection_request_id')
        connection_request = models.ConnectionRequest.objects.filter(
            id=req_id,
            recipient=request.user,
        ).first()
        if not connection_request:
            raise NotFound('Connection request not found.')
        if connection_request.status != 'pending':
            raise ValidationError({'detail': [f'Connection request already {connection_request.status}.']})

        with transaction.atomic():
            connection_request.status = 'accepted'
            connection_request.responded_at = timezone.now()
            connection_request.save(update_fields=['status', 'responded_at'])

            participants = [connection_request.requester, connection_request.recipient]
            existing_conversation = (
                models.Conversation.objects
                .filter(participants=participants[0])
                .filter(participants=participants[1])
                .distinct()
                .first()
            )
            if not existing_conversation:
                existing_conversation = models.Conversation.objects.create(title='')
                existing_conversation.participants.set(participants)

            notification.status = 'read'
            notification.save(update_fields=['status'])

            accepter_name = request.user.get_full_name().strip() or request.user.username
            models.Notification.objects.create(
                user=connection_request.requester,
                title='Connection request accepted',
                message=f'{accepter_name} accepted your connection request.',
                notification_type='connection_request_accepted',
                metadata={
                    'connection_request_id': connection_request.id,
                    'conversation_id': existing_conversation.id,
                },
                status='unread',
            )

        serializer = ConversationSerializer(existing_conversation, context={'request': request})
        return Response({'status': 'accepted', 'conversation': serializer.data})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reject_connection(self, request, pk=None):
        notification = self.get_object()
        if notification.notification_type != 'connection_request':
            raise ValidationError({'detail': ['This notification is not a connection request.']})

        req_id = (notification.metadata or {}).get('connection_request_id')
        connection_request = models.ConnectionRequest.objects.filter(
            id=req_id,
            recipient=request.user,
        ).first()
        if not connection_request:
            raise NotFound('Connection request not found.')
        if connection_request.status != 'pending':
            raise ValidationError({'detail': [f'Connection request already {connection_request.status}.']})

        connection_request.status = 'rejected'
        connection_request.responded_at = timezone.now()
        connection_request.save(update_fields=['status', 'responded_at'])

        notification.status = 'read'
        notification.save(update_fields=['status'])
        return Response({'status': 'rejected'})

class NewsArticleViewSet(viewsets.ModelViewSet):
    serializer_class = NewsArticleSerializer

    def get_queryset(self):
        queryset = models.NewsArticle.objects.select_related('author').order_by(
            '-published_at',
            '-updated_at',
        )
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(is_published=True)

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [custom_permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        is_published = bool(serializer.validated_data.get('is_published'))
        serializer.save(
            author=self.request.user,
            published_at=timezone.now() if is_published else None,
        )

    def perform_update(self, serializer):
        instance = self.get_object()
        is_published = serializer.validated_data.get('is_published', instance.is_published)
        published_at = instance.published_at

        if is_published and not published_at:
            published_at = timezone.now()
        if not is_published:
            published_at = None

        serializer.save(published_at=published_at)


class PortalSettingsViewSet(viewsets.ViewSet):
    permission_classes = [custom_permissions.IsAdminUser]

    def _get_settings(self):
        settings_obj, _ = models.PortalSettings.objects.get_or_create(pk=1)
        return settings_obj

    def list(self, request):
        serializer = PortalSettingsSerializer(self._get_settings())
        return Response(serializer.data)

    def partial_update(self, request, pk=None):
        settings_obj = self._get_settings()
        serializer = PortalSettingsSerializer(settings_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        models.AuditLog.objects.create(
            action='Portal settings updated',
            actor=request.user,
            details={'updated_fields': list(serializer.validated_data.keys())},
        )
        return Response(serializer.data)


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AuditLogSerializer
    permission_classes = [custom_permissions.IsAdminUser]

    def get_queryset(self):
        return models.AuditLog.objects.select_related('actor').all()[:100]

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
        content = (request.data.get('content') or '').strip()
        if not content:
            raise ValidationError({'content': ['Message content is required.']})
        msg = models.Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=content
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

        if amount is None:
            raise ValidationError({'amount': ['Amount is required.']})

        try:
            amount = float(amount)
        except (TypeError, ValueError):
            raise ValidationError({'amount': ['Invalid amount.']})
        if amount <= 0:
            raise ValidationError({'amount': ['Amount must be greater than zero.']})

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
        if campaign.campaign_type != 'participation':
            raise ValidationError({'campaign': ['Participation is only allowed for participation campaigns.']})
        already_participated = models.Donation.objects.filter(
            campaign=campaign,
            donor=request.user,
            status='completed',
            campaign_type='participation',
        ).exists()
        if already_participated:
            raise ValidationError({'campaign': ['You have already joined this campaign.']})
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
    queryset = (
        models.Club.objects
        .select_related('created_by')
        .prefetch_related('memberships__user__profile', 'join_requests__user__profile')
        .order_by('-created_at')
        .all()
    )
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

    def _is_platform_admin(self, user):
        return getattr(getattr(user, 'profile', None), 'role', None) == 'admin'

    def _is_club_manager(self, club, user):
        if self._is_platform_admin(user):
            return True
        membership = club.memberships.filter(user=user).first()
        return bool(membership and membership.role in ['owner', 'admin', 'moderator'])

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        club = self.get_object()
        # Already a member?
        if club.memberships.filter(user=request.user).exists():
            raise ValidationError({'club': ['Already a member.']})

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
            raise ValidationError({'club': ['Not a member.']})
        if membership.role == 'owner':
            raise ValidationError({'club': ['Owner cannot leave. Transfer ownership first.']})
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
        if not self._is_club_manager(club, request.user):
            raise PermissionDenied('You are not allowed to view join requests.')
        serializer = ClubJoinRequestSerializer(club.join_requests.filter(status='pending'), many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def approve_request(self, request, pk=None):
        club = self.get_object()
        if not self._is_club_manager(club, request.user):
            raise PermissionDenied('You are not allowed to approve requests.')
        req_id = request.data.get('request_id')
        req = club.join_requests.filter(id=req_id, status='pending').first()
        if not req:
            raise NotFound('Request not found.')
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
        if not self._is_club_manager(club, request.user):
            raise PermissionDenied('You are not allowed to reject requests.')
        req_id = request.data.get('request_id')
        req = club.join_requests.filter(id=req_id, status='pending').first()
        if not req:
            raise NotFound('Request not found.')
        req.status = 'rejected'
        req.save()
        return Response({'status': 'rejected'})

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Admin approves a pending club"""
        if not self._is_platform_admin(request.user):
            raise PermissionDenied('Only admins can approve clubs.')
        club = self.get_object()
        club.status = 'active'
        club.save()
        return Response({'status': 'active'})

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        if not self._is_platform_admin(request.user):
            raise PermissionDenied('Only admins can suspend clubs.')
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
        if club.is_private and not club.memberships.filter(user=request.user).exists() and not self._is_platform_admin(request.user):
            raise PermissionDenied('You must be a club member to post.')
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
        if club.is_private and not club.memberships.filter(user=request.user).exists() and not self._is_platform_admin(request.user):
            raise PermissionDenied('You must be a club member to chat.')
        text = (request.data.get('text') or '').strip()
        if not text:
            raise ValidationError({'text': ['Message text is required.']})
        msg = models.ClubMessage.objects.create(
            club=club,
            sender=request.user,
            text=text
        )
        serializer = ClubMessageSerializer(msg, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ClubPostViewSet(viewsets.ModelViewSet):
    queryset = (
        models.ClubPost.objects
        .select_related('club', 'author', 'author__profile')
        .prefetch_related(
            'user_likes',
            'comments__author__profile',
            'comments__replies__author__profile',
        )
        .all()
    )
    serializer_class = ClubPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def _is_platform_admin(self, user):
        return getattr(getattr(user, 'profile', None), 'role', None) == 'admin'

    def _can_access_post(self, post, user):
        if not post.club.is_private:
            return True
        return self._is_platform_admin(user) or post.club.memberships.filter(user=user).exists()

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = self.get_object()
        if not self._can_access_post(post, request.user):
            raise PermissionDenied('You must be a club member to like this post.')

        models.ClubPostLike.objects.get_or_create(post=post, user=request.user)
        likes_count = post.user_likes.count()
        post.likes = likes_count
        post.save(update_fields=['likes'])
        return Response({'likes': likes_count, 'is_liked': True})

    @action(detail=True, methods=['post'])
    def unlike(self, request, pk=None):
        post = self.get_object()
        if not self._can_access_post(post, request.user):
            raise PermissionDenied('You must be a club member to unlike this post.')

        post.user_likes.filter(user=request.user).delete()
        likes_count = post.user_likes.count()
        post.likes = likes_count
        post.save(update_fields=['likes'])
        return Response({'likes': likes_count, 'is_liked': False})

    @action(detail=True, methods=['post'])
    def pin(self, request, pk=None):
        post = self.get_object()
        role = getattr(getattr(request.user, 'profile', None), 'role', None)
        if role != 'admin':
            membership = post.club.memberships.filter(user=request.user).first()
            if not membership or membership.role not in ['owner', 'admin', 'moderator']:
                raise PermissionDenied('You are not allowed to pin posts.')
        post.is_pinned = not post.is_pinned
        post.save()
        return Response({'is_pinned': post.is_pinned})

    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        post = self.get_object()
        if not self._can_access_post(post, request.user):
            raise PermissionDenied('You must be a club member to view comments.')

        comments = (
            post.comments.filter(parent__isnull=True)
            .select_related('author', 'author__profile')
            .prefetch_related('replies__author__profile')
        )
        serializer = ClubPostCommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        post = self.get_object()
        if not self._can_access_post(post, request.user):
            raise PermissionDenied('You must be a club member to comment.')

        parent = None
        parent_id = request.data.get('parent')
        if parent_id:
            parent = post.comments.filter(id=parent_id).first()
            if not parent:
                raise ValidationError({'parent': ['Reply target not found for this post.']})

        serializer = ClubPostCommentSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save(author=request.user, post=post, parent=parent)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ClubMembershipViewSet(viewsets.ModelViewSet):
    queryset = models.ClubMembership.objects.select_related('club', 'user').all()
    serializer_class = ClubMembershipSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']

    def _is_platform_admin(self, user):
        return getattr(getattr(user, 'profile', None), 'role', None) == 'admin'

    def _is_club_manager(self, club, user):
        if self._is_platform_admin(user):
            return True
        membership = club.memberships.filter(user=user).first()
        return bool(membership and membership.role in ['owner', 'admin', 'moderator'])

    def get_queryset(self):
        return self.queryset.filter(club__memberships__user=self.request.user).distinct()

    def partial_update(self, request, *args, **kwargs):
        membership = self.get_object()
        if not self._is_club_manager(membership.club, request.user):
            raise PermissionDenied('You are not allowed to update members.')

        new_role = request.data.get('role')
        allowed_roles = {'member', 'moderator', 'admin'}
        if new_role not in allowed_roles:
            raise ValidationError({'role': [f'Role must be one of: {", ".join(sorted(allowed_roles))}.']})
        if membership.role == 'owner':
            raise ValidationError({'role': ['Owner role cannot be changed here.']})

        membership.role = new_role
        membership.save(update_fields=['role'])
        serializer = self.get_serializer(membership, context={'request': request})
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        membership = self.get_object()
        if not self._is_club_manager(membership.club, request.user):
            raise PermissionDenied('You are not allowed to remove members.')
        if membership.role == 'owner':
            raise ValidationError({'detail': ['Owner cannot be removed from the club.']})

        club = membership.club
        membership.delete()
        club.members_count = max(0, club.members_count - 1)
        club.save(update_fields=['members_count'])
        return Response(status=status.HTTP_204_NO_CONTENT)
