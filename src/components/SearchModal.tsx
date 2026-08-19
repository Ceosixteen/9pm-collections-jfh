import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ShoppingBag, TrendingUp, Loader2 } from 'lucide-react';

interface SearchProduct {
  id: string;
  name: string;
  tagline: string;
  image: string;
  priceUSD: number;
  originalPriceUSD: number;
  collectionSlug: string;
  isBestSeller: boolean;
}

const COLLECTION_PATHS: Record<string, string> = {
  'nine-collection': '/collections/9pm',
  hawas: '/collections/hawas',
  cerave: '/collections/cerave',
  'badee-al-oud': '/collections/badee-al-oud',
  medix: '/collections/medix',
};

const COLLECTION_LABELS: Record<string, string> = {
  'nine-collection': 'The 9 Collection',
  hawas: 'Rasasi Hawas',
  cerave: 'CeraVe Skincare',
  'badee-al-oud': "Bade'e Al Oud",
  medix: 'Medix 5.5 Body Care',
};

interface SearchModalProps {
  onClose: () => void;
}

// Site-wide product search, reachable from every page's header. Loads the
// full catalogue once (small enough — a couple dozen products — that a
// simple client-side filter beats the complexity of a real search endpoint),
// shows best-sellers as tappable "Popular Searches" before typing, and
// results as you type. Picking a result jumps straight to that product's
// collection page with it already added to the cart, reusing the same
// ?addProduct= mechanism the homepage showcase uses.
export const SearchModal: React.FC<SearchModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    fetch('/api/products')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const popularSearches = useMemo(
    () => products.filter((p) => p.isBestSeller).slice(0, 6),
    [products]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.tagline || '').toLowerCase().includes(q) ||
          (COLLECTION_LABELS[p.collectionSlug] || '').toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [products, query]);

  const goToProduct = (p: SearchProduct) => {
    const path = COLLECTION_PATHS[p.collectionSlug] || '/';
    navigate(`${path}?addProduct=${p.id}`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-24 bg-slate-900/70 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg max-h-[80vh] overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col">
        {/* Search input */}
        <div className="flex items-center gap-2 p-3 sm:p-4 border-b border-gray-100 shrink-0">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search perfumes, skincare, collections..."
            className="flex-1 min-w-0 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:text-gray-800 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Loading catalogue...</span>
            </div>
          ) : query.trim() ? (
            results.length === 0 ? (
              <div className="py-12 text-center space-y-1">
                <p className="text-sm font-bold text-slate-700">No matches for "{query}"</p>
                <p className="text-xs text-slate-500">Try a product name or collection, like "CeraVe" or "Hawas".</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {results.map((p) => (
                  <button
                    key={`${p.collectionSlug}-${p.id}`}
                    onClick={() => goToProduct(p)}
                    className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-purple-50 transition-all cursor-pointer text-left"
                  >
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-50 border border-gray-100 overflow-hidden flex items-center justify-center">
                      {p.image ? (
                        <img src={p.image} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <ShoppingBag className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{COLLECTION_LABELS[p.collectionSlug] || p.collectionSlug}</p>
                    </div>
                    <span className="text-xs font-black text-[#B24BF3] shrink-0">${p.priceUSD}</span>
                  </button>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                <TrendingUp className="w-3 h-3" />
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2 px-1">
                {popularSearches.map((p) => (
                  <button
                    key={`${p.collectionSlug}-${p.id}`}
                    onClick={() => goToProduct(p)}
                    className="px-3 py-2 rounded-full bg-slate-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 text-xs font-bold text-slate-700 hover:text-[#B24BF3] transition-all cursor-pointer"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 px-1 pt-2">
                Or type a product name, ingredient, or collection above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
