import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllFacturesVente,
  deleteFactureVente,
  updateFactureVente,
} from "../services/factureVenteService";
import { getPersonneMoraleByTiersId } from "../services/personneMoraleService";
import { Button, Badge, Card, Row, Col, Form, InputGroup, Spinner, Alert } from "react-bootstrap";

const FactureList = () => {
  const [factures, setFactures] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });
  const [statutFilter, setStatutFilter] = useState("");
  const [numeroFilter, setNumeroFilter] = useState("");
  const [sortField, setSortField] = useState("dateCreation");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState({});
  const navigate = useNavigate();

  // 💰 Format TND
  const formatCurrency = (value) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "TND",
    }).format(value || 0);

  // 🏷 Badge statut
  const getStatusBadge = (statut) => {
    const variantMap = {
      Brouillon: "secondary",
      "En attente": "warning",
      Payée: "success",
      "Partiellement payée": "info",
      "En retard": "danger",
    };
    return <Badge bg={variantMap[statut] || "dark"} className="px-3 py-2">{statut}</Badge>;
  };

  // Calculate statistics
  const calculateStats = () => {
    const totalFactures = factures.length;
    const totalValue = factures.reduce((sum, f) => sum + (Number(f.totalTTC) || 0), 0);
    const paidCount = factures.filter(f => f.statut === "payée").length;
    const pendingCount = factures.filter(f => f.statut === "En attente").length;
    const draftCount = factures.filter(f => f.statut === "Brouillon").length;
    const overdueCount = factures.filter(f => f.statut === "En retard").length;
    
    return {
      totalFactures,
      totalValue,
      paidCount,
      pendingCount,
      draftCount,
      overdueCount
    };
  };

  const stats = calculateStats();

  // 📄 Navigation vers détail
  const handleViewDetails = (factureId) => {
    navigate(`/FactureVente/${factureId}`);
  };

  // ❌ Supprimer facture
  const handleDelete = async (id) => {
    if (window.confirm("Confirmer la suppression ?")) {
      await deleteFactureVente(id);
      fetchData(pagination.page);
    }
  };

  // ✅ Changer statut
  const handleUpdateStatus = async (id, newStatus) => {
    await updateFactureVente(id, { statut: newStatus });
    fetchData(pagination.page);
  };

  // 👤 Récupérer info client
  const fetchClientInfo = async (tiersId) => {
    if (!tiersId || clients[tiersId]) return;
    try {
      const clientData = await getPersonneMoraleByTiersId(tiersId);
      setClients((prev) => ({ ...prev, [tiersId]: clientData }));
    } catch (error) {
      console.error("Erreur récupération client:", error);
      setClients((prev) => ({
        ...prev,
        [tiersId]: { raisonSociale: "Client non trouvé" },
      }));
    }
  };

  // 🔄 Récupérer factures avec pagination
  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const data = await getAllFacturesVente(
        statutFilter || null,
        numeroFilter || null,
        page,
        pagination.limit
      );

      // Si API retourne { data: [...], pagination: {...} }
      let facturesData = data.data || [];
      
      // Apply search filter
      if (searchTerm) {
        facturesData = facturesData.filter(f => 
          f.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getClientName(f).toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply sorting
      facturesData.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        if (sortField === "dateCreation" || sortField === "dateLivraison") {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        
        if (sortOrder === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      setFactures(facturesData);

      setPagination({
        page: data.pagination?.page || 1,
        pages:
          data.pagination?.pages ||
          Math.ceil(
            (data.pagination?.total || facturesData.length) /
              (data.pagination?.limit || pagination.limit)
          ),
        total: data.pagination?.total || facturesData.length,
        limit: data.pagination?.limit || pagination.limit,
      });

      // Récupérer clients
      facturesData.forEach((f) => {
        if (f.clientId) fetchClientInfo(f.clientId);
      });
    } catch (error) {
      console.error("Erreur chargement :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line
  }, [statutFilter, numeroFilter, searchTerm, sortField, sortOrder]);

  const getClientName = (facture) => {
    if (!facture.clientId) return "N/A";
    const client = clients[facture.clientId];
    if (client) return client.raisonSociale || "N/A";
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
            <i className="bi bi-receipt me-2"></i>
            Gestion des Factures de Vente
      </h2>
          <p className="text-muted mb-0">Gérez et suivez toutes vos factures de vente en un seul endroit</p>
        </div>
        <Button
          variant="success"
          size="lg"
          className="rounded-pill px-4 py-2 shadow-sm"
          onClick={() => navigate("/FactureVenteForm")}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nouvelle Facture
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                  <i className="bi bi-receipt text-primary fs-4"></i>
                </div>
                <div>
                  <h3 className="fw-bold text-primary mb-0">{stats.totalFactures}</h3>
                  <small className="text-muted">Total Factures</small>
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
                  <h3 className="fw-bold text-success mb-0">{stats.paidCount}</h3>
                  <small className="text-muted">Payées</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100 ">
            <Card.Body className="text-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                  <i className="bi bi-clock text-warning fs-4"></i>
                </div>
                <div>
                  <h3 className="fw-bold text-warning mb-0">{stats.pendingCount}</h3>
                  <small className="text-muted">En Attente</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
       
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100 ">
            <Card.Body className="text-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                  <i className="bi bi-currency-exchange text-info fs-4"></i>
                </div>
                <div>
                  <h3 className="fw-bold text-info mb-0">{formatCurrency(stats.totalValue)}</h3>
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
            <Col md={2}>
              <Form.Label className="fw-semibold text-muted">Statut</Form.Label>
              <Form.Select
                value={statutFilter}
                onChange={(e) => setStatutFilter(e.target.value)}
                className="border-0 shadow-sm"
              >
                <option value="">Tous les statuts</option>
                <option value="Brouillon">Brouillon</option>
                <option value="En attente">En attente</option>
                <option value="Payée">Payée</option>
                <option value="Partiellement payée">Partiellement payée</option>
                <option value="En retard">En retard</option>
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
            <Col md={2}>
              <Form.Label className="fw-semibold text-muted">Trier par</Form.Label>
              <Form.Select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="border-0 shadow-sm"
              >
                <option value="dateCreation">Date de création</option>
                <option value="dateLivraison">Date de livraison</option>
                <option value="numero">Numéro</option>
                <option value="totalTTC">Montant TTC</option>
                <option value="statut">Statut</option>
              </Form.Select>
            </Col>
            <Col md={2}>
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
            <Col md={3}>
              <Form.Label className="fw-semibold text-muted">Numéro Facture</Form.Label>
              <Form.Control
                type="text"
                placeholder="Filtrer par numéro..."
                value={numeroFilter}
                onChange={(e) => setNumeroFilter(e.target.value)}
                className="shadow-sm"
              />
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
              Liste des Factures
            </h5>
            <Badge bg="light" className="text-dark px-3 py-2">
              {factures.length} résultat{factures.length > 1 ? 's' : ''}
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
                    <th className="border-0 fw-semibold text-muted py-3">
                      <i className="bi bi-truck me-2"></i>Date livraison
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
                  {factures.length > 0 ? (
                    factures.map((f, index) => (
                      <tr key={f.id} className="border-bottom">
                        <td className="py-3 px-4">
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                              <i className="bi bi-receipt text-primary"></i>
                            </div>
                            <div>
                              <div className="fw-bold text-dark">{f.numero}</div>
                              <small className="text-muted">Facture #{f.id}</small>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="d-flex align-items-center">
                            <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                              <i className="bi bi-building text-info"></i>
                            </div>
                            <div>
                              <div className="fw-semibold text-dark">{getClientName(f)}</div>
                              <small className="text-muted">Client</small>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="text-dark fw-semibold">
                          {new Date(f.dateCreation).toLocaleDateString("fr-FR")}
                          </div>
                          <small className="text-muted">
                            {new Date(f.dateCreation).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </small>
                        </td>
                        <td className="py-3">
                          <div className="text-dark fw-semibold">
                          {f.dateLivraison
                            ? new Date(f.dateLivraison).toLocaleDateString("fr-FR")
                            : "N/A"}
                          </div>
                          {f.dateLivraison && (
                            <small className="text-muted">
                              {new Date(f.dateLivraison).toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </small>
                          )}
                        </td>
                        <td className="py-3 text-end">
                          <div className="fw-bold text-success fs-5">
                            {formatCurrency(f.totalTTC)}
                          </div>
                          <small className="text-muted">
                            HT: {formatCurrency(f.totalHT)}
                          </small>
                        </td>
                        <td className="py-3 text-center">
                          {getStatusBadge(f.statut)}
                        </td>
                        <td className="py-3 text-end">
                          <div className="fw-bold text-primary fs-5">
                            {formatCurrency(f.netAPayer)}
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <div className="btn-group" role="group">
                            <Button
                              variant="outline-info"
                              size="sm"
                              className="rounded-pill me-1"
                              onClick={() => handleViewDetails(f.id)}
                              title="Voir les détails"
                            >
                              <i className="bi bi-eye"></i>
                            </Button>
                            {f.statut === "Brouillon" && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="rounded-pill me-1"
                                onClick={() => handleUpdateStatus(f.id, "En attente")}
                                title="Valider la facture"
                              >
                                <i className="bi bi-check-circle"></i>
                              </Button>
                            )}
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="rounded-pill"
                              onClick={() => handleDelete(f.id)}
                              title="Supprimer la facture"
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-5">
                        <div className="d-flex flex-column align-items-center">
                          <div className="bg-light rounded-circle p-4 mb-3">
                            <i className="bi bi-receipt text-muted" style={{ fontSize: "3rem" }}></i>
                          </div>
                          <h5 className="text-muted mb-2">Aucune facture trouvée</h5>
                          <p className="text-muted mb-3">
                            {searchTerm || statutFilter 
                              ? "Aucune facture ne correspond à vos critères de recherche."
                              : "Commencez par créer votre première facture."
                            }
                          </p>
                          {!searchTerm && !statutFilter && (
                            <Button
                              variant="primary"
                              className="rounded-pill"
                              onClick={() => navigate("/FactureVenteForm")}
                            >
                              <i className="bi bi-plus-circle me-2"></i>
                              Créer une facture
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
                  Affichage de <strong>{startItem}</strong> à <strong>{endItem}</strong> sur <strong>{pagination.total}</strong> factures
                </span>
              </div>
              <nav aria-label="Pagination des factures">
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

export default FactureList;
