import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RoleGuard({ allow, children }: { allow: Array<'GOD' | 'ADMIN' | 'STAFF' | 'CLIENT'>; children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="app-card">Cargando sesion...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allow.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  if (user.approved === false && user.role !== 'GOD' && user.role !== 'ADMIN') {
    return <Navigate to="/waiting" replace />;
  }

  return <>{children}</>;
}
