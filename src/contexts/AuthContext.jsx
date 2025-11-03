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
      if (token) {
        // Fetch current user info from API
        const userData = await sendRequest('/api/users/token/refresh/', 'GET', null, true);
        if (userData && userData.user) {
          setUser({ ...userData.user, authenticated: true });
        } else {
          setUser({ authenticated: true });
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user:', error);
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setLoading(false);
    }
  }, [token]);

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

  const login = async (email, password) => {
    try {
      const response = await sendRequest('/api/users/login/', 'POST', {
        email,
        password,
      }, false); // Don't require auth for login

      if (response.access) {
        setToken(response.access);
        localStorage.setItem('token', response.access);
        localStorage.setItem('refreshToken', response.refresh);
        const userData = { ...response.user, authenticated: true };
        setUser(userData);
        return { 
          success: true,
          user: userData,
          isMinistryUser: userData.is_superuser || false
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.error || error.message || 'Invalid credentials',
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };

  const refreshUser = useCallback(async () => {
    if (token) {
      await fetchUser();
    }
  }, [token, fetchUser]);

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    refreshUser,
    isAuthenticated: !!token && !!user,
    isMinistryUser: user?.is_superuser || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

