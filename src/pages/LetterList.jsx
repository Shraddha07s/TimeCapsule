import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  MailOpen, 
  Send, 
  Clock, 
  FileText, 
  User, 
  Heart, 
  ChevronRight,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

const LetterList = () => {
  const { user, partner, token } = useAuth();
  
  // Tabs: 'inbox' (read letters), 'write' (write new letter)
  const [activeTab, setActiveTab] = useState('inbox');
  const [inboxSubTab, setInboxSubTab] = useState('received'); // 'received', 'sent', 'self'
  
  // Write form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [recipientType, setRecipientType] = useState('self'); // 'self', 'partner'
  const [unlockDate, setUnlockDate] = useState('');

  // Letters archive state
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [detailedLetter, setDetailedLetter] = useState(null);
  const [loadingLetterDetails, setLoadingLetterDetails] = useState(false);
  const [now, setNow] = useState(new Date());

  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('error');

  // Real-time ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Set default unlock date (1 year out)
  useEffect(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    setUnlockDate(d.toISOString().split('T')[0]);
  }, []);

  const fetchLetters = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/letters', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('timecapsule-token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLetters(data);
      }
    } catch (err) {
      console.error('Error fetching letters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchLetters();
    }
  }, [token, activeTab]);

  const handleCreateLetter = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (new Date(unlockDate) <= new Date()) {
      setMessage('Unlock Date must be in the future.');
      setMsgType('error');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/letters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('timecapsule-token')}`
        },
        body: JSON.stringify({
          title,
          content,
          recipientType,
          unlockDate
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMsgType('success');
        setMessage('Letter sealed and dropped in the mail box!');
        setTitle('');
        setContent('');
        setTimeout(() => {
          setActiveTab('inbox');
          setInboxSubTab(recipientType === 'partner' ? 'sent' : 'self');
          setMessage('');
        }, 1500);
      } else {
        setMsgType('error');
        setMessage(data.message || 'Failed to seal letter.');
      }
    } catch (err) {
      setMsgType('error');
      setMessage('Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLetter = async (letter) => {
    if (letter.isLocked) return;

    setSelectedLetter(letter);
    setLoadingLetterDetails(true);
    try {
      const res = await fetch(`/api/letters/${letter._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('timecapsule-token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDetailedLetter(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLetterDetails(false);
    }
  };

  const getCountdownString = (unlockDateStr) => {
    const unlock = new Date(unlockDateStr);
    const diff = unlock - now;
    if (diff <= 0) return 'Ready to read!';

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

  // Filter letters based on active sub tab
  const filteredLetters = letters.filter(l => {
    if (inboxSubTab === 'self') {
      return l.recipientType === 'self' && l.senderId === user?._id;
    }
    if (inboxSubTab === 'sent') {
      return l.recipientType === 'partner' && l.senderId === user?._id;
    }
    if (inboxSubTab === 'received') {
      return l.recipientType === 'partner' && l.recipientId === user?._id;
    }
    return false;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Future Letters</h2>
          <p className="text-sm text-white/50 mt-1">Write letters to your partner or your future self, locked away in time.</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm ${
          msgType === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-300' : 'bg-red-500/10 border border-red-500/20 text-red-300'
        }`}>
          {msgType === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message}</span>
        </div>
      )}

      {/* Main Tab Controls */}
      <div className="flex bg-white/5 p-1 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex-1 py-3 text-center text-xs font-bold rounded-xl transition-all ${
            activeTab === 'inbox' ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white' : 'text-white/60 hover:text-white'
          }`}
        >
          Letter Box
        </button>
        <button
          onClick={() => setActiveTab('write')}
          className={`flex-1 py-3 text-center text-xs font-bold rounded-xl transition-all ${
            activeTab === 'write' ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white' : 'text-white/60 hover:text-white'
          }`}
        >
          Write Letter
        </button>
      </div>

      {/* ==========================================
         TAB 1: LETTER BOX ARCHIVE
         ========================================== */}
      {activeTab === 'inbox' && (
        <div className="space-y-6">
          {/* Sub tabs selector */}
          <div className="flex gap-4 border-b border-white/10 pb-2">
            <button
              onClick={() => setInboxSubTab('received')}
              className={`pb-2 text-sm font-semibold transition-colors relative ${
                inboxSubTab === 'received' ? 'text-pink-500' : 'text-white/50 hover:text-white'
              }`}
            >
              Letters from Partner
              {inboxSubTab === 'received' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500" />}
            </button>
            <button
              onClick={() => setInboxSubTab('sent')}
              className={`pb-2 text-sm font-semibold transition-colors relative ${
                inboxSubTab === 'sent' ? 'text-pink-500' : 'text-white/50 hover:text-white'
              }`}
            >
              Letters to Partner
              {inboxSubTab === 'sent' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500" />}
            </button>
            <button
              onClick={() => setInboxSubTab('self')}
              className={`pb-2 text-sm font-semibold transition-colors relative ${
                inboxSubTab === 'self' ? 'text-pink-500' : 'text-white/50 hover:text-white'
              }`}
            >
              Letters to Myself
              {inboxSubTab === 'self' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500" />}
            </button>
          </div>

          {loading ? (
            <div className="min-h-[30vh] flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredLetters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLetters.map((l) => (
                <div 
                  key={l._id}
                  onClick={() => !l.isLocked && handleOpenLetter(l)}
                  className={`glass-card p-6 flex flex-col justify-between relative overflow-hidden transition-all ${
                    l.isLocked ? 'cursor-default border-white/5' : 'cursor-pointer hover:border-pink-500/30'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        l.isLocked ? 'bg-pink-500/10 text-pink-400' : 'bg-green-500/10 text-green-400'
                      }`}>
                        {l.isLocked ? 'Locked' : 'Unlocked'}
                      </span>
                      <MailOpen className={`w-5 h-5 ${l.isLocked ? 'text-white/20' : 'text-green-400'}`} />
                    </div>

                    <div>
                      <h4 className="font-extrabold text-base truncate pr-2">{l.title}</h4>
                      <p className="text-[10px] text-white/40 mt-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Unlock Date: {new Date(l.unlockDate).toLocaleDateString()}</span>
                      </p>
                    </div>

                    {l.isLocked && (
                      <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs font-semibold text-pink-300 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-pink-400 shrink-0" />
                        <span>Unlocks in: {getCountdownString(l.unlockDate)}</span>
                      </div>
                    )}
                  </div>

                  {!l.isLocked && (
                    <button className="w-full mt-4 py-2 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Read Letter</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-white/40 text-sm">
              No letters in this archive yet.
            </div>
          )}
        </div>
      )}

      {/* ==========================================
         TAB 2: WRITE LETTER FORM
         ========================================== */}
      {activeTab === 'write' && (
        <form onSubmit={handleCreateLetter} className="glass-panel p-8 rounded-3xl space-y-6 max-w-2xl">
          <h3 className="text-lg font-bold text-pink-400 flex items-center gap-2">
            <Send className="w-5 h-5" />
            <span>Write Future Letter</span>
          </h3>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 pl-1">
              Letter Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A message to read when things get tough"
              className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 px-4 text-sm focus:border-pink-500 outline-none transition-colors"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 pl-1">
              Letter Contents
            </label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your heart out here. Take your time, express your deepest thoughts. They will read it exactly on the unlock date you choose..."
              rows={8}
              className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 px-4 text-sm focus:border-pink-500 outline-none transition-colors resize-none"
            />
          </div>

          {/* Recipient selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 pl-1">
                Deliver to
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:border-pink-500 outline-none transition-colors appearance-none"
                >
                  <option value="self" className="bg-slate-900 text-white">My Future Self</option>
                  {partner && <option value="partner" className="bg-slate-900 text-white">My Partner ({partner.username})</option>}
                </select>
              </div>
            </div>

            {/* Custom unlock date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 pl-1">
                Unlock Date
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="date"
                  required
                  value={unlockDate}
                  onChange={(e) => setUnlockDate(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:border-pink-500 outline-none transition-colors text-white"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 font-bold transition-all text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Heart className="w-4 h-4 fill-current" />
                <span>Seal Letter in Time</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* ==========================================
         LETTER READER MODAL
         ========================================== */}
      {selectedLetter && detailedLetter && (
        <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-2xl bg-[#fcf8f2] border-8 border-[#efebe4] text-[#4f3f35] rounded-3xl p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto flex flex-col justify-between">
            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedLetter(null);
                setDetailedLetter(null);
              }}
              className="absolute right-6 top-6 p-2 rounded-full hover:bg-[#eae6de] text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Letter Header */}
            <div className="border-b border-[#dfdbd5] pb-4 mb-6">
              <span className="text-[10px] font-bold tracking-widest uppercase text-pink-600">
                {detailedLetter.recipientType === 'self' ? 'Letter to Self' : 'Letter to Partner'}
              </span>
              <h3 className="text-3xl font-extrabold tracking-tight font-serif text-[#3a2e26] mt-2">
                {detailedLetter.title}
              </h3>
              <p className="text-xs text-gray-500 mt-2 font-mono">
                Sealed: {new Date(detailedLetter.createdAt).toLocaleDateString()} &bull; Unlocked: {new Date(detailedLetter.unlockDate).toLocaleDateString()}
              </p>
            </div>

            {/* Letter Body (Paper design with cursive styled spacing) */}
            <div className="flex-1 font-serif text-base md:text-lg leading-loose whitespace-pre-wrap italic text-[#4a3b31] min-h-[250px] pl-2">
              {detailedLetter.content}
            </div>

            {/* Letter Footer */}
            <div className="border-t border-[#dfdbd5] pt-6 mt-6 flex justify-between items-center text-xs font-mono text-gray-500">
              <span>TimeCapsule Archive</span>
              <span>With Love.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LetterList;
