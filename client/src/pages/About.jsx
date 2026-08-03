import React from 'react';
import { Store, ShieldCheck, Truck, Users } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs.jsx';

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      <Breadcrumbs paths={[{ label: 'About Us' }]} />
      
      <div className="text-center mt-4">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">About Foodie Wholesale</h1>
        <p className="text-xs text-slate-500 mt-2 max-w-xl mx-auto">
          We bridge the gap between regional food manufacturers, verified agricultural distributors, and corporate buyers.
        </p>
      </div>

      <div className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-slate-850 p-6 sm:p-8 rounded-3xl transition-colors text-xs leading-relaxed text-slate-600 dark:text-slate-400 mt-4 flex flex-col gap-6">
        
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Our B2B Sourcing Mission</h2>
          <p>
            Foodie Wholesale was founded to streamline wholesale sourcing operations. We provide a consolidated platform that enforces minimum order quantity (MOQ) logic to optimize pallet shipments, reduce plastic wrapping wastes, and secure the lowest possible pricing for bulk buyers, retailers, and restaurants.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
          <div className="p-4 bg-slate-50 rounded-xl dark:bg-dark-bg/40 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white">Strict Quality Verification</h4>
              <p className="text-[10px] mt-1 text-slate-500">Every bulk seller is vetted for FDA approvals, organic food handling licenses, and strict logistics timelines.</p>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl dark:bg-dark-bg/40 flex items-start gap-3">
            <Truck className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white">Optimized Freight Shipping</h4>
              <p className="text-[10px] mt-1 text-slate-500">Logistics pipelines are linked to national carriers, offering discounted LTL freight quotes directly at checkout.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Our Corporate Values</h2>
          <p>
            Transparency, efficiency, and reliability form the foundation of our services. We guarantee full support for B2B tax compliance, providing automated PDF invoices, complete customs routing documents for import/export items, and a dedicated ticket support staff to answer questions within 24 hours.
          </p>
        </div>

      </div>
    </div>
  );
}
