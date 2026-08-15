import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { HomeProduct, BEST_SELLERS, NEW_ARRIVALS } from '../data/featuredProducts';

const COLLECTION_PATHS: Record<string, string> = {
  'nine-collection': '/collections/9pm',
  hawas: '/collections/hawas',
  cerave: '/collections/cerave',
  'badee-al-oud': '/collections/badee-al-oud',
};

const COLLECTION_COLORS: Record<string, string> = {
  'nine-collection': 'bg-[#18181B] text-white',
  hawas: 'bg-blue-900 text-white',
  cerave: 'bg-teal-700 text-white',
  'badee-al-oud': 'bg-amber-900 text-white',
};

function ProductCard({ product }: { product: HomeProduct; key?: string }) {
  const href = COLLECTION_PATHS[product.collectionSlug] || '/';
  const colColor = COLLECTION_COLORS[product.collectionSlug] || 'bg-slate-800 text-white';

  return (
    <div className="shrink-0 w-40 sm:w-52 group">
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
        {/* Image */}
        <div className="relative bg-slate-50 h-36 sm:h-48 flex items-center justify-center p-3">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
          {/* Badge */}
          <span className="absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded-full bg-[#B24BF3] text-white shadow-xs leading-tight">
            {product.badge}
          </span>
        </div>

        {/* Info */}
        <div className="p-3 space-y-2">
          {/* Collection tag */}
          <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-full ${colColor}`}>
            {product.collectionLabel}
          </span>

          <h3 className="text-xs font-black text-slate-900 leading-tight line-clamp-2">{product.name}</h3>
          <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">{product.tagline}</p>

          {/* Price row */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-black text-[#B24BF3]">${product.priceUSD}</span>
            <span className="text-[10px] text-slate-400 line-through">${product.originalPriceUSD}</span>
          </div>

          {/* CTA */}
          <Link
            to={href}
            className="flex items-center justify-center gap-1 w-full py-2 rounded-xl bg-[#18181B] hover:bg-[#B24BF3] text-white text-[11px] font-bold transition-all"
          >
            <ShoppingBag className="w-3 h-3" />
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProductRow({ title, emoji, subtitle, products, viewAllHref }: {
  title: string;
  emoji: string;
  subtitle: string;
  products: HomeProduct[];
  viewAllHref?: string;
}) {
  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-end justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{emoji}</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">{title}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        {viewAllHref && (
          <Link
            to={viewAllHref}
            className="flex items-center gap-1 text-xs font-bold text-[#B24BF3] hover:underline shrink-0"
          >
            View all
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Horizontal scrolling row */}
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-3 px-4 sm:px-6 lg:px-8 pb-2">
          {products.map((p) => (
            <ProductCard key={`${p.collectionSlug}-${p.id}`} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

export const ProductShowcase: React.FC = () => {
  return (
    <section className="py-10 sm:py-14 space-y-10 sm:space-y-14 bg-[#FAF8FC]">
      <ProductRow
        emoji="🔥"
        title="Best Sellers"
        subtitle="The most loved products across every Juba Fashion Hub collection"
        products={BEST_SELLERS}
      />
      <ProductRow
        emoji="✨"
        title="New Arrivals"
        subtitle="Fresh drops — just landed in Juba. Be the first to own them."
        products={NEW_ARRIVALS}
      />
    </section>
  );
};
