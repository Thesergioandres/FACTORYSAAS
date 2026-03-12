import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider
} from 'react-router-dom';
import { Suspense, lazy, useMemo, type ReactElement } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../shared/context/AuthContext';
import { useTenant } from '../shared/context/TenantContext';
import { LoginCard } from '../shared/components/LoginCard';
import { EssencePulseLoader } from '../shared/components/EssencePulseLoader';
import { RoleGuard } from '../shared/components/RoleGuard';
import { ModuleGuard } from '../shared/components/ModuleGuard';
import { moduleRegistry } from '../shared/constants/moduleRegistry';
import { VERTICALS_REGISTRY } from '../shared/constants/verticalsRegistry';
import { resolveHostContext } from '../shared/utils/host';

const WaitingApprovalPage = lazy(() => import('../modules/auth/presentation/pages/WaitingApprovalPage').then((mod) => ({
  default: mod.WaitingApprovalPage
})));
const BookingEnginePage = lazy(() => import('../modules/client/BookingEnginePage').then((mod) => ({
  default: mod.BookingEnginePage
})));
const StorefrontPage = lazy(() => import('../modules/client/StorefrontPage').then((mod) => ({
  default: mod.StorefrontPage
})));
const TenantLandingSwitch = lazy(() => import('../modules/client/TenantLandingSwitch').then((mod) => ({
  default: mod.TenantLandingSwitch
})));
const LandingPage = lazy(() => import('../modules/landing/LandingPage').then((mod) => ({
  default: mod.LandingPage
})));
const AllIndustriesPage = lazy(() => import('../modules/landing/AllIndustriesPage').then((mod) => ({
  default: mod.AllIndustriesPage
})));
const BarberiasLandingPage = lazy(() => import('../modules/landing/BarberiasLandingPage').then((mod) => ({
  default: mod.BarberiasLandingPage
})));
const BarberiasClientLoginPage = lazy(() => import('../modules/landing/BarberiasClientLoginPage').then((mod) => ({
  default: mod.BarberiasClientLoginPage
})));
const VerticalLandingPage = lazy(() => import('../modules/landing/VerticalLandingPage').then((mod) => ({
  default: mod.VerticalLandingPage
})));
const VerticalNotFoundPage = lazy(() => import('../modules/landing/VerticalNotFoundPage').then((mod) => ({
  default: mod.VerticalNotFoundPage
})));
const BarbershopLandingPage = lazy(() => import('../modules/landing/presentation/pages/BarbershopLandingPage').then((mod) => ({
  default: mod.BarbershopLandingPage
})));
const AdminHomePage = lazy(() => import('../modules/admin/pages/AdminHomePage').then((mod) => ({
  default: mod.AdminHomePage
})));
const AdminTenantsPage = lazy(() => import('../modules/admin/presentation/pages/AdminTenantsPage').then((mod) => ({
  default: mod.AdminTenantsPage
})));
const AdminUsersPage = lazy(() => import('../modules/admin/presentation/pages/AdminUsersPage').then((mod) => ({
  default: mod.AdminUsersPage
})));
const AdminApprovalsPage = lazy(() => import('../modules/admin/presentation/pages/AdminApprovalsPage').then((mod) => ({
  default: mod.AdminApprovalsPage
})));
const AdminSystemPage = lazy(() => import('../modules/admin/pages/AdminSystemPage').then((mod) => ({
  default: mod.AdminSystemPage
})));
const GodDashboardPage = lazy(() => import('../modules/god/GodDashboardPage').then((mod) => ({
  default: mod.GodDashboardPage
})));
const LicenseExpiredPage = lazy(() => import('../modules/admin/presentation/pages/LicenseExpiredPage').then((mod) => ({
  default: mod.LicenseExpiredPage
})));
const OnboardingPendingPage = lazy(() => import('../modules/admin/presentation/pages/OnboardingPendingPage').then((mod) => ({
  default: mod.OnboardingPendingPage
})));
const CreateTenantPage = lazy(() => import('../modules/onboarding/CreateTenantPage').then((mod) => ({
  default: mod.CreateTenantPage
})));
const OnboardingWizard = lazy(() => import('../modules/onboarding/OnboardingWizard').then((mod) => ({
  default: mod.OnboardingWizard
})));
const PublicTenantLanding = lazy(() => import('../modules/landing/PublicTenantLanding').then((mod) => ({
  default: mod.PublicTenantLanding
})));
const TermsAndConditions = lazy(() => import('../modules/legal/pages/TermsAndConditions').then((mod) => ({
  default: mod.TermsAndConditions
})));
const PrivacyPolicy = lazy(() => import('../modules/legal/pages/PrivacyPolicy').then((mod) => ({
  default: mod.PrivacyPolicy
})));
const DataTreatmentPolicy = lazy(() => import('../modules/legal/pages/DataTreatmentPolicy').then((mod) => ({
  default: mod.DataTreatmentPolicy
})));
const CookiePolicy = lazy(() => import('../modules/legal/pages/CookiePolicy').then((mod) => ({
  default: mod.CookiePolicy
})));
const SaaSAgreement = lazy(() => import('../modules/legal/pages/SaaSAgreement').then((mod) => ({
  default: mod.SaaSAgreement
})));
const DataProcessingAgreement = lazy(() => import('../modules/legal/pages/DataProcessingAgreement').then((mod) => ({
  default: mod.DataProcessingAgreement
})));
const AppLayout = lazy(() => import('../shared/layouts/AppLayout').then((mod) => ({
  default: mod.AppLayout
})));
const BookingLayout = lazy(() => import('../shared/layouts/BookingLayout').then((mod) => ({
  default: mod.BookingLayout
})));
const LandingLayout = lazy(() => import('../shared/layouts/LandingLayout').then((mod) => ({
  default: mod.LandingLayout
})));

const RouteLoader = () => (
  <div className="app-card flex items-center justify-center">
    <div
      className="h-2 w-24 animate-pulse rounded-full"
      style={{
        background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
        boxShadow: '0 0 14px var(--glow-primary)'
      }}
    />
  </div>
);

export function AppRouter() {
  const { user } = useAuth();
  const hostContext = resolveHostContext(window.location.hostname, window.location.pathname);
  const isGod = user?.role === 'GOD';
  const defaultAppPath = user
    ? user.role === 'GOD'
      ? '/god'
      : user.role === 'OWNER'
        ? '/admin'
        : user.role === 'ADMIN'
        ? '/admin'
        : user.role === 'STAFF'
          ? '/staff/dashboard'
          : '/login'
    : '/login';

  const router = useMemo(() => {
    const PanelStatusGuard = ({ children }: { children: ReactElement }) => {
      const { tenant, loading } = useTenant();
      const location = useLocation();
      const role = user?.role;

      if (role !== 'ADMIN' && role !== 'OWNER' && role !== 'STAFF') {
        return children;
      }

      if (loading) {
        return <div className="app-card">Cargando entorno...</div>;
      }

      if (role === 'STAFF') {
        const blocked = ['settings', 'billing', 'admin-home'];
        const pathname = location.pathname.toLowerCase();
        if (blocked.some((segment) => pathname.includes(segment))) {
          return <Navigate to="/" replace />;
        }
      }

      if (tenant?.status === 'suspended') {
        return <Navigate to="/license-expired" replace state={{ from: location.pathname }} />;
      }

      if (tenant?.status === 'onboarding') {
        return <Navigate to="/onboarding-pending" replace state={{ from: location.pathname }} />;
      }

      return children;
    };
    const staffAllowedModules = new Set(['agenda', 'inventory', 'pos', 'tables', 'kitchen_display']);
    const moduleRoutes = Object.values(moduleRegistry).flatMap((module) => {
      if (isGod) {
        return [];
      }
      const staffAllowed = staffAllowedModules.has(module.key);
      const routes: Array<{ key: string; path: string; element: ReactElement }> = [];
      if (module.adminPath && module.adminElement) {
        routes.push({
          key: `${module.key}-admin`,
          path: module.adminPath,
          element: (
            <RoleGuard allow={staffAllowed ? ['ADMIN', 'OWNER', 'GOD', 'STAFF'] : ['ADMIN', 'OWNER', 'GOD']}>
              <ModuleGuard allow={[module.key]}>
                <Suspense fallback={<div className="app-card">Cargando modulo...</div>}>
                  {module.adminElement}
                </Suspense>
              </ModuleGuard>
            </RoleGuard>
          )
        });
      }
      if (module.staffPath && module.staffElement) {
        routes.push({
          key: `${module.key}-staff`,
          path: module.staffPath,
          element: (
            <RoleGuard allow={['STAFF', 'ADMIN', 'OWNER', 'GOD']}>
              <ModuleGuard allow={[module.key]}>
                <Suspense fallback={<div className="app-card">Cargando modulo...</div>}>
                  {module.staffElement}
                </Suspense>
              </ModuleGuard>
            </RoleGuard>
          )
        });
      }
      return routes;
    });

    const tenantRoutes = createRoutesFromElements(
      <Route element={
        <Suspense fallback={<RouteLoader />}>
          <BookingLayout />
        </Suspense>
      }>
        <Route index element={
          <Suspense fallback={<RouteLoader />}>
            <TenantLandingSwitch />
          </Suspense>
        } />
        <Route path="/booking" element={
          <Suspense fallback={<RouteLoader />}>
            <BookingEnginePage />
          </Suspense>
        } />
        <Route path="/storefront" element={
          <Suspense fallback={<RouteLoader />}>
            <StorefrontPage />
          </Suspense>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    );

    const appRoutes = createRoutesFromElements(
      <>
        <Route path="/login" element={
          <div className="app-container flex min-h-[70vh] items-center justify-center py-12">
            <LoginCard
              title="Acceso"
              subtitle="Usa tu cuenta para gestionar la plataforma."
              allowedRoles={['ADMIN', 'OWNER', 'STAFF', 'GOD']}
            />
          </div>
        } />
        <Route path="/waiting" element={
          <Suspense fallback={<RouteLoader />}>
            <WaitingApprovalPage />
          </Suspense>
        } />
        <Route path="/onboarding" element={
          <Suspense fallback={<RouteLoader />}>
            <OnboardingWizard />
          </Suspense>
        } />
        <Route path="/onboarding/create" element={
          <Suspense fallback={<RouteLoader />}>
            <CreateTenantPage />
          </Suspense>
        } />
        <Route element={
          <PanelStatusGuard>
            <Suspense fallback={<RouteLoader />}>
              <AppLayout />
            </Suspense>
          </PanelStatusGuard>
        }>
          <Route index element={<Navigate to={defaultAppPath} replace />} />
          <Route
            path="/admin"
            element={
              <RoleGuard allow={['ADMIN', 'OWNER', 'GOD']}>
                <Suspense fallback={<RouteLoader />}>
                  <AdminHomePage />
                </Suspense>
              </RoleGuard>
            }
          />
          <Route
            path="/admin/tenants"
            element={
              <RoleGuard allow={['GOD']}>
                <Suspense fallback={<RouteLoader />}>
                  <AdminTenantsPage />
                </Suspense>
              </RoleGuard>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RoleGuard allow={['GOD']}>
                <Suspense fallback={<RouteLoader />}>
                  <AdminUsersPage />
                </Suspense>
              </RoleGuard>
            }
          />
          <Route
            path="/admin/approvals"
            element={
              <RoleGuard allow={['GOD']}>
                <Suspense fallback={<RouteLoader />}>
                  <AdminApprovalsPage />
                </Suspense>
              </RoleGuard>
            }
          />
          <Route
            path="/admin/system"
            element={
              <RoleGuard allow={['GOD']}>
                <Suspense fallback={<RouteLoader />}>
                  <AdminSystemPage />
                </Suspense>
              </RoleGuard>
            }
          />
          <Route
            path="/staff"
            element={<Navigate to="/staff/dashboard" replace />}
          />
          {moduleRoutes.map((route) => (
            <Route key={route.key} path={route.path} element={route.element} />
          ))}
          <Route
            path="/god"
            element={
              <RoleGuard allow={['GOD']}>
                <Suspense fallback={<RouteLoader />}>
                  <GodDashboardPage />
                </Suspense>
              </RoleGuard>
            }
          />
        </Route>
        <Route path="/license-expired" element={
          <Suspense fallback={<RouteLoader />}>
            <LicenseExpiredPage />
          </Suspense>
        } />
        <Route path="/onboarding-pending" element={
          <Suspense fallback={<RouteLoader />}>
            <OnboardingPendingPage />
          </Suspense>
        } />
        <Route path="/legal/terms" element={
          <Suspense fallback={<RouteLoader />}>
            <TermsAndConditions />
          </Suspense>
        } />
        <Route path="/legal/privacy" element={
          <Suspense fallback={<RouteLoader />}>
            <PrivacyPolicy />
          </Suspense>
        } />
        <Route path="/legal/ptd" element={
          <Suspense fallback={<RouteLoader />}>
            <DataTreatmentPolicy />
          </Suspense>
        } />
        <Route path="/legal/cookies" element={
          <Suspense fallback={<RouteLoader />}>
            <CookiePolicy />
          </Suspense>
        } />
        <Route path="/legal/saas" element={
          <Suspense fallback={<RouteLoader />}>
            <SaaSAgreement />
          </Suspense>
        } />
        <Route path="/legal/dpa" element={
          <Suspense fallback={<RouteLoader />}>
            <DataProcessingAgreement />
          </Suspense>
        } />
        <Route path="*" element={<Navigate to={defaultAppPath} replace />} />
      </>
    );

    const landingRoutes = createRoutesFromElements(
      <Route element={
        <Suspense fallback={<RouteLoader />}>
          <LandingLayout />
        </Suspense>
      }>
        <Route index element={
          <Suspense fallback={<RouteLoader />}>
            <LandingPage />
          </Suspense>
        } />
        <Route path="/industries" element={
          <Suspense fallback={<RouteLoader />}>
            <AllIndustriesPage />
          </Suspense>
        } />
        <Route path="/landing/:slug" element={
          <Suspense fallback={<RouteLoader />}>
            <VerticalLandingPage />
          </Suspense>
        } />
        {VERTICALS_REGISTRY.map((vertical) => (
          <Route
            key={vertical.slug}
            path={`/${vertical.slug}`}
            element={
              <Suspense fallback={<RouteLoader />}>
                <VerticalLandingPage />
              </Suspense>
            }
          />
        ))}
        <Route path="/404" element={
          <Suspense fallback={<RouteLoader />}>
            <VerticalNotFoundPage />
          </Suspense>
        } />
        <Route path="/:verticalId" element={
          <Suspense fallback={<RouteLoader />}>
            <VerticalLandingPage />
          </Suspense>
        } />
        <Route path="/barberias" element={
          <Suspense fallback={<RouteLoader />}>
            <BarbershopLandingPage />
          </Suspense>
        } />
        <Route path="/barberias-landing" element={
          <Suspense fallback={<RouteLoader />}>
            <BarberiasLandingPage />
          </Suspense>
        } />
        <Route path="/waiting" element={
          <Suspense fallback={<RouteLoader />}>
            <WaitingApprovalPage />
          </Suspense>
        } />
        <Route path="/barberias-landing" element={
          <Suspense fallback={<RouteLoader />}>
            <BarberiasLandingPage />
          </Suspense>
        } />
        <Route path="/barberias-login" element={
          <LoginCard
            title="Acceso barberias"
            subtitle="Login para duenos y staff."
            allowedRoles={['ADMIN', 'OWNER', 'STAFF']}
          />
        } />
        <Route path="/barberias-client-login" element={
          <Suspense fallback={<RouteLoader />}>
            <BarberiasClientLoginPage />
          </Suspense>
        } />
        <Route path="/admin-login" element={
          <LoginCard
            title="Login administradores"
            subtitle="Acceso exclusivo para GOD."
            allowedRoles={['GOD']}
            redirectTo="/god"
          />
        } />
        <Route path="/onboarding" element={
          <Suspense fallback={<RouteLoader />}>
            <OnboardingWizard />
          </Suspense>
        } />
        <Route path="/onboarding/create" element={
          <Suspense fallback={<RouteLoader />}>
            <CreateTenantPage />
          </Suspense>
        } />
        <Route path="/:verticalSlug/:tenantSlug" element={
          <Suspense fallback={<RouteLoader />}>
            <PublicTenantLanding />
          </Suspense>
        } />
        <Route path="/legal/terms" element={
          <Suspense fallback={<RouteLoader />}>
            <TermsAndConditions />
          </Suspense>
        } />
        <Route path="/legal/privacy" element={
          <Suspense fallback={<RouteLoader />}>
            <PrivacyPolicy />
          </Suspense>
        } />
        <Route path="/legal/ptd" element={
          <Suspense fallback={<RouteLoader />}>
            <DataTreatmentPolicy />
          </Suspense>
        } />
        <Route path="/legal/cookies" element={
          <Suspense fallback={<RouteLoader />}>
            <CookiePolicy />
          </Suspense>
        } />
        <Route path="/legal/saas" element={
          <Suspense fallback={<RouteLoader />}>
            <SaaSAgreement />
          </Suspense>
        } />
        <Route path="/legal/dpa" element={
          <Suspense fallback={<RouteLoader />}>
            <DataProcessingAgreement />
          </Suspense>
        } />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    );

    if (hostContext.mode === 'tenant') {
      return createBrowserRouter(tenantRoutes);
    }

    if (hostContext.mode === 'app') {
      return createBrowserRouter(appRoutes);
    }

    return createBrowserRouter(landingRoutes);
  }, [hostContext.mode, defaultAppPath, isGod]);

  return (
    <Suspense fallback={<EssencePulseLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
