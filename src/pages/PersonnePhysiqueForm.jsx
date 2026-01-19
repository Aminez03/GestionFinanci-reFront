// src/components/PersonnePhysiqueForm.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { FaUserEdit, FaUserPlus } from "react-icons/fa";
import { Card, Row, Col, Form, InputGroup, Button, Spinner, Alert } from "react-bootstrap";

import {
  createPersonnePhysique,
  updatePersonnePhysique,
  getPersonnePhysiqueById,
} from "../services/personnePhysiqueService";
import { FaUser, FaIdCard, FaEnvelope, FaPhone, FaVenusMars, FaArrowLeft, FaSave } from "react-icons/fa";

const PersonnePhysiqueForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    cin: "",
    civilite: "Monsieur",
    email: "",
    telephone: "",
    adresse: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const data = await getPersonnePhysiqueById(id);
          setFormData({
            nom: data.nom || "",
            prenom: data.prenom || "",
            cin: data.cin || "",
            civilite: data.civilite || "Monsieur",
            email: data.email || "",
            telephone: data.telephone || "",
            adresse: data.adresse || "",
          });
        } catch (error) {
          console.error("Erreur lors du chargement:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis";
    if (!formData.cin.trim()) newErrors.cin = "Le CIN est requis";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide";
    }
    if (formData.telephone && !/^[0-9+\-\s()]+$/.test(formData.telephone)) {
      newErrors.telephone = "Le numéro de téléphone n'est pas valide";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      if (id) {
        await updatePersonnePhysique(id, formData);
      } else {
        await createPersonnePhysique(formData);
      }
      navigate("/PersonnePhysiqueList");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      setErrors({ submit: "Une erreur est survenue lors de la sauvegarde" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="content d-flex flex-column justify-content-center align-items-center mt-5">
        <Spinner animation="border" variant="primary" style={{width:"3rem", height:"3rem"}} />
        <p className="mt-3 text-muted fs-5">Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="content">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-2">
            <i className="bi bi-person me-2"></i>
            {id ? "Modifier une Personne Physique" : "Nouvelle Personne Physique"}
          </h2>
          <p className="text-muted mb-0">
            {id ? "Modifiez les informations de cette personne" : "Ajoutez une nouvelle personne physique à votre base de données"}
          </p>
        </div>
        <Button
          variant="outline-secondary"
          className="rounded-pill px-4 py-2"
          onClick={() => navigate("/PersonnePhysiqueList")}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour à la liste
        </Button>
      </div>

      {/* Main Form Card */}
      <Card className="border-0 shadow-sm" style={{ maxWidth: "100%" }}>
        <Card.Header className="bg-primary bg-opacity-10 border-0">
          <h5 className="mb-0 fw-semibold text-primary">
            <i className={`bi ${id ? "bi-person-gear" : "bi-person-plus"} me-2`}></i>
            {id ? "Modification" : "Création"} de Personne Physique
          </h5>
        </Card.Header>
        
        <Card.Body className="p-4">
          {errors.submit && (
            <Alert variant="danger" className="mb-4">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {errors.submit}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row className="g-4">
              {/* Personal Information Section */}
              <Col md={12}>
                <div className="border-bottom pb-3 mb-4">
                  <h6 className="fw-semibold text-muted mb-3">
                    <i className="bi bi-person me-2"></i>
                    Informations Personnelles
                  </h6>
                </div>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted">Nom *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0">
                      <i className="bi bi-person text-muted"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      placeholder="Entrez le nom"
                      className={`border-start-0 shadow-sm ${errors.nom ? 'is-invalid' : ''}`}
                      required
                    />
                  </InputGroup>
                  {errors.nom && <div className="invalid-feedback d-block">{errors.nom}</div>}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted">Prénom *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0">
                      <i className="bi bi-person text-muted"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      placeholder="Entrez le prénom"
                      className={`border-start-0 shadow-sm ${errors.prenom ? 'is-invalid' : ''}`}
                      required
                    />
                  </InputGroup>
                  {errors.prenom && <div className="invalid-feedback d-block">{errors.prenom}</div>}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted">CIN *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0">
                      <i className="bi bi-card-text text-muted"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="cin"
                      value={formData.cin}
                      onChange={handleChange}
                      placeholder="Numéro CIN"
                      className={`border-start-0 shadow-sm font-monospace ${errors.cin ? 'is-invalid' : ''}`}
                      required
                    />
                  </InputGroup>
                  {errors.cin && <div className="invalid-feedback d-block">{errors.cin}</div>}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted">Civilité *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0">
                      <i className="bi bi-gender-ambiguous text-muted"></i>
                    </InputGroup.Text>
                    <Form.Select
                      name="civilite"
                      value={formData.civilite}
                      onChange={handleChange}
                      className="border-start-0 shadow-sm"
                      required
                    >
                      <option value="Monsieur">Monsieur</option>
                      <option value="Madame">Madame</option>
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
              </Col>

              {/* Contact Information Section */}
              <Col md={12}>
                <div className="border-bottom pb-3 mb-4 mt-4">
                  <h6 className="fw-semibold text-muted mb-3">
                    <i className="bi bi-telephone me-2"></i>
                    Informations de Contact
                  </h6>
                </div>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted">Email</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0">
                      <i className="bi bi-envelope text-muted"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="exemple@email.com"
                      className={`border-start-0 shadow-sm ${errors.email ? 'is-invalid' : ''}`}
                    />
                  </InputGroup>
                  {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted">Téléphone</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0">
                      <i className="bi bi-telephone text-muted"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      placeholder="+216 XX XXX XXX"
                      className={`border-start-0 shadow-sm ${errors.telephone ? 'is-invalid' : ''}`}
                    />
                  </InputGroup>
                  {errors.telephone && <div className="invalid-feedback d-block">{errors.telephone}</div>}
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted">Adresse</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0">
                      <i className="bi bi-geo-alt text-muted"></i>
                    </InputGroup.Text>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleChange}
                      placeholder="Adresse complète"
                      className="border-start-0 shadow-sm"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            {/* Action Buttons */}
            <div className="d-flex justify-content-end gap-3 mt-5">
              <Button
                variant="outline-secondary"
                className="rounded-pill px-4"
                onClick={() => navigate("/PersonnePhysiqueList")}
                disabled={isSubmitting}
              >
                <i className="bi bi-x-circle me-2"></i>
                Annuler
              </Button>
              <Button
                variant="success"
                type="submit"
                className="rounded-pill px-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    {id ? "Mettre à jour" : "Créer la personne"}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PersonnePhysiqueForm;
