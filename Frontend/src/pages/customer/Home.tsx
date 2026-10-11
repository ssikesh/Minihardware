import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { Product } from '../../types/product';
import { Category } from '../../types/category';
import { ProductGrid } from '../../components/product/ProductGrid';
import { Toast, ToastType } from '../../components/common/Toast';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [toast, setToast] = useState<{ id: string; message: string; type: ToastType } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productApi.getProducts({ page: 1, limit: 8 }),
          categoryApi.getCategories(),
        ]);
        setFeaturedProducts(prodRes.items);
        setCategories(catRes.slice(0, 6)); // Top 6 categories
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setIsLoadingProducts(false);
        setIsLoadingCategories(false);
      }
    };

    fetchData();
  }, []);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ id: Date.now().toString(), message, type });
  };

  const categoryImages: Record<string, string> = {
    Bolts: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500&auto=format&fit=crop&q=60',
    Nuts: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&auto=format&fit=crop&q=60',
    Screws: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=500&auto=format&fit=crop&q=60',
    Washers: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60',
    Hinges: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?w=500&auto=format&fit=crop&q=60',
    Brackets: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=60',
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-br from-steel-900 via-steel-850 to-steel-950 text-white overflow-hidden py-16 sm:py-24">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415515_1px,transparent_1px),linear-gradient(to_bottom,#33415515_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <span>Commercial & DIY Supplies</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Quality Hardware. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-amber-500">
                Simple Shopping.
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-steel-300 leading-relaxed max-w-xl">
              Find bolts, nuts, screws, hinges, brackets, and precision metal hardware products for mechanical, structural, and repair projects.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/products"
                className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm flex items-center space-x-2 shadow-lg shadow-brand-600/30 transition active:scale-[0.98]"
              >
                <span>Shop Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/categories"
                className="px-6 py-3.5 rounded-xl bg-steel-800/80 hover:bg-steel-700/80 border border-steel-700 text-steel-200 font-semibold text-sm transition"
              >
                Explore Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-steel-900 tracking-tight">
              Hardware Categories
            </h2>
            <p className="text-sm text-steel-500 mt-1">
              Select a specialized category to find exact fasteners and fittings
            </p>
          </div>
          <Link
            to="/categories"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center transition"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {isLoadingCategories
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-steel-200 animate-pulse" />
              ))
            : categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category_id=${cat.id}`}
                  className="group relative overflow-hidden rounded-2xl border border-steel-200/80 bg-white p-4 flex flex-col items-center text-center hover:border-brand-500/50 hover:shadow-md transition duration-200"
                >
                  <div className="w-14 h-14 rounded-2xl bg-steel-50 flex items-center justify-center text-steel-700 group-hover:scale-110 group-hover:bg-brand-50 group-hover:text-brand-600 transition-all duration-300 mb-3 overflow-hidden">
                    <img
                      src={categoryImages[cat.name] || categoryImages.Bolts}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-sm text-steel-900 group-hover:text-brand-600 transition">
                    {cat.name}
                  </h3>
                </Link>
              ))}
        </div>
      </section>

      {/* 3. Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-steel-900 tracking-tight">
              Featured Products
            </h2>
            <p className="text-sm text-steel-500 mt-1">
              Top-selling bolts, nuts, screws, and workshop staples
            </p>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center transition"
          >
            <span>See All Products</span>
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>

        <ProductGrid
          products={featuredProducts}
          isLoading={isLoadingProducts}
          onToast={showToast}
        />
      </section>

      {/* 4. Call-To-Action Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-brand-600 text-white p-8 sm:p-12 overflow-hidden shadow-xl shadow-brand-600/20">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-brand-500 rounded-full blur-3xl opacity-50" />
          
          <div className="relative max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Find the right hardware for your project.
            </h2>
            <p className="mt-3 text-brand-100 text-sm sm:text-base leading-relaxed">
              Whether you need 10 stainless steel machine screws or 500 carriage bolts, our real-time stock system guarantees what you order is physically on the shelf.
            </p>
            <div className="mt-6">
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-white text-brand-700 hover:bg-steel-50 font-bold text-sm shadow-md transition active:scale-[0.98]"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
