// src/components/FactureVenteDetails.js
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFactureVenteById, deleteFactureVente, updateFactureVente, payerFactureVente } from "../services/factureVenteService";
import { Button, Card, Row, Col, Badge, Container } from "react-bootstrap";
import { getPersonneMoraleByTiersId } from "../services/personneMoraleService";
import { Modal, Form } from "react-bootstrap";
const FactureVenteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [facture, setFacture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
const [paymentData, setPaymentData] = useState({
  type: "caisse", // "caisse" ou "compte_bancaire"
  montant: facture?.netAPayer || 0,
  modePaiement: "espèces",
  solde: 0,   
  rib: "",
  banque: ""
});
const [loadingPayment, setLoadingPayment] = useState(false);



  // ✅ Memoize fetchFactureDetails
  const fetchFactureDetails = useCallback(async () => {
    setLoading(true);
    try {
      const factureData = await getFactureVenteById(id);
      setFacture(factureData);

      if (factureData.clientId) {
        try {
          const clientData = await getPersonneMoraleByTiersId(factureData.clientId);
          setClient(clientData);
        } catch (error) {
          console.error("Erreur lors de la récupération du client:", error);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la facture:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ✅ Appel initial
  useEffect(() => {
    fetchFactureDetails();
  }, [fetchFactureDetails]);

  // ✅ Update statut
  const handleUpdateStatus = async (factureId, newStatus) => {
    try {
      await updateFactureVente(factureId, { statut: newStatus });
      await fetchFactureDetails(); // rafraîchir les données après update
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
    }
  };
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "TND",
    }).format(value || 0);
  };

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
          <Button variant="primary" onClick={() => navigate("/FactureVenteList")}>
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
          <h2 className="fw-bold text-dark mb-1">Détails de la Facture</h2>
          <p className="text-muted">Informations complètes sur la facture #{facture.numero}</p>
        </div>
        <Button variant="outline-primary" className="rounded-pill px-4" onClick={() => navigate("/FactureVenteList")}>
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
                  <small className="text-muted">
                    Émise le {new Date(facture.dateCreation).toLocaleDateString("fr-FR")}
                  </small>
                </div>
                <div className="d-flex align-items-center">
                  <span className="me-3">Statut:</span>
                  {getStatusBadge(facture.statut)}
                </div>




                  <button
                                className="btn btn-sm btn-success me-2 rounded-3"
                                onClick={() =>
                                  handleUpdateStatus(facture.id, "En attente")
                                }
                                title="Valider"
                              >
                                <i className="bi bi-check-circle"></i>
                              </button>
              </Card.Header>

              {/* Infos Client */}
              <Card.Body className="border-bottom">
                <h6 className="text-uppercase text-primary mb-3 fw-bold">
                  <i className="bi bi-building me-2"></i>Client
                </h6>
                <Row>
                    <Col md={6}>
                                   <div className="mb-3">
                                     <p className="mb-0 text-muted small">Raison sociale</p>
                                     <p className="fw-semibold">{client?.raisonSociale || "N/A"}</p>
                                   </div>
                                   <div className="mb-3">
                                     <p className="mb-0 text-muted small">Matricule fiscale</p>
                                     <p className="fw-semibold">{client?.matriculeFiscale || "N/A"}</p>
                                   </div>
                                 </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <p className="mb-0 text-muted small">Adresse</p>
                      <p className="fw-semibold">{facture.client?.adresse || "N/A"}</p>
                    </div>
                    <div className="mb-3">
                      <p className="mb-0 text-muted small">Projet</p>
                      <p className="fw-semibold">{facture.projet || "N/A"}</p>
                    </div>
                  </Col>
                </Row>
              </Card.Body>

              {/* Coordonnées */}
              <Card.Body className="border-bottom">
                <h6 className="text-uppercase text-primary mb-3 fw-bold">
                  <i className="bi bi-telephone me-2"></i>Coordonnées
                </h6>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <p className="mb-0 text-muted small">Email</p>
                      <p className="fw-semibold">{facture.client?.email || "N/A"}</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <p className="mb-0 text-muted small">Téléphone</p>
                      <p className="fw-semibold">{facture.client?.telephone || "N/A"}</p>
                    </div>
                  </Col>
                </Row>
              </Card.Body>

              {/* Services */}
              {facture.lignesServices?.length > 0 && (
                <Card.Body className="border-bottom">
                  <h6 className="text-uppercase text-primary mb-3 fw-bold">
                    <i className="bi bi-list-check me-2"></i>Services
                  </h6>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Description</th>
                          <th className="text-center">Durée (heures)</th>
                          <th className="text-end">Tarif horaire</th>
                          <th className="text-end">Montant</th>
                        </tr>
                      </thead>
                      <tbody>
                        {facture.lignesServices.map((service, index) => (
                          <tr key={index}>
                            <td>{service.service?.description || service.description || "N/A"}</td>
                            <td className="text-center">{service.duree}</td>
                            <td className="text-end">{formatCurrency(service.tarifhoraire)}</td>
                            <td className="text-end fw-semibold">{formatCurrency(service.montant)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card.Body>
              )}

              {/* Produits */}
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
                            <td>{produit.produit?.designation || produit.description || "N/A"}</td>
                            <td className="text-center">{produit.quantite}</td>
                            <td className="text-end">{formatCurrency(produit.prixUnitaire)}</td>
                            <td className="text-end fw-semibold">{formatCurrency(produit.montant)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card.Body>
              )}
            </Card>
          </Col>

          {/* Récapitulatif */}
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
            </Card>

            {/* Actions */}
            <Card className="border-0 shadow-sm rounded-3 mt-4">
              <Card.Body className="d-grid gap-2">
                <Button variant="outline-primary" className="rounded-pill" onClick={() => window.print()}>
                  <i className="bi bi-printer me-2"></i>Imprimer
                </Button>
                <Button variant="primary" className="rounded-pill" onClick={() => navigate(`/FactureVenteEdit/${facture.id}`)}>
                  <i className="bi bi-pencil me-2"></i>Modifier la facture
                </Button>
                <Button variant="outline-danger" className="rounded-pill" onClick={() => {
                  if (window.confirm("Confirmer la suppression ?")) {
                    deleteFactureVente(facture.id).then(() => navigate("/FactureVenteList"));
                  }
                }}>
                  <i className="bi bi-trash me-2"></i>Supprimer
                </Button>


                {facture.statut !== "payée" && (
  <Button
    variant="success"
    className="rounded-pill"
    onClick={() => setShowPaymentModal(true)}
  >
    <i className="bi bi-cash-stack me-2"></i>Payer
  </Button>
)}


              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>




      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Paiement de la facture #{facture.numero}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Type de paiement</Form.Label>
        <Form.Select
          value={paymentData.type}
          onChange={(e) => setPaymentData({ ...paymentData, type: e.target.value })}
        >
          <option value="caisse">Caisse</option>
          <option value="compte_bancaire">Compte bancaire</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Montant</Form.Label>
        <Form.Control
          type="number"
          value={paymentData.montant}
          onChange={(e) => setPaymentData({ ...paymentData, montant: e.target.value })}
        />
      </Form.Group>

      {paymentData.type === "compte_bancaire" && (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Banque</Form.Label>
            <Form.Control
              type="text"
              value={paymentData.banque}
              onChange={(e) => setPaymentData({ ...paymentData, banque: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>RIB</Form.Label>
            <Form.Control
              type="text"
              value={paymentData.rib}
              onChange={(e) => setPaymentData({ ...paymentData, rib: e.target.value })}
            />
          </Form.Group>
        </>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Mode de paiement</Form.Label>
        <Form.Select
          value={paymentData.modePaiement}
          onChange={(e) => setPaymentData({ ...paymentData, modePaiement: e.target.value })}
        >
          <option value="espèces">Espèces</option>
          <option value="virement">Virement</option>
        </Form.Select>
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
      Annuler
    </Button>
    <Button
      variant="success"
      disabled={loadingPayment}
      onClick={async () => {
        try {
          setLoadingPayment(true);
          await payerFactureVente({ ...paymentData,solde: paymentData.montant, factureId: facture.id });
          setShowPaymentModal(false);
          await fetchFactureDetails(); // rafraîchir la facture
        } catch (error) {
          console.error("Erreur paiement :", error);
        } finally {
          setLoadingPayment(false);
        }
      }}
    >
      {loadingPayment ? "Paiement..." : "Valider le paiement"}
    </Button>
  </Modal.Footer>
</Modal>

    </div>
  );
};

export default FactureVenteDetails;
