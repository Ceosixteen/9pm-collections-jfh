import React, { useEffect, useState } from 'react';
import { Loader2, FileText, LogOut, PackageX, Truck, Clock3 } from 'lucide-react';
import type { User } from 'firebase/auth';
import { accountFetch, UnauthorizedError } from '../lib/api';
import { CustomerOrder, STORE_LABELS } from '../types';
import { InvoiceModal } from './InvoiceModal';
import { logout } from '../../../lib/firebaseClient';

interface OrdersDashboardProps {
  user: User;
  onSignedOut: () => void;
}

const STATUS_META: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock3 },
  delivered: { label: 'Delivered', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Truck },
  canceled: { label: 'Canceled', className: 'bg-red-50 text-red-700 border-red-200', icon: PackageX },
};

export const OrdersDashboard: React.FC<OrdersDashboardProps> = ({ user, onSignedOut }) => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<CustomerOrder | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await accountFetch<CustomerOrder[]>('/api/my-orders');
        setOrders(data);
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          onSignedOut();
        } else {
          setError('Could not load your orders. Please try again shortly.');
        }
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await logout();
    onSignedOut();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">My Orders</h2>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading your orders...</span>
        </div>
      )}

      {error && <p className="text-sm text-red-600 text-center py-8">{error}</p>}

      {!isLoading && !error && orders.length === 0 && (
        <div className="text-center py-16 space-y-2">
          <p className="text-sm text-slate-500">No orders yet on this email.</p>
          <a href="/" className="text-sm font-bold text-[#B24BF3] hover:underline">Explore our collections →</a>
        </div>
      )}

      <div className="space-y-3">
        {orders.map((o) => {
          const status = STATUS_META[o.deliveryStatus || 'pending'];
          const StatusIcon = status.icon;
          return (
            <div key={o.id} className="rounded-2xl border border-gray-100 shadow-xs p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-slate-900">#{o.id}</p>
                  <p className="text-[10px] text-slate-500">
                    {STORE_LABELS[o.storeSlug || 'nine-collection'] || o.storeSlug} · {new Date(o.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border ${status.className}`}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {o.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-sm font-black text-[#B24BF3]">
                  {o.currency === 'SSP' ? `SSP ${(o.totalUSD * 8000).toLocaleString()}` : `$${o.totalUSD}`}
                </span>
                <button
                  onClick={() => setInvoiceOrder(o)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#B24BF3] cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View Invoice
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {invoiceOrder && (
        <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />
      )}
    </div>
  );
};
