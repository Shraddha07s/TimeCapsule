import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Heart, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      showToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        showToast('Password has been successfully updated!', 'success');
      } else {
        setError(data.message || 'Token is invalid or has expired.');
        showToast(data.message || 'Token is invalid or has expired.', 'error');
      }
    } catch (err) {
      setError('Network connection failed. Try again.');
      showToast('Network connection failed during password reset.', 'error');
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
            <Heart className="w-10 h-10 text-pink-500 fill-pink-500 animate-pulse" />
          </Link>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 to-violet-400 bg-clip-text text-transparent">
            Reset Password
          </h2>
          <p className="text-sm text-white/50 mt-1.5">Enter a new secure password for your account.</p>
        </div>

        {/* Card Panel */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative">
          {error && (
            <div className="mb-5 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 pl-1">
                  New Password
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

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 pl-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 font-bold transition-all text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Update Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 text-green-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Password Reset Successful!</h3>
                <p className="text-sm text-white/60 mt-2">
                  Your password has been updated. You can now log in to your account.
                </p>
              </div>

              <Link
                to="/login"
                className="inline-block w-full py-3.5 rounded-2xl bg-pink-500 hover:bg-pink-600 font-bold text-sm text-white transition-colors"
              >
                Go to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
