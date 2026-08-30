import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, ShieldCheck, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#18181B] text-gray-300 border-t border-gray-800 pt-12 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <img
              src="/images/juba_fashion_hub_logo.jpg"
              alt="Juba Fashion Hub"
              className="h-10 w-auto object-contain rounded-md bg-white p-1"
              referrerPolicy="no-referrer"
            />
            <p className="text-xs leading-relaxed text-gray-400 font-normal">
              We are an online store based in Juba. We own private warehouses where we import our items directly from original suppliers and dispatch our dedicated delivery riders across Juba.
            </p>
            <div className="flex flex-col gap-1.5 text-xs text-gray-400 pt-2">
              <Link to="/collections/9pm" className="hover:text-white transition-colors">The 9 Collection</Link>
              <Link to="/collections/hawas" className="hover:text-white transition-colors">Rasasi Hawas Collection</Link>
              <Link to="/collections/cerave" className="hover:text-white transition-colors">CeraVe Skincare Collection</Link>
              <Link to="/collections/badee-al-oud" className="hover:text-white transition-colors">Bade'e Al Oud Collection</Link>
              <Link to="/collections/medix" className="hover:text-white transition-colors">Medix 5.5 Body Care Collection</Link>
              <Link to="/collections/nivea-face-wash" className="hover:text-white transition-colors">Nivea Men Face Wash Collection</Link>
              <Link to="/collections/dove-beauty-bars" className="hover:text-white transition-colors">Dove Beauty Bar Collection</Link>
              <Link to="/collections/head-shoulders" className="hover:text-white transition-colors">Head & Shoulders Collection</Link>
              <Link to="/collections/nivea-shower-gel" className="hover:text-white transition-colors">Nivea Men Shower Gel Collection</Link>
              <Link to="/collections/khamrah" className="hover:text-white transition-colors">Lattafa Khamrah Collection</Link>
              <Link to="/collections/signature-women" className="hover:text-white transition-colors">Signature Fragrances for Women</Link>
              <Link to="/collections/signature-men" className="hover:text-white transition-colors">Signature Fragrances for Men</Link>
              <Link to="/collections/nivea-spray" className="hover:text-white transition-colors">Nivea Deodorant Spray Collection</Link>
              <Link to="/collections/nivea-lotion" className="hover:text-white transition-colors">Nivea Body Lotion Collection</Link>
              <Link to="/collections/pantene" className="hover:text-white transition-colors">Pantene Pro-V Shampoo Collection</Link>
            </div>
          </div>

          {/* Location & Delivery */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Location & Operating Hours
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#B24BF3] shrink-0 mt-0.5" />
                <span>Online Store based in Juba, South Sudan (Direct Supplier Warehouses)</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#B24BF3] shrink-0" />
                <span>+211 911 267 703 (WhatsApp & Calls)</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#B24BF3] shrink-0" />
                <span className="font-semibold text-white">Monday – Sunday: 9:00 AM – 4:30 PM</span>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Payment Options
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Cash on Delivery (COD in Juba)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#B24BF3]"></span>
                <span>m-GURUSH Mobile Money (SSP & USD)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                <span>Direct Bank Transfer (Equity / NCB)</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <a
            href="https://admin.jubafashionhub.link"
            target="_blank"
            rel="noopener noreferrer"
            title="Admin Portal"
            className="hover:text-gray-300 transition-colors"
          >
            © {new Date().getFullYear()} Juba Fashion Hub. All rights reserved. Original Imports.
          </a>
          <div className="flex items-center gap-4 text-gray-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#B24BF3]" />
              <span>100% Authentic Guarantee</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
