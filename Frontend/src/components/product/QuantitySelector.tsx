import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  maxStock: number;
  onChange: (newQuantity: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  maxStock,
  onChange,
  disabled = false,
  size = 'md',
}) => {
  const handleDecrement = () => {
    if (quantity > 1) {
      onChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < maxStock) {
      onChange(quantity + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    if (val < 1) {
      onChange(1);
    } else if (val > maxStock) {
      onChange(maxStock);
    } else {
      onChange(val);
    }
  };

  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  const buttonSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`inline-flex items-center rounded-xl border border-steel-200 bg-white shadow-sm overflow-hidden ${sizeClasses[size]}`}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || quantity <= 1}
        className={`flex items-center justify-center text-steel-500 hover:text-steel-800 hover:bg-steel-50 disabled:opacity-30 disabled:cursor-not-allowed transition ${buttonSizeClasses[size]}`}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <input
        type="number"
        min={1}
        max={maxStock}
        value={quantity}
        onChange={handleInputChange}
        disabled={disabled || maxStock <= 0}
        className="w-12 text-center font-bold text-steel-900 bg-transparent focus:outline-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || quantity >= maxStock || maxStock <= 0}
        className={`flex items-center justify-center text-steel-500 hover:text-steel-800 hover:bg-steel-50 disabled:opacity-30 disabled:cursor-not-allowed transition ${buttonSizeClasses[size]}`}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
