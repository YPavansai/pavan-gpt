import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Markdown from '../components/Markdown';
import { BackendErrorDashboard } from '../components/ThreeDEffects';
import { 
  FiSend, FiPaperclip, FiMic, FiMicOff, 
  FiVolume2, FiVolumeX, FiCornerDownLeft, FiRefreshCw,
  FiMenu, FiThumbsUp, FiThumbsDown, FiFolder, FiX, 
  FiFileText, FiCpu, FiCompass, FiTerminal, FiTrendingUp
} from 'react-icons/fi';

const Chat = () => {
  const { 
    messages, 
    activeConversationId, 
    sendMessage, 
    generatingResponse, 
    uploadDocument, 
    activeDocument, 
    setActiveDocument,
    loadingMessages,
    conversations,
    toggleFavoriteConversation
  } = useChat();
  const { user } = useAuth();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  
  // Custom toast error messages
  const [toastMessage, setToastMessage] = useState('');
  
  // Likes/Dislikes local map for UX interaction
  const [reactions, setReactions] = useState({});
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, generatingResponse]);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => prev + (prev ? ' ' : '') + transcript);
      };

      rec.onerror = (e) => {
        console.error("Speech recognition error:", e);
        showToast("Speech recognition error. Please check mic permissions.");
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      showToast("Speech Recognition is not supported in this browser. Try Chrome/Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSpeak = (messageId, text) => {
    if (speakingId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any other speech
    
    // Stripping markdown syntax for cleaner voice reading
    const cleanText = text.replace(/[\*`#_\[\]\(\)]/g, '').replace(/```[\s\S]*?```/g, '[code block omitted]');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => {
      setSpeakingId(null);
    };
    utterance.onerror = () => {
      setSpeakingId(null);
    };
    
    setSpeakingId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText;
    setInputText('');
    await sendMessage(text);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const result = await uploadDocument(file);
    setUploading(false);
    
    if (!result.success) {
      showToast(result.error);
    }
    
    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleReaction = (msgId, type) => {
    setReactions(prev => ({
      ...prev,
      [msgId]: prev[msgId] === type ? null : type // Toggle
    }));
  };

  const handleRegenerate = async (messageText) => {
    if (generatingResponse) return;
    await sendMessage(`Regenerate this answer: ${messageText}`);
  };

  // Find active chat details
  const activeChat = conversations.find(c => c.id === activeConversationId);

  // Suggestions for empty state
  const suggestions = [
    { title: "AI Career Paths", prompt: "Explain typical career paths in artificial intelligence.", icon: <FiTrendingUp className="text-blue-400" /> },
    { title: "Study Planner", prompt: "Create a 4-week study plan to master Python data science libraries.", icon: <FiCompass className="text-violet-400" /> },
    { title: "Debug Python Code", prompt: "Debug this Python function: \n```python\ndef sum_list(items):\n  for i in items:\n  sum += i\n  return sum\n```", icon: <FiTerminal className="text-cyan-400" /> },
  ];

  return (
    <div className="h-screen w-screen flex bg-[#0f172a] text-slate-100 overflow-hidden relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 glass-panel border-red-500/30 rounded-xl px-5 py-3 shadow-2xl flex items-center space-x-2 text-sm text-red-400 animate-bounce">
          <span>⚠️ {toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="text-slate-400 hover:text-white pl-2">
            <FiX size={14} />
          </button>
        </div>
      )}

      {/* Left Sidebar Drawer */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />

      {/* Main chat viewport */}
      <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-slate-900 to-[#0e121e] relative overflow-hidden">
        {/* Glowing aura background details */}
        <div className="absolute top-0 right-1/4 h-[300px] w-[500px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 h-[300px] w-[500px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none"></div>

        {/* Header */}
        <header className="h-16 flex items-center justify-between border-b border-white/5 bg-slate-950/20 backdrop-blur-md px-6 z-10">
          <div className="flex items-center space-x-4 overflow-hidden">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="text-slate-400 hover:text-white lg:hidden p-1 rounded-md hover:bg-slate-800/40"
            >
              <FiMenu size={20} />
            </button>
            <div className="truncate">
              <h2 className="text-sm font-semibold truncate text-slate-200">
                {activeChat ? activeChat.title : "Pavan-GPT Workspace"}
              </h2>
              <p className="text-[10px] text-slate-500">
                {activeChat ? `Active Chat` : `Your Intelligent AI assistant`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {activeChat ? (
              <button 
                onClick={() => toggleFavoriteConversation(activeChat.id, !activeChat.is_favorite)}
                className="text-xs font-semibold px-3 py-1 rounded-md border border-slate-700/50 bg-slate-900/40 hover:bg-slate-800 hover:text-white flex items-center space-x-1"
              >
                <span className={activeChat.is_favorite ? 'text-yellow-400' : 'text-slate-400'}>★</span>
                <span>{activeChat.is_favorite ? 'Favorited' : 'Favorite'}</span>
              </button>
            ) : (
              <button 
                onClick={() => setShowDiagnostics(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-md border border-slate-700/50 bg-slate-900/40 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center space-x-1"
              >
                <span>⚙ Diagnostics</span>
              </button>
            )}
          </div>
        </header>

        {/* Messages Pane */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 z-10">
          {loadingMessages ? (
            <div className="h-full w-full flex flex-col items-center justify-center space-y-3">
              <div className="h-8 w-8 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin"></div>
              <p className="text-xs text-slate-500 font-medium">Retrieving conversation records...</p>
            </div>
          ) : messages.length === 0 ? (
            /* Empty Landing State */
            <div className="max-w-3xl mx-auto h-full flex flex-col justify-center space-y-12 py-10">
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                  Pavan-GPT
                </h1>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Ask code debugging help, upload documents to extract summaries, map study guides, or request AI career advice.
                </p>
              </div>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suggestions.map((s, index) => (
                  <div 
                    key={index}
                    onClick={() => setInputText(s.prompt)}
                    className="p-5 rounded-2xl glass-panel text-left cursor-pointer hover:border-slate-600/50 transition-all hover:translate-y-[-2px]"
                  >
                    <div className="h-8 w-8 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-3">
                      {s.icon}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-200 mb-1">{s.title}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{s.prompt}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Conversation Messages */
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                const hasReacted = reactions[msg.id];
                const isSystemError = !isUser && (msg.content.includes('System Error') || msg.content.includes('service is currently unavailable') || msg.content.includes('offline') || msg.content.includes('API key appears to be a Google Cloud Vertex AI key'));
                
                return (
                  <div 
                    key={msg.id}
                    className={`flex flex-col space-y-2 ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    {/* Username/AI Name and Timestamp */}
                    <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-semibold px-2">
                      <span>{isUser ? (user?.username || 'You') : 'Pavan-GPT'}</span>
                      <span>•</span>
                      <span>
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                      </span>
                    </div>

                    <div className="flex items-start space-x-2 max-w-full group">
                      {/* Avatar */}
                      {!isUser && (
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center font-bold text-white text-xs shadow-md shrink-0">
                          P
                        </div>
                      )}

                      {/* Content Bubble */}
                      <div className={`rounded-2xl px-5 py-3.5 shadow-md border ${
                        isUser 
                          ? 'bg-blue-600/10 border-blue-500/20 text-slate-100 max-w-[85%]' 
                          : 'bg-slate-900/60 border-white/5 text-slate-200 max-w-[85%]'
                      }`}>
                        {isSystemError ? (
                          <div className="space-y-4">
                            <Markdown content={msg.content} />
                            <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-xl space-y-2">
                              <span className="text-xs text-red-400 font-bold block">⚙ Diagnostics Panel Available</span>
                              <p className="text-[11px] text-slate-400 leading-relaxed">
                                Pavan-GPT has caught a backend communication disruption. Open the interactive troubleshooting panel to configure your server.
                              </p>
                              <button 
                                onClick={() => setShowDiagnostics(true)}
                                className="w-full py-2 bg-red-650 hover:bg-red-600 text-white rounded-lg font-bold text-xs shadow transition-colors border-0 cursor-pointer"
                              >
                                Launch diagnostics & Admin settings
                              </button>
                            </div>
                          </div>
                        ) : (
                          <Markdown content={msg.content} />
                        )}
                        
                        {/* Audio and Feedback Buttons for AI */}
                        {!isUser && !isSystemError && (
                          <div className="flex items-center space-x-3.5 mt-3 pt-2.5 border-t border-white/5 text-slate-500 text-[11px]">
                            {/* Speech Synthesis */}
                            <button
                              onClick={() => handleSpeak(msg.id, msg.content)}
                              className={`flex items-center space-x-1 hover:text-white transition-colors ${
                                speakingId === msg.id ? 'text-cyan-400 hover:text-cyan-300' : ''
                              }`}
                            >
                              {speakingId === msg.id ? <FiVolumeX size={13} /> : <FiVolume2 size={13} />}
                              <span>{speakingId === msg.id ? 'Stop Voice' : 'Read Aloud'}</span>
                            </button>

                            {/* Likes */}
                            <button
                              onClick={() => handleReaction(msg.id, 'like')}
                              className={`hover:text-green-400 transition-colors ${hasReacted === 'like' ? 'text-green-400' : ''}`}
                            >
                              <FiThumbsUp size={12} />
                            </button>
                            <button
                              onClick={() => handleReaction(msg.id, 'dislike')}
                              className={`hover:text-red-400 transition-colors ${hasReacted === 'dislike' ? 'text-red-400' : ''}`}
                            >
                              <FiThumbsDown size={12} />
                            </button>
                            
                            {/* Regenerate prompt shortcut */}
                            <button
                              onClick={() => handleRegenerate(messages.find(m => m.id === msg.id - 1)?.content || msg.content)}
                              className="flex items-center space-x-1 hover:text-white transition-colors ml-auto opacity-0 group-hover:opacity-100 duration-200"
                            >
                              <FiRefreshCw size={11} />
                              <span>Regenerate</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <div className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs shrink-0 select-none">
                          {user?.username ? user.username[0].toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Streaming typing indicator */}
              {generatingResponse && (
                <div className="flex flex-col space-y-2 items-start">
                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-semibold px-2">
                    <span>Pavan-GPT</span>
                    <span>•</span>
                    <span>Typing...</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center font-bold text-white text-xs shadow-md shrink-0">
                      P
                    </div>
                    <div className="rounded-2xl px-5 py-4 bg-slate-900/60 border border-white/5 flex items-center space-x-1.5 min-w-[70px]">
                      <div className="h-2 w-2 rounded-full bg-slate-400 typing-dot"></div>
                      <div className="h-2 w-2 rounded-full bg-slate-400 typing-dot"></div>
                      <div className="h-2 w-2 rounded-full bg-slate-400 typing-dot"></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input tray */}
        <div className="p-4 md:p-6 border-t border-white/5 bg-slate-950/20 backdrop-blur-md z-10">
          <div className="max-w-3xl mx-auto space-y-3">
            {/* Display active document context attached */}
            {activeDocument && (
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs">
                <div className="flex items-center space-x-2">
                  <FiFileText className="text-cyan-400" size={16} />
                  <div>
                    <span className="font-semibold text-slate-200 max-w-[200px] truncate block">{activeDocument.name}</span>
                    <span className="text-[10px] text-slate-500 block uppercase">Context Bound</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveDocument(null)}
                  className="p-1 rounded-md text-slate-500 hover:bg-slate-800 hover:text-white"
                >
                  <FiX size={14} />
                </button>
              </div>
            )}

            {/* Input Form container */}
            <form onSubmit={handleSend} className="relative flex items-end bg-[#0f1423] border border-slate-800 rounded-2xl p-2.5 focus-within:border-slate-600 transition-colors">
              {/* File Upload Trigger */}
              <button
                type="button"
                onClick={handleTriggerFileInput}
                disabled={uploading}
                className="p-3 text-slate-500 hover:text-slate-300 rounded-xl hover:bg-slate-900/50 transition-colors shrink-0 disabled:opacity-50"
              >
                {uploading ? (
                  <div className="h-4 w-4 rounded-full border border-slate-500 border-t-white animate-spin"></div>
                ) : (
                  <FiPaperclip size={18} />
                )}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt"
                className="hidden"
              />

              {/* Message field */}
              <textarea
                rows={1}
                placeholder="Ask Pavan-GPT a question or type '/'..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                className="flex-1 max-h-32 min-h-[44px] bg-transparent text-sm text-slate-200 focus:outline-none placeholder-slate-600 px-3 py-2.5 resize-none overflow-y-auto"
              />

              {/* Dictation Microphone */}
              <button
                type="button"
                onClick={handleToggleListening}
                className={`p-3 rounded-xl transition-colors shrink-0 ${
                  isListening 
                    ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
                }`}
              >
                {isListening ? <FiMicOff size={18} /> : <FiMic size={18} />}
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={generatingResponse || !inputText.trim()}
                className="p-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl shadow-md transition-all hover:scale-[1.03] active:scale-[0.98] shrink-0 disabled:opacity-30 disabled:pointer-events-none"
              >
                <FiSend size={16} />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-slate-600 px-2">
              <span>Supports PDF, DOCX, TXT uploads up to 10MB</span>
              <span>Press Shift + Enter for new line</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Diagnostics Console Dashboard Modal */}
      <BackendErrorDashboard 
        isOpen={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
      />
    </div>
  );
};

export default Chat;
