import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RoleGuard({ allow, children }: { allow: Array<'GOD' | 'OWNER' | 'ADMIN' | 'STAFF' | 'CLIENT'>; children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="app-card">Cargando sesion...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!user.role) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role === 'STAFF') {
    const blocked = ['settings', 'billing', 'admin-home', 'reports'];
    const pathname = location.pathname.toLowerCase();
    if (blocked.some((segment) => pathname.includes(segment))) {
      return <Navigate to="/" replace />;
    }
  }

  if (!allow.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  if (user.approved === false && user.role !== 'GOD' && user.role !== 'OWNER' && user.role !== 'ADMIN') {
    return <Navigate to="/waiting" replace />;
  }

  return <>{children}</>;
}
