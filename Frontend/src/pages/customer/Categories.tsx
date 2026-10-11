import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryApi } from '../../api/categoryApi';
import { Category } from '../../types/category';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { ArrowRight, Layers } from 'lucide-react';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await categoryApi.getCategories();
        setCategories(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load categories.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const categoryImages: Record<string, string> = {
    Bolts: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=600&auto=format&fit=crop&q=60',
    Nuts: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&auto=format&fit=crop&q=60',
    Screws: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=600&auto=format&fit=crop&q=60',
    Washers: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=60',
    Hinges: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?w=600&auto=format&fit=crop&q=60',
    Brackets: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=60',
    'Metal Fittings': 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=600&auto=format&fit=crop&q=60',
    Tools: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop&q=60',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-steel-900 tracking-tight">
          Product Categories
        </h1>
        <p className="text-sm text-steel-500 mt-1 max-w-xl">
          Explore specialized departments for fasteners, metal fittings, structural brackets, and tools.
        </p>
      </div>

      {isLoading && (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" text="Loading categories directory..." />
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category_id=${cat.id}`}
              className="group bg-white rounded-2xl border border-steel-200/80 overflow-hidden hover:border-brand-500/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
            >
              <div className="aspect-[4/3] bg-steel-100 overflow-hidden relative">
                <img
                  src={categoryImages[cat.name] || categoryImages.Bolts}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-steel-950/70 via-transparent to-transparent flex items-end p-4">
                  <h3 className="text-white font-extrabold text-lg tracking-tight">
                    {cat.name}
                  </h3>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-steel-500 line-clamp-2 leading-relaxed">
                  {cat.description || 'Precision hardware supplies for industrial and workshop use.'}
                </p>

                <div className="mt-4 pt-3 border-t border-steel-100 flex items-center justify-between text-xs font-semibold text-brand-600 group-hover:text-brand-700">
                  <span>Browse Products</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
