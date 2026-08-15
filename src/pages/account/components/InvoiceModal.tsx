import React from 'react';
import { X, Printer } from 'lucide-react';
import { CustomerOrder, STORE_LABELS, PAYMENT_LABELS } from '../types';

interface InvoiceModalProps {
  order: CustomerOrder;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const formatMoney = (usd: number) => (order.currency === 'SSP'
    ? `SSP ${(usd * 8000).toLocaleString()}`
    : `$${usd.toLocaleString()}`);

  const status = order.deliveryStatus || 'pending';
  const docLabel = status === 'delivered' ? 'RECEIPT' : status === 'canceled' ? 'CANCELED ORDER' : 'QUOTATION';
  const toolbarLabel = status === 'delivered' ? 'Receipt' : status === 'canceled' ? 'Cancellation Notice' : 'Quotation';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs print:bg-white print:p-0">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl print:shadow-none print:rounded-none print:max-h-none print:max-w-none">

        {/* Toolbar (hidden when printing) */}
        <div className="print:hidden sticky top-0 flex items-center justify-between p-4 border-b border-gray-100 bg-white rounded-t-3xl">
          <h3 className="text-sm font-black text-slate-900">{toolbarLabel} #{order.id}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#B24BF3] hover:bg-[#9f35e3] text-white text-xs font-bold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:text-gray-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <img
                src="/images/juba_fashion_hub_logo.jpg"
                alt="Juba Fashion Hub"
                className="h-10 w-auto object-contain rounded-md mb-2"
                referrerPolicy="no-referrer"
              />
              <p className="text-xs text-slate-500">Juba, South Sudan</p>
              <p className="text-xs text-slate-500">+211 911 267 703</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-black text-slate-900">{docLabel}</h2>
              <p className="text-xs text-slate-500 mt-1">#{order.id}</p>
              <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {order.adminMessage && (status === 'delivered' || status === 'canceled') && (
            <div className={`p-3.5 rounded-xl text-xs leading-relaxed border ${
              status === 'delivered'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-red-50 text-red-900 border-red-200'
            }`}>
              <p className="font-bold mb-0.5">
                {status === 'delivered' ? '📦 A note from our team' : '❌ A note from our team'}
              </p>
              <p>{order.adminMessage}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">Billed To</p>
              <p className="font-semibold text-slate-900">{order.customerName}</p>
              <p className="text-slate-600">{order.customerPhone}</p>
              {order.customerEmail && <p className="text-slate-600">{order.customerEmail}</p>}
            </div>
            <div>
              <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">Delivered To</p>
              <p className="text-slate-600">{order.deliveryCity}</p>
              <p className="text-slate-600">{order.deliveryAddress}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-full bg-purple-50 text-[#B24BF3] text-[10px] font-bold border border-purple-100">
              {STORE_LABELS[order.storeSlug || 'nine-collection'] || order.storeSlug}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 text-[10px] font-bold border border-slate-200">
              {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
            </span>
            {order.bundleName && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                Bundle: {order.bundleName}
              </span>
            )}
          </div>

          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-400 border-b border-gray-200">
                <th className="pb-2 font-bold">Item</th>
                <th className="pb-2 font-bold text-center">Qty</th>
                <th className="pb-2 font-bold text-right">Price</th>
                <th className="pb-2 font-bold text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-2 text-slate-800">{it.productName}</td>
                  <td className="py-2 text-center text-slate-600">{it.quantity}</td>
                  <td className="py-2 text-right text-slate-600">{formatMoney(it.unitPriceUSD)}</td>
                  <td className="py-2 text-right font-semibold text-slate-900">{formatMoney(it.unitPriceUSD * it.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-full max-w-[220px] space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatMoney(order.subtotalUSD)}</span>
              </div>
              {order.bundleDiscountUSD > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Bundle Discount</span>
                  <span>-{formatMoney(order.bundleDiscountUSD)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-gray-200">
                <span>Total</span>
                <span className="text-[#B24BF3]">{formatMoney(order.totalUSD)}</span>
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] text-slate-400 pt-4 border-t border-gray-100">
            Thank you for shopping with Juba Fashion Hub — 100% authentic imports, delivered fast across Juba.
          </p>
        </div>
      </div>
    </div>
  );
};
