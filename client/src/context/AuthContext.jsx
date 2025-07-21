import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set token in axios headers
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Load user from token
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/me`);
        setUser(res.data.user);
      } catch {
        setUser(null);
        localStorage.removeItem('token');
        setAuthToken(null);
      }
    } else {
      setUser(null);
      setAuthToken(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Login
  const login = async (emailOrPhone, password) => {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { emailOrPhone, password });
    localStorage.setItem('token', res.data.token);
    setAuthToken(res.data.token);
    setUser(res.data.user);
  };

  // Register
  const register = async (name, email, phone, password) => {
    const res = await axios.post(`${API_BASE_URL}/api/auth/register`, { name, email, phone, password });
    localStorage.setItem('token', res.data.token);
    setAuthToken(res.data.token);
    setUser(res.data.user);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        reloadUser: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 