from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField

# ==========================================
# 1. CORE DIRECTORY & PROFILES
# Matches MOCK_PROFILES
# ==========================================

class UserProfile(models.Model):
    VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('alumni_only', 'Alumni Only'),
        ('connections_only', 'Connections Only'),
    ]

    ROLE_CHOICES = [
        ('student', 'Student'),
        ('alumni', 'Alumni'),
        ('admin', 'Admin'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    avatar = models.URLField(max_length=500, blank=True, null=True)
    headline = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    department = models.CharField(max_length=100, blank=True)
    graduation_year = models.IntegerField(null=True, blank=True)
    current_company = models.CharField(max_length=100, blank=True)
    current_position = models.CharField(max_length=100, blank=True)
    
    # Socials & Contact
    linkedin_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    college = models.CharField(max_length=150, blank=True)
    student_id = models.CharField(max_length=50, blank=True)
    
    # Postgres ArrayField is perfect for the string array of skills in your mock
    skills = ArrayField(models.CharField(max_length=50), blank=True, default=list)
    
    willing_to_mentor = models.BooleanField(default=False)
    willing_to_hire = models.BooleanField(default=False)
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='public')

    class Meta:
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['department']),
            models.Index(fields=['graduation_year']),
        ]

    def __str__(self):
        return self.user.get_full_name()

class WorkExperience(models.Model):
    profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='work_experiences')
    title = models.CharField(max_length=150)
    company = models.CharField(max_length=150)
    start_date = models.CharField(max_length=20) # Storing as YYYY-MM based on your mock
    end_date = models.CharField(max_length=20, blank=True, null=True)
    description = models.TextField(blank=True)

class Education(models.Model):
    profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='education')
    institution = models.CharField(max_length=200)
    degree = models.CharField(max_length=100)
    field_of_study = models.CharField(max_length=100)
    start_year = models.IntegerField()
    end_year = models.IntegerField(null=True, blank=True)


# ==========================================
# 2. JOB BOARD & CAREERS
# Matches MOCK_JOBS, MOCK_APPLICATIONS, MOCK_HIRING_DRIVES
# ==========================================

class Job(models.Model):
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    job_type = models.CharField(max_length=50) # full_time, internship
    status = models.CharField(max_length=50, default='active') # active, closed
    is_remote = models.BooleanField(default=False)
    can_refer = models.BooleanField(default=False)
    description = models.TextField()
    requirements = models.TextField(blank=True)
    salary_min = models.IntegerField(null=True, blank=True)
    salary_max = models.IntegerField(null=True, blank=True)
    experience_required = models.CharField(max_length=100, blank=True)
    application_deadline = models.DateField(null=True, blank=True)
    posted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='posted_jobs')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['company']),
        ]

class JobApplication(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_applications')
    status = models.CharField(max_length=50, default='pending') # pending, accepted, rejected
    cover_letter = models.TextField(blank=True)
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['job', 'applicant'], name='uniq_job_application_per_user'),
        ]
        indexes = [
            models.Index(fields=['applicant', 'status']),
            models.Index(fields=['job', 'status']),
        ]

class SavedJob(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_jobs')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='saved_by_users')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'job'], name='uniq_saved_job_per_user'),
        ]
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['job']),
        ]

class HiringDrive(models.Model):
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=50) # open, upcoming, completed
    drive_date = models.DateTimeField()
    location = models.CharField(max_length=200)
    registration_deadline = models.DateTimeField()
    registered_users = models.ManyToManyField(User, blank=True, related_name='registered_drives')


# ==========================================
# 3. MENTORSHIP MODULE
# Matches MOCK_MENTOR_PROFILES, SESSIONS, GOALS, REQUESTS
# ==========================================

class MentorProfile(models.Model):
    user = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='mentor_profile')
    headline = models.CharField(max_length=255)
    about = models.TextField()
    topics = ArrayField(models.CharField(max_length=100), default=list)
    languages = ArrayField(models.CharField(max_length=50), default=list)
    mentoring_type = ArrayField(models.CharField(max_length=50), default=list)
    availability = models.JSONField(default=dict) # Stores timezone and slots array
    rating = models.FloatField(default=0.0)
    reviews_count = models.IntegerField(default=0)
    active_mentees = models.IntegerField(default=0)
    max_mentees = models.IntegerField(default=3)
    status = models.CharField(max_length=50, default='accepting') # accepting, full, paused

class MentoringSession(models.Model):
    mentor = models.ForeignKey(MentorProfile, on_delete=models.CASCADE, related_name='sessions_as_mentor')
    mentee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions_as_mentee')
    status = models.CharField(max_length=50, default='upcoming') # upcoming, completed, canceled
    scheduled_at = models.DateTimeField()
    duration = models.IntegerField(default=60) # in minutes
    meeting_link = models.URLField(blank=True, null=True)
    topic = models.CharField(max_length=200)
    notes = models.TextField(blank=True)
    agenda = models.TextField(blank=True)
    feedback_rating = models.IntegerField(null=True, blank=True)
    feedback_comment = models.TextField(blank=True)

class MentorGoal(models.Model):
    session = models.ForeignKey(MentoringSession, on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=50, default='pending') # pending, in_progress, completed
    due_date = models.DateTimeField()

class MentoringRequest(models.Model):
    mentor = models.ForeignKey(MentorProfile, on_delete=models.CASCADE, related_name='requests_received')
    mentee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requests_sent')
    status = models.CharField(max_length=50, default='pending') # pending, accepted, declined
    message = models.TextField()
    mentoring_type = models.CharField(max_length=100)
    requested_slot = models.CharField(max_length=100, blank=True)
    requested_at = models.DateTimeField(auto_now_add=True)


# ==========================================
# 4. SOCIAL FEED & COMMUNITY
# Matches MOCK_POSTS, MOCK_COMMENTS
# ==========================================

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    reaction_counts = models.JSONField(default=dict) # E.g., {"like": 24, "love": 8}

    class Meta:
        indexes = [
            models.Index(fields=['created_at']),
        ]
    
class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class PostReaction(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='post_reactions')
    reaction = models.CharField(max_length=16)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['post', 'user'], name='uniq_post_reaction_per_user'),
        ]


# ==========================================
# 5. FORUMS
# Matches MOCK_FORUM_*
# ==========================================

class ForumCategory(models.Model):
    name = models.CharField(max_length=100)

class ForumTopic(models.Model):
    category = models.ForeignKey(ForumCategory, on_delete=models.CASCADE, related_name='topics')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    content = models.TextField()
    views = models.IntegerField(default=0)
    is_pinned = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class ForumReply(models.Model):
    topic = models.ForeignKey(ForumTopic, on_delete=models.CASCADE, related_name='replies')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


# ==========================================
# 6. MESSAGING
# Matches MOCK_CONVERSATIONS, MOCK_MESSAGES
# ==========================================

class Conversation(models.Model):
    title = models.CharField(max_length=200, blank=True)
    participants = models.ManyToManyField(User, related_name='conversations')
    updated_at = models.DateTimeField(auto_now=True)

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

class ConnectionRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='connection_requests_sent')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='connection_requests_received')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['requester', 'recipient'],
                condition=models.Q(status='pending'),
                name='uniq_pending_connection_request',
            ),
        ]
        indexes = [
            models.Index(fields=['recipient', 'status']),
            models.Index(fields=['requester', 'status']),
        ]


# ==========================================
# 7. NOTIFICATIONS & EVENTS/NEWS
# Matches MOCK_NOTIFICATIONS, MOCK_NEWS, EVENTS
# ==========================================

class Event(models.Model):
    title = models.CharField(max_length=255)
    date = models.DateTimeField()
    location = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    description = models.TextField()
    image = models.URLField(blank=True, null=True)
    attendees = models.ManyToManyField(User, blank=True, related_name='attended_events')

class NewsArticle(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    category_name = models.CharField(max_length=100)
    published_at = models.DateTimeField(auto_now_add=True)
    image = models.URLField(blank=True, null=True)

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=50) # mentorship_request, job_update, etc.
    metadata = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20, default='unread')
    created_at = models.DateTimeField(auto_now_add=True)


# ==========================================
# 8. CAMPAIGNS & DONATIONS
# ==========================================

class Campaign(models.Model):
    CATEGORY_CHOICES = [
        ('scholarship', 'Scholarship'),
        ('infrastructure', 'Infrastructure'),
        ('research', 'Research'),
        ('emergency', 'Emergency'),
        ('sports', 'Sports'),
        ('health', 'Health'),
        ('cultural', 'Cultural'),
        ('other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('paused', 'Paused'),
        ('cancelled', 'Cancelled'),
    ]
    CAMPAIGN_TYPE_CHOICES = [
        ('donation', 'Donation'),
        ('participation', 'Participation'),
    ]

    title = models.CharField(max_length=255)
    story = models.TextField()
    long_story = models.TextField(blank=True)
    impact_examples = models.JSONField(default=list)  # [{"amount": 500, "impact": "..."}]
    goal = models.DecimalField(max_digits=14, decimal_places=2)
    raised = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    currency = models.CharField(max_length=10, blank=True, null=True, default='INR')
    deadline = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    campaign_type = models.CharField(max_length=20, choices=CAMPAIGN_TYPE_CHOICES, default='donation')
    featured = models.BooleanField(default=False)
    urgent = models.BooleanField(default=False)
    donor_count = models.IntegerField(default=0)
    allow_anonymous = models.BooleanField(default=True)
    allow_recurring = models.BooleanField(default=True)
    show_donor_list = models.BooleanField(default=True)
    target_batch = models.IntegerField(null=True, blank=True)
    target_department = models.CharField(max_length=100, blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='campaigns')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(condition=models.Q(raised__gte=0), name='campaign_raised_non_negative'),
            models.CheckConstraint(condition=models.Q(donor_count__gte=0), name='campaign_donor_count_non_negative'),
        ]
        indexes = [
            models.Index(fields=['status', 'campaign_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return self.title


class Donation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    FREQUENCY_CHOICES = [
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ]

    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='donations')
    donor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='donations')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    anonymous = models.BooleanField(default=False)
    recurring = models.BooleanField(default=False)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, blank=True, null=True)
    campaign_type = models.CharField(max_length=20, default='donation')  # donation | participation
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(condition=models.Q(amount__gt=0), name='donation_amount_gt_zero'),
        ]
        indexes = [
            models.Index(fields=['campaign', 'status']),
            models.Index(fields=['donor', 'created_at']),
        ]

    def __str__(self):
        return f"{self.donor} → {self.campaign.title} ({self.amount})"


# ==========================================
# 9. CLUBS / GROUPS
# ==========================================

class Club(models.Model):
    CATEGORY_CHOICES = [
        ('technical', 'Technical'),
        ('cultural', 'Cultural'),
        ('sports', 'Sports'),
        ('academic', 'Academic'),
        ('social', 'Social'),
        ('professional', 'Professional'),
        ('other', 'Other'),
    ]
    TYPE_CHOICES = [
        ('Interest Group', 'Interest Group'),
        ('Chapter', 'Chapter'),
        ('Cohort', 'Cohort'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('pending', 'Pending Approval'),
        ('suspended', 'Suspended'),
        ('archived', 'Archived'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='Interest Group')
    is_private = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    cover_image = models.URLField(blank=True, null=True)
    icon = models.CharField(max_length=10, blank=True)  # emoji
    tags = ArrayField(models.CharField(max_length=50), blank=True, default=list)
    rules = models.JSONField(default=list)
    members_count = models.IntegerField(default=0)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_clubs')
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.name


class ClubMembership(models.Model):
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('admin', 'Admin'),
        ('moderator', 'Moderator'),
        ('member', 'Member'),
    ]

    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='club_memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=100, blank=True)  # e.g. "Founder", "Captain"

    class Meta:
        unique_together = ('club', 'user')

    def __str__(self):
        return f"{self.user} in {self.club} ({self.role})"


class ClubJoinRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='join_requests')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='club_join_requests')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    message = models.TextField(blank=True)
    requested_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('club', 'user')


class ClubPost(models.Model):
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='posts')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='club_posts')
    content = models.TextField()
    image = models.URLField(blank=True, null=True)
    likes = models.IntegerField(default=0)
    is_pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Post in {self.club.name} by {self.author}"


class ClubMessage(models.Model):
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='club_messages')
    text = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message in {self.club.name} by {self.sender}"
