import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return { headers: { Authorization: `Bearer ${user.token}` } };
};

export const getAllUsers = async () => {
  const response = await axios.get(`${API_URL}/users`, getAuthHeader());
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await axios.put(
    `${API_URL}/users/${userId}/role`,
    { role },
    getAuthHeader()
  );
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await axios.delete(
    `${API_URL}/users/${userId}`,
    getAuthHeader()
  );
  return response.data;
};