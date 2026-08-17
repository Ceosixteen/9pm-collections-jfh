import React, { useEffect, useState } from 'react';
import { X, Loader2, Save, Plus, Trash2 } from 'lucide-react';
import { adminFetch, AdminUnauthorizedError } from '../lib/api';
import { AdminCollection, AdminProduct, QuizOption } from '../types';

interface CollectionEditorModalProps {
  collection: AdminCollection | null; // null = creating new
  onClose: () => void;
  onSaved: () => void;
  onUnauthorized: () => void;
}

// The backend keeps quiz Q2 options and the value->productId result map as
// two separate structures. Editing is much easier as one combined list, so
// this local shape merges them and the save handler splits them back apart.
interface Q2OptionDraft extends QuizOption {
  resultProductId: string;
}

const EMPTY: AdminCollection = {
  id: '', routeSlug: '', label: '', category: 'fragrance',
  unitNounSingular: 'bottle', unitNounPlural: 'bottles', detailsLabel: 'Notes',
  navCategoryLabel: '', heroCategory: '', heroTitleMain: '', heroTitleAccent: '',
  heroDescription: '', heroCtaLabel: '', heroFinderCtaLabel: 'Find My Match',
  catalogTag: '', catalogTitle: '', catalogDescription: '', catalogAllLabel: 'All Products',
  bundleTitle: '', bundleMaxSavingsUSD: 25, bundleUnitLabel: 'PRODUCTS',
  deliverySteps: [
    { title: '1. Select Your Products', desc: '' },
    { title: '2. Juba Address & Readiness', desc: 'Provide your phone number & address in Juba. Please only order if you are ready to receive your delivery TODAY!' },
    { title: '3. Free 120-Min Delivery & Pay', desc: 'Delivered FREE across Juba in under 120 minutes! Pay cash (USD/SSP) on delivery, or bank transfer.' },
  ],
  quizTitle: 'Find Your Match', quizSubtitle: 'QUICK FINDER QUIZ',
  quizDescription: 'Answer 2 quick questions to discover your ideal match in Juba.',
  quizQ1: { text: '', options: [] },
  quizQ2: { text: '', options: [] },
  quizResultMap: {}, quizDefaultProductId: '',
  isActive: true, sortOrder: 999,
};

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#B24BF3]';
const labelClass = 'block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1';
const sectionTitleClass = 'text-[10px] font-black text-[#B24BF3] uppercase tracking-widest mb-2';

export const CollectionEditorModal: React.FC<CollectionEditorModalProps> = ({
  collection, onClose, onSaved, onUnauthorized,
}) => {
  const [form, setForm] = useState<AdminCollection>(collection ? { ...collection } : { ...EMPTY });
  const [q1Options, setQ1Options] = useState<QuizOption[]>(
    collection?.quizQ1?.options?.length ? collection.quizQ1.options : []
  );
  const [q2Options, setQ2Options] = useState<Q2OptionDraft[]>(
    collection?.quizQ2?.options?.length
      ? collection.quizQ2.options.map((o) => ({ ...o, resultProductId: collection.quizResultMap[o.value] || '' }))
      : []
  );
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch<AdminProduct[]>('/api/admin/products')
      .then((all) => setProducts(all.filter((p) => !form.id || p.collectionSlug === form.id)))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof AdminCollection>(key: K, value: AdminCollection[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const setStep = (idx: number, field: 'title' | 'desc', value: string) => {
    setForm((prev) => {
      const steps = [...prev.deliverySteps];
      steps[idx] = { ...steps[idx], [field]: value };
      return { ...prev, deliverySteps: steps };
    });
  };

  const addQ1Option = () => setQ1Options((prev) => [...prev, { value: `option-${prev.length + 1}`, emoji: '✨', label: '', description: '' }]);
  const updateQ1Option = (idx: number, field: keyof QuizOption, value: string) =>
    setQ1Options((prev) => prev.map((o, i) => (i === idx ? { ...o, [field]: value } : o)));
  const removeQ1Option = (idx: number) => setQ1Options((prev) => prev.filter((_, i) => i !== idx));

  const addQ2Option = () => setQ2Options((prev) => [...prev, { value: `match-${prev.length + 1}`, emoji: '', label: '', description: '', resultProductId: '' }]);
  const updateQ2Option = (idx: number, field: keyof Q2OptionDraft, value: string) =>
    setQ2Options((prev) => prev.map((o, i) => (i === idx ? { ...o, [field]: value } : o)));
  const removeQ2Option = (idx: number) => setQ2Options((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!form.label.trim()) {
      setError('Collection name is required.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const id = form.id || slugify(form.label);
      const routeSlug = form.routeSlug || slugify(form.label);
      const quizResultMap: Record<string, string> = {};
      q2Options.forEach((o) => { if (o.value && o.resultProductId) quizResultMap[o.value] = o.resultProductId; });

      const payload: AdminCollection = {
        ...form,
        id,
        routeSlug,
        quizQ1: { text: form.quizQ1.text, options: q1Options },
        quizQ2: { text: form.quizQ2.text, options: q2Options.map(({ resultProductId, ...rest }) => rest) },
        quizResultMap,
      };

      await adminFetch('/api/admin/collections', { method: 'POST', body: JSON.stringify(payload) });
      onSaved();
      onClose();
    } catch (err: any) {
      if (err instanceof AdminUnauthorizedError) onUnauthorized();
      else setError(err?.message || 'Could not save this collection.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#141419] border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 bg-[#141419] border-b border-white/10 z-10">
          <div>
            <h3 className="text-sm font-black text-white">{collection ? 'Edit Collection' : 'Add New Collection'}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {collection ? `/collections/${collection.routeSlug}` : 'Route + product-linking ID are generated from the name'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-500 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Basics */}
          <div>
            <p className={sectionTitleClass}>Basics</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={labelClass}>Collection Name *</label>
                <input value={form.label} onChange={(e) => set('label', e.target.value)}
                  placeholder="e.g. Emper Perfumes" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>URL Slug</label>
                <input value={form.routeSlug} onChange={(e) => set('routeSlug', e.target.value)}
                  placeholder={slugify(form.label) || 'auto-generated'} className={inputClass} />
                <p className="text-[10px] text-slate-600 mt-1">→ jubafashionhub.link/collections/{form.routeSlug || slugify(form.label) || '...'}</p>
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputClass}>
                  <option value="fragrance">Fragrance</option>
                  <option value="skincare">Skincare</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Unit Noun — Singular</label>
                <input value={form.unitNounSingular} onChange={(e) => set('unitNounSingular', e.target.value)}
                  placeholder="bottle" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Unit Noun — Plural</label>
                <input value={form.unitNounPlural} onChange={(e) => set('unitNounPlural', e.target.value)}
                  placeholder="bottles" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Nav Menu Label</label>
                <input value={form.navCategoryLabel} onChange={(e) => set('navCategoryLabel', e.target.value)}
                  placeholder="e.g. Emper Collection" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} className={inputClass} />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)}
                  className="accent-emerald-500 cursor-pointer" />
                Visible / live
              </label>
            </div>
          </div>

          {/* Hero */}
          <div>
            <p className={sectionTitleClass}>Hero Section</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={labelClass}>Category Tag (small text above headline)</label>
                <input value={form.heroCategory} onChange={(e) => set('heroCategory', e.target.value)}
                  placeholder="e.g. EMPER PERFUME COLLECTION" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Headline — Main</label>
                <input value={form.heroTitleMain} onChange={(e) => set('heroTitleMain', e.target.value)}
                  placeholder="e.g. Emper Perfumes," className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Headline — Accent (purple)</label>
                <input value={form.heroTitleAccent} onChange={(e) => set('heroTitleAccent', e.target.value)}
                  placeholder="e.g. timeless elegance." className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Description</label>
                <textarea value={form.heroDescription} onChange={(e) => set('heroDescription', e.target.value)}
                  rows={2} className={inputClass + ' resize-none'} />
              </div>
              <div>
                <label className={labelClass}>Shop Button Label</label>
                <input value={form.heroCtaLabel} onChange={(e) => set('heroCtaLabel', e.target.value)}
                  placeholder="e.g. Shop Emper" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Quiz Button Label</label>
                <input value={form.heroFinderCtaLabel} onChange={(e) => set('heroFinderCtaLabel', e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Catalog */}
          <div>
            <p className={sectionTitleClass}>Product Catalogue Section</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Tag</label>
                <input value={form.catalogTag} onChange={(e) => set('catalogTag', e.target.value)}
                  placeholder="e.g. VIRAL PERFUME CATALOG" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>"All Products" Tab Label</label>
                <input value={form.catalogAllLabel} onChange={(e) => set('catalogAllLabel', e.target.value)} className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Title</label>
                <input value={form.catalogTitle} onChange={(e) => set('catalogTitle', e.target.value)}
                  placeholder="e.g. Trending in Juba" className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Description</label>
                <input value={form.catalogDescription} onChange={(e) => set('catalogDescription', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Details Panel Label</label>
                <input value={form.detailsLabel} onChange={(e) => set('detailsLabel', e.target.value)}
                  placeholder="Notes / Details" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Bundles */}
          <div>
            <p className={sectionTitleClass}>Bundle Deals Section</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className={labelClass}>Title</label>
                <input value={form.bundleTitle} onChange={(e) => set('bundleTitle', e.target.value)}
                  placeholder="e.g. Special Bundle Deals" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Max Savings (USD)</label>
                <input type="number" value={form.bundleMaxSavingsUSD} onChange={(e) => set('bundleMaxSavingsUSD', Number(e.target.value))} className={inputClass} />
              </div>
              <div className="col-span-3">
                <label className={labelClass}>Unit Label (e.g. "BOTTLES" / "PRODUCTS")</label>
                <input value={form.bundleUnitLabel} onChange={(e) => set('bundleUnitLabel', e.target.value.toUpperCase())} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Delivery Steps */}
          <div>
            <p className={sectionTitleClass}>How Ordering Works (3 steps)</p>
            <div className="space-y-2">
              {form.deliverySteps.map((step, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                  <input value={step.title} onChange={(e) => setStep(idx, 'title', e.target.value)}
                    placeholder={`Step ${idx + 1} title`} className={inputClass + ' font-bold'} />
                  <textarea value={step.desc} onChange={(e) => setStep(idx, 'desc', e.target.value)}
                    rows={2} placeholder="Step description" className={inputClass + ' resize-none'} />
                </div>
              ))}
            </div>
          </div>

          {/* Quiz */}
          <div>
            <p className={sectionTitleClass}>"Find Your Match" Quiz (optional — leave options empty to hide the quiz)</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className={labelClass}>Quiz Badge Text</label>
                <input value={form.quizSubtitle} onChange={(e) => set('quizSubtitle', e.target.value)}
                  placeholder="e.g. SCENT FINDER QUIZ" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Quiz Title</label>
                <input value={form.quizTitle} onChange={(e) => set('quizTitle', e.target.value)}
                  placeholder="e.g. Find Your Signature Fragrance" className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Quiz Description</label>
                <input value={form.quizDescription} onChange={(e) => set('quizDescription', e.target.value)} className={inputClass} />
              </div>
            </div>

            {/* Q1 */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-2 mb-2">
              <label className={labelClass}>Question 1 (for engagement — doesn't affect the result)</label>
              <input value={form.quizQ1.text} onChange={(e) => setForm((p) => ({ ...p, quizQ1: { ...p.quizQ1, text: e.target.value } }))}
                placeholder="e.g. When do you plan to wear this most in Juba?" className={inputClass} />
              <div className="space-y-1.5">
                {q1Options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <input value={opt.emoji} onChange={(e) => updateQ1Option(idx, 'emoji', e.target.value)}
                      placeholder="🌙" className={inputClass + ' w-12 text-center'} />
                    <input value={opt.label} onChange={(e) => updateQ1Option(idx, 'label', e.target.value)}
                      placeholder="Option label" className={inputClass} />
                    <input value={opt.description} onChange={(e) => updateQ1Option(idx, 'description', e.target.value)}
                      placeholder="Short description" className={inputClass} />
                    <button onClick={() => removeQ1Option(idx)} className="p-2 text-slate-500 hover:text-red-400 cursor-pointer shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={addQ1Option} className="flex items-center gap-1 text-[11px] font-bold text-[#B24BF3] hover:underline cursor-pointer">
                <Plus className="w-3 h-3" /> Add option
              </button>
            </div>

            {/* Q2 */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
              <label className={labelClass}>Question 2 (determines the matched product)</label>
              <input value={form.quizQ2.text} onChange={(e) => setForm((p) => ({ ...p, quizQ2: { ...p.quizQ2, text: e.target.value } }))}
                placeholder="e.g. Which notes sound most appealing?" className={inputClass} />
              <div className="space-y-1.5">
                {q2Options.map((opt, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_1fr_140px_28px] gap-1.5 items-center">
                    <input value={opt.label} onChange={(e) => updateQ2Option(idx, 'label', e.target.value)}
                      placeholder="Option label" className={inputClass} />
                    <input value={opt.description} onChange={(e) => updateQ2Option(idx, 'description', e.target.value)}
                      placeholder="Short description" className={inputClass} />
                    <select value={opt.resultProductId} onChange={(e) => updateQ2Option(idx, 'resultProductId', e.target.value)} className={inputClass}>
                      <option value="">Matches product...</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <button onClick={() => removeQ2Option(idx)} className="p-2 text-slate-500 hover:text-red-400 cursor-pointer shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={addQ2Option} className="flex items-center gap-1 text-[11px] font-bold text-[#B24BF3] hover:underline cursor-pointer">
                <Plus className="w-3 h-3" /> Add option
              </button>
              <div className="pt-1">
                <label className={labelClass}>Default / Fallback Match</label>
                <select value={form.quizDefaultProductId} onChange={(e) => set('quizDefaultProductId', e.target.value)} className={inputClass}>
                  <option value="">Select a fallback product...</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center gap-2 px-5 py-4 bg-[#141419] border-t border-white/10">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#B24BF3] hover:bg-[#9f35e3] text-white text-xs font-bold cursor-pointer disabled:opacity-60">
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {isSaving ? 'Saving...' : 'Save Collection'}
          </button>
        </div>
      </div>
    </div>
  );
};
