// src/services/contactService.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// const getAuthHeader = () => {
//   const user = JSON.parse(localStorage.getItem("user"));
//   return { headers: { Authorization: `Bearer ${user.token}` } };
// };

// ✅ Créer un contact
export const createContact = async (data) => {
  const response = await axios.post(
    `${API_URL}/contacts`,
    data,
    // getAuthHeader()
  );
  return response.data;
};

// ✅ Récupérer un contact par ID
export const getContactById = async (id) => {
  const response = await axios.get(
    `${API_URL}/contacts/${id}`,
    // getAuthHeader()
  );
  return response.data;
};

// ✅ Récupérer tous les contacts d'une personne morale
export const getContactsByPersonneMorale = async (personne_morale_id) => {
  const response = await axios.get(
    `${API_URL}/personnes-morales/${personne_morale_id}/contacts`,
    // getAuthHeader()
  );
  return response.data;
};

// ✅ Mettre à jour un contact
export const updateContact = async (id, data) => {
  const response = await axios.put(
    `${API_URL}/contacts/${id}`,
    data,
    // getAuthHeader()
  );
  return response.data;
};

// ✅ Supprimer un contact
export const deleteContact = async (id) => {
  const response = await axios.delete(
    `${API_URL}/contacts/${id}`,
    // getAuthHeader()
  );
  return response.data;
};
