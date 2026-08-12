import React from 'react';
import { X, Sparkles, ShoppingBag } from 'lucide-react';
import { PerfumeProduct, Currency } from '../types';

interface ProductDetailModalProps {
  perfume: PerfumeProduct | null;
  currency: Currency;
  onClose: () => void;
  onAddToCart: (perfume: PerfumeProduct) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  perfume,
  currency,
  onClose,
  onAddToCart,
}) => {
  if (!perfume) return null;

  const priceFormatted = currency === 'SSP'
    ? `SSP ${(perfume.priceUSD * 8000).toLocaleString()}`
    : `$${perfume.priceUSD}`;

  const originalPriceFormatted = currency === 'SSP'
    ? `SSP ${(perfume.originalPriceUSD * 8000).toLocaleString()}`
    : `$${perfume.originalPriceUSD}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white border border-gray-200 overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 text-slate-700 hover:bg-gray-200 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8">
          
          {/* Left: Image */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-gray-100 shadow-lg bg-slate-50">
              <img
                src={perfume.image}
                alt={perfume.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-3 left-3 px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-full shadow-md uppercase">
                {perfume.badge || `${perfume.timeTag} COLLECTION`}
              </span>
            </div>
            <p className="mt-3 text-xs text-gray-500 font-bold text-center">
              {perfume.volume}
            </p>
          </div>

          {/* Right: Spec & Notes */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <span className="text-xs font-extrabold text-[#B24BF3] uppercase tracking-wider">
                {perfume.fragranceFamily}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {perfume.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-normal mt-1">
                {perfume.tagline}
              </p>
            </div>

            {/* Price & Scarcity */}
            <div className="flex items-baseline gap-3 p-3.5 rounded-2xl bg-purple-50 border border-purple-100">
              <span className="text-2xl font-black text-[#B24BF3]">
                {priceFormatted}
              </span>
              <span className="text-sm text-gray-400 line-through">
                {originalPriceFormatted}
              </span>
              <span className="ml-auto text-xs font-extrabold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-md">
                🔥 Stock: {perfume.stockCount} left
              </span>
            </div>

            {/* Performance & Concentration Indicators */}
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-100">
                <span className="text-gray-400 block text-[9px] uppercase font-extrabold">CONCENTRATION</span>
                <span className="text-slate-900 font-bold text-[11px]">{perfume.concentration || 'Eau de Parfum (EDP), 100ml'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-100">
                <span className="text-gray-400 block text-[9px] uppercase font-extrabold">PROJECTION</span>
                <span className="text-slate-900 font-bold text-[11px]">{perfume.projection}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-100">
                <span className="text-gray-400 block text-[9px] uppercase font-extrabold">LONGEVITY</span>
                <span className="text-slate-900 font-bold text-[11px]">{perfume.longevity}</span>
              </div>
            </div>

            {/* Notes Pyramid Breakdown */}
            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#B24BF3]" />
                Scent Profile Breakdown
              </h4>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#B24BF3]">Top Notes:</span>
                    <span className="text-[11px] text-slate-900 font-bold">{perfume.notesTop.join(', ')}</span>
                  </div>
                  {perfume.notesTopDesc && (
                    <p className="text-[11px] text-slate-500 mt-0.5 italic">({perfume.notesTopDesc})</p>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#B24BF3]">Middle Notes:</span>
                    <span className="text-[11px] text-slate-900 font-bold">{perfume.notesMiddle.join(', ')}</span>
                  </div>
                  {perfume.notesMiddleDesc && (
                    <p className="text-[11px] text-slate-500 mt-0.5 italic">({perfume.notesMiddleDesc})</p>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#B24BF3]">Base Notes:</span>
                    <span className="text-[11px] text-slate-900 font-bold">{perfume.notesBase.join(', ')}</span>
                  </div>
                  {perfume.notesBaseDesc && (
                    <p className="text-[11px] text-slate-500 mt-0.5 italic">({perfume.notesBaseDesc})</p>
                  )}
                </div>
              </div>
            </div>

            {/* Best Time & When NOT to wear */}
            {(perfume.bestTimeToWear || perfume.notBestTimeToWear) && (
              <div className="space-y-2 pt-1 text-xs">
                {perfume.bestTimeToWear && (
                  <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-900">
                    <span className="font-black text-emerald-800 uppercase block text-[10px] tracking-wide mb-0.5">
                      🌟 Best Time to Wear:
                    </span>
                    <p className="text-[11px] leading-relaxed font-medium">{perfume.bestTimeToWear}</p>
                  </div>
                )}

                {perfume.notBestTimeToWear && (
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900">
                    <span className="font-black text-amber-800 uppercase block text-[10px] tracking-wide mb-0.5">
                      ⚠️ Not the Best Time to Wear:
                    </span>
                    <p className="text-[11px] leading-relaxed font-medium">{perfume.notBestTimeToWear}</p>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed font-normal pt-1">
              {perfume.description}
            </p>

            {/* Actions */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => {
                  onAddToCart(perfume);
                  onClose();
                }}
                className="w-full py-3.5 px-6 rounded-full bg-[#B24BF3] hover:bg-[#9f35e3] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add {perfume.name} to Cart</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
