import React from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  subtitle?: string;
  variant?: 'default' | 'amber' | 'red' | 'emerald';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  variant = 'default',
}) => {
  const variantStyles = {
    default: 'bg-white border-steel-200 text-steel-900',
    amber: 'bg-amber-50/50 border-amber-200 text-amber-900',
    red: 'bg-red-50/50 border-red-200 text-red-900',
    emerald: 'bg-emerald-50/50 border-emerald-200 text-emerald-900',
  };

  const iconBg = {
    default: 'bg-brand-50 text-brand-600',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    emerald: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className={`p-6 rounded-2xl border shadow-sm flex items-center justify-between ${variantStyles[variant]}`}>
      <div>
        <p className="text-xs font-semibold text-steel-500 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-extrabold mt-1">{value}</p>
        {subtitle && <p className="text-xs text-steel-400 mt-1 font-medium">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg[variant]}`}>
        {icon}
      </div>
    </div>
  );
};
