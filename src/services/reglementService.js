import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;
// ------------------------ CAISSE ------------------------

// --- Liste de toutes les caisses ---
export const getAllCaisses = async () => {
  const res = await axios.get(`${API_URL}/reglements/caisse`);
  return res.data;
};

// --- Récupérer une caisse par ID ---
export const getCaisseById = async (id) => {
  const res = await axios.get(`${API_URL}/reglements/caisse/${id}`);
  return res.data;
};

// --- Créer une nouvelle caisse ---
export const createCaisse = async (data) => {
  const res = await axios.post(`${API_URL}/reglements/caisse`, data);
  return res.data;
};

// --- Mettre à jour une caisse ---
export const updateCaisse = async (id, data) => {
  const res = await axios.put(`${API_URL}/reglements/caisse/${id}`, data);
  return res.data;
};

// --- Supprimer une caisse ---
export const deleteCaisse = async (id) => {
  const res = await axios.delete(`${API_URL}/reglements/caisse/${id}`);
  return res.data;
};

// ------------------- COMPTE BANCAIRE -------------------

// --- Liste de tous les comptes bancaires ---
export const getAllComptesBancaires = async () => {
  const res = await axios.get(`${API_URL}/reglements/comptebancaire`);
  return res.data;
};

// --- Récupérer un compte bancaire par ID ---
export const getCompteBancaireById = async (id) => {
  const res = await axios.get(`${API_URL}/reglements/comptebancaire/${id}`);
  return res.data;
};

// --- Créer un nouveau compte bancaire ---
export const createCompteBancaire = async (data) => {
  const res = await axios.post(`${API_URL}/reglements/comptebancaire`, data);
  return res.data;
};

// --- Mettre à jour un compte bancaire ---
export const updateCompteBancaire = async (id, data) => {
  const res = await axios.put(`${API_URL}/reglements/comptebancaire/${id}`, data);
  return res.data;
};

// --- Supprimer un compte bancaire ---
export const deleteCompteBancaire = async (id) => {
  const res = await axios.delete(`${API_URL}/reglements/comptebancaire/${id}`);
  return res.data;
};
