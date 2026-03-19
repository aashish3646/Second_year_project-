import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as jwtDecodeModule from 'jwt-decode';
const jwt_decode = jwtDecodeModule.jwtDecode || jwtDecodeModule.default || jwtDecodeModule;
import { authApi } from '../services/authApi';
import { tokenStorage } from '../utils/tokenStorage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    tokenStorage.clear();
    setUser(null);
  };

  const checkAuth = async () => {
    const token = tokenStorage.getAccess();
    if (token) {
      try {
        const decoded = jwt_decode(token);
        if (decoded.exp * 1000 > Date.now()) {
          const response = await authApi.me();
          setUser(response.data);
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      const { access, refresh, user: userData } = response.data;

      tokenStorage.setAccess(access);
      tokenStorage.setRefresh(refresh);
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Registration failed',
      };
    }
  };

  const updateUser = async (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
    return { success: true, user: { ...user, ...userData } };
  };

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      logout,
      updateUser,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isSeller: user?.role === 'seller' || user?.is_verified_seller === true,
      isVerifiedSeller: user?.is_verified_seller === true,
      isBidder: user?.role === 'bidder',
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

