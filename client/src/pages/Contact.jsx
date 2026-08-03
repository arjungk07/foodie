import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Breadcrumbs from '../components/Breadcrumbs.jsx';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.warning('Please complete the contact form');
      return;
    }
    setSending(true);
    setTimeout(() => {
      toast.success('Your message has been dispatched to our B2B Support Desk!');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setSending(false);
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      
      <Breadcrumbs paths={[{ label: 'Contact Support' }]} />

      <div className="text-center mt-4">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Contact B2B Support</h1>
        <p className="text-xs text-slate-500 mt-2 max-w-xl mx-auto">
          Need a custom pallet quote or having trouble with tax invoices? Reach out directly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
        
        {/* Contact details */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-850 flex items-center gap-3">
            <Mail className="h-5 w-5 text-emerald-500 shrink-0" />
            <div className="text-xs">
              <h4 className="font-bold text-slate-800 dark:text-white">Email Sourcing</h4>
              <p className="text-slate-500 mt-0.5">sourcing@foodiewholesale.com</p>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-850 flex items-center gap-3">
            <Phone className="h-5 w-5 text-emerald-500 shrink-0" />
            <div className="text-xs">
              <h4 className="font-bold text-slate-800 dark:text-white">Corporate Helpdesk</h4>
              <p className="text-slate-500 mt-0.5">+1 (888) 555-0199</p>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-850 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-emerald-500 shrink-0" />
            <div className="text-xs">
              <h4 className="font-bold text-slate-800 dark:text-white">HQ Locations</h4>
              <p className="text-slate-500 mt-0.5">100 Business Parkway, NY</p>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="md:col-span-2">
          <form onSubmit={handleContactSubmit} className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-slate-850 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
              <HelpCircle className="h-4.5 w-4.5 text-emerald-500" />
              <span>Submit Sourcing Inquiry</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Company Representative</label>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Contact Email</label>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase">Inquiry Subject</label>
              <input
                type="text"
                placeholder="e.g., Bulk Pallet shipment quote for Quinoa"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase">Describe Your Sourcing Needs</label>
              <textarea
                required
                placeholder="List expected monthly quantity, packaging requirements, custom branding requests..."
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 px-5 py-2.5 text-xs font-semibold text-white w-max transition-colors mt-2 cursor-pointer"
            >
              {sending ? 'Sending message...' : 'Send Sourcing Inquiry'}
            </button>

          </form>
        </div>

      </div>

    </div>
  );
}
