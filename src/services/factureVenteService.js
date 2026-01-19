// src/services/factureVenteService.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// ✅ Créer une facture de vente
export const createFactureVente = async (data) => {
  const response = await axios.post(
    `${API_URL}/facturesVente`,
    data
  );
  return response.data;
};


// // ✅ Récupérer toutes les factures avec filtres optionnels et pagination
export const getAllFacturesVente = async (
  statut = null,
  numero = null,
  page = 1,
  limit = 10
) => {
  const params = { page, limit };
  if (statut) params.statut = statut;
  if (numero) params.numero = numero;


  const response = await axios.get(`${API_URL}/facturesVente`, { params });
  return response.data; // doit renvoyer { data: [...], pagination: { total, page, limit, pages } }
};





// ✅ Récupérer une facture de vente par ID
export const getFactureVenteById = async (id) => {
  const response = await axios.get(`${API_URL}/facturesVente/${id}`);
  return response.data;
};

// ✅ Mettre à jour une facture de vente
export const updateFactureVente = async (id, data) => {
  const response = await axios.put(
    `${API_URL}/facturesVente/${id}`,
    data
  );
  return response.data;
};

// ✅ Supprimer une facture de vente
export const deleteFactureVente = async (id) => {
  const response = await axios.delete(`${API_URL}/facturesVente/${id}`);
  return response.data;
};
export const payerFactureVente = async (data) => {
  // data = { factureId, montant, modePaiement, type, solde?, rib?, banque? }
  const response = await axios.post(`${API_URL}/facturesVente/payer`, data);
  return response.data;
};