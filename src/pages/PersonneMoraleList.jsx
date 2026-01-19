// src/components/PersonneMoraleList.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllPersonnesMorales,
  deletePersonneMorale,
  searchPersonnesMorales,
} from "../services/personneMoraleService";
import { Modal, Button, Card, Row, Col, Form, InputGroup, Badge, Spinner, Alert } from "react-bootstrap";

const PersonneMoraleList = () => {
  const [personnes, setPersonnes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 5 });
  const [searchTerm, setSearchTerm] = useState("");
  const [natureFilter, setNatureFilter] = useState("");
  const [sortField, setSortField] = useState("raisonSociale");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const data = searchTerm
        ? await searchPersonnesMorales(searchTerm, page)
        : await getAllPersonnesMorales(page);
      setPersonnes(data.data || []);
      setPagination({
        page: data.pagination?.page || 1,
        pages: data.pagination?.pages || 1,
        total: data.pagination?.total || 0,
        limit: data.pagination?.limit || 5,
      });
    } catch (error) {
      console.error("Erreur chargement :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [searchTerm, natureFilter, sortField, sortOrder]);

  const calculateStats = () => {
    const totalPersonnes = personnes.length;
    const clientsCount = personnes.filter(p => p.nature === "ClientPro").length;
    const fournisseursCount = personnes.filter(p => p.nature === "Fournisseur").length;
    const avecEmailCount = personnes.filter(p => p.tiers?.email).length;
    const avecTelephoneCount = personnes.filter(p => p.tiers?.telephone).length;
    const avecSiteWebCount = personnes.filter(p => p.siteweb).length;
    
    return {
      totalPersonnes,
      clientsCount,
      fournisseursCount,
      avecEmailCount,
      avecTelephoneCount,
      avecSiteWebCount
    };
  };

  const stats = calculateStats();

  const getFilteredAndSortedPersonnes = () => {
    let filtered = [...personnes];
    
    // Filter by nature
    if (natureFilter) {
      filtered = filtered.filter(p => p.nature === natureFilter);
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle nested properties
      if (sortField === "email" || sortField === "telephone") {
        aValue = a.tiers?.[sortField] || "";
        bValue = b.tiers?.[sortField] || "";
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

  const filteredPersonnes = getFilteredAndSortedPersonnes();

  const handleDelete = async (id) => {
    if (window.confirm("❌ Voulez-vous supprimer cette entreprise ?")) {
      await deletePersonneMorale(id);
      fetchData(pagination.page);
    }
  };

  const handleSearch = (e) => { e.preventDefault(); fetchData(1); };
  const handlePrevious = () => { if (pagination.page > 1) fetchData(pagination.page - 1); };
  const handleNext = () => { if (pagination.page < pagination.pages) fetchData(pagination.page + 1); };

  const startItem = (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  const handleShowModal = (person) => {
    setSelectedPerson(person);
    setShowModal(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setNatureFilter("");
    setSortField("raisonSociale");
    setSortOrder("asc");
  };

  return (
    <div className="content">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-2">
            <i className="bi bi-building me-2"></i>
            Gestion des Personnes Morales
          </h2>
          <p className="text-muted mb-0">Gérez et suivez toutes vos entreprises</p>
        </div>
        <Button
          variant="success"
          size="lg"
          className="rounded-pill px-4 py-2 shadow-sm"
          onClick={() => navigate("/PersonneMoraleForm")}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nouvelle Entreprise
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center p-3">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: "3rem", height: "3rem" }}>
                <i className="bi bi-building text-primary fs-4"></i>
              </div>
              <h4 className="fw-bold text-primary mb-1">{stats.totalPersonnes}</h4>
              <small className="text-muted">Total Entreprises</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center p-3">
              <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: "3rem", height: "3rem" }}>
                <i className="bi bi-people text-success fs-4"></i>
              </div>
              <h4 className="fw-bold text-success mb-1">{stats.clientsCount}</h4>
              <small className="text-muted">Clients</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center p-3">
              <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: "3rem", height: "3rem" }}>
                <i className="bi bi-truck text-info fs-4"></i>
              </div>
              <h4 className="fw-bold text-info mb-1">{stats.fournisseursCount}</h4>
              <small className="text-muted">Fournisseurs</small>
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
                    placeholder="Raison sociale, matricule..."
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
            <Col md={2}>
              <Form.Label className="fw-semibold text-muted">Nature</Form.Label>
              <Form.Select
                value={natureFilter}
                onChange={(e) => setNatureFilter(e.target.value)}
                className="shadow-sm"
              >
                <option value="">Toutes</option>
                <option value="ClientPro">Client</option>
                <option value="Fournisseur">Fournisseur</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label className="fw-semibold text-muted">Trier par</Form.Label>
              <Form.Select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="shadow-sm"
              >
                <option value="raisonSociale">Raison Sociale</option>
                <option value="matriculeFiscale">Matricule Fiscal</option>
                <option value="nature">Nature</option>
                <option value="email">Email</option>
                <option value="telephone">Téléphone</option>
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
              Liste des Personnes Morales
            </h5>
            <Badge bg="light" className="text-dark px-3 py-2">
              {filteredPersonnes.length} résultat{filteredPersonnes.length > 1 ? 's' : ''}
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
                      <i className="bi bi-building me-2"></i>Raison Sociale
                    </th>
                    <th className="border-0 fw-semibold text-muted py-3 px-4">
                      <i className="bi bi-card-text me-2"></i>Matricule
                    </th>
                    <th className="border-0 fw-semibold text-muted py-3 px-4">
                      <i className="bi bi-tag me-2"></i>Nature
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
                  {filteredPersonnes.length > 0 ? (
                    filteredPersonnes.map((p) => (
                      <tr key={p.id} className="border-bottom">
                        <td className="py-3 px-4">
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: "2.5rem", height: "2.5rem" }}>
                              <i className="bi bi-building text-primary"></i>
                            </div>
                            <div>
                              <div className="fw-semibold text-dark">{p.raisonSociale}</div>
                              {p.siteweb && (
                                <small className="text-muted">
                                  <i className="bi bi-globe me-1"></i>
                                  <a href={p.siteweb} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                    Site web
                                  </a>
                                </small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-monospace">{p.matriculeFiscale}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge bg={p.nature === "ClientPro" ? "success" : "info"} className="px-3 py-2">
                            {p.nature}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {p.tiers?.email ? (
                            <div className="d-flex align-items-center">
                              <i className="bi bi-envelope text-success me-2"></i>
                              <a href={`mailto:${p.tiers.email}`} className="text-success text-decoration-none">
                                {p.tiers.email}
                              </a>
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {p.tiers?.telephone ? (
                            <div className="d-flex align-items-center">
                              <i className="bi bi-telephone text-primary me-2"></i>
                              <a href={`tel:${p.tiers.telephone}`} className="text-primary text-decoration-none">
                                {p.tiers.telephone}
                              </a>
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
                              onClick={() => navigate(`/PersonneMoraleForm/${p.id}`)}
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
                      <td colSpan="6" className="text-center py-5">
                        <div className="d-flex flex-column align-items-center">
                          <i className="bi bi-building text-muted" style={{ fontSize: "4rem" }}></i>
                          <h5 className="text-muted mt-3">Aucune entreprise trouvée</h5>
                          <p className="text-muted mb-4">
                            {searchTerm || natureFilter
                              ? "Aucune entreprise ne correspond à vos critères de recherche."
                              : "Commencez par ajouter votre première entreprise."}
                          </p>
                          <Button
                            variant="success"
                            onClick={() => navigate("/PersonneMoraleForm")}
                            className="rounded-pill px-4"
                          >
                            <i className="bi bi-plus-circle me-2"></i>
                            Ajouter une entreprise
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
                            Affichage de <strong>{startItem}</strong> à <strong>{endItem}</strong> sur <strong>{pagination.total}</strong> personnes
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
                                <i className="bi bi-chevron-left me-1"></i> Précédent
                              </Button>
                            </li>
                            
                            {/* Smart page numbers with ellipses */}
                            {(() => {
                              const pages = [];
                              const totalPages = pagination.pages;
                              const currentPage = pagination.page;
                              
                              if (totalPages <= 7) {
                                // Show all pages if 7 or fewer
                                for (let i = 1; i <= totalPages; i++) {
                                  pages.push(
                                    <li key={i} className={`page-item ${currentPage === i ? "active" : ""}`}>
                                      <Button
                                        variant={currentPage === i ? "primary" : "outline-primary"}
                                        size="sm"
                                        className="page-link border-0"
                                        onClick={() => fetchData(i)}
                                      >
                                        {i}
                                      </Button>
                                    </li>
                                  );
                                }
                              } else {
                                // Smart pagination with ellipses
                                if (currentPage <= 4) {
                                  // Show first 5 pages, ellipsis, last page
                                  for (let i = 1; i <= 5; i++) {
                                    pages.push(
                                      <li key={i} className={`page-item ${currentPage === i ? "active" : ""}`}>
                                        <Button
                                          variant={currentPage === i ? "primary" : "outline-primary"}
                                          size="sm"
                                          className="page-link border-0"
                                          onClick={() => fetchData(i)}
                                        >
                                          {i}
                                        </Button>
                                      </li>
                                    );
                                  }
                                  pages.push(
                                    <li key="ellipsis1" className="page-item disabled">
                                      <span className="page-link border-0">...</span>
                                    </li>
                                  );
                                  pages.push(
                                    <li key={totalPages} className={`page-item ${currentPage === totalPages ? "active" : ""}`}>
                                      <Button
                                        variant={currentPage === totalPages ? "primary" : "outline-primary"}
                                        size="sm"
                                        className="page-link border-0"
                                        onClick={() => fetchData(totalPages)}
                                      >
                                        {totalPages}
                                      </Button>
                                    </li>
                                  );
                                } else if (currentPage >= totalPages - 3) {
                                  // Show first page, ellipsis, last 5 pages
                                  pages.push(
                                    <li key={1} className={`page-item ${currentPage === 1 ? "active" : ""}`}>
                                      <Button
                                        variant={currentPage === 1 ? "primary" : "outline-primary"}
                                        size="sm"
                                        className="page-link border-0"
                                        onClick={() => fetchData(1)}
                                      >
                                        1
                                      </Button>
                                    </li>
                                  );
                                  pages.push(
                                    <li key="ellipsis1" className="page-item disabled">
                                      <span className="page-link border-0">...</span>
                                    </li>
                                  );
                                  for (let i = totalPages - 4; i <= totalPages; i++) {
                                    pages.push(
                                      <li key={i} className={`page-item ${currentPage === i ? "active" : ""}`}>
                                        <Button
                                          variant={currentPage === i ? "primary" : "outline-primary"}
                                          size="sm"
                                          className="page-link border-0"
                                          onClick={() => fetchData(i)}
                                        >
                                          {i}
                                        </Button>
                                      </li>
                                    );
                                  }
                                } else {
                                  // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
                                  pages.push(
                                    <li key={1} className={`page-item ${currentPage === 1 ? "active" : ""}`}>
                                      <Button
                                        variant={currentPage === 1 ? "primary" : "outline-primary"}
                                        size="sm"
                                        className="page-link border-0"
                                        onClick={() => fetchData(1)}
                                      >
                                        1
                                      </Button>
                                    </li>
                                  );
                                  pages.push(
                                    <li key="ellipsis1" className="page-item disabled">
                                      <span className="page-link border-0">...</span>
                                    </li>
                                  );
                                  for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                                    pages.push(
                                      <li key={i} className={`page-item ${currentPage === i ? "active" : ""}`}>
                                        <Button
                                          variant={currentPage === i ? "primary" : "outline-primary"}
                                          size="sm"
                                          className="page-link border-0"
                                          onClick={() => fetchData(i)}
                                        >
                                          {i}
                                        </Button>
                                      </li>
                                    );
                                  }
                                  pages.push(
                                    <li key="ellipsis2" className="page-item disabled">
                                      <span className="page-link border-0">...</span>
                                    </li>
                                  );
                                  pages.push(
                                    <li key={totalPages} className={`page-item ${currentPage === totalPages ? "active" : ""}`}>
                                      <Button
                                        variant={currentPage === totalPages ? "primary" : "outline-primary"}
                                        size="sm"
                                        className="page-link border-0"
                                        onClick={() => fetchData(totalPages)}
                                      >
                                        {totalPages}
                                      </Button>
                                    </li>
                                  );
                                }
                              }
                              
                              return pages;
                            })()}
                            
                            <li className={`page-item ${pagination.page === pagination.pages ? "disabled" : ""}`}>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="page-link border-0"
                                onClick={handleNext}
                                disabled={pagination.page === pagination.pages}
                              >
                                Suivant <i className="bi bi-chevron-right ms-1"></i>
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
            <i className="bi bi-building me-2"></i>
            Détails de {selectedPerson?.raisonSociale}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedPerson && (
            <Row className="g-4">
              <Col md={12}>
                <div className="d-flex align-items-center mb-4 p-3 bg-light rounded-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                    <i className="bi bi-building text-primary" style={{ fontSize: "2rem" }}></i>
                  </div>
                  <div className="flex-grow-1">
                    <h4 className="fw-bold text-dark mb-1">{selectedPerson.raisonSociale}</h4>
                    <Badge bg={selectedPerson.nature === "ClientPro" ? "success" : "info"} className="px-3 py-2">
                      {selectedPerson.nature}
                    </Badge>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="border rounded-3 p-3 h-100">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-card-text text-primary me-2"></i>
                    <small className="text-muted fw-semibold">Matricule Fiscal</small>
                  </div>
                  <div className="fw-bold font-monospace">
                    {selectedPerson.matriculeFiscale}
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
                    {selectedPerson.nature}
                  </div>
                </div>
              </Col>
              {selectedPerson.siteweb && (
                <Col md={12}>
                  <div className="border rounded-3 p-3">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-globe text-success me-2"></i>
                      <small className="text-muted fw-semibold">Site Web</small>
                    </div>
                    <div className="fw-semibold">
                      <a href={selectedPerson.siteweb} target="_blank" rel="noopener noreferrer" className="text-success text-decoration-none">
                        {selectedPerson.siteweb}
                      </a>
                    </div>
                  </div>
                </Col>
              )}
              {selectedPerson.tiers && (
                <>
                  <Col md={6}>
                    <div className="border rounded-3 p-3 h-100">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-envelope text-success me-2"></i>
                        <small className="text-muted fw-semibold">Email</small>
                      </div>
                      <div className="fw-semibold">
                        {selectedPerson.tiers.email ? (
                          <a href={`mailto:${selectedPerson.tiers.email}`} className="text-success text-decoration-none">
                            {selectedPerson.tiers.email}
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
                        {selectedPerson.tiers.telephone ? (
                          <a href={`tel:${selectedPerson.tiers.telephone}`} className="text-primary text-decoration-none">
                            {selectedPerson.tiers.telephone}
                          </a>
                        ) : (
                          <span className="text-muted">Non renseigné</span>
                        )}
                      </div>
                    </div>
                  </Col>
                  {selectedPerson.tiers.adresse && (
                    <Col md={12}>
                      <div className="border rounded-3 p-3">
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-geo-alt text-info me-2"></i>
                          <small className="text-muted fw-semibold">Adresse</small>
                        </div>
                        <div className="fw-semibold">
                          {selectedPerson.tiers.adresse}
                        </div>
                      </div>
                    </Col>
                  )}
                </>
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
              navigate(`/PersonneMoraleForm/${selectedPerson?.id}`);
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

export default PersonneMoraleList;
