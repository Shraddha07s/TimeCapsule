import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BookHeart, 
  PenTool, 
  Lock, 
  Unlock, 
  Clock, 
  CheckCircle,
  AlertCircle,
  FileText,
  UserCheck
} from 'lucide-react';

const JournalList = () => {
  const { user, partner, token } = useAuth();
  
  // Weekly states
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Current week write states
  const [myContent, setMyContent] = useState('');
  const [myMood, setMyMood] = useState('Peaceful');
  const [unlockDate, setUnlockDate] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('error');
  const [now, setNow] = useState(new Date());

  const [selectedJournal, setSelectedJournal] = useState(null);

  const moods = ['Romantic', 'Joyful', 'Peaceful', 'Funny', 'Nostalgic', 'Melancholy', 'Fight and Make-up'];

  // ISO-8601 week number calculation (e.g. "2026-W26")
  const getWeekString = (date = new Date()) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  };

  const getNextMonday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() + (day === 0 ? 1 : 8 - day);
    const nextMonday = new Date(d.setDate(diff));
    nextMonday.setHours(0, 0, 0, 0);
    return nextMonday.toISOString().split('T')[0];
  };

  // Real-time ticking for countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchJournals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/journals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('timecapsule-token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setJournals(data);

        // Extract current week entry if already written by current user
        const currentWeekStr = getWeekString();
        const currentJournal = data.find(j => j.weekStartDate === currentWeekStr);
        if (currentJournal) {
          const myEntry = currentJournal.entries.find(e => e.userId === user?._id);
          if (myEntry) {
            setMyContent(myEntry.content);
            setMyMood(myEntry.mood || 'Peaceful');
          }
          setUnlockDate(currentJournal.unlockDate);
        } else {
          setUnlockDate(getNextMonday());
        }
      }
    } catch (err) {
      console.error('Error fetching journals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchJournals();
    }
  }, [token, user]);

  const handleSaveJournal = async (e) => {
    e.preventDefault();
    if (!myContent.trim()) return;

    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/journals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('timecapsule-token')}`
        },
        body: JSON.stringify({
          content: myContent,
          mood: myMood,
          unlockDate
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMsgType('success');
        setMessage('Journal saved successfully!');
        fetchJournals(); // Refresh data
        setTimeout(() => setMessage(''), 2000);
      } else {
        setMsgType('error');
        setMessage(data.message || 'Failed to save entry.');
      }
    } catch (err) {
      setMsgType('error');
      setMessage('Server connection failed.');
    } finally {
      setSaving(false);
    }
  };

  const getCountdownString = (unlockDateStr) => {
    const unlock = new Date(unlockDateStr);
    const diff = unlock - now;
    if (diff <= 0) return 'Unlocked!';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(' ');
  };

  const currentWeek = getWeekString();
  const currentJournal = journals.find(j => j.weekStartDate === currentWeek);
  const partnerEntry = currentJournal?.entries.find(e => e.userId !== user?._id);
  const hasPartnerContributed = !!partnerEntry;

  // Past journals exclude current week
  const pastJournals = journals.filter(j => j.weekStartDate !== currentWeek);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Weekly Journal</h2>
        <p className="text-sm text-white/50 mt-1">One collaborative entry per week. Fill it with your weekly highlights together.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm max-w-xl mx-auto ${
          msgType === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-300' : 'bg-red-500/10 border border-red-500/20 text-red-300'
        }`}>
          {msgType === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message}</span>
        </div>
      )}

      {/* ==========================================
         CURRENT WEEK REFLECTION (COLLABORATIVE WRITER)
         ========================================== */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl space-y-6 bg-gradient-to-br from-pink-500/5 via-transparent to-violet-500/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full">
              Current Week: {currentWeek}
            </span>
            <h3 className="text-xl font-extrabold mt-1">This Week's Journal</h3>
          </div>
          <div className="text-xs text-white/40 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Weekly lock: Monday, {getNextMonday()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Reflection */}
          <form onSubmit={handleSaveJournal} className="space-y-4">
            <h4 className="font-bold text-sm text-pink-400 flex items-center gap-2">
              <PenTool className="w-4 h-4" />
              <span>My Reflection</span>
            </h4>

            {/* Reflection Text */}
            <textarea
              required
              value={myContent}
              onChange={(e) => setMyContent(e.target.value)}
              placeholder="Reflect on this week... what were our best moments? What did we learn? How did we handle hard moments?"
              rows={6}
              className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 px-4 text-sm focus:border-pink-500 outline-none transition-colors resize-none"
            />

            {/* Mood selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/50">My Mood:</span>
                <select
                  value={myMood}
                  onChange={(e) => setMyMood(e.target.value)}
                  className="bg-black/20 border border-white/10 rounded-xl py-1.5 px-3 text-xs focus:border-pink-500 outline-none text-white/80"
                >
                  {moods.map(m => (
                    <option key={m} value={m} className="bg-slate-900">{m}</option>
                  ))}
                </select>
              </div>

              {/* Custom Unlock Date */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">Unlock Date:</span>
                <input
                  type="date"
                  required
                  value={unlockDate}
                  onChange={(e) => setUnlockDate(e.target.value)}
                  className="bg-black/20 border border-white/10 rounded-xl py-1.5 px-2.5 text-xs text-white outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 font-bold transition-all text-xs flex items-center justify-center gap-1.5"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <BookHeart className="w-4 h-4" />
                  <span>Save My Entry</span>
                </>
              )}
            </button>
          </form>

          {/* Partner's Reflection status box */}
          <div className="flex flex-col justify-center items-center p-8 rounded-2xl bg-white/5 border border-white/5 text-center space-y-4">
            <h4 className="font-bold text-sm text-violet-400 flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              <span>Partner's Reflection</span>
            </h4>

            {hasPartnerContributed ? (
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-500/10 text-pink-500">
                  <Lock className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white/90">{partner?.username} contributed!</p>
                  <p className="text-xs text-white/50 mt-1">Their reflection is time-sealed to prevent cheating.</p>
                </div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-violet-300 pt-2 flex items-center justify-center gap-1">
                  <span>Locked until:</span>
                  <span>{getCountdownString(unlockDate)}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-white/60 italic">Waiting for {partner?.username || 'partner'} to write...</p>
                <p className="text-xs text-white/40 max-w-xs">
                  Once they contribute, the lock icon will turn green showing they are done. You can read both reflections once the week ends.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==========================================
         PAST WEEK REFLECTIONS (ARCHIVE GRID)
         ========================================== */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold tracking-tight text-white/80">Weekly Archive</h3>

        {loading ? (
          <div className="min-h-[20vh] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pastJournals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastJournals.map((j) => (
              <div
                key={j._id}
                onClick={() => !j.isLocked && setSelectedJournal(j)}
                className={`glass-card p-6 flex flex-col justify-between relative overflow-hidden transition-all ${
                  j.isLocked ? 'cursor-default border-white/5' : 'cursor-pointer hover:border-pink-500/30'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                      Week: {j.weekStartDate}
                    </span>
                    {j.isLocked ? <Lock className="w-4 h-4 text-pink-500" /> : <Unlock className="w-4 h-4 text-green-500" />}
                  </div>

                  <div>
                    <h4 className="font-extrabold text-base">Weekly Entry</h4>
                    <p className="text-xs text-white/40 mt-1">Reflections from both partners.</p>
                  </div>

                  {j.isLocked ? (
                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs font-semibold text-pink-300 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-pink-400 shrink-0" />
                      <span>Unlocks in: {getCountdownString(j.unlockDate)}</span>
                    </div>
                  ) : (
                    <button className="w-full py-2 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Read Reflections</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 text-center text-white/40 text-sm">
            No past weekly journals available.
          </div>
        )}
      </div>

      {/* ==========================================
         WEEKLY JOURNAL DETAILS MODAL
         ========================================== */}
      {selectedJournal && (
        <div className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-6">
          <div className="glass-panel w-full max-w-4xl rounded-3xl border border-white/10 p-6 md:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                  Week: {selectedJournal.weekStartDate}
                </span>
                <h3 className="text-2xl font-extrabold mt-1.5">Journal Reflections</h3>
              </div>
              <button
                onClick={() => setSelectedJournal(null)}
                className="p-1.5 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reflections side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              {/* Entry 1 */}
              {selectedJournal.entries.map((entry, idx) => (
                <div key={entry.userId} className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <h4 className="font-extrabold text-sm text-pink-400 flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center font-bold text-[10px]">
                        {entry.username.charAt(0).toUpperCase()}
                      </div>
                      <span>{entry.username}'s Thoughts</span>
                    </h4>
                    {entry.mood && (
                      <span className="text-xs text-white/50 bg-white/5 px-2.5 py-0.5 rounded-full">
                        Mood: {entry.mood}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed font-light whitespace-pre-wrap">
                    {entry.content}
                  </p>
                </div>
              ))}
              
              {/* If only one partner contributed */}
              {selectedJournal.entries.length === 1 && (
                <div className="p-6 rounded-2xl border border-dashed border-white/10 flex flex-col justify-center items-center text-center text-white/40 text-xs py-12">
                  <PenTool className="w-8 h-8 mb-2 opacity-50" />
                  <p>Partner did not contribute to this week's journal.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalList;
