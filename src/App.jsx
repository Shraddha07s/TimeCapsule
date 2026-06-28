import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

// Protected Pages
import Dashboard from './pages/Dashboard';
import CoupleConnect from './pages/CoupleConnect';
import Profile from './pages/Profile';
import MemoryList from './pages/MemoryList';
import CreateMemory from './pages/CreateMemory';
import StarsGalaxyPage from './pages/StarsGalaxyPage';
import LetterList from './pages/LetterList';
import JournalList from './pages/JournalList';
import Gallery from './pages/Gallery';
import Anniversary from './pages/Anniversary';
import Stats from './pages/Stats';

// Protected Route security guard wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e0a1f]">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <Router>
      <NotificationProvider>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/verify-email/:token" element={<EmailVerificationPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/connect" element={<ProtectedRoute><CoupleConnect /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/memories" element={<ProtectedRoute><MemoryList /></ProtectedRoute>} />
              <Route path="/memories/create" element={<ProtectedRoute><CreateMemory /></ProtectedRoute>} />
              <Route path="/galaxy" element={<ProtectedRoute><StarsGalaxyPage /></ProtectedRoute>} />
              <Route path="/letters" element={<ProtectedRoute><LetterList /></ProtectedRoute>} />
              <Route path="/journals" element={<ProtectedRoute><JournalList /></ProtectedRoute>} />
              <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
              <Route path="/anniversary" element={<ProtectedRoute><Anniversary /></ProtectedRoute>} />
              <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </NotificationProvider>
    </Router>
  );
};

export default App;
