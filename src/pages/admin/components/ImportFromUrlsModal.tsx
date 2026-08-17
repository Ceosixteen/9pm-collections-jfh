import React, { useState } from 'react';
import { X, Loader2, Globe, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { adminFetch, AdminUnauthorizedError } from '../lib/api';
import { AdminProduct, STORE_LABELS } from '../types';

interface ImportFromUrlsModalProps {
  knownCollections: string[];
  onClose: () => void;
  onImported: () => void;
  onUnauthorized: () => void;
  onEditProduct: (product: AdminProduct) => void;
}

interface ImportResult {
  url: string;
  success: boolean;
  product?: AdminProduct;
  error?: string;
}

const MAX_URLS = 8;

export const ImportFromUrlsModal: React.FC<ImportFromUrlsModalProps> = ({
  knownCollections, onClose, onImported, onUnauthorized, onEditProduct,
}) => {
  const [rawUrls, setRawUrls] = useState('');
  const [collectionSlug, setCollectionSlug] = useState(knownCollections[0] || '');
  const [isImporting, setIsImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const urlCount = rawUrls.split('\n').map((l) => l.trim()).filter(Boolean).length;

  const handleImport = async () => {
    const urls = rawUrls.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!urls.length) {
      setError('Paste at least one product link.');
      return;
    }
    if (!collectionSlug.trim()) {
      setError('Choose which collection these products belong to.');
      return;
    }
    setIsImporting(true);
    setError(null);
    setResults(null);
    try {
      const data = await adminFetch<{ results: ImportResult[] }>('/api/admin/products/import-urls', {
        method: 'POST',
        body: JSON.stringify({ urls: urls.slice(0, MAX_URLS), collectionSlug: collectionSlug.trim() }),
      });
      setResults(data.results);
      onImported(); // refresh the table behind the modal
    } catch (err: any) {
      if (err instanceof AdminUnauthorizedError) onUnauthorized();
      else setError(err?.message || 'Import failed. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[#141419] border border-white/10 shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 bg-[#141419] border-b border-white/10 z-10">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#B24BF3]" />
              Import Products from Links
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Paste product page links — we'll scrape, translate, and rewrite each one. Nothing goes live until you review it.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-500 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!results && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Product Links (one per line, up to {MAX_URLS})
                </label>
                <textarea
                  value={rawUrls}
                  onChange={(e) => setRawUrls(e.target.value)}
                  rows={7}
                  placeholder={'https://example.com/product/perfume-1\nhttps://example.com/product/perfume-2'}
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#B24BF3] font-mono resize-none"
                />
                <p className="text-[10px] text-slate-600 mt-1">
                  {urlCount} link{urlCount === 1 ? '' : 's'} detected{urlCount > MAX_URLS ? ` — only the first ${MAX_URLS} will be used` : ''}
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Add to Collection</label>
                <input list="import-collection-slugs" value={collectionSlug} onChange={(e) => setCollectionSlug(e.target.value)}
                  placeholder="e.g. nine-collection"
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#B24BF3]" />
                <datalist id="import-collection-slugs">
                  {knownCollections.map((slug) => <option key={slug} value={slug}>{STORE_LABELS[slug] || slug}</option>)}
                </datalist>
              </div>

              <p className="text-[10px] text-slate-500 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 leading-relaxed">
                Works best on regular product pages. Sites that need JavaScript to show their content (some app-based stores) may come through with only a name — just fill in the rest after import.
              </p>

              {error && <p className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
            </>
          )}

          {results && (
            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {r.success
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          : <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                        <p className="text-xs font-bold text-white truncate">
                          {r.success ? r.product?.name : 'Import failed'}
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{r.url}</p>
                      {!r.success && <p className="text-[10px] text-red-400 mt-1">{r.error}</p>}
                      {r.success && r.product && (
                        <p className="text-[10px] text-slate-500 mt-1">
                          ${r.product.priceUSD || '?'} · saved as <span className="text-slate-400">Hidden</span> — ready for review
                        </p>
                      )}
                    </div>
                    {r.success && r.product && (
                      <button onClick={() => onEditProduct(r.product as AdminProduct)}
                        className="flex items-center gap-1 text-[11px] font-bold text-[#B24BF3] hover:underline cursor-pointer shrink-0">
                        Review <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <p className="text-[11px] text-slate-500 pt-1">
                {results.filter((r) => r.success).length} imported as drafts. Open each one, check the details, then switch "Visible in store" on when it's ready.
              </p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex items-center gap-2 px-5 py-4 bg-[#141419] border-t border-white/10">
          {!results ? (
            <>
              <button onClick={onClose} className="flex-1 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold cursor-pointer">
                Cancel
              </button>
              <button onClick={handleImport} disabled={isImporting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#B24BF3] hover:bg-[#9f35e3] text-white text-xs font-bold cursor-pointer disabled:opacity-60">
                {isImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                {isImporting ? 'Importing...' : 'Import'}
              </button>
            </>
          ) : (
            <button onClick={onClose} className="flex-1 py-2.5 rounded-full bg-[#B24BF3] hover:bg-[#9f35e3] text-white text-xs font-bold cursor-pointer">
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
