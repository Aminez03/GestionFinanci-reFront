// src/components/PersonneMoraleForm.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Button, Row, Col, Card, InputGroup } from "react-bootstrap";
import { FaBuilding, FaIdCard, FaEnvelope, FaPhone, FaPlus, FaTrash, FaArrowLeft, FaSave, FaEdit, FaBriefcase, FaUser } from "react-icons/fa";

import {
  createPersonneMorale,
  updatePersonneMorale,
  getPersonneMoraleById,
} from "../services/personneMoraleService";

const PersonneMoraleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    raisonSociale: "",
    matriculeFiscale: "",
    siteweb: "",
    nature: "",
    email: "",
    telephone: "",
  });

  const [contacts, setContacts] = useState([{ id: null, nom: "", fonction: "", email: "", tel: "" }]);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        const data = await getPersonneMoraleById(id);
        setFormData({
          ...data,
          email: data.tiers?.email || "",
          telephone: data.tiers?.telephone || "",
        });
        if (data.contacts && data.contacts.length > 0) {
          setContacts(
            data.contacts.map((c) => ({
              id: c.id || null, // id pour update
              nom: c.nom || "",
              fonction: c.fonction || "",
              email: c.email || "",
              tel: c.tel || "",
            }))
          );
        }
      };
      fetchData();
    }
  }, [id]);

  // Gestion formulaire principal
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Gestion contacts
  const handleContactChange = (index, e) => {
    const updatedContacts = [...contacts];
    updatedContacts[index][e.target.name] = e.target.value;
    setContacts(updatedContacts);
  };

  const addContact = () => setContacts([...contacts, { id: null, nom: "", fonction: "", email: "", tel: "" }]);
  const removeContact = (index) => setContacts(contacts.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = { ...formData, contacts };
    try {
      if (id) {
        await updatePersonneMorale(id, dataToSend);
      } else {
        await createPersonneMorale(dataToSend);
      }
      navigate("/PersonneMoraleList");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
    }
  };

  return (
    <div className="content">
      <Card className="shadow-sm p-4" style={{ maxWidth: "95%" }}>
        <Card.Body>
          <h3 className="mb-4 text-primary">
            {id ? "✏️ Modifier Personne Morale" : "➕ Ajouter Personne Morale"}
          </h3>
          <Form onSubmit={handleSubmit}>
            {/* Infos Personne Morale */}
            <Row className="mb-3">
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text><FaBuilding /></InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="raisonSociale"
                    value={formData.raisonSociale}
                    onChange={handleChange}
                    placeholder="Raison Sociale"
                    required
                  />
                </InputGroup>
              </Col>
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text><FaIdCard /></InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="matriculeFiscale"
                    value={formData.matriculeFiscale}
                    onChange={handleChange}
                    placeholder="Matricule Fiscale"
                    required
                  />
                </InputGroup>
              </Col>
            </Row>

            <Row className="mb-3">
          
<Col md={6}>
  <InputGroup >
    <InputGroup.Text>
      <FaBuilding /> {/* ou FaUser, FaBriefcase selon le contexte */}
    </InputGroup.Text>
    <Form.Select
      name="nature"
      value={formData.nature}
      onChange={handleChange}
    >
      <option value="Fournisseur">Fournisseur</option>
      <option value="ClientPro">ClientPro</option>
    </Form.Select>
  </InputGroup>
</Col>




  

              <Col md={6}>
                <Form.Control
                  type="text"
                  name="siteweb"
                  value={formData.siteweb}
                  onChange={handleChange}
                  placeholder="Site Web"
                  className="mb-2"
                />
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text><FaEnvelope /></InputGroup.Text>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email général"
                  />
                </InputGroup>
              </Col>
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text><FaPhone /></InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="Téléphone général"
                  />
                </InputGroup>
              </Col>
            </Row>

            {/* Contacts */}
            <h5 className="mb-3">Contacts</h5>
            {contacts.map((contact, index) => (
  <Card className="mb-3" key={index}>
    <Card.Body>
      <Row className="mb-2">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <FaUser />
            </InputGroup.Text>
            <Form.Control
              type="text"
              name="nom"
              value={contact.nom}
              onChange={(e) => handleContactChange(index, e)}
              placeholder="Nom"
            />
          </InputGroup>
        </Col>
        <Col>
          <InputGroup>
            <InputGroup.Text>
              <FaBriefcase />
            </InputGroup.Text>
            <Form.Control
              type="text"
              name="fonction"
              value={contact.fonction}
              onChange={(e) => handleContactChange(index, e)}
              placeholder="Fonction"
            />
          </InputGroup>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col>
          <InputGroup>
            <InputGroup.Text>
              <FaEnvelope />
            </InputGroup.Text>
            <Form.Control
              type="email"
              name="email"
              value={contact.email}
              onChange={(e) => handleContactChange(index, e)}
              placeholder="Email"
            />
          </InputGroup>
        </Col>
        <Col>
          <InputGroup>
            <InputGroup.Text>
              <FaPhone />
            </InputGroup.Text>
            <Form.Control
              type="text"
              name="tel"
              value={contact.tel}
              onChange={(e) => handleContactChange(index, e)}
              placeholder="Téléphone"
            />
          </InputGroup>
        </Col>
      </Row>
      <div className="d-flex gap-2">
        <Button
          variant="info"
          size="sm"
          onClick={() => alert(`Modifier contact: ${contact.nom}`)}
        >
          <FaEdit /> Modifier
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => removeContact(index)}
        >
          <FaTrash /> Supprimer
        </Button>
      </div>
    </Card.Body>
  </Card>
))}

            <Button variant="success" size="sm" onClick={addContact} className="mb-4">
              <FaPlus /> Ajouter un contact
            </Button>

            {/* Boutons */}
            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={() => navigate("/PersonneMoraleList")}>
                <FaArrowLeft /> Retour
              </Button>
              <Button variant="success" type="submit">
                <FaSave /> {id ? "Mettre à jour" : "Ajouter"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PersonneMoraleForm;
