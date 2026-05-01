import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { BACKEND_API } from '../services/backend_api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists on load
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post(BACKEND_API.LOGIN, { email, password });
    localStorage.setItem('token', res.data.token);
    // Backend doesn't explicitly return user object in standard structure yet, assuming it does
    // We'll store a placeholder or just assume token is enough for now, but usually login returns user data.
    // I'll parse it or just store what comes back.
    const userData = res.data.user || { email, role: 'Member' }; // fallback
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return res.data;
  };

  const register = async (name, email, password, role = 'Member') => {
    const res = await api.post(BACKEND_API.REGISTER, { name, email, password, role });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
