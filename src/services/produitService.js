// src/services/produitService.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// const getAuthHeader = () => {
//   const user = JSON.parse(localStorage.getItem("user"));
//   return { headers: { Authorization: `Bearer ${user.token}` } };
// };

// ✅ Créer un produit
export const createProduit = async (data) => {
  const response = await axios.post(
    `${API_URL}/produits`,
    data,
    // getAuthHeader()
  );
  return response.data;
};

// ✅ Récupérer tous les produits avec pagination
export const getAllProduits = async (page = 1, limit = 5) => {
  const response = await axios.get(`${API_URL}/produits`, {
    // ...getAuthHeader(),
    params: { page, limit },
  });
  return response.data;
};

// ✅ Récupérer un produit par ID
export const getProduitById = async (id) => {
  const response = await axios.get(
    `${API_URL}/produits/${id}`,
    // getAuthHeader()
  );
  return response.data;
};

// ✅ Mettre à jour un produit
export const updateProduit = async (id, data) => {
  const response = await axios.put(
    `${API_URL}/produits/${id}`,
    data,
    // getAuthHeader()
  );
  return response.data;
};

// ✅ Supprimer un produit
export const deleteProduit = async (id) => {
  const response = await axios.delete(
    `${API_URL}/produits/${id}`,
    // getAuthHeader()
  );
  return response.data;
};

// ✅ Recherche produits par nom ou description (optionnel)
export const searchProduits = async (searchTerm, page = 1, limit = 5) => {
  const response = await axios.post(
    `${API_URL}/produits/search`,
    { searchTerm, page, limit },
    // getAuthHeader()
  );
  return response.data;
};
