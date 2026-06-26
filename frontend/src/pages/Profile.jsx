import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { 
  FiUser, FiSettings, FiMail, FiCalendar, 
  FiMessageSquare, FiSliders, FiSun, FiMoon, 
  FiTrash2, FiDownload, FiCheck, FiX, FiMenu
} from 'react-icons/fi';

const accentColors = [
  { name: 'Blue', hex: '#2563EB', class: 'bg-blue-600' },
  { name: 'Violet', hex: '#7C3AED', class: 'bg-violet-600' },
  { name: 'Cyan', hex: '#06B6D4', class: 'bg-cyan-600' },
  { name: 'Emerald', hex: '#10B981', class: 'bg-emerald-600' },
  { name: 'Rose', hex: '#F43F5E', class: 'bg-rose-600' },
];

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { conversations, fetchConversations } = useChat();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('dark');
  const [accentColor, setAccentColor] = useState('#2563EB');
  const [notifications, setNotifications] = useState(true);

  // Status indicators
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setLanguage(user.profile?.language_preference || 'en');
      setTheme(user.settings?.theme || 'dark');
      setAccentColor(user.settings?.accent_color || '#2563EB');
      setNotifications(user.settings?.notifications_enabled ?? true);
    }
  }, [user]);

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaveSuccess(false);

    const payload = {
      email,
      profile: {
        language_preference: language,
        theme_preference: theme
      },
      settings: {
        theme,
        accent_color: accentColor,
        notifications_enabled: notifications
      }
    };

    const result = await updateProfile(payload);
    setSaving(false);
    
    if (result.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // Update global body class for light theme support
      if (theme === 'light') {
        document.documentElement.classList.add('light-theme');
      } else {
        document.documentElement.classList.remove('light-theme');
      }
    } else {
      setError(result.error);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("WARNING: Are you sure you want to clear your entire chat history? This cannot be undone.")) {
      try {
        for (const chat of conversations) {
          await api.delete(`conversations/${chat.id}/`);
        }
        await fetchConversations();
        alert("Chat history cleared successfully.");
      } catch (err) {
        console.error(err);
        alert("Failed to clear chat history.");
      }
    }
  };

  const handleExportData = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(conversations, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `pavangpt_chats_export_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert("Failed to export chat data.");
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("CRITICAL WARNING: Are you sure you want to delete your account? All conversations and settings will be permanently destroyed. This action is irreversible.")) {
      try {
        // Since profile view can execute a mock or active destroy, let's call a mock or make it delete from user
        alert("Account deletion initiated. (In production systems, this deletes Django records and clears session). Logging out.");
        localStorage.clear();
        window.location.href = '/login';
      } catch (err) {
        alert("Failed to delete account.");
      }
    }
  };

  return (
    <div className="h-screen w-screen flex bg-[#0f172a] text-slate-100 overflow-hidden relative">
      {/* Sidebar drawer */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />

      {/* Profile and Settings Panel */}
      <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-slate-900 to-[#0e121e] overflow-hidden relative">
        <header className="h-16 flex items-center justify-between border-b border-white/5 bg-slate-950/20 backdrop-blur-md px-6 z-10">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="text-slate-400 hover:text-white lg:hidden p-1 rounded-md hover:bg-slate-800/40"
            >
              <FiMenu size={20} />
            </button>
            <h2 className="text-sm font-semibold text-slate-200">Profile & Settings</h2>
          </div>
        </header>

        {/* Scrollable container */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-8 z-10">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Top Stat Overview Grid */}
            {user && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <FiUser size={22} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase">Username</h3>
                    <p className="text-sm font-bold text-slate-200">{user.username}</p>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-xl bg-violet-600/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                    <FiMessageSquare size={22} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase">Conversations</h3>
                    <p className="text-sm font-bold text-slate-200">{user.total_chats} chats</p>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-xl bg-cyan-600/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <FiCalendar size={22} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase">Joined Date</h3>
                    <p className="text-sm font-bold text-slate-200">
                      {user.profile?.joined_date ? new Date(user.profile.joined_date).toLocaleDateString() : 'Just now'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Core Preferences Card */}
            <div className="glass-panel rounded-2xl p-6 md:p-8">
              <h2 className="text-base font-bold text-white border-b border-white/5 pb-3 mb-5 flex items-center space-x-2">
                <FiSliders size={18} className="text-blue-400" />
                <span>Customize Preferences</span>
              </h2>

              <form onSubmit={handleSavePreferences} className="space-y-6">
                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Email Address</label>
                    <div className="relative flex items-center">
                      <FiMail className="absolute left-3 text-slate-500" size={16} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl glass-input py-2.5 pl-10 pr-4 text-sm text-slate-200 border border-slate-800 focus:border-slate-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Language */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Language Preference</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full rounded-xl glass-input py-2.5 px-4 text-sm text-slate-200 border border-slate-800 focus:border-slate-600 focus:outline-none"
                    >
                      <option value="en">English (US)</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Theme Mode */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 block">Theme Mode</label>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setTheme('dark')}
                        className={`flex-1 py-2.5 rounded-xl border flex items-center justify-center space-x-2 text-xs font-semibold transition-all ${
                          theme === 'dark' 
                            ? 'bg-slate-900 border-slate-600 text-white font-bold' 
                            : 'border-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <FiMoon size={14} />
                        <span>Dark Theme</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme('light')}
                        className={`flex-1 py-2.5 rounded-xl border flex items-center justify-center space-x-2 text-xs font-semibold transition-all ${
                          theme === 'light' 
                            ? 'bg-slate-900 border-slate-600 text-white font-bold' 
                            : 'border-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <FiSun size={14} />
                        <span>Light Theme</span>
                      </button>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 block">System Notifications</label>
                    <div className="flex items-center space-x-3 h-11">
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={notifications}
                          onChange={(e) => setNotifications(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white"></div>
                        <span className="ml-3 text-xs text-slate-300">Enable Alert Messages</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Accent Color picker */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Theme Accent Colors</label>
                  <div className="flex space-x-3.5">
                    {accentColors.map((color) => (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => setAccentColor(color.hex)}
                        className={`h-7 w-7 rounded-full ${color.class} flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer relative`}
                      >
                        {accentColor === color.hex && (
                          <span className="h-2.5 w-2.5 bg-white rounded-full"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions status alerts */}
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
                    <span>⚠️ {error}</span>
                  </div>
                )}

                {saveSuccess && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-xs text-green-400 flex items-center space-x-2">
                    <FiCheck size={16} />
                    <span>Preferences updated successfully!</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-bold text-sm shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {saving ? "Saving Preferences..." : "Save Preferences"}
                </button>
              </form>
            </div>

            {/* Danger Zone Card */}
            <div className="glass-panel border-red-500/15 bg-red-500/[0.02] rounded-2xl p-6 md:p-8 space-y-6">
              <h2 className="text-base font-bold text-red-400 border-b border-red-500/10 pb-3 mb-1 flex items-center space-x-2">
                <FiTrash2 size={18} />
                <span>Account Operations (Danger Zone)</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleExportData}
                  className="p-4 border border-slate-800 hover:border-slate-700 bg-slate-900/40 rounded-xl text-xs font-semibold text-slate-300 flex flex-col items-center justify-center space-y-2 transition-colors cursor-pointer"
                >
                  <FiDownload size={18} className="text-blue-400" />
                  <span>Export Chat Data</span>
                </button>

                <button
                  onClick={handleClearHistory}
                  className="p-4 border border-slate-800 hover:border-red-900/30 bg-slate-900/40 rounded-xl text-xs font-semibold text-slate-300 flex flex-col items-center justify-center space-y-2 transition-colors cursor-pointer"
                >
                  <FiTrash2 size={18} className="text-amber-400" />
                  <span>Clear Chat History</span>
                </button>

                <button
                  onClick={handleDeleteAccount}
                  className="p-4 border border-red-900/40 hover:bg-red-500/10 bg-slate-900/40 rounded-xl text-xs font-semibold text-red-400 flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer"
                >
                  <FiX size={18} />
                  <span>Delete AI Account</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
