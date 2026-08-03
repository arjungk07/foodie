import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Tag, 
  Folders, 
  MessageSquare, 
  Megaphone,
  PlusCircle
} from 'lucide-react';

export default function Sidebar({ role }) {
  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Users & Sellers', path: '/admin/users', icon: Users },
    { name: 'Categories', path: '/admin/categories', icon: Folders },
    { name: 'All Products', path: '/admin/products', icon: Package },
    { name: 'Coupons', path: '/admin/coupons', icon: Tag },
    { name: 'Reviews Moderation', path: '/admin/reviews', icon: MessageSquare },
    { name: 'Broadcast Alert', path: '/admin/broadcast', icon: Megaphone }
  ];

  const sellerLinks = [
    { name: 'Seller Dashboard', path: '/seller', icon: LayoutDashboard },
    { name: 'My Inventory', path: '/seller/products', icon: Package },
    { name: 'Add Wholesale Product', path: '/seller/add-product', icon: PlusCircle },
    { name: 'Wholesale Orders', path: '/seller/orders', icon: ShoppingBag },
    { name: 'Customer Reviews', path: '/seller/reviews', icon: MessageSquare }
  ];

  const activeStyle = "flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-450 border-l-4 border-emerald-600";
  const inactiveStyle = "flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400";

  const links = role === 'admin' ? adminLinks : sellerLinks;

  return (
    <aside className="w-64 border-r border-slate-200 bg-white dark:border-slate-850 dark:bg-dark-card min-h-screen hidden md:block transition-colors duration-200">
      <div className="p-6">
        <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-6">
          {role === 'admin' ? 'Admin Management' : 'Seller Control Panel'}
        </h2>
        
        <nav className="flex flex-col gap-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink 
                key={link.name} 
                to={link.path} 
                end={link.path === '/admin' || link.path === '/seller'}
                className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
