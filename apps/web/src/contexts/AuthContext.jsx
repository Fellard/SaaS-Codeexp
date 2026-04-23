import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser]     = useState(null);
  const [currentRole, setCurrentRole]     = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();

  // ── Vérifie que l'utilisateur connecté existe encore en base ──────
  // Si supprimé depuis la DB, le JWT reste valide jusqu'à expiration.
  // authRefresh() échoue avec 401 si l'utilisateur n'existe plus → logout.
  const validateSession = async () => {
    if (!pb.authStore.isValid || !pb.authStore.model) return;
    try {
      await pb.collection('users').authRefresh({ requestKey: null });
    } catch (err) {
      // 401/404 = utilisateur supprimé ou token révoqué → déconnexion immédiate
      if (err?.status === 401 || err?.status === 404 || err?.status === 403) {
        pb.authStore.clear();
        setCurrentUser(null);
        setCurrentRole(null);
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    // Chargement initial : hydrate depuis le store local puis vérifie en DB
    if (pb.authStore.isValid && pb.authStore.model) {
      setCurrentUser(pb.authStore.model);
      setCurrentRole(pb.authStore.model.role || null);
      // Vérifie que le compte existe encore (non bloquant)
      validateSession();
    }
    setInitialLoading(false);

    // Écoute les changements du store (login / logout / refresh)
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
      setCurrentRole(model?.role || null);
    });

    // Revalide la session quand l'utilisateur revient sur l'onglet
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        validateSession();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Revalide toutes les 5 minutes en arrière-plan
    const interval = setInterval(validateSession, 5 * 60 * 1000);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAdmin   = () => currentRole === 'admin';
  const isManager = () => currentRole === 'manager' || currentRole === 'admin';

  // ── Retourne le chemin du tableau de bord selon le rôle ───────────
  const getDashboardPath = (role) => {
    switch (role) {
      case 'admin':
      case 'manager':  return '/admin';
      case 'etudiant': return '/etudiant/dashboard';
      case 'client':   return '/client/dashboard';
      case 'musicien': return '/musicien/dashboard';
      default:         return '/dashboard';
    }
  };

  // Connexion
  const login = async (email, password) => {
    const authData = await pb.collection('users').authWithPassword(email, password, { requestKey: null });

    // Vérifier que le compte est approuvé (pour les admins)
    if (authData.record.role === 'admin' && !authData.record.approved) {
      pb.authStore.clear();
      throw new Error('Votre compte est en attente de validation par notre équipe. Vous recevrez un email dès que votre accès sera activé.');
    }

    setCurrentUser(authData.record);
    setCurrentRole(authData.record.role);
    return authData.record;
  };

  // Inscription directe (utilisé après l'appel API /auth/register)
  const signup = async (email, password, name, role = 'client') => {
    const authData = await pb.collection('users').authWithPassword(email, password, { requestKey: null });
    setCurrentUser(authData.record);
    setCurrentRole(authData.record.role);
    return authData.record;
  };

  // Déconnexion → retour à l'accueil
  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
    setCurrentRole(null);
    navigate('/');
  };

  const requestPasswordReset = async (email) => {
    await pb.collection('users').requestPasswordReset(email, { requestKey: null });
  };

  const confirmPasswordReset = async (token, password, passwordConfirm) => {
    await pb.collection('users').confirmPasswordReset(token, password, passwordConfirm, { requestKey: null });
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      currentRole,
      isAuthenticated: !!currentUser,
      isAdmin,
      isManager,
      getDashboardPath,
      login,
      signup,
      logout,
      requestPasswordReset,
      confirmPasswordReset,
      initialLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
