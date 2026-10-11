import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { useAuthStore } from '../store/authStore';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Derive title from current pathname
  const getPageTitle = (pathname: string) => {
    if (pathname === '/admin') return 'Dashboard Overview';
    if (pathname === '/admin/products') return 'Product Management';
    if (pathname === '/admin/products/new') return 'Add New Product';
    if (pathname.includes('/edit')) return 'Edit Product';
    if (pathname === '/admin/inventory') return 'Inventory & Stock Monitor';
    if (pathname === '/admin/categories') return 'Category Directory';
    return 'Admin Panel';
  };

  return (
    <div className="min-h-screen bg-steel-100 flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <AdminHeader
          onOpenSidebar={() => setSidebarOpen(true)}
          title={getPageTitle(location.pathname)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
