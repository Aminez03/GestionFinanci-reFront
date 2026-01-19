import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        navigate("/login");
        return;
      }
      setUser(currentUser);
    } catch (err) {
      setError("Impossible de charger les informations de l'utilisateur");
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card p-4 shadow-lg" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="text-center mb-4">Profil Utilisateur</h2>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        {user ? (
          <div>
            {user.avatar && (
              <div className="d-flex justify-content-center mb-3">
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="rounded-circle"
                  style={{ width: "150px", height: "150px", objectFit: "cover" }}
                />
              </div>
            )}
            <div className="text-center mb-3">
              <h3 className="fs-5 fw-bold">Bienvenue, {user.name}</h3>
            </div>
            <div className="mb-3">
              <p className="mb-2"><strong>Email :</strong> {user.email}</p>
              <p className="mb-2"><strong>Téléphone :</strong> {user.telephone || "Non renseigné"}</p>
              <p className="mb-2"><strong>Rôle :</strong> {user.role}</p>
            </div>
            <button onClick={handleLogout} className="btn btn-danger w-100">Déconnexion</button>
          </div>
        ) : (
          !error && <div className="text-center text-muted">Chargement des informations...</div>
        )}
        <p className="text-center mt-3">
          <a href="/edit-profile" className="link-primary">Modifier le profil</a>
        </p>
      </div>
    </div>
  );
}
