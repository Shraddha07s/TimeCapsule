import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [coupleDetails, setCoupleDetails] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('timecapsule-token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useNotification();

  // Set auth header helper
  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('timecapsule-token')}`
    };
  };

  // Load user data on startup
  useEffect(() => {
    const loadUser = async () => {
      const savedToken = localStorage.getItem('timecapsule-token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${savedToken}`
          }
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          
          // If connected, fetch partner details
          if (userData.coupleId) {
            await fetchPartnerData(savedToken);
          }
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Error loading user:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const fetchPartnerData = async (activeToken) => {
    try {
      const res = await fetch('/api/couple/profile', {
        headers: {
          'Authorization': `Bearer ${activeToken || token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPartner(data.partner);
        setCoupleDetails(data.coupleDetails);
      }
    } catch (err) {
      console.error('Error fetching partner data:', err);
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('timecapsule-token', data.token);
        setToken(data.token);
        setUser(data);
        if (data.coupleId) {
          await fetchPartnerData(data.token);
        }
        showToast(`Welcome back, ${data.username}!`, 'success');
        return { success: true };
      } else {
        setError(data.message || 'Login failed');
        showToast(data.message || 'Login failed', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError('Network error');
      showToast('Network connection failed during login', 'error');
      return { success: false, message: 'Network error. Try again later.' };
    }
  };

  const signup = async (username, email, password) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('timecapsule-token', data.token);
        setToken(data.token);
        setUser(data);
        showToast('Account created successfully!', 'success');
        return { success: true, user: data };
      } else {
        setError(data.message || 'Registration failed');
        showToast(data.message || 'Registration failed', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError('Network error');
      showToast('Network connection failed during registration', 'error');
      return { success: false, message: 'Network error. Try again later.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('timecapsule-token');
    setToken(null);
    setUser(null);
    setPartner(null);
    setCoupleDetails(null);
    setError(null);
  };

  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const res = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData)
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        if (data.user.coupleId) {
          await fetchPartnerData();
        }
        showToast('Profile updated successfully!', 'success');
        return { success: true };
      } else {
        showToast(data.message || 'Failed to update profile', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      showToast('Network error updating profile', 'error');
      return { success: false, message: 'Network error' };
    }
  };

  const connectPartner = async (inviteCode) => {
    setError(null);
    try {
      const res = await fetch('/api/couple/connect', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ inviteCode })
      });

      const data = await res.json();

      if (res.ok) {
        setUser(prev => ({ ...prev, coupleId: data.coupleId }));
        setPartner(data.partner);
        await fetchPartnerData();
        showToast('Successfully linked with your partner!', 'success');
        return { success: true };
      } else {
        showToast(data.message || 'Failed to connect', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      showToast('Network error connecting partner', 'error');
      return { success: false, message: 'Network error' };
    }
  };

  const disconnectPartner = async () => {
    setError(null);
    try {
      const res = await fetch('/api/couple/disconnect', {
        method: 'POST',
        headers: getHeaders()
      });

      const data = await res.json();

      if (res.ok) {
        setUser(prev => ({ ...prev, coupleId: null }));
        setPartner(null);
        setCoupleDetails(null);
        showToast('Disconnected from partner', 'warning');
        return { success: true };
      } else {
        showToast(data.message || 'Failed to disconnect', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      showToast('Network error during disconnect', 'error');
      return { success: false, message: 'Network error' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        partner,
        coupleDetails,
        token,
        loading,
        error,
        isAuthenticated: !!token,
        login,
        signup,
        logout,
        updateProfile,
        connectPartner,
        disconnectPartner,
        refreshPartnerData: fetchPartnerData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
