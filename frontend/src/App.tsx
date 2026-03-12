import { AppRouter } from './app/AppRouter';
import { AuthProvider } from './shared/context/AuthContext';
import { TenantProvider } from './shared/context/TenantContext';
import { GlobalErrorBoundary } from './shared/components/GlobalErrorBoundary';
import { CookieConsentBanner } from './shared/components/CookieConsentBanner';
import { PaymentBlockedOverlay } from './shared/components/PaymentBlockedOverlay';

export default function App() {
  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <TenantProvider>
          <AppRouter />
          <CookieConsentBanner />
          {/* Muro de Pagos B2B — Se activa globalmente con 402 Payment Required */}
          <PaymentBlockedOverlay />
        </TenantProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
}
