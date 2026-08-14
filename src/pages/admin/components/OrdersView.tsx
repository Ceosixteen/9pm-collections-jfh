import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Search, CheckCircle2, XCircle, Send } from 'lucide-react';
import { adminFetch, AdminUnauthorizedError } from '../lib/api';
import { AdminOrder, STORE_LABELS } from '../types';
import { Panel } from './Panel';

interface OrdersViewProps {
  onUnauthorized: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onUnauthorized }) => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [resendingId, setResendingId] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      const data = await adminFetch<AdminOrder[]>('/api/orders');
      setOrders(data);
    } catch (err) {
      if (err instanceof AdminUnauthorizedError) onUnauthorized();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stores = useMemo(() => {
    const slugs = new Set(orders.map((o) => o.storeSlug || 'nine-collection'));
    return Array.from(slugs);
  }, [orders]);

  const filtered = orders.filter((o) => {
    const slug = o.storeSlug || 'nine-collection';
    if (storeFilter !== 'all' && slug !== storeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.customerName?.toLowerCase().includes(q) ||
        o.customerPhone?.toLowerCase().includes(q) ||
        o.id?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleResend = async (id: string) => {
    setResendingId(id);
    try {
      await adminFetch(`/api/orders/${id}/resend-telegram`, { method: 'POST' });
      await loadOrders();
    } catch (err) {
      if (err instanceof AdminUnauthorizedError) onUnauthorized();
    } finally {
      setResendingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading orders...</span>
      </div>
    );
  }

  return (
    <Panel
      title="All Orders"
      subtitle={`${filtered.length} of ${orders.length} orders`}
      action={
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, ID..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#B24BF3] w-40 sm:w-56"
            />
          </div>
          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#B24BF3]"
          >
            <option value="all">All Collections</option>
            {stores.map((s) => (
              <option key={s} value={s}>{STORE_LABELS[s] || s}</option>
            ))}
          </select>
        </div>
      }
    >
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-slate-500 border-b border-white/10">
              <th className="pb-2.5 font-bold pr-3">Order</th>
              <th className="pb-2.5 font-bold pr-3">Customer</th>
              <th className="pb-2.5 font-bold pr-3">Collection</th>
              <th className="pb-2.5 font-bold pr-3">Items</th>
              <th className="pb-2.5 font-bold pr-3">Total</th>
              <th className="pb-2.5 font-bold pr-3">Telegram</th>
              <th className="pb-2.5 font-bold">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 pr-3 font-bold text-white whitespace-nowrap">#{o.id}</td>
                <td className="py-3 pr-3">
                  <p className="font-semibold text-slate-200">{o.customerName}</p>
                  <p className="text-slate-500 text-[10px]">{o.customerPhone}</p>
                </td>
                <td className="py-3 pr-3 text-slate-400 whitespace-nowrap">
                  {STORE_LABELS[o.storeSlug || 'nine-collection'] || o.storeSlug}
                </td>
                <td className="py-3 pr-3 text-slate-400 max-w-[220px] truncate">
                  {o.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')}
                </td>
                <td className="py-3 pr-3 font-black text-[#B24BF3] whitespace-nowrap">
                  ${o.totalUSD}
                </td>
                <td className="py-3 pr-3">
                  {o.telegramNotified ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Sent
                    </span>
                  ) : (
                    <button
                      onClick={() => handleResend(o.id)}
                      disabled={resendingId === o.id}
                      className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 cursor-pointer disabled:opacity-50"
                    >
                      {resendingId === o.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      <span className="underline decoration-dotted">Resend</span>
                      <Send className="w-3 h-3" />
                    </button>
                  )}
                </td>
                <td className="py-3 text-slate-500 whitespace-nowrap">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-xs text-slate-500 py-8 text-center">No orders match this view.</p>
        )}
      </div>
    </Panel>
  );
};
