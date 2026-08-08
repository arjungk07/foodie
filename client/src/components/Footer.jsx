import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Mail, Phone, MapPin, Linkedin, Twitter, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/60 bg-white text-slate-600 dark:border-slate-850 dark:bg-dark-bg dark:text-slate-400 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-emerald-600 dark:text-emerald-500">
              <img
                src="./src/assets/logo.jpg"
                alt="Foodie logo"
                className="h-17 w-18"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(48%) sepia(90%) saturate(600%) hue-rotate(95deg)"
                }}
              />              <span className='dancing-script text-3xl md:text-4xl font-extrabold'>foodie</span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-500">
              The best place to buy groceries in bulk. Minimum order quantities (MOQ) to connect high-volume distributors with bulk retail discounts.
            </p>
            <div className="flex gap-3 text-slate-400 dark:text-slate-500 mt-2">
              {/* <Facebook className="h-4 w-4 hover:text-emerald-500 cursor-pointer" />
              <Twitter className="h-4 w-4 hover:text-emerald-500 cursor-pointer" />
              <Linkedin className="h-4 w-4 hover:text-emerald-500 cursor-pointer" /> */}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li><Link to="/about" className="hover:text-emerald-500">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-500">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-emerald-500">FAQ / Help</Link></li>
            </ul>
          </div>

          {/* Legal / Wholesale */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Policies
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li><Link to="/privacy-policy" className="hover:text-emerald-500">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-emerald-500">Terms & Conditions</Link></li>
              <li><Link to="/faq" className="hover:text-emerald-500">Foodie Faq</Link></li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Support Desk
            </h3>
            <ul className="flex flex-col gap-3 text-xs">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>arjun.gk10g2021.22@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>9095917892</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                <span>Madurai, Tamil Nadu, India</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-100 dark:border-slate-850 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
          <span>&copy; {new Date().getFullYear()} Foodie LLC. All rights reserved.</span>
          <span className="flex gap-4">
            <Link to="/privacy-policy" className="hover:underline">Privacy</Link>
            <Link to="/terms" className="hover:underline">Terms</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
