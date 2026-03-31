from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from app.models import (
    UserProfile, WorkExperience, Education, Job, Event,
    NewsArticle, ForumCategory, ForumTopic, Post,
    Campaign, Club, ClubMembership, MentorProfile
)


class Command(BaseCommand):
    help = 'Seeds the database with all frontend mock data'

    def handle(self, *args, **kwargs):
        self.stdout.write('🌱 Seeding database with mock data...\n')

        # ── 1. USERS & PROFILES ──────────────────────────────────────────────
        mock_users = [
            {
                'username': 'alex@alumni.com', 'email': 'alex@alumni.com',
                'first_name': 'Alex', 'last_name': 'Johnson', 'password': 'password123',
                'profile': {
                    'role': 'alumni', 'headline': 'Software Engineer at Google',
                    'bio': 'Passionate about building scalable systems and mentoring young engineers.',
                    'city': 'Bengaluru', 'country': 'India', 'department': 'Computer Science',
                    'graduation_year': 2020, 'current_company': 'Google',
                    'current_position': 'Senior SWE',
                    'linkedin_url': 'https://linkedin.com/in/alexjohnson',
                    'github_url': 'https://github.com/alexj',
                    'skills': ['React', 'Python', 'System Design', 'Cloud Architecture', 'TypeScript'],
                    'willing_to_mentor': True, 'willing_to_hire': False, 'visibility': 'public',
                },
                'work': [
                    {'title': 'Senior Software Engineer', 'company': 'Google', 'start_date': '2022-01', 'description': 'Leading frontend team for Cloud Console.'},
                    {'title': 'Software Engineer', 'company': 'Meta', 'start_date': '2020-06', 'end_date': '2022-01', 'description': 'Built React components for News Feed.'},
                ],
                'edu': [{'institution': 'MIT', 'degree': 'B.S.', 'field_of_study': 'Computer Science', 'start_year': 2016, 'end_year': 2020}],
            },
            {
                'username': 'sarah@alumni.com', 'email': 'sarah@alumni.com',
                'first_name': 'Sarah', 'last_name': 'Williams', 'password': 'password123',
                'profile': {
                    'role': 'alumni', 'headline': 'Product Manager at Amazon',
                    'bio': 'Driving product innovation in e-commerce.',
                    'city': 'Mumbai', 'country': 'India', 'department': 'Business',
                    'graduation_year': 2019, 'current_company': 'Amazon',
                    'current_position': 'Senior PM',
                    'linkedin_url': 'https://linkedin.com/in/sarahw',
                    'skills': ['Product Strategy', 'Agile', 'Data Analytics', 'User Research'],
                    'willing_to_mentor': True, 'willing_to_hire': True, 'visibility': 'alumni_only',
                },
                'work': [{'title': 'Senior PM', 'company': 'Amazon', 'start_date': '2021-03'}],
                'edu': [{'institution': 'Stanford', 'degree': 'MBA', 'field_of_study': 'Business', 'start_year': 2017, 'end_year': 2019}],
            },
            {
                'username': 'raj@alumni.com', 'email': 'raj@alumni.com',
                'first_name': 'Raj', 'last_name': 'Patel', 'password': 'password123',
                'profile': {
                    'role': 'alumni', 'headline': 'Data Scientist at Netflix',
                    'bio': 'Machine learning enthusiast focused on recommendation systems.',
                    'city': 'Delhi', 'country': 'India', 'department': 'Data Science',
                    'graduation_year': 2021, 'current_company': 'Netflix',
                    'current_position': 'ML Engineer',
                    'linkedin_url': 'https://linkedin.com/in/rajp',
                    'github_url': 'https://github.com/rajp',
                    'skills': ['Machine Learning', 'Python', 'TensorFlow', 'SQL', 'Statistics'],
                    'willing_to_mentor': False, 'willing_to_hire': False, 'visibility': 'public',
                },
                'work': [{'title': 'ML Engineer', 'company': 'Netflix', 'start_date': '2021-07'}],
                'edu': [{'institution': 'MIT', 'degree': 'M.S.', 'field_of_study': 'Data Science', 'start_year': 2019, 'end_year': 2021}],
            },
            {
                'username': 'emily@alumni.com', 'email': 'emily@alumni.com',
                'first_name': 'Emily', 'last_name': 'Chen', 'password': 'password123',
                'profile': {
                    'role': 'alumni', 'headline': 'UX Designer at Apple',
                    'bio': 'Creating intuitive user experiences.',
                    'city': 'Hyderabad', 'country': 'India', 'department': 'Design',
                    'graduation_year': 2018, 'current_company': 'Apple',
                    'current_position': 'Lead Designer',
                    'linkedin_url': 'https://linkedin.com/in/emilyc',
                    'skills': ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
                    'willing_to_mentor': True, 'willing_to_hire': False, 'visibility': 'public',
                },
                'work': [{'title': 'Lead Designer', 'company': 'Apple', 'start_date': '2020-01'}],
                'edu': [{'institution': 'RISD', 'degree': 'BFA', 'field_of_study': 'Industrial Design', 'start_year': 2014, 'end_year': 2018}],
            },
            {
                'username': 'michael@alumni.com', 'email': 'michael@alumni.com',
                'first_name': 'Michael', 'last_name': 'Brown', 'password': 'password123',
                'profile': {
                    'role': 'alumni', 'headline': 'CTO at TechStartup',
                    'bio': 'Building the next generation of fintech solutions.',
                    'city': 'Pune', 'country': 'India', 'department': 'Computer Science',
                    'graduation_year': 2015, 'current_company': 'FinFlow',
                    'current_position': 'CTO',
                    'linkedin_url': 'https://linkedin.com/in/michaelb',
                    'github_url': 'https://github.com/mbrown',
                    'skills': ['Leadership', 'Architecture', 'Go', 'Kubernetes', 'AWS'],
                    'willing_to_mentor': True, 'willing_to_hire': True, 'visibility': 'connections_only',
                },
                'work': [{'title': 'CTO', 'company': 'FinFlow', 'start_date': '2019-01'}],
                'edu': [{'institution': 'MIT', 'degree': 'B.S.', 'field_of_study': 'CS', 'start_year': 2011, 'end_year': 2015}],
            },
            {
                'username': 'priya@alumni.com', 'email': 'priya@alumni.com',
                'first_name': 'Priya', 'last_name': 'Sharma', 'password': 'password123',
                'profile': {
                    'role': 'alumni', 'headline': 'AI Research Scientist at DeepMind',
                    'bio': 'Researching reinforcement learning for robotics.',
                    'city': 'Chennai', 'country': 'India', 'department': 'AI',
                    'graduation_year': 2022, 'current_company': 'DeepMind',
                    'current_position': 'Research Scientist',
                    'linkedin_url': 'https://linkedin.com/in/priyas',
                    'github_url': 'https://github.com/psharma',
                    'skills': ['PyTorch', 'Reinforcement Learning', 'Robotics', 'C++'],
                    'willing_to_mentor': False, 'willing_to_hire': False, 'visibility': 'public',
                },
                'work': [{'title': 'Research Scientist', 'company': 'DeepMind', 'start_date': '2022-09'}],
                'edu': [{'institution': 'MIT', 'degree': 'Ph.D.', 'field_of_study': 'AI', 'start_year': 2018, 'end_year': 2022}],
            },
            # Students
            {
                'username': 'student1@uni.com', 'email': 'student1@uni.com',
                'first_name': 'Arjun', 'last_name': 'Kumar', 'password': 'password123',
                'profile': {
                    'role': 'student', 'headline': 'Final Year CS Student',
                    'bio': 'Passionate about web development and AI.',
                    'city': 'Bengaluru', 'country': 'India', 'department': 'Computer Science',
                    'graduation_year': 2026, 'student_id': 'CS2026001',
                    'skills': ['React', 'Python', 'Machine Learning'],
                    'willing_to_mentor': False, 'willing_to_hire': False, 'visibility': 'public',
                },
                'work': [], 'edu': [],
            },
            # Admin
            {
                'username': 'admin@alumni.com', 'email': 'admin@alumni.com',
                'first_name': 'Admin', 'last_name': 'User', 'password': 'admin123',
                'profile': {
                    'role': 'admin', 'headline': 'Alumni Portal Administrator',
                    'bio': 'Managing the alumni portal.',
                    'city': 'Bengaluru', 'country': 'India', 'department': 'Administration',
                    'skills': [], 'willing_to_mentor': False, 'willing_to_hire': False, 'visibility': 'public',
                },
                'work': [], 'edu': [],
            },
        ]

        user_map = {}
        for u_data in mock_users:
            user, created = User.objects.get_or_create(
                username=u_data['username'],
                defaults={
                    'email': u_data['email'],
                    'first_name': u_data['first_name'],
                    'last_name': u_data['last_name'],
                }
            )
            if created:
                user.set_password(u_data['password'])
                user.save()
                self.stdout.write(f"  Created user: {user.email}")

            profile, _ = UserProfile.objects.get_or_create(user=user, defaults=u_data['profile'])
            user_map[u_data['email']] = user

            for w in u_data.get('work', []):
                WorkExperience.objects.get_or_create(profile=profile, title=w['title'], company=w['company'], defaults={
                    'start_date': w.get('start_date', ''),
                    'end_date': w.get('end_date', ''),
                    'description': w.get('description', ''),
                })
            for e in u_data.get('edu', []):
                Education.objects.get_or_create(
                    profile=profile, institution=e['institution'], degree=e['degree'],
                    defaults={'field_of_study': e['field_of_study'], 'start_year': e['start_year'], 'end_year': e.get('end_year')}
                )

        self.stdout.write(self.style.SUCCESS(f'✅ Users & Profiles seeded ({len(mock_users)} users)\n'))

        # ── 2. JOBS ──────────────────────────────────────────────────────────
        jobs = [
            {'title': 'Senior Frontend Engineer', 'company': 'Google', 'location': 'Mountain View, CA', 'job_type': 'full_time', 'is_remote': True, 'description': "Join our team building the next generation of web applications using React and TypeScript. You'll work on Cloud Console, one of the most complex SPA applications at Google.", 'requirements': '5+ years of experience with React\nFamiliarity with TypeScript and state management', 'salary_min': 180000, 'salary_max': 280000, 'experience_required': '5+ years', 'application_deadline': '2026-12-01', 'poster': 'michael@alumni.com'},
            {'title': 'Product Manager', 'company': 'Amazon', 'location': 'Seattle, WA', 'job_type': 'full_time', 'is_remote': False, 'description': 'Lead product development for AWS services.', 'requirements': '3+ years PM experience', 'salary_min': 150000, 'salary_max': 220000, 'experience_required': '3+ years', 'application_deadline': '2026-12-15', 'poster': 'sarah@alumni.com'},
            {'title': 'ML Engineering Intern', 'company': 'Netflix', 'location': 'Los Angeles, CA', 'job_type': 'internship', 'is_remote': True, 'description': '12-week internship working on recommendation algorithms.', 'salary_min': 8000, 'salary_max': 10000, 'experience_required': 'Enrolled in CS/ML program', 'application_deadline': '2026-05-01', 'poster': 'raj@alumni.com'},
            {'title': 'UX Design Lead', 'company': 'Apple', 'location': 'Cupertino, CA', 'job_type': 'full_time', 'is_remote': False, 'description': 'Lead the design team for Apple Health.', 'status': 'closed', 'salary_min': 160000, 'salary_max': 240000, 'poster': 'emily@alumni.com'},
        ]
        for j_data in jobs:
            poster = user_map.get(j_data.pop('poster'))
            Job.objects.get_or_create(title=j_data['title'], company=j_data['company'], defaults={**{k: v for k, v in j_data.items() if k not in ('title', 'company')}, 'posted_by': poster})
        self.stdout.write(self.style.SUCCESS(f'✅ Jobs seeded\n'))

        # ── 3. EVENTS ─────────────────────────────────────────────────────────
        from datetime import date, timedelta
        today = date.today()
        events = [
            {'title': 'Annual Tech Alumni Mixer', 'date': today + timedelta(days=5), 'location': 'Virtual', 'category': 'Networking', 'description': 'Join us for our biggest virtual networking event of the year.', 'image': 'https://images.unsplash.com/photo-1540317580384-e5d43867caa6?auto=format&fit=crop&q=80&w=800'},
            {'title': 'Career Transition Panel', 'date': today + timedelta(days=12), 'location': 'Campus Center, Room 101', 'category': 'Career', 'description': 'Hear from a panel of successful alumni who have navigated major career changes.', 'image': 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800'},
            {'title': 'Startup Pitch Night', 'date': today + timedelta(days=20), 'location': 'City Innovation Hub', 'category': 'Entrepreneurship', 'description': 'Watch innovative alumni-founded startups pitch their ideas to a panel of investors.', 'image': 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=800'},
        ]
        for e_data in events:
            from datetime import datetime
            dt = datetime.combine(e_data['date'], datetime.min.time())
            Event.objects.get_or_create(title=e_data['title'], defaults={**e_data, 'date': dt})
        self.stdout.write(self.style.SUCCESS(f'✅ Events seeded\n'))

        # ── 4. CAMPAIGNS ──────────────────────────────────────────────────────
        admin_user = user_map.get('admin@alumni.com')
        campaigns_data = [
            {'title': 'Alumni Scholarship Fund 2026', 'story': 'Help us support the next generation of outstanding students.', 'long_story': 'Every year, hundreds of bright, deserving students miss out on higher education simply because of financial barriers.', 'goal': 50000, 'raised': 35000, 'currency': 'INR', 'deadline': '2026-12-31', 'status': 'active', 'category': 'scholarship', 'campaign_type': 'donation', 'featured': True, 'urgent': False, 'donor_count': 142, 'allow_anonymous': True, 'allow_recurring': True, 'show_donor_list': True, 'image_url': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80', 'impact_examples': [{'amount': 500, 'impact': "Covers one month of a student's living expenses"}, {'amount': 2000, 'impact': 'Funds one semester of textbooks'}, {'amount': 10000, 'impact': 'Provides a full semester scholarship'}]},
            {'title': 'Emergency Relief: Student Flood Aid', 'story': 'Cyclone displaced 200+ students from hostels. We need urgent funds for shelter, food, and essentials.', 'long_story': 'Cyclone Maha has wreaked havoc on our eastern campus, displacing over 200 students from their hostels.', 'goal': 200000, 'raised': 87500, 'currency': 'INR', 'deadline': '2026-06-15', 'status': 'active', 'category': 'emergency', 'campaign_type': 'donation', 'featured': False, 'urgent': True, 'donor_count': 318, 'allow_anonymous': True, 'allow_recurring': False, 'show_donor_list': True, 'image_url': 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&q=80', 'impact_examples': [{'amount': 250, 'impact': 'Feeds one displaced student for a week'}]},
            {'title': 'New Library Tech Wing', 'story': 'Upgrade the university library with a state-of-the-art tech wing.', 'long_story': 'The future of education is digital, collaborative, and immersive.', 'goal': 1000000, 'raised': 245000, 'currency': 'INR', 'deadline': '2026-09-30', 'status': 'active', 'category': 'infrastructure', 'campaign_type': 'donation', 'featured': True, 'urgent': False, 'donor_count': 89, 'allow_anonymous': True, 'allow_recurring': True, 'show_donor_list': True, 'image_url': 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80', 'impact_examples': [{'amount': 1000, 'impact': 'Funds a digital research subscription for one year'}]},
            {'title': 'Annual Blood Donation Camp', 'story': 'Join us for our annual campus-wide blood donation drive. Your single donation can save up to 3 lives.', 'long_story': 'In partnership with the City General Hospital, our Alumni Association is hosting the 15th Annual Blood Donation Camp.', 'goal': 1000, 'raised': 450, 'currency': None, 'deadline': '2026-04-15', 'status': 'active', 'category': 'health', 'campaign_type': 'participation', 'featured': True, 'urgent': False, 'donor_count': 450, 'allow_anonymous': False, 'allow_recurring': False, 'show_donor_list': True, 'image_url': 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&q=80', 'impact_examples': []},
            {'title': 'AI Research Lab Endowment', 'story': "Fund cutting-edge AI and machine learning research that will power India's next generation of tech innovation.", 'long_story': "India's technology sector is booming, but our academic institutions need world-class research facilities.", 'goal': 2000000, 'raised': 520000, 'currency': 'INR', 'deadline': '2027-03-31', 'status': 'active', 'category': 'research', 'campaign_type': 'donation', 'featured': False, 'urgent': False, 'donor_count': 54, 'allow_anonymous': True, 'allow_recurring': True, 'show_donor_list': False, 'target_department': 'Computer Science', 'image_url': 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80', 'impact_examples': [{'amount': 2000, 'impact': "Funds a researcher's conference registration"}]},
            {'title': 'Campus Sports Complex Renovation', 'story': 'Renovate and modernize the campus sports facilities.', 'long_story': 'A healthy body nurtures a healthy mind.', 'goal': 5000000, 'raised': 5000000, 'currency': 'INR', 'deadline': '2025-12-31', 'status': 'completed', 'category': 'infrastructure', 'campaign_type': 'donation', 'featured': False, 'urgent': False, 'donor_count': 421, 'allow_anonymous': True, 'allow_recurring': False, 'show_donor_list': True, 'image_url': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', 'impact_examples': []},
        ]
        for c_data in campaigns_data:
            Campaign.objects.get_or_create(title=c_data['title'], defaults={**c_data, 'created_by': admin_user})
        self.stdout.write(self.style.SUCCESS(f'✅ Campaigns seeded\n'))

        # ── 5. NEWS ───────────────────────────────────────────────────────────
        news_items = [
            {'title': 'Alumni Association Launches New Mentorship Program', 'content': 'We are thrilled to announce a brand new mentorship program connecting alumni with current students.', 'category_name': 'Announcement', 'image': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800'},
            {'title': 'University Opens New Innovation Center', 'content': 'A state-of-the-art facility for student and alumni entrepreneurs opens its doors on campus.', 'category_name': 'Campus News', 'image': 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'},
            {'title': 'Alumni Spotlight: Building the Future of Green Tech', 'content': 'Read how a group of recent graduates are making waves in the sustainable energy sector.', 'category_name': 'Alumni Spotlight', 'image': 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&q=80&w=800'},
        ]
        for n_data in news_items:
            NewsArticle.objects.get_or_create(title=n_data['title'], defaults=n_data)
        self.stdout.write(self.style.SUCCESS(f'✅ News seeded\n'))

        # ── 6. FORUM CATEGORIES & TOPICS ──────────────────────────────────────
        categories = ['General Discussion', 'Career Advice', 'Technical', 'Events']
        cat_map = {}
        for cat_name in categories:
            cat, _ = ForumCategory.objects.get_or_create(name=cat_name)
            cat_map[cat_name] = cat

        forum_topics = [
            {'title': 'Tips for FAANG Interviews', 'category': 'Career Advice', 'content': 'Here are my top tips for cracking FAANG interviews...\n\n1. Practice data structures daily\n2. Focus on system design\n3. Prepare behavioral stories', 'is_pinned': True, 'author': 'alex@alumni.com'},
            {'title': 'Alumni Reunion 2026', 'category': 'Events', 'content': 'Exciting news! The 2026 Alumni Reunion is coming up. Save the date: April 20, 2026.', 'is_pinned': False, 'author': 'sarah@alumni.com'},
            {'title': 'Best resources for learning Rust?', 'category': 'Technical', 'content': 'I want to learn Rust. What are the best free resources?', 'is_pinned': False, 'author': 'raj@alumni.com'},
            {'title': 'Welcome to the Forums!', 'category': 'General Discussion', 'content': 'Welcome everyone! Please follow the community guidelines.', 'is_pinned': True, 'is_locked': True, 'author': 'admin@alumni.com'},
        ]
        for t_data in forum_topics:
            author = user_map.get(t_data.pop('author'))
            cat = cat_map.get(t_data.pop('category'))
            if author and cat:
                ForumTopic.objects.get_or_create(title=t_data['title'], category=cat, defaults={**{k: v for k, v in t_data.items() if k != 'title'}, 'author': author})
        self.stdout.write(self.style.SUCCESS(f'✅ Forum categories & topics seeded\n'))

        # ── 7. POSTS (SOCIAL FEED) ────────────────────────────────────────────
        feed_posts = [
            {'content': "Excited to announce that I've just been promoted to Senior Engineer! 🎉 Thank you to everyone who supported me on this journey.", 'author': 'alex@alumni.com', 'reaction_counts': {'like': 24, 'love': 8, 'celebrate': 15}},
            {'content': 'Just published a new article on product management best practices. Check it out at my blog! #ProductManagement #Innovation', 'author': 'sarah@alumni.com', 'reaction_counts': {'like': 12, 'love': 3}},
            {'content': 'Our latest paper on recommendation systems just got accepted at NeurIPS! Big milestone for our team. 🏆', 'author': 'raj@alumni.com', 'reaction_counts': {'like': 42, 'love': 15, 'celebrate': 28}},
        ]
        for p_data in feed_posts:
            author = user_map.get(p_data.pop('author'))
            if author:
                Post.objects.get_or_create(
                    author=author,
                    content=p_data['content'],
                    defaults={'reaction_counts': p_data.get('reaction_counts', {})}
                )
        self.stdout.write(self.style.SUCCESS(f'✅ Feed posts seeded\n'))

        # ── 8. CLUBS ──────────────────────────────────────────────────────────
        clubs_data = [
            {'name': 'CS Alumni Network', 'description': 'A community for Computer Science alumni to network, share opportunities, and stay connected.', 'category': 'professional', 'type': 'Interest Group', 'is_private': False, 'status': 'active', 'icon': '💻', 'tags': ['networking', 'tech', 'cs'], 'cover_image': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', 'creator': 'alex@alumni.com'},
            {'name': 'Startup Founders Hub', 'description': 'For alumni who have founded or are building startups. Share experiences, find co-founders, and get advice.', 'category': 'professional', 'type': 'Interest Group', 'is_private': False, 'status': 'active', 'icon': '🚀', 'tags': ['startups', 'entrepreneurship', 'founders'], 'cover_image': 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80', 'creator': 'michael@alumni.com'},
            {'name': 'Women in Tech', 'description': 'A supportive community for women in technology from our alumni network.', 'category': 'social', 'type': 'Interest Group', 'is_private': False, 'status': 'active', 'icon': '👩‍💻', 'tags': ['women', 'diversity', 'tech'], 'cover_image': 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80', 'creator': 'emily@alumni.com'},
            {'name': 'Sports & Fitness Club', 'description': 'Stay active with fellow alumni! Organize sports events, marathons, and fitness challenges.', 'category': 'sports', 'type': 'Interest Group', 'is_private': False, 'status': 'active', 'icon': '🏃', 'tags': ['sports', 'fitness', 'health'], 'cover_image': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', 'creator': 'raj@alumni.com'},
        ]
        for c_data in clubs_data:
            creator = user_map.get(c_data.pop('creator'))
            club, created = Club.objects.get_or_create(name=c_data['name'], defaults={**c_data, 'created_by': creator, 'members_count': 1})
            if created and creator:
                ClubMembership.objects.get_or_create(club=club, user=creator, defaults={'role': 'owner', 'title': 'Founder'})
        self.stdout.write(self.style.SUCCESS(f'✅ Clubs seeded\n'))

        self.stdout.write(self.style.SUCCESS('\n🎉 All mock data seeded successfully!\n'))
        self.stdout.write('\nQuick-login credentials:\n')
        self.stdout.write('  Admin:   admin@alumni.com   / admin123\n')
        self.stdout.write('  Alumni:  alex@alumni.com    / password123\n')
        self.stdout.write('  Alumni:  sarah@alumni.com   / password123\n')
        self.stdout.write('  Student: student1@uni.com   / password123\n')