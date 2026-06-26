import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiPlus, FiMessageSquare, FiStar, FiCpu, 
  FiUser, FiSettings, FiLogOut, FiTrash2, 
  FiCheck, FiX, FiSearch, FiEdit2, FiFolder
} from 'react-icons/fi';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { 
    conversations, 
    activeConversationId, 
    selectConversation, 
    createConversation, 
    deleteConversation, 
    renameConversation, 
    toggleFavoriteConversation 
  } = useChat();
  const { logout, user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartRename = (e, c) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const handleSaveRename = async (e, id) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      await renameConversation(id, editTitle);
    }
    setEditingId(null);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      await deleteConversation(id);
    }
  };

  const handleToggleFavorite = async (e, c) => {
    e.stopPropagation();
    await toggleFavoriteConversation(c.id, !c.is_favorite);
  };

  const handleNewChat = async () => {
    await createConversation();
    if (window.innerWidth < 1024) {
      toggleSidebar(); // Close sidebar on mobile
    }
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-800 bg-[#0b0f19] text-slate-300 transition-transform duration-300 lg:static lg:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
        <Link to="/" className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 text-white font-bold shadow-lg">
            P
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Pavan-GPT</h1>
            <p className="text-[10px] text-slate-500">AI Intelligent Assistant</p>
          </div>
        </Link>
        <button className="text-slate-400 hover:text-white lg:hidden" onClick={toggleSidebar}>
          <FiX size={20} />
        </button>
      </div>

      {/* Action: New Chat */}
      <div className="px-4 py-3">
        <button
          onClick={handleNewChat}
          className="flex w-full items-center justify-center space-x-2 rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-800 hover:border-slate-600 shadow-md"
        >
          <FiPlus size={16} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-2">
        <div className="relative flex items-center">
          <FiSearch className="absolute left-3 text-slate-500" size={14} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg bg-slate-900/40 py-1.5 pl-9 pr-4 text-xs text-slate-300 border border-slate-800/80 focus:border-slate-700 focus:outline-none placeholder-slate-600"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        <div className="px-3 mb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Chat History
        </div>
        {filteredConversations.length === 0 ? (
          <div className="px-3 py-4 text-xs text-slate-600 italic">No chats found.</div>
        ) : (
          filteredConversations.map((chat) => {
            const isActive = activeConversationId === chat.id;
            const isEditing = editingId === chat.id;

            return (
              <div
                key={chat.id}
                onClick={() => {
                  selectConversation(chat.id);
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-slate-800/85 text-white border-l-2 border-blue-500' 
                    : 'hover:bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2.5 overflow-hidden flex-1">
                  <FiMessageSquare size={14} className={isActive ? 'text-blue-400' : 'text-slate-500'} />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(e, chat.id);
                        if (e.key === 'Escape') handleCancelRename(e);
                      }}
                      className="w-full bg-slate-900 text-white text-xs px-2 py-0.5 rounded border border-blue-500 focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <span className="truncate text-xs">{chat.title}</span>
                  )}
                </div>

                {/* Operations */}
                {!isEditing && (
                  <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleToggleFavorite(e, chat)}
                      className="text-slate-500 hover:text-yellow-400"
                    >
                      <FiStar size={12} className={chat.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''} />
                    </button>
                    <button
                      onClick={(e) => handleStartRename(e, chat)}
                      className="text-slate-500 hover:text-white"
                    >
                      <FiEdit2 size={12} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, chat.id)}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                )}

                {isEditing && (
                  <div className="flex items-center space-x-1">
                    <button onClick={(e) => handleSaveRename(e, chat.id)} className="text-green-400 hover:text-green-300">
                      <FiCheck size={12} />
                    </button>
                    <button onClick={handleCancelRename} className="text-red-400 hover:text-red-300">
                      <FiX size={12} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-slate-800 bg-[#080c14] p-3 space-y-1.5">
        <Link
          to="/tools"
          className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            location.pathname === '/tools' ? 'bg-slate-800 text-white' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <FiCpu size={16} className="text-violet-400" />
          <span>AI Bonus Tools</span>
        </Link>
        <Link
          to="/profile"
          className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            location.pathname === '/profile' ? 'bg-slate-800 text-white' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <FiUser size={16} className="text-blue-400" />
          <span>Profile & Stats</span>
        </Link>
        
        {/* User preview */}
        {user && (
          <div className="flex items-center space-x-2.5 px-3 py-2 rounded-lg bg-slate-900/30">
            <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
              {user.username[0].toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold truncate text-slate-200">{user.username}</p>
              <p className="text-[10px] truncate text-slate-500">{user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
        >
          <FiLogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
