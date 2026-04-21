import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Ce composant intercepte les liens PocketBase et redirige vers les bonnes pages
const PocketBaseRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    
    // Reset password: /_/#/auth/confirm-password-reset/TOKEN
    const resetMatch = hash.match(/\/auth\/confirm-password-reset\/([^/]+)/);
    if (resetMatch) {
      navigate(`/reset-password/${resetMatch[1]}`, { replace: true });
      return;
    }

    // Verify email: /_/#/auth/confirm-verification/TOKEN
    const verifyMatch = hash.match(/\/auth\/confirm-verification\/([^/]+)/);
    if (verifyMatch) {
      navigate(`/verify-email/${verifyMatch[1]}`, { replace: true });
      return;
    }

    // Par défaut retour à l'accueil
    navigate('/', { replace: true });
  }, [navigate]);

  return null;
};

export default PocketBaseRedirect;
