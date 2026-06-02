// Global diagnostics tracking utility
if (typeof window !== 'undefined') {
  (window as any).__renderCountMap = (window as any).__renderCountMap || {};
  (window as any).__tenantResolutions = (window as any).__tenantResolutions || 0;
}

const logger = {
  info: (msg: string, style?: string) => {
    if (style) {
      if ((import.meta as any).env.DEV) {
      if ((import.meta as any).env.DEV) console.info(msg, style);
    }
    } else {
      if ((import.meta as any).env.DEV) {
      if ((import.meta as any).env.DEV) console.info(msg);
    }
    }
  }
};

export const diagnostics = {
  /**
   * Safe increment for render counts with console output throttled.
   */
  logRender(componentName: string) {
    if (typeof window === 'undefined') return;
    const map = (window as any).__renderCountMap;
    map[componentName] = (map[componentName] || 0) + 1;
    
    // Log message on every 5 renders to avoid console spam but remain visible
    if (map[componentName] % 5 === 0 || map[componentName] <= 3) {
      logger.info(
        `%c[DIAGNOSTIC] ${componentName} rendered ${map[componentName]} times`, 
        'color: #8b5cf6; font-weight: bold;'
      );
    }
  },

  /**
   * Tracks and increments Tenant Resolution count.
   */
  incrementTenantResolve(hostname: string) {
    if (typeof window === 'undefined') return;
    (window as any).__tenantResolutions++;
    const count = (window as any).__tenantResolutions;
    logger.info(
      `%c[DIAGNOSTIC: TENANT] #${count} - Resolving tenant for ${hostname}`,
      'color: #10b981; font-weight: bold;'
    );
  },

  /**
   * Snapshot performance metrics.
   */
  getSnapshot() {
    if (typeof window === 'undefined') return { renderCountMap: {}, tenantResolutions: 0 };
    return {
      renderCountMap: { ...(window as any).__renderCountMap },
      tenantResolutions: (window as any).__tenantResolutions,
    };
  }
};
