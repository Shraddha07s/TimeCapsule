import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { 
  FolderHeart, 
  MapPin, 
  Tag, 
  Calendar, 
  Lock, 
  Camera, 
  Video, 
  Mic, 
  Square, 
  Play, 
  Pause,
  UploadCloud,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const CreateMemory = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mood, setMood] = useState('Romantic');
  const [category, setCategory] = useState('Date');
  const [tags, setTags] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  
  // File uploads state
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  
  // Audio recorder state
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioPlaybackRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('error');

  const moods = ['Romantic', 'Joyful', 'Peaceful', 'Funny', 'Nostalgic', 'Melancholy', 'Fight and Make-up'];
  
  const categories = [
    'Date', 'Trip', 'Celebration', 'Achievement',
    'Funny Moment', 'Random Memory', 'Fight and Make-up', 'Special Day'
  ];

  // Set default unlock date to 1 year from today (romantic default)
  useEffect(() => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setUnlockDate(nextYear.toISOString().split('T')[0]);
  }, []);

  // HTML5 Media Recorder methods
  const startRecording = async () => {
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
      setMessage('Failed to access microphone.');
      setMsgType('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      // stop tracks to release hardware
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setRecording(false);
    }
  };

  const togglePlayback = () => {
    if (!audioPlaybackRef.current) return;
    if (isPlayingAudio) {
      audioPlaybackRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlaybackRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlayingAudio(false);
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (new Date(unlockDate) <= new Date(date)) {
      setMessage('Unlock Date must be in the future, past the memory date.');
      showToast('Unlock Date must be in the future, past the memory date.', 'error');
      setMsgType('error');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('mood', mood);
      formData.append('category', category);
      formData.append('tags', tags);
      formData.append('date', date);
      formData.append('location', location);
      formData.append('unlockDate', unlockDate);

      // Append image files
      images.forEach(img => {
        formData.append('image', img);
      });

      // Append video files
      videos.forEach(vid => {
        formData.append('video', vid);
      });

      // Append recorded voice note
      if (audioBlob) {
        formData.append('audio', audioBlob, 'voicenote.webm');
      }

      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('timecapsule-token')}`
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setMsgType('success');
        setMessage('Memory sealed into the capsule! Redirecting...');
        showToast('Memory sealed in capsule successfully!', 'success');
        setTimeout(() => {
          navigate('/memories');
        }, 1500);
      } else {
        setMsgType('error');
        setMessage(data.message || 'Failed to create memory.');
        showToast(data.message || 'Failed to create memory.', 'error');
      }
    } catch (err) {
      console.error(err);
      setMsgType('error');
      setMessage('Server connection failed.');
      showToast('Server connection failed during memory creation', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto pb-12">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Lock a New Memory</h2>
        <p className="text-sm text-white/50 mt-1">Pack your letters, notes, and photos, choose an unlock date, and seal it away.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm ${
          msgType === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-300' : 'bg-red-500/10 border border-red-500/20 text-red-300'
        }`}>
          {msgType === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl space-y-6">
        
        {/* Memory Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 pl-1">
            Memory Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Our First Date in Central Park"
            className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 px-4 text-sm focus:border-pink-500 outline-none transition-colors"
          />
        </div>

        {/* Memory description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 pl-1">
            The Story / Descriptions
          </label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write down the details of what happened, what you felt, and how you want to remember this moment..."
            rows={5}
            className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 px-4 text-sm focus:border-pink-500 outline-none transition-colors resize-none"
          />
        </div>

        {/* Category and Mood selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 pl-1">
              Category
            </label>
            <div className="relative">
              <FolderHeart className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:border-pink-500 outline-none transition-colors appearance-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 pl-1">
              Overall Mood
            </label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 px-4 text-sm focus:border-pink-500 outline-none transition-colors appearance-none"
            >
              {moods.map((m) => (
                <option key={m} value={m} className="bg-slate-900 text-white">{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Location, Tags and memory date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 pl-1">
              Location (Optional)
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="New York, NY"
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:border-pink-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 pl-1">
              Tags (Comma separated)
            </label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="anniversary, park, sunset"
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:border-pink-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 pl-1">
              Date of Memory
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:border-pink-500 outline-none transition-colors text-white"
              />
            </div>
          </div>
        </div>

        {/* Media Attachments Section */}
        <div className="border-t border-white/10 pt-6 space-y-4">
          <h4 className="text-sm font-bold pl-1">Attach Media</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File Inputs (Photos/Videos) */}
            <div className="space-y-4">
              {/* Photo Upload */}
              <div className="space-y-2">
                <span className="block text-xs font-semibold uppercase tracking-wider text-white/50 pl-1">Photos</span>
                <div className="relative flex items-center justify-center border border-dashed border-white/10 rounded-2xl p-4 bg-black/10 hover:bg-black/20 transition-all cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImages(Array.from(e.target.files))}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="text-center space-y-1.5 pointer-events-none">
                    <Camera className="w-6 h-6 mx-auto text-pink-500" />
                    <p className="text-xs text-white/60">
                      {images.length > 0 ? `${images.length} photos selected` : 'Click or drop photos here'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Video Upload */}
              <div className="space-y-2">
                <span className="block text-xs font-semibold uppercase tracking-wider text-white/50 pl-1">Videos</span>
                <div className="relative flex items-center justify-center border border-dashed border-white/10 rounded-2xl p-4 bg-black/10 hover:bg-black/20 transition-all cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={(e) => setVideos(Array.from(e.target.files))}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="text-center space-y-1.5 pointer-events-none">
                    <Video className="w-6 h-6 mx-auto text-violet-500" />
                    <p className="text-xs text-white/60">
                      {videos.length > 0 ? `${videos.length} videos selected` : 'Click or drop videos here'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Audio Recorder Module */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-center items-center space-y-4">
              <span className="block text-xs font-semibold uppercase tracking-wider text-white/50 text-center w-full border-b border-white/10 pb-2">
                Voice Note Recorder
              </span>
              
              {!audioBlob && !recording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="w-14 h-14 rounded-full bg-pink-500/20 text-pink-500 hover:bg-pink-500/30 flex items-center justify-center transition-colors shadow-lg"
                  title="Start Recording"
                >
                  <Mic className="w-6 h-6" />
                </button>
              ) : recording ? (
                <div className="text-center space-y-3">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 w-14 h-14 rounded-full bg-red-500/30 animate-ping" />
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center transition-colors relative z-10"
                      title="Stop Recording"
                    >
                      <Square className="w-5 h-5 fill-white" />
                    </button>
                  </div>
                  <p className="text-xs text-red-400 font-bold animate-pulse uppercase tracking-wider">Recording...</p>
                </div>
              ) : (
                <div className="text-center space-y-3 w-full">
                  <div className="flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={togglePlayback}
                      className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center transition-colors"
                      title="Play Preview"
                    >
                      {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAudioBlob(null);
                        setAudioUrl('');
                      }}
                      className="px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white/80 rounded-xl text-xs transition-colors font-bold"
                    >
                      Record Again
                    </button>
                  </div>
                  <p className="text-xs text-green-400 font-bold">✓ Audio note recorded successfully!</p>
                  
                  {audioUrl && (
                    <audio 
                      ref={audioPlaybackRef} 
                      src={audioUrl} 
                      className="hidden" 
                      onEnded={handleAudioEnded}
                    />
                  )}
                </div>
              )}
              <p className="text-[10px] text-white/40 text-center max-w-[200px]">Record a personal romantic message to lock inside.</p>
            </div>
          </div>
        </div>

        {/* Lock Duration (Unlock Date Selector) */}
        <div className="border-t border-white/10 pt-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-pink-400 mb-2 pl-1 flex items-center gap-1.5">
            <Lock className="w-4 h-4" />
            <span>Select Future Unlock Date</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="date"
              required
              value={unlockDate}
              onChange={(e) => setUnlockDate(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:border-pink-500 outline-none transition-colors text-white"
            />
          </div>
          <span className="text-[10px] text-white/40 block mt-1.5 pl-1">
            This memory and all attached photos, videos, and voice notes will remain strictly locked and unreadable until this date.
          </span>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 font-bold transition-all text-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              <span>Seal Capsule & Lock Memory</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateMemory;
