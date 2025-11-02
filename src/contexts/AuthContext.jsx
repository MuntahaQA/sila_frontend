import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sendRequest } from '../utilities/sendRequest';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      // You can add an endpoint to get current user info
      // For now, we'll just check if token is valid
      setUser({ authenticated: true });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user:', error);
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      // Fetch user data if token exists
      fetchUser();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setLoading(false);
    }
  }, [token, fetchUser]);

  const login = async (username, password) => {
    try {
      const response = await sendRequest('/api/token/', 'POST', {
        username,
        password,
      }, false); // Don't require auth for login

      if (response.access) {
        setToken(response.access);
        localStorage.setItem('token', response.access);
        localStorage.setItem('refreshToken', response.refresh);
        setUser({ username, authenticated: true });
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Invalid credentials',
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

