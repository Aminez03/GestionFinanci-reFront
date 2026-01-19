import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// ✅ Créer une facture d'achat
export const createFactureAchat = async (data) => {
  const response = await axios.post(`${API_URL}/facturesAchat`, data);
  return response.data;
};
// // ✅ Récupérer toutes les factures avec filtres optionnels et pagination
export const getAllFacturesAchat = async (
  statut = null,
  numero = null,
  page = 1,
  limit = 10
) => {
  const params = { page, limit };
  if (statut) params.statut = statut;
  if (numero) params.numero = numero;


  const response = await axios.get(`${API_URL}/facturesAchat`, { params });
  return response.data; // doit renvoyer { data: [...], pagination: { total, page, limit, pages } }
};







// ✅ Récupérer une facture d'achat par ID
export const getFactureAchatById = async (id) => {
  const response = await axios.get(`${API_URL}/facturesAchat/${id}`);
  return response.data;
};

// ✅ Mettre à jour une facture d'achat
export const updateFactureAchat = async (id, data) => {
  const response = await axios.put(`${API_URL}/facturesAchat/${id}`, data);
  return response.data;
};

// ✅ Supprimer une facture d'achat
export const deleteFactureAchat = async (id) => {
  const response = await axios.delete(`${API_URL}/facturesAchat/${id}`);
  return response.data;
};

// ✅ Valider une facture d'achat
export const validateFactureAchat = async (id) => {
  const response = await axios.post(`${API_URL}/facturesAchat/${id}/validate`);
  return response.data;
};
