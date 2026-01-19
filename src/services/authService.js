import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  if (response.data.token) {
    localStorage.setItem('token', JSON.stringify(response.data.token));
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/signup`, userData);
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const response = await axios.post(`${API_URL}/auth/change-password`, 
    { currentPassword, newPassword },
    { headers: { Authorization: `Bearer ${user.token}` } }
  );
  return response.data;
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

export const verifyToken = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.isValid;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};