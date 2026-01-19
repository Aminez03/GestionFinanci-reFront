// src/services/serviceService.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// const getAuthHeader = () => {
//   const user = JSON.parse(localStorage.getItem("user"));
//   return { headers: { Authorization: `Bearer ${user.token}` } };
// };

// 🔹 Créer un service
export const createService = async (data) => {
  const response = await axios.post(`${API_URL}/services`, data);
  return response.data;
};

// 🔹 Récupérer tous les services avec pagination
export const getAllServices = async (page = 1, limit = 5) => {
  const response = await axios.get(`${API_URL}/services`, {
    params: { page, limit },
    // ...getAuthHeader()
  });
  return response.data;
};

// 🔹 Récupérer un service par ID
export const getServiceById = async (id) => {
  const response = await axios.get(`${API_URL}/services/${id}`);
  return response.data;
};

// 🔹 Mettre à jour un service
export const updateService = async (id, data) => {
  const response = await axios.put(`${API_URL}/services/${id}`, data);
  return response.data;
};

// 🔹 Supprimer un service
export const deleteService = async (id) => {
  const response = await axios.delete(`${API_URL}/services/${id}`);
  return response.data;
};

// 🔹 Recherche services par description avec pagination
export const searchServices = async (searchTerm , page = 1, limit = 5) => {
  const response = await axios.post(`${API_URL}/services/search`, {
     searchTerm, page, limit,
    // ...getAuthHeader()
  });
  return response.data;
};
