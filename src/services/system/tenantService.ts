import { Agency } from '../../types';

let cachedTenant: Agency | null = null;

const fallbackAgency: Agency = {
  id: 'fallback-agency-static',
  name: 'NexusCore Network',
  slug: 'nexuscore',
  domain: 'localhost',
  primaryColor: '#10b981',
  theme: {
    primary: '#10b981',
    secondary: '#00af87',
    accent: '#8b5cf6'
  }
};

export const tenantService = {
  /**
   * Resolves an agency tenant based on current hostname / context.
   */
  async resolveTenant(hostname: string): Promise<Agency | null> {
    if (cachedTenant) {
      return cachedTenant;
    }

    try {
      const response = await fetch('/api/tenant/current', { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } });
      if (response.ok) {
        const tenant = await response.json();
        cachedTenant = tenant;
        return tenant;
      }
    } catch (error) {
      
    }

    cachedTenant = fallbackAgency;
    return fallbackAgency;
  },

  /**
   * Stub helper to mock new tenant creation on the client side
   */
  async createAgency(params: {
    ownerUid: string;
    name: string;
    slug: string;
    primaryColor: string;
  }): Promise<string> {
    return 'fallback-agency-static';
  }
};
