import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Tags,
  AlertTriangle,
  XCircle,
  PlusCircle,
  Boxes,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { DashboardStats, InventoryItem } from '../../types/product';
import { StatsCard } from '../../components/admin/StatsCard';
import { StockBadge } from '../../components/product/StockBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [statsData, inventoryData] = await Promise.all([
          adminApi.getDashboard(),
          adminApi.getInventory({ limit: 5, status: 'LOW_STOCK' }),
        ]);
        setStats(statsData);
        setLowStockItems(inventoryData.items);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Gathering store analytics and stock figures..." />
      </div>
    );
  }

  if (error || !stats) {
    return <ErrorMessage message={error || 'Unable to load dashboard.'} />;
  }

  return (
    <div className="space-y-8">
      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Total Products"
          value={stats.total_products}
          icon={<Package className="w-6 h-6" />}
          subtitle="Catalog catalog active & inactive"
          variant="default"
        />

        <StatsCard
          title="Categories"
          value={stats.total_categories}
          icon={<Tags className="w-6 h-6" />}
          subtitle="Organized product groups"
          variant="default"
        />

        <StatsCard
          title="Low Stock Items"
          value={stats.low_stock_products}
          icon={<AlertTriangle className="w-6 h-6" />}
          subtitle="At or below warning threshold"
          variant="amber"
        />

        <StatsCard
          title="Out of Stock"
          value={stats.out_of_stock_products}
          icon={<XCircle className="w-6 h-6" />}
          subtitle="Immediate restock required"
          variant="red"
        />
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white rounded-2xl border border-steel-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-steel-900 uppercase tracking-wider mb-4">
          Quick Management Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/admin/products/new"
            className="p-4 rounded-xl bg-steel-50 hover:bg-brand-50 border border-steel-200/80 hover:border-brand-500/50 flex items-center space-x-3 transition group"
          >
            <div className="w-10 h-10 rounded-lg bg-brand-600 text-white flex items-center justify-center group-hover:scale-105 transition">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-steel-900 group-hover:text-brand-700 text-sm">Add New Product</p>
              <p className="text-xs text-steel-500">Create SKU and set stock</p>
            </div>
          </Link>

          <Link
            to="/admin/inventory"
            className="p-4 rounded-xl bg-steel-50 hover:bg-brand-50 border border-steel-200/80 hover:border-brand-500/50 flex items-center space-x-3 transition group"
          >
            <div className="w-10 h-10 rounded-lg bg-steel-800 text-white flex items-center justify-center group-hover:scale-105 transition">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-steel-900 group-hover:text-brand-700 text-sm">Manage Inventory</p>
              <p className="text-xs text-steel-500">Live stock adjustment</p>
            </div>
          </Link>

          <Link
            to="/admin/categories"
            className="p-4 rounded-xl bg-steel-50 hover:bg-brand-50 border border-steel-200/80 hover:border-brand-500/50 flex items-center space-x-3 transition group"
          >
            <div className="w-10 h-10 rounded-lg bg-steel-800 text-white flex items-center justify-center group-hover:scale-105 transition">
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-steel-900 group-hover:text-brand-700 text-sm">Product Categories</p>
              <p className="text-xs text-steel-500">Add or rename categories</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Critical Low Stock Warning Table */}
      <div className="bg-white rounded-2xl border border-steel-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-steel-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-steel-900">Low Stock Priority Alerts</h3>
            <p className="text-xs text-steel-500 mt-0.5">Products requiring immediate inventory replenishment</p>
          </div>
          <Link
            to="/admin/inventory?status=LOW_STOCK"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center transition"
          >
            <span>View All Low Stock</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {lowStockItems.length === 0 ? (
          <div className="p-8 text-center text-sm text-steel-500">
            No products are currently under their low stock thresholds. Inventory is healthy!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-steel-50 text-steel-500 text-xs uppercase font-semibold border-b border-steel-200">
                <tr>
                  <th className="py-3 px-6">Product</th>
                  <th className="py-3 px-6">SKU</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Current Stock</th>
                  <th className="py-3 px-6">Threshold</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-100">
                {lowStockItems.map((item) => (
                  <tr key={item.product_id} className="hover:bg-steel-50/60 transition">
                    <td className="py-3.5 px-6 font-semibold text-steel-900">{item.name}</td>
                    <td className="py-3.5 px-6 font-mono text-xs text-steel-500">{item.sku}</td>
                    <td className="py-3.5 px-6 text-steel-600">{item.category}</td>
                    <td className="py-3.5 px-6 font-bold text-amber-600">{item.current_stock} units</td>
                    <td className="py-3.5 px-6 text-steel-500">{item.low_stock_threshold}</td>
                    <td className="py-3.5 px-6">
                      <StockBadge status={item.status} />
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Link
                        to="/admin/inventory"
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                      >
                        Adjust Stock
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
