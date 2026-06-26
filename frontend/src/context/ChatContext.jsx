import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [activeDocument, setActiveDocument] = useState(null);

  // Fetch all conversations for the authenticated user
  const fetchConversations = async () => {
    if (!user) return;
    setLoadingConversations(true);
    try {
      const response = await api.get('conversations/');
      setConversations(response.data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    } else {
      setConversations([]);
      setActiveConversationId(null);
      setMessages([]);
      setActiveDocument(null);
    }
  }, [user]);

  // Load messages whenever active conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversationId) {
        setMessages([]);
        return;
      }
      setLoadingMessages(true);
      try {
        const response = await api.get(`messages/${activeConversationId}/`);
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [activeConversationId]);

  const selectConversation = (id) => {
    setActiveConversationId(id);
    setActiveDocument(null);
  };

  const createConversation = async (title = "New Chat") => {
    try {
      const response = await api.post('conversations/', { title });
      setConversations((prev) => [response.data, ...prev]);
      setActiveConversationId(response.data.id);
      return response.data;
    } catch (error) {
      console.error("Error creating conversation:", error);
      return null;
    }
  };

  const deleteConversation = async (id) => {
    try {
      await api.delete(`conversations/${id}/`);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const renameConversation = async (id, newTitle) => {
    try {
      const response = await api.put(`conversations/${id}/`, { title: newTitle });
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? response.data : c))
      );
    } catch (error) {
      console.error("Error renaming conversation:", error);
    }
  };

  const toggleFavoriteConversation = async (id, isFavorite) => {
    try {
      const response = await api.put(`conversations/${id}/`, { is_favorite: isFavorite });
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? response.data : c))
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const sendMessage = async (content) => {
    if (!content.trim()) return;
    
    // Create optimistic user message if conversation exists, or handle creation
    let currentConversationId = activeConversationId;
    
    // We create an optimistic message state in frontend for instant feedback
    const tempUserMsg = {
      id: Date.now(),
      sender: 'user',
      content: content,
      timestamp: new Date().toISOString()
    };
    
    setMessages((prev) => [...prev, tempUserMsg]);
    setGeneratingResponse(true);

    try {
      const payload = {
        content,
        conversation_id: currentConversationId,
        document_id: activeDocument?.id || undefined
      };

      const response = await api.post('chat/', payload);
      
      const { conversation_id, ai_message, user_message } = response.data;

      // Sync user message from database (replaces the temp one) and append AI response
      setMessages((prev) => {
        // filter out the temporary message and add proper model messages
        const filtered = prev.filter(m => m.id !== tempUserMsg.id);
        return [...filtered, user_message, ai_message];
      });

      if (!currentConversationId) {
        setActiveConversationId(conversation_id);
        await fetchConversations();
      } else {
        // Refresh conversations to bubble up the active one and update message count
        setConversations(prev => {
          const updated = prev.map(c => {
            if (c.id === conversation_id) {
              return { ...c, message_count: c.message_count + 2, updated_at: new Date().toISOString() };
            }
            return c;
          });
          // Sort conversations by updated_at
          return [...updated].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        });
      }
      
      // Clear attached document after sending message
      setActiveDocument(null);
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove optimistic message on error and show error notification message
      setMessages((prev) => prev.filter(m => m.id !== tempUserMsg.id));
      const errMsg = error.response?.data?.error || "AI service is currently unavailable. Please verify API key.";
      
      // Inject AI error message
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        content: `⚠️ **System Error:** ${errMsg}`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setGeneratingResponse(false);
    }
  };

  const uploadDocument = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    if (activeConversationId) {
      formData.append('conversation_id', activeConversationId);
    }
    
    try {
      const response = await api.post('documents/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setActiveDocument(response.data);
      return { success: true, doc: response.data };
    } catch (error) {
      console.error("Error uploading document:", error);
      const errorMsg = error.response?.data?.error || "File upload failed. Max 10MB PDF/DOCX/TXT supported.";
      return { success: false, error: errorMsg };
    }
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversationId,
      messages,
      loadingConversations,
      loadingMessages,
      generatingResponse,
      activeDocument,
      setActiveDocument,
      selectConversation,
      createConversation,
      deleteConversation,
      renameConversation,
      toggleFavoriteConversation,
      sendMessage,
      uploadDocument,
      fetchConversations,
      setMessages
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
