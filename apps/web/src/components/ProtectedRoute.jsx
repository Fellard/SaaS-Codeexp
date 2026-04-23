/**
 * ProtectedRoute — Garde-routes RBAC — IWS LAAYOUNE
 * ─────────────────────────────────────────────────────────────────────────────
 * ProtectedRoute  : tout utilisateur authentifié (bloque les non-connectés)
 * RoleRoute       : restreint à un ou plusieurs rôles (bloque les mauvais rôles)
 * AdminRoute      : réservé aux rôles admin / manager
 * ─────────────────────────────────────────────────────────────────────────────
 * Comportement en cas d'accès non autorisé :
 *   - Non authentifié → /login (avec sauvegarde de la page d'origine)
 *   - Mauvais rôle   → espace propre du rôle (getDashboardPath)
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';

// ── Spinner partagé ─────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// ── Routes spécifiques à chaque rôle (doit correspondre à getDashboardPath) ─
// Ces routes /dashboard/* sont réservées aux étudiants.
// Un client ou musicien qui tenterait d'y accéder est redirigé vers son espace.
const STUDENT_ONLY_PATHS = [
  '/dashboard/courses',
  '/dashboard/recall',
];

// ── ProtectedRoute : tout utilisateur authentifié ───────────────────────────
// - Redirige les non-authentifiés vers /login
// - Redirige /dashboard exactement vers l'espace rôle-spécifique
// - Redirige les non-étudiants hors des routes réservées aux étudiants
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, currentRole, initialLoading, getDashboardPath } = useAuth();
  const location = useLocation();

  if (initialLoading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  const path = location.pathname;

  // Redirection de l'ancienne route /dashboard vers l'espace rôle-spécifique
  if (path === '/dashboard' || path === '/dashboard/') {
    return <Navigate to={getDashboardPath(currentRole)} replace />;
  }

  // Blocage cross-rôle : routes réservées aux étudiants
  const isStudentPath = STUDENT_ONLY_PATHS.some(p => path.startsWith(p));
  if (isStudentPath && currentRole !== 'etudiant' && currentRole !== 'admin' && currentRole !== 'manager') {
    console.warn(`[RBAC] Rôle "${currentRole}" bloqué sur ${path} → redirection vers son espace`);
    return <Navigate to={getDashboardPath(currentRole)} replace />;
  }

  return children;
};

// ── RoleRoute : n'autorise qu'un ou plusieurs rôles spécifiques ─────────────
// allowedRoles = ['etudiant'] ou ['client'] ou ['musicien', 'admin'] etc.
export const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, currentRole, initialLoading, getDashboardPath } = useAuth();
  const location = useLocation();

  if (initialLoading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  // Admin et manager ont accès à tout sauf les espaces purement rôle-utilisateur
  const isPrivileged = currentRole === 'admin' || currentRole === 'manager';

  if (allowedRoles.includes(currentRole) || isPrivileged) {
    return children;
  }

  // Rôle non autorisé → rediriger vers son propre espace (jamais vers login)
  console.warn(
    `[RBAC] Accès refusé — rôle "${currentRole}" sur une route réservée à [${allowedRoles.join(', ')}]. ` +
    `Redirection vers ${getDashboardPath(currentRole)}`
  );
  return <Navigate to={getDashboardPath(currentRole)} replace />;
};

// ── AdminRoute : réservé aux admin / manager ─────────────────────────────────
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, currentRole, initialLoading, getDashboardPath } = useAuth();
  const location = useLocation();

  if (initialLoading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  if (currentRole === 'admin' || currentRole === 'manager') {
    return children;
  }

  // Pas admin → son espace propre (jamais un écran d'erreur 403)
  console.warn(
    `[RBAC] AdminRoute — rôle "${currentRole}" refusé. Redirection vers ${getDashboardPath(currentRole)}`
  );
  return <Navigate to={getDashboardPath(currentRole)} replace />;
};

export default ProtectedRoute;
