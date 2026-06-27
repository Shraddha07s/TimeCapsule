import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, CheckCircle2, ArrowLeft, MailQuestion } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resetLink, setResetLink] = useState('');
  const [error, setError] = useState('');
  const { showToast } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        showToast('Password reset link generated successfully!', 'success');
        // Our backend returns the resetToken directly for developer testing/demo
        if (data.resetToken) {
          setResetLink(`/reset-password/${data.resetToken}`);
        }
      } else {
        setError(data.message || 'Something went wrong.');
        showToast(data.message || 'Something went wrong.', 'error');
      }
    } catch (err) {
      setError('Network connection failed. Try again.');
      showToast('Network connection failed during password recovery.', 'error');
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
            Forgot Password
          </h2>
          <p className="text-sm text-white/50 mt-1.5">No worries, we will help you unlock your capsule.</p>
        </div>

        {/* Card Panel */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative">
          {error && (
            <div className="mb-5 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
              {error}
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 pl-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@relationship.com"
                    className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 font-bold transition-all text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Generate Reset Instructions</span>
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
                <h3 className="text-lg font-bold">Request Successful!</h3>
                <p className="text-sm text-white/60 mt-2">
                  A simulated email was sent to <strong className="text-white">{email}</strong>.
                </p>
              </div>

              {/* Dev Mail Inbox Simulator Block */}
              {resetLink && (
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-left space-y-3 relative overflow-hidden">
                  <div className="flex items-center gap-2 text-xs font-semibold text-pink-400 uppercase tracking-widest border-b border-white/10 pb-2">
                    <MailQuestion className="w-4 h-4" />
                    <span>Dev Simulator: Mail Box</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    <strong>Subject:</strong> Password Reset Instructions<br />
                    Click the link below to complete the password reset:
                  </p>
                  <Link
                    to={resetLink}
                    className="inline-block w-full text-center py-2 px-4 rounded-xl bg-pink-500 hover:bg-pink-600 font-bold text-xs text-white transition-colors"
                  >
                    Reset Password Now
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Footer Back Link */}
          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
