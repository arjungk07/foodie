import React from 'react';
import Breadcrumbs from '../components/Breadcrumbs.jsx';

export default function Terms() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      
      <Breadcrumbs paths={[{ label: 'Terms & Conditions' }]} />

      <h1 className="text-2xl font-black mt-4">Terms & Conditions of Sourcing</h1>
      
      <div className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-slate-850 p-6 sm:p-8 rounded-3xl transition-colors text-xs leading-relaxed text-slate-600 dark:text-slate-400 flex flex-col gap-6">
        
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-2">1. Agreement to B2B Sourcing Terms</h2>
          <p>
            By registering a business account or using the Foodie Wholesale sourcing services, you agree to comply with our commercial terms. We operate exclusively as a B2B platform. Sourcing offers are intended for commercial resell, restaurant food preparation, or distribution, rather than individual household consumption.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-2">2. Minimum Order Quantity (MOQ) Compliance</h2>
          <p>
            Sellers define minimum order limits on our platform. Sourcing orders will not be processed at wholesale rates unless the quantities meet these MOQ requirements. Custom modifications to MOQ sizes must be requested directly from the distributor before submitting orders.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-2">3. Payments, Taxes, and Custom Invoices</h2>
          <p>
            All platform payments are processed securely via Stripe or registered Cash on Delivery. Corporate buyers are responsible for providing correct VAT registration IDs and corporate entity titles during profile registration. Sourcing tax invoices are generated automatically and cannot be modified once payment is confirmed.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-2">4. Cargo Shipping and Logistics</h2>
          <p>
            Freight logistics, custom border checks (for imported ingredients), and palletized shipping configurations are managed by the seller's designated logistics carriers. Foodie Wholesale is not responsible for shipping delays caused by weather, maritime customs processing times, or incorrect warehouse delivery instructions.
          </p>
        </div>

      </div>
    </div>
  );
}
