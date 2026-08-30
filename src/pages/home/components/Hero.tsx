import React from 'react';
import { ArrowRight, Truck, Gift, ShieldCheck, Sparkles } from 'lucide-react';

export const Hero: React.FC = () => {
  const scrollToCollections = () => {
    const el = document.getElementById('collections');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative bg-gradient-to-b from-[#FAF8FC] via-[#F6E9FC] to-[#FAF8FC] pt-10 pb-12 overflow-hidden border-b border-gray-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#B24BF3]/30 text-[#B24BF3] text-xs font-bold mb-4 shadow-xs">
          <Sparkles className="w-3 h-3" />
          <span>Juba&apos;s Trusted Multi-Collection Store</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight mb-3">
          Welcome to{' '}
          <span className="text-[#B24BF3]">Juba Fashion Hub</span>
        </h1>

        {/* Subheading */}
        <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto mb-6 leading-relaxed">
          Authentic fragrances, skincare &amp; personal care — delivered free across Juba in under 120 minutes. Pay cash on delivery.
        </p>

        {/* CTA */}
        <button
          onClick={scrollToCollections}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#B24BF3] hover:bg-[#9f35e3] text-white font-bold text-sm shadow-lg transition-all cursor-pointer"
        >
          Shop Collections
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Trust strip */}
        <div className="flex items-center justify-center flex-wrap gap-x-5 gap-y-2 mt-7 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#B24BF3]" />
            Free Delivery
          </span>
          <span className="text-slate-300 hidden sm:inline">·</span>
          <span className="flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-[#B24BF3]" />
            Bundle Discounts
          </span>
          <span className="text-slate-300 hidden sm:inline">·</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B24BF3]" />
            100% Authentic
          </span>
        </div>

      </div>
    </section>
  );
};
