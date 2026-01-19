// src/components/ServiceList.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllServices, deleteService, searchServices } from "../services/serviceService";
import { getAllTva } from "../services/tvaService";
import { Modal, Button, Card, Row, Col, Form, InputGroup, Badge, Spinner, Alert } from "react-bootstrap";

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 5 });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("description");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [tvas, setTvas] = useState([]);
  const navigate = useNavigate();

  // Fetch TVA
  const fetchTvas = async () => {
    const data = await getAllTva();
    setTvas(data || []);
  };

  // Fetch services avec recherche et pagination
  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      let data;
      if (searchTerm && searchTerm.trim() !== "") {
        data = await searchServices(searchTerm, page, pagination.limit);
      } else {
        data = await getAllServices(page, pagination.limit);
      }

      setServices(data.data || []);
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

  useEffect(() => {
    fetchTvas();
    fetchData();
  }, [searchTerm, sortField, sortOrder]);

  const calculateStats = () => {
    const totalServices = services.length;
    const avecTvaCount = services.filter(s => s.tvaId).length;
    const tarifMoyen = services.length > 0 ? services.reduce((sum, s) => sum + (parseFloat(s.tarif) || 0), 0) / services.length : 0;
    const tarifMin = services.length > 0 ? Math.min(...services.map(s => parseFloat(s.tarif) || 0)) : 0;
    const tarifMax = services.length > 0 ? Math.max(...services.map(s => parseFloat(s.tarif) || 0)) : 0;
    const avecDescriptionCount = services.filter(s => s.description && s.description.trim() !== "").length;
    
    return {
      totalServices,
      avecTvaCount,
      tarifMoyen,
      tarifMin,
      tarifMax,
      avecDescriptionCount
    };
  };

  const stats = calculateStats();

  const getFilteredAndSortedServices = () => {
    let filtered = [...services];
    
    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle nested properties
      if (sortField === "tva") {
        aValue = a.tvaId ? getTvaRate(a.tvaId) : "";
        bValue = b.tvaId ? getTvaRate(b.tvaId) : "";
      }
      
      // Handle numeric fields
      if (sortField === "tarif") {
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

  const filteredServices = getFilteredAndSortedServices();

  // Supprimer un service
  const handleDelete = async (id) => {
    if (window.confirm("❌ Supprimer ce service ?")) {
      await deleteService(id);
      fetchData(pagination.page);
    }
  };

  // Recherche
  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(1); // recommencer à la page 1 lors d'une recherche
  };

  // Pagination
  const handlePrevious = () => {
    if (pagination.page > 1) fetchData(pagination.page - 1);
  };
  const handleNext = () => {
    if (pagination.page < pagination.pages) fetchData(pagination.page + 1);
  };

  const startItem = (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  const handleShowModal = (service) => {
    setSelectedService(service);
    setShowModal(true);
  };

  const getTvaRate = (tvaId) => {
    const tva = tvas.find((t) => t.id === tvaId);
    return tva ? tva.taux + "%" : "-";
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSortField("description");
    setSortOrder("asc");
  };

  return (
    <div className="content">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-2">
            <i className="bi bi-tools me-2"></i>
            Gestion des Services
          </h2>
          <p className="text-muted mb-0">Gérez et suivez tous vos services</p>
        </div>
        <Button
          variant="success"
          size="lg"
          className="rounded-pill px-4 py-2 shadow-sm"
          onClick={() => navigate("/ServiceForm")}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nouveau Service
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center p-3">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: "3rem", height: "3rem" }}>
                <i className="bi bi-tools text-primary fs-4"></i>
              </div>
              <h4 className="fw-bold text-primary mb-1">{stats.totalServices}</h4>
              <small className="text-muted">Total Services</small>
            </Card.Body>
          </Card>
        </Col>
  
        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center p-3">
              <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: "3rem", height: "3rem" }}>
                <i className="bi bi-graph-up text-warning fs-4"></i>
              </div>
              <h4 className="fw-bold text-warning mb-1">{stats.tarifMoyen.toFixed(2)}</h4>
              <small className="text-muted">Tarif Moyen (DT)</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center p-3">
              <div className="bg-secondary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: "3rem", height: "3rem" }}>
                <i className="bi bi-arrow-down text-secondary fs-4"></i>
              </div>
              <h4 className="fw-bold text-secondary mb-1">{stats.tarifMin.toFixed(2)}</h4>
              <small className="text-muted">Tarif Min (DT)</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center p-3">
              <div className="bg-dark bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: "3rem", height: "3rem" }}>
                <i className="bi bi-arrow-up text-dark fs-4"></i>
              </div>
              <h4 className="fw-bold text-dark mb-1">{stats.tarifMax.toFixed(2)}</h4>
              <small className="text-muted">Tarif Max (DT)</small>
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
                    placeholder="Description..."
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
                <option value="description">Description</option>
                <option value="tarif">Tarif</option>
                <option value="tva">TVA</option>
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
              Liste des Services
            </h5>
            <Badge bg="light" className="text-dark px-3 py-2">
              {filteredServices.length} résultat{filteredServices.length > 1 ? 's' : ''}
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
                      <i className="bi bi-tools me-2"></i>Description
                    </th>
                    <th className="border-0 fw-semibold text-muted py-3 px-4">
                      <i className="bi bi-currency-dollar me-2"></i>Tarif
                    </th>
                    <th className="border-0 fw-semibold text-muted py-3 px-4">
                      <i className="bi bi-percent me-2"></i>TVA
                    </th>
                    <th className="border-0 fw-semibold text-muted py-3 px-4 text-center">
                      <i className="bi bi-gear me-2"></i>Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.length > 0 ? (
                    filteredServices.map((s) => (
                      <tr key={s.id} className="border-bottom">
                        <td className="py-3 px-4">
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: "2.5rem", height: "2.5rem" }}>
                              <i className="bi bi-tools text-primary"></i>
                            </div>
                            <div>
                              <div className="fw-semibold text-dark">{s.description || "-"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="fw-semibold text-success">
                            {s.tarif ? new Intl.NumberFormat("fr-FR", {
                              style: "currency",
                              currency: "TND"
                            }).format(parseFloat(s.tarif)) : "-"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {s.tvaId ? (
                            <Badge bg="info" className="px-3 py-2">
                              {getTvaRate(s.tvaId)}
                            </Badge>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="d-flex gap-2 justify-content-center">
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => handleShowModal(s)}
                              className="rounded-pill"
                              title="Voir les détails"
                            >
                              <i className="bi bi-eye"></i>
                            </Button>
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => navigate(`/ServiceForm/${s.id}`)}
                              className="rounded-pill"
                              title="Modifier"
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(s.id)}
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
                      <td colSpan="4" className="text-center py-5">
                        <div className="d-flex flex-column align-items-center">
                          <i className="bi bi-tools text-muted" style={{ fontSize: "4rem" }}></i>
                          <h5 className="text-muted mt-3">Aucun service trouvé</h5>
                          <p className="text-muted mb-4">
                            {searchTerm
                              ? "Aucun service ne correspond à vos critères de recherche."
                              : "Commencez par ajouter votre premier service."}
                          </p>
                          <Button
                            variant="success"
                            onClick={() => navigate("/ServiceForm")}
                            className="rounded-pill px-4"
                          >
                            <i className="bi bi-plus-circle me-2"></i>
                            Ajouter un service
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
                  Affichage de <strong>{startItem}</strong> à <strong>{endItem}</strong> sur <strong>{pagination.total}</strong> services
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
            <i className="bi bi-tools me-2"></i>
            Détails du Service
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedService && (
            <Row className="g-4">
              <Col md={12}>
                <div className="d-flex align-items-center mb-4 p-3 bg-light rounded-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                    <i className="bi bi-tools text-primary" style={{ fontSize: "2rem" }}></i>
                  </div>
                  <div className="flex-grow-1">
                    <h4 className="fw-bold text-dark mb-1">{selectedService.description || "Service sans description"}</h4>
                    <Badge bg="primary" className="px-3 py-2">
                      Service #{selectedService.id}
                    </Badge>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="border rounded-3 p-3 h-100">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-currency-dollar text-success me-2"></i>
                    <small className="text-muted fw-semibold">Tarif</small>
                  </div>
                  <div className="fw-bold text-success fs-5">
                    {selectedService.tarif ? new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "TND"
                    }).format(parseFloat(selectedService.tarif)) : "Non défini"}
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
                    {selectedService.tvaId ? (
                      <Badge bg="info" className="px-3 py-2 fs-6">
                        {getTvaRate(selectedService.tvaId)}
                      </Badge>
                    ) : (
                      <span className="text-muted">Non définie</span>
                    )}
                  </div>
                </div>
              </Col>
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
              navigate(`/ServiceForm/${selectedService?.id}`);
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

export default ServiceList;
