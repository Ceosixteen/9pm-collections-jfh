import React, { useState } from 'react';
import { X, Loader2, Upload, Save, Link2 } from 'lucide-react';
import { adminFetch, AdminUnauthorizedError } from '../lib/api';
import { AdminProduct, STORE_LABELS } from '../types';
import { uploadProductImage } from '../../../lib/firebaseClient';

interface ProductEditorModalProps {
  product: AdminProduct | null; // null = creating a new product
  knownCollections: string[];
  onClose: () => void;
  onSaved: () => void;
  onUnauthorized: () => void;
}

const EMPTY: AdminProduct = {
  id: '', collectionSlug: '', name: '', timeTag: '', tagline: '', description: '',
  priceUSD: 0, priceSSP: 0, originalPriceUSD: 0, originalPriceSSP: 0,
  rating: 4.8, reviewsCount: 0, image: '', stockCount: 10,
  isBestSeller: false, badge: '', projection: '', longevity: '', volume: '',
  concentration: '', bestTimeToWear: '', notBestTimeToWear: '',
  notesTop: [], notesMiddle: [], notesBase: [], fragranceFamily: '',
  sortOrder: 999, isActive: true,
};

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#B24BF3]';
const labelClass = 'block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1';

export const ProductEditorModal: React.FC<ProductEditorModalProps> = ({
  product, knownCollections, onClose, onSaved, onUnauthorized,
}) => {
  const [form, setForm] = useState<AdminProduct>(product ? { ...product } : { ...EMPTY });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof AdminProduct>(key: K, value: AdminProduct[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleImageFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      const url = await uploadProductImage(file);
      set('image', url);
    } catch (err: any) {
      setError(
        err?.code === 'storage/unauthorized'
          ? 'Firebase Storage rejected the upload. Enable Storage in the Firebase Console, or paste an image URL instead.'
          : `Upload failed: ${err?.message || 'unknown error'}. You can paste an image URL instead.`
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.collectionSlug.trim()) {
      setError('Name and Collection are required.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await adminFetch('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      onSaved();
      onClose();
    } catch (err: any) {
      if (err instanceof AdminUnauthorizedError) onUnauthorized();
      else setError(err?.message || 'Could not save this product.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#141419] border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 bg-[#141419] border-b border-white/10 z-10">
          <div>
            <h3 className="text-sm font-black text-white">
              {product ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {product ? product.id : 'A URL-friendly ID is generated from the name'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-500 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Image */}
          <div>
            <label className={labelClass}>Product Image</label>
            <div className="flex items-start gap-3">
              <div className="w-24 h-24 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                {form.image ? (
                  <img src={form.image} alt="" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[10px] text-slate-600 text-center px-2">No image</span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#B24BF3] hover:bg-[#9f35e3] text-white text-xs font-bold cursor-pointer transition-all">
                  {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageFile(file);
                    }}
                  />
                </label>
                <div className="relative">
                  <Link2 className="w-3 h-3 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    value={form.image}
                    onChange={(e) => set('image', e.target.value)}
                    placeholder="...or paste an image URL / path"
                    className={inputClass + ' pl-7'}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Core fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelClass}>Name *</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. 9PM Rebel by Afnan" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Collection *</label>
              <input list="collection-slugs" value={form.collectionSlug}
                onChange={(e) => set('collectionSlug', e.target.value)}
                placeholder="e.g. nine-collection" className={inputClass} />
              <datalist id="collection-slugs">
                {knownCollections.map((slug) => (
                  <option key={slug} value={slug}>{STORE_LABELS[slug] || slug}</option>
                ))}
              </datalist>
            </div>
            <div>
              <label className={labelClass}>Category Tag</label>
              <input value={form.timeTag} onChange={(e) => set('timeTag', e.target.value)}
                placeholder="e.g. 9PM / DAY / CLEANSE" className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Tagline</label>
              <input value={form.tagline} onChange={(e) => set('tagline', e.target.value)}
                placeholder="e.g. Pineapple, Caramel & Dry Woods" className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Description</label>
              <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
                rows={3} placeholder="Full product description shown on the product page"
                className={inputClass + ' resize-none'} />
            </div>
          </div>

          {/* Pricing */}
          <div>
            <p className="text-[10px] font-black text-[#B24BF3] uppercase tracking-widest mb-2">Pricing & Stock</p>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className={labelClass}>Price USD *</label>
                <input type="number" value={form.priceUSD || ''}
                  onChange={(e) => set('priceUSD', Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Was USD</label>
                <input type="number" value={form.originalPriceUSD || ''}
                  onChange={(e) => set('originalPriceUSD', Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Stock</label>
                <input type="number" value={form.stockCount}
                  onChange={(e) => set('stockCount', Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Sort Order</label>
                <input type="number" value={form.sortOrder}
                  onChange={(e) => set('sortOrder', Number(e.target.value))} className={inputClass} />
              </div>
            </div>
            <p className="text-[10px] text-slate-600 mt-1.5">
              SSP prices are calculated automatically at 8,000 SSP per $1.
            </p>
          </div>

          {/* Marketing */}
          <div>
            <p className="text-[10px] font-black text-[#B24BF3] uppercase tracking-widest mb-2">Marketing</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={labelClass}>Badge</label>
                <input value={form.badge} onChange={(e) => set('badge', e.target.value)}
                  placeholder="e.g. 🔥 FEW LEFT - SOON FINISHING!" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Rating</label>
                <input type="number" step="0.1" max={5} value={form.rating}
                  onChange={(e) => set('rating', Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Reviews Count</label>
                <input type="number" value={form.reviewsCount}
                  onChange={(e) => set('reviewsCount', Number(e.target.value))} className={inputClass} />
              </div>
            </div>
            <div className="flex items-center gap-5 mt-3">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input type="checkbox" checked={form.isBestSeller}
                  onChange={(e) => set('isBestSeller', e.target.checked)}
                  className="accent-[#B24BF3] cursor-pointer" />
                Best Seller
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input type="checkbox" checked={form.isActive}
                  onChange={(e) => set('isActive', e.target.checked)}
                  className="accent-emerald-500 cursor-pointer" />
                Visible in store
              </label>
            </div>
          </div>

          {/* Details */}
          <div>
            <p className="text-[10px] font-black text-[#B24BF3] uppercase tracking-widest mb-2">
              Product Details
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Volume / Size</label>
                <input value={form.volume} onChange={(e) => set('volume', e.target.value)}
                  placeholder="e.g. 100ml" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Concentration / Type</label>
                <input value={form.concentration} onChange={(e) => set('concentration', e.target.value)}
                  placeholder="e.g. Eau de Parfum (EDP)" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Projection</label>
                <input value={form.projection} onChange={(e) => set('projection', e.target.value)}
                  placeholder="e.g. Beast Mode Sillage" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Longevity</label>
                <input value={form.longevity} onChange={(e) => set('longevity', e.target.value)}
                  placeholder="e.g. 8-10 hrs" className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Family / Skin Type</label>
                <input value={form.fragranceFamily} onChange={(e) => set('fragranceFamily', e.target.value)}
                  placeholder="e.g. Aromatic Amber Oud / Normal to Oily Skin" className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Top Notes / Key Ingredients (comma separated)</label>
                <input value={form.notesTop.join(', ')}
                  onChange={(e) => set('notesTop', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                  placeholder="Pineapple, Mandarin, Apple" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Middle Notes</label>
                <input value={form.notesMiddle.join(', ')}
                  onChange={(e) => set('notesMiddle', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                  placeholder="Vetiver, Oakmoss" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Base Notes</label>
                <input value={form.notesBase.join(', ')}
                  onChange={(e) => set('notesBase', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                  placeholder="Caramel, Amber, Cedar" className={inputClass} />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center gap-2 px-5 py-4 bg-[#141419] border-t border-white/10">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSaving || isUploading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#B24BF3] hover:bg-[#9f35e3] text-white text-xs font-bold cursor-pointer disabled:opacity-60">
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {isSaving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  );
};
