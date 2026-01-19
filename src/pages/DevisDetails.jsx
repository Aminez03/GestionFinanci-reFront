import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { convertToFacture, getDevisById, validateDevis } from "../services/devisService";
import { getPersonneMoraleByTiersId } from "../services/personneMoraleService";
import { Button, Card, Row, Col, Badge, Container } from "react-bootstrap";

const DevisDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [devis, setDevis] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  // Définition de la fonction à l’extérieur du useEffect
  const fetchDevisDetails = useCallback(async () => {
    try {
      setLoading(true);
      const devisData = await getDevisById(id);
      setDevis(devisData);

      if (devisData?.clientId) {
        try {
          const clientData = await getPersonneMoraleByTiersId(devisData.clientId);
          setClient(clientData);
        } catch (error) {
          console.error("Erreur lors de la récupération du client:", error);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du devis:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDevisDetails();
  }, [fetchDevisDetails]);
  
  const handleValidate = async (devisId) => {
    try {
      await validateDevis(devisId);
      await fetchDevisDetails(); 
    } catch (error) {
      console.error("Erreur lors de la validation:", error);
    }
  };
 const handleConvertToFacture = async (devisId) => {
  try{
    // Appel à ton API pour convertir le devis en facture
    const factureVente = await convertToFacture(devisId); // retourne la facture créée

    // Redirection vers la page de détails de la facture
    navigate(`/FactureVente/${factureVente.id}`);

    
  } catch (error) {
      console.error("Erreur lors de la convertion en facture:", error);
    }
  };


  const formatCurrency = (value) => {
    if (value == null) return "0,000 TND";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "TND",
    }).format(value);
  };

  const getStatusBadge = (statut) => {
    const variantMap = {
      Brouillon: "secondary",
      Validé: "success",
      "Converti en facture": "info",
    };
    return (
      <Badge bg={variantMap[statut] || "dark"} className="px-3 py-2">
        {statut}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="content d-flex justify-content-center align-items-center min-vh-50">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{width: "3rem", height: "3rem"}} role="status"></div>
          <p className="mt-3 text-muted fs-5">Chargement des détails du devis...</p>
        </div>
      </div>
    );
  }

  if (!devis) {
    return (
      <div className="content d-flex justify-content-center align-items-center min-vh-50">
        <div className="text-center">
          <p className="text-danger fs-5 mb-4">Devis non trouvé</p>
          <Button variant="primary" onClick={() => navigate("/DevisList")}>
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
          <h2 className="fw-bold text-dark mb-1">Détails du Devis</h2>
          <p className="text-muted">Informations complètes sur le devis #{devis.numero}</p>
        </div>
        <Button variant="outline-primary" className="rounded-pill px-4" onClick={() => navigate("/DevisList")}>
          <i className="bi bi-arrow-left me-2"></i>Retour à la liste
        </Button>

      </div>

     
         <div className="form-container">
             <Container  className="py-4 bg-light min-vh-100">

    
      <Row>
        <Col lg-8>

          <Card className="border-0 shadow-sm rounded-3 mb-4" style={{ maxWidth: "95%" }}>
            <Card.Header className="bg-white py-3 border-0 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Devis {devis.numero}</h5>
                <small className="text-muted">Créé le {new Date(devis.dateCreation).toLocaleDateString("fr-FR")}</small>
              </div>
              <div className="d-flex align-items-center">
                <span className="me-3">Statut:</span>
                {getStatusBadge(devis.statut)}
              </div>

                <Button
                              className="btn btn-sm btn-success me-2 rounded-3"
                              onClick={() => handleValidate(devis.id)}
                              title="Valider"
                            >
                              <i className="bi bi-check-circle"></i>
                            </Button>
            </Card.Header>
            
            {/* Informations client */}
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
                    <p className="fw-semibold">{devis.client?.adresse || "N/A"}</p>
                  </div>
                  <div className="mb-3">
                    <p className="mb-0 text-muted small">Projet</p>
                    <p className="fw-semibold">{devis.projet || "N/A"}</p>
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
                    <p className="fw-semibold">{devis.client?.email || "N/A"}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <p className="mb-0 text-muted small">Téléphone</p>
                    <p className="fw-semibold">{devis.client?.telephone || "N/A"}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <p className="mb-0 text-muted small">Validité</p>
                    <p className="fw-semibold">{new Date(devis.validUntil).toLocaleDateString("fr-FR")}</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
            
            {/* Lignes de services */}
            {devis.lignesServices && devis.lignesServices.length > 0 && (
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
                      {devis.lignesServices.map((service, index) => (
                        <tr key={index}>
                          <td>
                            <div>
                              <div className="fw-semibold">{service.service?.description || service.description || "N/A"}</div>
                            </div>
                          </td>
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
            
            {/* Lignes de produits */}
            {devis.lignesProduits && devis.lignesProduits.length > 0 && (
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
                      {devis.lignesProduits.map((produit, index) => (
                        <tr key={index}>
                          <td>
                            <div>
                              <div className="fw-semibold">{produit.produit?.designation || produit.description || "N/A"}</div>
                            </div>
                          </td>
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
        
        <Col lg={4}>
          {/* Récapitulatif */}
          <Card className="border-0 shadow-sm rounded-3 " style={{top: '20px'}}>
            <Card.Header className="bg-white py-3 border-0">
              <h6 className="text-uppercase text-primary mb-0 fw-bold">
                <i className="bi bi-receipt me-2"></i>Récapitulatif
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Total HT:</span>
                <span className="fw-semibold">{formatCurrency(devis.totalHT)}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Total TVA:</span>
                <span className="fw-semibold">{formatCurrency(devis.totalTVA)}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">Timbre:</span>
                <span className="fw-semibold">{formatCurrency(devis.timbre)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-dark fw-bold">Total TTC:</span>
                <span className="text-dark fw-bold fs-5">{formatCurrency(devis.totalTTC)}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-dark fw-bold">Net à payer:</span>
                <span className="text-primary fw-bold fs-5">{formatCurrency(devis.netAPayer)}</span>
              </div>
            </Card.Body>
          </Card>
          
          {/* Actions */}
          <Card className="border-0 shadow-sm rounded-3 mt-4">
            <Card.Body className="d-grid gap-2">
              <Button variant="outline-primary" className="rounded-pill" onClick={() => window.print()}>
                <i className="bi bi-printer me-2"></i>Imprimer
              </Button>
              <Button variant="primary" className="rounded-pill" onClick={() => navigate(`/devis/edit/${devis.id}`)}>
                <i className="bi bi-pencil me-2"></i>Modifier le devis
              </Button>
              {devis.statut === "Validé" && (
                <Button variant="success" className="rounded-pill"  onClick={() => handleConvertToFacture(devis.id)}>
                  <i className="bi bi-file-earmark-text me-2"></i>Convertir en facture

                     
                
                </Button>








              )}
              <Button variant="outline-danger" className="rounded-pill">
                <i className="bi bi-trash me-2"></i>Supprimer
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>  
         </div>
      
    </div>
   
  );
};

export default DevisDetails;