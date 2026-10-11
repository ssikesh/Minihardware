import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Boxes,
  Tags,
  Store,
  LogOut,
  Wrench,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuthStore();

  const links = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4 mr-3" />, end: true },
    { name: 'Products', path: '/admin/products', icon: <Package className="w-4 h-4 mr-3" />, end: true },
    { name: 'Add Product', path: '/admin/products/new', icon: <PlusCircle className="w-4 h-4 mr-3" /> },
    { name: 'Inventory & Stock', path: '/admin/inventory', icon: <Boxes className="w-4 h-4 mr-3" /> },
    { name: 'Categories', path: '/admin/categories', icon: <Tags className="w-4 h-4 mr-3" /> },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-steel-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-steel-900 text-steel-200 border-r border-steel-800 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-steel-800">
            <Link to="/admin" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center">
                <Wrench className="w-4 h-4 -rotate-45" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white leading-none">
                  Mini<span className="text-brand-500">Hardware</span>
                </span>
                <span className="text-[10px] font-bold text-steel-400 uppercase tracking-widest mt-0.5">
                  Admin Portal
                </span>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-steel-400 hover:text-white hover:bg-steel-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation links */}
          <div className="p-4 space-y-1">
            <p className="px-3 text-[11px] font-bold text-steel-500 uppercase tracking-wider mb-2">
              Management
            </p>
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
                      : 'text-steel-300 hover:text-white hover:bg-steel-800/60'
                  }`
                }
              >
                {link.icon}
                <span>{link.name}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Bottom links */}
        <div className="p-4 border-t border-steel-800 space-y-1">
          <Link
            to="/"
            className="flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold text-steel-300 hover:text-white hover:bg-steel-800/60 transition"
          >
            <Store className="w-4 h-4 mr-3 text-steel-400" />
            <span>Customer Store</span>
          </Link>

          <button
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="w-full flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition text-left"
          >
            <LogOut className="w-4 h-4 mr-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
