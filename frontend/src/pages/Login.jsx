import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiLock, FiAlertTriangle } from 'react-icons/fi';
import { BackendErrorDashboard } from '../components/ThreeDEffects';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    
    setError('');
    setLoading(true);
    
    const result = await login(username, password);
    setLoading(false);
    
    if (result.success) {
      if (rememberMe) {
        localStorage.setItem('remembered_username', username);
      } else {
        localStorage.removeItem('remembered_username');
      }
      navigate('/chat');
    } else {
      setError(result.error);
      // Auto open diagnostics if it is a network connection error
      if (result.error.toLowerCase().includes('network') || result.error.toLowerCase().includes('connect') || result.error.toLowerCase().includes('failed')) {
        setShowDiagnostics(true);
      }
    }
  };

  React.useEffect(() => {
    const remembered = localStorage.getItem('remembered_username');
    if (remembered) {
      setUsername(remembered);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6 text-slate-100">
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow details */}
        <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-blue-500/20 blur-xl"></div>
        <div className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-violet-500/20 blur-xl"></div>

        {/* Branding header */}
        <div className="text-center mb-8 space-y-2">
          <Link to="/" className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 text-white font-extrabold text-lg shadow-lg">
            P
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-400">Sign in to continue to Pavan-GPT</p>
        </div>

        {/* Errors banner */}
        {error && (
          <div className="mb-6 flex flex-col space-y-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400">
            <div className="flex items-start space-x-2.5">
              <FiAlertTriangle className="mt-0.5 shrink-0" size={16} />
              <span>{error}</span>
            </div>
            {(error.toLowerCase().includes('network') || error.toLowerCase().includes('connect') || error.toLowerCase().includes('failed')) && (
              <button 
                type="button"
                onClick={() => setShowDiagnostics(true)}
                className="text-left text-cyan-400 font-bold hover:underline pl-6 bg-transparent border-0 cursor-pointer focus:outline-none"
              >
                ⚙ Open Diagnostics & Admin Portal Setup
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Username</label>
            <div className="relative flex items-center">
              <FiUser className="absolute left-3 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl glass-input py-3 pl-10 pr-4 text-sm text-slate-200 border border-slate-800 focus:border-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-700 placeholder-slate-600"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-400">Password</label>
              <button 
                type="button"
                onClick={() => alert("Please contact support or clear cache to reset local test passwords.")}
                className="text-[10px] text-blue-400 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative flex items-center">
              <FiLock className="absolute left-3 text-slate-500" size={16} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl glass-input py-3 pl-10 pr-4 text-sm text-slate-200 border border-slate-800 focus:border-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-700 placeholder-slate-600"
                required
              />
            </div>
          </div>

          {/* Remember me option */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-xs text-slate-400 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-blue-600 accent-blue-600"
              />
              <span>Remember Me</span>
            </label>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-500/10 hover:shadow-blue-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {/* Redirect */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <span>Don't have an account? </span>
          <Link to="/register" className="text-blue-400 font-semibold hover:underline">
            Register Here
          </Link>
        </div>
      </div>
      
      {/* Connection Offline Diagnostics Modal */}
      <BackendErrorDashboard 
        isOpen={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
      />
    </div>
  );
};

export default Login;
