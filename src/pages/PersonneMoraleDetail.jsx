import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPersonneMoraleById } from "../services/personneMoraleService";
import { deleteContact } from "../services/contactService";
import ContactForm from "./ContactForm";
import { Card, Row, Col, Button, Spinner, Badge, Alert, Table } from "react-bootstrap";

const PersonneMoraleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [personne, setPersonne] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [contactToEdit, setContactToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPersonne = async () => {
    setLoading(true);
    setError(null);
    try {
    const data = await getPersonneMoraleById(id);
    setPersonne(data);
    } catch (err) {
      console.error("Erreur lors du chargement:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPersonne(); }, [id]);

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
          onClick={() => navigate("/PersonneMoraleList")}
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
          Entreprise non trouvée
        </Alert>
        <Button
          variant="outline-secondary"
          className="rounded-pill px-4"
          onClick={() => navigate("/PersonneMoraleList")}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour à la liste
        </Button>
      </div>
    );
  }

  const handleDeleteContact = async (contactId) => {
    if (window.confirm("❌ Supprimer ce contact ?")) {
      await deleteContact(contactId);
      fetchPersonne();
    }
  };

  const handleEditContact = (contact) => {
    setContactToEdit(contact);
    setShowForm(true);
  };

  const handleAddContact = () => {
    setContactToEdit(null);
    setShowForm(true);
  };

  return (
    <div className="content">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
    <div>
          <h2 className="fw-bold text-primary mb-2">
            <i className="bi bi-building me-2"></i>
            Détails de la Personne Morale
          </h2>
          <p className="text-muted mb-0">Informations complètes de cette entreprise</p>
        </div>
        <Button
          variant="outline-secondary"
          className="rounded-pill px-4 py-2"
          onClick={() => navigate("/PersonneMoraleList")}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour à la liste
        </Button>
      </div>

      {/* Main Detail Card */}
      <Card className="border-0 shadow-sm" style={{ maxWidth: "100%" }}>
        <Card.Header className="bg-primary bg-opacity-10 border-0">
          <h5 className="mb-0 fw-semibold text-primary">
            <i className="bi bi-building-lines me-2"></i>
            Informations de l'Entreprise
          </h5>
        </Card.Header>
        
        <Card.Body className="p-4">
          <Row className="g-4">
            {/* Company Header */}
            <Col md={12}>
              <div className="d-flex align-items-center mb-4 p-4 bg-light rounded-3">
                <div className="bg-primary bg-opacity-10 rounded-circle p-4 me-4">
                  <i className="bi bi-building text-primary" style={{ fontSize: "2.5rem" }}></i>
                </div>
                <div className="flex-grow-1">
                  <h3 className="fw-bold text-dark mb-2">
                    {personne.raisonSociale}
                  </h3>
                  <Badge bg={personne.nature === "Client" ? "success" : "info"} className="px-3 py-2 fs-6">
                    {personne.nature}
                  </Badge>
                </div>
                <div className="text-end">
                  <small className="text-muted">ID</small>
                  <div className="fw-bold text-primary fs-5">#{personne.id}</div>
                </div>
              </div>
            </Col>

            {/* Company Information */}
            <Col md={12}>
              <div className="border-bottom pb-3 mb-4">
                <h6 className="fw-semibold text-muted mb-3">
                  <i className="bi bi-building me-2"></i>
                  Informations de l'Entreprise
                </h6>
              </div>
            </Col>

            <Col md={6}>
              <div className="border rounded-3 p-3 h-100">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-card-text text-primary me-2"></i>
                  <small className="text-muted fw-semibold">Matricule Fiscal</small>
                </div>
                <div className="fw-bold font-monospace fs-5">
                  {personne.matriculeFiscale || <span className="text-muted">Non renseigné</span>}
                </div>
              </div>
            </Col>

            <Col md={6}>
              <div className="border rounded-3 p-3 h-100">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-tag text-info me-2"></i>
                  <small className="text-muted fw-semibold">Nature</small>
                </div>
                <div className="fw-bold">
                  {personne.nature || <span className="text-muted">Non renseignée</span>}
                </div>
              </div>
            </Col>

            {personne.siteweb && (
              <Col md={12}>
                <div className="border rounded-3 p-3">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-globe text-success me-2"></i>
                    <small className="text-muted fw-semibold">Site Web</small>
                  </div>
                  <div className="fw-semibold">
                    <a href={personne.siteweb} target="_blank" rel="noopener noreferrer" className="text-success text-decoration-none">
                      {personne.siteweb}
                    </a>
                  </div>
                </div>
              </Col>
            )}

            {/* General Information */}
            {personne.tiers && (
              <>
                <Col md={12}>
                  <div className="border-bottom pb-3 mb-4 mt-4">
                    <h6 className="fw-semibold text-muted mb-3">
                      <i className="bi bi-telephone me-2"></i>
                      Informations Générales
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
                      {personne.tiers.email ? (
                        <a href={`mailto:${personne.tiers.email}`} className="text-success text-decoration-none">
                          {personne.tiers.email}
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
                      {personne.tiers.telephone ? (
                        <a href={`tel:${personne.tiers.telephone}`} className="text-primary text-decoration-none">
                          {personne.tiers.telephone}
                        </a>
                      ) : (
                        <span className="text-muted">Non renseigné</span>
                      )}
                    </div>
                  </div>
                </Col>

                {personne.tiers.adresse && (
                  <Col md={12}>
                    <div className="border rounded-3 p-3">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-geo-alt text-info me-2"></i>
                        <small className="text-muted fw-semibold">Adresse</small>
                      </div>
                      <div className="fw-semibold">
                        {personne.tiers.adresse}
                      </div>
                    </div>
                  </Col>
                )}
              </>
            )}

            {/* Contacts Section */}
            <Col md={12}>
              <div className="border-bottom pb-3 mb-4 mt-4">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="fw-semibold text-muted mb-0">
                    <i className="bi bi-people me-2"></i>
                    Contacts ({personne.contacts?.length || 0})
                  </h6>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={handleAddContact}
                    className="rounded-pill px-3"
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Ajouter un contact
                  </Button>
                </div>
      </div>
            </Col>

      {showForm && (
              <Col md={12}>
                <Card className="border-0 shadow-sm mb-4">
                  <Card.Header className="bg-success bg-opacity-10 border-0">
                    <h6 className="mb-0 fw-semibold text-success">
                      <i className="bi bi-person-plus me-2"></i>
                      {contactToEdit ? "Modifier le contact" : "Nouveau contact"}
                    </h6>
                  </Card.Header>
                  <Card.Body className="p-3">
        <ContactForm
          personneMoraleId={id}
          contactToEdit={contactToEdit}
          onClose={() => setShowForm(false)}
          onSaved={fetchPersonne}
        />
                  </Card.Body>
                </Card>
              </Col>
            )}

            {personne.contacts && personne.contacts.length > 0 ? (
              <Col md={12}>
                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-0">
                    <div className="table-responsive">
                      <Table hover className="mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="border-0 fw-semibold text-muted py-3 px-4">
                              <i className="bi bi-person me-2"></i>Nom
                            </th>
                            <th className="border-0 fw-semibold text-muted py-3 px-4">
                              <i className="bi bi-briefcase me-2"></i>Fonction
                            </th>
                            <th className="border-0 fw-semibold text-muted py-3 px-4">
                              <i className="bi bi-envelope me-2"></i>Email
                            </th>
                            <th className="border-0 fw-semibold text-muted py-3 px-4">
                              <i className="bi bi-telephone me-2"></i>Téléphone
                            </th>
                            <th className="border-0 fw-semibold text-muted py-3 px-4 text-center">
                              <i className="bi bi-gear me-2"></i>Actions
                            </th>
            </tr>
          </thead>
          <tbody>
            {personne.contacts.map((c) => (
                            <tr key={c.id} className="border-bottom">
                              <td className="py-3 px-4">
                                <div className="fw-semibold">{c.nom || <span className="text-muted">Non renseigné</span>}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div>{c.fonction || <span className="text-muted">Non renseignée</span>}</div>
                              </td>
                              <td className="py-3 px-4">
                                {c.email ? (
                                  <a href={`mailto:${c.email}`} className="text-success text-decoration-none">
                                    {c.email}
                                  </a>
                                ) : (
                                  <span className="text-muted">Non renseigné</span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                {c.tel ? (
                                  <a href={`tel:${c.tel}`} className="text-primary text-decoration-none">
                                    {c.tel}
                                  </a>
                                ) : (
                                  <span className="text-muted">Non renseigné</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="d-flex gap-2 justify-content-center">
                                  <Button
                                    variant="outline-warning"
                                    size="sm"
                                    onClick={() => handleEditContact(c)}
                                    className="rounded-pill"
                                    title="Modifier le contact"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDeleteContact(c.id)}
                                    className="rounded-pill"
                                    title="Supprimer le contact"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </Button>
                                </div>
                </td>
              </tr>
            ))}
          </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ) : (
              <Col md={12}>
                <Card className="border-0 shadow-sm">
                  <Card.Body className="text-center py-5">
                    <i className="bi bi-people text-muted" style={{ fontSize: "3rem" }}></i>
                    <h5 className="text-muted mt-3">Aucun contact</h5>
                    <p className="text-muted mb-4">Cette entreprise n'a pas encore de contacts enregistrés.</p>
                    <Button
                      variant="success"
                      onClick={handleAddContact}
                      className="rounded-pill px-4"
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Ajouter le premier contact
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>

          {/* Action Buttons */}
          <div className="d-flex justify-content-end gap-3 mt-5">
            <Button
              variant="outline-secondary"
              className="rounded-pill px-4"
              onClick={() => navigate("/PersonneMoraleList")}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Retour à la liste
            </Button>
            <Button
              variant="warning"
              className="rounded-pill px-4"
              onClick={() => navigate(`/PersonneMoraleForm/${personne.id}`)}
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

export default PersonneMoraleDetail;
