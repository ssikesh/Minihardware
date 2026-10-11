import React from 'react';
import { ArrowRight, ShieldCheck, Truck, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CartSummaryProps {
  totalItems: number;
  totalPrice: number;
  onClearCart: () => void;
  isClearing?: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  totalItems,
  totalPrice,
  onClearCart,
  isClearing = false,
}) => {
  const freeShippingThreshold = 50;
  const isFreeShipping = totalPrice >= freeShippingThreshold;
  const shippingCost = isFreeShipping ? 0 : 4.99;
  const grandTotal = totalPrice + shippingCost;

  return (
    <div className="bg-white rounded-2xl border border-steel-200 p-6 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-bold text-steel-900 border-b border-steel-100 pb-4">
          Order Summary
        </h3>

        <div className="space-y-3 mt-4 text-sm">
          <div className="flex justify-between text-steel-600">
            <span>Total Items:</span>
            <span className="font-semibold text-steel-900">{totalItems} units</span>
          </div>

          <div className="flex justify-between text-steel-600">
            <span>Subtotal:</span>
            <span className="font-semibold text-steel-900">${totalPrice.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-steel-600">
            <span className="flex items-center">
              <Truck className="w-4 h-4 mr-1.5 text-steel-400" />
              Standard Shipping:
            </span>
            <span className="font-semibold text-steel-900">
              {isFreeShipping ? (
                <span className="text-emerald-600 font-bold uppercase text-xs">Free</span>
              ) : (
                `$${shippingCost.toFixed(2)}`
              )}
            </span>
          </div>

          {!isFreeShipping && (
            <p className="text-xs text-brand-600 bg-brand-50 p-2.5 rounded-lg border border-brand-100">
              Add ${(freeShippingThreshold - totalPrice).toFixed(2)} more for <strong>Free Standard Shipping</strong>!
            </p>
          )}

          <div className="border-t border-steel-100 pt-3 mt-3 flex justify-between text-base font-bold text-steel-900">
            <span>Estimated Total:</span>
            <span className="text-xl text-brand-600">${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={() => alert('Checkout functionality: In this version, orders are ready to be integrated with your payment provider.')}
          className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-sm transition active:scale-[0.99]"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onClearCart}
          disabled={isClearing || totalItems === 0}
          className="w-full py-2.5 px-4 rounded-xl border border-steel-200 text-steel-600 hover:text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{isClearing ? 'Clearing Cart...' : 'Clear Entire Cart'}</span>
        </button>

        <div className="pt-4 border-t border-steel-100 flex items-center justify-center space-x-1 text-xs text-steel-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 mr-1" />
          <span>Real-time stock reservation at checkout</span>
        </div>
      </div>
    </div>
  );
};
