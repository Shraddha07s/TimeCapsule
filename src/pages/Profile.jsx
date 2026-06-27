import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Calendar, Music, Sparkles, Check } from 'lucide-react';

const Profile = () => {
  const { user, partner, coupleDetails, updateProfile } = useAuth();
  
  // Tabs: 'profile', 'relationship', 'favorites'
  const [activeTab, setActiveTab] = useState('profile');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  
  const [anniversaryDate, setAnniversaryDate] = useState(
    coupleDetails?.anniversaryDate || user?.anniversaryDate || ''
  );
  const [relationshipStartDate, setRelationshipStartDate] = useState(
    coupleDetails?.relationshipStartDate || user?.relationshipStartDate || ''
  );
  
  const [favoriteSong, setFavoriteSong] = useState(
    coupleDetails?.favoriteSong || user?.favoriteSong || ''
  );
  const [sharedPlaylist, setSharedPlaylist] = useState(
    coupleDetails?.sharedPlaylist || ''
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  useEffect(() => {
    if (coupleDetails) {
      setAnniversaryDate(coupleDetails.anniversaryDate || '');
      setRelationshipStartDate(coupleDetails.relationshipStartDate || '');
      setFavoriteSong(coupleDetails.favoriteSong || '');
      setSharedPlaylist(coupleDetails.sharedPlaylist || '');
    } else if (user) {
      setAnniversaryDate(user.anniversaryDate || '');
      setRelationshipStartDate(user.relationshipStartDate || '');
      setFavoriteSong(user.favoriteSong || '');
    }
  }, [user, coupleDetails]);

  // Predefined avatar selections
  const presetAvatars = [
    'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=150', // Cute hearts
    'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=150', // Rose petals
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', // Cute Woman
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', // Cute Man
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', // Starry girl
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'  // Happy man
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (relationshipStartDate) {
      const parsedRel = new Date(relationshipStartDate);
      if (isNaN(parsedRel.getTime())) {
        setMessage('Relationship Start Date is invalid.');
        setLoading(false);
        return;
      }
      if (parsedRel > new Date()) {
        setMessage('Relationship Start Date cannot be in the future.');
        setLoading(false);
        return;
      }
    }

    if (anniversaryDate) {
      const parsedAnn = new Date(anniversaryDate);
      if (isNaN(parsedAnn.getTime())) {
        setMessage('Anniversary Date is invalid.');
        setLoading(false);
        return;
      }
    }

    const updateData = {
      username,
      bio,
      avatar,
      anniversaryDate,
      relationshipStartDate,
      favoriteSong,
      sharedPlaylist
    };

    try {
      const result = await updateProfile(updateData);
      if (result.success) {
        setMessage('Settings successfully updated!');
      } else {
        setMessage(result.message || 'Failed to save changes.');
      }
    } catch (err) {
      setMessage('An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Profile Settings</h2>
        <p className="text-sm text-white/50 mt-1">Configure your personal and shared relationship milestones.</p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-center">
          {message}
        </div>
      )}

      {/* Tabs Navigator */}
      <div className="flex border-b border-white/10 gap-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 font-semibold text-sm transition-colors relative ${
            activeTab === 'profile' ? 'text-pink-500' : 'text-white/60 hover:text-white'
          }`}
        >
          <span>Personal Details</span>
          {activeTab === 'profile' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('relationship')}
          className={`pb-3 font-semibold text-sm transition-colors relative ${
            activeTab === 'relationship' ? 'text-pink-500' : 'text-white/60 hover:text-white'
          }`}
        >
          <span>Relationship Dates</span>
          {activeTab === 'relationship' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`pb-3 font-semibold text-sm transition-colors relative ${
            activeTab === 'favorites' ? 'text-pink-500' : 'text-white/60 hover:text-white'
          }`}
        >
          <span>Favorites</span>
          {activeTab === 'favorites' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="glass-panel p-8 rounded-3xl space-y-6 max-w-2xl relative overflow-hidden">
        {/* ==========================================
           TAB 1: PERSONAL DETAILS
           ========================================== */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold flex items-center gap-2 text-pink-400">
              <User className="w-5 h-5" />
              <span>Personal Details</span>
            </h3>

            {/* Avatar Select */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 pl-1">
                Profile Avatar
              </label>
              
              {/* Display Active Avatar */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xl overflow-hidden shrink-0">
                  {avatar ? (
                    <img src={avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span>{username.charAt(0).toUpperCase() || 'U'}</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="Paste custom avatar image URL"
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-2 px-3 text-xs focus:border-pink-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Preset selection grid */}
              <p className="text-xs text-white/40 pl-1">Or choose a preset illustration:</p>
              <div className="flex flex-wrap gap-3">
                {presetAvatars.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(url)}
                    className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                      avatar === url ? 'border-pink-500 scale-105' : 'border-transparent'
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 pl-1">
                Your Display Name
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Taylor Smith"
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 px-4 text-sm focus:border-pink-500 outline-none transition-colors"
              />
            </div>

            {/* Bio Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 pl-1">
                Relationship Bio / Motto
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Living our dream one sunset at a time."
                rows={3}
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 px-4 text-sm focus:border-pink-500 outline-none transition-colors resize-none"
              />
            </div>
          </div>
        )}

        {/* ==========================================
           TAB 2: RELATIONSHIP DATES
           ========================================== */}
        {activeTab === 'relationship' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold flex items-center gap-2 text-pink-400">
              <Calendar className="w-5 h-5" />
              <span>Relationship Dates</span>
            </h3>

            {/* Relationship Start Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 pl-1">
                Relationship Start Date
              </label>
              <input
                type="date"
                value={relationshipStartDate}
                onChange={(e) => setRelationshipStartDate(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 px-4 text-sm focus:border-pink-500 outline-none transition-colors text-white"
              />
              <span className="text-[10px] text-white/40 block mt-1.5 pl-1">
                Used to calculate the "Days Together" dashboard count.
              </span>
            </div>

            {/* Anniversary Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 pl-1">
                Annual Anniversary Date
              </label>
              <input
                type="date"
                value={anniversaryDate}
                onChange={(e) => setAnniversaryDate(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 px-4 text-sm focus:border-pink-500 outline-none transition-colors text-white"
              />
              <span className="text-[10px] text-white/40 block mt-1.5 pl-1">
                Used to calculate the "Next Anniversary" countdown timer.
              </span>
            </div>
          </div>
        )}

        {/* ==========================================
           TAB 3: FAVORITES
           ========================================== */}
        {activeTab === 'favorites' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold flex items-center gap-2 text-pink-400">
              <Music className="w-5 h-5" />
              <span>Shared Favorites</span>
            </h3>

            {/* Favorite Song */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 pl-1">
                Our Favorite Shared Song
              </label>
              <input
                type="text"
                value={favoriteSong}
                onChange={(e) => setFavoriteSong(e.target.value)}
                placeholder="Lover by Taylor Swift"
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 px-4 text-sm focus:border-pink-500 outline-none transition-colors"
              />
            </div>

            {/* Shared Playlist Link */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 pl-1">
                Shared Spotify / Apple Playlist URL
              </label>
              <input
                type="url"
                value={sharedPlaylist}
                onChange={(e) => setSharedPlaylist(e.target.value)}
                placeholder="https://open.spotify.com/playlist/..."
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 px-4 text-sm focus:border-pink-500 outline-none transition-colors"
              />
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 font-bold transition-all text-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Profile;
