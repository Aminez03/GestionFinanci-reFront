// src/services/personneMoraleService.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// const getAuthHeader = () => {
//   const user = JSON.parse(localStorage.getItem("user"));
//   return { headers: { Authorization: `Bearer ${user.token}` } };
// };

// ✅ Créer une personne morale
export const createPersonneMorale = async (data) => {
  const response = await axios.post(
    `${API_URL}/personnes-morales`,
    data,
    // getAuthHeader()
  );
  return response.data;
};

// ✅ Récupérer toutes les personnes morales avec pagination et filtre nature
export const getAllPersonnesMorales = async (page = 1, limit = 5, nature = null) => {
  const params = { page, limit };
  if (nature) params.nature = nature;

  const response = await axios.get(`${API_URL}/personnes-morales`, {
    // ...getAuthHeader(),
    params,
  });
  return response.data;
};

// ✅ Récupérer une personne morale par ID
export const getPersonneMoraleById = async (id) => {
  const response = await axios.get(
    `${API_URL}/personnes-morales/${id}`,
    // getAuthHeader()
  );
  return response.data;
};

// ✅ Mettre à jour une personne morale
export const updatePersonneMorale = async (id, data) => {
  const response = await axios.put(
    `${API_URL}/personnes-morales/${id}`,
    data,
    // getAuthHeader()
  );
  return response.data;
};

// ✅ Supprimer une personne morale
export const deletePersonneMorale = async (id) => {
  const response = await axios.delete(
    `${API_URL}/personnes-morales/${id}`,
    // getAuthHeader()
  );
  return response.data;
};


export const getPersonneMoraleByTiersId = async (tiersId) => {
  const response = await axios.get(
    `${API_URL}/personnes-morales/by-tiers/${tiersId}`,
    // getAuthHeader()
  );
  return response.data;
};
// ✅ Récupérer une personne morale par matricule fiscal
export const getPersonneByMatricule = async (matricule) => {
  const response = await axios.get(
    `${API_URL}/personnes-morales/matricule/${matricule}`,
    // getAuthHeader()
  );
  return response.data;
};

// ✅ Vérifier si un matricule fiscal existe (option excludeId)
export const checkMatriculeExists = async (matricule, excludeId = null) => {
  const response = await axios.get(
    `${API_URL}/personnes-morales/matricule-exists/${matricule}`,
    {
    //   ...getAuthHeader(),
      params: excludeId ? { excludeId } : {},
    }
  );
  return response.data;
};

// ✅ Recherche globale (raison sociale, matricule, email, téléphone)
export const searchPersonnesMorales = async (searchTerm, page = 1, limit = 5, nature = null) => {
  const response = await axios.post(
    `${API_URL}/personnes-morales/search`,
    { searchTerm, page, limit, nature },
    // getAuthHeader()
  );
  return response.data;
};
