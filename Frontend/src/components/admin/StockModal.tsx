import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { adminApi } from '../../api/adminApi';
import { AlertCircle, Plus, Minus, Check } from 'lucide-react';

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  currentStock: number;
  onStockUpdated: (newStock: number, status: string) => void;
}

export const StockModal: React.FC<StockModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  currentStock,
  onStockUpdated,
}) => {
  const [mode, setMode] = useState<'adjust' | 'set'>('adjust');
  const [exactStock, setExactStock] = useState<number>(currentStock);
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [operation, setOperation] = useState<'ADD' | 'REMOVE'>('ADD');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateExact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (exactStock < 0) {
      setError('Stock cannot be negative.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await adminApi.updateStock(productId, exactStock);
      onStockUpdated(res.stock_quantity, res.stock_status);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update stock.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdjust = async (op: 'ADD' | 'REMOVE', amount: number) => {
    if (amount <= 0) return;
    if (op === 'REMOVE' && currentStock - amount < 0) {
      setError(`Cannot remove ${amount}. Current stock is only ${currentStock}.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await adminApi.adjustStock(productId, amount, op);
      onStockUpdated(res.stock_quantity, res.stock_status);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to adjust stock.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Product Stock" maxWidth="md">
      <div className="space-y-5">
        <div>
          <h4 className="text-sm font-semibold text-steel-900 truncate">{productName}</h4>
          <div className="mt-2 p-3 bg-steel-50 rounded-xl border border-steel-200 flex items-center justify-between">
            <span className="text-xs text-steel-500 font-medium">Current Stock Level:</span>
            <span className="text-xl font-extrabold text-steel-900">{currentStock} units</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex rounded-xl bg-steel-100 p-1">
          <button
            type="button"
            onClick={() => setMode('adjust')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              mode === 'adjust' ? 'bg-white text-steel-900 shadow-sm' : 'text-steel-600 hover:text-steel-900'
            }`}
          >
            Quick Adjust (+ / -)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('set');
              setExactStock(currentStock);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              mode === 'set' ? 'bg-white text-steel-900 shadow-sm' : 'text-steel-600 hover:text-steel-900'
            }`}
          >
            Set Exact Stock
          </button>
        </div>

        {mode === 'adjust' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-steel-600">Quick Increment / Decrement</label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 25, 50].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleAdjust('ADD', qty)}
                    className="py-2 px-3 rounded-lg border border-steel-200 hover:border-emerald-500 hover:bg-emerald-50 text-xs font-semibold text-emerald-700 transition"
                  >
                    +{qty}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2 mt-1">
                {[5, 10, 25, 50].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    disabled={isLoading || currentStock < qty}
                    onClick={() => handleAdjust('REMOVE', qty)}
                    className="py-2 px-3 rounded-lg border border-steel-200 hover:border-red-500 hover:bg-red-50 text-xs font-semibold text-red-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    -{qty}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-steel-100 flex items-center space-x-2">
              <input
                type="number"
                min="1"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 px-3 py-2 border border-steel-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleAdjust('ADD', adjustAmount)}
                className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition flex items-center justify-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add {adjustAmount}</span>
              </button>
              <button
                type="button"
                disabled={isLoading || currentStock < adjustAmount}
                onClick={() => handleAdjust('REMOVE', adjustAmount)}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition flex items-center justify-center space-x-1 disabled:opacity-40"
              >
                <Minus className="w-3.5 h-3.5" />
                <span>Remove {adjustAmount}</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateExact} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-steel-700 mb-1">
                Set Absolute Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={exactStock}
                onChange={(e) => setExactStock(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-2.5 border border-steel-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition shadow-sm"
            >
              {isLoading ? 'Updating...' : 'Save New Stock'}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
};
