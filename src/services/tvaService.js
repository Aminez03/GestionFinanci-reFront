// src/services/tvaService.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// ✅ Récupérer toutes les TVA
export const getAllTva = async () => {
  const response = await axios.get(`${API_URL}/tva`);
  return response.data;
};

// ✅ Récupérer une TVA par ID
export const getTvaById = async (id) => {
  const response = await axios.get(`${API_URL}/tva/${id}`);
  return response.data;
};

// ✅ Créer une TVA
export const createTva = async (data) => {
  const response = await axios.post(`${API_URL}/tva`, data);
  return response.data;
};

// ✅ Mettre à jour une TVA
export const updateTva = async (id, data) => {
  const response = await axios.put(`${API_URL}/tva/${id}`, data);
  return response.data;
};

// ✅ Supprimer une TVA
export const deleteTva = async (id) => {
  const response = await axios.delete(`${API_URL}/tva/${id}`);
  return response.data;
};
