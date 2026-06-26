import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiRefreshCw, FiCopy, FiCheck, FiCpu, FiAlertTriangle, FiArrowRight } from 'react-icons/fi';
import api from '../services/api';
import axios from 'axios';

// 1. 3D Tilt Card Component
export function ThreeDCard({ children, className = '', intensity = 15 }) {
  const cardRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [glowStyle, setGlowStyle] = useState({ opacity: 0, left: '0px', top: '0px' });

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // mouse x relative to card
    const y = e.clientY - rect.top; // mouse y relative to card
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation angles based on intensity
    const rotateX = ((centerY - y) / centerY) * intensity;
    const rotateY = ((x - centerX) / centerX) * intensity;
    
    setTransformStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    setGlowStyle({
      opacity: 1,
      left: `${x}px`,
      top: `${y}px`,
    });
  };

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlowStyle(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: 'transform 0.1s ease-out, box-shadow 0.1s ease-out',
        transformStyle: 'preserve-3d',
      }}
      className={`relative overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* 3D Reflection/Glow layer */}
      <div
        style={{
          left: glowStyle.left,
          top: glowStyle.top,
          transform: 'translate(-50%, -50%)',
          opacity: glowStyle.opacity,
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
          transition: 'opacity 0.3s ease',
        }}
        className="absolute pointer-events-none w-72 h-72 rounded-full z-10"
      />
      {children}
    </div>
  );
}

// 2. 3D Tactile Button Component
export function ThreeDButton({ children, onClick, className = '', disabled = false, color = 'blue' }) {
  // Determine button color styles
  const getColorStyles = () => {
    switch (color) {
      case 'purple':
        return {
          shadow: 'bg-purple-800',
          face: 'bg-purple-600 border-purple-500 hover:bg-purple-500',
        };
      case 'cyan':
        return {
          shadow: 'bg-cyan-800',
          face: 'bg-cyan-600 border-cyan-500 hover:bg-cyan-500',
        };
      case 'red':
        return {
          shadow: 'bg-red-800',
          face: 'bg-red-600 border-red-500 hover:bg-red-500',
        };
      case 'blue':
      default:
        return {
          shadow: 'bg-blue-800',
          face: 'bg-blue-600 border-blue-500 hover:bg-blue-500',
        };
    }
  };

  const style = getColorStyles();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type="button"
      className={`relative active:translate-y-[2px] transition-all group ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {/* 3D Depth Shadow */}
      <span className={`absolute inset-0 w-full h-full rounded-xl ${style.shadow} translate-y-[3px] select-none pointer-events-none group-active:translate-y-0 transition-transform`}></span>
      
      {/* Top Interactive Layer */}
      <span className={`relative block w-full h-full px-6 py-3 rounded-xl text-white font-bold border ${style.face} -translate-y-[3px] group-active:translate-y-0 transition-transform flex items-center justify-center space-x-2`}>
        {children}
      </span>
    </button>
  );
}

// 3. 3D Spherical Pointer Follower (Disabled by request)
export function ThreeDCursor() {
  return null;
}

// 4. Background cursor glow spotlight
export function CursorGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
      className="fixed pointer-events-none w-[600px] h-[600px] rounded-full bg-blue-500/5 dark:bg-blue-500/2.5 blur-[120px] z-0 transition-opacity duration-500"
    />
  );
}

// 5. Interactive Backend Error Diagnostics Console
export function BackendErrorDashboard({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('status'); // 'status', 'config', 'admin'
  const [copiedCmd, setCopiedCmd] = useState('');
  
  // Status State
  const [serverStatus, setServerStatus] = useState('checking'); // 'online', 'offline', 'checking'
  const [configInfo, setConfigInfo] = useState(null);
  const [pingResult, setPingResult] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Key Test State
  const [testKey, setTestKey] = useState('');
  const [testModel, setTestModel] = useState('gemini-2.5-flash');
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: true/false, message/error }

  // Settings State
  const [newKey, setNewKey] = useState('');
  const [newModel, setNewModel] = useState('gemini-2.5-flash');
  const [newMockMode, setNewMockMode] = useState(false);
  const [updatingConfig, setUpdatingConfig] = useState(false);
  const [configMessage, setConfigMessage] = useState(null);

  // Database Reset State
  const [clearingDb, setClearingDb] = useState(false);
  const [dbMessage, setDbMessage] = useState(null);

  const fetchStatus = async () => {
    setLoadingStatus(true);
    setPingResult(null);
    try {
      // Fetch settings from our new diagnostics endpoint
      const res = await axios.get('http://localhost:8000/api/diagnostics/');
      setServerStatus('online');
      setConfigInfo(res.data);
      setNewModel(res.data.gemini_model);
      setNewMockMode(res.data.use_mock_fallback);
      setPingResult('success');
    } catch (e) {
      setServerStatus('offline');
      setPingResult('failed');
      setConfigInfo(null);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(type);
    setTimeout(() => setCopiedCmd(''), 2000);
  };

  const handleTestKey = async () => {
    if (!testKey) return;
    setTestingKey(true);
    setTestResult(null);
    try {
      const res = await axios.post('http://localhost:8000/api/diagnostics/', {
        action: 'test_key',
        gemini_api_key: testKey,
        gemini_model: testModel
      });
      setTestResult({ success: true, message: res.data.message });
    } catch (e) {
      const errorMsg = e.response?.data?.error || e.message || 'Key validation failed';
      setTestResult({ success: false, error: errorMsg });
    } finally {
      setTestingKey(false);
    }
  };

  const handleSaveConfig = async () => {
    setUpdatingConfig(true);
    setConfigMessage(null);
    try {
      const payload = {
        action: 'update_config',
        gemini_model: newModel,
        use_mock_fallback: newMockMode
      };
      if (newKey) {
        payload.gemini_api_key = newKey;
      }
      
      const res = await axios.post('http://localhost:8000/api/diagnostics/', payload);
      setConfigMessage({ success: true, text: res.data.message });
      // Reset password field
      setNewKey('');
      // Reload status
      fetchStatus();
    } catch (e) {
      const errorMsg = e.response?.data?.error || e.message || 'Config update failed';
      setConfigMessage({ success: false, text: errorMsg });
    } finally {
      setUpdatingConfig(false);
    }
  };

  const handleClearDb = async () => {
    if (!window.confirm('WARNING: Are you sure you want to delete all conversations, messages, and uploaded files? This action cannot be undone.')) {
      return;
    }
    setClearingDb(true);
    setDbMessage(null);
    try {
      const res = await axios.post('http://localhost:8000/api/diagnostics/', {
        action: 'clear_database'
      });
      setDbMessage({ success: true, text: res.data.message });
    } catch (e) {
      const errorMsg = e.response?.data?.error || e.message || 'Failed to clear database';
      setDbMessage({ success: false, text: errorMsg });
    } finally {
      setClearingDb(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md text-slate-350">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl rounded-3xl overflow-hidden glass-panel border border-red-500/30 dark:border-red-500/20 shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Terminal Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
            </div>
            <span className="text-xs font-mono text-slate-400">django-backend-diagnostic.sh</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-900/50 border-b border-white/5 px-6 pt-2">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'status' 
                ? 'border-red-500 text-white' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🔌 Uptime & Status
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'config' 
                ? 'border-red-500 text-white' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚙️ API & Mock Config
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'admin' 
                ? 'border-red-500 text-white' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🛠️ Admin & DB Reset
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto font-sans text-slate-300 text-sm">
          {activeTab === 'status' && (
            <div className="space-y-5">
              {/* Uptime Callout */}
              <div className={`flex items-start space-x-4 p-5 rounded-2xl border ${
                serverStatus === 'online' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                <div className={`p-3 rounded-xl shrink-0 ${
                  serverStatus === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-500'
                }`}>
                  <FiAlertTriangle className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-white text-base">
                    {serverStatus === 'online' ? 'Django Service Online' : 'Django Service Offline'}
                  </h4>
                  <p className="leading-relaxed text-xs text-slate-300">
                    {serverStatus === 'online' 
                      ? 'Handshake connection successful. The Django webserver is running locally on port 8000 and answering API calls.' 
                      : 'The frontend React client was unable to establish a handshake connection with the Django server at http://localhost:8000/api/.'}
                  </p>
                </div>
              </div>

              {/* Status details card */}
              {serverStatus === 'online' && configInfo && (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-3">
                  <h5 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">Current Server Details</h5>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Gemini Key configured:</span>
                      <span className={`font-semibold ${configInfo.gemini_api_key_configured ? 'text-emerald-400' : 'text-red-400'}`}>
                        {configInfo.gemini_api_key_configured ? 'Yes (Loaded)' : 'No (Missing Key)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">API Key Type:</span>
                      <span className={`font-semibold ${
                        configInfo.gemini_api_key_type.includes('Vertex') ? 'text-yellow-400' : 'text-slate-300'
                      }`}>
                        {configInfo.gemini_api_key_type}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Active Model:</span>
                      <span className="font-mono text-cyan-400 bg-slate-950 px-1 py-0.5 rounded">
                        {configInfo.gemini_model}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Local Simulation Mode:</span>
                      <span className={`font-semibold ${configInfo.use_mock_fallback ? 'text-yellow-400' : 'text-slate-400'}`}>
                        {configInfo.use_mock_fallback ? 'Active (Pre-emptive Mock)' : 'Inactive (Direct AI Call)'}
                      </span>
                    </div>
                  </div>
                  

                </div>
              )}

              {/* Startup checklist for offline */}
              {serverStatus !== 'online' && (
                <div className="p-4 bg-slate-900/60 border border-white/5 rounded-xl">
                  <h5 className="font-bold text-white mb-2 text-sm">1. Start the Django Server</h5>
                  <p className="text-xs text-slate-400">Open a terminal in your project's <code className="font-mono text-cyan-400 bg-[#0c101b] px-1 py-0.5 rounded">backend/</code> directory and execute:</p>
                  <div className="flex items-center justify-between mt-2 bg-[#090b14] p-2 rounded border border-white/5 font-mono text-xs text-slate-200">
                    <code>python manage.py runserver 0.0.0.0:8000</code>
                    <button
                      onClick={() => handleCopy("python manage.py runserver 0.0.0.0:8000", "runserver")}
                      className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedCmd === 'runserver' ? <FiCheck className="text-emerald-500" /> : <FiCopy />}
                    </button>
                  </div>
                </div>
              )}

              {/* Key Connectivity Live Test */}
              <div className="p-4 bg-slate-900/60 border border-white/5 rounded-xl space-y-3">
                <h5 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">Isolated Key Validation Tool</h5>
                <p className="text-xs text-slate-400">Paste a Gemini API key temporarily here to test it against Google endpoints without saving it to files:</p>
                <div className="flex space-x-2">
                  <input
                    type="password"
                    placeholder="AIzaSy or AQ..."
                    value={testKey}
                    onChange={(e) => setTestKey(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                  />
                  <select
                    value={testModel}
                    onChange={(e) => setTestModel(e.target.value)}
                    className="px-2 py-1.5 text-xs bg-slate-950 border border-white/10 rounded-lg text-white focus:outline-none"
                  >
                    <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                    <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                    <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                    <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                  </select>
                  <button
                    onClick={handleTestKey}
                    disabled={testingKey || !testKey}
                    className="px-3 py-1.5 bg-red-650 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center shrink-0"
                  >
                    {testingKey ? <FiRefreshCw className="animate-spin mr-1" /> : null}
                    Test
                  </button>
                </div>
                {testResult && (
                  <div className={`p-2.5 rounded text-xs leading-relaxed font-mono ${
                    testResult.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {testResult.success ? (
                      <div>🎉 {testResult.message}</div>
                    ) : (
                      <div className="whitespace-pre-wrap text-[11px]">⚠️ Error: {testResult.error}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-4">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">Settings Configurator</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Update the server settings dynamically. Saving will modify the backend <code className="text-cyan-400 font-mono">.env</code> file directly and hot-reload environmental scopes.
              </p>

              <div className="space-y-4 p-5 rounded-2xl bg-slate-900/60 border border-white/5">
                {/* Save API Key */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 block">Set New Gemini API Key</label>
                  <input
                    type="password"
                    placeholder="Enter standard Google AI Studio key (starts with AIzaSy or AQ.)..."
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                  />
                  <span className="text-[10px] text-slate-500 block">Leave blank if you do not want to overwrite the existing key.</span>
                </div>

                {/* Model and Mock toggle */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 block">Select Gemini Model</label>
                    <select
                      value={newModel}
                      onChange={(e) => setNewModel(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-white/10 rounded-lg text-white focus:outline-none"
                    >
                      <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                      <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                      <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                      <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 block font-semibold">Simulation Fallback</label>
                    <div className="flex items-center space-x-2 h-9">
                      <input
                        type="checkbox"
                        id="useMockFallbackCheckbox"
                        checked={newMockMode}
                        onChange={(e) => setNewMockMode(e.target.checked)}
                        className="w-4 h-4 accent-red-500 rounded bg-slate-950 border-white/10"
                      />
                      <label htmlFor="useMockFallbackCheckbox" className="text-xs text-slate-300 cursor-pointer select-none">
                        Enable Simulated Mock Fallback
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-white/5">
                  <button
                    onClick={handleSaveConfig}
                    disabled={updatingConfig || (serverStatus !== 'online')}
                    className="px-4 py-2 text-xs text-white bg-red-650 hover:bg-red-700 rounded-xl font-bold transition-all disabled:opacity-50"
                  >
                    {updatingConfig ? <FiRefreshCw className="animate-spin mr-1 inline" /> : null}
                    Save & Apply Config
                  </button>
                </div>

                {configMessage && (
                  <div className={`p-2.5 rounded text-xs ${
                    configMessage.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {configMessage.text}
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-slate-900/40 border border-dashed border-white/10 rounded-xl text-xs text-slate-400 leading-relaxed">
                💡 <strong>What is Simulation Fallback?</strong> If enabled, the application will intercept API key errors and automatically respond with high-fidelity simulated content. This allows you to test the complete, beautiful frontend UI (and features like Chat History, Speech STT/TTS, and PDF extraction UI) even without a valid internet connection or Google API key.
              </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="space-y-5">
              {/* Django Admin Panel details */}
              <div className="p-4 bg-slate-900/60 border border-white/5 rounded-xl space-y-3">
                <h5 className="font-bold text-white mb-1 text-sm">1. Create a Django Superuser</h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  To access the Django database administration portal, you must create a superuser. In your project's <code className="font-mono text-cyan-400 bg-[#0c101b] px-1 py-0.5 rounded">backend/</code> terminal, execute:
                </p>
                <div className="flex items-center justify-between bg-[#090b14] p-2 rounded border border-white/5 font-mono text-xs text-slate-200">
                  <code>python manage.py createsuperuser</code>
                  <button
                    onClick={() => handleCopy("python manage.py createsuperuser", "superuser")}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedCmd === 'superuser' ? <FiCheck className="text-emerald-500" /> : <FiCopy />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-2">
                  Once created, login to view and edit models:
                </p>
                <a 
                  href="http://localhost:8000/admin/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center text-xs text-blue-400 hover:underline font-bold"
                >
                  Open Django Database Admin <FiArrowRight className="ml-1" />
                </a>
              </div>

              {/* Development DB resetting tools */}
              <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl space-y-3">
                <h5 className="font-bold text-red-400 text-xs uppercase tracking-wider">Dangerous: Clear Development Database</h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Wipe all records in the SQL table classes: deletes all messages, conversations, and uploaded documents to clean your dev environment.
                </p>
                <button
                  onClick={handleClearDb}
                  disabled={clearingDb || serverStatus !== 'online'}
                  className="px-3 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 hover:border-red-500 text-red-450 hover:text-white text-xs font-semibold rounded-xl transition-all"
                >
                  {clearingDb ? 'Clearing DB...' : 'Reset Chat Tables'}
                </button>

                {dbMessage && (
                  <div className={`p-2 rounded text-xs ${
                    dbMessage.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {dbMessage.text}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Diagnostic Footer controls */}
        <div className="px-6 py-4 bg-slate-900 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${
              pingResult === 'success' ? 'bg-emerald-500' : pingResult === 'failed' ? 'bg-red-500' : 'bg-slate-600'
            }`} />
            <span className="text-xs font-semibold">
              {pingResult === 'success' ? 'Connection online!' : pingResult === 'failed' ? 'Ping failed. Server offline.' : 'Unchecked'}
            </span>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-700 rounded-xl hover:bg-white/5 text-slate-350 text-xs font-bold transition-all"
            >
              Dismiss
            </button>
            <button
              onClick={fetchStatus}
              disabled={loadingStatus}
              className="px-4 py-2.5 text-xs text-white bg-blue-600 hover:bg-blue-750 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center"
            >
              <FiRefreshCw className={`mr-1 ${loadingStatus ? 'animate-spin' : ''}`} />
              {loadingStatus ? 'Checking...' : 'Refresh Status'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
