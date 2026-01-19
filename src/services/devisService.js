// src/services/devisService.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;
// ✅ Créer un devis
export const createDevis = async (data) => {
  const response = await axios.post(
    `${API_URL}/devis`,
    data,

  );
  return response.data;
};

// ✅ Récupérer tous les devis avec filtres optionnels
export const getAllDevis = async (statut = null, numero = null, page = 1, limit = 10) => {
  const params = { page, limit };
  if (statut) params.statut = statut;
  if (numero) params.numero = numero;

  const response = await axios.get(`${API_URL}/devis`, {
    // ...getAuthHeader(),
    params,
  });
  return response.data;
};

// ✅ Récupérer un devis par ID
export const getDevisById = async (id) => {
  const response = await axios.get(
    `${API_URL}/devis/${id}`,
    
  );
  return response.data;
};

// ✅ Mettre à jour un devis
export const updateDevis = async (id, data) => {
  const response = await axios.put(
    `${API_URL}/devis/${id}`,
    data,
  
  );
  return response.data;
};

// ✅ Valider un devis
export const validateDevis = async (id) => {
  const response = await axios.post(
    `${API_URL}/devis/${id}/validate`,
    {},

  );
  return response.data;
};

// ✅ Convertir un devis en facture
export const convertToFacture = async (id) => {
  const response = await axios.post(
    `${API_URL}/devis/${id}/convert`,
    {},
 
  );
  return response.data;
};

// ✅ Supprimer un devis
export const deleteDevis = async (id) => {
  const response = await axios.delete(
    `${API_URL}/devis/${id}`,
   
  );
  return response.data;
};