import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyToken } from '../services/authService';
// Création du contexte
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    // Récupération des données depuis le localStorage
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    return token && user ? { 
      isAuthenticated: true, 
      user, 
      token,
      isLoading: false
    } : { 
      isAuthenticated: false, 
      user: null, 
      token: null,
      isLoading: false
    };
  });

  const navigate = useNavigate();

  // Vérification périodique du token
  useEffect(() => {
    const checkAuth = async () => {
      if (auth.token) {
        try {
          setAuth(prev => ({ ...prev, isLoading: true }));
          const isValid = await verifyToken(auth.token);
          
          if (!isValid) {
            logout();
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          logout();
        } finally {
          setAuth(prev => ({ ...prev, isLoading: false }));
        }
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 15 * 60 * 1000); // Vérifie toutes les 15 minutes

    return () => clearInterval(interval);
  }, [auth.token]);

  // Fonction de connexion
  const login = (token, userData) => {
    const user = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      avatar: userData.avatar
    };

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    setAuth({
      isAuthenticated: true,
      user,
      token,
      isLoading: false
    });
  };

  // Fonction de déconnexion
  const logout = (redirectPath = '/login') => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setAuth({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false
    });

    navigate(redirectPath);
  };

  // Fonction de mise à jour des données utilisateur
  const updateUser = (updatedUser) => {
    const user = {
      ...auth.user,
      ...updatedUser
    };

    localStorage.setItem('user', JSON.stringify(user));
    
    setAuth(prev => ({
      ...prev,
      user
    }));
  };

  // Fonction pour vérifier les permissions
  const hasPermission = (requiredPermission) => {
    if (!auth.user?.role) return false;
    
    // Implémentez votre logique de vérification des permissions ici
    // Par exemple, vérifier contre un tableau de permissions dans auth.user.permissions
    return true; // Temporaire, à adapter
  };

  // Valeur du contexte
  const value = {
    auth,
    login,
    logout,
    updateUser,
    hasPermission,
    setAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}