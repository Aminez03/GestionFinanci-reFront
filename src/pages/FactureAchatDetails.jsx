// src/components/FactureAchatDetails.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFactureAchatById, deleteFactureAchat } from "../services/factureAchatService";
import { Button, Card, Row, Col, Badge, Container } from "react-bootstrap";
import { getPersonneMoraleByTiersId } from "../services/personneMoraleService";

const FactureAchatDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [facture, setFacture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fournisseur, setFournisseur] = useState({});

  useEffect(() => {
    const fetchFactureDetails = async () => {
      try {
        const factureData = await getFactureAchatById(id);
        setFacture(factureData);



             if (factureData.fournisseurId) {
          try {
            const fournisseurData = await getPersonneMoraleByTiersId(factureData.fournisseurId);
            setFournisseur(fournisseurData);
          } catch (error) {
            console.error("Erreur lors de la récupération du fournisseur:", error);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la facture :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFactureDetails();
  }, [id]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "TND" }).format(value || 0);

  const getStatusBadge = (statut) => {
    const variantMap = {
      Brouillon: "secondary",
      "En attente": "warning",
      Payée: "success",
      Annulée: "danger",
    };
    return <Badge bg={variantMap[statut] || "dark"} className="px-3 py-2">{statut}</Badge>;
  };

  if (loading) {
    return (
      <div className="content d-flex justify-content-center align-items-center min-vh-50">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} role="status"></div>
          <p className="mt-3 text-muted fs-5">Chargement des détails de la facture...</p>
        </div>
      </div>
    );
  }

  if (!facture) {
    return (
      <div className="content d-flex justify-content-center align-items-center min-vh-50">
        <div className="text-center">
          <p className="text-danger fs-5 mb-4">Facture non trouvée</p>
          <Button variant="primary" onClick={() => navigate("/FactureAchatList")}>
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Détails de la Facture d'Achat</h2>
          <p className="text-muted">Informations complètes sur la facture #{facture.numero}</p>
        </div>
        <Button variant="outline-primary" className="rounded-pill px-4" onClick={() => navigate("/FactureAchatList")}>
          <i className="bi bi-arrow-left me-2"></i>Retour à la liste
        </Button>
      </div>

      <Container className="py-4 bg-light min-vh-100">
        <Row>
          <Col lg={8}>
            <Card className="border-0 shadow-sm rounded-3 mb-4" style={{ maxWidth: "95%" }}>
              <Card.Header className="bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">Facture {facture.numero}</h5>
                  <small className="text-muted">Émise le {new Date(facture.dateCreation).toLocaleDateString("fr-FR")}</small>
                </div>
                <div className="d-flex align-items-center">
                  <span className="me-3">Statut:</span>
                  {getStatusBadge(facture.statut)}
                </div>
              </Card.Header>

              {/* Infos Fournisseur */}
              <Card.Body className="border-bottom">
                <h6 className="text-uppercase text-primary mb-3 fw-bold">
                  <i className="bi bi-building me-2"></i>Fournisseur
                </h6>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <p className="mb-0 text-muted small">Raison sociale</p>
                      <p className="fw-semibold">{fournisseur?.raisonSociale || "N/A"}</p>
                    </div>
                    <div className="mb-3">
                      <p className="mb-0 text-muted small">Matricule fiscale</p>
                      <p className="fw-semibold">{fournisseur?.matriculeFiscale || "N/A"}</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <p className="mb-0 text-muted small">Adresse</p>
                      <p className="fw-semibold">{facture.fournisseur?.adresse || "N/A"}</p>
                    </div>
                
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <p className="mb-0 text-muted small">email</p>
                      <p className="fw-semibold">{facture.fournisseur?.email || "N/A"}</p>
                    </div>
                
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <p className="mb-0 text-muted small">telephone</p>
                      <p className="fw-semibold">{facture.fournisseur?.telephone || "N/A"}</p>
                    </div>
                
                  </Col>
                </Row>
              </Card.Body>

              {/* Lignes Produits */}
              {facture.lignesProduits?.length > 0 && (
                <Card.Body>
                  <h6 className="text-uppercase text-primary mb-3 fw-bold">
                    <i className="bi bi-box-seam me-2"></i>Produits
                  </h6>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Description</th>
                          <th className="text-center">Quantité</th>
                          <th className="text-end">Prix unitaire</th>
                          <th className="text-end">Montant</th>
                        </tr>
                      </thead>
                      <tbody>
                        {facture.lignesProduits.map((produit, index) => (
                          <tr key={index}>
                            <td>{produit.produit?.nom || produit.description || "N/A"}</td>
                            <td className="text-center">{produit.quantite}</td>
                            <td className="text-end">{formatCurrency(produit.prixUnitaire)}</td>
                            <td className="text-end fw-semibold">{formatCurrency(produit.sousTotalHT)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card.Body>
              )}
            </Card>
          </Col>

          {/* Récapitulatif & Actions */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm rounded-3" style={{ top: "20px" }}>
              <Card.Header className="bg-white py-3 border-0">
                <h6 className="text-uppercase text-primary mb-0 fw-bold">
                  <i className="bi bi-receipt me-2"></i>Récapitulatif
                </h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Total HT:</span>
                  <span className="fw-semibold">{formatCurrency(facture.totalHT)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Total TVA:</span>
                  <span className="fw-semibold">{formatCurrency(facture.totalTVA)}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Timbre:</span>
                  <span className="fw-semibold">{formatCurrency(facture.timbre)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-dark fw-bold">Total TTC:</span>
                  <span className="text-dark fw-bold fs-5">{formatCurrency(facture.totalTTC)}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-dark fw-bold">Net à payer:</span>
                  <span className="text-primary fw-bold fs-5">{formatCurrency(facture.netAPayer)}</span>
                </div>
              </Card.Body>

              <Card className="border-0 shadow-sm rounded-3 mt-4">
                <Card.Body className="d-grid gap-2">
                  <Button variant="outline-primary" className="rounded-pill" onClick={() => window.print()}>
                    <i className="bi bi-printer me-2"></i>Imprimer
                  </Button>
                  <Button variant="primary" className="rounded-pill" onClick={() => navigate(`/FactureAchatEdit/${facture.id}`)}>
                    <i className="bi bi-pencil me-2"></i>Modifier la facture
                  </Button>
                  <Button variant="outline-danger" className="rounded-pill" onClick={() => {
                    if (window.confirm("Confirmer la suppression ?")) {
                      deleteFactureAchat(facture.id).then(() => navigate("/FactureAchatList"));
                    }
                  }}>
                    <i className="bi bi-trash me-2"></i>Supprimer
                  </Button>
                </Card.Body>
              </Card>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default FactureAchatDetails;
