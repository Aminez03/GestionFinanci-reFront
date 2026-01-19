import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Button, Row, Col, Card, InputGroup, Modal, Spinner, Alert } from "react-bootstrap";
import { FaConciergeBell, FaMoneyBillWave, FaPercent, FaArrowLeft, FaSave, FaPlus } from "react-icons/fa";

import { createService, updateService, getServiceById } from "../services/serviceService";
import { getAllTva, createTva } from "../services/tvaService";

const ServiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ description: "", tarif: "", tvaId: "" });
  const [tvas, setTvas] = useState([]);
  const [showTvaModal, setShowTvaModal] = useState(false);
  const [newTva, setNewTva] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTvas();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const data = await getServiceById(id);
          setFormData({
            description: data.description || "",
            tarif: data.tarif || "",
            tvaId: data.tvaId || "",
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

  const fetchTvas = async () => {
    try {
      const data = await getAllTva();
      setTvas(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des TVA:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleTvaChange = (e) => setFormData({ ...formData, tvaId: parseInt(e.target.value) });

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.description.trim()) newErrors.description = "La description du service est requise";
    if (!formData.tarif || parseFloat(formData.tarif) <= 0) {
      newErrors.tarif = "Le tarif doit être supérieur à 0";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      if (id) await updateService(id, formData);
      else await createService(formData);
      navigate("/ServiceList");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      setErrors({ submit: "Une erreur est survenue lors de la sauvegarde" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTva = async () => {
    if (!newTva) return;
    const tvaData = await createTva({ taux: parseFloat(newTva) });
    setTvas([...tvas, tvaData]);
    setFormData({ ...formData, tvaId: tvaData.id });
    setNewTva("");
    setShowTvaModal(false);
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
            <i className="bi bi-tools me-2"></i>
            {id ? "Modifier un Service" : "Nouveau Service"}
          </h2>
          <p className="text-muted mb-0">
            {id ? "Modifiez les informations de ce service" : "Ajoutez un nouveau service à votre catalogue"}
          </p>
        </div>
        <Button
          variant="outline-secondary"
          className="rounded-pill px-4 py-2"
          onClick={() => navigate("/ServiceList")}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour à la liste
        </Button>
      </div>

      {/* Main Form Card */}
      <Card className="border-0 shadow-sm" style={{ maxWidth: "100%" }}>
        <Card.Header className="bg-primary bg-opacity-10 border-0">
          <h5 className="mb-0 fw-semibold text-primary">
            <i className={`bi ${id ? "bi-tools" : "bi-tools"} me-2`}></i>
            {id ? "Modification" : "Création"} de Service
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
              {/* Service Information Section */}
              <Col md={12}>
                <div className="border-bottom pb-3 mb-4">
                  <h6 className="fw-semibold text-muted mb-3">
                    <i className="bi bi-tools me-2"></i>
                    Informations du Service
                  </h6>
                </div>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted">Description du Service *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0">
                      <i className="bi bi-tools text-muted"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Entrez la description du service"
                      className={`border-start-0 shadow-sm ${errors.description ? 'is-invalid' : ''}`}
                      required
                    />
                  </InputGroup>
                  {errors.description && <div className="invalid-feedback d-block">{errors.description}</div>}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted">Tarif (DT) *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0">
                      <i className="bi bi-currency-dollar text-muted"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      name="tarif"
                      value={formData.tarif}
                      onChange={handleChange}
                      placeholder="0.00"
                      className={`border-start-0 shadow-sm ${errors.tarif ? 'is-invalid' : ''}`}
                      required
                    />
                  </InputGroup>
                  {errors.tarif && <div className="invalid-feedback d-block">{errors.tarif}</div>}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted">TVA</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0">
                      <i className="bi bi-percent text-muted"></i>
                    </InputGroup.Text>
                    <Form.Select 
                      value={formData.tvaId || ""} 
                      onChange={handleTvaChange}
                      className="border-start-0 shadow-sm"
                    >
                      <option value="">Sélectionner la TVA</option>
                      {tvas.map((t) => (
                        <option key={t.id} value={t.id}>{t.taux}%</option>
                      ))}
                    </Form.Select>
                    <Button 
                      variant="outline-primary" 
                      onClick={() => setShowTvaModal(true)}
                      className="border-start-0"
                      title="Ajouter une nouvelle TVA"
                    >
                      <i className="bi bi-plus"></i>
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            {/* Action Buttons */}
            <div className="d-flex justify-content-end gap-3 mt-5">
              <Button
                variant="outline-secondary"
                className="rounded-pill px-4"
                onClick={() => navigate("/ServiceList")}
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
                    {id ? "Mettre à jour" : "Créer le service"}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Enhanced Modal pour ajouter TVA */}
      <Modal show={showTvaModal} onHide={() => setShowTvaModal(false)} centered>
        <Modal.Header className="bg-primary bg-opacity-10 border-0">
          <Modal.Title className="fw-semibold text-primary">
            <i className="bi bi-percent me-2"></i>
            Ajouter une TVA
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group>
            <Form.Label className="fw-semibold text-muted">Taux de TVA (%)</Form.Label>
            <InputGroup>
              <InputGroup.Text className="bg-white border-end-0">
                <i className="bi bi-percent text-muted"></i>
              </InputGroup.Text>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={newTva}
                onChange={(e) => setNewTva(e.target.value)}
                placeholder="Ex: 19"
                className="border-start-0 shadow-sm"
              />
            </InputGroup>
            <Form.Text className="text-muted">
              Entrez le taux de TVA en pourcentage (ex: 19 pour 19%)
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            variant="outline-secondary"
            className="rounded-pill px-4"
            onClick={() => setShowTvaModal(false)}
          >
            <i className="bi bi-x-circle me-2"></i>
            Annuler
          </Button>
          <Button
            variant="primary"
            className="rounded-pill px-4"
            onClick={handleAddTva}
            disabled={!newTva || parseFloat(newTva) <= 0}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Ajouter
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ServiceForm;
