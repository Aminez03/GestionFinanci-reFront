// src/components/PersonnePhysiqueDetail.js
import React, { useEffect, useState } from "react";
import { getPersonnePhysiqueById } from "../services/personnePhysiqueService";
import { useNavigate, useParams } from "react-router-dom";
import { FaIdCard, FaEnvelope, FaPhone, FaArrowLeft } from "react-icons/fa";
import { Card, Row, Col, Button, Spinner, Badge, Alert } from "react-bootstrap";

const PersonnePhysiqueDetail = () => {
  const [personne, setPersonne] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPersonnePhysiqueById(id);
        setPersonne(data);
      } catch (err) {
        console.error("Erreur lors du chargement:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="content d-flex flex-column justify-content-center align-items-center mt-5">
        <Spinner animation="border" variant="primary" style={{width:"3rem", height:"3rem"}} />
        <p className="mt-3 text-muted fs-5">Chargement des détails...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content">
        <Alert variant="danger" className="mt-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
        <Button
          variant="outline-secondary"
          className="rounded-pill px-4"
          onClick={() => navigate("/PersonnePhysiqueList")}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour à la liste
        </Button>
      </div>
    );
  }

  if (!personne) {
    return (
      <div className="content">
        <Alert variant="warning" className="mt-4">
          <i className="bi bi-exclamation-circle me-2"></i>
          Personne non trouvée
        </Alert>
        <Button
          variant="outline-secondary"
          className="rounded-pill px-4"
          onClick={() => navigate("/PersonnePhysiqueList")}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour à la liste
        </Button>
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
            Détails de la Personne Physique
          </h2>
          <p className="text-muted mb-0">Informations complètes de cette personne</p>
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

      {/* Main Detail Card */}
      <Card className="border-0 shadow-sm" style={{ maxWidth: "100%" }}>
        <Card.Header className="bg-primary bg-opacity-10 border-0">
          <h5 className="mb-0 fw-semibold text-primary">
            <i className="bi bi-person-lines-fill me-2"></i>
            Informations Personnelles
          </h5>
        </Card.Header>
        
        <Card.Body className="p-4">
          <Row className="g-4">
            {/* Person Header */}
            <Col md={12}>
              <div className="d-flex align-items-center mb-4 p-4 bg-light rounded-3">
                <div className={`bg-${personne.civilite === "Monsieur" ? "info" : "warning"} bg-opacity-10 rounded-circle p-4 me-4`}>
                  <i className={`bi ${personne.civilite === "Monsieur" ? "bi-person" : "bi-person-dress"} text-${personne.civilite === "Monsieur" ? "info" : "warning"}`} style={{ fontSize: "2.5rem" }}></i>
                </div>
                <div className="flex-grow-1">
                  <h3 className="fw-bold text-dark mb-2">
                    {personne.nom} {personne.prenom}
                  </h3>
                  <Badge bg={personne.civilite === "Monsieur" ? "info" : "warning"} className="px-3 py-2 fs-6">
                    {personne.civilite}
                  </Badge>
                </div>
                <div className="text-end">
                  <small className="text-muted">ID</small>
                  <div className="fw-bold text-primary fs-5">#{personne.id}</div>
                </div>
              </div>
            </Col>

            {/* Personal Information */}
            <Col md={12}>
              <div className="border-bottom pb-3 mb-4">
                <h6 className="fw-semibold text-muted mb-3">
                  <i className="bi bi-person me-2"></i>
                  Informations Personnelles
                </h6>
              </div>
            </Col>

            <Col md={6}>
              <div className="border rounded-3 p-3 h-100">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-card-text text-primary me-2"></i>
                  <small className="text-muted fw-semibold">CIN</small>
                </div>
                <div className="fw-bold font-monospace fs-5">
                  {personne.cin || <span className="text-muted">Non renseigné</span>}
                </div>
              </div>
            </Col>

            <Col md={6}>
              <div className="border rounded-3 p-3 h-100">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-gender-ambiguous text-info me-2"></i>
                  <small className="text-muted fw-semibold">Civilité</small>
                </div>
                <div className="fw-bold">
                  {personne.civilite || <span className="text-muted">Non renseignée</span>}
                </div>
              </div>
            </Col>

            {/* Contact Information */}
            <Col md={12}>
              <div className="border-bottom pb-3 mb-4 mt-4">
                <h6 className="fw-semibold text-muted mb-3">
                  <i className="bi bi-telephone me-2"></i>
                  Informations de Contact
                </h6>
              </div>
            </Col>

            <Col md={6}>
              <div className="border rounded-3 p-3 h-100">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-envelope text-success me-2"></i>
                  <small className="text-muted fw-semibold">Email</small>
                </div>
                <div className="fw-semibold">
                  {personne.email ? (
                    <a href={`mailto:${personne.email}`} className="text-success text-decoration-none">
                      {personne.email}
                    </a>
                  ) : (
                    <span className="text-muted">Non renseigné</span>
                  )}
                </div>
              </div>
            </Col>

            <Col md={6}>
              <div className="border rounded-3 p-3 h-100">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-telephone text-primary me-2"></i>
                  <small className="text-muted fw-semibold">Téléphone</small>
                </div>
                <div className="fw-semibold">
                  {personne.telephone ? (
                    <a href={`tel:${personne.telephone}`} className="text-primary text-decoration-none">
                      {personne.telephone}
                    </a>
                  ) : (
                    <span className="text-muted">Non renseigné</span>
                  )}
                </div>
              </div>
            </Col>

            {/* Address Information */}
            {personne.adresse && (
              <Col md={12}>
                <div className="border rounded-3 p-3">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-geo-alt text-info me-2"></i>
                    <small className="text-muted fw-semibold">Adresse</small>
                  </div>
                  <div className="fw-semibold">
                    {personne.adresse}
                  </div>
                </div>
              </Col>
            )}

            {/* Additional Information */}
            <Col md={12}>
              <div className="border-bottom pb-3 mb-4 mt-4">
                <h6 className="fw-semibold text-muted mb-3">
                  <i className="bi bi-info-circle me-2"></i>
                  Informations Supplémentaires
                </h6>
              </div>
            </Col>

            <Col md={6}>
              <div className="border rounded-3 p-3 h-100">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-calendar text-secondary me-2"></i>
                  <small className="text-muted fw-semibold">Date de Création</small>
                </div>
                <div className="fw-semibold">
                  {personne.createdAt ? new Date(personne.createdAt).toLocaleDateString("fr-FR") : "Non disponible"}
                </div>
              </div>
            </Col>

            <Col md={6}>
              <div className="border rounded-3 p-3 h-100">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-pencil text-warning me-2"></i>
                  <small className="text-muted fw-semibold">Dernière Modification</small>
                </div>
                <div className="fw-semibold">
                  {personne.updatedAt ? new Date(personne.updatedAt).toLocaleDateString("fr-FR") : "Non disponible"}
                </div>
              </div>
            </Col>
          </Row>

          {/* Action Buttons */}
          <div className="d-flex justify-content-end gap-3 mt-5">
            <Button
              variant="outline-secondary"
              className="rounded-pill px-4"
              onClick={() => navigate("/PersonnePhysiqueList")}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Retour à la liste
            </Button>
            <Button
              variant="warning"
              className="rounded-pill px-4"
              onClick={() => navigate(`/PersonnePhysiqueForm/${personne.id}`)}
            >
              <i className="bi bi-pencil me-2"></i>
              Modifier
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PersonnePhysiqueDetail;
