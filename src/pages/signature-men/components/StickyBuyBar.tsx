import React from 'react';
import { ShoppingBag, Flame, Gift } from 'lucide-react';
import { Currency } from '../types';

interface StickyBuyBarProps {
  cartCount: number;
  currency: Currency;
  onOpenCart: () => void;
  onQuickAddBestSeller: () => void;
}

export const StickyBuyBar: React.FC<StickyBuyBarProps> = ({
  cartCount,
  currency,
  onOpenCart,
  onQuickAddBestSeller,
}) => {
  return (
    <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 py-2.5 px-4 shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Offer Highlight */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex w-9 h-9 rounded-full bg-purple-100 text-[#B24BF3] items-center justify-center border border-purple-200">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <span className="text-[#B24BF3] font-black">-$5 USD (40,000 SSP) OFF EVERY BOTTLE!</span>
            </div>
            <span className="text-[10px] text-slate-500 hidden sm:block font-medium">
              Add 2 or more bottles to automatically unlock bundle discount · Free Juba Express Dispatch
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onQuickAddBestSeller}
            className="px-3.5 py-2 rounded-full bg-gray-100 text-slate-900 hover:bg-gray-200 border border-gray-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <Flame className="w-3.5 h-3.5 text-[#B24BF3]" />
            <span className="hidden sm:inline">Add Best Seller (Signature for Him)</span>
            <span className="sm:hidden">Quick Add</span>
          </button>

          <button
            onClick={onOpenCart}
            className="px-4 py-2 rounded-full bg-[#18181B] text-white text-xs font-bold shadow-md hover:bg-slate-800 cursor-pointer flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4 text-purple-400" />
            <span>Cart ({cartCount})</span>
          </button>
        </div>

      </div>
    </div>
  );
};
