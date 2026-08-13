import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Diamond } from 'lucide-react';
import { Currency } from '../types';

interface HeaderProps {
  currency: Currency;
  onCurrencyToggle: () => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenQuiz: () => void;
  onOpenTelegramAdmin: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currency,
  onCurrencyToggle,
  cartCount,
  onOpenCart,
  onOpenQuiz,
  selectedCategory,
  onSelectCategory,
}) => {
  const categories = [
    { id: 'afnan-9', label: '9PM & 9AM Afnan' },
    { id: 'bundles', label: 'Perfume Bundles' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200/80 shadow-xs transition-all duration-300">
      
      {/* Top Urgency Announcement Bar - Compact on Mobile */}
      <div className="w-full bg-gradient-to-r from-red-600 via-purple-700 to-indigo-800 text-white text-[10px] sm:text-xs font-bold py-1 px-3 text-center flex items-center justify-center gap-1.5 tracking-wide shadow-inner">
        <span className="animate-pulse">🔥</span>
        <span className="truncate max-w-[90vw] sm:max-w-none">HIGH DEMAND IN JUBA: Order 2+ Bottles & Get -$5 Off Each Bottle Automatically!</span>
        <span className="hidden md:inline-block px-1.5 py-0.5 rounded bg-black/30 text-yellow-300 font-mono text-[9px] border border-white/20">
          LIMITED STOCK
        </span>
      </div>

      {/* Main Header Bar - Optimized for Mobile */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-between gap-2">
        
        {/* Left: Juba Fashion Hub Logo (links back to all collections) */}
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/images/juba_fashion_hub_logo.jpg"
              alt="Juba Fashion Hub Online Store"
              className="h-9 sm:h-12 w-auto object-contain rounded-md hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
          </Link>
        </div>

        {/* Right: USD/SSP Toggle, Ask Amina AI & Cart Button */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* USD/SSP Currency Switcher Toggle */}
          <div className="flex items-center p-0.5 sm:p-1 rounded-full bg-[#18181B] text-white text-[10px] sm:text-xs font-semibold border border-gray-800">
            <button
              onClick={onCurrencyToggle}
              className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                currency === 'USD'
                  ? 'bg-[#B24BF3] text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              USD
            </button>
            <button
              onClick={onCurrencyToggle}
              className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                currency === 'SSP'
                  ? 'bg-[#B24BF3] text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              SSP
            </button>
          </div>

          {/* Ask Amina AI Pill Button */}
          <button
            onClick={onOpenQuiz}
            className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200 text-[11px] sm:text-xs font-bold hover:bg-purple-200 transition-all cursor-pointer shadow-xs relative"
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
                alt="Amina AI"
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover border border-purple-400"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 border border-white animate-pulse"></span>
            </div>
            <span className="hidden xs:inline">Ask AI</span>
          </button>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#18181B] text-white text-[11px] sm:text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="min-w-[16px] h-3.5 sm:h-4 px-1 rounded-full bg-[#B24BF3] text-white text-[9px] sm:text-[10px] font-extrabold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

        </div>

      </div>

      {/* Category Navigation Strip - Vibrant Purple */}
      <div className="w-full bg-[#B24BF3] text-white shadow-xs overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1 sm:py-2 flex items-center justify-center sm:justify-start gap-1.5 text-[11px] sm:text-xs font-bold whitespace-nowrap">
          <Link
            to="/"
            className="px-3 sm:px-5 py-1 sm:py-1.5 rounded-full transition-all text-white/90 hover:text-white hover:bg-white/10"
          >
            All Items
          </Link>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 sm:px-5 py-1 sm:py-1.5 rounded-full transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#B24BF3] font-extrabold shadow-xs'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

    </header>
  );
};
;
