// src/components/ProduitList.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProduits, deleteProduit, searchProduits } from "../services/produitService";
import { Modal, Button, Card, Row, Col, Form, InputGroup, Badge, Spinner, Alert } from "react-bootstrap";

const ProduitList = () => {
  const [produits, setProduits] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 5 });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("nom");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Fetch produits avec recherche et pagination
  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      let data;
      if (searchTerm && searchTerm.trim() !== "") {
        data = await searchProduits(searchTerm, page, pagination.limit);
      } else {
        data = await getAllProduits(page, pagination.limit);
      }

      setProduits(data.data || []);
      setPagination({
        page: data.pagination?.page || 1,
        pages: data.pagination?.pages || 1,
        total: data.pagination?.total || 0,
        limit: data.pagination?.limit || 5,
      });
    } catch (error) {
      console.error("Erreur lors du chargement :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [searchTerm, sortField, sortOrder]);

  const calculateStats = () => {
    const totalProduits = produits.length;
    const avecDescriptionCount = produits.filter(p => p.description && p.description.trim() !== "").length;
    const avecTvaCount = produits.filter(p => p.tva && p.tva.taux).length;
    const prixMoyen = produits.length > 0 ? produits.reduce((sum, p) => sum + (parseFloat(p.prixHT) || 0), 0) / produits.length : 0;
    const prixMin = produits.length > 0 ? Math.min(...produits.map(p => parseFloat(p.prixHT) || 0)) : 0;
    const prixMax = produits.length > 0 ? Math.max(...produits.map(p => parseFloat(p.prixHT) || 0)) : 0;
    
    return {
      totalProduits,
      avecDescriptionCount,
      avecTvaCount,
      prixMoyen,
      prixMin,
      prixMax
    };
  };

  const stats = calculateStats();

  const getFilteredAndSortedProduits = () => {
    let filtered = [...produits];
    
    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle nested properties
      if (sortField === "tva") {
        aValue = a.tva?.taux || 0;
        bValue = b.tva?.taux || 0;
      }
      
      // Handle numeric fields
      if (sortField === "prixHT") {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }
      
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  };

  const filteredProduits = getFilteredAndSortedProduits();

  // Supprimer un produit
  const handleDelete = async (id) => {
    if (window.confirm("❌ Supprimer ce produit ?")) {
      await deleteProduit(id);
      fetchData(pagination.page);
    }
  };

  // Recherche
  const handleSearch = (e) => { e.preventDefault(); fetchData(1); };

  // Pagination
  const handlePrevious = () => { if (pagination.page > 1) fetchData(pagination.page - 1); };
  const handleNext = () => { if (pagination.page < pagination.pages) fetchData(pagination.page + 1); };

  const startItem = (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  const handleShowModal = (produit) => { setSelectedProduit(produit); setShowModal(true); };

  const resetFilters = () => {
    setSearchTerm("");
    setSortField("nom");
    setSortOrder("asc");
  };

  return (
    <div className="content">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-2">
            <i className="bi bi-box me-2"></i>
            Gestion des Produits
          </h2>
          <p className="text-muted mb-0">Gérez et suivez tous vos produits</p>
        </div>
        <Button
          variant="success"
          size="lg"
          className="rounded-pill px-4 py-2 shadow-sm"
          onClick={() => navigate("/ProduitForm")}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nouveau Produit
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center p-3">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: "3rem", height: "3rem" }}>
                <i className="bi bi-box text-primary fs-4"></i>
              </div>
              <h4 className="fw-bold text-primary mb-1">{stats.totalProduits}</h4>
              <small className="text-muted">Total Produits</small>
            </Card.Body>
          </Card>
        </Col>
     
        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center p-3">
              <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: "3rem", height: "3rem" }}>
                <i className="bi bi-graph-up text-warning fs-4"></i>
              </div>
              <h4 className="fw-bold text-warning mb-1">{stats.prixMoyen.toFixed(2)}</h4>
              <small className="text-muted">Prix Moyen (DT)</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center p-3">
              <div className="bg-secondary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: "3rem", height: "3rem" }}>
                <i className="bi bi-arrow-down text-secondary fs-4"></i>
              </div>
              <h4 className="fw-bold text-secondary mb-1">{stats.prixMin.toFixed(2)}</h4>
              <small className="text-muted">Prix Min (DT)</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center p-3">
              <div className="bg-dark bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: "3rem", height: "3rem" }}>
                <i className="bi bi-arrow-up text-dark fs-4"></i>
              </div>
              <h4 className="fw-bold text-dark mb-1">{stats.prixMax.toFixed(2)}</h4>
              <small className="text-muted">Prix Max (DT)</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters and Search Section */}
      <Card className="border-0 shadow-sm mb-4" style={{ maxWidth: "100%" }}>
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Label className="fw-semibold text-muted">Recherche</Form.Label>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Nom, description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0 shadow-sm"
                  />
                  <Button variant="primary" type="submit" className="border-start-0">
                    <i className="bi bi-search"></i>
                  </Button>
                </InputGroup>
              </Form>
            </Col>
            <Col md={3}>
              <Form.Label className="fw-semibold text-muted">Trier par</Form.Label>
              <Form.Select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="shadow-sm"
              >
                <option value="nom">Nom</option>
                <option value="prixHT">Prix HT</option>
                <option value="tva">TVA</option>
                <option value="description">Description</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label className="fw-semibold text-muted">Ordre</Form.Label>
              <Form.Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="shadow-sm"
              >
                <option value="asc">Croissant</option>
                <option value="desc">Décroissant</option>
              </Form.Select>
            </Col>
            <Col md={1}>
              <Form.Label className="fw-semibold text-muted">Actions</Form.Label>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={resetFilters}
                className="w-100 shadow-sm"
                title="Réinitialiser les filtres"
              >
                <i className="bi bi-arrow-clockwise"></i>
              </Button>
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
              Liste des Produits
            </h5>
            <Badge bg="light" className="text-dark px-3 py-2">
              {filteredProduits.length} résultat{filteredProduits.length > 1 ? 's' : ''}
            </Badge>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          {loading && (
            <div className="d-flex flex-column justify-content-center align-items-center py-5">
              <Spinner animation="border" variant="primary" style={{ width: "3rem", height: "3rem" }} />
              <p className="mt-3 text-muted fs-5">Chargement des données...</p>
            </div>
          )}

          {!loading && (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="border-0 fw-semibold text-muted py-3 px-4">
                      <i className="bi bi-box me-2"></i>Nom
                    </th>
                    <th className="border-0 fw-semibold text-muted py-3 px-4">
                      <i className="bi bi-currency-dollar me-2"></i>Prix HT
                    </th>
                    <th className="border-0 fw-semibold text-muted py-3 px-4">
                      <i className="bi bi-percent me-2"></i>TVA
                    </th>
                    <th className="border-0 fw-semibold text-muted py-3 px-4">
                      <i className="bi bi-file-text me-2"></i>Description
                    </th>
                    <th className="border-0 fw-semibold text-muted py-3 px-4 text-center">
                      <i className="bi bi-gear me-2"></i>Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProduits.length > 0 ? (
                    filteredProduits.map((p) => (
                      <tr key={p.id} className="border-bottom">
                        <td className="py-3 px-4">
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: "2.5rem", height: "2.5rem" }}>
                              <i className="bi bi-box text-primary"></i>
                            </div>
                            <div>
                              <div className="fw-semibold text-dark">{p.nom}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="fw-semibold text-success">
                            {new Intl.NumberFormat("fr-FR", {
                              style: "currency",
                              currency: "TND"
                            }).format(parseFloat(p.prixHT) || 0)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {p.tva?.taux ? (
                            <Badge bg="info" className="px-3 py-2">
                              {p.tva.taux}%
                            </Badge>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {p.description ? (
                            <div className="text-truncate" style={{ maxWidth: "200px" }} title={p.description}>
                              {p.description}
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="d-flex gap-2 justify-content-center">
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => handleShowModal(p)}
                              className="rounded-pill"
                              title="Voir les détails"
                            >
                              <i className="bi bi-eye"></i>
                            </Button>
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => navigate(`/ProduitForm/${p.id}`)}
                              className="rounded-pill"
                              title="Modifier"
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(p.id)}
                              className="rounded-pill"
                              title="Supprimer"
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-5">
                        <div className="d-flex flex-column align-items-center">
                          <i className="bi bi-box text-muted" style={{ fontSize: "4rem" }}></i>
                          <h5 className="text-muted mt-3">Aucun produit trouvé</h5>
                          <p className="text-muted mb-4">
                            {searchTerm
                              ? "Aucun produit ne correspond à vos critères de recherche."
                              : "Commencez par ajouter votre premier produit."}
                          </p>
                          <Button
                            variant="success"
                            onClick={() => navigate("/ProduitForm")}
                            className="rounded-pill px-4"
                          >
                            <i className="bi bi-plus-circle me-2"></i>
                            Ajouter un produit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>

        {/* Enhanced Pagination */}
        {pagination.pages > 1 && (
          <Card.Footer className="bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
              <div className="d-flex align-items-center mb-2 mb-md-0">
                <i className="bi bi-info-circle text-muted me-2"></i>
                <small className="text-muted">
                  Affichage de <strong>{startItem}</strong> à <strong>{endItem}</strong> sur <strong>{pagination.total}</strong> produits
                </small>
              </div>
              <nav>
                <ul className="pagination mb-0">
                  <li className={`page-item ${pagination.page === 1 ? "disabled" : ""}`}>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="page-link border-0"
                      onClick={handlePrevious}
                      disabled={pagination.page === 1}
                    >
                      <i className="bi bi-chevron-left me-1"></i>
                      Précédent
                    </Button>
                  </li>
                  
                  {Array.from({ length: pagination.pages }, (_, i) => (
                    <li key={i} className={`page-item ${pagination.page === i + 1 ? "active" : ""}`}>
                      <Button
                        variant={pagination.page === i + 1 ? "primary" : "outline-primary"}
                        size="sm"
                        className="page-link border-0"
                        onClick={() => fetchData(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    </li>
                  ))}
                  
                  <li className={`page-item ${pagination.page === pagination.pages ? "disabled" : ""}`}>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="page-link border-0"
                      onClick={handleNext}
                      disabled={pagination.page === pagination.pages}
                    >
                      Suivant
                      <i className="bi bi-chevron-right ms-1"></i>
                    </Button>
                  </li>
                </ul>
              </nav>
            </div>
          </Card.Footer>
        )}
      </Card>

      {/* Enhanced Modal Détail */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header className="bg-primary bg-opacity-10 border-0">
          <Modal.Title className="fw-semibold text-primary">
            <i className="bi bi-box me-2"></i>
            Détails du Produit
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedProduit && (
            <Row className="g-4">
              <Col md={12}>
                <div className="d-flex align-items-center mb-4 p-3 bg-light rounded-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                    <i className="bi bi-box text-primary" style={{ fontSize: "2rem" }}></i>
                  </div>
                  <div className="flex-grow-1">
                    <h4 className="fw-bold text-dark mb-1">{selectedProduit.nom}</h4>
                    <Badge bg="primary" className="px-3 py-2">
                      Produit #{selectedProduit.id}
                    </Badge>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="border rounded-3 p-3 h-100">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-currency-dollar text-success me-2"></i>
                    <small className="text-muted fw-semibold">Prix HT</small>
                  </div>
                  <div className="fw-bold text-success fs-5">
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "TND"
                    }).format(parseFloat(selectedProduit.prixHT) || 0)}
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="border rounded-3 p-3 h-100">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-percent text-info me-2"></i>
                    <small className="text-muted fw-semibold">TVA</small>
                  </div>
                  <div className="fw-bold">
                    {selectedProduit.tva?.taux ? (
                      <Badge bg="info" className="px-3 py-2 fs-6">
                        {selectedProduit.tva.taux}%
                      </Badge>
                    ) : (
                      <span className="text-muted">Non définie</span>
                    )}
                  </div>
                </div>
              </Col>
              {selectedProduit.description && (
                <Col md={12}>
                  <div className="border rounded-3 p-3">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-file-text text-warning me-2"></i>
                      <small className="text-muted fw-semibold">Description</small>
                    </div>
                    <div className="fw-semibold">
                      {selectedProduit.description}
                    </div>
                  </div>
                </Col>
              )}
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            variant="outline-secondary"
            className="rounded-pill px-4"
            onClick={() => setShowModal(false)}
          >
            <i className="bi bi-x-circle me-2"></i>
            Fermer
          </Button>
          <Button
            variant="warning"
            className="rounded-pill px-4"
            onClick={() => {
              setShowModal(false);
              navigate(`/ProduitForm/${selectedProduit?.id}`);
            }}
          >
            <i className="bi bi-pencil me-2"></i>
            Modifier
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProduitList;
