import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { HomeProduct, BEST_SELLERS, NEW_ARRIVALS } from '../data/featuredProducts';
import { HomeProductModal } from './HomeProductModal';

const COLLECTION_COLORS: Record<string, string> = {
  'nine-collection': 'bg-[#18181B] text-white',
  hawas: 'bg-blue-900 text-white',
  cerave: 'bg-teal-700 text-white',
  'badee-al-oud': 'bg-amber-900 text-white',
  medix: 'bg-purple-800 text-white',
  'head-shoulders': 'bg-blue-700 text-white',
  'nivea-shower-gel': 'bg-blue-900 text-white',
  khamrah: 'bg-amber-800 text-white',
  'signature-men': 'bg-slate-900 text-white',
  'nivea-face-wash': 'bg-blue-800 text-white',
  'dove-soap': 'bg-sky-700 text-white',
  'signature-women': 'bg-rose-700 text-white',
};

const COLLECTION_LABELS: Record<string, string> = {
  'nine-collection': 'The 9 Collection',
  hawas: 'Rasasi Hawas',
  cerave: 'CeraVe Skincare',
  'badee-al-oud': "Bade'e Al Oud",
  medix: 'Medix 5.5 Body Care',
  'head-shoulders': 'Head & Shoulders',
  'nivea-shower-gel': 'Nivea Men Shower Gels',
  khamrah: 'Lattafa Khamrah',
  'signature-men': "Men's Signature Fragrances",
  'nivea-face-wash': 'Nivea Men Face Wash',
  'dove-soap': 'Dove Beauty Bars',
  'signature-women': "Women's Signature Fragrances",
};

const FRAGRANCE_COLLECTIONS = new Set([
  'nine-collection', 'hawas', 'badee-al-oud', 'khamrah', 'signature-men', 'signature-women',
]);
const SKIN_BODY_COLLECTIONS = new Set(['cerave', 'medix', 'dove-soap']);
const GROOMING_COLLECTIONS = new Set(['nivea-face-wash', 'nivea-shower-gel']);

interface ApiProduct {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  priceUSD: number;
  originalPriceUSD?: number;
  image?: string;
  badge?: string;
  collectionSlug: string;
  isBestSeller?: boolean;
  notesTop?: string[];
  notesMiddle?: string[];
  notesBase?: string[];
}

function toHomeProduct(product: ApiProduct): HomeProduct {
  const isFragrance = FRAGRANCE_COLLECTIONS.has(product.collectionSlug);
  const isHairCare = product.collectionSlug === 'head-shoulders';
  const category: HomeProduct['category'] = isFragrance
    ? 'fragrance'
    : isHairCare
      ? 'haircare'
      : GROOMING_COLLECTIONS.has(product.collectionSlug)
        ? 'grooming'
        : product.collectionSlug === 'medix' || product.collectionSlug === 'dove-soap'
          ? 'bodycare'
          : 'skincare';
  const notes = [...(product.notesTop || []), ...(product.notesMiddle || []), ...(product.notesBase || [])];

  return {
    id: product.id,
    name: product.name,
    tagline: product.tagline || 'Authentic imported care, available in Juba',
    description: product.description || product.tagline || 'Shop this authentic product from Juba Fashion Hub.',
    notes: notes.length ? notes.join(' · ') : 'Authentic imported product · Carefully selected by Juba Fashion Hub',
    priceUSD: Number(product.priceUSD || 0),
    originalPriceUSD: Number(product.originalPriceUSD || product.priceUSD || 0),
    image: product.image || '/images/juba_fashion_hub_logo.jpg',
    badge: product.badge || (product.isBestSeller ? '🔥 Best Seller' : '✨ Available Now'),
    collectionSlug: product.collectionSlug,
    collectionLabel: COLLECTION_LABELS[product.collectionSlug] || product.collectionSlug,
    category,
  };
}

function ProductCard({
  product,
  onTap,
}: {
  product: HomeProduct;
  key?: string;
  onTap: (p: HomeProduct) => void;
}) {
  const colColor = COLLECTION_COLORS[product.collectionSlug] || 'bg-slate-800 text-white';

  return (
    <div
      className="shrink-0 w-40 sm:w-52 group cursor-pointer"
      onClick={() => onTap(product)}
    >
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md active:scale-[0.97] transition-all overflow-hidden">
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
        <div className="p-3 space-y-1.5">
          <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-full ${colColor}`}>
            {product.collectionLabel}
          </span>
          <h3 className="text-xs font-black text-slate-900 leading-tight line-clamp-2">{product.name}</h3>
          <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-1">{product.tagline}</p>

          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-black text-[#B24BF3]">${product.priceUSD}</span>
            <span className="text-[10px] text-slate-400 line-through">${product.originalPriceUSD}</span>
          </div>

          {/* Tap hint */}
          <p className="text-[9px] text-slate-400 font-semibold">Tap for details & add to cart →</p>
        </div>
      </div>
    </div>
  );
}

function ProductRow({
  title,
  emoji,
  subtitle,
  products,
  viewAllHref,
  onTap,
}: {
  key?: string;
  title: string;
  emoji: string;
  subtitle: string;
  products: HomeProduct[];
  viewAllHref?: string;
  onTap: (p: HomeProduct) => void;
}) {
  return (
    <div className="space-y-4">
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

      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-3 px-4 sm:px-6 lg:px-8 pb-2">
          {products.map((p) => (
            <ProductCard
              key={`${p.collectionSlug}-${p.id}`}
              product={p}
              onTap={onTap}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export const ProductShowcase: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<HomeProduct | null>(null);
  const [catalogue, setCatalogue] = useState<HomeProduct[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then((response) => (response.ok ? response.json() : []))
      .then((products: ApiProduct[]) => {
        if (Array.isArray(products)) setCatalogue(products.map(toHomeProduct));
      })
      .catch(() => {});
  }, []);

  const categoryRows = useMemo(() => [
    {
      title: 'Perfumes & Fragrances',
      emoji: '🌹',
      subtitle: 'Signature scents for women and men — from fresh daytime sprays to deep evening oud',
      products: catalogue.filter((product) => FRAGRANCE_COLLECTIONS.has(product.collectionSlug)),
    },
    {
      title: 'Skin & Body Care',
      emoji: '✨',
      subtitle: 'Cleansers, treatment lotions and nourishing beauty bars for everyday care',
      products: catalogue.filter((product) => SKIN_BODY_COLLECTIONS.has(product.collectionSlug)),
    },
    {
      title: "Men's Grooming",
      emoji: '🧔🏿',
      subtitle: 'Face washes and shower gels made for freshness, oil control and daily confidence',
      products: catalogue.filter((product) => GROOMING_COLLECTIONS.has(product.collectionSlug)),
    },
    {
      title: 'Hair & Scalp Care',
      emoji: '🫧',
      subtitle: 'Anti-dandruff shampoos for cleaner roots, smoother hair and flake-free confidence',
      products: catalogue.filter((product) => product.collectionSlug === 'head-shoulders'),
    },
  ].filter((row) => row.products.length > 0), [catalogue]);

  return (
    <section className="py-10 sm:py-14 space-y-10 sm:space-y-14 bg-[#FAF8FC]">
      <ProductRow
        emoji="🔥"
        title="Best Sellers"
        subtitle="The most loved products across every Juba Fashion Hub collection"
        products={BEST_SELLERS}
        onTap={setSelectedProduct}
      />

      {categoryRows.length > 0 && (
        <div className="pt-2 space-y-10 sm:space-y-14">
          <div className="text-center px-4">
            <span className="inline-flex px-3 py-1 rounded-full bg-purple-100 text-[#B24BF3] text-[10px] sm:text-xs font-black uppercase tracking-widest mb-3">
              Shop Every Product
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900">Browse by Category</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">Tap any item for full details and quick add-to-cart.</p>
          </div>

          {categoryRows.map((row) => (
            <ProductRow
              key={row.title}
              emoji={row.emoji}
              title={row.title}
              subtitle={row.subtitle}
              products={row.products}
              onTap={setSelectedProduct}
            />
          ))}
        </div>
      )}
      <ProductRow
        emoji="✨"
        title="New Arrivals"
        subtitle="Fresh drops — just landed in Juba. Be the first to own them."
        products={NEW_ARRIVALS}
        onTap={setSelectedProduct}
      />

      {selectedProduct && (
        <HomeProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  );
};
