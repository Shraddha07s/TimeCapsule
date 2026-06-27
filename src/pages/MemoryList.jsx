import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Lock, 
  Unlock, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Tag, 
  Play, 
  Pause,
  Download,
  Trash2,
  AlertTriangle,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

const MemoryList = () => {
  const { token, user } = useAuth();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [mood, setMood] = useState('');
  const [isLocked, setIsLocked] = useState(''); // '', 'true', 'false'
  const [sort, setSort] = useState('date_desc');
  const [now, setNow] = useState(new Date());

  // Memory Detail Modal
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [detailedMemory, setDetailedMemory] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Audio Playback
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);

  // Unlock celebration state
  const [celebratingMemory, setCelebratingMemory] = useState(null);
  const [celebrationStep, setCelebrationStep] = useState(0); // 0: none, 1: trigger overlay, 2: reveal

  const categories = [
    'Date', 'Trip', 'Celebration', 'Achievement',
    'Funny Moment', 'Random Memory', 'Fight and Make-up', 'Special Day'
  ];

  const moods = ['Romantic', 'Joyful', 'Peaceful', 'Funny', 'Nostalgic', 'Melancholy', 'Fight and Make-up'];

  // Tick timer
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (category) queryParams.append('category', category);
      if (mood) queryParams.append('mood', mood);
      if (isLocked) queryParams.append('isLocked', isLocked);
      if (search) queryParams.append('search', search);
      if (sort) queryParams.append('sort', sort);

      const res = await fetch(`/api/memories?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('timecapsule-token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMemories(data);
      }
    } catch (err) {
      console.error('Error fetching memories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMemories();
    }
  }, [token, category, mood, isLocked, sort, search]);

  // Locked memory helpers
  const getRemainingTime = (unlockDateStr) => {
    const unlock = new Date(unlockDateStr);
    const diff = unlock - now;
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, ended: false };
  };

  const getProgressPercentage = (createdAtStr, unlockDateStr) => {
    const created = new Date(createdAtStr).getTime();
    const unlock = new Date(unlockDateStr).getTime();
    const current = now.getTime();

    if (current >= unlock) return 100;
    if (current <= created) return 0;

    const total = unlock - created;
    const elapsed = current - created;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  // Open memory detail
  const handleOpenMemory = async (memory) => {
    if (memory.isLocked) {
      const timeInfo = getRemainingTime(memory.unlockDate);
      if (timeInfo.ended) {
        // Trigger celebration unlock flow!
        triggerUnlockCelebration(memory);
      }
      return;
    }

    setSelectedMemory(memory);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/memories/${memory._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('timecapsule-token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDetailedMemory(data);
        setCurrentSlideIndex(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Unlock animation trigger
  const triggerUnlockCelebration = (memory) => {
    setCelebratingMemory(memory);
    setCelebrationStep(1);
    
    // Blast confetti multiple times
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });

    const end = Date.now() + 2 * 1000;
    const colors = ['#ec4899', '#8b5cf6', '#3b82f6'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

    // Proceed to details reveal after 4 seconds
    setTimeout(async () => {
      setCelebrationStep(2);
      // Fetch full memory details
      try {
        const res = await fetch(`/api/memories/${memory._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('timecapsule-token')}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setDetailedMemory(data);
          setSelectedMemory(data);
          fetchMemories(); // Refresh dashboard list
        }
      } catch (err) {
        console.error(err);
      }
    }, 3800);
  };

  const handleCloseCelebration = () => {
    setCelebratingMemory(null);
    setCelebrationStep(0);
  };

  // Delete Memory
  const handleDeleteMemory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this memory forever?')) return;
    try {
      const res = await fetch(`/api/memories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('timecapsule-token')}`
        }
      });
      if (res.ok) {
        setSelectedMemory(null);
        setDetailedMemory(null);
        fetchMemories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // PDF Export
  const handleExportPDF = () => {
    if (!detailedMemory) return;
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Time Capsules</h2>
          <p className="text-sm text-white/50 mt-1">Unlock and explore the chapters of your love story.</p>
        </div>
      </div>

      {/* Search & Filter Header bar */}
      <div className="glass-panel p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-center border border-white/5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search memories..."
            className="w-full bg-black/25 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs focus:border-pink-500 outline-none text-white transition-colors"
          />
        </div>

        {/* Category Filter */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-black/25 border border-white/10 rounded-xl py-2 px-3 text-xs focus:border-pink-500 outline-none text-white/70 hover:text-white transition-all appearance-none"
        >
          <option value="" className="bg-slate-900">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c} className="bg-slate-900">{c}</option>
          ))}
        </select>

        {/* Mood Filter */}
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="bg-black/25 border border-white/10 rounded-xl py-2 px-3 text-xs focus:border-pink-500 outline-none text-white/70 hover:text-white transition-all appearance-none"
        >
          <option value="" className="bg-slate-900">All Moods</option>
          {moods.map(m => (
            <option key={m} value={m} className="bg-slate-900">{m}</option>
          ))}
        </select>

        {/* Locked vs. Unlocked */}
        <select
          value={isLocked}
          onChange={(e) => setIsLocked(e.target.value)}
          className="bg-black/25 border border-white/10 rounded-xl py-2 px-3 text-xs focus:border-pink-500 outline-none text-white/70 hover:text-white transition-all appearance-none"
        >
          <option value="" className="bg-slate-900">All States</option>
          <option value="true" className="bg-slate-900">Locked Capsules</option>
          <option value="false" className="bg-slate-900">Unlocked Capsules</option>
        </select>

        {/* Sorting */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-black/25 border border-white/10 rounded-xl py-2 px-3 text-xs focus:border-pink-500 outline-none text-white/70 hover:text-white transition-all appearance-none"
        >
          <option value="date_desc" className="bg-slate-900">Date (Newest First)</option>
          <option value="date_asc" className="bg-slate-900">Date (Oldest First)</option>
          <option value="unlock_asc" className="bg-slate-900">Unlock Date (Soonest)</option>
          <option value="title_asc" className="bg-slate-900">Title (A-Z)</option>
        </select>
      </div>

      {/* Memory Grid */}
      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : memories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((m) => {
            const timeInfo = getRemainingTime(m.unlockDate);
            const progress = getProgressPercentage(m.createdAt, m.unlockDate);
            const canBeUnlocked = m.isLocked && timeInfo.ended;

            return (
              <div 
                key={m._id} 
                onClick={() => !m.isLocked && handleOpenMemory(m)}
                className={`glass-card p-6 flex flex-col justify-between select-none relative overflow-hidden ${
                  m.isLocked ? 'cursor-default border-pink-500/10' : 'cursor-pointer'
                }`}
              >
                {/* Visual Glass Glow backdrop */}
                {!m.isLocked && (
                  <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-pink-500/10 blur-xl pointer-events-none" />
                )}

                <div className="space-y-4">
                  {/* Top categories and icons */}
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      m.isLocked 
                        ? 'bg-pink-500/15 text-pink-400' 
                        : 'bg-green-500/15 text-green-400'
                    }`}>
                      {m.category}
                    </span>
                    <span className="text-base">
                      {m.mood === 'Romantic' ? '💖' : m.mood === 'Joyful' ? '✨' : m.mood === 'Funny' || m.mood === 'Funny Moment' ? '😂' : '💫'}
                    </span>
                  </div>

                  {/* Title & locked details */}
                  <div>
                    <h3 className="font-extrabold text-lg line-clamp-1 flex items-center gap-2">
                      {m.isLocked ? <Lock className="w-4 h-4 text-pink-500 shrink-0" /> : <Unlock className="w-4 h-4 text-green-500 shrink-0" />}
                      <span>{m.title}</span>
                    </h3>
                    <p className="text-[11px] text-white/40 flex items-center gap-1 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Memory Date: {new Date(m.date).toLocaleDateString()}</span>
                    </p>
                  </div>

                  {/* Locked states - progress bars and countdown */}
                  {m.isLocked && (
                    <div className="space-y-3 pt-2">
                      {/* Ticking countdown */}
                      <div className="flex items-center gap-1.5 text-xs text-pink-300 font-semibold">
                        {canBeUnlocked ? (
                          <span className="text-green-400 animate-pulse uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 animate-spin" />
                            Ready to Unlock
                          </span>
                        ) : (
                          <span>
                            Locked: {timeInfo.days > 0 && `${timeInfo.days}d `}
                            {timeInfo.hours}h {timeInfo.minutes}m {timeInfo.seconds}s
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-pink-500 to-violet-500 transition-all duration-1000"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-white/30 font-medium">
                        <span>Locked</span>
                        <span>{Math.round(progress)}% Complete</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom triggers */}
                {m.isLocked && canBeUnlocked && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerUnlockCelebration(m);
                    }}
                    className="w-full mt-4 py-2 px-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1 animate-pulse"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Unlock Memory Now</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-16 text-center text-white/50 space-y-3">
          <p className="text-lg">No time capsules found matching filters.</p>
          <Link to="/memories/create" className="text-sm text-pink-500 hover:underline">
            Seal your first memory right now!
          </Link>
        </div>
      )}

      {/* ==========================================
         UNLOCK EXPERIENCE / CELEBRATION MODAL OVERLAY
         ========================================== */}
      {celebratingMemory && celebrationStep === 1 && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-6 max-w-lg"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-500 animate-pulse">
              <Lock className="w-10 h-10 animate-ping" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Popping the Lock...
            </h2>
            
            <p className="text-lg text-white/70 font-light leading-relaxed max-w-md mx-auto">
              "Your memory from {new Date(celebratingMemory.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} is finally here."
            </p>

            <p className="text-xs text-white/30">Preparing files, letters, and records...</p>
          </motion.div>
        </div>
      )}

      {/* ==========================================
         MEMORY DETAILS MODAL (SLIDESHOW & PLAYER)
         ========================================== */}
      {selectedMemory && detailedMemory && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto no-print">
          <div className="glass-panel w-full max-w-4xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            
            {/* Left/Top Media Panel (Slideshow) */}
            <div className="w-full md:w-1/2 bg-black/40 flex flex-col justify-between relative min-h-[300px] md:min-h-0">
              
              {detailedMemory.media && detailedMemory.media.length > 0 ? (
                <div className="flex-1 flex items-center justify-center p-4 relative h-full">
                  {/* Media Content */}
                  {detailedMemory.media[currentSlideIndex].type === 'image' && (
                    <img 
                      src={detailedMemory.media[currentSlideIndex].url} 
                      alt={`Slide ${currentSlideIndex}`} 
                      className="max-h-[350px] md:max-h-[500px] w-auto object-contain rounded-xl"
                    />
                  )}
                  {detailedMemory.media[currentSlideIndex].type === 'video' && (
                    <video 
                      src={detailedMemory.media[currentSlideIndex].url} 
                      controls 
                      className="max-h-[350px] md:max-h-[500px] w-full object-contain rounded-xl"
                    />
                  )}
                  {detailedMemory.media[currentSlideIndex].type === 'audio' && (
                    <div className="flex flex-col items-center space-y-4 p-8 text-center bg-white/5 border border-white/5 rounded-2xl max-w-xs">
                      <span className="text-xs text-pink-400 font-bold uppercase tracking-wider">Voice Recording</span>
                      <audio 
                        ref={audioRef}
                        src={detailedMemory.media[currentSlideIndex].url}
                        onEnded={() => setIsPlayingAudio(false)}
                      />
                      <button
                        onClick={() => {
                          if (isPlayingAudio) {
                            audioRef.current.pause();
                            setIsPlayingAudio(false);
                          } else {
                            audioRef.current.play();
                            setIsPlayingAudio(true);
                          }
                        }}
                        className="w-16 h-16 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center transition-colors shadow-lg"
                      >
                        {isPlayingAudio ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white ml-1" />}
                      </button>
                      <p className="text-[10px] text-white/50">Recorded by partner inside this capsule.</p>
                    </div>
                  )}

                  {/* Slideshow controls (left/right) */}
                  {detailedMemory.media.length > 1 && (
                    <>
                      <button 
                        onClick={() => setCurrentSlideIndex(prev => prev === 0 ? detailedMemory.media.length - 1 : prev - 1)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setCurrentSlideIndex(prev => prev === detailedMemory.media.length - 1 ? 0 : prev + 1)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      
                      {/* Dots indicator */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 p-1.5 rounded-full">
                        {detailedMemory.media.map((_, idx) => (
                          <div 
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                              currentSlideIndex === idx ? 'bg-pink-500 w-3' : 'bg-white/40'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-white/30 text-center">
                  <Unlock className="w-12 h-12 mb-3 text-white/20" />
                  <p className="text-sm">No media files attached.</p>
                </div>
              )}
            </div>

            {/* Right/Bottom Story Panel */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-none">
              <div className="space-y-6">
                
                {/* Header Title */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">
                      {detailedMemory.category}
                    </span>
                    <h3 className="text-2xl font-extrabold mt-2 tracking-tight">{detailedMemory.title}</h3>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedMemory(null);
                      setDetailedMemory(null);
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Sub details: Date & Location */}
                <div className="flex flex-wrap gap-4 text-xs text-white/50 border-b border-white/5 pb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Memory Date: {new Date(detailedMemory.date).toLocaleDateString()}</span>
                  </span>
                  {detailedMemory.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{detailedMemory.location}</span>
                    </span>
                  )}
                </div>

                {/* Narrative text */}
                <div className="text-sm text-white/80 leading-relaxed font-light whitespace-pre-wrap">
                  {detailedMemory.description}
                </div>

                {/* Tags */}
                {detailedMemory.tags && detailedMemory.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {detailedMemory.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 border border-white/5 text-white/60">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons: Export/Delete */}
              <div className="border-t border-white/5 pt-6 mt-6 flex gap-4">
                <button
                  onClick={handleExportPDF}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Book / PDF</span>
                </button>
                <button
                  onClick={() => handleDeleteMemory(detailedMemory._id)}
                  className="py-3 px-4 rounded-xl bg-red-500/10 hover:bg-red-600 border border-red-500/20 text-red-200 hover:text-white text-xs font-bold transition-all"
                  title="Delete Capsule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* HTML Print Layout View (Clean stylesheet-triggered print card) */}
      {detailedMemory && (
        <div className="hidden print:block p-8 space-y-6 text-black bg-white min-h-screen">
          <div className="border-b-2 border-pink-500 pb-4 text-center">
            <h1 className="text-3xl font-bold uppercase tracking-wide">TimeCapsule Memory Book</h1>
            <p className="text-xs text-gray-500 italic mt-1">Preserved on TimeCapsule &bull; Unlocked on {new Date(detailedMemory.unlockDate).toLocaleDateString()}</p>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{detailedMemory.title}</h2>
            <div className="flex gap-6 text-sm text-gray-600 italic">
              <span>Date: {new Date(detailedMemory.date).toLocaleDateString()}</span>
              {detailedMemory.location && <span>Location: {detailedMemory.location}</span>}
              <span>Category: {detailedMemory.category}</span>
              <span>Mood: {detailedMemory.mood}</span>
            </div>
            <p className="text-gray-800 leading-relaxed text-base pt-4 whitespace-pre-wrap">{detailedMemory.description}</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default MemoryList;
