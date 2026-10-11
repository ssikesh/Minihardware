import React from 'react';
import { Menu, Bell, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface AdminHeaderProps {
  onOpenSidebar: () => void;
  title: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onOpenSidebar, title }) => {
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b border-steel-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-steel-600 hover:text-steel-900 hover:bg-steel-100 transition"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg sm:text-xl font-bold text-steel-900 truncate">{title}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5 pl-3 border-l border-steel-200">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-steel-900 leading-tight">{user?.name || 'Administrator'}</p>
            <p className="text-[10px] text-steel-500 font-medium">Store Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
};
