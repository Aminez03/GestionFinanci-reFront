import React, { useEffect, useState } from "react";
import { Table, Button, Badge, Card, Spinner } from "react-bootstrap";
import { FaTrash, FaCashRegister, FaUniversity } from "react-icons/fa";
import { getAllCaisses, getAllComptesBancaires, deleteCaisse, deleteCompteBancaire } from "../services/reglementService";

const ReglementList = () => {
  const [caisses, setCaisses] = useState([]);
  const [comptes, setComptes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const caissesData = await getAllCaisses();
        const comptesData = await getAllComptesBancaires();
        setCaisses(caissesData);
        setComptes(comptesData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteCaisse = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette caisse ?")) {
      await deleteCaisse(id);
      setCaisses(caisses.filter(c => c.id !== id));
    }
  };

  const handleDeleteCompte = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce compte bancaire ?")) {
      await deleteCompteBancaire(id);
      setComptes(comptes.filter(c => c.id !== id));
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center mt-5">
      <Spinner animation="border" variant="primary" />
    </div>
  );

  return (
    <div className="container mt-4">
      <Card className="mb-4 p-3 shadow-sm">
        <h4><FaCashRegister className="me-2" />Règlements en Caisse</h4>
        <Table striped bordered hover responsive className="mt-2">
          <thead>
            <tr>
              <th>ID</th>
              <th>Montant</th>
              <th>Solde</th>
              <th>Mode Paiement</th>
              <th>Facture</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {caisses.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{Number(c.reglement.montant).toFixed(2)}</td>
                <td>{Number(c.solde).toFixed(2)}</td>
                <td>{c.reglement.modePaiement}</td>
                <td>{c.reglement.facture?.reference || "N/A"}</td>
                <td>{new Date(c.reglement.date).toLocaleDateString()}</td>
                <td>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteCaisse(c.id)}>
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card className="p-3 shadow-sm">
        <h4><FaUniversity className="me-2" />Règlements Compte Bancaire</h4>
        <Table striped bordered hover responsive className="mt-2">
          <thead>
            <tr>
              <th>ID</th>
              <th>Montant</th>
              <th>Solde</th>
              <th>Banque</th>
              <th>RIB</th>
              <th>Mode Paiement</th>
              <th>Facture</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {comptes.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{Number(c.reglement.montant).toFixed(2)}</td>
                <td>{Number(c.solde).toFixed(2)}</td>
                <td>{c.banque}</td>
                <td>{c.rib}</td>
                <td>{c.reglement.modePaiement}</td>
                <td>{c.reglement.facture?.reference || "N/A"}</td>
                <td>{new Date(c.reglement.date).toLocaleDateString()}</td>
                <td>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteCompte(c.id)}>
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default ReglementList;
