import React, { createContext, useState, useContext, useEffect } from 'react';
import { registerUser, loginUser, getUser, logoutUser as apiLogout } from '../api/authApi';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Verify token is still valid by fetching user
          const userData = await getUser();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (err) {
          // Token invalid, clear storage
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signup = async (email, password, name) => {
    try {
      setError(null);
      const response = await registerUser(email, password, name);
      
      // Store tokens
      if (response.token) {
        localStorage.setItem('access_token', response.token.access);
        localStorage.setItem('refresh_token', response.token.refresh);
      }
      
      // Store user
      const userData = response.user;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err.response?.data?.email?.[0] || 
                          err.response?.data?.password?.[0] ||
                          err.response?.data?.non_field_errors?.[0] ||
                          err.message ||
                          'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await loginUser(email, password);
      
      // Store tokens
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      
      // Store user
      const userData = response.user;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err.response?.data?.non_field_errors?.[0] ||
                          err.response?.data?.email?.[0] ||
                          err.response?.data?.password?.[0] ||
                          err.message ||
                          'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setError(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

