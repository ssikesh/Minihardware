import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Wrench,
  ShoppingCart,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Search,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, isAdmin } = useAuthStore();
  const { getItemCount } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const cartCount = getItemCount();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Categories', path: '/categories' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-steel-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-600/20 group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5 -rotate-45" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-steel-900 group-hover:text-brand-600 transition">
                  Mini<span className="text-brand-600">Hardware</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-steel-400 -mt-1">
                  Precision Metal Supplies
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive(link.path)
                      ? 'text-brand-600 bg-brand-50'
                      : 'text-steel-600 hover:text-steel-900 hover:bg-steel-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3">
            {/* Quick Search Shortcut */}
            <Link
              to="/products"
              className="p-2 rounded-xl text-steel-500 hover:text-steel-900 hover:bg-steel-100 transition"
              title="Search products"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-steel-700 hover:text-brand-600 hover:bg-brand-50 transition"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white font-bold text-[11px] h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account / Profile Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 py-1.5 px-3 rounded-xl border border-steel-200 hover:border-steel-300 hover:bg-steel-50 transition text-sm font-medium text-steel-700"
                >
                  <div className="w-7 h-7 rounded-full bg-steel-200 text-steel-700 flex items-center justify-center font-bold text-xs uppercase">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user?.name}</span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-steel-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-steel-100">
                      <p className="text-xs font-semibold text-steel-900 truncate">{user?.name}</p>
                      <p className="text-xs text-steel-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-steel-100 text-steel-600">
                        {user?.role}
                      </span>
                    </div>

                    {isAdmin() && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-brand-600 hover:bg-brand-50 font-semibold transition"
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-steel-700 hover:bg-steel-50 transition"
                    >
                      <UserIcon className="w-4 h-4 mr-2 text-steel-400" />
                      My Profile
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition text-left"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-sm font-semibold text-steel-700 hover:text-steel-900 hover:bg-steel-50 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex px-3.5 py-2 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-steel-600 hover:text-steel-900 hover:bg-steel-100 md:hidden transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-steel-100 bg-white px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-medium transition ${
                isActive(link.path)
                  ? 'text-brand-600 bg-brand-50 font-semibold'
                  : 'text-steel-600 hover:bg-steel-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {!isAuthenticated && (
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center px-4 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm mt-3"
            >
              Create Account
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};
