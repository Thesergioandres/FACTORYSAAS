import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from '../modules/services/presentation/pages/HomePage';
import { AboutPage } from '../modules/info/presentation/pages/AboutPage';
import { AppointmentsPage } from '../modules/appointments/presentation/pages/AppointmentsPage';
import { AdminDashboardPage } from '../modules/admin/presentation/pages/AdminDashboardPage';
import { AdminUsersPage } from '../modules/admin/presentation/pages/AdminUsersPage';
import { AdminServicesPage } from '../modules/admin/presentation/pages/AdminServicesPage';
import { AdminAppointmentsPage } from '../modules/admin/presentation/pages/AdminAppointmentsPage';
import { AdminNotificationsPage } from '../modules/admin/presentation/pages/AdminNotificationsPage';
import { AdminReportsPage } from '../modules/admin/presentation/pages/AdminReportsPage';
import { AdminAgendaPage } from '../modules/admin/presentation/pages/AdminAgendaPage';
import { AdminApprovalsPage } from '../modules/admin/presentation/pages/AdminApprovalsPage';
import { AdminTenantsPage } from '../modules/admin/presentation/pages/AdminTenantsPage';
import { useAuth } from '../shared/context/AuthContext';
import { useTenant } from '../shared/context/TenantContext';
import { LoginCard } from '../shared/components/LoginCard';
import { RegisterPage } from '../modules/auth/presentation/pages/RegisterPage';
import { PasswordRecoveryPage } from '../modules/auth/presentation/pages/PasswordRecoveryPage';
import { WaitingApprovalPage } from '../modules/auth/presentation/pages/WaitingApprovalPage';
import { ProfilePage } from '../modules/users/presentation/pages/ProfilePage';
import { ClientDashboardPage } from '../modules/client/presentation/pages/ClientDashboardPage';
import { BarberDashboardPage } from '../modules/barber/presentation/pages/BarberDashboardPage';

export function AppRouter() {
  const { user, logout } = useAuth();
  const { tenant } = useTenant();
  const isPending = Boolean(user && !user.approved && user.role !== 'GOD' && user.role !== 'ADMIN');

  return (
    <div className="app-shell">
      <a className="sr-only focus:not-sr-only" href="#content">
        Ir al contenido
      </a>
      <header className="border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="app-container flex flex-wrap items-center justify-between gap-4 py-6">
          <div>
            <p className="app-chip">{tenant?.name || 'Barberia Noir'}</p>
            <h1 className="text-3xl font-semibold">Agenda premium para barberias</h1>
            <p className="mt-2 text-sm text-zinc-300">Operaciones, citas y equipos en un solo lugar.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {user ? (
              <div className="text-right text-xs text-zinc-300">
                <p className="font-semibold text-white">{user.name || 'Usuario'}</p>
                <p className="uppercase tracking-[0.18em]">{user.role}</p>
              </div>
            ) : null}
            {user ? (
              <button className="btn-ghost" type="button" onClick={logout}>
                Cerrar sesion
              </button>
            ) : (
              <Link className="btn-secondary" to="/login">
                Iniciar sesion
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="app-container">
        <nav className="mt-6 flex flex-wrap gap-2">
          <Link className="app-navlink" to="/">
            Inicio
          </Link>
          <Link className="app-navlink" to="/about">
            Stack
          </Link>
          <Link className="app-navlink" to="/appointments">
            Citas
          </Link>
          <Link className="app-navlink" to="/register">
            Registro
          </Link>
          <Link className="app-navlink" to="/password">
            Recuperar
          </Link>
          <Link className="app-navlink" to="/profile">
            Perfil
          </Link>
          {user?.role === 'CLIENT' ? (
            <Link className="app-navlink" to="/client">
              Mi panel
            </Link>
          ) : null}
          {user?.role === 'BARBER' ? (
            <Link className="app-navlink" to="/barber">
              Mi agenda
            </Link>
          ) : null}
          {isPending ? (
            <Link className="app-navlink border-amber-300/30 text-amber-100" to="/waiting">
              En revision
            </Link>
          ) : null}
          {user?.role === 'ADMIN' || user?.role === 'GOD' ? (
            <Link className="app-navlink" to="/admin">
              Admin
            </Link>
          ) : null}
        </nav>
      </div>

      <main id="content" className="app-container py-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/password" element={<PasswordRecoveryPage />} />
          <Route path="/waiting" element={<WaitingApprovalPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/client" element={user?.role === 'CLIENT' && !isPending ? <ClientDashboardPage /> : <Navigate to={isPending ? '/waiting' : '/login'} replace />} />
          <Route path="/barber" element={user?.role === 'BARBER' && !isPending ? <BarberDashboardPage /> : <Navigate to={isPending ? '/waiting' : '/login'} replace />} />
          <Route
            path="/login"
            element={<LoginCard title="Acceso" subtitle="Usa tu cuenta para gestionar la plataforma." />}
          />
          <Route
            path="/admin"
            element={
              user?.role === 'ADMIN' || user?.role === 'GOD' ? <AdminDashboardPage /> : <Navigate to="/login" replace />
            }
          />
          <Route path="/admin/users" element={user?.role === 'ADMIN' || user?.role === 'GOD' ? <AdminUsersPage /> : <Navigate to="/login" replace />} />
          <Route path="/admin/services" element={user?.role === 'ADMIN' || user?.role === 'GOD' ? <AdminServicesPage /> : <Navigate to="/login" replace />} />
          <Route path="/admin/appointments" element={user?.role === 'ADMIN' || user?.role === 'GOD' ? <AdminAppointmentsPage /> : <Navigate to="/login" replace />} />
          <Route path="/admin/agenda" element={user?.role === 'ADMIN' || user?.role === 'GOD' ? <AdminAgendaPage /> : <Navigate to="/login" replace />} />
          <Route path="/admin/notifications" element={user?.role === 'ADMIN' || user?.role === 'GOD' ? <AdminNotificationsPage /> : <Navigate to="/login" replace />} />
          <Route path="/admin/reports" element={user?.role === 'ADMIN' || user?.role === 'GOD' ? <AdminReportsPage /> : <Navigate to="/login" replace />} />
          <Route path="/admin/approvals" element={user?.role === 'GOD' ? <AdminApprovalsPage /> : <Navigate to="/login" replace />} />
          <Route path="/admin/tenants" element={user?.role === 'GOD' ? <AdminTenantsPage /> : <Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}
