import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Button, Row, Col, Card, InputGroup, Table, Badge, Modal, Alert, Spinner, Container } from "react-bootstrap";
import { 
  FaFileInvoiceDollar, FaBuilding, FaUser, FaEnvelope, 
  FaPhone, FaCalendar, FaPlus, FaTrash, FaArrowLeft, 
  FaSave, FaSearch, FaMoneyBill, FaStamp, FaExclamationTriangle
} from "react-icons/fa";
import { createFactureVente, updateFactureVente, getFactureVenteById } from "../services/factureVenteService";
import { getAllTiers } from "../services/tiersService";
import { getAllProduits } from "../services/produitService";
import { getAllServices } from "../services/serviceService";

const FactureVenteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // --- Formulaire et lignes ---
  const [formData, setFormData] = useState({
    clientId: "",
    projet: "",
    dateLivraison: new Date().toISOString().split("T")[0],
    statut: "Brouillon",
    timbre: 0.6,
    client: { raisonSociale: "", email: "", telephone: "", adresse: "", matriculeFiscale: "" }
  });
  const [lignesServices, setLignesServices] = useState([]);
  const [lignesProduits, setLignesProduits] = useState([]);

  // --- Données backend ---
  const [services, setServices] = useState([]);
  const [produits, setProduits] = useState([]);
  const [clients, setClients] = useState([]);

  const [filteredServices, setFilteredServices] = useState([]);
  const [filteredProduits, setFilteredProduits] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);

  const [searchServiceTerm, setSearchServiceTerm] = useState("");
  const [searchProduitTerm, setSearchProduitTerm] = useState("");
  const [searchClientTerm, setSearchClientTerm] = useState("");

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showProduitModal, setShowProduitModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);

  // --- Charger données initiales ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [servicesResp, produitsResp, clientsResp] = await Promise.all([
          getAllServices(),
          getAllProduits(),
          getAllTiers()
        ]);

        setServices(Array.isArray(servicesResp?.data) ? servicesResp.data : []);
        setProduits(Array.isArray(produitsResp?.data) ? produitsResp.data : []);
        setClients(Array.isArray(clientsResp?.data) ? clientsResp.data : []);

        setFilteredServices(Array.isArray(servicesResp?.data) ? servicesResp.data : []);
        setFilteredProduits(Array.isArray(produitsResp?.data) ? produitsResp.data : []);
        setFilteredClients(Array.isArray(clientsResp?.data) ? clientsResp.data : []);
      } catch (error) {
        console.error("Erreur chargement données facture :", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    if (id) {
      const fetchFacture = async () => {
        try {
          setLoading(true);
          const factureData = await getFactureVenteById(id);

          setFormData({
            clientId: factureData.clientId,
            projet: factureData.projet || "",
            dateLivraison: factureData.dateLivraison.split("T")[0],
            statut: factureData.statut,
            timbre: factureData.timbre || 0.6,
            client: {
              raisonSociale: factureData.client?.raisonSociale || "",
              email: factureData.client?.email || "",
              telephone: factureData.client?.telephone || "",
              adresse: factureData.client?.adresse || "",
              matriculeFiscale: factureData.client?.matriculeFiscale || ""
            }
          });

          setLignesServices(factureData.lignesServices || []);
          setLignesProduits(factureData.lignesProduits || []);
        } catch (error) {
          console.error("Erreur lors du chargement facture :", error);
        } finally {
          setLoading(false);
        }
      };
      fetchFacture();
    }
  }, [id]);

  // --- Filtrage recherche ---
  useEffect(() => {
    setFilteredServices(
      Array.isArray(services)
        ? services.filter(s => (s.description || "").toLowerCase().includes(searchServiceTerm.toLowerCase()))
        : []
    );
  }, [searchServiceTerm, services]);

  useEffect(() => {
    setFilteredProduits(
      Array.isArray(produits)
        ? produits.filter(p => (p.nom || "").toLowerCase().includes(searchProduitTerm.toLowerCase()))
        : []
    );
  }, [searchProduitTerm, produits]);

  useEffect(() => {
    setFilteredClients(
      Array.isArray(clients)
        ? clients.filter(c => ((c.raisonSociale || c.nom) || "").toLowerCase().includes(searchClientTerm.toLowerCase()))
        : []
    );
  }, [searchClientTerm, clients]);

  // --- Gestion formulaire ---
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleClientSelect = client => {
    setFormData(prev => ({
      ...prev,
      clientId: client.id,
      client: {
        raisonSociale: client.raisonSociale || client.nom || "",
        email: client.email || "",
        telephone: client.telephone || "",
        adresse: client.adresse || "",
        matriculeFiscale: client.matriculeFiscale || ""
      }
    }));
    setShowClientModal(false);
    setSearchClientTerm("");
  };

  const handleServiceSelect = service => {
    const tarif = parseFloat(service.tarif) || 0;
    setLignesServices([...lignesServices, { 
      serviceId: service.id, 
      description: service.description || "", 
      duree: 1, 
      tarifhoraire: tarif, 
      montant: tarif * 1
    }]);
    setShowServiceModal(false);
    setSearchServiceTerm("");
  };

  const handleProduitSelect = produit => {
    const prix = parseFloat(produit.prixHT) || 0;
    setLignesProduits([...lignesProduits, { 
      produitId: produit.id, 
      nom: produit.nom || "", 
      quantite: 1, 
      prixUnitaire: prix, 
      montant: prix * 1
    }]);
    setShowProduitModal(false);
    setSearchProduitTerm("");
  };

  const updateLigneService = (index, field, value) => {
    const updated = [...lignesServices];
    if(field === 'duree' || field === 'tarifhoraire') value = parseFloat(value) || 0;
    updated[index][field] = value;
    updated[index].montant = (parseFloat(updated[index].duree) || 0) * (parseFloat(updated[index].tarifhoraire) || 0);
    setLignesServices(updated);
  };

  const updateLigneProduit = (index, field, value) => {
    const updated = [...lignesProduits];
    if(field === 'quantite' || field === 'prixUnitaire') value = parseFloat(value) || 0;
    updated[index][field] = value;
    updated[index].montant = (parseFloat(updated[index].quantite) || 0) * (parseFloat(updated[index].prixUnitaire) || 0);
    setLignesProduits(updated);
  };

  const removeLigneService = index => setLignesServices(lignesServices.filter((_, i) => i !== index));
  const removeLigneProduit = index => setLignesProduits(lignesProduits.filter((_, i) => i !== index));

  // --- Validation ---
  const validateForm = () => {
    const newErrors = {};
    if (!formData.clientId) newErrors.clientId = "Veuillez sélectionner un client";
    if (!formData.projet) newErrors.projet = "Veuillez saisir un projet";
    if (lignesServices.length === 0 && lignesProduits.length === 0) newErrors.lignes = "Veuillez ajouter au moins un service ou produit";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Soumission ---
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const dataToSend = {
        projet: formData.projet,
        dateLivraison: formData.dateLivraison,
        timbre: parseFloat(formData.timbre),
        statut: formData.statut,
        clientId: parseInt(formData.clientId, 10),
        lignesProduits: lignesProduits.map(l => ({ produitid: l.produitId, quantite: l.quantite, remise: 0 })),
        lignesServices: lignesServices.map(l => ({ serviceid: l.serviceId, duree: l.duree, remise: 0 }))
      };
      if (id) await updateFactureVente(id, dataToSend);
      else await createFactureVente(dataToSend);
      navigate("/FactureVenteList");
    } catch (error) {
      console.error(error);
      setErrors({ submit: error.message || "Erreur lors de l'enregistrement facture" });
    } finally {
      setLoading(false);
    }
  };

  // --- Totaux ---
  const totalHT = (lignesServices.reduce((sum, l) => sum + (l.montant || 0), 0) +
                   lignesProduits.reduce((sum, l) => sum + (l.montant || 0), 0));
  const totalTVA = totalHT * 0.19;
  const totalTTC = totalHT + totalTVA + parseFloat(formData.timbre || 0);
  const netAPayer = totalTTC;

  if (loading && !formData.clientId) return (
    <div className="d-flex justify-content-center align-items-center min-vh-50">
      <div className="text-center">
        <Spinner animation="border" variant="primary" style={{width:"3rem", height:"3rem"}} />
        <p className="mt-3 text-muted fs-5">Chargement des données...</p>
      </div>
    </div>
  );

  return (
    <div className="content">
      {/* Header Section */}
          <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-2">
            <i className="bi bi-receipt me-2"></i>
            {id ? "Modifier la Facture de Vente" : "Créer une Facture de Vente"}
          </h2>
          <p className="text-muted mb-0">
            {id ? "Modifiez les informations de votre facture de vente" : "Remplissez les informations pour créer une nouvelle facture de vente"}
          </p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <Badge bg="light" className="text-dark px-3 py-2 fs-6">
            <i className="bi bi-hash me-1"></i>
            {id ? `Facture #${id}` : "Nouvelle facture"}
          </Badge>
          <Button
            variant="outline-secondary"
            className="rounded-pill"
            onClick={() => navigate("/FactureVenteList")}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Retour à la liste
          </Button>
        </div>
          </div>

      {errors.submit && (
        <Alert variant="danger" className="mb-4 border-0 shadow-sm">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {errors.submit}
        </Alert>
      )}

          <Form onSubmit={handleSubmit}>
        <Row className="g-4">
          {/* Client Information Card */}
          <Col lg={6}>
            <Card className="border-0 shadow-sm h-100" style={{ maxWidth: "100%" }}>
              <Card.Header className="bg-primary bg-opacity-10 border-0">
                <h5 className="mb-0 fw-semibold text-primary">
                  <i className="bi bi-building me-2"></i>
                  Informations Client
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-muted">Client *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0">
                      <i className="bi bi-person text-muted"></i>
                    </InputGroup.Text>
                    <Form.Control 
                      type="text" 
                      value={formData.client.raisonSociale} 
                      placeholder="Sélectionner un client" 
                      readOnly 
                      isInvalid={!!errors.clientId}
                      className="border-start-0 shadow-sm"
                    />
                    <Button 
                      variant="outline-primary" 
                      onClick={()=>setShowClientModal(true)}
                      className="border-start-0"
                    >
                      <i className="bi bi-search"></i>
                    </Button>
                    <Form.Control.Feedback type="invalid">{errors.clientId}</Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                
                {formData.clientId && (
                  <div className="bg-light rounded-3 p-3">
                    <h6 className="text-muted mb-3">Détails du client</h6>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold text-muted small">Email</Form.Label>
                          <InputGroup>
                            <InputGroup.Text className="bg-white border-end-0">
                              <i className="bi bi-envelope text-muted"></i>
                            </InputGroup.Text>
                            <Form.Control 
                              type="email" 
                              value={formData.client.email} 
                              readOnly 
                              className="border-start-0 bg-light"
                            />
                          </InputGroup>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold text-muted small">Téléphone</Form.Label>
                          <InputGroup>
                            <InputGroup.Text className="bg-white border-end-0">
                              <i className="bi bi-telephone text-muted"></i>
                            </InputGroup.Text>
                            <Form.Control 
                              type="text" 
                              value={formData.client.telephone} 
                              readOnly 
                              className="border-start-0 bg-light"
                            />
                          </InputGroup>
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label className="fw-semibold text-muted small">Adresse</Form.Label>
                          <Form.Control 
                            as="textarea" 
                            rows={2} 
                            value={formData.client.adresse} 
                            readOnly 
                            className="bg-light"
                          />
                  </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label className="fw-semibold text-muted small">Matricule Fiscale</Form.Label>
                          <Form.Control 
                            type="text" 
                            value={formData.client.matriculeFiscale} 
                            readOnly 
                            className="bg-light"
                          />
                  </Form.Group>
                      </Col>
                    </Row>
                  </div>
                )}
              </Card.Body>
            </Card>
              </Col>

          {/* Facture Details Card */}
          <Col lg={6}>
            <Card className="border-0 shadow-sm h-100" style={{ maxWidth: "95%" }}>
              <Card.Header className="bg-success bg-opacity-10 border-0">
                <h5 className="mb-0 fw-semibold text-success">
                  <i className="bi bi-receipt me-2"></i>
                  Détails de la Facture
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-muted">Projet *</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="projet" 
                    value={formData.projet} 
                    onChange={handleChange} 
                    isInvalid={!!errors.projet} 
                    required
                    className="shadow-sm"
                    placeholder="Nom du projet..."
                  />
                  <Form.Control.Feedback type="invalid">{errors.projet}</Form.Control.Feedback>
                </Form.Group>
                
                <Row className="g-3 mb-4">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-muted">Date de Livraison</Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-white border-end-0">
                          <i className="bi bi-calendar text-muted"></i>
                        </InputGroup.Text>
                        <Form.Control 
                          type="date" 
                          name="dateLivraison" 
                          value={formData.dateLivraison} 
                          onChange={handleChange} 
                          required
                          className="border-start-0 shadow-sm"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-muted">Statut</Form.Label>
                      <Form.Select 
                        name="statut" 
                        value={formData.statut} 
                        onChange={handleChange}
                        className="shadow-sm"
                      >
                        <option value="Brouillon">Brouillon</option>
                        <option value="Validé">Validé</option>
                        <option value="Payé">Payé</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-muted">Timbre (TND)</Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-white border-end-0">
                          <i className="bi bi-stamp text-muted"></i>
                        </InputGroup.Text>
                        <Form.Control 
                          type="number" 
                          name="timbre" 
                          value={formData.timbre} 
                          onChange={handleChange} 
                          min="0" 
                          step="0.01"
                          className="border-start-0 shadow-sm"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
              </Col>
            </Row>

        {/* Services Section */}
        <Card className="border-0 shadow-sm mb-4" style={{ maxWidth: "95%" }} >
          <Card.Header className="bg-info bg-opacity-10 border-0">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold text-info">
                <i className="bi bi-gear me-2"></i>
                Services
              </h5>
              <Button 
                variant="outline-info" 
                size="sm" 
                onClick={()=>setShowServiceModal(true)}
                className="rounded-pill"
              >
                <i className="bi bi-plus-circle me-1"></i>
                Ajouter Service
              </Button>
              </div>
          </Card.Header>
          <Card.Body className="p-0">
              {lignesServices.length > 0 ? (
              <div className="table-responsive">
                <Table className="table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 fw-semibold text-muted py-3 px-4">
                        <i className="bi bi-list-ul me-2"></i>Description
                      </th>
                      <th className="border-0 fw-semibold text-muted py-3 text-center" style={{width: "120px"}}>
                        <i className="bi bi-clock me-2"></i>Durée (h)
                      </th>
                      <th className="border-0 fw-semibold text-muted py-3 text-end" style={{width: "150px"}}>
                        <i className="bi bi-currency-exchange me-2"></i>Tarif Horaire
                      </th>
                      <th className="border-0 fw-semibold text-muted py-3 text-end" style={{width: "150px"}}>
                        <i className="bi bi-calculator me-2"></i>Montant
                      </th>
                      <th className="border-0 fw-semibold text-muted py-3 text-center" style={{width: "80px"}}>
                        <i className="bi bi-gear me-2"></i>Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lignesServices.map((ligne,index)=>(
                      <tr key={index} className="border-bottom">
                        <td className="py-3 px-4">
                          <Form.Control 
                            type="text" 
                            value={ligne.description} 
                            onChange={e=>updateLigneService(index,'description',e.target.value)}
                            className="border-0 shadow-sm"
                            placeholder="Description du service..."
                          />
                        </td>
                        <td className="py-3 text-center">
                          <Form.Control 
                            type="number" 
                            min="1" 
                            step="1" 
                            value={ligne.duree} 
                            onChange={e=>updateLigneService(index,'duree',parseInt(e.target.value))}
                            className="border-0 shadow-sm text-center"
                          />
                        </td>
                        <td className="py-3 text-end">
                          <InputGroup>
                            <InputGroup.Text className="bg-white border-end-0">
                              <i className="bi bi-currency-exchange text-muted"></i>
                            </InputGroup.Text>
                            <Form.Control 
                              type="number" 
                              min="0" 
                              step="0.01" 
                              value={ligne.tarifhoraire} 
                              onChange={e=>updateLigneService(index,'tarifhoraire',parseFloat(e.target.value))}
                              className="border-start-0 shadow-sm text-end"
                            />
                          </InputGroup>
                        </td>
                        <td className="py-3 text-end">
                          <div className="fw-bold text-info fs-5">
                            {ligne.montant?.toFixed(2)} TND
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={()=>removeLigneService(index)}
                            className="rounded-pill"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-5">
                <div className="bg-light rounded-circle p-4 d-inline-block mb-3">
                  <i className="bi bi-gear text-muted" style={{ fontSize: "2rem" }}></i>
                </div>
                <h6 className="text-muted mb-2">Aucun service ajouté</h6>
                <p className="text-muted mb-3">Commencez par ajouter des services à votre facture</p>
                <Button 
                  variant="outline-info" 
                  onClick={()=>setShowServiceModal(true)}
                  className="rounded-pill"
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Ajouter un service
                </Button>
            </div>
            )}
          </Card.Body>
        </Card>

        {/* Products Section */}
        <Card className="border-0 shadow-sm mb-4" style={{ maxWidth: "95%" }}>
          <Card.Header className="bg-warning bg-opacity-10 border-0">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold text-warning">
                <i className="bi bi-box me-2"></i>
                Produits
              </h5>
              <Button 
                variant="outline-warning" 
                size="sm" 
                onClick={()=>setShowProduitModal(true)}
                className="rounded-pill"
              >
                <i className="bi bi-plus-circle me-1"></i>
                Ajouter Produit
              </Button>
              </div>
          </Card.Header>
          <Card.Body className="p-0">
              {lignesProduits.length > 0 ? (
              <div className="table-responsive">
                <Table className="table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 fw-semibold text-muted py-3 px-4">
                        <i className="bi bi-tag me-2"></i>Désignation
                      </th>
                      <th className="border-0 fw-semibold text-muted py-3 text-center" style={{width: "100px"}}>
                        <i className="bi bi-hash me-2"></i>Quantité
                      </th>
                      <th className="border-0 fw-semibold text-muted py-3 text-end" style={{width: "150px"}}>
                        <i className="bi bi-currency-exchange me-2"></i>Prix Unitaire
                      </th>
                      <th className="border-0 fw-semibold text-muted py-3 text-end" style={{width: "150px"}}>
                        <i className="bi bi-calculator me-2"></i>Montant
                      </th>
                      <th className="border-0 fw-semibold text-muted py-3 text-center" style={{width: "80px"}}>
                        <i className="bi bi-gear me-2"></i>Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lignesProduits.map((ligne,index)=>(
                      <tr key={index} className="border-bottom">
                        <td className="py-3 px-4">
                          <Form.Control 
                            type="text" 
                            value={ligne.nom} 
                            onChange={e=>updateLigneProduit(index,'nom',e.target.value)}
                            className="border-0 shadow-sm"
                            placeholder="Désignation du produit..."
                          />
                        </td>
                        <td className="py-3 text-center">
                          <Form.Control 
                            type="number" 
                            min="1" 
                            step="1" 
                            value={ligne.quantite} 
                            onChange={e=>updateLigneProduit(index,'quantite',parseInt(e.target.value))}
                            className="border-0 shadow-sm text-center"
                          />
                        </td>
                        <td className="py-3 text-end">
                          <InputGroup>
                            <InputGroup.Text className="bg-white border-end-0">
                              <i className="bi bi-currency-exchange text-muted"></i>
                            </InputGroup.Text>
                            <Form.Control 
                              type="number" 
                              min="0" 
                              step="0.01" 
                              value={ligne.prixUnitaire} 
                              onChange={e=>updateLigneProduit(index,'prixUnitaire',parseFloat(e.target.value))}
                              className="border-start-0 shadow-sm text-end"
                            />
                          </InputGroup>
                        </td>
                        <td className="py-3 text-end">
                          <div className="fw-bold text-warning fs-5">
                            {ligne.montant?.toFixed(2)} TND
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={()=>removeLigneProduit(index)}
                            className="rounded-pill"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-5">
                <div className="bg-light rounded-circle p-4 d-inline-block mb-3">
                  <i className="bi bi-box text-muted" style={{ fontSize: "2rem" }}></i>
                </div>
                <h6 className="text-muted mb-2">Aucun produit ajouté</h6>
                <p className="text-muted mb-3">Commencez par ajouter des produits à votre facture</p>
                <Button 
                  variant="outline-warning" 
                  onClick={()=>setShowProduitModal(true)}
                  className="rounded-pill"
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Ajouter un produit
                </Button>
            </div>
            )}
          </Card.Body>
        </Card>

        {/* Totals Summary */}
        <Card className="border-0 shadow-sm mb-4" style={{ maxWidth: "95%" }}>
          <Card.Header className="bg-dark bg-opacity-10 border-0">
            <h5 className="mb-0 fw-semibold text-dark">
              <i className="bi bi-calculator me-2"></i>
              Récapitulatif des Totaux
            </h5>
          </Card.Header>
          <Card.Body className="p-4">
            <Row className="g-3">
              <Col md={3}>
                <div className="text-center p-3 bg-light rounded-3">
                  <div className="text-muted small">Total HT</div>
                  <div className="fw-bold text-primary fs-5">{totalHT.toFixed(2)} TND</div>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center p-3 bg-light rounded-3">
                  <div className="text-muted small">TVA (19%)</div>
                  <div className="fw-bold text-info fs-5">{totalTVA.toFixed(2)} TND</div>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center p-3 bg-light rounded-3">
                  <div className="text-muted small">Timbre</div>
                  <div className="fw-bold text-warning fs-5">{formData.timbre} TND</div>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center p-3 bg-success bg-opacity-10 rounded-3 border border-success">
                  <div className="text-success small fw-semibold">NET À PAYER</div>
                  <div className="fw-bold text-success fs-4">{netAPayer.toFixed(2)} TND</div>
                </div>
              </Col>
              </Row>
          </Card.Body>
            </Card>

        {/* Form Validation Error */}
        {errors.lignes && (
          <Alert variant="warning" className="mb-4 border-0 shadow-sm">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {errors.lignes}
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="d-flex justify-content-between align-items-center">
          <Button
            variant="outline-secondary"
            size="lg"
            className="rounded-pill px-4"
            onClick={() => navigate("/FactureVenteList")}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Annuler
          </Button>
          <Button
            variant="success"
            size="lg"
            type="submit"
            className="rounded-pill px-4"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Enregistrement...
              </>
            ) : (
              <>
                <i className="bi bi-save me-2"></i>
                {id ? "Mettre à jour" : "Créer Facture"}
              </>
            )}
          </Button>
            </div>
          </Form>

      {/* Enhanced Modals */}
      <Modal show={showClientModal} onHide={()=>setShowClientModal(false)} size="lg" centered>
        <Modal.Header className="bg-primary bg-opacity-10 border-0">
          <Modal.Title className="fw-semibold text-primary">
            <i className="bi bi-building me-2"></i>
            Sélectionner un Client
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <InputGroup className="mb-4">
            <InputGroup.Text className="bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </InputGroup.Text>
            <Form.Control 
              type="text" 
              placeholder="Rechercher un client..." 
              value={searchClientTerm} 
              onChange={e=>setSearchClientTerm(e.target.value)}
              className="border-start-0 shadow-sm"
            />
          </InputGroup>
          <div style={{maxHeight:"400px", overflowY:"auto"}} className="border rounded-3">
            {filteredClients.length > 0 ? filteredClients.map(client => (
              <div 
                key={client.id} 
                className="p-3 border-bottom d-flex align-items-center hover-bg-light" 
                style={{cursor:"pointer"}} 
                onClick={()=>handleClientSelect(client)}
              >
                <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                  <i className="bi bi-person text-primary"></i>
                </div>
                <div className="flex-grow-1">
                  <div className="fw-semibold text-dark">{client.raisonSociale || client.nom}</div>
                  <small className="text-muted">{client.email} • {client.telephone}</small>
                </div>
                <i className="bi bi-chevron-right text-muted"></i>
              </div>
            )) : (
              <div className="text-center py-5">
                <i className="bi bi-search text-muted" style={{ fontSize: "3rem" }}></i>
                <h6 className="text-muted mt-3">Aucun client trouvé</h6>
                <p className="text-muted">Essayez avec un autre terme de recherche</p>
              </div>
            )}
          </div>
            </Modal.Body>
          </Modal>

      <Modal show={showServiceModal} onHide={()=>setShowServiceModal(false)} size="lg" centered>
        <Modal.Header className="bg-info bg-opacity-10 border-0">
          <Modal.Title className="fw-semibold text-info">
            <i className="bi bi-gear me-2"></i>
            Sélectionner un Service
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <InputGroup className="mb-4">
            <InputGroup.Text className="bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </InputGroup.Text>
            <Form.Control 
              type="text" 
              placeholder="Rechercher un service..." 
              value={searchServiceTerm} 
              onChange={e=>setSearchServiceTerm(e.target.value)}
              className="border-start-0 shadow-sm"
            />
          </InputGroup>
          <div style={{maxHeight:"400px", overflowY:"auto"}} className="border rounded-3">
            {filteredServices.length > 0 ? filteredServices.map(service => (
              <div 
                key={service.id} 
                className="p-3 border-bottom d-flex align-items-center hover-bg-light" 
                style={{cursor:"pointer"}} 
                onClick={()=>handleServiceSelect(service)}
              >
                <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                  <i className="bi bi-gear text-info"></i>
                </div>
                <div className="flex-grow-1">
                  <div className="fw-semibold text-dark">{service.description}</div>
                  <small className="text-muted">Tarif: {service.tarif} TND/h</small>
                </div>
                <i className="bi bi-chevron-right text-muted"></i>
              </div>
            )) : (
              <div className="text-center py-5">
                <i className="bi bi-search text-muted" style={{ fontSize: "3rem" }}></i>
                <h6 className="text-muted mt-3">Aucun service trouvé</h6>
                <p className="text-muted">Essayez avec un autre terme de recherche</p>
              </div>
            )}
          </div>
            </Modal.Body>
          </Modal>

      <Modal show={showProduitModal} onHide={()=>setShowProduitModal(false)} size="lg" centered>
        <Modal.Header className="bg-warning bg-opacity-10 border-0">
          <Modal.Title className="fw-semibold text-warning">
            <i className="bi bi-box me-2"></i>
            Sélectionner un Produit
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <InputGroup className="mb-4">
            <InputGroup.Text className="bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </InputGroup.Text>
            <Form.Control 
              type="text" 
              placeholder="Rechercher un produit..." 
              value={searchProduitTerm} 
              onChange={e=>setSearchProduitTerm(e.target.value)}
              className="border-start-0 shadow-sm"
            />
          </InputGroup>
          <div style={{maxHeight:"400px", overflowY:"auto"}} className="border rounded-3">
            {filteredProduits.length > 0 ? filteredProduits.map(produit => (
              <div 
                key={produit.id} 
                className="p-3 border-bottom d-flex align-items-center hover-bg-light" 
                style={{cursor:"pointer"}} 
                onClick={()=>handleProduitSelect(produit)}
              >
                <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                  <i className="bi bi-box text-warning"></i>
                </div>
                <div className="flex-grow-1">
                  <div className="fw-semibold text-dark">{produit.nom}</div>
                  <small className="text-muted">Prix: {produit.prixHT} TND</small>
                </div>
                <i className="bi bi-chevron-right text-muted"></i>
              </div>
            )) : (
              <div className="text-center py-5">
                <i className="bi bi-search text-muted" style={{ fontSize: "3rem" }}></i>
                <h6 className="text-muted mt-3">Aucun produit trouvé</h6>
                <p className="text-muted">Essayez avec un autre terme de recherche</p>
              </div>
            )}
          </div>
            </Modal.Body>
          </Modal>
    </div>
  );
};

export default FactureVenteForm;
