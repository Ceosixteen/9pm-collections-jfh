import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Search, CheckCircle2, XCircle, Send, MapPin, Tag, X, MessageSquare, Trash2 } from 'lucide-react';
import { adminFetch, AdminUnauthorizedError } from '../lib/api';
import { AdminOrder, STORE_LABELS } from '../types';
import { Panel } from './Panel';

interface OrdersViewProps {
  onUnauthorized: () => void;
}

const PAYMENT_LABELS: Record<string, string> = {
  cod: 'Cash on Delivery',
  bank_transfer: 'Bank Transfer',
  'm-gurush': 'm-GURUSH',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  canceled: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export const OrdersView: React.FC<OrdersViewProps> = ({ onUnauthorized }) => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingChange, setPendingChange] = useState<{ id: string; status: 'delivered' | 'canceled'; customerName: string } | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);

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

  // Reverting to "pending" needs no explanation, so it submits instantly.
  // Marking delivered/canceled opens a small modal first so the admin can
  // optionally attach a note the customer will see on their order.
  const handleStatusChange = (id: string, status: string) => {
    if (status === 'delivered' || status === 'canceled') {
      const order = orders.find((o) => o.id === id);
      setStatusMessage('');
      setPendingChange({ id, status, customerName: order?.customerName || 'this customer' });
      return;
    }
    submitStatusChange(id, status);
  };

  const submitStatusChange = async (id: string, status: string, message?: string) => {
    setUpdatingId(id);
    // Optimistic update so it feels instant.
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, deliveryStatus: status as AdminOrder['deliveryStatus'], adminMessage: message ?? o.adminMessage } : o)));
    try {
      await adminFetch(`/api/orders/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status, message }),
      });
    } catch (err) {
      if (err instanceof AdminUnauthorizedError) onUnauthorized();
      await loadOrders(); // revert to server truth on failure
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (order: AdminOrder) => {
    const confirmed = window.confirm(
      `Permanently delete order #${order.id} from ${order.customerName}?\n\n` +
      `This removes it from the dashboard and reports, and cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(order.id);
    // Optimistic removal so the table updates instantly.
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
    try {
      await adminFetch(`/api/orders/${order.id}`, { method: 'DELETE' });
    } catch (err) {
      if (err instanceof AdminUnauthorizedError) onUnauthorized();
      await loadOrders(); // restore server truth if the delete failed
    } finally {
      setDeletingId(null);
    }
  };

  const handleConfirmPendingChange = async () => {
    if (!pendingChange) return;
    setIsSubmittingMessage(true);
    await submitStatusChange(pendingChange.id, pendingChange.status, statusMessage.trim());
    setIsSubmittingMessage(false);
    setPendingChange(null);
    setStatusMessage('');
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
              <th className="pb-2.5 font-bold pr-3">Payment</th>
              <th className="pb-2.5 font-bold pr-3">Total</th>
              <th className="pb-2.5 font-bold pr-3">Telegram</th>
              <th className="pb-2.5 font-bold pr-3">Status</th>
              <th className="pb-2.5 font-bold pr-3">Placed</th>
              <th className="pb-2.5 font-bold text-right">Delete</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 pr-3 font-bold text-white whitespace-nowrap">#{o.id}</td>
                <td className="py-3 pr-3 min-w-[160px]">
                  <p className="font-semibold text-slate-200">{o.customerName}</p>
                  <p className="text-slate-500 text-[10px]">{o.customerPhone}</p>
                  <p className="text-slate-500 text-[10px] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate max-w-[150px]" title={o.deliveryAddress}>
                      {o.deliveryCity}{o.deliveryAddress ? ` — ${o.deliveryAddress}` : ''}
                    </span>
                  </p>
                </td>
                <td className="py-3 pr-3 text-slate-400 whitespace-nowrap">
                  {STORE_LABELS[o.storeSlug || 'nine-collection'] || o.storeSlug}
                </td>
                <td className="py-3 pr-3 text-slate-400 max-w-[220px]">
                  <p className="truncate">{o.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')}</p>
                  {o.bundleName && (
                    <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full bg-purple-500/10 text-[#C77DF5] text-[9px] font-bold border border-purple-500/20">
                      <Tag className="w-2.5 h-2.5" />
                      {o.bundleName}
                    </span>
                  )}
                </td>
                <td className="py-3 pr-3 text-slate-400 whitespace-nowrap">
                  {PAYMENT_LABELS[o.paymentMethod] || o.paymentMethod}
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
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-1.5">
                    <select
                      value={o.deliveryStatus || 'pending'}
                      disabled={updatingId === o.id}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-[10px] font-bold border cursor-pointer focus:outline-none disabled:opacity-50 ${STATUS_STYLES[o.deliveryStatus || 'pending']}`}
                    >
                      <option value="pending" className="bg-[#18181B] text-amber-400">Pending</option>
                      <option value="delivered" className="bg-[#18181B] text-emerald-400">Delivered</option>
                      <option value="canceled" className="bg-[#18181B] text-red-400">Canceled</option>
                    </select>
                    {o.adminMessage && (
                      <span title={o.adminMessage} className="text-slate-500 shrink-0">
                        <MessageSquare className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 pr-3 text-slate-500 whitespace-nowrap">
                  <p className="text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                  <p className="text-[10px] text-slate-600">
                    {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => handleDelete(o)}
                    disabled={deletingId === o.id}
                    title="Delete this order permanently"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {deletingId === o.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-xs text-slate-500 py-8 text-center">No orders match this view.</p>
        )}
      </div>

      {pendingChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-[#141419] border border-white/10 shadow-2xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-white">
                  Mark as {pendingChange.status === 'delivered' ? 'Delivered' : 'Canceled'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Optional note for {pendingChange.customerName} — shown in their order history and account notifications.
                </p>
              </div>
              <button
                onClick={() => { setPendingChange(null); setStatusMessage(''); }}
                className="p-1 rounded-full text-slate-500 hover:text-white cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
              placeholder={pendingChange.status === 'delivered'
                ? 'e.g. Delivered to the gate, thank you for your order!'
                : 'e.g. Out of stock — refund issued via bank transfer.'}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#B24BF3] resize-none"
            />

            <div className="flex items-center gap-2">
              <button
                onClick={() => { setPendingChange(null); setStatusMessage(''); }}
                className="flex-1 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPendingChange}
                disabled={isSubmittingMessage}
                className={`flex-1 py-2.5 rounded-full text-white text-xs font-bold cursor-pointer disabled:opacity-60 ${
                  pendingChange.status === 'delivered' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
                }`}
              >
                {isSubmittingMessage ? 'Saving...' : `Confirm ${pendingChange.status === 'delivered' ? 'Delivered' : 'Canceled'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
};
