import React, { useState, useEffect } from 'react';
import { Flame, ShoppingBag, PhoneCall, ArrowRight, Truck, Gift, ShieldCheck, Sparkles, Clock, ChevronDown } from 'lucide-react';
import { Currency, PerfumeProduct } from '../types';

interface HeroProps {
  currency: Currency;
  onExploreProducts: () => void;
  onOpenQuiz: () => void;
  perfumes: PerfumeProduct[];
  onSelectPerfume: (p: PerfumeProduct) => void;
}

export const Hero: React.FC<HeroProps> = ({
  currency,
  onExploreProducts,
  onOpenQuiz,
  perfumes,
  onSelectPerfume,
}) => {
  // Live ticking countdown timer for urgency
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 14, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 2, minutes: 15, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTwoDigits = (num: number) => num.toString().padStart(2, '0');

  // Select top featured items from the CeraVe Collection for the right stack
  const pFoaming = perfumes.find((p) => p.id === 'cerave-foaming-cleanser') || perfumes[0];
  const pHydrating = perfumes.find((p) => p.id === 'cerave-hydrating-cleanser') || perfumes[1];
  const pCream = perfumes.find((p) => p.id === 'cerave-moisturizing-cream') || perfumes[2];

  const featuredCards = [
    {
      category: 'CERAVE SKINCARE COLLECTION',
      title: pFoaming ? pFoaming.name : 'CeraVe Foaming Facial Cleanser',
      priceUSD: pFoaming ? pFoaming.priceUSD : 25,
      originalPriceUSD: pFoaming ? pFoaming.originalPriceUSD : 30,
      savingsUSD: pFoaming ? pFoaming.originalPriceUSD - pFoaming.priceUSD : 5,
      image: pFoaming ? pFoaming.image : '',
      product: pFoaming || perfumes[0],
    },
    {
      category: 'CERAVE SKINCARE COLLECTION',
      title: pHydrating ? pHydrating.name : 'CeraVe Hydrating Cleanser',
      priceUSD: pHydrating ? pHydrating.priceUSD : 25,
      originalPriceUSD: pHydrating ? pHydrating.originalPriceUSD : 30,
      savingsUSD: pHydrating ? pHydrating.originalPriceUSD - pHydrating.priceUSD : 5,
      image: pHydrating ? pHydrating.image : '',
      product: pHydrating || perfumes[0],
    },
    {
      category: 'CERAVE SKINCARE COLLECTION',
      title: pCream ? pCream.name : 'CeraVe Moisturizing Cream',
      priceUSD: pCream ? pCream.priceUSD : 30,
      originalPriceUSD: pCream ? pCream.originalPriceUSD : 36,
      savingsUSD: pCream ? pCream.originalPriceUSD - pCream.priceUSD : 6,
      image: pCream ? pCream.image : '',
      product: pCream || perfumes[0],
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF5FF] via-[#F6EEFD] to-[#FAF8FC] py-5 sm:py-10 lg:py-14 border-b border-purple-100">
      
      {/* Soft Background Accent Glows */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-pink-200/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center">
          
          {/* Left Column: Headlines, Copy & Buttons */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
            
            {/* Urgency Headline Banner */}
            <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2.5 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 text-white font-extrabold text-[10px] sm:text-xs shadow-md border border-red-400/40">
              <span className="flex items-center gap-1 text-yellow-300 uppercase tracking-wider font-black">
                <Flame className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300 animate-bounce" />
                JUBA STOCK ALERT
              </span>
              <span className="text-white font-bold">
                · Only <strong className="underline decoration-yellow-300 text-yellow-200 font-extrabold">7 Left</strong> in Juba!
              </span>
              <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/40 text-yellow-300 font-mono text-[10px] border border-white/20">
                <Clock className="w-3 h-3 text-yellow-300" />
                <span>{formatTwoDigits(timeLeft.hours)}:{formatTwoDigits(timeLeft.minutes)}:{formatTwoDigits(timeLeft.seconds)}</span>
              </span>
            </div>

            {/* Main Headline for CeraVe Landing Page */}
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight sm:leading-none font-sans">
              CeraVe Skincare Collection,{' '}
              <span className="inline sm:block text-[#B24BF3] font-black">
                dermatologist-developed care.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              Experience the complete CeraVe lineup — cleansers, toner, moisturizers, and resurfacing retinol serum. 100% original, dermatologist-developed skincare delivered fast across Juba.
            </p>

            {/* CTA Buttons Row - Mobile Optimized Grid */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 sm:flex sm:flex-row items-center justify-center lg:justify-start gap-2.5">
                <button
                  onClick={onExploreProducts}
                  className="px-4 py-2.5 sm:px-7 sm:py-3.5 rounded-full bg-[#B24BF3] hover:bg-[#9f35e3] text-white font-bold text-xs sm:text-base shadow-md hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Shop CeraVe</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                <button
                  onClick={onOpenQuiz}
                  className="px-4 py-2.5 sm:px-5 sm:py-3.5 rounded-full bg-white text-purple-700 border border-purple-200 font-bold text-xs sm:text-sm hover:bg-purple-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#B24BF3]" />
                  <span>Find My Match</span>
                </button>
              </div>

              <div className="flex justify-center lg:justify-start pt-1">
                <a
                  href="tel:+211911267703"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-800 font-bold hover:text-[#B24BF3] transition-colors py-1 cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#B24BF3]" />
                  <span>Call Direct Support (+211 911 267 703)</span>
                </a>
              </div>
            </div>

            {/* Trust Highlights Row */}
            <div className="pt-3 sm:pt-6 border-t border-purple-200/60 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6 text-[10px] sm:text-xs font-bold text-slate-700">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#B24BF3]" />
                <span>Free Delivery in Juba</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-[#B24BF3]" />
                <span>-$5 Off 2+ Items</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B24BF3]" />
                <span>Pay on Delivery</span>
              </div>
            </div>

          </div>

          {/* Right Column: Featured Card(s) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative space-y-3 pt-2 lg:pt-0">
            
            {/* On Mobile: Show 1 prominent card; On Large screens show full stack */}
            {featuredCards.slice(0, 1).map((card, idx) => (
              <div
                key={idx}
                onClick={() => onSelectPerfume(card.product)}
                className="w-full max-w-md p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-gray-100 shadow-lg hover:shadow-xl hover:border-purple-300 transition-all cursor-pointer flex items-center gap-3 lg:hidden"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-16 sm:w-20 aspect-[3/4] object-cover rounded-xl sm:rounded-2xl border border-gray-100 shrink-0"
                />

                <div className="flex-1 min-w-0 text-left">
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase text-[#B24BF3] tracking-wider block">
                    TOP FEATURED
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 font-sans truncate">
                    {card.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-base sm:text-lg font-black text-[#B24BF3]">
                      {currency === 'SSP' ? `SSP ${(card.priceUSD * 8000).toLocaleString()}` : `$${card.priceUSD}`}
                    </span>
                    <span className="text-xs text-gray-400 line-through font-semibold">
                      {currency === 'SSP' ? `SSP ${(card.originalPriceUSD * 8000).toLocaleString()}` : `$${card.originalPriceUSD}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Desktop Stack */}
            <div className="hidden lg:flex flex-col space-y-4 w-full">
              {featuredCards.map((card, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectPerfume(card.product)}
                  className={`w-full max-w-md p-4 rounded-3xl bg-white border border-gray-100 shadow-xl hover:shadow-2xl hover:border-purple-300 transition-all cursor-pointer flex items-center gap-4 ${
                    idx === 0 ? 'rotate-1 hover:rotate-0' : idx === 1 ? '-rotate-1 hover:rotate-0' : 'rotate-1 hover:rotate-0'
                  }`}
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-20 aspect-[3/4] object-cover rounded-2xl border border-gray-100 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-extrabold uppercase text-[#B24BF3] tracking-wider block">
                      {card.category}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 font-sans truncate">
                      {card.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-black text-[#B24BF3]">
                        {currency === 'SSP' ? `SSP ${(card.priceUSD * 8000).toLocaleString()}` : `$${card.priceUSD}`}
                      </span>
                      <span className="text-xs text-gray-400 line-through font-semibold">
                        {currency === 'SSP' ? `SSP ${(card.originalPriceUSD * 8000).toLocaleString()}` : `$${card.originalPriceUSD}`}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-extrabold">
                        SAVE ${card.savingsUSD}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Scroll Down Indicator */}
        <button
          onClick={onExploreProducts}
          aria-label="Scroll to products, bundles and reviews"
          className="flex flex-col items-center gap-1 mx-auto mt-6 sm:mt-10 text-[#B24BF3] hover:text-[#9f35e3] transition-colors cursor-pointer"
        >
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">See Products, Bundles &amp; Reviews</span>
          <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce" />
        </button>
      </div>

    </section>
  );
};
