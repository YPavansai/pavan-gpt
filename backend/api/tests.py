from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
# pyrefly: ignore [missing-import]
from rest_framework import status
# pyrefly: ignore [missing-import]
from rest_framework.test import APITestCase

from .models import UserProfile, Settings, Conversation

class UserAuthAndProfileTests(APITestCase):
    def test_user_registration_creates_profile_and_settings(self):
        """
        Registering a user should automatically provision a UserProfile 
        and Settings record via database post_save signals.
        """
        url = reverse('register')
        data = {
            "username": "tester",
            "email": "tester@example.com",
            "password": "testpassword123",
            "confirm_password": "testpassword123"
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        
        # Check database records
        user_exists = User.objects.filter(username="tester").exists()
        self.assertTrue(user_exists)
        
        user = User.objects.get(username="tester")
        self.assertTrue(UserProfile.objects.filter(user=user).exists())
        self.assertTrue(Settings.objects.filter(user=user).exists())
        
        # Default theme check
        self.assertEqual(user.settings.theme, 'dark')

    def test_user_login_retrieves_jwt_tokens(self):
        """
        Submitting valid credentials to the login route returns access & refresh tokens.
        """
        User.objects.create_user(username="login_test", email="test@ex.com", password="password123")
        
        url = reverse('login')
        data = {
            "username": "login_test",
            "password": "password123"
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)


class ConversationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="converser", email="conv@ex.com", password="password123")
        # Authenticate requests using DRF client force_authenticate
        self.client.force_authenticate(user=self.user)

    def test_create_conversation(self):
        """
        Creating a conversation generates a record in the database for the authenticated user.
        """
        url = reverse('conversations')
        data = {"title": "Exploring Machine Learning"}
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Conversation.objects.count(), 1)
        
        conversation = Conversation.objects.first()
        self.assertEqual(conversation.title, "Exploring Machine Learning")
        self.assertEqual(conversation.user, self.user)


class SystemDiagnosticsTests(APITestCase):
    def test_diagnostics_retrieval(self):
        """
        Retrieving system diagnostics settings should return server config parameters without authentication.
        """
        url = reverse('diagnostics')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('backend_online', response.data)
        self.assertIn('gemini_api_key_configured', response.data)
        self.assertIn('use_mock_fallback', response.data)
