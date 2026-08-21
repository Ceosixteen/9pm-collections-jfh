import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, ShieldCheck, Truck, User, Search } from 'lucide-react';
import { SearchModal } from '../../../components/SearchModal';

export const Header: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const collections = [
    { to: '/collections/9pm', label: 'The 9 Collection' },
    { to: '/collections/hawas', label: 'Rasasi Hawas' },
    { to: '/collections/cerave', label: 'CeraVe Skincare' },
    { to: '/collections/badee-al-oud', label: "Bade'e Al Oud" },
    { to: '/collections/medix', label: 'Medix 5.5 Body Care' },
    { to: '/collections/nivea-face-wash', label: 'Nivea Face Wash' },
    { to: '/collections/dove-beauty-bars', label: 'Dove Beauty Bars' },
    { to: '/collections/head-shoulders', label: 'Head & Shoulders' },
    { to: '/collections/nivea-shower-gel', label: 'Nivea Shower Gels' },
    { to: '/collections/khamrah', label: 'Lattafa Khamrah' },
    { to: '/collections/signature-women', label: 'Women’s Signatures' },
    { to: '/collections/signature-men', label: 'Men’s Signatures' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200/80 shadow-xs transition-all duration-300">

      {/* Top Announcement Bar */}
      <div className="w-full bg-gradient-to-r from-red-600 via-purple-700 to-indigo-800 text-white text-[10px] sm:text-xs font-bold py-1 px-3 text-center flex items-center justify-center gap-1.5 tracking-wide shadow-inner">
        <span className="animate-pulse">🔥</span>
        <span className="truncate max-w-[90vw] sm:max-w-none">FREE Express Delivery Across Juba on Every Collection!</span>
        <span className="hidden md:inline-block px-1.5 py-0.5 rounded bg-black/30 text-yellow-300 font-mono text-[9px] border border-white/20">
          TODAY ONLY
        </span>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img
            src="/images/juba_fashion_hub_logo.jpg"
            alt="Juba Fashion Hub Online Store"
            className="h-9 sm:h-12 w-auto object-contain rounded-md hover:scale-105 transition-transform"
            referrerPolicy="no-referrer"
          />
        </Link>

        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <a
            href="tel:+211911267703"
            className="flex items-center gap-1.5 hover:text-[#B24BF3] transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#B24BF3]" />
            <span>+211 911 267 703</span>
          </a>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B24BF3]" />
            <span>100% Authentic Imports</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#B24BF3]" />
            <span>Free Delivery in Juba</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search"
            className="p-1.5 sm:p-2 rounded-full bg-white text-slate-700 border border-gray-200 hover:border-[#B24BF3] hover:text-[#B24BF3] transition-all shadow-xs cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <Link
            to="/account"
            aria-label="My Account"
            className="p-1.5 sm:p-2 rounded-full bg-white text-slate-700 border border-gray-200 hover:border-[#B24BF3] hover:text-[#B24BF3] transition-all shadow-xs"
          >
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
          <a
            href="tel:+211911267703"
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#18181B] text-white text-[11px] sm:text-xs font-bold hover:bg-slate-800 transition-all shadow-xs"
          >
            Call Us
          </a>
        </div>
      </div>

      {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />}

      {/* Collections Navigation Strip */}
      <div className="w-full bg-[#B24BF3] text-white shadow-xs overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1 sm:py-2 flex items-center justify-center sm:justify-start gap-1.5 text-[11px] sm:text-xs font-bold whitespace-nowrap">
          {collections.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="px-3 sm:px-5 py-1 sm:py-1.5 rounded-full text-white/90 hover:text-[#B24BF3] hover:bg-white transition-all"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>

    </header>
  );
};
