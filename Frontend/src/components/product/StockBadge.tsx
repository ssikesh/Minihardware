import React from 'react';
import { StockStatus } from '../../types/product';
import { Check, AlertTriangle, X } from 'lucide-react';

interface StockBadgeProps {
  status: StockStatus;
  quantity?: number;
  showQuantity?: boolean;
  className?: string;
}

export const StockBadge: React.FC<StockBadgeProps> = ({
  status,
  quantity,
  showQuantity = false,
  className = '',
}) => {
  const configs = {
    IN_STOCK: {
      label: 'In Stock',
      icon: <Check className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />,
      styles: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    LOW_STOCK: {
      label: 'Low Stock',
      icon: <AlertTriangle className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />,
      styles: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
    },
    OUT_OF_STOCK: {
      label: 'Out of Stock',
      icon: <X className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />,
      styles: 'bg-red-50 text-red-700 border-red-200',
      dot: 'bg-red-500',
    },
  };

  const config = configs[status] || configs.OUT_OF_STOCK;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.styles} ${className}`}
    >
      {config.icon}
      <span>{config.label}</span>
      {showQuantity && quantity !== undefined && quantity > 0 && (
        <span className="ml-1 opacity-80">({quantity})</span>
      )}
    </span>
  );
};
