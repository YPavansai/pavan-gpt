from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar_url = models.TextField(blank=True, null=True, default="")
    language_preference = models.CharField(max_length=20, default='en')
    theme_preference = models.CharField(max_length=10, default='dark')
    joined_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

class Settings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')
    theme = models.CharField(max_length=10, default='dark')
    accent_color = models.CharField(max_length=20, default='#2563EB')
    notifications_enabled = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username}'s Settings"

class Conversation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations')
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_favorite = models.BooleanField(default=False)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return self.title

class Message(models.Model):
    SENDER_CHOICES = (
        ('user', 'User'),
        ('ai', 'AI'),
    )
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.sender}: {self.content[:30]}..."

class UploadedDocument(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    conversation = models.ForeignKey(Conversation, on_delete=models.SET_NULL, null=True, blank=True, related_name='documents')
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='uploaded_documents/', blank=True, null=True)
    file_type = models.CharField(max_length=10) # pdf, docx, txt
    summary = models.TextField(blank=True, default="")
    parsed_text = models.TextField(blank=True, default="")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='favorited_relation')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'conversation')

    def __str__(self):
        return f"{self.user.username} favorited {self.conversation.title}"

# Signals to create Profile and Settings automatically
@receiver(post_save, sender=User)
def create_user_profile_and_settings(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
        Settings.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile_and_settings(sender, instance, **kwargs):
    instance.profile.save()
    instance.settings.save()
