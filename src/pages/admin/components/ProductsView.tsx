import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Loader2, Search, Plus, Pencil, Trash2, Download, Upload, Package, EyeOff, Star,
} from 'lucide-react';
import { adminFetch, AdminUnauthorizedError } from '../lib/api';
import { AdminProduct, STORE_LABELS } from '../types';
import { Panel } from './Panel';
import { ProductEditorModal } from './ProductEditorModal';
import { toCsv, parseCsv, downloadCsv } from '../lib/csv';

interface ProductsViewProps {
  onUnauthorized: () => void;
}

// Column order used for both CSV export and import.
const CSV_COLUMNS = [
  'id', 'collectionSlug', 'name', 'timeTag', 'tagline', 'description',
  'priceUSD', 'originalPriceUSD', 'stockCount', 'badge', 'isBestSeller', 'isActive',
  'image', 'rating', 'reviewsCount', 'projection', 'longevity', 'volume',
  'concentration', 'fragranceFamily', 'notesTop', 'notesMiddle', 'notesBase', 'sortOrder',
];

export const ProductsView: React.FC<ProductsViewProps> = ({ onUnauthorized }) => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [collectionFilter, setCollectionFilter] = useState('all');
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const data = await adminFetch<AdminProduct[]>('/api/admin/products');
      setProducts(data);
    } catch (err) {
      if (err instanceof AdminUnauthorizedError) onUnauthorized();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const collections = useMemo(
    () => Array.from(new Set(products.map((p) => p.collectionSlug))).filter(Boolean).sort(),
    [products]
  );

  const filtered = products.filter((p) => {
    if (collectionFilter !== 'all' && p.collectionSlug !== collectionFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    }
    return true;
  });

  const handleDelete = async (product: AdminProduct) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeletingId(product.id);
    try {
      await adminFetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      if (err instanceof AdminUnauthorizedError) onUnauthorized();
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = () => {
    const csv = toCsv(products as unknown as Record<string, unknown>[], CSV_COLUMNS);
    downloadCsv(`juba-fashion-hub-products-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const handleImport = async (file: File) => {
    setImportStatus('Reading file...');
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (!rows.length) {
        setImportStatus('❌ No rows found. Make sure the file has a header row.');
        return;
      }
      const missingName = rows.filter((r) => !r.name?.trim()).length;
      if (missingName === rows.length) {
        setImportStatus('❌ No "name" column found. Export a CSV first to see the expected format.');
        return;
      }
      setImportStatus(`Importing ${rows.length} rows...`);
      const result = await adminFetch<{ savedCount: number; failedCount: number }>(
        '/api/admin/products/bulk',
        { method: 'POST', body: JSON.stringify({ products: rows }) }
      );
      setImportStatus(
        `✅ Imported ${result.savedCount} product${result.savedCount === 1 ? '' : 's'}` +
        (result.failedCount ? ` · ${result.failedCount} skipped` : '')
      );
      await load();
    } catch (err: any) {
      if (err instanceof AdminUnauthorizedError) onUnauthorized();
      else setImportStatus(`❌ Import failed: ${err?.message || 'unknown error'}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setImportStatus(null), 8000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading products...</span>
      </div>
    );
  }

  return (
    <>
      <Panel
        title="Product Catalogue"
        subtitle={`${filtered.length} of ${products.length} products across ${collections.length} collections`}
        action={
          <div className="flex items-center gap-2">
            <button onClick={handleExport}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold cursor-pointer">
              <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold cursor-pointer">
              <Upload className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Import CSV</span>
            </button>
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport(f); }} />
            <button onClick={() => setIsCreating(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B24BF3] hover:bg-[#9f35e3] text-white text-xs font-bold cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Add Product
            </button>
          </div>
        }
      >
        {/* Filters */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ID..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#B24BF3]" />
          </div>
          <select value={collectionFilter} onChange={(e) => setCollectionFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#B24BF3]">
            <option value="all">All Collections</option>
            {collections.map((slug) => (
              <option key={slug} value={slug}>{STORE_LABELS[slug] || slug}</option>
            ))}
          </select>
        </div>

        {importStatus && (
          <p className="text-[11px] text-slate-300 bg-white/5 border border-white/10 rounded-lg px-3 py-2 mb-3">
            {importStatus}
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No products match this view.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500 border-b border-white/10">
                  <th className="pb-2.5 font-bold pr-3">Product</th>
                  <th className="pb-2.5 font-bold pr-3">Collection</th>
                  <th className="pb-2.5 font-bold pr-3">Price</th>
                  <th className="pb-2.5 font-bold pr-3">Stock</th>
                  <th className="pb-2.5 font-bold pr-3">Status</th>
                  <th className="pb-2.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 shrink-0 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                          {p.image
                            ? <img src={p.image} alt="" className="w-full h-full object-contain" />
                            : <Package className="w-4 h-4 text-slate-700" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate max-w-[200px] flex items-center gap-1.5">
                            {p.name}
                            {p.isBestSeller && <Star className="w-3 h-3 text-amber-400 shrink-0 fill-amber-400" />}
                          </p>
                          <p className="text-[10px] text-slate-600">{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 text-slate-400 whitespace-nowrap">
                      {STORE_LABELS[p.collectionSlug] || p.collectionSlug}
                    </td>
                    <td className="py-2.5 pr-3 whitespace-nowrap">
                      <span className="font-black text-[#B24BF3]">${p.priceUSD}</span>
                      {p.originalPriceUSD > p.priceUSD && (
                        <span className="text-slate-600 line-through ml-1.5">${p.originalPriceUSD}</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-3">
                      <span className={p.stockCount <= 3 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                        {p.stockCount}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">
                      {p.isActive ? (
                        <span className="text-emerald-400 text-[10px] font-bold">Live</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 text-[10px] font-bold">
                          <EyeOff className="w-3 h-3" /> Hidden
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-right whitespace-nowrap">
                      <button onClick={() => setEditing(p)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(p)} disabled={deletingId === p.id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer disabled:opacity-50">
                        {deletingId === p.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {(editing || isCreating) && (
        <ProductEditorModal
          product={editing}
          knownCollections={collections}
          onClose={() => { setEditing(null); setIsCreating(false); }}
          onSaved={load}
          onUnauthorized={onUnauthorized}
        />
      )}
    </>
  );
};
