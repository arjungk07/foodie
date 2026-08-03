import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs.jsx';

export default function FAQ() {
  const faqs = [
    {
      q: "What is Minimum Order Quantity (MOQ)?",
      a: "Minimum Order Quantity is the lowest number of units a seller is willing to sell in a single order to qualify for wholesale pricing. On our platform, we enforce MOQ rules at checkout to ensure freight logistics configurations remain optimal."
    },
    {
      q: "How are wholesale vs. retail prices determined?",
      a: "Retail prices apply when buying smaller sample sizes. When your cart item quantity meets or exceeds the product's listed MOQ, our system automatically recalculates the item total using the lower wholesale rate."
    },
    {
      q: "Do you offer free freight shipping?",
      a: "Yes, standard parcel and freight shipping charges are waived for all B2B orders with subtotals exceeding $500. For orders below this threshold, a flat $50 logistics fee applies."
    },
    {
      q: "Can I request custom product samples before buying in bulk?",
      a: "Yes! You can contact the seller directly using the contact forms on the product detail pages to negotiate sample shipping, customize packaging labels, or request custom branding."
    },
    {
      q: "How can I download a corporate tax invoice?",
      a: "Go to your Account Profile, select the 'Order Sourcing Logs' tab, and click 'View Invoice & Track'. You can print or download the generated tax invoice containing VAT references."
    }
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      
      <Breadcrumbs paths={[{ label: 'FAQ / Sourcing Help' }]} />

      <div className="text-center mt-4">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <HelpCircle className="h-7 w-7 text-emerald-500" />
          <span>Sourcing Help Center</span>
        </h1>
        <p className="text-xs text-slate-500 mt-2">
          Get answers to B2B sourcing rules, freight shipping, and seller regulations.
        </p>
      </div>

      <div className="flex flex-col gap-3 mt-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-slate-850 rounded-2xl overflow-hidden transition-all duration-250 shadow-sm"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-5 py-4 flex justify-between items-center text-left text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-white cursor-pointer"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp className="h-4 w-4 text-emerald-500" /> : <ChevronDown className="h-4 w-4 text-slate-450" />}
              </button>
              
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-850">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
