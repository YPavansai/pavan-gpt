from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, LogoutView, UserProfileView, ConversationViewSet, 
    MessageListView, ChatAPIView, DocumentUploadView, BonusToolsView,
    DiagnosticsView
)

urlpatterns = [
    # Auth
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    
    # Conversations
    path('conversations/', ConversationViewSet.as_view({
        'get': 'list', 
        'post': 'create'
    }), name='conversations'),
    path('conversations/<int:pk>/', ConversationViewSet.as_view({
        'put': 'update', 
        'delete': 'destroy'
    }), name='conversation_detail'),
    
    # Messages
    path('messages/<int:conversation_id>/', MessageListView.as_view(), name='messages'),
    
    # Core AI Features
    path('chat/', ChatAPIView.as_view(), name='chat'),
    path('documents/upload/', DocumentUploadView.as_view(), name='document_upload'),
    path('bonus/', BonusToolsView.as_view(), name='bonus_tools'),
    
    # System Diagnostics
    path('diagnostics/', DiagnosticsView.as_view(), name='diagnostics'),
]
