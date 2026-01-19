import { useEffect, useState } from 'react';

export default function PasswordStrengthMeter({ password }) {
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    let score = 0;
    if (!password) {
      setStrength(0);
      return;
    }

    // Longueur
    if (password.length > 8) score++;
    if (password.length > 12) score++;

    // Complexité
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    setStrength(Math.min(score, 4));
  }, [password]);

  const getColor = () => {
    switch(strength) {
      case 1: return 'danger';
      case 2: return 'warning';
      case 3: return 'info';
      case 4: return 'success';
      default: return 'secondary';
    }
  };

  const getLabel = () => {
    switch(strength) {
      case 1: return 'Faible';
      case 2: return 'Moyen';
      case 3: return 'Fort';
      case 4: return 'Très fort';
      default: return '';
    }
  };

  return (
    <div className="mt-2">
      <div className="progress" style={{ height: '5px' }}>
        <div 
          className={`progress-bar bg-${getColor()}`} 
          role="progressbar" 
          style={{ width: `${strength * 25}%` }}
        ></div>
      </div>
      {password && (
        <small className={`text-${getColor()}`}>
          Force du mot de passe: {getLabel()}
        </small>
      )}
    </div>
  );
}