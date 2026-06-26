import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile if access token is present
  const fetchProfile = async () => {
    try {
      const response = await api.get('profile/');
      setUser(response.data);
    } catch (error) {
      console.error("Failed to load user profile:", error);
      logoutLocal();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('login/', { username, password });
      const { access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Load user details
      await fetchProfile();
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg = error.response?.data?.detail || "Invalid credentials. Please try again.";
      return { success: false, error: errorMsg };
    }
  };

  const register = async (username, email, password, confirmPassword) => {
    try {
      const response = await api.post('register/', {
        username,
        email,
        password,
        confirm_password: confirmPassword
      });
      
      const { access, refresh, user: registeredUser } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(registeredUser);
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      let errorMsg = "Registration failed. Please check the inputs.";
      if (error.response?.data) {
        // Collect field-specific errors
        const errors = error.response.data;
        if (typeof errors === 'object') {
          errorMsg = Object.entries(errors)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`)
            .join(' | ');
        } else {
          errorMsg = errors;
        }
      }
      return { success: false, error: errorMsg };
    }
  };

  const logoutLocal = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        await api.post('logout/', { refresh });
      }
    } catch (error) {
      console.error("Logout backend error:", error);
    } finally {
      logoutLocal();
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('profile/', profileData);
      setUser(response.data);
      return { success: true };
    } catch (error) {
      console.error("Update profile error:", error);
      return { success: false, error: error.response?.data?.error || "Failed to update profile." };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
