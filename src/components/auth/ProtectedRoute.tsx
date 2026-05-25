import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext'; // Added useTenant
import { Role } from '../../types/index';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, role, loading, profile } = useAuth();
  const { tenant } = useTenant(); // Get current tenant
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider animate-pulse">
            Verifying Session...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Mandatory onboarding for agencies without an assigned agency node
  if (role === 'AGENCY' && !profile?.agencyId && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Enforce Agency Isolation: User must belong to the current tenant unless SUPER_ADMIN
  if (tenant && role !== 'SUPER_ADMIN') {
    if (profile?.agencyId !== tenant.id) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
