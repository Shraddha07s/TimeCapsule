import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      const result = await signup(username, email, password);
      if (result.success) {
        // Automatically redirect to couple connection screen or dashboard
        // We'll redirect to dashboard, which has a verification banner and partner connecting link
        navigate('/dashboard');
      } else {
        setAuthError(result.message || 'Registration failed. Try again.');
      }
    } catch (err) {
      setAuthError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-gradient-to-br from-[#0e0a1f] via-[#150f2b] to-[#06040d] text-white">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-pink-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-600/15 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <Heart className="w-10 h-10 text-pink-500 fill-pink-500 animate-bounce" />
          </Link>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 to-violet-400 bg-clip-text text-transparent">
            Create Your Sanctuary
          </h2>
          <p className="text-sm text-white/50 mt-1.5">Preserve your relationship history forever.</p>
        </div>

        {/* Card Panel */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative">
          {authError && (
            <div className="mb-5 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 pl-1">
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Taylor Smith"
                  className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 pl-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="taylor@love.com"
                  className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 pl-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 font-bold transition-all text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:scale-100"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 text-center border-t border-white/5 pt-6 text-sm text-white/50">
            <span>Already have an account? </span>
            <Link to="/login" className="text-pink-400 hover:text-pink-300 font-bold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
