import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

interface CollectionCard {
  to: string;
  name: string;
  subtitle: string;
  image: string;
  badge: string;
}

const COLLECTIONS: CollectionCard[] = [
  {
    to: '/collections/9pm',
    name: 'The 9 Collection',
    subtitle: 'Afnan 9PM Rebel, Elixir, Classic, 9AM Dive & Pour Femme',
    image: '/images/9pm_rebel.jpg',
    badge: 'Fragrances',
  },
  {
    to: '/collections/hawas',
    name: 'Rasasi Hawas Collection',
    subtitle: 'Hawas for Him, Ice, Black, Fire & Pink',
    image: '/images/hawas_for_him.jpg',
    badge: 'Fragrances',
  },
  {
    to: '/collections/cerave',
    name: 'CeraVe Skincare Collection',
    subtitle: 'Cleansers, toner, moisturizers & retinol serum',
    image: '/images/cerave_foaming_cleanser.jpg',
    badge: 'Skincare',
  },
];

export const CollectionsGrid: React.FC = () => {
  return (
    <section id="collections" className="py-16 sm:py-20 bg-[#FAF8FC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-[#B24BF3] text-xs font-bold uppercase tracking-widest mb-3">
            Shop by Collection
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
            Pick Your Collection
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {COLLECTIONS.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group relative rounded-3xl overflow-hidden bg-white border border-purple-100 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="aspect-[4/5] w-full overflow-hidden bg-gray-100">
                <img
                  src={c.image}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-white/90 text-[#B24BF3] text-[10px] font-bold uppercase tracking-wider shadow-xs">
                {c.badge}
              </div>

              <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                <h3 className="text-lg font-black mb-1">{c.name}</h3>
                <p className="text-xs text-white/85 mb-3 leading-relaxed">{c.subtitle}</p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-white group-hover:gap-2 transition-all">
                  Shop Now
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};
