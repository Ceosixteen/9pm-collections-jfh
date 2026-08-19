import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MarqueeBanner } from './components/MarqueeBanner';
import { ProductsGrid } from './components/ProductsGrid';
import { BundlesSection } from './components/BundlesSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { FragranceQuizModal } from './components/FragranceQuizModal';
import { DeliverySteps } from './components/DeliverySteps';
import { ReviewsSection } from './components/ReviewsSection';
import { CartDrawer } from './components/CartDrawer';
import { AIAgentWidget } from './components/AIAgentWidget';
import { RecentOrdersToast } from './components/RecentOrdersToast';
import { StickyBuyBar } from './components/StickyBuyBar';
import { Footer } from './components/Footer';

import { PERFUMES_DATA, RECOMMENDED_BUNDLES, REVIEWS_DATA } from './data/lotionsData';
import { Currency, CartItem, PerfumeProduct, RecommendedBundle, Order } from './types';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { trackPageview } from '../../lib/trackPageview';
import { useCollectionProducts } from '../../lib/useCollectionProducts';

export default function App() {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const perfumes = useCollectionProducts<PerfumeProduct>('medix', PERFUMES_DATA);
  const [bundles] = useState<RecommendedBundle[]>(RECOMMENDED_BUNDLES);
  const [reviews] = useState(REVIEWS_DATA);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [selectedPerfume, setSelectedPerfume] = useState<PerfumeProduct | null>(null);

  // Success Order Confirmation
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    trackPageview('medix');
  }, []);

  // Auto-add from the homepage showcase (?addProduct=id). Reads `perfumes`
  // so admin-added products work too; the ref guard fires it only once.
  const hasAutoAdded = useRef(false);
  useEffect(() => {
    if (hasAutoAdded.current) return;
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('addProduct');
    if (!productId) return;
    const match = perfumes.find((p) => p.id === productId);
    if (!match) return; // wait for the live catalogue to load
    hasAutoAdded.current = true;
    handleAddToCart(match);
    window.history.replaceState({}, '', window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfumes]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleToggleCurrency = () => {
    setCurrency((prev) => (prev === 'SSP' ? 'USD' : 'SSP'));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleAddToCart = (perfume: PerfumeProduct) => {
    setCartItems((prev) => {
      const existing = prev.find((it) => it.product.id === perfume.id);
      if (existing) {
        return prev.map((it) =>
          it.product.id === perfume.id
            ? { ...it, quantity: it.quantity + 1 }
            : it
        );
      }
      return [
        ...prev,
        {
          product: perfume,
          quantity: 1,
          unitPriceUSD: perfume.priceUSD,
          unitPriceSSP: perfume.priceSSP,
        },
      ];
    });

    showToast(`Added ${perfume.name} to cart!`);
    setIsCartOpen(true);
  };

  const handleAddBundleToCart = (bundle: RecommendedBundle) => {
    const bundledPerfumes = perfumes.filter((p) => bundle.productIds.includes(p.id));

    setCartItems((prev) => {
      let updated = [...prev];
      bundledPerfumes.forEach((p) => {
        const existingIndex = updated.findIndex((it) => it.product.id === p.id);
        if (existingIndex >= 0) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + 1,
            bundleName: bundle.name,
          };
        } else {
          updated.push({
            product: p,
            quantity: 1,
            unitPriceUSD: p.priceUSD,
            unitPriceSSP: p.priceSSP,
            bundleName: bundle.name,
          });
        }
      });
      return updated;
    });

    showToast(`Added "${bundle.name}" to cart with -$5/item discount!`);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((it) => {
          if (it.product.id === productId) {
            const newQty = it.quantity + delta;
            return newQty > 0 ? { ...it, quantity: newQty } : null;
          }
          return it;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((it) => it.product.id !== productId));
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FC] font-sans text-slate-800 selection:bg-[#B24BF3] selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-5 z-50 p-4 rounded-2xl bg-[#18181B] text-white font-bold text-xs shadow-2xl border border-gray-700 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#B24BF3] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <Header
        currency={currency}
        onCurrencyToggle={handleToggleCurrency}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          scrollToSection(cat === 'bundles' ? 'bundles' : 'collection');
        }}
      />

      {/* Hero Conversion Showcase */}
      <Hero
        currency={currency}
        onExploreProducts={() => scrollToSection('collection')}
        onOpenQuiz={() => setIsQuizOpen(true)}
        perfumes={perfumes}
        onSelectPerfume={(p) => setSelectedPerfume(p)}
      />

      {/* Running Marquee Banner */}
      <MarqueeBanner />

      {/* Catalog Grid */}
      <ProductsGrid
        perfumes={perfumes}
        currency={currency}
        onAddToCart={handleAddToCart}
        onSelectPerfume={(p) => setSelectedPerfume(p)}
      />

      {/* Pre-Packaged Bundles Section */}
      <BundlesSection
        bundles={bundles}
        perfumes={perfumes}
        currency={currency}
        onAddBundleToCart={handleAddBundleToCart}
      />

      {/* How Juba Delivery Works */}
      <DeliverySteps />

      {/* Verified Customer Reviews */}
      <ReviewsSection reviews={reviews} />

      {/* Sticky Bottom Quick Buy Bar */}
      <StickyBuyBar
        cartCount={cartCount}
        currency={currency}
        onOpenCart={() => setIsCartOpen(true)}
        onQuickAddBestSeller={() => handleAddToCart(perfumes[0])}
      />

      {/* Footer */}
      <Footer />

      {/* Sales Team Chat Widget */}
      <AIAgentWidget
        currency={currency}
        perfumes={perfumes}
        onAddToCart={handleAddToCart}
      />

      {/* Recent Orders Social Proof Notification */}
      <RecentOrdersToast />

      {/* Fragrance Detail Modal */}
      <ProductDetailModal
        perfume={selectedPerfume}
        currency={currency}
        onClose={() => setSelectedPerfume(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Interactive Scent Finder Quiz Modal */}
      {isQuizOpen && (
        <FragranceQuizModal
          perfumes={perfumes}
          currency={currency}
          onClose={() => setIsQuizOpen(false)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Order Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        currency={currency}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCartItems([])}
        onOrderSuccess={(order) => setPlacedOrder(order)}
      />

      {/* Order Success Confirmation Modal */}
      {placedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 text-center space-y-4 shadow-2xl border border-gray-100">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-black text-slate-900">
              Order Confirmed!
            </h3>

            <p className="text-xs text-slate-600">
              Thank you, <strong>{placedOrder.customerName}</strong>! Your order <strong>#{placedOrder.id}</strong> has been received and queued for same-day delivery dispatch in Juba.
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 text-xs text-left space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Total Amount:</span>
                <span className="font-extrabold text-[#B24BF3]">
                  {placedOrder.currency === 'SSP' ? `SSP ${(placedOrder.totalUSD * 8000).toLocaleString()}` : `$${placedOrder.totalUSD}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Address:</span>
                <span className="text-slate-900 font-semibold">{placedOrder.deliveryAddress}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Method:</span>
                <span className="text-emerald-700 font-semibold">{placedOrder.paymentMethod.toUpperCase()}</span>
              </div>
            </div>

            <button
              onClick={() => setPlacedOrder(null)}
              className="w-full py-3 rounded-full bg-[#B24BF3] hover:bg-[#9f35e3] text-white font-bold text-xs shadow-md cursor-pointer"
            >
              Continue Browsing Juba Fashion Hub
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
