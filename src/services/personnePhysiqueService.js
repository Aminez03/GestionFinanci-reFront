// src/services/personnePhysiqueService.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// const getAuthHeader = () => {
//   const user = JSON.parse(localStorage.getItem("user"));
//   return { headers: { Authorization: `Bearer ${user.token}` } };
// };

// ✅ Créer une personne physique
export const createPersonnePhysique = async (data) => {
  const response = await axios.post(
    `${API_URL}/personnes-physiques`,
    data,
    // getAuthHeader()
  );
  return response.data;
};

// ✅ Récupérer toutes les personnes physiques avec pagination et filtre nature
export const getAllPersonnesPhysiques = async (page = 1, limit = 5, nature = null) => {
  const params = { page, limit };
  if (nature) params.nature = nature;

  const response = await axios.get(`${API_URL}/personnes-physiques`, {
    // ...getAuthHeader(),
    params,
  });
  return response.data;
};

// ✅ Récupérer une personne par ID
export const getPersonnePhysiqueById = async (id) => {
  const response = await axios.get(
    `${API_URL}/personnes-physiques/${id}`,
    // getAuthHeader()
  );
  return response.data;
};

// ✅ Mettre à jour une personne physique
export const updatePersonnePhysique = async (id, data) => {
  const response = await axios.put(
    `${API_URL}/personnes-physiques/${id}`,
    data,
    // getAuthHeader()
  );
  return response.data;
};

// ✅ Supprimer une personne physique
export const deletePersonnePhysique = async (id) => {
  const response = await axios.delete(
    `${API_URL}/personnes-physiques/${id}`,
    // getAuthHeader()
  );
  return response.data;
};

// ✅ Rechercher par CIN
export const getPersonneByCin = async (cin) => {
  const response = await axios.get(
    `${API_URL}/personnes-physiques/cin/${cin}`,
    // getAuthHeader()
  );
  return response.data;
};

// ✅ Vérifier si un CIN existe (option excludeId)
export const checkCinExists = async (cin, excludeId = null) => {
  const response = await axios.get(
    `${API_URL}/personnes-physiques/cin-exists/${cin}`,
    {
    //   ...getAuthHeader(),
      params: excludeId ? { excludeId } : {},
    }
  );
  return response.data;
};

// ✅ Recherche globale (nom, prénom, cin, email, téléphone)
export const searchPersonnesPhysiques = async (searchTerm, page = 1, limit = 5, nature = null) => {
  const response = await axios.post(
    `${API_URL}/personnes-physiques/search`,
    { searchTerm, page, limit, nature },
    // getAuthHeader()
  );
  return response.data;
};
