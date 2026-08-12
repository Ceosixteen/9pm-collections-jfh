import React from 'react';
import { Sparkles, ShoppingBag, Gift } from 'lucide-react';
import { RecommendedBundle, PerfumeProduct, Currency } from '../types';

interface BundlesSectionProps {
  bundles: RecommendedBundle[];
  perfumes: PerfumeProduct[];
  currency: Currency;
  onAddBundleToCart: (bundle: RecommendedBundle) => void;
}

export const BundlesSection: React.FC<BundlesSectionProps> = ({
  bundles,
  perfumes,
  currency,
  onAddBundleToCart,
}) => {
  return (
    <section id="bundles" className="py-16 bg-[#F5F1FA] border-t border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-100 text-[#B24BF3] text-xs font-extrabold uppercase tracking-wider border border-purple-200">
            <Gift className="w-3.5 h-3.5 text-[#B24BF3]" />
            AUTOMATIC BUNDLE DISCOUNTS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-sans">
            Special Perfume Bundle Deals
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-normal">
            Save up to <strong className="text-[#B24BF3] font-bold">$25 USD (200,000 SSP)</strong> when you bundle multiple bottles together. Instant same-day delivery across Juba Town!
          </p>
        </div>

        {/* Bundles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {bundles.map((bundle) => {
            const bundledPerfumes = perfumes.filter((p) => bundle.productIds.includes(p.id));

            const priceFormatted = currency === 'SSP'
              ? `SSP ${(bundle.priceUSD * 8000).toLocaleString()}`
              : `$${bundle.priceUSD}`;

            const originalFormatted = currency === 'SSP'
              ? `SSP ${(bundle.originalPriceUSD * 8000).toLocaleString()}`
              : `$${bundle.originalPriceUSD}`;

            const savingsFormatted = currency === 'SSP'
              ? `SSP ${(bundle.savingsUSD * 8000).toLocaleString()}`
              : `$${bundle.savingsUSD}`;

            return (
              <div
                key={bundle.id}
                className="relative rounded-3xl bg-white border border-gray-100 shadow-xl p-6 sm:p-8 flex flex-col justify-between hover:border-purple-300 transition-all duration-300 group"
              >
                {/* Popular Ribbon */}
                {bundle.isPopular && (
                  <div className="absolute -top-3.5 right-6 bg-[#B24BF3] text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span>MOST POPULAR BUNDLE</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Badge */}
                  <span className="inline-block px-3 py-1 rounded-md bg-purple-50 text-[#B24BF3] border border-purple-200 text-xs font-bold">
                    {bundle.badge}
                  </span>

                  <h3 className="text-2xl font-black text-slate-900">
                    {bundle.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 font-normal">
                    {bundle.description}
                  </p>

                  {/* Included Perfumes Preview */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      INCLUDED IN THIS BUNDLE ({bundledPerfumes.length} BOTTLES):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {bundledPerfumes.map((p) => (
                        <div key={p.id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-gray-100">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 aspect-[3/4] object-cover rounded-lg shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 block truncate">{p.name}</span>
                            <span className="text-[10px] text-gray-500 block truncate">{p.timeTag} Collection</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bundle Pricing & Action */}
                <div className="pt-6 mt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-[#B24BF3]">
                        {priceFormatted}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        {originalFormatted}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 block mt-0.5">
                      🎉 YOU SAVE {savingsFormatted}!
                    </span>
                  </div>

                  <button
                    onClick={() => onAddBundleToCart(bundle)}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#B24BF3] hover:bg-[#9f35e3] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add Bundle to Cart</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
