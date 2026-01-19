// src/components/PersonnePhysiqueList.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllPersonnesPhysiques,
  deletePersonnePhysique,
  searchPersonnesPhysiques,
} from "../services/personnePhysiqueService";
import { Modal, Button, Card, Row, Col, Form, InputGroup, Badge, Spinner, Alert } from "react-bootstrap";

const PersonnePhysiqueList = () => {
  const [personnes, setPersonnes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 5 });
  const [searchTerm, setSearchTerm] = useState("");
  const [civiliteFilter, setCiviliteFilter] = useState("");
  const [sortField, setSortField] = useState("nom");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null); // Pour modal détail
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Charger les données
  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const data = searchTerm
        ? await searchPersonnesPhysiques(searchTerm, page)
        : await getAllPersonnesPhysiques(page);

      setPersonnes(data.data || []);
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

  // Calculate statistics
  const calculateStats = () => {
    const totalPersonnes = pagination.total;
    const hommesCount = personnes.filter(p => p.civilite === "Monsieur").length;
    const femmesCount = personnes.filter(p => p.civilite === "Madame").length;
    const avecEmailCount = personnes.filter(p => p.email && p.email.trim() !== "").length;
    const avecTelephoneCount = personnes.filter(p => p.telephone && p.telephone.trim() !== "").length;
    const avecAdresseCount = personnes.filter(p => p.adresse && p.adresse.trim() !== "").length;
    
    return {
      totalPersonnes,
      hommesCount,
      femmesCount,
      avecEmailCount,
      avecTelephoneCount,
      avecAdresseCount
    };
  };

  const stats = calculateStats();

  // Filter and sort data
  const getFilteredAndSortedPersonnes = () => {
    let filtered = personnes.filter(p => {
      const matchesCivilite = !civiliteFilter || p.civilite === civiliteFilter;
      return matchesCivilite;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      if (sortField === "nom") {
        aValue = a.nom || "";
        bValue = b.nom || "";
      } else if (sortField === "prenom") {
        aValue = a.prenom || "";
        bValue = b.prenom || "";
      } else if (sortField === "cin") {
        aValue = a.cin || "";
        bValue = b.cin || "";
      } else if (sortField === "email") {
        aValue = a.email || "";
        bValue = b.email || "";
      } else if (sortField === "telephone") {
        aValue = a.telephone || "";
        bValue = b.telephone || "";
      } else {
        aValue = a[sortField] || "";
        bValue = b[sortField] || "";
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

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm("❌ Voulez-vous vraiment supprimer cette personne ?")) {
      await deletePersonnePhysique(id);
      fetchData(pagination.page);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(1);
  };

  const handlePrevious = () => { if (pagination.page > 1) fetchData(pagination.page - 1); };
  const handleNext = () => { if (pagination.page < pagination.pages) fetchData(pagination.page + 1); };

  const startItem = (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  const handleShowModal = (person) => {
    setSelectedPerson(person);
    setShowModal(true);
  };

  return (
    <div className="content">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-2">
            <i className="bi bi-people me-2"></i>
            Gestion des Personnes Physiques
          </h2>
          <p className="text-muted mb-0">Gérez et suivez toutes vos personnes physiques</p>
        </div>
        <Button
          variant="success"
          size="lg"
          className="rounded-pill px-4 py-2 shadow-sm"
          onClick={() => navigate("/PersonnePhysiqueForm")}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nouvelle Personne
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={2} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                  <i className="bi bi-people text-primary fs-4"></i>
                </div>
                <div>
                  <h3 className="fw-bold text-primary mb-0">{stats.totalPersonnes}</h3>
                  <small className="text-muted">Total Personnes</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                  <i className="bi bi-person text-info fs-4"></i>
                </div>
                <div>
                  <h3 className="fw-bold text-info mb-0">{stats.hommesCount}</h3>
                  <small className="text-muted">Hommes</small>
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
                  <i className="bi bi-person-dress text-warning fs-4"></i>
                </div>
                <div>
                  <h3 className="fw-bold text-warning mb-0">{stats.femmesCount}</h3>
                  <small className="text-muted">Femmes</small>
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
            <Col md={4}>
              <Form.Label className="fw-semibold text-muted">Recherche</Form.Label>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Nom, prénom, CIN..."
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
              <Form.Label className="fw-semibold text-muted">Civilité</Form.Label>
              <Form.Select
                value={civiliteFilter}
                onChange={(e) => setCiviliteFilter(e.target.value)}
                className="border-0 shadow-sm"
              >
                <option value="">Toutes les civilités</option>
                <option value="Monsieur">Monsieur</option>
                <option value="Madame">Madame</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label className="fw-semibold text-muted">Trier par</Form.Label>
              <Form.Select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="border-0 shadow-sm"
              >
                <option value="nom">Nom</option>
                <option value="prenom">Prénom</option>
                <option value="cin">CIN</option>
                <option value="email">Email</option>
                <option value="telephone">Téléphone</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label className="fw-semibold text-muted">Ordre</Form.Label>
              <Form.Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="border-0 shadow-sm"
              >
                <option value="asc">Croissant</option>
                <option value="desc">Décroissant</option>
              </Form.Select>
            </Col>
            <Col md={1}>
              <Form.Label className="fw-semibold text-muted">&nbsp;</Form.Label>
              <Button
                variant="outline-secondary"
                className="w-100 border-0 shadow-sm"
                onClick={() => {
                  setSearchTerm("");
                  setCiviliteFilter("");
                  setSortField("nom");
                  setSortOrder("asc");
                }}
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
              Liste des Personnes Physiques
            </h5>
            <Badge bg="light" className="text-dark px-3 py-2">
              {filteredPersonnes.length} résultat{filteredPersonnes.length > 1 ? 's' : ''}
            </Badge>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" style={{width:"3rem", height:"3rem"}} />
              <p className="mt-3 text-muted fs-5">Chargement des données...</p>
            </div>
          )}

          {/* Table */}
          {!loading && (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="border-0 fw-semibold text-muted py-3 px-4">
                      <i className="bi bi-person me-2"></i>Nom
                    </th>
                    <th className="border-0 fw-semibold text-muted py-3 px-4">
                      <i className="bi bi-person me-2"></i>Prénom
                    </th>
                    <th className="border-0 fw-semibold text-muted py-3 px-4">
                      <i className="bi bi-card-text me-2"></i>CIN
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
                            <div className={`bg-${p.civilite === "Monsieur" ? "info" : "warning"} bg-opacity-10 rounded-circle p-2 me-3`}>
                              <i className={`bi ${p.civilite === "Monsieur" ? "bi-person" : "bi-person-dress"} text-${p.civilite === "Monsieur" ? "info" : "warning"}`}></i>
                            </div>
                            <div>
                              <div className="fw-bold text-dark">{p.nom || "N/A"}</div>
                              <small className="text-muted">{p.civilite || ""}</small>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="fw-semibold">{p.prenom || "N/A"}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-monospace text-muted">{p.cin || "N/A"}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="d-flex align-items-center">
                            {p.email ? (
                              <>
                                <i className="bi bi-envelope text-success me-2"></i>
                                <span className="text-success">{p.email}</span>
                              </>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="d-flex align-items-center">
                            {p.telephone ? (
                              <>
                                <i className="bi bi-telephone text-primary me-2"></i>
                                <span className="text-primary">{p.telephone}</span>
                              </>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="d-flex gap-1 justify-content-center">
                            <Button
                              variant="info"
                              size="sm"
                              className="rounded-pill"
                              onClick={() => handleShowModal(p)}
                              title="Voir les détails"
                            >
                              <i className="bi bi-eye"></i>
                            </Button>
                            <Button
                              variant="warning"
                              size="sm"
                              className="rounded-pill"
                              onClick={() => navigate(`/PersonnePhysiqueForm/${p.id}`)}
                              title="Modifier la personne"
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              className="rounded-pill"
                              onClick={() => handleDelete(p.id)}
                              title="Supprimer la personne"
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
                        <div className="bg-light rounded-circle p-4 d-inline-block mb-3">
                          <i className="bi bi-people text-muted" style={{ fontSize: "3rem" }}></i>
                        </div>
                        <h5 className="text-muted mb-2">
                          {searchTerm || civiliteFilter 
                            ? "Aucune personne trouvée" 
                            : "Aucune personne physique"
                          }
                        </h5>
                        <p className="text-muted mb-3">
                          {searchTerm || civiliteFilter 
                            ? "Aucune personne ne correspond à vos critères de recherche"
                            : "Commencez par ajouter votre première personne physique"
                          }
                        </p>
                        <Button
                          variant="success"
                          className="rounded-pill"
                          onClick={() => navigate("/PersonnePhysiqueForm")}
                        >
                          <i className="bi bi-plus-circle me-2"></i>
                          Ajouter une personne
                        </Button>
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
            <i className="bi bi-person me-2"></i>
            Détails de {selectedPerson?.nom} {selectedPerson?.prenom}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedPerson && (
            <Row className="g-4">
              <Col md={6}>
                <div className="d-flex align-items-center mb-3">
                  <div className={`bg-${selectedPerson.civilite === "Monsieur" ? "info" : "warning"} bg-opacity-10 rounded-circle p-3 me-3`}>
                    <i className={`bi ${selectedPerson.civilite === "Monsieur" ? "bi-person" : "bi-person-dress"} text-${selectedPerson.civilite === "Monsieur" ? "info" : "warning"} fs-4`}></i>
                  </div>
                  <div>
                    <h5 className="mb-1 fw-bold">{selectedPerson.nom} {selectedPerson.prenom}</h5>
                    <Badge bg={selectedPerson.civilite === "Monsieur" ? "info" : "warning"} className="px-3 py-2">
                      {selectedPerson.civilite}
                    </Badge>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="text-end">
                  <small className="text-muted">CIN</small>
                  <div className="fw-bold font-monospace fs-5">{selectedPerson.cin}</div>
                </div>
              </Col>
              
              <Col md={6}>
                <div className="border rounded-3 p-3 h-100">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-envelope text-success me-2"></i>
                    <small className="text-muted fw-semibold">Email</small>
                  </div>
                  <div className="fw-semibold">
                    {selectedPerson.email || <span className="text-muted">Non renseigné</span>}
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
                    {selectedPerson.telephone || <span className="text-muted">Non renseigné</span>}
                  </div>
                </div>
              </Col>
              
              <Col md={12}>
                <div className="border rounded-3 p-3">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-geo-alt text-info me-2"></i>
                    <small className="text-muted fw-semibold">Adresse</small>
                  </div>
                  <div className="fw-semibold">
                    {selectedPerson.adresse || <span className="text-muted">Non renseignée</span>}
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
              navigate(`/PersonnePhysiqueForm/${selectedPerson?.id}`);
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

export default PersonnePhysiqueList;
