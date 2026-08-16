import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home, Grid, ShoppingCart, User } from 'lucide-react';

export default function BottomNavigation() {
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);

  // If user is NOT logged in, hide bottom navigation completely
  if (!isAuthenticated ) {
    return null;
  }

  // Total quantity of items in cart
  const cartItemCount = items ? items.reduce((acc, item) => acc + (item.quantity || 1), 0) : 0;

  // Exact requested order: Home | Categories | Cart | Account
  const navItems = [
    {
      label: 'Home',
      path: '/',
      icon: Home,
    },
    {
      label: 'Categories',
      path: '/categories',
      icon: Grid,
    },
    {
      label: 'Cart',
      path: '/cart',
      icon: ShoppingCart,
      badge: cartItemCount,
    },
    {
      label: 'Account',
      path: '/account',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg bg-white/95 backdrop-blur-lg dark:bg-dark-card/95 border border-slate-200/80 dark:border-slate-800 shadow-xl rounded-full px-3 py-2 transition-all duration-300 animate-fadeIn">
      <div className="grid grid-cols-4 items-center justify-items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-[#0B542F] dark:text-emerald-400 font-extrabold scale-105'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />

                {/* Dynamic Cart Badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-foodie-orange text-white text-[10px] font-black h-4 min-w-4 px-1 rounded-full flex items-center justify-center border-2 border-white dark:border-dark-card shadow-xs animate-pulse">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] tracking-tight mt-0.5 select-none">
                {item.label}
              </span>

              {/* Active Tab Pill Indicator */}
              {isActive && (
                <span className="absolute -bottom-1 h-1 w-5 rounded-full bg-[#0B542F] dark:bg-emerald-400 animate-fadeIn" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
