import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return { headers: { Authorization: `Bearer ${user.token}` } };
};

export const createRole = async (name, permissions) => {
  const response = await axios.post(
    `${API_URL}/roles`,
    { name, permissions },
    getAuthHeader()
  );
  return response.data;
};

export const getAllRoles = async () => {
  const response = await axios.get(`${API_URL}/roles`, getAuthHeader());
  return response.data;
};

export const updateRolePermissions = async (roleId, permissions) => {
  const response = await axios.put(
    `${API_URL}/roles/${roleId}/permissions`,
    { permissions },
    getAuthHeader()
  );
  return response.data;
};

export const deleteRole = async (roleId) => {
  const response = await axios.delete(
    `${API_URL}/roles/${roleId}`,
    getAuthHeader()
  );
  return response.data;
};