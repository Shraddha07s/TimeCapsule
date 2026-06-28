import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { Heart, Mail, Copy, Check, Github, Linkedin, MessageSquare, Send } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const ContactPage = () => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useNotification();
  const [copied, setCopied] = useState(false);
  const emailAddress = 'sharmalily0777@gmail.com';

  useEffect(() => {
    document.title = 'Contact Us - TimeCapsule';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Get in touch with the TimeCapsule support and feedback team. Reach out for features suggestions, issues reports, or collaborations.');
    }
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopied(true);
    showToast('Email address copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const contactContent = (
    <div className="max-w-md mx-auto px-4 py-12 animate-fade-in relative z-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-full bg-pink-500/10 text-pink-500 mb-1">
          <MessageSquare className="w-7 h-7" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Contact Us</h1>
        <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto leading-relaxed">
          Feel free to reach out for feedback, suggestions, or collaborations. We would love to hear from you.
        </p>
      </div>

      {/* Glassmorphic Contact Card */}
      <div className="glass-panel p-8 rounded-3xl border border-pink-500/10 shadow-2xl space-y-6 hover:scale-[1.01] transition-transform">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-pink-500 pl-1">
            <Mail className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Email Address</span>
          </div>

          <div className="bg-black/15 dark:bg-black/25 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-3">
            <span className="text-sm font-medium select-all truncate text-white/95">{emailAddress}</span>
            <button
              onClick={copyToClipboard}
              className={`p-2.5 rounded-xl border transition-all shrink-0 ${
                copied 
                  ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                  : 'bg-white/5 border-white/10 text-white/55 hover:text-white hover:bg-white/10'
              }`}
              title="Copy email to clipboard"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Social Handles</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Social Places */}
        <div className="flex justify-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-pink-500/30 transition-all flex items-center gap-2"
          >
            <Github className="w-5 h-5" />
            <span className="text-xs font-bold">GitHub</span>
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-violet-500/30 transition-all flex items-center gap-2"
          >
            <Linkedin className="w-5 h-5" />
            <span className="text-xs font-bold">LinkedIn</span>
          </a>
        </div>
      </div>
    </div>
  );

  if (isAuthenticated) {
    return <Layout>{contactContent}</Layout>;
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
      <main className="flex-grow flex items-center">{contactContent}</main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-[var(--text-secondary)] opacity-60 relative z-20">
        &copy; {new Date().getFullYear()} TimeCapsule. Preserving love, one capsule at a time.
      </footer>
    </div>
  );
};

export default ContactPage;
