import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Database, Cloud, Trash2, Key } from 'lucide-react';

const PrivacyPolicyPage = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.title = 'Privacy Policy - TimeCapsule';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Read about how TimeCapsule secures your love letters, reflections, passwords, and media uploads with JWT, MongoDB Atlas, and Cloudinary.');
    }
  }, []);

  const privacyContent = (
    <div className="space-y-10 max-w-3xl mx-auto px-4 py-8 animate-fade-in relative z-10 text-left">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-full bg-pink-500/10 text-pink-500 mb-1">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
          Last Updated: June 2026. Learn how we secure your love letters, weekly journals, and media files.
        </p>
      </div>

      {/* Main text block */}
      <div className="glass-panel p-8 md:p-10 rounded-3xl border border-pink-500/10 shadow-2xl space-y-8 font-light text-sm text-[var(--text-secondary)] leading-relaxed">
        
        {/* Section 1: Information Collected */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
            <Key className="w-5 h-5 text-pink-500" />
            <span>1. Information We Collect</span>
          </h3>
          <p>
            To provide a shared digital space, we collect minimum required credentials:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account Profile Data</strong>: Name, email address, bio descriptions, and custom avatar selections.</li>
            <li><strong>Encrypted Passwords</strong>: All credentials are hashed using <em>bcrypt</em> prior to storage. Plaintext passwords are never saved.</li>
            <li><strong>Sealed Memory Records</strong>: Uploaded time capsules (letters, journals, locations, and category coordinates) which remain locked until your countdown timer expires.</li>
          </ul>
        </section>

        {/* Section 2: Storage Infrastructure */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
            <Database className="w-5 h-5 text-violet-400" />
            <span>2. Data Storage & Hosting</span>
          </h3>
          <p>
            Your metadata, weekly reflections, and letter papers are hosted on **MongoDB Atlas** database clusters. We transmit data securely via HTTPS, and verify connections using signed **JSON Web Token (JWT)** headers.
          </p>
        </section>

        {/* Section 3: Media Uploads */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
            <Cloud className="w-5 h-5 text-cyan-400" />
            <span>3. Photos, Videos, & Audio Notes</span>
          </h3>
          <p>
            All media attachments (photos, videos, browser voice memos) are stored on **Cloudinary** cloud servers. The URLs are fetched dynamically. Unlocked memories are visible only to you and your linked partner.
          </p>
        </section>

        {/* Section 4: Data Erasure (GDPR) */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
            <Trash2 className="w-5 h-5 text-rose-400" />
            <span>4. User Control & Deletions</span>
          </h3>
          <p>
            You hold total control over your memories. You can delete individual memories, letters, or disconnect from your partner at any time. Deleting a memory wipes its entries from MongoDB and removes any references permanently.
          </p>
        </section>

        {/* Section 5: Educational Project Notice */}
        <div className="p-4 rounded-2xl bg-pink-500/5 border border-pink-500/10 text-xs text-pink-300 flex flex-col gap-2">
          <span className="font-bold">⚠️ Educational Sandbox Notice:</span>
          <span>
            TimeCapsule is an educational portfolio project. While we take storage privacy and token authorization seriously, the platform should not be used to store critical, highly sensitive personal credentials. Policies and uploader configurations may evolve as features expand.
          </span>
        </div>
      </div>
    </div>
  );

  if (isAuthenticated) {
    return <Layout>{privacyContent}</Layout>;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-gradient)] relative overflow-hidden flex flex-col justify-between text-[var(--text-primary)]">
      {/* Dreamy Background Spheres */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-pink-500/10 blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-600/15 blur-[120px] animate-pulse" />
      </div>

      {/* Header */}
      <header className="border-b border-white/5 py-4 px-6 glass-panel relative z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-pink-500 to-violet-400 bg-clip-text text-transparent">TimeCapsule</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm hover:text-pink-500 transition-colors">Login</Link>
            <Link to="/signup" className="px-4 py-2 text-xs font-bold bg-pink-500 hover:bg-pink-600 text-white rounded-xl transition-all">Sign Up</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center">{privacyContent}</main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-[var(--text-secondary)] opacity-60 relative z-20">
        &copy; {new Date().getFullYear()} TimeCapsule. Preserving love, one capsule at a time.
      </footer>
    </div>
  );
};

export default PrivacyPolicyPage;
