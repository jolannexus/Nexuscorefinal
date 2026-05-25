import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Agency } from '../types';
import { tenantService } from '../services/system/tenantService';
import { diagnostics } from '../utils/diagnostics';

interface TenantContextType {
  tenant: Agency | null;
  isLoading: boolean;
  isNotFound: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  diagnostics.logRender('TenantProvider');
  const [tenant, setTenant] = useState<Agency | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    const resolve = async () => {
      try {
        const hostname = window.location.hostname;
        const resolved = await tenantService.resolveTenant(hostname);
        
        if (resolved) {
          setTenant(resolved);
          updateBranding(resolved);
        } else {
          // If it's the root domain, we might not have a tenant
          // For a white-label SaaS, usually every subdomain is a tenant.
          // Don't trigger for localhost or Cloud Run preview URLs
          setIsNotFound(
            hostname.includes('.') && 
            !hostname.includes('localhost') && 
            !hostname.includes('.run.app') &&
            !hostname.includes('googleusercontent.com')
          );
        }
      } catch (error) {
        console.error('Resilient safety trap: failed resolving tenant context:', error);
        setIsNotFound(false);
      } finally {
        setIsLoading(false);
      }
    };

    resolve();
  }, []);

  const updateBranding = (agency: Agency) => {
    const root = document.documentElement;
    if (agency.theme) {
      root.style.setProperty('--v-primary', agency.theme.primary);
      root.style.setProperty('--v-primary-dark', agency.theme.secondary); // reusing secondary for dark primary variant for now
      root.style.setProperty('--v-secondary', agency.theme.secondary || '#10b981');
      root.style.setProperty('--v-accent', agency.theme.accent || '#06b6d4');
    } else if (agency.primaryColor) {
      // Fallback for older agency docs
      root.style.setProperty('--v-primary', agency.primaryColor);
    }
    document.title = agency.name || 'NexusCore';
  };

  // Memoize value to prevent downstream component re-renders unless values strictly change
  const value = useMemo(() => ({
    tenant,
    isLoading,
    isNotFound
  }), [tenant, isLoading, isNotFound]);

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
