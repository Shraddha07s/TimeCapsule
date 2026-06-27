import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Heart, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const EmailVerificationPage = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email/${token}`);
        const data = await res.json();

        if (res.ok) {
          setSuccess(true);
          setMessage(data.message || 'Email verified successfully!');
        } else {
          setSuccess(false);
          setMessage(data.message || 'Verification link is invalid or expired.');
        }
      } catch (err) {
        setSuccess(false);
        setMessage('Network connection failed. Try again.');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-gradient-to-br from-[#0e0a1f] via-[#150f2b] to-[#06040d] text-white">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-pink-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-600/15 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Heart className="w-10 h-10 text-pink-500 fill-pink-500 animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 to-violet-400 bg-clip-text text-transparent">
            Account Verification
          </h2>
        </div>

        {/* Card Panel */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative text-center">
          {loading ? (
            <div className="space-y-4 py-8 flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
              <p className="text-sm text-white/60">Verifying your email token, please wait...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {success ? (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 text-green-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Email Verified!</h3>
                    <p className="text-sm text-white/60 mt-2">{message}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 text-red-400">
                    <XCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Verification Failed</h3>
                    <p className="text-sm text-white/60 mt-2">{message}</p>
                  </div>
                </>
              )}

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

export default EmailVerificationPage;
