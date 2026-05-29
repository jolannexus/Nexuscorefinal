import React from 'react';
import { ProductCatalog } from '../modules/products/ProductCatalog';
import { OrderHistory } from '../modules/orders/OrderHistory';
import { useTranslation } from 'react-i18next';

export const ServicesPage = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-12">
      <div className="mb-0">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-4">
          {t('services.catalog')}
          <span className="text-xs bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20 tracking-wider font-bold uppercase">
            {t('services.active')}
          </span>
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          {t('services.enterpriseCatalog')}
        </p>
      </div>

      <section>
        <ProductCatalog />
      </section>

      <section className="pt-12 border-t border-slate-800">
        <OrderHistory />
      </section>
    </div>
  );
};
