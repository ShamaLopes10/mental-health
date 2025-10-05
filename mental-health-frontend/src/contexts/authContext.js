import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { registerUser as apiRegisterUser, loginUser as apiLoginUser, setAuthToken } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) setAuthToken(savedToken); // set token for all API requests
    return savedToken;
  });

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch (err) {
      console.error("Error parsing user from localStorage:", err);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setAuthToken(null);
  }, []);

  useEffect(() => {
    const currentToken = localStorage.getItem('token');
    const currentUser = localStorage.getItem('user');

    if (currentToken) {
      setAuthToken(currentToken);
      setToken(currentToken);

      if (currentUser) {
        try {
          setUser(JSON.parse(currentUser));
        } catch (err) {
          console.error("Error parsing user from localStorage:", err);
          logout();
        }
      } else {
        logout();
      }
    } else {
      logout();
    }

    setLoading(false);
  }, [logout]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiLoginUser({ email, password });
      if (data?.token && data?.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setAuthToken(data.token);
        setToken(data.token);
        setUser(data.user);
        setLoading(false);
        return data.user;
      }
      throw new Error("Invalid server response");
    } catch (err) {
      console.error("Login error:", err);
      setLoading(false);
      logout();
      throw err;
    }
  };

  const signup = async (username, email, password) => {
    setLoading(true);
    try {
      const data = await apiRegisterUser({ username, email, password });
      if (data?.token && data?.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setAuthToken(data.token);
        setToken(data.token);
        setUser(data.user);
        setLoading(false);
        return data.user;
      }
      throw new Error("Invalid server response");
    } catch (err) {
      console.error("Signup error:", err);
      setLoading(false);
      logout();
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, signup, logout, loading, isAuthenticated: !!user && !!token }}
    >
      {!loading ? children : null}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
