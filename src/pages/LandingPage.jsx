import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Lock, Calendar, BookHeart, Sparkles, Orbit, ChevronRight, ArrowUpRight } from 'lucide-react';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const floatingHearts = Array(6).fill(null);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0c081d] via-[#140b28] to-[#04020a] text-white">
      {/* Background Floating Hearts */}
      {floatingHearts.map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-pink-500/10 pointer-events-none"
          initial={{
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 100,
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{
            y: -100,
            x: `calc(${Math.random() * window.innerWidth}px + ${Math.sin(i) * 50}px)`
          }}
          transition={{
            duration: Math.random() * 20 + 15,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          <Heart className="w-12 h-12 fill-current" />
        </motion.div>
      ))}

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <Heart className="w-8 h-8 text-pink-500 fill-pink-500 animate-pulse" />
          <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-pink-500 to-violet-400 bg-clip-text text-transparent">
            TimeCapsule
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="px-4 py-2 text-sm font-semibold hover:text-pink-400 transition-colors">
            Login
          </Link>
          <Link
            to="/signup"
            className="px-5 py-2.5 text-sm font-bold rounded-full bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 transition-all shadow-md shadow-pink-500/20"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-24 text-center relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-pink-400 mb-6 backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create a digital sanctuary for your relationship</span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-5xl md:text-7xl font-black tracking-tight mb-6 max-w-4xl"
          >
            Write Today, <br />
            <span className="bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Relive Tomorrow.
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-white/60 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-light"
          >
            Preserve letters, photos, videos, and journals that remain locked until a future date. Reconnect with your past self and partner when the countdown ends.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 font-bold rounded-full bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 transition-all text-base shadow-lg shadow-pink-500/20 hover:scale-105 flex items-center gap-2"
            >
              <span>Begin Your Capsule</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 font-bold rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-base hover:scale-105"
            >
              See How It Works
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-white/5">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-extrabold mb-4">Preserving Every Shared Chapter</h3>
          <p className="text-white/50 max-w-lg mx-auto">Explore features designed specifically for couples wishing to seal their digital legacy.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="glass-card p-8 flex flex-col items-start hover:translate-y-[-5px]">
            <div className="p-3 bg-pink-500/10 rounded-2xl text-pink-500 mb-6">
              <Lock className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold mb-3">Time-Locked Memories</h4>
            <p className="text-white/60 text-sm leading-relaxed">
              Upload photos, record voice notes, and add diary entries. Once sealed, they remain encrypted and read-only until the timer hits zero.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card p-8 flex flex-col items-start hover:translate-y-[-5px]">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 mb-6">
              <BookHeart className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold mb-3">Weekly Collaborative Journals</h4>
            <p className="text-white/60 text-sm leading-relaxed">
              Co-write a single journal entry each week. Your inputs remain hidden from each other until Sunday midnight, encouraging pure weekly reflections.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card p-8 flex flex-col items-start hover:translate-y-[-5px]">
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 mb-6">
              <Orbit className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold mb-3">Interactive Memory Galaxy</h4>
            <p className="text-white/60 text-sm leading-relaxed">
              Every memory you unlock floats as a star in a beautifully rendering interactive canvas galaxy. Click a star to zoom in and relive the moment.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-white/5">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-extrabold mb-4">How It Works</h3>
          <p className="text-white/50 max-w-lg mx-auto">Five simple steps to connect and preserve your relationship milestones.</p>
        </div>

        <div className="relative">
          {/* Timeline Connector Bar */}
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 hidden md:block transform -translate-y-1/2 z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
            {[
              { step: '1', title: 'Connect', desc: 'Sign up and invite your partner with a unique code.' },
              { step: '2', title: 'Compose', desc: 'Write future letters or pack media into a memory.' },
              { step: '3', title: 'Lock', desc: 'Select a custom unlock date and seal the capsule.' },
              { step: '4', title: 'Anticipate', desc: 'Watch countdowns tick away on your dashboard.' },
              { step: '5', title: 'Relive', desc: 'Celebrate with confetti as locks pop open!' }
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-900/40 border border-white/5 backdrop-blur-md p-6 rounded-2xl text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-violet-500 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-lg shadow-pink-500/20">
                  {item.step}
                </div>
                <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-white/5 bg-gradient-to-b from-transparent to-pink-950/10">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-extrabold mb-4">Loved by Partners Worldwide</h3>
          <p className="text-white/50 max-w-lg mx-auto">Real stories from couples who unlocked their capsules after years of locking.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel p-8 rounded-3xl relative">
            <Heart className="w-8 h-8 text-pink-500/20 fill-pink-500/10 absolute top-6 right-6" />
            <p className="italic text-white/80 mb-6 font-light leading-relaxed">
              "We wrote letters to each other on our first anniversary and locked them for 5 years. Unlocking them last week was the most emotional, beautiful experience. Reading what we felt back then brought us so much closer."
            </p>
            <div>
              <h5 className="font-bold text-pink-400">Sarah & James</h5>
              <p className="text-xs text-white/40">Connected since 2021</p>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl relative">
            <Heart className="w-8 h-8 text-pink-500/20 fill-pink-500/10 absolute top-6 right-6" />
            <p className="italic text-white/80 mb-6 font-light leading-relaxed">
              "The weekly journal is our Sunday ritual. Even when we travel or have busy weeks, knowing we both wrote our part and that we can't read it until next week creates this amazing romantic anticipation."
            </p>
            <div>
              <h5 className="font-bold text-pink-400">Elena & Marc</h5>
              <p className="text-xs text-white/40">Connected since 2023</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center relative z-10">
        <div className="glass-panel p-12 rounded-3xl bg-gradient-to-br from-pink-500/10 via-violet-500/5 to-transparent border border-pink-500/20">
          <h3 className="text-3xl md:text-4xl font-extrabold mb-4">Start Writing Your Story</h3>
          <p className="text-white/60 max-w-md mx-auto mb-8 text-sm md:text-base">
            Create an account today and connect with your partner. Your future self will thank you.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 font-bold rounded-full bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 transition-all text-base shadow-lg shadow-pink-500/20"
          >
            <span>Get Started Free</span>
            <ArrowUpRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-sm text-white/40 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
            <span className="font-bold text-lg text-white">TimeCapsule</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
          <p className="text-xs text-white/30">&copy; {new Date().getFullYear()} TimeCapsule. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
