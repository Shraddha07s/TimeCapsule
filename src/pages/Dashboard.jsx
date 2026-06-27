import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Heart, 
  Lock, 
  Unlock, 
  Sparkles, 
  CalendarDays, 
  Timer, 
  FolderHeart, 
  PlusCircle, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const Dashboard = () => {
  const { user, partner, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  // Real-time ticking for countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch('/api/stats/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('timecapsule-token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardStats();
    }
  }, [token, user?.coupleId]);

  // Formatter for countdown
  const getCountdownString = (unlockDateStr) => {
    const unlockDate = new Date(unlockDateStr);
    const diff = unlockDate - now;

    if (diff <= 0) return 'Ready to unlock!';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Email Verification Banner (Mock box) */}
      {user && !user.isVerified && (
        <div className="p-4 rounded-3xl bg-pink-500/10 border border-pink-500/20 text-pink-200 text-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 text-pink-500" />
            <p>
              Please verify your email address to secure your time capsules. 
              {user.verificationToken && (
                <span className="text-white/60 block md:inline md:ml-1">
                  (Developer Simulation Active: click verify button to mock verify).
                </span>
              )}
            </p>
          </div>
          {user.verificationToken && (
            <Link
              to={`/verify-email/${user.verificationToken}`}
              className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl transition-colors shrink-0"
            >
              Verify Account Now
            </Link>
          )}
        </div>
      )}

      {/* Header Profile Greeting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Hello, {user?.username}
          </h2>
          <p className="text-sm text-white/50 mt-1">
            {partner ? `Sharing chapters with ${partner.username}.` : 'Connect with your partner to share memories.'}
          </p>
        </div>
        <Link
          to="/memories/create"
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white text-sm font-bold shadow-lg shadow-pink-500/10 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Memory</span>
        </Link>
      </div>

      {/* Relationship Dashboard Counters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Days Together Card */}
        <div className="glass-card p-6 md:p-8 flex items-center justify-between relative overflow-hidden bg-gradient-to-br from-pink-500/5 to-transparent">
          <div className="space-y-3 relative z-10">
            <p className="text-xs font-semibold tracking-wider text-pink-400 uppercase">Days Together</p>
            <h3 className="text-4xl md:text-5xl font-black tracking-tight">
              {stats?.daysTogether !== null ? `${stats?.daysTogether} Days` : 'Not Set'}
            </h3>
            <p className="text-xs text-white/40">
              {stats?.daysTogether !== null ? 'Preserving milestones day by day.' : 'Set your relation start date in Profile Settings.'}
            </p>
          </div>
          <Heart className="w-16 h-16 text-pink-500/10 fill-pink-500/5 absolute right-6 top-1/2 -translate-y-1/2" />
        </div>

        {/* Anniversary Countdown Card */}
        <div className="glass-card p-6 md:p-8 flex items-center justify-between relative overflow-hidden bg-gradient-to-br from-violet-500/5 to-transparent">
          <div className="space-y-3 relative z-10">
            <p className="text-xs font-semibold tracking-wider text-violet-400 uppercase">Next Anniversary</p>
            <h3 className="text-4xl md:text-5xl font-black tracking-tight">
              {stats?.anniversaryCountdown !== null ? `${stats?.anniversaryCountdown} Days` : 'Not Set'}
            </h3>
            <p className="text-xs text-white/40">
              {stats?.anniversaryCountdown !== null ? 'Counting down to your special day.' : 'Set your Anniversary date in Profile Settings.'}
            </p>
          </div>
          <CalendarDays className="w-16 h-16 text-violet-500/10 absolute right-6 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Grid: Main Statistics & Upcoming Lock list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Quick Stats */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-lg font-bold tracking-tight text-white/80">Capsule Status</h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            {/* Total Memories */}
            <div className="glass-card p-6 flex items-center gap-4 bg-white/5">
              <div className="p-3 rounded-2xl bg-white/5 text-white/70">
                <FolderHeart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black">{stats?.totalMemories || 0}</p>
                <p className="text-xs text-white/50">Total Chapters</p>
              </div>
            </div>

            {/* Locked Count */}
            <div className="glass-card p-6 flex items-center gap-4 bg-pink-500/5">
              <div className="p-3 rounded-2xl bg-pink-500/10 text-pink-500">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black">{stats?.lockedMemories || 0}</p>
                <p className="text-xs text-white/50">Locked</p>
              </div>
            </div>

            {/* Unlocked Count */}
            <div className="glass-card p-6 flex items-center gap-4 bg-green-500/5">
              <div className="p-3 rounded-2xl bg-green-500/10 text-green-500">
                <Unlock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black">{stats?.unlockedMemories || 0}</p>
                <p className="text-xs text-white/50">Unlocked</p>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Upcoming Memory Unlocks */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold tracking-tight text-white/80">Upcoming Unlocks</h3>
            <Link to="/memories" className="text-xs text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {stats?.upcomingUnlocks && stats.upcomingUnlocks.length > 0 ? (
              stats.upcomingUnlocks.map((m) => (
                <div key={m._id} className="glass-panel p-5 rounded-2xl border border-white/5 bg-gradient-to-r from-pink-500/5 to-transparent relative overflow-hidden">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-400">
                        {m.category}
                      </span>
                      <h4 className="font-bold text-sm mt-1.5 truncate max-w-[150px]">{m.title}</h4>
                    </div>
                    <span className="text-lg">{m.mood === 'Romantic' ? '💖' : m.mood === 'Funny Moment' || m.mood === 'Funny' ? '😂' : '✨'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-violet-300">
                    <Timer className="w-4 h-4" />
                    <span>{getCountdownString(m.unlockDate)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card p-8 text-center text-white/40 text-sm">
                No upcoming memory locks scheduled.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Activities */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-lg font-bold tracking-tight text-white/80">Activity Feed</h3>
          
          <div className="glass-panel p-6 rounded-3xl space-y-5 max-h-[320px] overflow-y-auto">
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((act) => (
                <div key={act._id} className="flex gap-3 text-sm items-start">
                  <div className="w-2.5 h-2.5 rounded-full bg-pink-500 shrink-0 mt-1.5 shadow-[0_0_8px_#ec4899]" />
                  <div className="space-y-0.5">
                    <p className="text-white/85 leading-snug">
                      <strong className="text-white font-bold">{act.username}</strong> {act.details}
                    </p>
                    <p className="text-[10px] text-white/40">
                      {new Date(act.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-white/40 text-sm">
                No recent activity logged yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
