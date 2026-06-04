import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Sentry from '@sentry/react';
import './i18n';
import App from './App.tsx';
import './index.css';
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary';

const queryClient = new QueryClient();

const sentryDsn = import.meta.env.VITE_SENTRY_DSN || "";
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.VITE_APP_ENV || 'production',
    tracesSampleRate: 1.0,
    tracePropagationTargets: ["localhost", /^https:\/\/ais-dev-/, /^https:\/\/ais-pre-/]
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <GlobalErrorBoundary>
        <App />
      </GlobalErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
);
