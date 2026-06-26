import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiAlertTriangle } from 'react-icons/fi';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaions
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (username.length < 4) {
      setError("Username must be at least 4 characters long.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await register(username, email, password, confirmPassword);
    setLoading(false);

    if (result.success) {
      navigate('/chat');
    } else {
      setError(result.error);
    }
  };

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
          <h2 className="text-2xl font-bold tracking-tight">Create Account</h2>
          <p className="text-xs text-slate-400">Get started with Pavan-GPT free</p>
        </div>

        {/* Error panel */}
        {error && (
          <div className="mb-6 flex items-start space-x-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400">
            <FiAlertTriangle className="mt-0.5 shrink-0" size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Username</label>
            <div className="relative flex items-center">
              <FiUser className="absolute left-3 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Enter username (min 4 chars)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl glass-input py-2.5 pl-10 pr-4 text-sm text-slate-200 border border-slate-800 focus:border-slate-600 focus:outline-none placeholder-slate-600"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Email Address</label>
            <div className="relative flex items-center">
              <FiMail className="absolute left-3 text-slate-500" size={16} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl glass-input py-2.5 pl-10 pr-4 text-sm text-slate-200 border border-slate-800 focus:border-slate-600 focus:outline-none placeholder-slate-600"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Password</label>
            <div className="relative flex items-center">
              <FiLock className="absolute left-3 text-slate-500" size={16} />
              <input
                type="password"
                placeholder="•••••••• (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl glass-input py-2.5 pl-10 pr-4 text-sm text-slate-200 border border-slate-800 focus:border-slate-600 focus:outline-none placeholder-slate-600"
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Confirm Password</label>
            <div className="relative flex items-center">
              <FiLock className="absolute left-3 text-slate-500" size={16} />
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl glass-input py-2.5 pl-10 pr-4 text-sm text-slate-200 border border-slate-800 focus:border-slate-600 focus:outline-none placeholder-slate-600"
                required
              />
            </div>
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-500/10 hover:shadow-blue-500/25 hover:scale-[1.01] transition-all disabled:opacity-50"
          >
            {loading ? "Registering Account..." : "Create Account"}
          </button>
        </form>

        {/* Redirect */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <span>Already have an account? </span>
          <Link to="/login" className="text-blue-400 font-semibold hover:underline">
            Login Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
