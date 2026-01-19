// src/services/tiersService.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// const getAuthHeader = () => {
//   const user = JSON.parse(localStorage.getItem("user"));
//   return { headers: { Authorization: `Bearer ${user.token}` } };
// };

// ✅ Créer un tiers (Physique ou Morale)
export const createTiers = async (data) => {
  const response = await axios.post(
    `${API_URL}/tiers`,
    data,
    // getAuthHeader()
  );
  return response.data;
};

// ✅ Récupérer tous les tiers avec pagination, filtre et recherche
export const getAllTiers = async (page = 1, limit = 10, type = "", search = "") => {
  const response = await axios.get(`${API_URL}/tiers`, {
    // ...getAuthHeader(),
    params: { page, limit, type, search },
  });
  return response.data;
};

// ✅ Récupérer un tiers par ID
export const getTiersById = async (id) => {
  const response = await axios.get(
    `${API_URL}/tiers/${id}`,
    // getAuthHeader()
  );
  return response.data;
};

// ✅ Mettre à jour un tiers
export const updateTiers = async (id, data) => {
  const response = await axios.put(
    `${API_URL}/tiers/${id}`,
    data,
    // getAuthHeader()
  );
  return response.data;
};

// ✅ Supprimer un tiers
export const deleteTiers = async (id) => {
  const response = await axios.delete(
    `${API_URL}/tiers/${id}`,
    // getAuthHeader()
  );
  return response.data;
};

// ✅ Vérifier CIN (pour Personne Physique)
export const verifierCin = async (cin) => {
  const response = await axios.get(
    `${API_URL}/tiers/verifier-cin/${cin}`,
    // getAuthHeader()
  );
  return response.data;
};

// ✅ Vérifier Matricule Fiscale (pour Personne Morale)
export const verifierMatriculeFiscale = async (matricule) => {
  const response = await axios.get(
    `${API_URL}/tiers/verifier-matricule/${matricule}`,
    // getAuthHeader()
  );
  return response.data;
};

// ✅ Récupérer uniquement les clients pro
export const getClientsPro = async () => {
  const response = await axios.get(
    `${API_URL}/tiers/clients-pro`,
    // getAuthHeader()
  );
  return response.data;
};

// ✅ Récupérer uniquement les fournisseurs
export const getFournisseurs = async () => {
  const response = await axios.get(
    `${API_URL}/tiers/fournisseurs`,
    // getAuthHeader()
  );
  return response.data;
};

// ✅ Récupérer uniquement les clients individuels
export const getClientsIndividuels = async () => {
  const response = await axios.get(
    `${API_URL}/tiers/clients-individuels`,
    // getAuthHeader()
  );
  return response.data;
};

// ✅ Recherche avancée sur tous les tiers
export const searchTiers = async (q) => {
  const response = await axios.get(
    `${API_URL}/tiers/search`,
    {
      // ...getAuthHeader(),
      params: { q },
    }
  );
  return response.data;
};
