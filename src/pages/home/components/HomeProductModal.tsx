import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { HomeProduct } from '../data/featuredProducts';

const COLLECTION_PATHS: Record<string, string> = {
  'nine-collection': '/collections/9pm',
  hawas: '/collections/hawas',
  cerave: '/collections/cerave',
  'badee-al-oud': '/collections/badee-al-oud',
  medix: '/collections/medix',
  'head-shoulders': '/collections/head-shoulders',
  'nivea-shower-gel': '/collections/nivea-shower-gel',
  khamrah: '/collections/khamrah',
  'signature-men': '/collections/signature-men',
  'nivea-face-wash': '/collections/nivea-face-wash',
  'dove-soap': '/collections/dove-beauty-bars',
  'signature-women': '/collections/signature-women',
};

const COLLECTION_BADGE_COLORS: Record<string, string> = {
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

interface HomeProductModalProps {
  product: HomeProduct;
  onClose: () => void;
}

export const HomeProductModal: React.FC<HomeProductModalProps> = ({ product, onClose }) => {
  const navigate = useNavigate();
  const colPath = COLLECTION_PATHS[product.collectionSlug] || '/';
  const colColor = COLLECTION_BADGE_COLORS[product.collectionSlug] || 'bg-slate-800 text-white';

  const handleAddToCart = () => {
    // Navigate to the collection with a query param so the collection page
    // can auto-add this product to the cart and open the drawer immediately.
    navigate(`${colPath}?addProduct=${product.id}`);
    onClose();
  };

  const handleShopCollection = () => {
    navigate(colPath);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 text-slate-500 hover:text-slate-900 shadow-sm cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product image */}
        <div className="relative bg-slate-50 rounded-t-3xl sm:rounded-t-3xl h-64 sm:h-80 flex items-center justify-center overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain p-6"
            referrerPolicy="no-referrer"
          />
          {/* Badge */}
          <span className="absolute top-4 left-4 text-[11px] font-black px-3 py-1 rounded-full bg-[#B24BF3] text-white shadow-sm">
            {product.badge}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Collection tag + name */}
          <div className="space-y-1.5">
            <span className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full ${colColor}`}>
              {product.collectionLabel}
            </span>
            <h2 className="text-xl font-black text-slate-900 leading-tight">{product.name}</h2>
            <p className="text-sm font-semibold text-slate-500 italic">{product.tagline}</p>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#B24BF3]">${product.priceUSD}</span>
            <span className="text-sm text-slate-400 line-through">${product.originalPriceUSD}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Save ${product.originalPriceUSD - product.priceUSD}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>

          {/* Notes / Ingredients */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-gray-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              {product.category === 'skincare' ? 'Key Ingredients' : 'Fragrance Notes'}
            </p>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">{product.notes}</p>
          </div>

          {/* Delivery trust badge */}
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-amber-50 border border-amber-100 px-3 py-2 rounded-xl">
            <span>🚀</span>
            <span className="font-semibold">Free express delivery across Juba · Under 120 mins · 100% Authentic</span>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-1 pb-2">
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-[#B24BF3] hover:bg-[#9f35e3] text-white font-black text-sm shadow-md transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Cart
            </button>
            <button
              onClick={handleShopCollection}
              className="w-full flex items-center justify-center gap-1.5 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all cursor-pointer"
            >
              See full {product.collectionLabel} collection
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
