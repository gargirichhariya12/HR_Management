import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hrms_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('hrms_user');
    const storedToken = localStorage.getItem('hrms_token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (err) {
        console.error('Error parsing cached user:', err);
        localStorage.removeItem('hrms_user');
        localStorage.removeItem('hrms_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = response.data;

    setToken(newToken);
    setUser(userData);
    localStorage.setItem('hrms_token', newToken);
    localStorage.setItem('hrms_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (name, email, password, role, department) => {
    const response = await api.post('/auth/register', { name, email, password, role, department });
    const { token: newToken, user: userData } = response.data;

    setToken(newToken);
    setUser(userData);
    localStorage.setItem('hrms_token', newToken);
    localStorage.setItem('hrms_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hrms_token');
    localStorage.removeItem('hrms_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
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

export default AuthContext;
