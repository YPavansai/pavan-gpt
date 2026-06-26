from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
import os

from .models import UserProfile, Settings, Conversation, Message, UploadedDocument, Favorite
from .serializers import (
    RegisterSerializer, UserSerializer, UserProfileSerializer, 
    SettingsSerializer, ConversationSerializer, MessageSerializer, UploadedDocumentSerializer
)
from .services.gemini import GeminiService
from .services.parser import extract_text_from_file

# Registration View
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Generate JWT token pair immediately upon registration for seamless onboarding
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            user_data = UserSerializer(user).data
            return Response({
                "user": user_data,
                "refresh": str(refresh),
                "access": str(refresh.access_token)
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Profile & Settings View
class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        profile = user.profile
        settings = user.settings

        # Extract data
        username = request.data.get('username')
        email = request.data.get('email')
        
        # Profile preferences
        avatar_url = request.data.get('profile', {}).get('avatar_url')
        language_preference = request.data.get('profile', {}).get('language_preference')
        theme_preference = request.data.get('profile', {}).get('theme_preference')
        
        # Settings preferences
        theme = request.data.get('settings', {}).get('theme')
        accent_color = request.data.get('settings', {}).get('accent_color')
        notifications_enabled = request.data.get('settings', {}).get('notifications_enabled')

        # Update core User fields
        if username:
            user.username = username
        if email:
            # Check unique email
            if User.objects.exclude(id=user.id).filter(email=email).exists():
                return Response({"error": "Email is already in use."}, status=status.HTTP_400_BAD_REQUEST)
            user.email = email
        user.save()

        # Update Profile
        if avatar_url is not None:
            profile.avatar_url = avatar_url
        if language_preference is not None:
            profile.language_preference = language_preference
        if theme_preference is not None:
            profile.theme_preference = theme_preference
        profile.save()

        # Update Settings
        if theme is not None:
            settings.theme = theme
        if accent_color is not None:
            settings.accent_color = accent_color
        if notifications_enabled is not None:
            settings.notifications_enabled = notifications_enabled
        settings.save()

        serializer = UserSerializer(user)
        return Response(serializer.data)

# Conversations ViewSet
class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # Favorite action
    def update(self, request, *args, **kwargs):
        # Allow toggling favorite status or renaming
        conversation = self.get_object()
        
        # Renaming title
        title = request.data.get('title')
        if title:
            conversation.title = title
            
        # Toggling Favorite
        is_favorite = request.data.get('is_favorite')
        if is_favorite is not None:
            conversation.is_favorite = is_favorite
            if is_favorite:
                Favorite.objects.get_or_create(user=request.user, conversation=conversation)
            else:
                Favorite.objects.filter(user=request.user, conversation=conversation).delete()
                
        conversation.save()
        serializer = self.get_serializer(conversation)
        return Response(serializer.data)

# Message List View
class MessageListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, conversation_id):
        # Ensure user owns this conversation
        conversation = get_object_or_404(Conversation, id=conversation_id, user=request.user)
        messages = conversation.messages.all()
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

# Chat execution endpoint
class ChatAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        conversation_id = request.data.get('conversation_id')
        content = request.data.get('content')
        document_id = request.data.get('document_id') # Optional document context reference
        
        if not content or len(content.strip()) == 0:
            return Response({"error": "Content cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Fetch or create conversation
        if conversation_id:
            conversation = get_object_or_404(Conversation, id=conversation_id, user=request.user)
        else:
            # Generate a default title from prompt
            title = content[:30] + ("..." if len(content) > 30 else "")
            conversation = Conversation.objects.create(user=request.user, title=title)

        # 2. Add document context if provided
        document_context = ""
        if document_id:
            try:
                document = UploadedDocument.objects.get(id=document_id, user=request.user)
                document_context = f"Uploaded Document Name: {document.name}\nParsed Text Content:\n{document.parsed_text[:15000]}"
                # Connect document to this conversation if not already set
                if not document.conversation:
                    document.conversation = conversation
                    document.save()
            except UploadedDocument.DoesNotExist:
                pass

        # 3. Create User Message
        user_message = Message.objects.create(
            conversation=conversation,
            sender='user',
            content=content
        )

        # 4. Compile messages history
        messages_history = []
        for msg in conversation.messages.all():
            messages_history.append({
                "sender": msg.sender,
                "content": msg.content
            })

        # 5. Call Gemini Service
        try:
            ai_response_text = GeminiService.generate_chat_response(
                messages_list=messages_history,
                document_context=document_context
            )
        except Exception as e:
            # Clean up the user message if model call fails
            user_message.delete()
            return Response({"error": str(e)}, status=status.HTTP_502_BAD_GATEWAY)

        # 6. Save AI Response
        ai_message = Message.objects.create(
            conversation=conversation,
            sender='ai',
            content=ai_response_text
        )

        # 7. Update Conversation's updated_at timestamp to bubble up in history list
        conversation.save()

        return Response({
            "conversation_id": conversation.id,
            "conversation_title": conversation.title,
            "user_message": MessageSerializer(user_message).data,
            "ai_message": MessageSerializer(ai_message).data
        }, status=status.HTTP_200_OK)

# Document Upload View
class DocumentUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        file_obj = request.FILES.get('file')
        conversation_id = request.data.get('conversation_id')
        
        if not file_obj:
            return Response({"error": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file size (e.g. 10MB limit)
        if file_obj.size > 10 * 1024 * 1024:
            return Response({"error": "File exceeds the 10MB limit."}, status=status.HTTP_400_BAD_REQUEST)

        # Determine file type
        name = file_obj.name
        ext = os.path.splitext(name)[1].lower().strip('.')
        
        if ext not in ['pdf', 'docx', 'txt']:
            return Response({"error": "Unsupported file format. Please upload PDF, DOCX, or TXT."}, status=status.HTTP_400_BAD_REQUEST)

        # Get conversation if it exists
        conversation = None
        if conversation_id:
            try:
                conversation = Conversation.objects.get(id=conversation_id, user=request.user)
            except Conversation.DoesNotExist:
                pass

        # Save model instance to disk first to parse
        doc = UploadedDocument.objects.create(
            user=request.user,
            conversation=conversation,
            name=name,
            file=file_obj,
            file_type=ext
        )

        # Extract text content
        try:
            file_path = doc.file.path
            parsed_text = extract_text_from_file(file_path, ext)
            doc.parsed_text = parsed_text
            
            # Generate summary via Gemini
            summary = GeminiService.generate_summary(parsed_text)
            doc.summary = summary
            doc.save()
        except Exception as e:
            # Even if summarization fails, save raw parsed content
            doc.parsed_text = f"Parsing error occurred: {str(e)}"
            doc.summary = "Unable to summarize this document."
            doc.save()

        return Response(UploadedDocumentSerializer(doc).data, status=status.HTTP_201_CREATED)

# Bonus AI Tools view
class BonusToolsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        tool_type = request.data.get('tool_type')
        user_input = request.data.get('user_input')
        document_id = request.data.get('document_id') # Option for resume analysis, study planning references
        
        if not tool_type or not user_input:
            return Response({"error": "tool_type and user_input are required fields."}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch optional resume text
        resume_text = None
        if document_id:
            try:
                doc = UploadedDocument.objects.get(id=document_id, user=request.user)
                resume_text = doc.parsed_text
            except UploadedDocument.DoesNotExist:
                pass

        try:
            ai_response = GeminiService.run_bonus_tool(
                tool_type=tool_type, 
                user_input=user_input, 
                resume_text=resume_text
            )
            return Response({"response": ai_response}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Logout View
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                from rest_framework_simplejwt.tokens import RefreshToken
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": "Successfully logged out (session cleared)."}, status=status.HTTP_200_OK)

