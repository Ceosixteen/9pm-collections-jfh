import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, Sparkles, Send, PhoneCall } from 'lucide-react';
import { CartItem, Currency, PaymentMethod, Order } from '../types';
import { CheckoutSignIn, CheckoutAutofillData } from '../../../components/CheckoutSignIn';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: Currency;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderSuccess,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Juba');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentCurrency, setPaymentCurrency] = useState<Currency>(currency);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalBottleCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotalUSD = items.reduce((sum, item) => sum + item.unitPriceUSD * item.quantity, 0);
  const subtotalSSP = subtotalUSD * 8000;

  const bundleDiscountUSD = totalBottleCount >= 2 ? totalBottleCount * 5 : 0;
  const bundleDiscountSSP = bundleDiscountUSD * 8000;

  const baseTotalUSD = Math.max(0, subtotalUSD - bundleDiscountUSD);
  const baseTotalSSP = Math.max(0, subtotalSSP - bundleDiscountSSP);

  // 50% Liquidation & Withdrawal Fee applies if SSP + (Bank Transfer or m-GURUSH)
  const isSspDigitalFee = paymentCurrency === 'SSP' && (paymentMethod === 'bank_transfer' || paymentMethod === 'm-gurush');
  const sspLiquidationFee = isSspDigitalFee ? Math.round(baseTotalSSP * 0.5) : 0;

  const finalTotalUSD = baseTotalUSD;
  const finalTotalSSP = baseTotalSSP + sspLiquidationFee;

  const formatMoney = (usdVal: number, sspVal: number) => {
    return paymentCurrency === 'SSP'
      ? `SSP ${(usdVal * 8000).toLocaleString()}`
      : `$${usdVal.toLocaleString()}`;
  };

  const handleAutofill = (data: CheckoutAutofillData) => {
    setCustomerEmail((prev) => prev || data.email);
    if (data.name) setCustomerName((prev) => prev || data.name);
    if (data.phone) setCustomerPhone((prev) => prev || data.phone);
    if (data.address) setDeliveryAddress((prev) => prev || data.address);
    if (data.city) setDeliveryCity((prev) => (prev && prev !== 'Juba' ? prev : (data.city as string)));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setPaymentCurrency(newCurrency);
    if (newCurrency === 'USD' && paymentMethod === 'm-gurush') {
      setPaymentMethod('cod');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;

    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      setOrderError('Please enter your Name, Phone Number, and Delivery Address in Juba.');
      return;
    }

    setIsSubmitting(true);
    setOrderError(null);

    try {
      const bundleNames = Array.from(new Set(items.filter((it) => it.bundleName).map((it) => it.bundleName as string)));

      const payload = {
        storeSlug: 'khamrah',
        items: items.map((it) => ({
          productId: it.product.id,
          productName: it.product.name,
          quantity: it.quantity,
          unitPriceUSD: it.unitPriceUSD,
          unitPriceSSP: it.unitPriceSSP,
        })),
        subtotalUSD,
        subtotalSSP,
        bundleDiscountUSD,
        bundleDiscountSSP,
        totalUSD: finalTotalUSD,
        totalSSP: finalTotalSSP,
        currency: paymentCurrency,
        sspLiquidationFee,
        customerName,
        customerPhone,
        customerEmail,
        deliveryCity,
        deliveryAddress,
        paymentMethod,
        notes,
        bundleName: bundleNames.length > 0 ? bundleNames.join(', ') : undefined,
      };

      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success && data.order) {
        onOrderSuccess(data.order);
        onClearCart();
        onClose();
      } else {
        setOrderError(data.error || 'Failed to place order. Please try again.');
      }
    } catch (err: any) {
      setOrderError(err?.message || 'Server error. Please try placing your order again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppOrder = () => {
    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      setOrderError('Please enter your Name, Phone Number, and Delivery Address first.');
      return;
    }

    const itemsSummary = items
      .map((it) => paymentCurrency === 'SSP'
        ? `• ${it.quantity}x ${it.product.name} (SSP ${(it.unitPriceUSD * 8000).toLocaleString()}/bottle)`
        : `• ${it.quantity}x ${it.product.name} ($${it.unitPriceUSD}/bottle)`
      )
      .join('%0A');

    const discountText = bundleDiscountUSD > 0
      ? `%0A🎁 *Bundle Discount Applied:* -${paymentCurrency === 'SSP' ? `SSP ${bundleDiscountSSP.toLocaleString()}` : `$${bundleDiscountUSD} USD`}`
      : '';

    const feeText = isSspDigitalFee
      ? `%0A⚠️ *50% Liquidation & Withdrawal Fee:* +SSP ${sspLiquidationFee.toLocaleString()}`
      : '';

    const finalFormatted = paymentCurrency === 'SSP'
      ? `SSP ${finalTotalSSP.toLocaleString()}`
      : `$${finalTotalUSD.toLocaleString()} USD`;

    const paymentTermsNotes = paymentCurrency === 'USD'
      ? `(Rider will show official bank account details on delivery. Zero extra fees.)`
      : paymentMethod === 'cod'
        ? `(Cash on delivery in SSP. Zero extra fees.)`
        : `(SSP Bank / m-GURUSH payment with 50% liquidation fee applied.)`;

    const message = `Hello Juba Fashion Hub! I would like to place a fragrance order:%0A%0A` +
      `*ORDER ITEMS:*%0A${itemsSummary}${discountText}${feeText}%0A%0A` +
      `*FINAL AMOUNT DUE:* *${finalFormatted}*%0A` +
      `*NAME:* ${encodeURIComponent(customerName)}%0A` +
      `*PHONE:* ${encodeURIComponent(customerPhone)}%0A` +
      `*ADDRESS IN JUBA:* ${encodeURIComponent(deliveryAddress)} (${deliveryCity})%0A` +
      `*PAYMENT CURRENCY:* ${paymentCurrency}%0A` +
      `*PAYMENT METHOD:* ${paymentMethod.toUpperCase()} ${paymentTermsNotes}%0A` +
      (notes ? `*NOTES:* ${encodeURIComponent(notes)}%0A` : '') +
      `%0APlease confirm my express delivery dispatch within 120 minutes!`;

    window.open(`https://wa.me/211911267703?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="absolute inset-y-0 right-0 w-full sm:max-w-md flex sm:pl-10">
        <div className="w-full bg-white text-slate-900 flex flex-col shadow-2xl">
          
          {/* Cart Header */}
          <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#B24BF3]" />
              <h2 className="text-base font-extrabold text-white">
                Your Shopping Cart
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#B24BF3] text-white text-xs font-bold">
                {totalBottleCount} {totalBottleCount === 1 ? 'bottle' : 'bottles'}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-gray-800 text-gray-300 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
            
            {/* Automatic Bundle Savings Banner */}
            {totalBottleCount >= 2 ? (
              <div className="p-3.5 rounded-2xl bg-purple-100 border border-purple-200 text-xs text-purple-900 flex items-center gap-2 shadow-xs">
                <Sparkles className="w-5 h-5 text-[#B24BF3] shrink-0" />
                <div>
                  <strong className="block font-bold text-slate-900 text-sm">🎉 AUTOMATIC BUNDLE DISCOUNT APPLIED!</strong>
                  <span>You saved <strong>{formatMoney(bundleDiscountUSD, bundleDiscountSSP)}</strong> (-$5 off per bottle)!</span>
                </div>
              </div>
            ) : totalBottleCount === 1 ? (
              <div className="p-3.5 rounded-2xl bg-white border border-gray-200 text-xs text-slate-600 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#B24BF3] shrink-0" />
                <div>
                  <strong className="block text-slate-900 font-bold">💡 Add 1 More Bottle to Save $10!</strong>
                  <span>Bundle 2 or more bottles to automatically subtract -$5 USD off every bottle.</span>
                </div>
              </div>
            ) : null}

            {/* Empty Cart State */}
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-purple-50 flex items-center justify-center text-[#B24BF3]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-sm text-slate-700 font-bold">
                  Your cart is empty right now.
                </p>
                <p className="text-xs text-gray-500">
                  Select items from our catalog to build your order!
                </p>
              </div>
            ) : (
              /* Item List */
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 rounded-2xl bg-white border border-gray-200 flex items-center gap-3 shadow-xs"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-14 h-16 object-cover rounded-xl border border-gray-100 shrink-0"
                      referrerPolicy="no-referrer"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[10px] text-gray-500 truncate">
                        {item.product.timeTag} Collection · {item.product.volume}
                      </p>
                      <p className="text-xs font-extrabold text-[#B24BF3] mt-1">
                        {formatMoney(item.unitPriceUSD * item.quantity, item.unitPriceSSP * item.quantity)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 border border-gray-200">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="p-1 rounded hover:bg-gray-200 text-slate-800 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-1.5 text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="p-1 rounded hover:bg-gray-200 text-slate-800 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-[10px] text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer font-semibold"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* Direct Checkout Form */}
            {items.length > 0 && (
              <form onSubmit={handlePlaceOrder} className="pt-4 border-t border-gray-200 space-y-4">
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-extrabold text-amber-950">
                    <span>🚀 FREE EXPRESS JUBA DELIVERY (UNDER 120 MINS)</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    <strong>Notice:</strong> We dispatch immediately! Please only place your order if you are ready to receive your delivery <strong>TODAY</strong> in Juba.
                  </p>
                </div>

                <h3 className="text-xs font-extrabold uppercase text-[#B24BF3] tracking-wider">
                  Juba Delivery & Customer Information
                </h3>

                <CheckoutSignIn onAutofill={handleAutofill} />

                {orderError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    {orderError}
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  {/* Currency Selection Toggle */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Select Payment Currency *
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200">
                      <button
                        type="button"
                        onClick={() => handleCurrencyChange('USD')}
                        className={`py-2 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                          paymentCurrency === 'USD'
                            ? 'bg-[#B24BF3] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 bg-transparent'
                        }`}
                      >
                        💵 Pay in USD ($)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCurrencyChange('SSP')}
                        className={`py-2 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                          paymentCurrency === 'SSP'
                            ? 'bg-[#B24BF3] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 bg-transparent'
                        }`}
                      >
                        £ Pay in SSP
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Akuol Deng"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-slate-900 focus:outline-none focus:border-[#B24BF3]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Phone Number (WhatsApp / Calls) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+211 911 XXX XXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-slate-900 focus:outline-none focus:border-[#B24BF3]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="e.g. akuol@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-slate-900 focus:outline-none focus:border-[#B24BF3]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Delivery Address in Juba *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Munuki Block C near Equity Bank, Juba"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-slate-900 focus:outline-none focus:border-[#B24BF3]"
                    />
                  </div>

                  {/* Payment Method Selector based on Selected Currency */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Payment Method *</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-slate-900 focus:outline-none focus:border-[#B24BF3] font-semibold"
                    >
                      {paymentCurrency === 'USD' ? (
                        <>
                          <option value="cod">💵 USD Cash on Delivery (No additional charges)</option>
                          <option value="bank_transfer">🏦 USD Bank Transfer on Delivery (No additional charges)</option>
                        </>
                      ) : (
                        <>
                          <option value="cod">💵 SSP Cash on Delivery (No additional charges)</option>
                          <option value="bank_transfer">🏦 SSP Bank Transfer (+50% liquidation & withdrawal fee)</option>
                          <option value="m-gurush">📱 m-GURUSH Mobile Money (+50% liquidation & withdrawal fee)</option>
                        </>
                      )}
                    </select>

                    {/* Explanatory Note */}
                    <div className="mt-2 p-2.5 rounded-xl text-[11px] leading-relaxed border font-medium">
                      {paymentCurrency === 'USD' ? (
                        <p className="bg-emerald-50 text-emerald-900 border-emerald-200 p-2 rounded-lg">
                          ✅ <strong>USD Terms:</strong> Our express delivery rider will present the official bank account details upon delivery. Zero additional charges.
                        </p>
                      ) : paymentMethod === 'cod' ? (
                        <p className="bg-emerald-50 text-emerald-900 border-emerald-200 p-2 rounded-lg">
                          ✅ <strong>SSP Cash Terms:</strong> Pay exact cash in SSP directly to the rider upon delivery. Zero additional charges.
                        </p>
                      ) : (
                        <p className="bg-purple-50 text-purple-900 border-purple-200 p-2 rounded-lg">
                          ⚡ <strong>SSP Digital / Bank Terms:</strong> A 50% liquidation and bank withdrawal fee (+SSP {sspLiquidationFee.toLocaleString()}) is added to your total amount immediately.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Special Notes (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Call before delivery"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-slate-900 focus:outline-none focus:border-[#B24BF3]"
                    />
                  </div>
                </div>

                {/* Subtotal & Totals Summary */}
                <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-2 text-xs shadow-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Items Subtotal:</span>
                    <span>
                      {paymentCurrency === 'SSP'
                        ? `SSP ${subtotalSSP.toLocaleString()}`
                        : `$${subtotalUSD.toLocaleString()}`}
                    </span>
                  </div>

                  {bundleDiscountUSD > 0 && (
                    <div className="flex justify-between font-bold text-emerald-600">
                      <span>Bundle Savings (-$5/bottle):</span>
                      <span>
                        -{paymentCurrency === 'SSP'
                          ? `SSP ${bundleDiscountSSP.toLocaleString()}`
                          : `$${bundleDiscountUSD.toLocaleString()}`}
                      </span>
                    </div>
                  )}

                  {paymentCurrency === 'SSP' && isSspDigitalFee && (
                    <div className="flex justify-between font-bold text-[#B24BF3] pt-1 border-t border-purple-100">
                      <span>50% Liquidation & Withdrawal Fee:</span>
                      <span>+SSP {sspLiquidationFee.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-100 flex justify-between items-baseline text-sm font-extrabold text-slate-900">
                    <span>Final Amount Due:</span>
                    <span className="text-xl text-[#B24BF3]">
                      {paymentCurrency === 'SSP'
                        ? `SSP ${finalTotalSSP.toLocaleString()}`
                        : `$${finalTotalUSD.toLocaleString()} USD`}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-full bg-[#B24BF3] hover:bg-[#9f35e3] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Placing Order...' : 'Confirm Order & Dispatch Rider'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppOrder}
                    className="w-full py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Order Directly via WhatsApp (+211 911 267 703)</span>
                  </button>
                </div>

              </form>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};
