import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  actionLink,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-white border border-steel-200 shadow-sm ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-steel-100 flex items-center justify-center text-steel-400 mb-4">
        {icon || <PackageOpen className="w-8 h-8 text-steel-400" />}
      </div>
      <h3 className="text-lg font-bold text-steel-800">{title}</h3>
      <p className="mt-1 text-sm text-steel-500 max-w-sm">{description}</p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="mt-6 inline-flex items-center px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition shadow-sm"
        >
          {actionText}
        </Link>
      )}
      {actionText && onAction && !actionLink && (
        <button
          onClick={onAction}
          className="mt-6 inline-flex items-center px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
