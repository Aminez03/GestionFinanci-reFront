import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';

import Login from './pages/Login';
import Profile from './pages/profile';

import ChangePassword from './pages/ChangePassword';
import PersonnePhysiqueList from './pages/PersonnePhysiqueList';
import PersonnePhysiqueForm from './pages/PersonnePhysiqueForm';
import PersonnePhysiqueDetail from './pages/PersonnePhysiqueDetail';
import PersonneMoraleList from './pages/PersonneMoraleList';
import PersonneMoraleForm from './pages/PersonneMoraleForm';
import PersonneMoraleDetail from './pages/PersonneMoraleDetail';
import Sidebar from './pages/SideBar';
import TypeProduitForm from './pages/TypeProduitForm';
import ProduitList from './pages/ProduitList';
import ServiceList from './pages/ServiceList';
import ProduitForm from './pages/ProduitForm';
import ServiceForm from './pages/ServiceForm';
import DevisList from './pages/DevisList';
import DevisForm from './pages/DevisForm';
import DevisDetails from './pages/DevisDetails';
import DevisEdit from './pages/DevisEdit';
import FactureVenteList from './pages/FactureVenteList';
import FactureVenteEdit from './pages/FactureVenteEdit';
import FactureVenteForm from './pages/FactureVenteForm';
import FactureVenteDetails from './pages/FactureVenteDetails';
import FactureAchatList from './pages/FactureAchatList';
import FactureAchatDetails from './pages/FactureAchatDetails';
import FactureAchatForm from './pages/FactureAchatForm';
import FactureAchatEdit from './pages/FactureAchatEdit';
import ReglementList from './pages/ReglementList';
import CompteBancaireList from './pages/CompteBancaireList';
import CaisseList from './pages/CaisseList';





function App() {
  return (
    <Router>
    <Sidebar />
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Routes protégées */}
          <Route >
            {/* <Route path="/" element={<HomePage />} /> */}




             <Route path="/PersonnePhysiqueList" element={<PersonnePhysiqueList />} />

              <Route path="/PersonnePhysiqueForm" element={<PersonnePhysiqueForm />} />
              <Route path="/PersonnePhysiqueForm/:id" element={<PersonnePhysiqueForm />} />
              <Route path="/PersonnePhysiqueDetail/:id" element={<PersonnePhysiqueDetail />} />




                      {/* Personnes Morales */}
        <Route path="/PersonneMoraleList" element={<PersonneMoraleList />} />
        <Route path="/PersonneMoraleForm" element={<PersonneMoraleForm />} />
        <Route path="/PersonneMoraleForm/:id" element={<PersonneMoraleForm />} />
        <Route path="/PersonneMoraleDetail/:id" element={<PersonneMoraleDetail />} />


        <Route path="/TypeProduit" element={<TypeProduitForm />} />



          {/* Produits */}
            <Route path="/ProduitList" element={<ProduitList />} />
            <Route path="/ProduitForm" element={<ProduitForm />} />
           <Route path="/ProduitForm/:id" element={<ProduitForm />} />

            {/* Services */}
            <Route path="/ServiceList" element={<ServiceList />} />
            <Route path="/ServiceForm" element={<ServiceForm />} />
     
            <Route path="/ServiceForm/:id" element={<ServiceForm />} />


        {/* Routes Devis */}
            <Route path="/DevisList" element={<DevisList />} />
            <Route path="/DevisForm" element={<DevisForm />} />
            <Route path="/devis/:id" element={<DevisDetails />} />
            <Route path="/devis/edit/:id" element={<DevisEdit />} />




            
        {/* Routes Facture Vente */}
        <Route path="/FactureVenteList" element={<FactureVenteList />} />
        <Route path="/FactureVenteForm" element={<FactureVenteForm />} />
        <Route path="/FactureVente/:id" element={<FactureVenteDetails />} />
        <Route path="/FactureVenteEdit/:id" element={<FactureVenteEdit />} />

      

                
        {/* Routes Facture Achat */}
        <Route path="/FactureAchatList" element={<FactureAchatList />} />
        <Route path="/FactureAchatForm" element={<FactureAchatForm />} />
        <Route path="/FactureAchat/:id" element={<FactureAchatDetails />} />
        <Route path="/FactureAchatEdit/:id" element={<FactureAchatEdit />} />




        {/* Routes Reglement */}
        <Route path="/ReglementList" element={<ReglementList />} />

  <Route path="/CompteBancaireList" element={<CompteBancaireList />} />

 <Route path="/CaisseList" element={<CaisseList />} />



            <Route path="/profile" element={<Profile />} />
            <Route path="/change-password" element={<ChangePassword />} />
            {/* ... autres routes protégées */}
          </Route>
        </Routes>
    
    </Router>
  );
}

export default App;
