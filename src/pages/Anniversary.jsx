import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Heart, 
  Calendar, 
  Sparkles,
  CalendarDays,
  Music,
  ChevronRight,
  Gift
} from 'lucide-react';

const Anniversary = () => {
  const { user, partner, coupleDetails, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [unlockedMemories, setUnlockedMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Anniversary message generator states
  const [annivMessage, setAnnivMessage] = useState('');
  const [messageGenerated, setMessageGenerated] = useState(false);

  const fetchAnniversaryData = async () => {
    setLoading(true);
    try {
      // 1. Fetch dashboard stats for days together
      const resStats = await fetch('/api/stats/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('timecapsule-token')}`
        }
      });
      if (resStats.ok) {
        const data = await resStats.json();
        setStats(data);
      }

      // 2. Fetch unlocked memories for the timeline
      const resMem = await fetch('/api/memories?isLocked=false', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('timecapsule-token')}`
        }
      });
      if (resMem.ok) {
        const data = await resMem.json();
        // Sort ascending by memory date for timeline
        data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setUnlockedMemories(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnniversaryData();
    }
  }, [token]);

  // Anniversary romantic messages
  const presetsMessages = [
    "To the one who holds my heart: every single day with you is a locked memory I want to keep forever. Happy Anniversary, here's to a thousand more sunsets together.",
    "Days together: counted. Milestones: locked. Love: infinite. Thank you for building this digital sanctuary with me. Every day is an adventure with you.",
    "From our very first date to this exact moment, you've made my life a beautiful movie. Unlocking these memories today reminds me how lucky I am to have you."
  ];

  const generateAnnMessage = () => {
    const idx = Math.floor(Math.random() * presetsMessages.length);
    setAnnivMessage(presetsMessages[idx]);
    setMessageGenerated(true);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Define core milestones
  const milestones = [];
  
  const startStr = coupleDetails?.relationshipStartDate || user?.relationshipStartDate;
  if (startStr) {
    milestones.push({
      date: startStr,
      title: 'Our Journey Began',
      desc: 'The beautiful day we decided to walk hand-in-hand.',
      icon: Heart,
      color: 'text-pink-500 bg-pink-500/10'
    });
  }

  // Add unlocked memories to timeline
  unlockedMemories.forEach(mem => {
    milestones.push({
      date: mem.date,
      title: mem.title,
      desc: `Category: ${mem.category} &bull; Mood: ${mem.mood}`,
      isMemory: true,
      color: 'text-violet-400 bg-violet-500/10'
    });
  });

  // Sort all milestones chronologically
  milestones.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Our Anniversary</h2>
        <p className="text-sm text-white/50 mt-1">Celebrate your milestones, recount your days, and view your love timeline.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Days together details and anniversary generators */}
        <div className="lg:col-span-1 space-y-6">
          {/* Days count card */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl text-center space-y-4 border border-pink-500/20 bg-gradient-to-b from-pink-500/10 to-transparent">
            <Heart className="w-12 h-12 text-pink-500 fill-pink-500 mx-auto animate-pulse" />
            <div>
              <h3 className="text-4xl md:text-5xl font-black">{stats?.daysTogether || 'Not Set'}</h3>
              <p className="text-xs text-white/40 uppercase tracking-widest mt-1.5 font-bold">Days Together</p>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              Every day we write a new chapter. Here's to all the locked and unlocked moments we share.
            </p>
          </div>

          {/* Anniversary Countdown */}
          <div className="glass-card p-6 rounded-3xl space-y-4 bg-white/5">
            <div className="flex items-center gap-3 border-b border-white/5 pb-2">
              <CalendarDays className="w-5 h-5 text-violet-400" />
              <h4 className="font-bold text-sm">Anniversary Countdown</h4>
            </div>
            <div className="text-center">
              <span className="text-3xl font-black text-violet-400">
                {stats?.anniversaryCountdown !== null ? `${stats.anniversaryCountdown} Days` : 'Not Set'}
              </span>
              <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Remaining until annual celebration</p>
            </div>
          </div>

          {/* Anniversary Message Card */}
          <div className="glass-card p-6 rounded-3xl space-y-4 bg-white/5">
            <div className="flex items-center gap-3 border-b border-white/5 pb-2">
              <Gift className="w-5 h-5 text-pink-400" />
              <h4 className="font-bold text-sm">Anniversary Message</h4>
            </div>
            
            {messageGenerated ? (
              <div className="space-y-4">
                <p className="text-xs italic text-white/80 bg-white/5 p-4 rounded-xl leading-relaxed border border-white/5 font-serif">
                  "{annivMessage}"
                </p>
                <button
                  onClick={generateAnnMessage}
                  className="w-full py-2 bg-pink-500/10 hover:bg-pink-500/25 text-pink-400 text-xs font-bold rounded-lg transition-all"
                >
                  Regenerate Message
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-white/60">
                  Generate a romantic anniversary quote to write in a letter or share on social media.
                </p>
                <button
                  onClick={generateAnnMessage}
                  className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-pink-500/10"
                >
                  Generate Love Message
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Relationship Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold tracking-tight text-white/85 pl-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500 fill-pink-500" />
            <span>Our Relationship Timeline</span>
          </h3>

          {milestones.length > 0 ? (
            <div className="glass-panel p-8 rounded-3xl relative">
              {/* Central vertical line */}
              <div className="absolute left-12 top-8 bottom-8 w-0.5 bg-gradient-to-b from-pink-500 via-violet-500 to-indigo-500/20" />

              <div className="space-y-8 relative">
                {milestones.map((item, idx) => {
                  const Icon = item.icon || Heart;
                  return (
                    <div key={idx} className="flex gap-6 items-start text-left">
                      {/* Timeline Icon Node */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 shrink-0 ${item.color || 'bg-violet-500/10 text-violet-400'}`}>
                        {item.isMemory ? '✨' : <Icon className="w-4 h-4" />}
                      </div>

                      {/* Timeline content Card */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-pink-400 font-mono">
                          {new Date(item.date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <h4 className="font-extrabold text-sm text-white/90">{item.title}</h4>
                        <p 
                          className="text-xs text-white/50 leading-relaxed font-light"
                          dangerouslySetInnerHTML={{ __html: item.desc }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-16 text-center text-white/40 text-sm">
              Please set your Relationship Start Date in your Profile Settings to kickstart your timeline.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Anniversary;
