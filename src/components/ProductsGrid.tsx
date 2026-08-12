import React, { useState } from 'react';
import { ShoppingBag, Eye, Flame, Star } from 'lucide-react';
import { PerfumeProduct, Currency } from '../types';

interface ProductsGridProps {
  perfumes: PerfumeProduct[];
  currency: Currency;
  onAddToCart: (perfume: PerfumeProduct) => void;
  onSelectPerfume: (perfume: PerfumeProduct) => void;
}

export const ProductsGrid: React.FC<ProductsGridProps> = ({
  perfumes,
  currency,
  onAddToCart,
  onSelectPerfume,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | '9PM' | '9AM' | 'femme'>('all');

  const filteredPerfumes = perfumes.filter((p) => {
    if (activeFilter === '9PM') return p.timeTag === '9PM' && p.id !== '9pm-pour-femme';
    if (activeFilter === '9AM') return p.timeTag === '9AM';
    if (activeFilter === 'femme') return p.id === '9pm-pour-femme';
    return true;
  });

  return (
    <section id="collection" className="py-16 bg-[#FAF8FC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-10">
          <span className="px-3.5 py-1 rounded-full bg-purple-100 text-[#B24BF3] text-xs font-extrabold uppercase tracking-wider border border-purple-200">
            VIRAL PERFUME CATALOG
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-sans tracking-tight">
            Trending Fragrances in Juba
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-normal">
            Handpicked best-selling perfumes in Juba. Long-lasting performance, beast-mode projection, and guaranteed 100% original import.
          </p>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#B24BF3] text-white shadow-md'
                  : 'bg-white text-slate-700 border border-gray-200 hover:border-purple-300'
              }`}
            >
              All Fragrances ({perfumes.length})
            </button>
            <button
              onClick={() => setActiveFilter('9PM')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeFilter === '9PM'
                  ? 'bg-[#B24BF3] text-white shadow-md'
                  : 'bg-white text-slate-700 border border-gray-200 hover:border-purple-300'
              }`}
            >
              🌙 9PM Night Signature
            </button>
            <button
              onClick={() => setActiveFilter('9AM')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeFilter === '9AM'
                  ? 'bg-[#B24BF3] text-white shadow-md'
                  : 'bg-white text-slate-700 border border-gray-200 hover:border-purple-300'
              }`}
            >
              ☀️ 9AM Fresh Daytime
            </button>
            <button
              onClick={() => setActiveFilter('femme')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeFilter === 'femme'
                  ? 'bg-[#B24BF3] text-white shadow-md'
                  : 'bg-white text-slate-700 border border-gray-200 hover:border-purple-300'
              }`}
            >
              💕 Pour Femme (Women)
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPerfumes.map((perfume) => {
            const priceFormatted = currency === 'SSP'
              ? `SSP ${perfume.priceSSP.toLocaleString()}`
              : `$${perfume.priceUSD}`;

            const originalFormatted = currency === 'SSP'
              ? `SSP ${perfume.originalPriceSSP.toLocaleString()}`
              : `$${perfume.originalPriceUSD}`;

            return (
              <div
                key={perfume.id}
                className="group relative rounded-3xl bg-white border border-gray-100 shadow-md hover:shadow-xl hover:border-purple-200 transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden bg-slate-50">
                  <img
                    src={perfume.image}
                    alt={perfume.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Badge */}
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                    <span className="px-3 py-1 rounded-full bg-slate-900/90 text-white text-[10px] font-extrabold shadow-md uppercase">
                      {perfume.badge || `${perfume.timeTag} COLLECTION`}
                    </span>
                  </div>

                  {/* Rating Pill */}
                  <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-white/95 shadow-md text-xs font-bold text-slate-900 flex items-center gap-1 border border-gray-100">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{perfume.rating}</span>
                    <span className="text-[10px] text-gray-400">({perfume.reviewsCount})</span>
                  </div>

                  {/* Scarcity Tag */}
                  <div className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 text-[10px] font-extrabold flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-600" />
                    <span>Only {perfume.stockCount} left in Juba</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-[#B24BF3] tracking-wider block">
                      {perfume.fragranceFamily}
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-0.5 group-hover:text-[#B24BF3] transition-colors">
                      {perfume.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {perfume.tagline}
                    </p>

                    {/* Top Notes Chips */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {perfume.notesTop.map((note, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-purple-50 text-[10px] font-bold text-purple-900 border border-purple-100"
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-3 border-t border-gray-100 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xl font-extrabold text-[#B24BF3]">
                          {priceFormatted}
                        </span>
                        <span className="ml-2 text-xs text-gray-400 line-through">
                          {originalFormatted}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        -$5 BUNDLE SAVINGS
                      </span>
                    </div>

                    <div className="grid grid-cols-12 gap-2">
                      <button
                        onClick={() => onSelectPerfume(perfume)}
                        className="col-span-4 py-2.5 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                      >
                        <Eye className="w-3.5 h-3.5 text-gray-600" />
                        <span>Notes</span>
                      </button>

                      <button
                        onClick={() => onAddToCart(perfume)}
                        className="col-span-8 py-2.5 rounded-xl bg-[#B24BF3] hover:bg-[#9f35e3] text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
