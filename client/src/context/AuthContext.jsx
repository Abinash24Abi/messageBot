import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem('token') || ''
  );

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || 'null')
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${token}`;

      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common.Authorization;
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        'user',
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        `${API_URL}/login`,
        {
          email,
          password,
        }
      );

      const { token: userToken, ...userData } =
        response.data.data;

      setToken(userToken);
      setUser(userData);

      setSuccess('Welcome back!');
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Authentication failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        `${API_URL}/register`,
        payload
      );

      const { token: userToken, ...userData } =
        response.data.data;

      setToken(userToken);
      setUser(userData);

      setSuccess('Account created successfully!');
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    setError('');
    setSuccess('Logged out successfully.');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        error,
        success,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);