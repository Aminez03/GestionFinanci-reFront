import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllDevis,
  deleteDevis,
  validateDevis,
  convertToFacture
} from "../services/devisService";
import { getPersonneMoraleByTiersId } from "../services/personneMoraleService";
import { Button, Badge, Card, Row, Col, Form, InputGroup, Spinner, Alert } from "react-bootstrap";

const DevisList = () => {
  const [devis, setDevis] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [statutFilter, setStatutFilter] = useState("");
  const [numeroFilter, setNumeroFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState({});
  const [sortField, setSortField] = useState("dateCreation");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const formatCurrency = (value) => {
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
    return <Badge bg={variantMap[statut] || "dark"} className="px-3 py-2">{statut}</Badge>;
  };

  // Calculate statistics
  const calculateStats = () => {
    const totalDevis = devis.length;
    const totalValue = devis.reduce((sum, d) => sum + (Number(d.totalTTC) || 0), 0);
    const validatedCount = devis.filter(d => d.statut === "Validé").length;
    const convertedCount = devis.filter(d => d.statut === "Converti en facture").length;
    
    return {
      totalDevis,
      totalValue,
      validatedCount,
      convertedCount,
      draftCount: totalDevis - validatedCount - convertedCount
    };
  };

  const stats = calculateStats();

  const handleViewDetails = (devisId) => {
    navigate(`/devis/${devisId}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Confirmer la suppression ?")) {
      await deleteDevis(id);
      fetchData(pagination.page);
    }
  };

  const handleValidate = async (id) => {
    await validateDevis(id);
    fetchData(pagination.page);
  };

  const handleConvertToFacture = async (id) => {
    await convertToFacture(id);
    fetchData(pagination.page);
  };

  const fetchClientInfo = async (tiersId) => {
    if (!tiersId || clients[tiersId]) return;
    try {
      const clientData = await getPersonneMoraleByTiersId(tiersId);
      setClients((prev) => ({
        ...prev,
        [tiersId]: clientData,
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération du client:", error);
      setClients((prev) => ({
        ...prev,
        [tiersId]: { raisonSociale: "Client non trouvé" },
      }));
    }
  };

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const data = await getAllDevis(
        statutFilter || null,
        numeroFilter || null,
        page,
        pagination.limit
      );

      let processedData = data.data || [];
      
      // Apply search filter
      if (searchTerm) {
        processedData = processedData.filter(d => 
          d.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getClientName(d).toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply sorting
      processedData.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        if (sortField === "dateCreation") {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        
        if (sortOrder === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      setDevis(processedData);
      setPagination(data.pagination || {
        page: 1,
        pages: 1,
        total: 0,
        limit: 10,
      });

      if (processedData && processedData.length > 0) {
        processedData.forEach((devisItem) => {
          if (devisItem.clientId) {
            fetchClientInfo(devisItem.clientId);
          }
        });
      }
    } catch (error) {
      console.error("Erreur chargement :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [statutFilter, numeroFilter, searchTerm, sortField, sortOrder]);

  const getClientName = (devisItem) => {
    if (!devisItem.clientId) return "N/A";
    const client = clients[devisItem.clientId];
    if (client) {
      return client.raisonSociale || "N/A";
    }
    return "Chargement...";
  };

  const startItem = (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="content">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-2">
            <i className="bi bi-file-earmark-text me-2"></i>
            Gestion des Devis
          </h2>
          <p className="text-muted mb-0">Gérez et suivez tous vos devis en un seul endroit</p>
        </div>
        <Button
          variant="success"
          size="lg"
          className="rounded-pill px-4 py-2 shadow-sm"
          onClick={() => navigate("/DevisForm")}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nouveau Devis
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100" >
            <Card.Body className="text-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                  <i className="bi bi-file-earmark-text text-primary fs-4"></i>
                </div>
                <div>
                  <h3 className="fw-bold text-primary mb-0">{stats.totalDevis}</h3>
                  <small className="text-muted">Total Devis</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                  <i className="bi bi-check-circle text-success fs-4"></i>
                </div>
                <div>
                  <h3 className="fw-bold text-success mb-0">{stats.validatedCount}</h3>
                  <small className="text-muted">Validés</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                  <i className="bi bi-file-earmark-check text-info fs-4"></i>
                </div>
                <div>
                  <h3 className="fw-bold text-info mb-0">{stats.convertedCount}</h3>
                  <small className="text-muted">Convertis</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                  <i className="bi bi-currency-exchange text-warning fs-4"></i>
                </div>
                <div>
                  <h3 className="fw-bold text-warning mb-0">{formatCurrency(stats.totalValue)}</h3>
                  <small className="text-muted">Valeur Totale</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters and Search Section */}
      <Card className="border-0 shadow-sm mb-4" style={{ maxWidth: "100%" }}>
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Label className="fw-semibold text-muted">Statut</Form.Label>
              <Form.Select
                value={statutFilter}
                onChange={(e) => setStatutFilter(e.target.value)}
                className="border-0 shadow-sm"
              >
                <option value="">Tous les statuts</option>
                <option value="Brouillon">Brouillon</option>
                <option value="Validé">Validé</option>
                <option value="Converti en facture">Converti en facture</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label className="fw-semibold text-muted">Recherche</Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </InputGroup.Text>
                <Form.Control
                type="text"
                  placeholder="Numéro ou client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0 shadow-sm"
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Label className="fw-semibold text-muted">Trier par</Form.Label>
              <Form.Select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="border-0 shadow-sm"
              >
                <option value="dateCreation">Date de création</option>
                <option value="numero">Numéro</option>
         
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label className="fw-semibold text-muted">Ordre</Form.Label>
              <Form.Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="border-0 shadow-sm"
              >
                <option value="desc">Décroissant</option>
                <option value="asc">Croissant</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Main Table Card */}
      <Card className="border-0 shadow-sm" style={{ maxWidth: "100%" }}>
        <Card.Header className="bg-white border-0 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-semibold text-dark">
              <i className="bi bi-table me-2"></i>
              Liste des Devis
            </h5>
            <Badge bg="light" className="text-dark px-3 py-2">
              {devis.length} résultat{devis.length > 1 ? 's' : ''}
            </Badge>
          </div>
        </Card.Header>

        {loading ? (
          <Card.Body className="text-center py-5">
            <Spinner animation="border" variant="primary" size="lg" />
            <p className="mt-3 text-muted fs-5">Chargement des données...</p>
          </Card.Body>
        ) : (
          <Card.Body className="p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="border-0 fw-semibold text-muted py-3 px-4">
                      <i className="bi bi-hash me-2"></i>Numéro
                    </th>
                    <th className="border-0 fw-semibold text-muted py-3">
                      <i className="bi bi-person me-2"></i>Client
                    </th>
                    <th className="border-0 fw-semibold text-muted py-3">
                      <i className="bi bi-calendar me-2"></i>Date création
                    </th>
                    <th className="border-0 fw-semibold text-muted py-3 text-end">
                      <i className="bi bi-currency-exchange me-2"></i>Total TTC
                    </th>
                    <th className="border-0 fw-semibold text-muted py-3 text-center">
                      <i className="bi bi-tag me-2"></i>Statut
                    </th>
                    <th className="border-0 fw-semibold text-muted py-3 text-end">
                      <i className="bi bi-wallet me-2"></i>Net à Payer
                    </th>
                    <th className="border-0 fw-semibold text-muted py-3 text-center">
                      <i className="bi bi-gear me-2"></i>Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {devis.length > 0 ? (
                    devis.map((d, index) => (
                      <tr key={d.id} className="border-bottom">
                        <td className="py-3 px-4">
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                              <i className="bi bi-file-earmark-text text-primary"></i>
                            </div>
                            <div>
                              <div className="fw-bold text-dark">{d.numero}</div>
                              <small className="text-muted">Devis #{d.id}</small>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="d-flex align-items-center">
                            <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                              <i className="bi bi-building text-info"></i>
                            </div>
                            <div>
                              <div className="fw-semibold text-dark">{getClientName(d)}</div>
                              <small className="text-muted">Client</small>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="text-dark fw-semibold">
                            {new Date(d.dateCreation).toLocaleDateString("fr-FR")}
                          </div>
                          <small className="text-muted">
                            {new Date(d.dateCreation).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </small>
                        </td>
                        <td className="py-3 text-end">
                          <div className="fw-bold text-success fs-5">
                            {formatCurrency(d.totalTTC)}
                          </div>
                          <small className="text-muted">
                            HT: {formatCurrency(d.totalHT)}
                          </small>
                        </td>
                        <td className="py-3 text-center">
                          {getStatusBadge(d.statut)}
                        </td>
                        <td className="py-3 text-end">
                          <div className="fw-bold text-primary fs-5">
                            {formatCurrency(d.netAPayer)}
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <div className="btn-group" role="group">
                            <Button
                              variant="outline-info"
                              size="sm"
                              className="rounded-pill me-1"
                              onClick={() => handleViewDetails(d.id)}
                              title="Voir les détails"
                            >
                              <i className="bi bi-eye"></i>
                            </Button>
                            {d.statut === "Brouillon" && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="rounded-pill me-1"
                              onClick={() => handleValidate(d.id)}
                                title="Valider le devis"
                            >
                              <i className="bi bi-check-circle"></i>
                              </Button>
                            )}
                            {d.statut === "Validé" && (
                              <Button
                                variant="outline-warning"
                                size="sm"
                                className="rounded-pill me-1"
                              onClick={() => handleConvertToFacture(d.id)}
                              title="Convertir en facture"
                            >
                              <i className="bi bi-file-earmark-text"></i>
                              </Button>
                            )}
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="rounded-pill"
                              onClick={() => handleDelete(d.id)}
                              title="Supprimer le devis"
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <div className="d-flex flex-column align-items-center">
                          <div className="bg-light rounded-circle p-4 mb-3">
                            <i className="bi bi-file-earmark-text text-muted" style={{ fontSize: "3rem" }}></i>
                          </div>
                          <h5 className="text-muted mb-2">Aucun devis trouvé</h5>
                          <p className="text-muted mb-3">
                            {searchTerm || statutFilter 
                              ? "Aucun devis ne correspond à vos critères de recherche."
                              : "Commencez par créer votre premier devis."
                            }
                          </p>
                          {!searchTerm && !statutFilter && (
                            <Button
                              variant="primary"
                              className="rounded-pill"
                              onClick={() => navigate("/DevisForm")}
                            >
                              <i className="bi bi-plus-circle me-2"></i>
                              Créer un devis
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card.Body>
        )}

        {/* Enhanced Pagination */}
        {pagination.pages > 1 && (
          <Card.Footer className="bg-light border-0 py-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
              <div className="d-flex align-items-center mb-3 mb-md-0">
                <i className="bi bi-info-circle text-primary me-2"></i>
                <span className="text-muted">
                  Affichage de <strong>{startItem}</strong> à <strong>{endItem}</strong> sur <strong>{pagination.total}</strong> devis
                </span>
              </div>
              <nav aria-label="Pagination des devis">
                <ul className="pagination mb-0">
                  <li className={`page-item ${pagination.page === 1 ? "disabled" : ""}`}>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="page-link border-0 rounded-pill me-1"
                      onClick={() => fetchData(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </Button>
                  </li>
                  
                  {[...Array(pagination.pages)].map((_, index) => {
                    const pageNum = index + 1;
                    const isActive = pagination.page === pageNum;
                    const isNearCurrent = Math.abs(pageNum - pagination.page) <= 2;
                    const isFirstOrLast = pageNum === 1 || pageNum === pagination.pages;
                    
                    if (!isNearCurrent && !isFirstOrLast) {
                      if (pageNum === 2 || pageNum === pagination.pages - 1) {
                        return (
                          <li key={index} className="page-item">
                            <span className="page-link border-0 text-muted">...</span>
                          </li>
                        );
                      }
                      return null;
                    }
                    
                    return (
                      <li key={index} className={`page-item ${isActive ? "active" : ""}`}>
                        <Button
                          variant={isActive ? "primary" : "outline-primary"}
                          size="sm"
                          className="page-link border-0 rounded-pill me-1"
                          onClick={() => fetchData(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      </li>
                    );
                  })}
                  
                  <li className={`page-item ${pagination.page === pagination.pages ? "disabled" : ""}`}>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="page-link border-0 rounded-pill"
                      onClick={() => fetchData(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </Button>
                    </li>
                </ul>
              </nav>
            </div>
          </Card.Footer>
        )}
      </Card>
    </div>
  );
};

export default DevisList;