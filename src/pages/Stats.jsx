import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Star, Flame, Calendar, Sparkles, FolderHeart } from 'lucide-react';

const Stats = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats/details', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('timecapsule-token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Categories helper calculations
  const categoriesList = Object.keys(stats?.categoryCounts || {});
  const categoryValues = Object.values(stats?.categoryCounts || {});
  const maxVal = Math.max(...categoryValues, 1);

  // SVG Area Chart calculations for Monthly Activity
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = stats?.monthlyActivity || Array(12).fill(0);
  const maxMonthVal = Math.max(...monthlyData, 1);

  // Generate SVG Line Chart Path
  const width = 600;
  const height = 180;
  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = monthlyData.map((val, idx) => {
    const x = padding + (idx / 11) * chartWidth;
    const y = height - padding - (val / maxMonthVal) * chartHeight;
    return { x, y, val };
  });

  const linePath = points.reduce((path, p, idx) => {
    return path + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y} `;
  }, '');

  // Gradient area underneath the line
  const areaPath = linePath 
    ? `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z` 
    : '';

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Statistics</h2>
        <p className="text-sm text-white/50 mt-1">Track your memory streak, category shares, and capsule growth charts.</p>
      </div>

      {/* Row 1: Streaks and counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Streak */}
        <div className="glass-card p-6 flex items-center justify-between bg-gradient-to-br from-pink-500/5 to-transparent">
          <div className="space-y-2">
            <p className="text-xs font-bold text-pink-400 uppercase tracking-widest flex items-center gap-1">
              <Flame className="w-4 h-4 fill-pink-500" />
              <span>Current Streak</span>
            </p>
            <h3 className="text-4xl font-black">{stats?.currentStreak || 0} Days</h3>
            <p className="text-[10px] text-white/40">Consecutive memory sealing days.</p>
          </div>
          {/* Animated Gauge Dial */}
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-full h-full transform -rotate-95" viewBox="0 0 36 36">
              <path className="text-white/5" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-pink-500" strokeWidth="3.5" strokeDasharray={`${Math.min(100, ((stats?.currentStreak || 0) / 10) * 100)}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-pink-400">
              {stats?.currentStreak || 0}
            </div>
          </div>
        </div>

        {/* Max Streak */}
        <div className="glass-card p-6 flex items-center justify-between bg-gradient-to-br from-violet-500/5 to-transparent">
          <div className="space-y-2">
            <p className="text-xs font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1">
              <Star className="w-4 h-4 fill-violet-500" />
              <span>Max Streak</span>
            </p>
            <h3 className="text-4xl font-black">{stats?.maxStreak || 0} Days</h3>
            <p className="text-[10px] text-white/40">Our highest active streak.</p>
          </div>
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-full h-full transform -rotate-95" viewBox="0 0 36 36">
              <path className="text-white/5" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-violet-500" strokeWidth="3.5" strokeDasharray={`${Math.min(100, ((stats?.maxStreak || 0) / 30) * 100)}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-violet-400">
              {stats?.maxStreak || 0}
            </div>
          </div>
        </div>

        {/* Total stats */}
        <div className="glass-card p-6 flex flex-col justify-center bg-white/5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">Memories</span>
              <span className="text-2xl font-black text-white">{stats?.totalMemories || 0}</span>
            </div>
            <div>
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">Letters</span>
              <span className="text-2xl font-black text-white">{stats?.totalLetters || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Category Breakdown (custom glowing SVG horizontal bars) */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl space-y-6">
          <h3 className="text-lg font-bold tracking-tight text-white/85 flex items-center gap-2">
            <FolderHeart className="w-5 h-5 text-pink-500" />
            <span>Category breakdown</span>
          </h3>

          <div className="space-y-4">
            {categoriesList.map((cat) => {
              const val = stats.categoryCounts[cat] || 0;
              const percent = (val / maxVal) * 100;
              return (
                <div key={cat} className="space-y-1.5 text-left text-sm">
                  <div className="flex justify-between font-semibold px-1">
                    <span className="text-white/80">{cat}</span>
                    <span className="text-pink-400">{val}</span>
                  </div>
                  {/* Glowing progress line */}
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-pink-500 to-violet-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_#ec4899]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Yearly Activity Chart (custom SVG Curved area line graph) */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl space-y-6">
          <h3 className="text-lg font-bold tracking-tight text-white/85 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-violet-400" />
            <span>Monthly Activity ({new Date().getFullYear()})</span>
          </h3>

          <div className="w-full overflow-x-auto">
            <div className="min-w-[500px] flex justify-center py-2">
              <svg width={width} height={height} className="overflow-visible">
                <defs>
                  {/* Glowing Area Fill Gradient */}
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                  </linearGradient>
                  {/* Line Gradient */}
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>

                {/* Horizontal dotted gridlines */}
                {[0, 0.5, 1].map((ratio, idx) => {
                  const y = padding + ratio * chartHeight;
                  return (
                    <line 
                      key={idx} 
                      x1={padding} 
                      y1={y} 
                      x2={width - padding} 
                      y2={y} 
                      stroke="rgba(255,255,255,0.06)" 
                      strokeDasharray="4" 
                    />
                  );
                })}

                {/* Shaded area underneath */}
                {areaPath && (
                  <path d={areaPath} fill="url(#areaGrad)" />
                )}

                {/* Connected curve line */}
                {linePath && (
                  <path 
                    d={linePath} 
                    fill="none" 
                    stroke="url(#lineGrad)" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                  />
                )}

                {/* Data points dots */}
                {points.map((p, idx) => (
                  <g key={idx} className="group cursor-pointer">
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r="4" 
                      fill="#fff" 
                      stroke="#ec4899" 
                      strokeWidth="2.5" 
                      className="transition-all duration-300 hover:r-6 hover:fill-pink-500"
                    />
                    {/* Tooltip */}
                    <text 
                      x={p.x} 
                      y={p.y - 12} 
                      textAnchor="middle" 
                      fill="#f3f4f6" 
                      fontSize="9" 
                      fontWeight="bold" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 pointer-events-none"
                    >
                      {p.val}
                    </text>
                  </g>
                ))}

                {/* Months labels */}
                {points.map((p, idx) => (
                  <text 
                    key={idx} 
                    x={p.x} 
                    y={height - 8} 
                    textAnchor="middle" 
                    fill="rgba(255,255,255,0.4)" 
                    fontSize="9"
                  >
                    {months[idx]}
                  </text>
                ))}
              </svg>
            </div>
          </div>

          <div className="flex gap-4 justify-center text-[10px] text-white/35 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-pink-500 rounded-full inline-block" />
              <span>Memories Created</span>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Stats;
