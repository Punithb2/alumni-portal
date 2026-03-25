from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from app.models import UserProfile, Job

class Command(BaseCommand):
    help = 'Seeds the database with frontend mock data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        # 1. Seed Users & Profiles (From MOCK_PROFILES)
        mock_users = [
            {'email': 'alex@alumni.com', 'first_name': 'Alex', 'last_name': 'Johnson', 'headline': 'Software Engineer at Google', 'company': 'Google'},
            {'email': 'sarah@alumni.com', 'first_name': 'Sarah', 'last_name': 'Williams', 'headline': 'Product Manager at Amazon', 'company': 'Amazon'},
            {'email': 'raj@alumni.com', 'first_name': 'Raj', 'last_name': 'Patel', 'headline': 'Data Scientist at Netflix', 'company': 'Netflix'},
            {'email': 'emily@alumni.com', 'first_name': 'Emily', 'last_name': 'Chen', 'headline': 'UX Designer at Apple', 'company': 'Apple'},
            {'email': 'michael@alumni.com', 'first_name': 'Michael', 'last_name': 'Brown', 'headline': 'CTO at TechStartup', 'company': 'FinFlow'},
            {'email': 'priya@alumni.com', 'first_name': 'Priya', 'last_name': 'Sharma', 'headline': 'AI Research Scientist at DeepMind', 'company': 'DeepMind'}
        ]

        users_created = []
        for u_data in mock_users:
            user, created = User.objects.get_or_create(
                email=u_data['email'],
                username=u_data['email'],
                defaults={'first_name': u_data['first_name'], 'last_name': u_data['last_name']}
            )
            if created:
                user.set_password('password123') # Default password
                user.save()

            UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'headline': u_data['headline'],
                    'current_company': u_data['company']
                }
            )
            users_created.append(user)

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(users_created)} users!'))

        # 2. Seed Jobs
        mock_jobs = [
            {'title': 'Senior Frontend Engineer', 'company': 'Google', 'location': 'Mountain View, CA', 'type': 'full_time', 'user_email': 'michael@alumni.com'},
            {'title': 'Product Manager', 'company': 'Amazon', 'location': 'Seattle, WA', 'type': 'full_time', 'user_email': 'sarah@alumni.com'},
        ]

        for j_data in mock_jobs:
            poster = User.objects.filter(email=j_data['user_email']).first()
            Job.objects.get_or_create(
                title=j_data['title'],
                company=j_data['company'],
                defaults={
                    'location': j_data['location'],
                    'job_type': j_data['type'],
                    'posted_by': poster,
                    'description': 'Mock description from seed.'
                }
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded jobs!'))
        self.stdout.write(self.style.SUCCESS('Data seeding complete. You can now use quick-login.'))