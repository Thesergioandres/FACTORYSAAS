import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type LoginCardProps = {
  title?: string;
  subtitle?: string;
  demoHint?: string;
  allowedRoles?: Array<'GOD' | 'ADMIN' | 'STAFF' | 'CLIENT'>;
  redirectTo?: string;
};

const defaultRedirectByRole = {
  GOD: '/god',
  ADMIN: '/admin',
  STAFF: '/staff/dashboard',
  CLIENT: '/'
} as const;

export function LoginCard({ title = 'Iniciar sesion', subtitle, demoHint, allowedRoles, redirectTo }: LoginCardProps) {
  const { login, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      logout();
      setError('No tienes permisos para este acceso.');
      return;
    }

    const state = location.state as { from?: string } | null;
    const fallback = redirectTo || defaultRedirectByRole[user.role] || '/';
    navigate(state?.from || fallback, { replace: true });
  }, [allowedRoles, location.state, logout, navigate, redirectTo, user]);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (allowedRoles && !allowedRoles.includes(loggedUser.role)) {
        logout();
        setError('No tienes permisos para este acceso.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-card max-w-xl space-y-4">
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        {subtitle ? <p className="text-xs text-muted">{subtitle}</p> : null}
      </div>
      <label className="text-xs text-muted">
        Correo
        <input
          className="input-field mt-2"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="correo@barberia.com"
        />
      </label>
      <label className="text-xs text-muted">
        Contrasena
        <input
          type="password"
          className="input-field mt-2"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Tu contrasena"
        />
      </label>
      <button type="button" className="btn-primary" onClick={handleLogin} disabled={loading}>
        {loading ? 'Ingresando...' : 'Iniciar sesion'}
      </button>
      {error ? <p className="text-sm text-secondary">{error}</p> : null}
      {demoHint ? <p className="text-xs text-muted">{demoHint}</p> : null}
    </div>
  );
}
