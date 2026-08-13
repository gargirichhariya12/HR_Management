import { createContext, useContext, useEffect, useState } from 'react';
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

  // Standard email/password login
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData, forcePasswordChange } = response.data;

    setToken(newToken);
    setUser(userData);
    localStorage.setItem('hrms_token', newToken);
    localStorage.setItem('hrms_user', JSON.stringify(userData));

    if (forcePasswordChange) {
      return { ...userData, mustChangePassword: true, forcePasswordChange: true };
    }

    return userData;
  };

  // Used after Google OAuth callback — token comes from URL query param
  const loginWithToken = async (jwtToken) => {
    // Store token first so the API interceptor picks it up
    localStorage.setItem('hrms_token', jwtToken);
    setToken(jwtToken);

    // Fetch user profile using the new token
    try {
      const response = await api.get('/users/me');
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('hrms_user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      // If /users/me fails, decode JWT manually as fallback
      try {
        const payload = JSON.parse(atob(jwtToken.split('.')[1]));
        const minimalUser = { id: payload.id, role: payload.role };
        setUser(minimalUser);
        localStorage.setItem('hrms_user', JSON.stringify(minimalUser));
        return minimalUser;
      } catch {
        localStorage.removeItem('hrms_token');
        setToken(null);
        throw new Error('Failed to verify Google login token.');
      }
    }
  };

  // Kept for backward compatibility (not used by Google OAuth anymore)
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
    <AuthContext.Provider value={{ user, token, loading, login, loginWithToken, register, logout }}>
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
