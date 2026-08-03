import React from 'react';
import Breadcrumbs from '../components/Breadcrumbs.jsx';

export default function Privacy() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      
      <Breadcrumbs paths={[{ label: 'Privacy Policy' }]} />

      <h1 className="text-2xl font-black mt-4">Privacy Policy</h1>
      
      <div className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-slate-850 p-6 sm:p-8 rounded-3xl transition-colors text-xs leading-relaxed text-slate-650 dark:text-slate-400 flex flex-col gap-6">
        
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-2">1. Data Collection</h2>
          <p>
            We collect company registry numbers, business emails, billing addresses, and payment histories to facilitate secure B2B transactions.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-2">2. How We Share Information</h2>
          <p>
            Information is only shared between the verified buyer and seller involved in a transaction, and with third-party logistics/payment providers like Stripe to complete order fulfillment.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-2">3. Data Retention</h2>
          <p>
            Tax invoices and order history logs are retained indefinitely to comply with federal tax laws and corporate accounting audit schedules.
          </p>
        </div>

      </div>
    </div>
  );
}
