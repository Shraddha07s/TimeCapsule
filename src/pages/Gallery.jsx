import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Image, 
  Video, 
  Mic, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  PlaySquare,
  Sparkles,
  Calendar
} from 'lucide-react';

const Gallery = () => {
  const { token } = useAuth();
  
  // Gallery states
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [audioNotes, setAudioNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active tab: 'photos', 'videos', 'audio'
  const [activeTab, setActiveTab] = useState('photos');

  // Slideshow modal state
  const [slideshowActive, setSlideshowActive] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideshowPlaying, setSlideshowPlaying] = useState(false);
  const slideshowTimerRef = useRef(null);

  // Audio note playback state
  const [activeAudioUrl, setActiveAudioUrl] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioPlayerRef = useRef(null);

  const fetchGalleryMedia = async () => {
    setLoading(true);
    try {
      // Fetch only unlocked memories (isLocked=false)
      const res = await fetch('/api/memories?isLocked=false', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('timecapsule-token')}`
        }
      });
      if (res.ok) {
        const memories = await res.json();
        
        const extractedPhotos = [];
        const extractedVideos = [];
        const extractedAudio = [];

        memories.forEach(mem => {
          if (mem.media) {
            mem.media.forEach(file => {
              const mediaItem = {
                _id: mem._id,
                title: mem.title,
                date: mem.date,
                url: file.url
              };
              
              if (file.type === 'image') {
                extractedPhotos.push(mediaItem);
              } else if (file.type === 'video') {
                extractedVideos.push(mediaItem);
              } else if (file.type === 'audio') {
                extractedAudio.push(mediaItem);
              }
            });
          }
        });

        setPhotos(extractedPhotos);
        setVideos(extractedVideos);
        setAudioNotes(extractedAudio);
      }
    } catch (err) {
      console.error('Error fetching gallery media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchGalleryMedia();
    }
  }, [token]);

  // Slideshow play/pause timer
  useEffect(() => {
    if (slideshowPlaying && slideshowActive) {
      slideshowTimerRef.current = setInterval(() => {
        setSlideIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1));
      }, 3000); // cycle every 3s
    } else {
      if (slideshowTimerRef.current) {
        clearInterval(slideshowTimerRef.current);
      }
    }
    return () => {
      if (slideshowTimerRef.current) clearInterval(slideshowTimerRef.current);
    };
  }, [slideshowPlaying, slideshowActive, photos.length]);

  const handleOpenSlideshow = (index) => {
    if (photos.length === 0) return;
    setSlideIndex(index);
    setSlideshowActive(true);
    setSlideshowPlaying(true);
  };

  const handleCloseSlideshow = () => {
    setSlideshowActive(false);
    setSlideshowPlaying(false);
  };

  // Audio notes playback helpers
  const handlePlayAudio = (url) => {
    if (!audioPlayerRef.current) return;
    
    if (activeAudioUrl === url) {
      if (isPlayingAudio) {
        audioPlayerRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioPlayerRef.current.play();
        setIsPlayingAudio(true);
      }
    } else {
      setActiveAudioUrl(url);
      audioPlayerRef.current.src = url;
      audioPlayerRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Memory Gallery</h2>
          <p className="text-sm text-white/50 mt-1">Revisit all unlocked photos, videos, and voice recordings in one place.</p>
        </div>

        {photos.length > 0 && activeTab === 'photos' && (
          <button
            onClick={() => handleOpenSlideshow(0)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white text-xs font-bold shadow-lg shadow-pink-500/10 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform"
          >
            <PlaySquare className="w-4 h-4" />
            <span>Launch Slideshow</span>
          </button>
        )}
      </div>

      {/* Tabs Controls */}
      <div className="flex bg-white/5 p-1 rounded-2xl max-w-sm">
        <button
          onClick={() => setActiveTab('photos')}
          className={`flex-1 py-3 text-center text-xs font-bold rounded-xl transition-all ${
            activeTab === 'photos' ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white' : 'text-white/60 hover:text-white'
          }`}
        >
          Photos ({photos.length})
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex-1 py-3 text-center text-xs font-bold rounded-xl transition-all ${
            activeTab === 'videos' ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white' : 'text-white/60 hover:text-white'
          }`}
        >
          Videos ({videos.length})
        </button>
        <button
          onClick={() => setActiveTab('audio')}
          className={`flex-1 py-3 text-center text-xs font-bold rounded-xl transition-all ${
            activeTab === 'audio' ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white' : 'text-white/60 hover:text-white'
          }`}
        >
          Voice Notes ({audioNotes.length})
        </button>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* ==========================================
             PHOTOS GRID
             ========================================== */}
          {activeTab === 'photos' && (
            photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {photos.map((photo, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleOpenSlideshow(idx)}
                    className="glass-card aspect-square rounded-2xl overflow-hidden cursor-pointer relative group border-white/5"
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Hover text Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-left">
                      <h4 className="text-xs font-bold truncate text-white">{photo.title}</h4>
                      <p className="text-[10px] text-white/60 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(photo.date).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel p-16 text-center text-white/40 text-sm">No photos unlocked yet.</div>
            )
          )}

          {/* ==========================================
             VIDEOS GRID
             ========================================== */}
          {activeTab === 'videos' && (
            videos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((vid, idx) => (
                  <div key={idx} className="glass-card rounded-2xl overflow-hidden border-white/5 flex flex-col justify-between bg-black/20">
                    <div className="aspect-video w-full relative">
                      <video src={vid.url} controls className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 text-left">
                      <h4 className="text-sm font-bold truncate text-white">{vid.title}</h4>
                      <p className="text-[10px] text-white/50 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(vid.date).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel p-16 text-center text-white/40 text-sm">No videos unlocked yet.</div>
            )
          )}

          {/* ==========================================
             VOICE NOTES GRID (RETRO CASSETTE STYLE)
             ========================================== */}
          {activeTab === 'audio' && (
            audioNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {audioNotes.map((note, idx) => {
                  const isPlayingThis = isPlayingAudio && activeAudioUrl === note.url;
                  return (
                    <div 
                      key={idx} 
                      className={`glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col justify-between ${
                        isPlayingThis ? 'bg-pink-500/5' : 'bg-black/20'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-pink-400 uppercase tracking-widest bg-pink-500/10 px-2 py-0.5 rounded-full">
                            Voice note
                          </span>
                          <h4 className="font-extrabold text-sm text-white pt-1 truncate max-w-[150px]">{note.title}</h4>
                        </div>
                        <div className="p-2 bg-white/5 rounded-xl text-white/50">
                          <Mic className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Retro cassette graphic or audio player */}
                      <div className="py-4 flex items-center justify-center">
                        <button
                          onClick={() => handlePlayAudio(note.url)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            isPlayingThis ? 'bg-red-500 text-white' : 'bg-pink-500 text-white hover:bg-pink-600 hover:scale-105 shadow-md shadow-pink-500/10'
                          }`}
                        >
                          {isPlayingThis ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                        </button>
                      </div>

                      <div className="text-[10px] text-white/40 flex justify-between border-t border-white/5 pt-3 mt-2">
                        <span>Unlocked Capsule</span>
                        <span>{new Date(note.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-panel p-16 text-center text-white/40 text-sm">No voice notes unlocked yet.</div>
            )
          )}
        </div>
      )}

      {/* Hidden audio element for global player */}
      <audio 
        ref={audioPlayerRef} 
        className="hidden" 
        onEnded={() => setIsPlayingAudio(false)} 
      />

      {/* ==========================================
         CINEMATIC SLIDESHOW MODE MODAL OVERLAY
         ========================================== */}
      {slideshowActive && photos.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-6">
          {/* Header toolbar */}
          <div className="flex justify-between items-center text-white relative z-10">
            <div>
              <h4 className="font-bold text-sm text-white/70">Cinematic Slideshow</h4>
              <p className="text-xs text-white/40">{photos[slideIndex].title}</p>
            </div>
            <div className="flex gap-4 items-center">
              <button
                onClick={() => setSlideshowPlaying(!slideshowPlaying)}
                className="text-xs font-bold px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-xl border border-white/5 transition-colors"
              >
                {slideshowPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
              </button>
              <button 
                onClick={handleCloseSlideshow}
                className="p-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Slide Image */}
          <div className="flex-1 flex items-center justify-center relative p-4">
            <img 
              src={photos[slideIndex].url} 
              alt={photos[slideIndex].title} 
              className="max-h-[75vh] max-w-[85vw] object-contain rounded-2xl shadow-2xl transition-all duration-700 ease-in-out scale-100"
            />

            {/* Slide left/right controls */}
            <button
              onClick={() => setSlideIndex(prev => prev === 0 ? photos.length - 1 : prev - 1)}
              className="absolute left-6 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setSlideIndex(prev => prev === photos.length - 1 ? 0 : prev + 1)}
              className="absolute right-6 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Footer Timeline bar */}
          <div className="w-full max-w-lg mx-auto text-center space-y-3 relative z-10 pb-4">
            <span className="text-xs text-white/60 font-semibold uppercase tracking-wider">
              Slide {slideIndex + 1} of {photos.length}
            </span>
            <div className="flex justify-center gap-1.5">
              {photos.map((_, idx) => (
                <div 
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all ${
                    slideIndex === idx ? 'bg-pink-500 w-4' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
