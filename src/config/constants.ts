import { Permissions, Role } from '../types/index';

export const PERMISSIONS: Record<Role, Permissions> = {
  SUPER_ADMIN: {
    canEditCatalog: true,
    canViewProfits: true,
    canManageDomains: true,
    canViewFraud: true,
    canUseTerminal: true,
    canManageSuppliers: true,
    canViewGrowth: true,
  },
  AGENCY: {
    canEditCatalog: true,
    canViewProfits: true,
    canManageDomains: true,
    canViewFraud: false,
    canUseTerminal: false,
    canManageSuppliers: true,
    canViewGrowth: true,
  },
  RESELLER: {
    canEditCatalog: false,
    canViewProfits: false,
    canManageDomains: false,
    canViewFraud: false,
    canUseTerminal: false,
    canManageSuppliers: false,
    canViewGrowth: false,
  },
  PLATFORM_ADMIN: {
    canEditCatalog: true,
    canViewProfits: true,
    canManageDomains: true,
    canViewFraud: true,
    canUseTerminal: true,
    canManageSuppliers: true,
    canViewGrowth: true,
  },
  AGENCY_ADMIN: {
    canEditCatalog: true,
    canViewProfits: true,
    canManageDomains: true,
    canViewFraud: false,
    canUseTerminal: false,
    canManageSuppliers: true,
    canViewGrowth: true,
  },
  CUSTOMER: {
    canEditCatalog: false,
    canViewProfits: false,
    canManageDomains: false,
    canViewFraud: false,
    canUseTerminal: false,
    canManageSuppliers: false,
    canViewGrowth: false,
  }
};

export const MARGIN_DATA = [
  { name: 'Supplier Cost', value: 75, color: '#334155' },
  { name: 'Agency Profit', value: 15, color: '#3b82f6' },
  { name: 'Reseller Cut', value: 8, color: '#10b981' },
  { name: 'Taxes', value: 2, color: '#f59e0b' },
];

export const APP_CONFIG = {
  USE_MOCK_MODE: false, 
  API_FALLBACK_URL: 'https://api.nexuscore.io',
};
