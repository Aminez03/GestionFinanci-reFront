import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form, Button, Row, Col, Card, Table, Badge,
  Modal, Alert, InputGroup, FormControl
} from "react-bootstrap";
import {
  FaFileInvoice, FaPlus, FaTrash, FaSave,
  FaExclamationTriangle
} from "react-icons/fa";
import { getDevisById, updateDevis } from "../services/devisService";
import { getAllTiers } from "../services/tiersService";
import { getAllProduits } from "../services/produitService";
import { getAllServices } from "../services/serviceService";
import { getPersonneMoraleByTiersId } from "../services/personneMoraleService";

const DevisEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    clientId: "",
    projet: "",
    dateCreation: new Date().toISOString().split("T")[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    statut: "Brouillon",
    timbre: 0.6,
    client: { raisonSociale: "", email: "", telephone: "", adresse: "", matriculeFiscale: "" }
  });

  const [lignesServices, setLignesServices] = useState([]);
  const [lignesProduits, setLignesProduits] = useState([]);

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

  // --- Chargement initial ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [servicesResp, produitsResp, clientsResp] = await Promise.all([
          getAllServices(),
          getAllProduits(),
          getAllTiers()
        ]);

        setServices(servicesResp?.data || []);
        setFilteredServices(servicesResp?.data || []);
        setProduits(produitsResp?.data || []);
        setFilteredProduits(produitsResp?.data || []);
        setClients(clientsResp?.data || []);
        setFilteredClients(clientsResp?.data || []);

       if (id) {
  const devisData = await getDevisById(id);

  // Récupérer les infos du client
  let clientData = {};
  try {
    clientData = await getPersonneMoraleByTiersId(devisData.clientId);
  } catch (error) {
    console.error("Erreur récupération client:", error);
    clientData = { raisonSociale: "Client non trouvé", matriculeFiscale: "" };
  }

  setFormData({
    clientId: devisData.clientId,
    projet: devisData.projet || "",
    dateCreation: devisData.dateCreation?.split("T")[0] || new Date().toISOString().split("T")[0],
    validUntil: devisData.validUntil?.split("T")[0] || "",
    statut: devisData.statut || "Brouillon",
    timbre: Number(devisData.timbre) || 0.6,
    client: {
      raisonSociale: clientData.raisonSociale || devisData.client?.raisonSociale || "",
      email: clientData.email || devisData.client?.email || "",
      telephone: clientData.telephone || devisData.client?.telephone || "",
      adresse: clientData.adresse || devisData.client?.adresse || "",
      matriculeFiscale: clientData.matriculeFiscale || ""
    }
  });


          setLignesServices((devisData.lignesServices || []).map(l => ({
            serviceid: l.serviceid,
            description: l.service.description || "",
            duree: Number(l.duree) || 0,
            tarifhoraire: Number(l.tarifhoraire) || 0,
            montant: Number(l.montant) || 0
          })));
          setLignesProduits((devisData.lignesProduits || []).map(l => ({
            produitId: l.produitId,
            nom: l.produit.nom || "",
            quantite: Number(l.quantite) || 0,
            prixUnitaire: Number(l.prixUnitaire) || 0,
            montant: Number(l.montant) || 0
          })));
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // --- Filtrage recherche ---
  useEffect(() => setFilteredServices(
    services.filter(s => (s.description || "").toLowerCase().includes(searchServiceTerm.toLowerCase()))
  ), [searchServiceTerm, services]);

  useEffect(() => setFilteredProduits(
    produits.filter(p => (p.nom || "").toLowerCase().includes(searchProduitTerm.toLowerCase()))
  ), [searchProduitTerm, produits]);

  useEffect(() => setFilteredClients(
    clients.filter(c => ((c.raisonSociale || c.nom) || "").toLowerCase().includes(searchClientTerm.toLowerCase()))
  ), [searchClientTerm, clients]);

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
    setLignesServices([...lignesServices, {
      serviceid: service.id,
      description: service.description,
      duree: 1,
      tarifhoraire: Number(service.tarif) || 0,
      montant: Number(service.tarif) || 0
    }]);
    setShowServiceModal(false);
    setSearchServiceTerm("");
  };

  const handleProduitSelect = produit => {
    setLignesProduits([...lignesProduits, {
      produitId: produit.id,
      nom: produit.nom,
      quantite: 1,
      prixUnitaire: Number(produit.prixHT) || 0,
      montant: Number(produit.prixHT) || 0
    }]);
    setShowProduitModal(false);
    setSearchProduitTerm("");
  };

  const updateLigneService = (i, f, v) => {
    const updated = [...lignesServices];
    updated[i][f] = Number(v);
    if (f === "duree" || f === "tarifhoraire")
      updated[i].montant = Number(updated[i].duree) * Number(updated[i].tarifhoraire);
    setLignesServices(updated);
  };

  const updateLigneProduit = (i, f, v) => {
    const updated = [...lignesProduits];
    updated[i][f] = Number(v);
    if (f === "quantite" || f === "prixUnitaire")
      updated[i].montant = Number(updated[i].quantite) * Number(updated[i].prixUnitaire);
    setLignesProduits(updated);
  };

  const removeLigneService = i => setLignesServices(lignesServices.filter((_, index) => index !== i));
  const removeLigneProduit = i => setLignesProduits(lignesProduits.filter((_, index) => index !== i));

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
        dateCreation: formData.dateCreation,
        validUntil: formData.validUntil,
        timbre: Number(formData.timbre),
        statut: formData.statut,
        clientId: Number(formData.clientId),
        lignesProduits: lignesProduits.map(l => ({ produitid: l.produitId, quantite: l.quantite, remise: 0 })),
        lignesServices: lignesServices.map(l => ({ serviceid: l.serviceid, duree: l.duree, remise: 0 }))
      };
      await updateDevis(id, dataToSend);
      navigate("/DevisList");
    } catch (error) {
      console.error(error);
      setErrors({ submit: error.message || "Erreur lors de l'enregistrement" });
    } finally { setLoading(false); }
  };

  // --- Totaux ---
  const totalHT =
    lignesServices.reduce((sum, l) => sum + Number(l.montant || 0), 0) +
    lignesProduits.reduce((sum, l) => sum + Number(l.montant || 0), 0);

  const totalTVA = Number(totalHT) * 0.19;
  const totalTTC = Number(totalHT) + Number(totalTVA) + Number(formData.timbre || 0);
  const netAPayer = totalTTC;

  if (loading && !formData.clientId) return (
    <div className="d-flex justify-content-center align-items-center min-vh-50">
      <div className="text-center">
        <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} role="status"></div>
        <p className="mt-3 text-muted fs-5">Chargement...</p>
      </div>
    </div>
  );

  return (
    <div className="content">
      <Card className="shadow-sm p-4" style={{ maxWidth: "95%" }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="text-primary"><FaFileInvoice className="me-2" />Modifier le Devis</h3>
            <Badge bg="secondary" className="fs-6 p-2">Devis #{id}</Badge>
          </div>

          {errors.submit && <Alert variant="danger" className="mb-4"><FaExclamationTriangle className="me-2" />{errors.submit}</Alert>}

          <Form onSubmit={handleSubmit}>
            {/* --- Client & Projet --- */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Client</Form.Label>
                  <h1 className="mt-1 text-muted small">{formData.client.raisonSociale}</h1>
                  <InputGroup>
                    <FormControl
                      placeholder="Rechercher un client"
                      value={searchClientTerm}
                      onChange={e => setSearchClientTerm(e.target.value)}
                      readOnly={false}
                      onClick={() => setShowClientModal(true)}
                    />
                    <Button variant="outline-secondary" onClick={() => setShowClientModal(true)}>...</Button>
                  </InputGroup>
                  {errors.clientId && <div className="text-danger">{errors.clientId}</div>}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Projet</Form.Label>
                  <Form.Control type="text" name="projet" value={formData.projet} onChange={handleChange} />
                  {errors.projet && <div className="text-danger">{errors.projet}</div>}
                </Form.Group>
              </Col>
            </Row>

            {/* --- Dates et statut --- */}
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Date de création</Form.Label>
                  <Form.Control type="date" name="dateCreation" value={formData.dateCreation} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Date de validité</Form.Label>
                  <Form.Control type="date" name="validUntil" value={formData.validUntil} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Statut</Form.Label>
                  <Form.Select name="statut" value={formData.statut} onChange={handleChange}>
                    <option value="Brouillon">Brouillon</option>
                    <option value="Validé">Validé</option>
                    <option value="Converti en facture">Converti en facture</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* --- Lignes Services --- */}
            <Card className="mb-3" style={{ maxWidth: "95%" }}>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <span>Services</span>
                <Button variant="outline-primary" size="sm" onClick={() => setShowServiceModal(true)}><FaPlus /></Button>
              </Card.Header>
              <Card.Body className="p-0">
                <Table striped bordered hover size="sm" className="mb-0">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Duree</th>
                      <th>Tarif</th>
                      <th>Montant</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lignesServices.map((l, i) => (
                      <tr key={i}>
                        <td>{l.description}</td>
                        <td><Form.Control type="number" value={l.duree} onChange={e => updateLigneService(i, 'duree', e.target.value)} /></td>
                        <td><Form.Control type="number" value={l.tarifhoraire} onChange={e => updateLigneService(i, 'tarifhoraire', e.target.value)} /></td>
                        <td>{Number(l.montant || 0).toFixed(2)}</td>
                        <td><Button variant="danger" size="sm" onClick={() => removeLigneService(i)}><FaTrash /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            {/* --- Lignes Produits --- */}
            <Card className="mb-3" style={{ maxWidth: "95%" }}>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <span>Produits</span>
                <Button variant="outline-primary" size="sm" onClick={() => setShowProduitModal(true)}><FaPlus /></Button>
              </Card.Header>
              <Card.Body className="p-0">
                <Table striped bordered hover size="sm" className="mb-0">
                  <thead>
                    <tr>
                      <th>Désignation</th>
                      <th>Quantité</th>
                      <th>Prix</th>
                      <th>Montant</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lignesProduits.map((l, i) => (
                      <tr key={i}>
                        <td>{l.nom}</td>
                        <td><Form.Control type="number" value={l.quantite} onChange={e => updateLigneProduit(i, 'quantite', e.target.value)} /></td>
                        <td><Form.Control type="number" value={l.prixUnitaire} onChange={e => updateLigneProduit(i, 'prixUnitaire', e.target.value)} /></td>
                        <td>{Number(l.montant || 0).toFixed(2)}</td>
                        <td><Button variant="danger" size="sm" onClick={() => removeLigneProduit(i)}><FaTrash /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            {/* --- Totaux --- */}
            <Card className="mb-3 p-3">
              <div className="d-flex justify-content-between"><span>Total HT:</span><span>{Number(totalHT).toFixed(2)}</span></div>
              <div className="d-flex justify-content-between"><span>Total TVA:</span><span>{Number(totalTVA).toFixed(2)}</span></div>
              <div className="d-flex justify-content-between"><span>Timbre:</span><span>{Number(formData.timbre).toFixed(2)}</span></div>
              <hr />
              <div className="d-flex justify-content-between fw-bold"><span>Total TTC:</span><span>{Number(totalTTC).toFixed(2)}</span></div>
              <div className="d-flex justify-content-between fw-bold text-primary"><span>Net à payer:</span><span>{Number(netAPayer).toFixed(2)}</span></div>
            </Card>

            <div className="text-end">
              <Button variant="success" type="submit"><FaSave className="me-1" />Mettre à jour</Button>
            </div>
          </Form>

          {/* --- Modales --- */}
          <Modal show={showClientModal} onHide={() => setShowClientModal(false)}>
            <Modal.Header closeButton><Modal.Title>Choisir un client</Modal.Title></Modal.Header>
            <Modal.Body>
              <Form.Control placeholder="Rechercher..." value={searchClientTerm} onChange={e => setSearchClientTerm(e.target.value)} className="mb-2" />
                            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {filteredClients.map(client => (
                  <div
                    key={client.id}
                    className="p-2 border-bottom cursor-pointer"
                    onClick={() => handleClientSelect(client)}
                    style={{ cursor: "pointer" }}
                  >
                    <strong>{client.raisonSociale || client.nom}</strong><br />
                    <small className="text-muted">{client.email}</small>
                  </div>
                ))}
              </div>
            </Modal.Body>
          </Modal>

          <Modal show={showServiceModal} onHide={() => setShowServiceModal(false)}>
            <Modal.Header closeButton><Modal.Title>Choisir un service</Modal.Title></Modal.Header>
            <Modal.Body>
              <Form.Control
                placeholder="Rechercher..."
                value={searchServiceTerm}
                onChange={e => setSearchServiceTerm(e.target.value)}
                className="mb-2"
              />
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {filteredServices.map(service => (
                  <div
                    key={service.id}
                    className="p-2 border-bottom"
                    onClick={() => handleServiceSelect(service)}
                    style={{ cursor: "pointer" }}
                  >
                    <strong>{service.description}</strong><br />
                    <small className="text-muted">Tarif: {Number(service.tarif || 0).toFixed(2)}</small>
                  </div>
                ))}
              </div>
            </Modal.Body>
          </Modal>

          <Modal show={showProduitModal} onHide={() => setShowProduitModal(false)}>
            <Modal.Header closeButton><Modal.Title>Choisir un produit</Modal.Title></Modal.Header>
            <Modal.Body>
              <Form.Control
                placeholder="Rechercher..."
                value={searchProduitTerm}
                onChange={e => setSearchProduitTerm(e.target.value)}
                className="mb-2"
              />
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {filteredProduits.map(produit => (
                  <div
                    key={produit.id}
                    className="p-2 border-bottom"
                    onClick={() => handleProduitSelect(produit)}
                    style={{ cursor: "pointer" }}
                  >
                    <strong>{produit.nom}</strong><br />
                    <small className="text-muted">Prix: {Number(produit.prixHT || 0).toFixed(2)}</small>
                  </div>
                ))}
              </div>
            </Modal.Body>
          </Modal>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DevisEdit;

