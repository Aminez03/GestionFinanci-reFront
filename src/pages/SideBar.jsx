import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  FaUsers, 
  FaBuilding, 
  FaBoxOpen, 
  FaConciergeBell, 
  FaFileInvoice, 
  FaShoppingCart, 
  FaReceipt, 
  FaFileAlt, 
  FaUniversity, 
  FaMoneyBillWave, 
  FaBars, 
  FaTimes,
  FaChevronRight,
  FaHome,
  FaChartLine
} from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    clients: true,
    products: true,
    documents: true,
    payments: true
  });
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const navigationItems = [
   
    {
      id: 'clients',
      title: 'Clients',
      icon: FaUsers,
      children: [
        { title: 'Personnes Physiques', icon: FaUsers, path: '/PersonnePhysiqueList' },
        { title: 'Personnes Morales', icon: FaBuilding, path: '/PersonneMoraleList' }
      ]
    },
    {
      id: 'products',
      title: 'Produits & Services',
      icon: FaBoxOpen,
      children: [
        { title: 'Produits', icon: FaBoxOpen, path: '/ProduitList' },
        { title: 'Services', icon: FaConciergeBell, path: '/ServiceList' }
      ]
    },
    {
      id: 'documents',
      title: 'Documents',
      icon: FaFileAlt,
      children: [
        { title: 'Devis', icon: FaFileAlt, path: '/DevisList' },
        { title: 'Factures Vente', icon: FaShoppingCart, path: '/FactureVenteList' },
        { title: 'Factures Achat', icon: FaReceipt, path: '/FactureAchatList' }
      ]
    },
    {
      id: 'payments',
      title: 'Règlements',
      icon: FaMoneyBillWave,
      children: [
        { title: 'Compte Bancaire', icon: FaUniversity, path: '/CompteBancaireList' },
        { title: 'Caisse', icon: FaMoneyBillWave, path: '/CaisseList' }
      ]
    }
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const hasActiveChild = (children) => {
    return children?.some(child => isActiveRoute(child.path));
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      {/* Header */}
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={toggleSidebar} title={isOpen ? "Fermer le menu" : "Ouvrir le menu"}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
        {isOpen && (
          <div className="logo-container">
            <div className="logo-icon">
              <FaChartLine />
            </div>
            <h2 className="logo">Gestion Finance</h2>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navigationItems.map((item) => (
          <div key={item.id} className="nav-section">
            {item.children ? (
              <>
                <button
                  className={`nav-section-header ${hasActiveChild(item.children) ? 'active' : ''}`}
                  onClick={() => toggleSection(item.id)}
                  disabled={!isOpen}
                >
                  <div className="nav-section-content">
                    <item.icon className="nav-section-icon" />
                    {isOpen && (
                      <>
                        <span className="nav-section-title">{item.title}</span>
                        <FaChevronRight className={`nav-section-arrow ${expandedSections[item.id] ? 'expanded' : ''}`} />
                      </>
                    )}
                  </div>
                </button>
                
                {isOpen && expandedSections[item.id] && (
                  <div className="nav-children">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={`nav-item ${isActiveRoute(child.path) ? 'active' : ''}`}
                        title={child.title}
                      >
                        <child.icon className="nav-item-icon" />
                        <span className="nav-item-text">{child.title}</span>
                        {isActiveRoute(child.path) && <div className="nav-item-indicator" />}
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink
                to={item.path}
                className={`nav-item ${isActiveRoute(item.path) ? 'active' : ''}`}
                title={item.title}
              >
                <item.icon className="nav-item-icon" />
                {isOpen && (
                  <>
                    <span className="nav-item-text">{item.title}</span>
                    {isActiveRoute(item.path) && <div className="nav-item-indicator" />}
                  </>
                )}
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className="sidebar-footer">
          <div className="footer-info">
            <div className="footer-version">v1.0.0</div>
            <div className="footer-company">© 2024 Gestion Finance</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
