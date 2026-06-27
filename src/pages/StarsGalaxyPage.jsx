import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Orbit, 
  Sparkles, 
  Unlock, 
  Calendar, 
  MapPin, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download,
  Trash2,
  Play,
  Pause,
  AlertCircle
} from 'lucide-react';

const StarsGalaxyPage = () => {
  const { token } = useAuth();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);

  // Detail Modal states (reused from MemoryList)
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [detailedMemory, setDetailedMemory] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Audio Playback
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);

  // Hover state for tooltip overlay
  const [hoveredStar, setHoveredStar] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Galaxy rendering simulation variables
  const starsRef = useRef([]);
  const rotationAngleRef = useRef(0);
  const animationFrameIdRef = useRef(null);
  const zoomFactorRef = useRef(1);
  const targetZoomRef = useRef(1);
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const targetPanOffsetRef = useRef({ x: 0, y: 0 });
  const clickedStarRef = useRef(null);

  const fetchUnlockedMemories = async () => {
    setLoading(true);
    try {
      // Fetch only unlocked memories for the galaxy stars
      const res = await fetch('/api/memories?isLocked=false', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('timecapsule-token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMemories(data);
        generateStarCoordinates(data);
      }
    } catch (err) {
      console.error('Error fetching memories for galaxy:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUnlockedMemories();
    }
  }, [token]);

  // Generate unique polar coordinates for each memory star in a spiral galaxy shape
  const generateStarCoordinates = (memList) => {
    const list = [];
    
    // Background twinkle stars (static background particles)
    const bgCount = 200;
    const bgStars = [];
    for (let i = 0; i < bgCount; i++) {
      const radius = Math.random() * 400 + 50;
      const angle = Math.random() * Math.PI * 2;
      bgStars.push({
        radius,
        angle,
        speed: Math.random() * 0.0003 + 0.0001,
        size: Math.random() * 1 + 0.5,
        alpha: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.005
      });
    }

    // Memory stars
    memList.forEach((mem, idx) => {
      // Spiral positioning coordinates
      const angle = (idx * 0.9) + (Math.random() * 0.2);
      const radius = (idx * 25) + 60 + (Math.random() * 15);
      
      // Determine star color by mood
      let color = '#3b82f6'; // blue default
      if (mem.mood === 'Romantic') color = '#ec4899'; // pink
      else if (mem.mood === 'Joyful') color = '#eab308'; // yellow
      else if (mem.mood === 'Funny' || mem.mood === 'Funny Moment') color = '#f97316'; // orange
      else if (mem.mood === 'Peaceful') color = '#06b6d4'; // cyan
      else if (mem.mood === 'Nostalgic') color = '#a855f7'; // purple

      list.push({
        memory: mem,
        radius,
        angle,
        color,
        size: Math.random() * 3 + 4, // size 4 to 7
        pulseDir: 1,
        pulseScale: 1
      });
    });

    starsRef.current = {
      bgStars,
      memStars: list
    };
  };

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loading || !starsRef.current.memStars) return;

    const ctx = canvas.getContext('2d');
    
    // Resize handler
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = 500;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const centerX = w / 2;
      const centerY = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Deep space backdrop
      ctx.fillStyle = '#05040d';
      ctx.fillRect(0, 0, w, h);

      // Apply zoom and panning animations
      zoomFactorRef.current += (targetZoomRef.current - zoomFactorRef.current) * 0.08;
      panOffsetRef.current.x += (targetPanOffsetRef.current.x - panOffsetRef.current.x) * 0.08;
      panOffsetRef.current.y += (targetPanOffsetRef.current.y - panOffsetRef.current.y) * 0.08;

      // Draw glowing background nebula core
      const coreGlow = ctx.createRadialGradient(
        centerX + panOffsetRef.current.x,
        centerY + panOffsetRef.current.y,
        0,
        centerX + panOffsetRef.current.x,
        centerY + panOffsetRef.current.y,
        150 * zoomFactorRef.current
      );
      coreGlow.addColorStop(0, 'rgba(236, 72, 153, 0.08)'); // pink core
      coreGlow.addColorStop(0.5, 'rgba(139, 92, 246, 0.04)'); // purple outer
      coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coreGlow;
      ctx.fillRect(0, 0, w, h);

      rotationAngleRef.current += 0.001; // rotation speed

      // 1. Draw Twinkle Background Stars
      if (starsRef.current.bgStars) {
        starsRef.current.bgStars.forEach(star => {
          // Adjust angle by speed
          star.angle += star.speed;
          
          const x = centerX + Math.cos(star.angle) * star.radius;
          const y = centerY + Math.sin(star.angle) * star.radius;

          // Twinkle logic
          star.alpha += star.twinkleSpeed * star.pulseDir;
          if (star.alpha >= 0.8) {
            star.pulseDir = -1;
          } else if (star.alpha <= 0.2) {
            star.pulseDir = 1;
          }

          ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, star.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 2. Draw memory stars
      if (starsRef.current.memStars) {
        starsRef.current.memStars.forEach(star => {
          // Rotate around center
          const currentAngle = star.angle + rotationAngleRef.current;
          
          // Polar to Cartesian coordinate mapping
          const x = centerX + Math.cos(currentAngle) * star.radius * zoomFactorRef.current + panOffsetRef.current.x;
          const y = centerY + Math.sin(currentAngle) * star.radius * zoomFactorRef.current + panOffsetRef.current.y;

          // Keep cartesian coords on star object for mouse pointer checking
          star.x = x;
          star.y = y;

          // Pulse size animation
          star.pulseScale += 0.01 * star.pulseDir;
          if (star.pulseScale >= 1.25) star.pulseDir = -1;
          else if (star.pulseScale <= 0.85) star.pulseDir = 1;

          const activeSize = star.size * star.pulseScale * (zoomFactorRef.current * 0.4 + 0.6);

          // Draw Glowing shadow halo
          ctx.shadowBlur = 15;
          ctx.shadowColor = star.color;

          ctx.fillStyle = star.color;
          ctx.beginPath();
          ctx.arc(x, y, activeSize, 0, Math.PI * 2);
          ctx.fill();

          // Reset shadow coordinates
          ctx.shadowBlur = 0;

          // Draw inner bright core of the star
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x, y, activeSize * 0.4, 0, Math.PI * 2);
          ctx.fill();

          // If hovered, draw selection rings
          if (hoveredStar && hoveredStar.memory._id === star.memory._id) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, activeSize * 2.2, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = star.color;
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(x, y, activeSize * 3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]); // clear dash
          }
        });
      }

      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [loading, memories, hoveredStar]);

  // Hover check detection
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !starsRef.current.memStars) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let found = null;
    starsRef.current.memStars.forEach(star => {
      const dist = Math.hypot(star.x - mouseX, star.y - mouseY);
      // detection boundary box
      if (dist <= 25) {
        found = star;
      }
    });

    if (found) {
      setHoveredStar(found);
      setTooltipPos({ x: found.x, y: found.y - 30 });
      canvas.style.cursor = 'pointer';
    } else {
      setHoveredStar(null);
      canvas.style.cursor = 'default';
    }
  };

  // Click handler (zooms in on star, then opens detailed modal)
  const handleCanvasClick = () => {
    if (hoveredStar) {
      const star = hoveredStar;
      clickedStarRef.current = star;

      const canvas = canvasRef.current;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Pan coordinates so the star centers
      // Offset = Center - Star (in relative terms)
      const relativeX = star.x - panOffsetRef.current.x - centerX;
      const relativeY = star.y - panOffsetRef.current.y - centerY;

      targetZoomRef.current = 2.5; // Zoom scale
      targetPanOffsetRef.current = {
        x: -relativeX * 2.5,
        y: -relativeY * 2.5
      };

      // Open memory details after zoom completes
      setTimeout(() => {
        handleOpenMemory(star.memory);
        // Reset view back
        targetZoomRef.current = 1.0;
        targetPanOffsetRef.current = { x: 0, y: 0 };
      }, 800);
    }
  };

  const handleOpenMemory = async (memory) => {
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

  const handleDeleteMemory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this memory?')) return;
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
        fetchUnlockedMemories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportPDF = () => {
    if (detailedMemory) window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Memory Galaxy</h2>
        <p className="text-sm text-white/50 mt-1">
          An interactive stellar sky where each unlocked memory sparkles as a star. Hover to view metadata, click to zoom.
        </p>
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : memories.length > 0 ? (
        <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#05040d]">
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onClick={handleCanvasClick}
            className="w-full block"
          />

          {/* Glowing galaxy guide overlays */}
          <div className="absolute top-4 left-4 p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-white/60 space-y-1.5 backdrop-blur-md pointer-events-none">
            <span className="font-bold block text-white/80">Galaxy Guide</span>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ec4899]" /><span>Romantic</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" /><span>Joyful</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" /><span>Peaceful</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" /><span>Funny Moment</span></div>
          </div>

          {/* Custom Canvas Tooltip on Hover */}
          {hoveredStar && (
            <div 
              className="absolute pointer-events-none p-3 rounded-2xl bg-slate-900/90 border border-white/15 text-left text-xs text-white space-y-1 backdrop-blur-sm -translate-x-1/2 -translate-y-full shadow-xl"
              style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full">
                {hoveredStar.memory.category}
              </span>
              <h4 className="font-bold text-white pt-1">{hoveredStar.memory.title}</h4>
              <p className="text-[10px] text-white/50">{new Date(hoveredStar.memory.date).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel p-16 text-center text-white/40 text-sm">
          <Orbit className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p>No unlocked memory stars visible in the sky.</p>
          <p className="text-xs mt-1">Unlock a memory from your Time Capsule to make it a star!</p>
        </div>
      )}

      {/* ==========================================
         DETAILED MEMORY MODAL (COPIED FROM MEMORYLIST)
         ========================================== */}
      {selectedMemory && detailedMemory && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto no-print">
          <div className="glass-panel w-full max-w-4xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            
            {/* Left Media Slideshow */}
            <div className="w-full md:w-1/2 bg-black/40 flex flex-col justify-between relative min-h-[300px] md:min-h-0">
              {detailedMemory.media && detailedMemory.media.length > 0 ? (
                <div className="flex-1 flex items-center justify-center p-4 relative h-full">
                  {detailedMemory.media[currentSlideIndex].type === 'image' && (
                    <img src={detailedMemory.media[currentSlideIndex].url} alt="" className="max-h-[350px] md:max-h-[500px] w-auto object-contain rounded-xl" />
                  )}
                  {detailedMemory.media[currentSlideIndex].type === 'video' && (
                    <video src={detailedMemory.media[currentSlideIndex].url} controls className="max-h-[350px] md:max-h-[500px] w-full object-contain rounded-xl" />
                  )}
                  {detailedMemory.media[currentSlideIndex].type === 'audio' && (
                    <div className="flex flex-col items-center space-y-4 p-8 text-center bg-white/5 border border-white/5 rounded-2xl max-w-xs">
                      <span className="text-xs text-pink-400 font-bold uppercase tracking-wider">Voice Recording</span>
                      <audio ref={audioRef} src={detailedMemory.media[currentSlideIndex].url} onEnded={() => setIsPlayingAudio(false)} />
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
                        className="w-16 h-16 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center transition-colors"
                      >
                        {isPlayingAudio ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white ml-1" />}
                      </button>
                    </div>
                  )}

                  {/* Slideshow dots/arrows */}
                  {detailedMemory.media.length > 1 && (
                    <>
                      <button onClick={() => setCurrentSlideIndex(p => p === 0 ? detailedMemory.media.length - 1 : p - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 border border-white/10 text-white"><ChevronLeft className="w-5 h-5" /></button>
                      <button onClick={() => setCurrentSlideIndex(p => p === detailedMemory.media.length - 1 ? 0 : p + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 border border-white/10 text-white"><ChevronRight className="w-5 h-5" /></button>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-white/30 text-center">
                  <Unlock className="w-12 h-12 text-white/20 mb-3" />
                  <p className="text-sm">No media files attached.</p>
                </div>
              )}
            </div>

            {/* Right Story details */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-none">
              <div className="space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">
                      {detailedMemory.category}
                    </span>
                    <h3 className="text-2xl font-extrabold mt-2 tracking-tight">{detailedMemory.title}</h3>
                  </div>
                  <button onClick={() => { setSelectedMemory(null); setDetailedMemory(null); }} className="p-1.5 hover:bg-white/10 rounded-xl text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-white/50 border-b border-white/5 pb-4">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /><span>{new Date(detailedMemory.date).toLocaleDateString()}</span></span>
                  {detailedMemory.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /><span>{detailedMemory.location}</span></span>}
                </div>

                <div className="text-sm text-white/80 leading-relaxed font-light whitespace-pre-wrap">{detailedMemory.description}</div>
              </div>

              <div className="border-t border-white/5 pt-6 mt-6 flex gap-4">
                <button onClick={handleExportPDF} className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5">
                  <Download className="w-3.5 h-3.5" /><span>Download Book / PDF</span>
                </button>
                <button onClick={() => handleDeleteMemory(detailedMemory._id)} className="py-3 px-4 rounded-xl bg-red-500/10 hover:bg-red-600 border border-red-500/20 text-red-200"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Hidden print view */}
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
            </div>
            <p className="text-gray-800 leading-relaxed text-base pt-4 whitespace-pre-wrap">{detailedMemory.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StarsGalaxyPage;
