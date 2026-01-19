// src/components/ContactForm.js
import React, { useState, useEffect } from "react";
import { createContact, updateContact } from "../services/contactService";

const ContactForm = ({ personneMoraleId, contactToEdit, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    nom: "",
    fonction: "",
    email: "",
    tel: "",
  });

  useEffect(() => {
    if (contactToEdit) setFormData(contactToEdit);
  }, [contactToEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (contactToEdit) {
        await updateContact(contactToEdit.id, formData);
      } else {
        await createContact({ ...formData, personne_morale_id: personneMoraleId });
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement du contact.");
    }
  };

  return (
    <div className="card p-3 mb-3">
      <h5>{contactToEdit ? "Modifier le contact" : "Ajouter un contact"}</h5>
      <form onSubmit={handleSubmit}>
        <div className="row mb-2">
          <div className="col">
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Nom"
              className="form-control"
              required
            />
          </div>
          <div className="col">
            <input
              type="text"
              name="fonction"
              value={formData.fonction}
              onChange={handleChange}
              placeholder="Fonction"
              className="form-control"
              required
            />
          </div>
        </div>
        <div className="row mb-2">
          <div className="col">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="form-control"
            />
          </div>
          <div className="col">
            <input
              type="text"
              name="tel"
              value={formData.tel}
              onChange={handleChange}
              placeholder="Téléphone"
              className="form-control"
            />
          </div>
        </div>
        <div className="d-flex justify-content-end">
          <button type="button" className="btn btn-secondary me-2" onClick={onClose}>Annuler</button>
          <button type="submit" className="btn btn-success">{contactToEdit ? "Mettre à jour" : "Ajouter"}</button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
