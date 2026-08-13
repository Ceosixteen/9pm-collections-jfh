import React from 'react';
import { ArrowRight, Truck, Gift, ShieldCheck, Sparkles, ChevronDown } from 'lucide-react';

export const Hero: React.FC = () => {
  const scrollToCollections = () => {
    const el = document.getElementById('collections');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative bg-gradient-to-b from-[#FAF8FC] via-[#F6E9FC] to-[#FAF8FC] pt-14 pb-16 overflow-hidden border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#B24BF3]/30 text-[#B24BF3] text-xs font-bold mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Juba's Trusted Multi-Collection Store</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 leading-tight mb-5">
          Welcome to <span className="text-[#B24BF3]">Juba Fashion Hub</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          Authentic fragrances and dermatologist-developed skincare, delivered fast across Juba.
          Explore The 9 Collection, Rasasi Hawas, Bade'e Al Oud, and CeraVe Skincare — each with
          its own curated storefront and AI shopping assistant.
        </p>

        <button
          onClick={scrollToCollections}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#B24BF3] hover:bg-[#9f35e3] text-white font-bold text-sm shadow-lg transition-all cursor-pointer"
        >
          Explore Collections
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-10 text-xs sm:text-sm font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#B24BF3]" />
            <span>Free Delivery in Juba</span>
          </div>
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-[#B24BF3]" />
            <span>Automatic Bundle Discounts</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#B24BF3]" />
            <span>100% Authentic Imports</span>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <button
          onClick={scrollToCollections}
          aria-label="Scroll to collections, products and reviews"
          className="flex flex-col items-center gap-1 mx-auto mt-10 text-[#B24BF3] hover:text-[#9f35e3] transition-colors cursor-pointer"
        >
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">See Collections &amp; Reviews</span>
          <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce" />
        </button>

      </div>
    </section>
  );
};
