import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    const sentryDsn = (import.meta as any).env?.VITE_SENTRY_DSN;
    if (sentryDsn) {
      Sentry.captureException(error, { extra: { errorInfo } });
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center text-slate-300 font-mono">
          <div className="max-w-xl w-full bg-slate-900 border border-red-500/30 p-8 rounded shadow-2xl">
            <h1 className="text-xl font-bold text-red-500 mb-4 uppercase tracking-widest border-b border-red-500/20 pb-4">
              System Failure
            </h1>
            <p className="mb-6 text-sm text-slate-400">
              The application encountered an unrecoverable rendering error.
            </p>
            <div className="bg-slate-950 p-4 rounded text-left overflow-auto text-xs text-red-400 font-mono border border-slate-800 h-32 mb-6">
              {this.state.error?.message || "Unknown rendering error."}
            </div>
            <button
              className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-wider text-xs font-bold transition-all"
              onClick={() => window.location.reload()}
            >
              System Reboot
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
