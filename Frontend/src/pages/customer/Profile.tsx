import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User as UserIcon, Mail, Shield, Calendar, LogOut, ShoppingCart, Package } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-steel-900 tracking-tight">Account Profile</h1>
        <p className="text-sm text-steel-500 mt-1">Manage your customer credentials and view account role status</p>
      </div>

      <div className="bg-white rounded-3xl border border-steel-200 overflow-hidden shadow-sm">
        {/* Profile Header Banner */}
        <div className="bg-gradient-to-r from-steel-800 to-steel-900 p-6 sm:p-8 text-white flex items-center space-x-5">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">{user.name}</h2>
            <p className="text-steel-300 text-sm">{user.email}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase bg-brand-500/20 text-brand-300 border border-brand-500/30">
              {user.role} Account
            </span>
          </div>
        </div>

        {/* Profile Information List */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="p-4 rounded-xl bg-steel-50 border border-steel-100 flex items-center space-x-3.5">
              <Mail className="w-5 h-5 text-steel-400" />
              <div>
                <p className="text-xs text-steel-500 font-medium">Registered Email</p>
                <p className="font-semibold text-steel-800">{user.email}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-steel-50 border border-steel-100 flex items-center space-x-3.5">
              <Shield className="w-5 h-5 text-steel-400" />
              <div>
                <p className="text-xs text-steel-500 font-medium">Account Access Role</p>
                <p className="font-semibold text-steel-800">{user.role}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-steel-50 border border-steel-100 flex items-center space-x-3.5">
              <Calendar className="w-5 h-5 text-steel-400" />
              <div>
                <p className="text-xs text-steel-500 font-medium">Account Active</p>
                <p className="font-semibold text-emerald-600">Active & Verified</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-steel-50 border border-steel-100 flex items-center space-x-3.5">
              <Package className="w-5 h-5 text-steel-400" />
              <div>
                <p className="text-xs text-steel-500 font-medium">Hardware Orders</p>
                <p className="font-semibold text-steel-800">Direct Checkout Ready</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-steel-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Link
                to="/cart"
                className="inline-flex items-center px-4 py-2.5 rounded-xl bg-steel-100 hover:bg-steel-200 text-steel-800 font-semibold text-sm transition"
              >
                <ShoppingCart className="w-4 h-4 mr-2 text-steel-600" />
                View Cart
              </Link>
              {isAdmin() && (
                <Link
                  to="/admin"
                  className="inline-flex items-center px-4 py-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-sm transition"
                >
                  Go to Admin Panel
                </Link>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm transition"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
