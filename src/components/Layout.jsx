import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Heart, 
  LayoutDashboard, 
  Lock, 
  PlusCircle, 
  Orbit, 
  MailOpen, 
  BookHeart, 
  Image, 
  CalendarHeart, 
  BarChart3, 
  User, 
  LogOut, 
  Menu, 
  X,
  Palette
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, partner, logout } = useAuth();
  const { theme, changeTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Time Capsule', path: '/memories', icon: Lock },
    { name: 'Create Memory', path: '/memories/create', icon: PlusCircle },
    { name: 'Memory Galaxy', path: '/galaxy', icon: Orbit },
    { name: 'Future Letters', path: '/letters', icon: MailOpen },
    { name: 'Weekly Journal', path: '/journals', icon: BookHeart },
    { name: 'Memory Gallery', path: '/gallery', icon: Image },
    { name: 'Anniversary', path: '/anniversary', icon: CalendarHeart },
    { name: 'Statistics', path: '/stats', icon: BarChart3 },
    { name: 'My Profile', path: '/profile', icon: User }
  ];

  const themesList = [
    { id: 'dark', name: 'Dark Mode', color: 'bg-slate-800' },
    { id: 'light', name: 'Light Mode', color: 'bg-white border border-gray-200' },
    { id: 'pink', name: 'Romantic Pink', color: 'bg-pink-300' },
    { id: 'sunset', name: 'Sunset Glow', color: 'bg-amber-600' },
    { id: 'space', name: 'Cyber Space', color: 'bg-cyan-950' }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full text-inherit">
      {/* Header Logo */}
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <Heart className="w-8 h-8 text-pink-500 fill-pink-500 animate-pulse" />
        <div>
          <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-pink-500 to-violet-400 bg-clip-text text-transparent">TimeCapsule</h1>
          <p className="text-xs text-white/50 tracking-wider">Write Today, Relive Tomorrow</p>
        </div>
      </div>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto flex flex-col justify-between">
        {/* Navigation Links */}
        <nav className="px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg shadow-pink-500/20' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Pinned Controls */}
        <div>
          {/* Theme Selector */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-2 mb-3 px-2">
              <Palette className="w-4 h-4 text-white/60" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/60">Choose Theme</span>
            </div>
            <div className="flex justify-between gap-1.5 p-1.5 bg-black/20 rounded-xl">
              {themesList.map((t) => (
                <button
                  key={t.id}
                  onClick={() => changeTheme(t.id)}
                  title={t.name}
                  className={`w-7 h-7 rounded-lg transition-transform ${t.color} ${
                    theme === t.id ? 'scale-110 ring-2 ring-pink-500 ring-offset-2 ring-offset-black/50' : 'hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Couple Connection Indicator */}
          <div className="p-4 border-t border-white/10 bg-white/5 m-3 rounded-2xl">
            {partner ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  {partner.avatar ? (
                    <img 
                      src={partner.avatar} 
                      alt={partner.username} 
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-500" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center font-bold ring-2 ring-pink-500">
                      {partner.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/50 font-semibold tracking-wider uppercase">Connected with</p>
                  <h4 className="text-sm font-bold truncate">{partner.username}</h4>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs text-white/60 mb-2">Connect with your partner to share memories!</p>
                <Link 
                  to="/connect"
                  onClick={() => setMobileOpen(false)}
                  className="inline-block w-full py-1.5 text-center text-xs font-bold rounded-lg bg-pink-500 hover:bg-pink-600 transition-colors text-white"
                >
                  Link Partner
                </Link>
              </div>
            )}
          </div>

          {/* User Logout Section */}
          <div className="p-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.username} 
                  className="w-8 h-8 rounded-full object-cover" 
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center font-bold text-xs">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-bold truncate max-w-[100px]">{user?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 glass-panel border-r border-white/10 shrink-0 sticky top-0 h-screen z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Nav Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass-panel border-b border-white/10 flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
          <span className="font-extrabold tracking-tight bg-gradient-to-r from-pink-500 to-violet-400 bg-clip-text text-transparent">TimeCapsule</span>
        </div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <aside className={`lg:hidden fixed top-0 bottom-0 left-0 w-64 bg-slate-950/95 border-r border-white/10 z-50 transform transition-transform duration-300 ease-in-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-16 lg:pt-0 min-h-screen flex flex-col">
        <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
        <footer className="py-6 text-center text-xs text-white/30 border-t border-white/5 no-print">
          &copy; {new Date().getFullYear()} TimeCapsule. Preserving love, one capsule at a time.
        </footer>
      </main>
    </div>
  );
};

export default Layout;
