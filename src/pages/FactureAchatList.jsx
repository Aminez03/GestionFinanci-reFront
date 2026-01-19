import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllFacturesAchat, deleteFactureAchat, validateFactureAchat } from "../services/factureAchatService";
import { Badge, Button, Card, Row, Col, Form, InputGroup, Spinner, Alert } from "react-bootstrap";
import { getPersonneMoraleByTiersId } from "../services/personneMoraleService";

const FactureAchatList = () => {
  const [factures, setFactures] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [statutFilter, setStatutFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [fournisseurs, setFournisseurs] = useState({});
    const [numeroFilter, setNumeroFilter] = useState("");
  const [sortField, setSortField] = useState("dateCreation");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  



  const navigate = useNavigate();

  const formatCurrency = (value) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "TND" }).format(value || 0);

  const getStatusBadge = (statut) => {
    const variantMap = {
      Brouillon: "secondary",
      "En attente": "warning",
      Payée: "success",
      "Partiellement payée": "info",
      Annulée: "danger",
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
    const cancelledCount = factures.filter(f => f.statut === "Annulée").length;
    
    return {
      totalFactures,
      totalValue,
      paidCount,
      pendingCount,
      draftCount,
      cancelledCount
    };
  };

  const stats = calculateStats();

  // 👤 Récupérer info client
  const fetchFournisseurInfo = async (tiersId) => {
    if (!tiersId || fournisseurs[tiersId]) return;
    try {
      const clientData = await getPersonneMoraleByTiersId(tiersId);
      setFournisseurs((prev) => ({ ...prev, [tiersId]: clientData }));
    } catch (error) {
      console.error("Erreur récupération client:", error);
      setFournisseurs((prev) => ({
        ...prev,
        [tiersId]: { raisonSociale: "Client non trouvé" },
      }));
    }
  };

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const data = await getAllFacturesAchat(statutFilter || null, numeroFilter || null, page, pagination.limit);
      let facturesData = data.data || [];
      
      // Apply search filter
      if (searchTerm) {
        facturesData = facturesData.filter(f => 
          f.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getFournisseurName(f).toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply sorting
      facturesData.sort((a, b) => {
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

      setFactures(facturesData);

      setPagination({
        page: data.pagination?.page || 1,
        pages: data.pagination?.pages || Math.ceil((data.pagination?.total || facturesData.length) / (data.pagination?.limit || pagination.limit)),
        total: data.pagination?.total || facturesData.length,
        limit: data.pagination?.limit || pagination.limit,
      });

      // Récupérer fournisseurs si nécessaire
      facturesData.forEach(f => f.fournisseurId && fetchFournisseurInfo(f.fournisseurId));
    } catch (error) {
      console.error("Erreur chargement factures achat:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Confirmer la suppression ?")) {
      await deleteFactureAchat(id);
      fetchData(pagination.page);
    }
  };

  const handleValidate = async (id) => {
    await validateFactureAchat(id);
    fetchData(pagination.page);
  };

    // 📄 Navigation vers détail
  const handleViewDetails = (factureId) => {
    navigate(`/FactureAchat/${factureId}`);
  };


  const getFournisseurName = (facture) => {
    if (!facture.fournisseurId) return "N/A";
    const fournisseur = fournisseurs[facture.fournisseurId];
    if (fournisseur) return fournisseur.raisonSociale || "N/A";
    return "Chargement...";
  };


  useEffect(() => {
    fetchData(1);
  }, [statutFilter, numeroFilter, searchTerm, sortField, sortOrder]);

  const startItem = (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="content">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-2">
            <i className="bi bi-cart-check me-2"></i>
            Gestion des Factures d'Achat
          </h2>
          <p className="text-muted mb-0">Gérez et suivez toutes vos factures d'achat en un seul endroit</p>
        </div>
        <Button
          variant="success"
          size="lg"
          className="rounded-pill px-4 py-2 shadow-sm"
          onClick={() => navigate("/FactureAchatForm")}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nouvelle Facture
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={2} className="mb-3">
          <Card className="border-0 shadow-sm h-100" >
            <Card.Body className="text-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                  <i className="bi bi-cart-check text-primary fs-4"></i>
                </div>
                <div>
                  <h3 className="fw-bold text-primary mb-0">{stats.totalFactures}</h3>
                  <small className="text-muted">Total Factures</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} className="mb-3">
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
        <Col md={2} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
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
        <Col md={2} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="bg-danger bg-opacity-10 rounded-circle p-3 me-3">
                  <i className="bi bi-x-circle text-danger fs-4"></i>
                </div>
                <div>
                  <h3 className="fw-bold text-danger mb-0">{stats.cancelledCount}</h3>
                  <small className="text-muted">Annulées</small>
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
                <option value="Annulée">Annulée</option>
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
                  placeholder="Numéro ou fournisseur..."
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
              Liste des Factures d'Achat
            </h5>
            <Badge bg="light" className="text-dark px-3 py-2">
              {factures.length} résultat{factures.length > 1 ? 's' : ''}
            </Badge>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
        {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" style={{width:"3rem", height:"3rem"}} />
              <p className="mt-3 text-muted fs-5">Chargement des factures d'achat...</p>
          </div>
        ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="border-0 fw-semibold text-muted py-3 px-4">
                      <i className="bi bi-hash me-2"></i>Numéro
                    </th>
                    <th className="border-0 fw-semibold text-muted py-3 px-4">
                      <i className="bi bi-building me-2"></i>Fournisseur
                    </th>
                    <th className="border-0 fw-semibold text-muted py-3 px-4">
                      <i className="bi bi-calendar me-2"></i>Date Création
                    </th>
                    <th className="border-0 fw-semibold text-muted py-3 px-4 text-end">
                      <i className="bi bi-currency-exchange me-2"></i>Total HT
                    </th>
                    <th className="border-0 fw-semibold text-muted py-3 px-4 text-end">
                      <i className="bi bi-percent me-2"></i>TVA
                    </th>
                    <th className="border-0 fw-semibold text-muted py-3 px-4 text-end">
                      <i className="bi bi-stamp me-2"></i>Timbre
                    </th>
                    <th className="border-0 fw-semibold text-muted py-3 px-4 text-end">
                      <i className="bi bi-calculator me-2"></i>Total TTC
                    </th>
                    <th className="border-0 fw-semibold text-muted py-3 px-4 text-center">
                      <i className="bi bi-flag me-2"></i>Statut
                    </th>
                    <th className="border-0 fw-semibold text-muted py-3 px-4 text-end">
                      <i className="bi bi-wallet me-2"></i>Net à Payer
                    </th>
                    <th className="border-0 fw-semibold text-muted py-3 px-4 text-center">
                      <i className="bi bi-gear me-2"></i>Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {factures.length > 0 ? factures.map(f => (
                    <tr key={f.id} className="border-bottom">
                      <td className="py-3 px-4">
                        <div className="fw-bold text-primary">{f.numero}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                            <i className="bi bi-building text-primary"></i>
                          </div>
                          <div>
                            <div className="fw-semibold">{getFournisseurName(f)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-muted">
                          {new Date(f.dateCreation).toLocaleDateString("fr-FR")}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-end">
                        <div className="fw-semibold text-dark">{formatCurrency(f.totalHT)}</div>
                      </td>
                      <td className="py-3 px-4 text-end">
                        <div className="text-info">{formatCurrency(f.totalTVA)}</div>
                      </td>
                      <td className="py-3 px-4 text-end">
                        <div className="text-warning">{formatCurrency(f.timbre)}</div>
                      </td>
                      <td className="py-3 px-4 text-end">
                        <div className="fw-bold text-success fs-5">{formatCurrency(f.totalTTC)}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(f.statut)}
                      </td>
                      <td className="py-3 px-4 text-end">
                        <div className="fw-bold text-primary fs-5">{formatCurrency(f.netAPayer)}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="d-flex gap-1 justify-content-center">
                          {f.statut === "Brouillon" && (
                            <Button
                              variant="success"
                              size="sm"
                              className="rounded-pill"
                              onClick={() => handleValidate(f.id)}
                              title="Valider la facture"
                            >
                              <i className="bi bi-check-circle"></i>
                            </Button>
                          )}
                          <Button
                            variant="info"
                            size="sm"
                            className="rounded-pill"
                              onClick={() => handleViewDetails(f.id)}
                            title="Voir les détails"
                            >
                              <i className="bi bi-eye"></i>
                          </Button>
                          <Button
                            variant="danger"
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
                  )) : (
                    <tr>
                      <td colSpan="10" className="text-center py-5">
                        <div className="bg-light rounded-circle p-4 d-inline-block mb-3">
                          <i className="bi bi-cart-x text-muted" style={{ fontSize: "3rem" }}></i>
                        </div>
                        <h5 className="text-muted mb-2">Aucune facture d'achat trouvée</h5>
                        <p className="text-muted mb-3">
                          {searchTerm || statutFilter || numeroFilter 
                            ? "Aucune facture ne correspond à vos critères de recherche"
                            : "Commencez par créer votre première facture d'achat"
                          }
                        </p>
                        <Button
                          variant="primary"
                          className="rounded-pill"
                          onClick={() => navigate("/FactureAchatForm")}
                        >
                          <i className="bi bi-plus-circle me-2"></i>
                          Créer une facture
                        </Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
          </div>
        )}
        </Card.Body>

        {pagination.pages > 1 && (
          <Card.Footer className="bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
              <div className="d-flex align-items-center mb-2 mb-md-0">
                <i className="bi bi-info-circle text-muted me-2"></i>
                <small className="text-muted">
                  Affichage de <strong>{startItem}</strong> à <strong>{endItem}</strong> sur <strong>{pagination.total}</strong> factures
                </small>
              </div>
              <nav>
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
                  
                  {/* Show page numbers with ellipsis for large page counts */}
                  {pagination.pages <= 7 ? (
                    // Show all pages if 7 or fewer
                    [...Array(pagination.pages)].map((_, index) => (
                    <li key={index} className={`page-item ${pagination.page === index + 1 ? "active" : ""}`}>
                        <Button
                          variant={pagination.page === index + 1 ? "primary" : "outline-primary"}
                          size="sm"
                          className="page-link border-0 rounded-pill mx-1"
                          onClick={() => fetchData(index + 1)}
                        >
                          {index + 1}
                        </Button>
                      </li>
                    ))
                  ) : (
                    // Show pages with ellipsis for large page counts
                    <>
                      {/* First page */}
                      <li className={`page-item ${pagination.page === 1 ? "active" : ""}`}>
                        <Button
                          variant={pagination.page === 1 ? "primary" : "outline-primary"}
                          size="sm"
                          className="page-link border-0 rounded-pill mx-1"
                          onClick={() => fetchData(1)}
                        >
                          1
                        </Button>
                      </li>
                      
                      {/* Ellipsis or pages around current */}
                      {pagination.page > 3 && (
                        <li className="page-item disabled">
                          <span className="page-link border-0 mx-1">...</span>
                        </li>
                      )}
                      
                      {/* Pages around current page */}
                      {pagination.page > 2 && pagination.page < pagination.pages - 1 && (
                        <li className="page-item active">
                          <Button
                            variant="primary"
                            size="sm"
                            className="page-link border-0 rounded-pill mx-1"
                            onClick={() => fetchData(pagination.page)}
                          >
                            {pagination.page}
                          </Button>
                        </li>
                      )}
                      
                      {pagination.page < pagination.pages - 2 && (
                        <li className="page-item disabled">
                          <span className="page-link border-0 mx-1">...</span>
                        </li>
                      )}
                      
                      {/* Last page */}
                      <li className={`page-item ${pagination.page === pagination.pages ? "active" : ""}`}>
                        <Button
                          variant={pagination.page === pagination.pages ? "primary" : "outline-primary"}
                          size="sm"
                          className="page-link border-0 rounded-pill mx-1"
                          onClick={() => fetchData(pagination.pages)}
                        >
                          {pagination.pages}
                        </Button>
                      </li>
                    </>
                  )}
                  
                  <li className={`page-item ${pagination.page === pagination.pages ? "disabled" : ""}`}>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="page-link border-0 rounded-pill ms-1"
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

export default FactureAchatList;
