import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wrench, Lock, Mail, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      const user = await login({ email, password });
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate(from === '/login' ? '/' : from);
      }
    } catch {
      // Error handled by store
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-steel-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand */}
        <Link to="/" className="flex items-center justify-center space-x-2.5 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-600/25 group-hover:scale-105 transition">
            <Wrench className="w-6 h-6 -rotate-45" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-steel-900">
            Mini<span className="text-brand-600">Hardware</span>
          </span>
        </Link>

        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-steel-900 tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-steel-500">
          Sign in to manage your hardware cart and orders
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-xl shadow-steel-200/50 border border-steel-200">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-sm text-red-700 animate-in fade-in duration-150">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-steel-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-steel-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-steel-50 border border-steel-200 rounded-xl text-sm text-steel-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-steel-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-steel-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-steel-50 border border-steel-200 rounded-xl text-sm text-steel-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-sm transition active:scale-[0.99] disabled:opacity-50"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials helper */}
          <div className="mt-8 pt-6 border-t border-steel-100">
            <p className="text-xs font-bold text-steel-500 uppercase tracking-wider mb-3 flex items-center">
              <KeyRound className="w-3.5 h-3.5 mr-1.5 text-steel-400" />
              Quick Demo Fill
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@minihardware.com', 'Admin123!')}
                className="p-2.5 rounded-xl border border-steel-200 hover:border-brand-500 hover:bg-brand-50 text-steel-700 font-medium text-left transition"
              >
                <div className="font-bold text-steel-900">Admin Account</div>
                <div className="text-[11px] text-steel-500 truncate">admin@minihardware.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('customer@test.com', 'CustomerPass123!')}
                className="p-2.5 rounded-xl border border-steel-200 hover:border-brand-500 hover:bg-brand-50 text-steel-700 font-medium text-left transition"
              >
                <div className="font-bold text-steel-900">Customer Account</div>
                <div className="text-[11px] text-steel-500 truncate">customer@test.com</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-steel-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700 transition">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
