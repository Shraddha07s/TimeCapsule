import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Heart, Copy, Check, Link2, Link2Off, UserPlus, HeartHandshake, CalendarHeart } from 'lucide-react';

const CoupleConnect = () => {
  const { user, partner, coupleDetails, connectPartner, disconnectPartner } = useAuth();
  const [partnerCode, setPartnerCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);

  const copyCode = () => {
    if (user?.inviteCode) {
      navigator.clipboard.writeText(user.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!partnerCode.trim()) return;

    setLoading(true);
    setMessage('');
    try {
      const result = await connectPartner(partnerCode);
      if (result.success) {
        setMessage('Successfully connected! Redirecting...');
      } else {
        setMessage(result.message || 'Failed to connect. Double check code.');
      }
    } catch (err) {
      setMessage('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const result = await disconnectPartner();
      if (result.success) {
        setShowConfirmDisconnect(false);
        setMessage('Successfully disconnected partner.');
      } else {
        setMessage(result.message || 'Disconnect failed.');
      }
    } catch (err) {
      setMessage('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Couple Connection</h2>
        <p className="text-sm text-white/50 mt-1">Connect with your partner to share letters, journals, and locked capsules.</p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-center">
          {message}
        </div>
      )}

      {partner ? (
        /* ==========================================
           CONNECTED STATE
           ========================================== */
        <div className="space-y-8">
          <div className="glass-panel p-8 md:p-12 rounded-3xl text-center relative overflow-hidden bg-gradient-to-br from-pink-500/5 via-transparent to-violet-500/5">
            {/* Pulsing heart node connection graphic */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 relative z-10">
              {/* User Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-violet-500/20 flex items-center justify-center font-black text-3xl ring-4 ring-violet-500 ring-offset-4 ring-offset-slate-950 object-cover overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.username?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{user?.username}</h4>
                  <span className="text-xs text-white/40">You</span>
                </div>
              </div>

              {/* Heart Connector */}
              <div className="relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-pink-500/10 blur-md animate-pulse" />
                <Heart className="w-12 h-12 text-pink-500 fill-pink-500 relative z-10 animate-bounce" />
              </div>

              {/* Partner Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-pink-500/20 flex items-center justify-center font-black text-3xl ring-4 ring-pink-500 ring-offset-4 ring-offset-slate-950 object-cover overflow-hidden">
                  {partner?.avatar ? (
                    <img src={partner.avatar} alt={partner.username} className="w-full h-full object-cover" />
                  ) : (
                    <span>{partner?.username?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{partner?.username}</h4>
                  <span className="text-xs text-white/40">Partner</span>
                </div>
              </div>
            </div>

            <div className="mt-12 max-w-lg mx-auto p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
              <h5 className="font-bold text-pink-400 flex items-center justify-center gap-2">
                <HeartHandshake className="w-5 h-5" />
                <span>Relationship Details</span>
              </h5>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-left pt-2">
                <div>
                  <span className="text-xs text-white/40 block">Anniversary Date</span>
                  <span className="font-semibold text-white/95">{coupleDetails?.anniversaryDate || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-xs text-white/40 block">Relationship Start</span>
                  <span className="font-semibold text-white/95">{coupleDetails?.relationshipStartDate || 'Not set'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-white/40 block">Favorite Shared Song</span>
                  <span className="font-semibold text-white/95">{coupleDetails?.favoriteSong || 'Not set'}</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              {!showConfirmDisconnect ? (
                <button
                  onClick={() => setShowConfirmDisconnect(true)}
                  className="px-6 py-3 rounded-2xl bg-red-500/10 border border-red-500/25 hover:bg-red-500 hover:text-white text-red-200 text-sm font-semibold transition-all flex items-center gap-2 mx-auto"
                >
                  <Link2Off className="w-4 h-4" />
                  <span>Disconnect Partner</span>
                </button>
              ) : (
                <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/20 max-w-md mx-auto space-y-4">
                  <p className="text-sm text-red-200">
                    Are you absolutely sure you want to disconnect? You will no longer share dashboard stats, joint letters, and weekly journal records.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={handleDisconnect}
                      disabled={loading}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors"
                    >
                      Yes, Disconnect
                    </button>
                    <button
                      onClick={() => setShowConfirmDisconnect(false)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ==========================================
           UNCONNECTED STATE
           ========================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Your invite code */}
          <div className="glass-panel p-8 rounded-3xl space-y-6">
            <h3 className="text-xl font-bold tracking-tight text-pink-400 flex items-center gap-2">
              <CalendarHeart className="w-6 h-6" />
              <span>Share Your Invite Code</span>
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Send this unique code to your partner. When they enter this code on their device, your accounts will be securely linked together.
            </p>

            <div className="flex gap-2 items-center bg-black/25 border border-white/10 p-4 rounded-2xl justify-between">
              <span className="font-mono text-2xl font-black tracking-widest text-white/90 pl-2">
                {user?.inviteCode || 'LOADING...'}
              </span>
              <button
                onClick={copyCode}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white"
                title="Copy Invite Code"
              >
                {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Card 2: Link partner form */}
          <div className="glass-panel p-8 rounded-3xl space-y-6">
            <h3 className="text-xl font-bold tracking-tight text-violet-400 flex items-center gap-2">
              <UserPlus className="w-6 h-6" />
              <span>Join Your Partner</span>
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Did your partner send you an invite code? Enter their code below to instantly link your accounts and start sharing time capsules.
            </p>

            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  value={partnerCode}
                  onChange={(e) => setPartnerCode(e.target.value)}
                  placeholder="ENTER PARTNER CODE"
                  className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 px-4 text-center font-mono font-black text-lg uppercase tracking-wider focus:border-pink-500 outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 font-bold transition-all text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    <span>Connect Partner</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoupleConnect;
