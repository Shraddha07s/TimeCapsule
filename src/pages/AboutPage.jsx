import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Target, Compass, Lock, Calendar, Star } from 'lucide-react';

const AboutPage = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.title = 'About Us - TimeCapsule';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Learn more about TimeCapsule, a romantic digital sanctuary for couples to seal letters, weekly journals, and media.');
    }
  }, []);

  const aboutContent = (
    <div className="space-y-12 max-w-4xl mx-auto px-4 py-8 animate-fade-in relative z-10">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex p-3 rounded-full bg-pink-500/10 text-pink-500 mb-2">
          <Heart className="w-8 h-8 fill-pink-500/20 animate-pulse" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
          About TimeCapsule
        </h1>
        <p className="text-sm md:text-base text-[var(--text-secondary)] max-w-xl mx-auto font-light leading-relaxed">
          TimeCapsule is a romantic digital sanctuary designed for couples to preserve their love letters, photos, videos, and weekly journals, safely locked away to be relived tomorrow.
        </p>
      </div>

      {/* Grid: Mission & Purpose */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-3xl space-y-4 border border-pink-500/10 shadow-xl hover:scale-[1.01] transition-transform">
          <div className="flex items-center gap-3 text-pink-500">
            <Target className="w-6 h-6" />
            <h3 className="text-xl font-bold tracking-tight">Our Mission</h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-light">
            In an era of fleeting notifications and temporary stories, our mission is to build digital permanence. We strive to provide couples with a dedicated canvas where their moments are preserved and protected from instant-gratification noise.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl space-y-4 border border-violet-500/10 shadow-xl hover:scale-[1.01] transition-transform">
          <div className="flex items-center gap-3 text-violet-400">
            <Compass className="w-6 h-6" />
            <h3 className="text-xl font-bold tracking-tight">Why We Built TimeCapsule</h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-light">
            We wanted to recreate the antique charm of physically burying a lockbox in the ground. By introducing time-delays and ticking countdowns, we build anticipation, deepen intimacy, and create a shared history that unfolds chronologically.
          </p>
        </div>
      </div>

      {/* Core Features Overview */}
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold tracking-tight text-center">Core Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-card p-6 flex flex-col justify-between space-y-3 bg-white/5 border border-white/10 hover:border-pink-500/30 transition-all">
            <Lock className="w-8 h-8 text-pink-500" />
            <h4 className="font-bold text-base">Locked Memories</h4>
            <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
              Pack photos, videos, and browser-recorded voice notes, and set a future date. They remain securely sealed on the server until the timer hits zero.
            </p>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between space-y-3 bg-white/5 border border-white/10 hover:border-violet-500/30 transition-all">
            <Sparkles className="w-8 h-8 text-violet-400" />
            <h4 className="font-bold text-base">Cursive Future Letters</h4>
            <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
              Pen lined cursive sheets to your partner or your future self, scheduled to arrive exactly when they need to read it.
            </p>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between space-y-3 bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all">
            <Calendar className="w-8 h-8 text-cyan-400" />
            <h4 className="font-bold text-base">Weekly Journals</h4>
            <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
              Collaborative reflection logs that stay time-locked until the week concludes. Write your sections independently and unlock them together.
            </p>
          </div>
        </div>
      </div>

      {/* Future Vision */}
      <div className="glass-panel p-8 rounded-3xl border border-indigo-500/10 shadow-xl space-y-4 text-center">
        <div className="inline-flex p-2.5 rounded-full bg-indigo-500/10 text-indigo-400 mb-1">
          <Star className="w-6 h-6 animate-spin" style={{ animationDuration: '10s' }} />
        </div>
        <h3 className="text-xl font-bold tracking-tight">Our Future Vision</h3>
        <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed font-light">
          We are moving toward smart relationship companions—including AI-triggered journals, collaborative couple bucket lists, and an interactive 3D WebGL stars navigation system. TimeCapsule will grow with your love story.
        </p>
      </div>
    </div>
  );

  if (isAuthenticated) {
    return <Layout>{aboutContent}</Layout>;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-gradient)] relative overflow-hidden flex flex-col justify-between text-[var(--text-primary)]">
      {/* Dreamy Background Spheres */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-pink-500/10 blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-600/15 blur-[120px] animate-pulse" />
      </div>

      {/* Navigation Header */}
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
      <main className="flex-grow flex items-center">{aboutContent}</main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-[var(--text-secondary)] opacity-60 relative z-20">
        &copy; {new Date().getFullYear()} TimeCapsule. Preserving love, one capsule at a time.
      </footer>
    </div>
  );
};

export default AboutPage;
