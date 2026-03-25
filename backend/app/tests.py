from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Campaign, Donation, Job, UserProfile


class SecurityHardeningTests(APITestCase):
    def _token_for(self, user):
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    def _auth(self, user):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self._token_for(user)}')

    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin1',
            email='admin1@example.com',
            password='StrongPass123!'
        )
        UserProfile.objects.create(user=self.admin, role='admin')

        self.alumni = User.objects.create_user(
            username='alumni1',
            email='alumni1@example.com',
            password='StrongPass123!'
        )
        UserProfile.objects.create(user=self.alumni, role='alumni')

        self.student = User.objects.create_user(
            username='student1',
            email='student1@example.com',
            password='StrongPass123!'
        )
        UserProfile.objects.create(user=self.student, role='student')

    def test_register_duplicate_email_rejected(self):
        response = self.client.post(
            '/api/v1/auth/register/',
            {
                'username': 'newuser1',
                'email': self.student.email,
                'password': 'StrongPass123!',
                'first_name': 'New',
                'last_name': 'User',
                'role': 'student',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get('status'), 'error')

    def test_student_can_apply_only_once_per_job(self):
        job = Job.objects.create(
            title='Backend Intern',
            company='Acme',
            location='Remote',
            job_type='internship',
            description='Great role',
            posted_by=self.alumni,
        )
        self._auth(self.student)
        first = self.client.post(
            '/api/v1/job-applications/',
            {'job': job.id, 'cover_letter': 'Interested'},
            format='json',
        )
        second = self.client.post(
            '/api/v1/job-applications/',
            {'job': job.id, 'cover_letter': 'Interested again'},
            format='json',
        )
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second.status_code, status.HTTP_400_BAD_REQUEST)

    def test_non_positive_donation_rejected(self):
        campaign = Campaign.objects.create(
            title='Scholarship Fund',
            story='Support students',
            goal=10000,
            campaign_type='donation',
            created_by=self.alumni,
        )
        self._auth(self.student)
        response = self.client.post(
            f'/api/v1/campaigns/{campaign.id}/donate/',
            {'amount': 0},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Donation.objects.count(), 0)

    def test_only_alumni_or_admin_can_create_campaign(self):
        self._auth(self.student)
        response = self.client.post(
            '/api/v1/campaigns/',
            {
                'title': 'Restricted Campaign',
                'story': 'Not allowed',
                'goal': 5000,
                'campaign_type': 'donation',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_exception_format_has_consistent_shape(self):
        self._auth(self.student)
        response = self.client.post(
            '/api/v1/campaigns/999999/donate/',
            {'amount': 100},
            format='json',
        )
        self.assertIn(response.status_code, (status.HTTP_404_NOT_FOUND, status.HTTP_400_BAD_REQUEST))
        self.assertIn('status', response.data)
        self.assertIn('code', response.data)
        self.assertIn('message', response.data)
