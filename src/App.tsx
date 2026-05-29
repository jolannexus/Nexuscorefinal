import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TenantProvider, useTenant } from './contexts/TenantContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

// Helper to safely load chunks, resolving "Failed to fetch dynamically imported module" errors
const getReloadCount = () => {
  try {
    const raw = sessionStorage.getItem('chunk_reload_count');
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
};

const incrementReloadCount = () => {
  try {
    const count = getReloadCount();
    sessionStorage.setItem('chunk_reload_count', (count + 1).toString());
    sessionStorage.setItem('chunk_reload_time', Date.now().toString());
  } catch {}
};

const clearReloadCount = () => {
  try {
    sessionStorage.removeItem('chunk_reload_count');
    sessionStorage.removeItem('chunk_reload_time');
  } catch {}
};

const isReloadThrottled = () => {
  try {
    const lastReload = sessionStorage.getItem('chunk_reload_time');
    if (!lastReload) return false;
    const diff = Date.now() - parseInt(lastReload, 10);
    // If we reloaded less than 15 seconds ago and count > 2, we are throttled
    return diff < 15000 && getReloadCount() > 2;
  } catch {
    return false;
  }
};

const safeLazy = (importFunction: () => Promise<any>) => 
  lazy(async () => {
    try {
      const module = await importFunction();
      clearReloadCount();
      return module;
    } catch (error: any) {
      console.error("Chunk loading failed:", error);
      
      const isChunkLoadError = 
        error?.name === 'ChunkLoadError' || 
        /Failed to fetch|dynamically imported|Loading chunk/i.test(error?.message || '');
        
      if (isChunkLoadError && !isReloadThrottled()) {
        incrementReloadCount();
        console.warn("Attempting recovery reload due to chunk load failure...");
        window.location.reload();
        return { default: () => <div /> };
      }
      
      return { 
        default: () => (
          <div className="flex flex-col items-center justify-center p-8 bg-slate-900 border border-slate-800 rounded-2xl max-w-lg mx-auto my-12 text-center font-mono text-slate-300">
            <h3 className="text-red-500 font-bold mb-2 uppercase tracking-wider text-rose-500">Loading Error</h3>
            <p className="text-xs text-slate-400 mb-4">
              We couldn't load this section of the app. This usually happens when a new version of the system has been deployed.
            </p>
            <button 
              onClick={() => {
                clearReloadCount();
                window.location.reload();
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition"
            >
              Force Check Version
            </button>
          </div>
        )
      };
    }
  });

const APP_VERSION = '1.0.0';

const Dashboard = safeLazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Suppliers = safeLazy(() => import('./pages/Suppliers').then(m => ({ default: m.Suppliers })));
const ResellersPage = safeLazy(() => import('./pages/Resellers').then(m => ({ default: m.ResellersPage })));
const ServicesPage = safeLazy(() => import('./pages/Services').then(m => ({ default: m.ServicesPage })));
const ProductDashboard = safeLazy(() => import('./pages/products/ProductDashboard').then(m => ({ default: m.ProductDashboard })));
const StreamingDatabase = safeLazy(() => import('./pages/products/StreamingDatabase').then(m => ({ default: m.StreamingDatabase })));
const GameDatabase = safeLazy(() => import('./pages/products/GameDatabase').then(m => ({ default: m.GameDatabase })));
const SystemConfigPage = safeLazy(() => import('./pages/SystemConfig').then(m => ({ default: m.SystemConfigPage })));
const OperationsCenterPage = safeLazy(() => import('./pages/OperationsCenter').then(m => ({ default: m.OperationsCenter })));
const SupportPage = safeLazy(() => import('./pages/Support').then(m => ({ default: m.SupportPage })));
const MarketingPage = safeLazy(() => import('./pages/Marketing').then(m => ({ default: m.MarketingPage })));
const BadgesPage = safeLazy(() => import('./pages/Badges').then(m => ({ default: m.BadgesPage })));
const BrandingSettings = safeLazy(() => import('./pages/BrandingSettings').then(m => ({ default: m.BrandingSettings })));
const PaymentSettings = safeLazy(() => import('./pages/PaymentSettings').then(m => ({ default: m.PaymentSettings })));
const SecurityCenter = safeLazy(() => import('./pages/SecurityCenter').then(m => ({ default: m.SecurityCenter })));
const TeamManagement = safeLazy(() => import('./pages/TeamManagement'));
const DevSettings = safeLazy(() => import('./pages/DevSettings'));
const TransactionHistoryPage = safeLazy(() => import('./pages/billing/TransactionHistory').then(m => ({ default: m.TransactionHistoryPage })));
const DepositSystemPage = safeLazy(() => import('./pages/billing/DepositSystem').then(m => ({ default: m.DepositSystemPage })));
const Login = safeLazy(() => import('./pages/auth/Login').then(m => ({ default: m.Login })));
const Register = safeLazy(() => import('./pages/auth/Register').then(m => ({ default: m.Register })));
const ForgotPassword = safeLazy(() => import('./pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const Landing = safeLazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));
const BrandIdentity = safeLazy(() => import('./pages/BrandIdentity').then(m => ({ default: m.BrandIdentity })));
const OnboardingFlow = safeLazy(() => import('./pages/onboarding/OnboardingFlow').then(m => ({ default: m.OnboardingFlow })));
const PublicStore = safeLazy(() => import('./pages/PublicStore').then(m => ({ default: m.PublicStore })));

// Loading Fallback Component
const PageLoading = () => (
  <div className="flex items-center justify-center p-8 w-full h-full min-h-[400px]">
    <div className="w-8 h-8 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin" />
  </div>
);

const AppRoutes = () => {
  const { user, loading: authLoading } = useAuth();
  const { tenant, isLoading: tenantLoading, isNotFound } = useTenant();
  const location = useLocation();

  React.useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          const data = await response.json();
          // Save server boot timestamp; if it changes unexpectedly during session, pre-emptively notify
          const activeBoot = localStorage.getItem('nexus_server_boot');
          if (activeBoot && data.timestamp && activeBoot !== data.timestamp) {
            console.log("New server deployment detected. Pre-emptive cache clear in progress...");
            localStorage.setItem('nexus_server_boot', data.timestamp);
          } else if (data.timestamp) {
            localStorage.setItem('nexus_server_boot', data.timestamp);
          }
        }
      } catch {}
    };
    checkVersion();
    const interval = setInterval(checkVersion, 300000); // Poll version every 5 mins
    return () => clearInterval(interval);
  }, []);

  if (authLoading || tenantLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider animate-pulse">
            {tenantLoading ? "Loading Workspace..." : "Verifying Session..."}
          </span>
        </div>
      </div>
    );
  }

  // Domain not resolved to any agency
  const isOnboardingSensitiveRoute = ['/login', '/register', '/forgot-password', '/onboarding'].includes(location.pathname);

  // Determine if we are on a platform domain (for preview/dev environments or root SaaS domain)
  const hostname = window.location.hostname;
  const isPlatformDomain = hostname === 'localhost' || 
                           hostname.includes('.run.app') || 
                           hostname.includes('googleusercontent.com');

  if (isNotFound && !isOnboardingSensitiveRoute) {
    return <Landing />;
  }

  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/onboarding" element={<OnboardingFlow />} />
      <Route path="/market" element={<PublicStore tenant={tenant} isLoading={tenantLoading} />} />
      <Route path="/brand-system" element={<BrandIdentity />} />
      
      <Route
        path="/"
        element={
          user ? (
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          ) : isPlatformDomain ? (
            <Landing />
          ) : tenant ? (
            <PublicStore tenant={tenant} isLoading={tenantLoading} />
          ) : (
            <Landing />
          )
        }
      />

      <Route
        path="/suppliers"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'AGENCY', 'AGENCY_SUPPLIER_ADMIN', 'AGENCY_ADMIN']}>
            <DashboardLayout>
              <Suppliers />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/resellers"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'AGENCY', 'AGENCY_ADMIN']}>
            <DashboardLayout>
              <ResellersPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/services"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'AGENCY', 'AGENCY_ADMIN']}>
            <DashboardLayout>
              <ServicesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/catalog"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'AGENCY', 'AGENCY_ADMIN']}>
            <DashboardLayout>
              <ProductDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/streaming"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'AGENCY', 'AGENCY_ADMIN']}>
            <DashboardLayout>
              <StreamingDatabase />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/games"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'AGENCY', 'AGENCY_ADMIN']}>
            <DashboardLayout>
              <GameDatabase />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/team"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'AGENCY', 'AGENCY_ADMIN']}>
            <DashboardLayout>
              <TeamManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/developer"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'AGENCY', 'AGENCY_ADMIN']}>
            <DashboardLayout>
              <DevSettings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <TransactionHistoryPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/deposit"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DepositSystemPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/badges"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <BadgesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/branding"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'AGENCY', 'AGENCY_ADMIN']}>
            <DashboardLayout>
              <BrandingSettings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/payments"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'AGENCY', 'AGENCY_ADMIN']}>
            <DashboardLayout>
              <PaymentSettings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/marketing"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'AGENCY', 'AGENCY_ADMIN']}>
            <DashboardLayout>
              <MarketingPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/security"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SecurityCenter />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/system"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PLATFORM_ADMIN']}>
            <DashboardLayout>
              <SystemConfigPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/operations"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PLATFORM_ADMIN']}>
            <DashboardLayout>
              <OperationsCenterPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/support"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SupportPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route path="/unauthorized" element={
        <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-red-500 p-8 text-center">
          <div>
            <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
            <p className="text-xs uppercase tracking-wider opacity-60">You do not have permission to access this area.</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="mt-8 px-6 py-2 border border-red-500/20 hover:bg-red-500/10 transition-all uppercase text-xs font-bold"
            >
              Return Home
            </button>
          </div>
        </div>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <TenantProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </TenantProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
