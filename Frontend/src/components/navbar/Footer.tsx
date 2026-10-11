import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ShieldCheck, Truck, Headphones, RotateCcw } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-steel-900 text-steel-300 border-t border-steel-800">
      {/* Value Badges Banner */}
      <div className="border-b border-steel-800/80 bg-steel-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-steel-800 text-brand-400 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold">Fast Shipping</h4>
                <p className="text-xs text-steel-400">Same-day dispatch on stock</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-steel-800 text-brand-400 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold">Precision Grade</h4>
                <p className="text-xs text-steel-400">Industrial strength steel</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-steel-800 text-brand-400 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold">Easy Returns</h4>
                <p className="text-xs text-steel-400">30-day hassle free return</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-steel-800 text-brand-400 flex items-center justify-center flex-shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold">Expert Support</h4>
                <p className="text-xs text-steel-400">Hardware sizing guidance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Wrench className="w-4 h-4 -rotate-45" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Mini<span className="text-brand-500">Hardware</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-steel-400 max-w-sm leading-relaxed">
              Your trusted supplier for precision hardware, fasteners, brackets, hinges, fittings, and small metal supplies for projects of every scale.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/products" className="hover:text-white transition">All Products</Link></li>
              <li><Link to="/categories" className="hover:text-white transition">Categories</Link></li>
              <li><Link to="/cart" className="hover:text-white transition">My Cart</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Hardware</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/products?search=bolt" className="hover:text-white transition">Hex & Carriage Bolts</Link></li>
              <li><Link to="/products?search=nut" className="hover:text-white transition">Nylon & Hex Nuts</Link></li>
              <li><Link to="/products?search=screw" className="hover:text-white transition">Wood & Machine Screws</Link></li>
              <li><Link to="/products?search=bracket" className="hover:text-white transition">Corner Brackets</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Account</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/login" className="hover:text-white transition">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-white transition">Create Account</Link></li>
              <li><Link to="/profile" className="hover:text-white transition">Profile Details</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-steel-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-steel-500">
          <p>© {new Date().getFullYear()} MiniHardware Inc. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">FastAPI & React eCommerce Architecture</p>
        </div>
      </div>
    </footer>
  );
};
