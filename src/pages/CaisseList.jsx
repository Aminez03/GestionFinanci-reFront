import React, { useEffect, useState } from "react";
import { Table, Button, Card, Spinner, Badge, Modal, Form, Row, Col, InputGroup, Alert } from "react-bootstrap";
import { FaTrash, FaCashRegister, FaPlus, FaEdit } from "react-icons/fa";
import {
  getAllCaisses,
  deleteCaisse,
  createCaisse,
  updateCaisse,
}  from "../services/reglementService";
import { getAllFacturesVente } from "../services/factureVenteService";

const CaisseList = () => {
  const [caisses, setCaisses] = useState([]);
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    montant: "",
    solde: "",
    modePaiement: "especes", // par défaut espèces
    factureId: "",
  });

  // --- Fetch Caisses et Factures ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const caissesData = await getAllCaisses();
      setCaisses(Array.isArray(caissesData) ? caissesData : caissesData.data || []);

      const facturesData = await getAllFacturesVente();
      setFactures(Array.isArray(facturesData) ? facturesData : facturesData.data || []);
    } catch (error) {
      console.error(error);
      setCaisses([]);
      setFactures([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    const totalCaisses = caisses.length;
    const totalAmount = caisses.reduce((sum, c) => sum + (Number(c.reglement?.montant) || 0), 0);
    const totalBalance = caisses.reduce((sum, c) => sum + (Number(c.solde) || 0), 0);
    const especesCount = caisses.filter(c => c.reglement?.modePaiement === "especes").length;
    const virementCount = caisses.filter(c => c.reglement?.modePaiement === "virement").length;
    
    return {
      totalCaisses,
      totalAmount,
      totalBalance,
      especesCount,
      virementCount
    };
  };

  const stats = calculateStats();

  // Filter and sort data
  const getFilteredAndSortedCaisses = () => {
    let filtered = caisses.filter(c => {
      const matchesSearch = !searchTerm || 
        c.reglement?.facture?.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toString().includes(searchTerm);
      
      const matchesMode = !modeFilter || c.reglement?.modePaiement === modeFilter;
      
      return matchesSearch && matchesMode;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      if (sortField === "date") {
        aValue = new Date(a.reglement?.date || 0);
        bValue = new Date(b.reglement?.date || 0);
      } else if (sortField === "montant") {
        aValue = Number(a.reglement?.montant || 0);
        bValue = Number(b.reglement?.montant || 0);
      } else if (sortField === "solde") {
        aValue = Number(a.solde || 0);
        bValue = Number(b.solde || 0);
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

  const filteredCaisses = getFilteredAndSortedCaisses();

  useEffect(() => {
    fetchData();
  }, []);

  // --- Delete ---
  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette caisse ?")) {
      await deleteCaisse(id);
      setCaisses(caisses.filter((c) => c.id !== id));
    }
  };

  // --- Open Modal for Add/Edit ---
  const handleOpenModal = (caisse = null) => {
    if (caisse) {
      setFormData({
        id: caisse.id,
        montant: caisse.reglement?.montant || "",
        solde: caisse.solde || "",
        modePaiement: caisse.reglement?.modePaiement || "especes",
        factureId: caisse.reglement?.factureId || "",
      });
    } else {
      setFormData({
        id: null,
        montant: "",
        solde: "",
        modePaiement: "especes",
        factureId: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  // --- Submit Form ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await updateCaisse(formData.id, formData);
      } else {
        await createCaisse(formData);
      }
      handleCloseModal();
      await fetchData(); // rafraîchit uniquement la liste
    } catch (error) {
      console.error(error);
    }
  };

  if (loading)
    return (
      <div className="d-flex flex-column justify-content-center align-items-center mt-5">
        <Spinner animation="border" variant="primary" style={{width:"3rem", height:"3rem"}} />
        <p className="mt-3 text-muted fs-5">Chargement des caisses...</p>
      </div>
    );

  return (
    <div className="content">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-2">
            <i className="bi bi-cash-coin me-2"></i>
            Gestion de la Caisse
          </h2>
          <p className="text-muted mb-0">Gérez et suivez tous vos règlements de caisse</p>
        </div>
        <Button
          variant="success"
          size="lg"
          className="rounded-pill px-4 py-2 shadow-sm"
          onClick={() => handleOpenModal()}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nouveau Règlement
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                  <i className="bi bi-cash-coin text-primary fs-4"></i>
                </div>
                <div>
                  <h3 className="fw-bold text-primary mb-0">{stats.totalCaisses}</h3>
                  <small className="text-muted">Total Règlements</small>
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
                  <i className="bi bi-currency-exchange text-success fs-4"></i>
                </div>
                <div>
                  <h3 className="fw-bold text-success mb-0">{stats.totalAmount.toFixed(2)} TND</h3>
                  <small className="text-muted">Montant Total</small>
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
                  <i className="bi bi-wallet text-info fs-4"></i>
                </div>
                <div>
                  <h3 className="fw-bold text-info mb-0">{stats.totalBalance.toFixed(2)} TND</h3>
                  <small className="text-muted">Solde Total</small>
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
                  <i className="bi bi-cash text-warning fs-4"></i>
                </div>
                <div>
                  <h3 className="fw-bold text-warning mb-0">{stats.especesCount}</h3>
                  <small className="text-muted">Espèces</small>
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
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="ID ou numéro de facture..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0 shadow-sm"
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Label className="fw-semibold text-muted">Mode de Paiement</Form.Label>
              <Form.Select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="border-0 shadow-sm"
              >
                <option value="">Tous les modes</option>
                <option value="especes">Espèces</option>
                <option value="virement">Virement</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label className="fw-semibold text-muted">Trier par</Form.Label>
              <Form.Select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="border-0 shadow-sm"
              >
                <option value="date">Date</option>
                <option value="montant">Montant</option>
                <option value="solde">Solde</option>
                <option value="id">ID</option>
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
          </Row>
        </Card.Body>
      </Card>

      {/* Main Table Card */}
      <Card className="border-0 shadow-sm" style={{ maxWidth: "100%" }}>
        <Card.Header className="bg-white border-0 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-semibold text-dark">
              <i className="bi bi-table me-2"></i>
              Liste des Règlements
            </h5>
            <Badge bg="light" className="text-dark px-3 py-2">
              {filteredCaisses.length} résultat{filteredCaisses.length > 1 ? 's' : ''}
            </Badge>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table className="table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="border-0 fw-semibold text-muted py-3 px-4">
                    <i className="bi bi-hash me-2"></i>ID
                  </th>
                  <th className="border-0 fw-semibold text-muted py-3 px-4 text-end">
                    <i className="bi bi-currency-exchange me-2"></i>Montant
                  </th>
                  <th className="border-0 fw-semibold text-muted py-3 px-4 text-end">
                    <i className="bi bi-wallet me-2"></i>Solde
                  </th>
                  <th className="border-0 fw-semibold text-muted py-3 px-4 text-center">
                    <i className="bi bi-credit-card me-2"></i>Mode Paiement
                  </th>
                  <th className="border-0 fw-semibold text-muted py-3 px-4">
                    <i className="bi bi-receipt me-2"></i>Facture
                  </th>
                  <th className="border-0 fw-semibold text-muted py-3 px-4">
                    <i className="bi bi-calendar me-2"></i>Date
                  </th>
                  <th className="border-0 fw-semibold text-muted py-3 px-4 text-center">
                    <i className="bi bi-gear me-2"></i>Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCaisses.map((c) => (
                  <tr key={c.id} className="border-bottom">
                    <td className="py-3 px-4">
                      <div className="fw-bold text-primary">#{c.id}</div>
                    </td>
                    <td className="py-3 px-4 text-end">
                      <div className="fw-bold text-success fs-5">
                        {Number(c.reglement?.montant || 0).toFixed(2)} TND
                      </div>
                    </td>
                    <td className="py-3 px-4 text-end">
                      <div className="fw-bold text-info fs-5">
                        {Number(c.solde || 0).toFixed(2)} TND
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge 
                        bg={c.reglement?.modePaiement === "especes" ? "warning" : "info"}
                        className="px-3 py-2"
                      >
                        <i className={`bi ${c.reglement?.modePaiement === "especes" ? "bi-cash" : "bi-bank"} me-1`}></i>
                        {c.reglement?.modePaiement?.toUpperCase() || "-"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                          <i className="bi bi-receipt text-primary"></i>
                        </div>
                        <div>
                          <div className="fw-semibold">{c.reglement?.facture?.numero || "N/A"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-muted">
                        {c.reglement?.date
                          ? new Date(c.reglement.date).toLocaleDateString("fr-FR")
                          : "-"}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="d-flex gap-1 justify-content-center">
                        <Button
                          variant="warning"
                          size="sm"
                          className="rounded-pill"
                          onClick={() => handleOpenModal(c)}
                          title="Modifier le règlement"
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="rounded-pill"
                          onClick={() => handleDelete(c.id)}
                          title="Supprimer le règlement"
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCaisses.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="bg-light rounded-circle p-4 d-inline-block mb-3">
                        <i className="bi bi-cash-coin text-muted" style={{ fontSize: "3rem" }}></i>
                      </div>
                      <h5 className="text-muted mb-2">
                        {searchTerm || modeFilter 
                          ? "Aucun règlement trouvé" 
                          : "Aucun règlement de caisse"
                        }
                      </h5>
                      <p className="text-muted mb-3">
                        {searchTerm || modeFilter 
                          ? "Aucun règlement ne correspond à vos critères de recherche"
                          : "Commencez par ajouter votre premier règlement de caisse"
                        }
                      </p>
                      <Button
                        variant="success"
                        className="rounded-pill"
                        onClick={() => handleOpenModal()}
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Ajouter un règlement
                      </Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Enhanced Modal Form */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header className="bg-primary bg-opacity-10 border-0">
          <Modal.Title className="fw-semibold text-primary">
            <i className="bi bi-cash-coin me-2"></i>
            {formData.id ? "Modifier le Règlement" : "Nouveau Règlement de Caisse"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted">Facture *</Form.Label>
                  <Form.Select
                    value={formData.factureId}
                    onChange={(e) => setFormData({ ...formData, factureId: e.target.value })}
                    required
                    className="shadow-sm"
                  >
                    <option value="">Sélectionner une facture</option>
                    {Array.isArray(factures) &&
                      factures.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.numero} - {Number(f.totalTTC || 0).toFixed(2)} TND
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted">Mode de Paiement *</Form.Label>
                  <Form.Select
                    value={formData.modePaiement}
                    onChange={(e) =>
                      setFormData({ ...formData, modePaiement: e.target.value })
                    }
                    required
                    className="shadow-sm"
                  >
                    <option value="especes">
                      <i className="bi bi-cash me-1"></i>Espèces
                    </option>
                    <option value="virement">
                      <i className="bi bi-bank me-1"></i>Virement
                    </option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted">Montant (TND) *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0">
                      <i className="bi bi-currency-exchange text-muted"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.montant}
                      onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                      required
                      className="border-start-0 shadow-sm"
                      placeholder="0.00"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted">Solde (TND) *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0">
                      <i className="bi bi-wallet text-muted"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.solde}
                      onChange={(e) => setFormData({ ...formData, solde: e.target.value })}
                      required
                      className="border-start-0 shadow-sm"
                      placeholder="0.00"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-3 mt-4">
              <Button
                variant="outline-secondary"
                className="rounded-pill px-4"
                onClick={handleCloseModal}
              >
                <i className="bi bi-x-circle me-2"></i>
                Annuler
              </Button>
              <Button
                variant="success"
                type="submit"
                className="rounded-pill px-4"
              >
                <i className="bi bi-check-circle me-2"></i>
                {formData.id ? "Mettre à jour" : "Créer le règlement"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CaisseList;
