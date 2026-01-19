import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form, Button, Row, Col, Card, Table, Badge,
  Modal, Alert, InputGroup, FormControl
} from "react-bootstrap";
import {
  FaFileInvoiceDollar, FaPlus, FaTrash, FaSave,
  FaExclamationTriangle
} from "react-icons/fa";
import { getFactureAchatById, updateFactureAchat } from "../services/factureAchatService";
import { getAllTiers } from "../services/tiersService";
import { getAllProduits } from "../services/produitService";
import { getAllServices } from "../services/serviceService";
import { getPersonneMoraleByTiersId } from "../services/personneMoraleService";

const FactureAchatEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    fournisseurId: "",
   
    dateReception: new Date().toISOString().split("T")[0],
    statut: "Brouillon",
    timbre: 1,
    fournisseur: { raisonSociale: "", email: "", telephone: "", adresse: "", matriculeFiscale: "" }
  });

  const [lignesServices, setLignesServices] = useState([]);
  const [lignesProduits, setLignesProduits] = useState([]);

  const [services, setServices] = useState([]);
  const [produits, setProduits] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);

  const [filteredServices, setFilteredServices] = useState([]);
  const [filteredProduits, setFilteredProduits] = useState([]);
  const [filteredFournisseurs, setFilteredFournisseurs] = useState([]);

  const [searchServiceTerm, setSearchServiceTerm] = useState("");
  const [searchProduitTerm, setSearchProduitTerm] = useState("");
  const [searchFournisseurTerm, setSearchFournisseurTerm] = useState("");

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showProduitModal, setShowProduitModal] = useState(false);
  const [showFournisseurModal, setShowFournisseurModal] = useState(false);

  // --- Chargement initial ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [servicesResp, produitsResp, fournisseursResp] = await Promise.all([
          getAllServices(),
          getAllProduits(),
          getAllTiers()
        ]);

        setServices(servicesResp?.data || []);
        setFilteredServices(servicesResp?.data || []);
        setProduits(produitsResp?.data || []);
        setFilteredProduits(produitsResp?.data || []);
        setFournisseurs(fournisseursResp?.data || []);
        setFilteredFournisseurs(fournisseursResp?.data || []);

        if (id) {
          const factureData = await getFactureAchatById(id);

          let fournisseurData = {};
          try {
            fournisseurData = await getPersonneMoraleByTiersId(factureData.fournisseurId);
          } catch (error) {
            console.error("Erreur récupération fournisseur:", error);
            fournisseurData = { raisonSociale: "Fournisseur non trouvé", matriculeFiscale: "" };
          }

          setFormData({
            fournisseurId: factureData.fournisseurId,
          
            dateReception: factureData.dateReception?.split("T")[0] || new Date().toISOString().split("T")[0],
            statut: factureData.statut || "Brouillon",
            timbre: Number(factureData.timbre) || 1,
            fournisseur: {
              raisonSociale: fournisseurData.raisonSociale || factureData.fournisseur?.raisonSociale || "",
              email: fournisseurData.email || factureData.fournisseur?.email || "",
              telephone: fournisseurData.telephone || factureData.fournisseur?.telephone || "",
              adresse: fournisseurData.adresse || factureData.fournisseur?.adresse || "",
              matriculeFiscale: fournisseurData.matriculeFiscale || ""
            }
          });

          setLignesServices((factureData.lignesServices || []).map(l => ({
            serviceid: l.serviceid,
            description: l.service?.description || "Service non trouvé",
            duree: Number(l.duree) || 0,
            tarifhoraire: Number(l.tarifhoraire) || 0,
            montant: Number(l.montant) || 0
          })));

          setLignesProduits((factureData.lignesProduits || []).map(l => ({
            produitid: l.produitid,
            nom: l.produit?.nom || "Produit non trouvé",
            quantite: Number(l.quantite) || 0,
            prixUnitaire: Number(l.prixUnitaire) || 0,
            sousTotalHT: Number(l.sousTotalHT) || 0
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

  useEffect(() => setFilteredFournisseurs(
    fournisseurs.filter(f => ((f.raisonSociale || f.nom) || "").toLowerCase().includes(searchFournisseurTerm.toLowerCase()))
  ), [searchFournisseurTerm, fournisseurs]);

  // --- Gestion formulaire ---
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleFournisseurSelect = fournisseur => {
    setFormData(prev => ({
      ...prev,
      fournisseurId: fournisseur.id,
      fournisseur: {
        raisonSociale: fournisseur.raisonSociale || fournisseur.nom || "",
        email: fournisseur.email || "",
        telephone: fournisseur.telephone || "",
        adresse: fournisseur.adresse || "",
        matriculeFiscale: fournisseur.matriculeFiscale || ""
      }
    }));
    setShowFournisseurModal(false);
    setSearchFournisseurTerm("");
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
      produitid: produit.id,
      nom: produit.nom,
      quantite: 1,
      prixUnitaire: Number(produit.prixHT) || 0,
      sousTotalHT: Number(produit.prixHT) || 0
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
      updated[i].sousTotalHT = Number(updated[i].quantite) * Number(updated[i].prixUnitaire);
    setLignesProduits(updated);
  };

  const removeLigneService = i => setLignesServices(lignesServices.filter((_, index) => index !== i));
  const removeLigneProduit = i => setLignesProduits(lignesProduits.filter((_, index) => index !== i));

  // --- Validation ---
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fournisseurId) newErrors.fournisseurId = "Veuillez sélectionner un fournisseur";
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
        
        dateReception: formData.dateReception,
        timbre: Number(formData.timbre),
        statut: formData.statut,
        fournisseurId: Number(formData.fournisseurId),
        lignesProduits: lignesProduits.map(l => ({
          produitid: l.produitid,
          quantite: l.quantite,
          prixUnitaire: l.prixUnitaire,
          remise: 0
        })),
        lignesServices: lignesServices.map(l => ({
          serviceid: l.serviceid,
          duree: l.duree,
          tarifhoraire: l.tarifhoraire,
          remise: 0
        }))
      };

      await updateFactureAchat(id, dataToSend);
      navigate("/FactureAchatList");
    } catch (error) {
      console.error(error);
      setErrors({ submit: error.message || "Erreur lors de l'enregistrement" });
    } finally { setLoading(false); }
  };

  // --- Totaux ---
  const totalHT =
    lignesServices.reduce((sum, l) => sum + Number(l.montant || 0), 0) +
    lignesProduits.reduce((sum, l) => sum + Number(l.sousTotalHT || 0), 0);
  const totalTVA = Number(totalHT) * 0.19;
  const totalTTC = Number(totalHT) + Number(totalTVA) + Number(formData.timbre || 0);
  const netAPayer = totalTTC;

  if (loading && !formData.fournisseurId) return (
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
            <h3 className="text-primary"><FaFileInvoiceDollar className="me-2" />Modifier Facture Achat</h3>
            <Badge bg="secondary" className="fs-6 p-2">Facture #{id}</Badge>
          </div>

          {errors.submit && <Alert variant="danger" className="mb-4"><FaExclamationTriangle className="me-2" />{errors.submit}</Alert>}

          <Form onSubmit={handleSubmit}>
            {/* --- Fournisseur  --- */}
            <Row className="mb-3">
              <Form.Label>Fournisseur</Form.Label>
              <Col md={6}>
                <Form.Group>
                  <h1 className="mt-1 small">{formData.fournisseur.raisonSociale}</h1>
                  <InputGroup>
                    <FormControl
                      placeholder="Rechercher un fournisseur"
                      value={searchFournisseurTerm}
                      onChange={e => setSearchFournisseurTerm(e.target.value)}
                      readOnly={false}
                      onClick={() => setShowFournisseurModal(true)}
                    />
                    <Button variant="outline-secondary" onClick={() => setShowFournisseurModal(true)}>...</Button>
                  </InputGroup>
                  {errors.fournisseurId && <div className="text-danger">{errors.fournisseurId}</div>}
                </Form.Group>
              </Col>
              
            </Row>

            {/* --- Date & Statut --- */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Date Réception</Form.Label>
                  <Form.Control type="date" name="dateReception" value={formData.dateReception} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Statut</Form.Label>
                  <Form.Select name="statut" value={formData.statut} onChange={handleChange}>
                    <option value="Brouillon">Brouillon</option>
                    <option value="En attente">En attente</option>
                    <option value="Payée">Payée</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* --- Lignes Services & Produits --- */}
            {/* Tu peux réutiliser les mêmes tables que FactureVenteEdit */}
            {/* Lignes Services */}
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

            {/* Lignes Produits */}
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
                        <td>{Number(l.sousTotalHT || 0).toFixed(2)}</td>
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

          {/* --- Modales Fournisseurs / Services / Produits --- */}
          <Modal show={showFournisseurModal} onHide={() => setShowFournisseurModal(false)}>
            <Modal.Header closeButton><Modal.Title>Choisir un fournisseur</Modal.Title></Modal.Header>
            <Modal.Body>
              <Form.Control placeholder="Rechercher..." value={searchFournisseurTerm} onChange={e => setSearchFournisseurTerm(e.target.value)} className="mb-2" />
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {filteredFournisseurs.map(f => (
                  <div key={f.id} className="p-2 border-bottom" style={{ cursor: "pointer" }} onClick={() => handleFournisseurSelect(f)}>
                    <strong>{f.raisonSociale || f.nom}</strong><br />
                    <small className="text-muted">{f.email}</small>
                  </div>
                ))}
              </div>
            </Modal.Body>
          </Modal>

          {/* Réutiliser modales Services et Produits comme pour FactureVenteEdit */}
          <Modal show={showServiceModal} onHide={() => setShowServiceModal(false)}>
            <Modal.Header closeButton><Modal.Title>Choisir un service</Modal.Title></Modal.Header>
            <Modal.Body>
              <Form.Control placeholder="Rechercher..." value={searchServiceTerm} onChange={e => setSearchServiceTerm(e.target.value)} className="mb-2" />
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {filteredServices.map(service => (
                  <div key={service.id} className="p-2 border-bottom" style={{ cursor: "pointer" }} onClick={() => handleServiceSelect(service)}>
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
              <Form.Control placeholder="Rechercher..." value={searchProduitTerm} onChange={e => setSearchProduitTerm(e.target.value)} className="mb-2" />
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {filteredProduits.map(produit => (
                  <div key={produit.id} className="p-2 border-bottom" style={{ cursor: "pointer" }} onClick={() => handleProduitSelect(produit)}>
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

export default FactureAchatEdit;
