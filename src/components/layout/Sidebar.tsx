'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Star, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  ChevronLeft,
  ShoppingBag,
  Image as ImageIcon,
  MapPin
} from 'lucide-react';
import { cn } from '@/utils/cn';

const navigation = [
  { name: 'لوحة التحكم', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'الطلبات', href: '/admin/orders', icon: ShoppingBag },
  { name: 'المنتجات', href: '/admin/products', icon: Package },
  { name: 'الأقسام', href: '/admin/categories', icon: Tags },
  { name: 'البانرات', href: '/admin/banners', icon: ImageIcon },
  { name: 'إعدادات الشحن', href: '/admin/shippingrates', icon: MapPin },
  { name: 'المراجعات', href: '/admin/reviews', icon: Star },
];

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <button
        type="button"
        className="lg:hidden fixed top-3 right-3 z-50 p-2.5 bg-white rounded-xl shadow-lg text-gray-900 border border-gray-100 active:scale-95 transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-40 w-72 bg-white border-l border-gray-100 shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="flex items-center px-6 h-24 border-b border-gray-50">
            <div className="relative w-12 h-12 overflow-hidden rounded-2xl border-2 border-rose-100 shadow-lg shadow-rose-100 rotate-3 ml-4">
              <Image 
                src="/logo/logo.webp" 
                alt="Logo" 
                fill 
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none capitalize">Herodex</h1>
              <span className="text-rose-600 text-[10px] font-bold uppercase tracking-widest mt-1 block">Pharma Admin</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-5 py-4 text-base font-bold rounded-2xl transition-all duration-300 group relative',
                    isActive
                      ? 'bg-rose-50 text-rose-600'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon
                    className={cn(
                      'ml-4 h-6 w-6 transition-transform duration-300 group-hover:scale-110',
                      isActive ? 'text-rose-600' : 'text-gray-400 group-hover:text-gray-900'
                    )}
                  />
                  {item.name}
                  
                  {isActive && (
                    <motion.div 
                      layoutId="activeNav"
                      className="absolute right-0 top-2 bottom-2 w-1.5 bg-rose-600 rounded-l-full" 
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section & Logout */}
          <div className="p-4 border-t border-gray-50">
            <button
              onClick={() => dispatch(logout())}
              className="flex items-center w-full px-5 py-4 text-base font-bold text-gray-500 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all group"
            >
              <div className="p-2 bg-gray-100 rounded-xl ml-4 group-hover:bg-red-100 transition-colors">
                <LogOut className="h-5 w-5" />
              </div>
              تسجيل الخروج
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-gray-900/40 backdrop-blur-sm lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
