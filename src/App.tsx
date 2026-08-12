import React, { useState, useEffect } from 'react';
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
import { StickyBuyBar } from './components/StickyBuyBar';
import { Footer } from './components/Footer';
import { TelegramAdminModal } from './components/TelegramAdminModal';
import { KnowledgeBaseEditorModal } from './components/KnowledgeBaseEditorModal';

import { PERFUMES_DATA, RECOMMENDED_BUNDLES, REVIEWS_DATA, INITIAL_KNOWLEDGE_BASE, DEFAULT_TELEGRAM_CONFIG } from './data/perfumesData';
import { Currency, CartItem, PerfumeProduct, RecommendedBundle, Order, TelegramConfig, KnowledgeBase } from './types';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [perfumes] = useState<PerfumeProduct[]>(PERFUMES_DATA);
  const [bundles] = useState<RecommendedBundle[]>(RECOMMENDED_BUNDLES);
  const [reviews] = useState(REVIEWS_DATA);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isTelegramAdminOpen, setIsTelegramAdminOpen] = useState(false);
  const [isKbAdminOpen, setIsKbAdminOpen] = useState(false);
  const [selectedPerfume, setSelectedPerfume] = useState<PerfumeProduct | null>(null);

  // Store Configuration
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(DEFAULT_TELEGRAM_CONFIG);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase>(INITIAL_KNOWLEDGE_BASE);

  // Success Order Confirmation
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if URL has ?admin
    if (window.location.search.includes('admin')) {
      setIsTelegramAdminOpen(true);
    }

    // Fetch initial Telegram Config
    fetch('/api/telegram/config')
      .then((res) => res.json())
      .then((data) => {
        if (data) setTelegramConfig(data);
      })
      .catch((err) => console.error('Failed to load telegram config:', err));
  }, []);

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
          };
        } else {
          updated.push({
            product: p,
            quantity: 1,
            unitPriceUSD: p.priceUSD,
            unitPriceSSP: p.priceSSP,
          });
        }
      });
      return updated;
    });

    showToast(`Added "${bundle.name}" to cart with -$5/bottle discount!`);
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
        onOpenTelegramAdmin={() => setIsTelegramAdminOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          scrollToSection('collection');
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
      <Footer
        onOpenTelegramAdmin={() => setIsTelegramAdminOpen(true)}
        onOpenKnowledgeBaseAdmin={() => setIsKbAdminOpen(true)}
      />

      {/* AI Sales Agent Widget */}
      <AIAgentWidget
        currency={currency}
        perfumes={perfumes}
        onAddToCart={handleAddToCart}
      />

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

      {/* Telegram Admin Modal */}
      <TelegramAdminModal
        isOpen={isTelegramAdminOpen}
        onClose={() => setIsTelegramAdminOpen(false)}
        config={telegramConfig}
        onUpdateConfig={(cfg) => setTelegramConfig(cfg)}
      />

      {/* Knowledge Base Admin Modal */}
      <KnowledgeBaseEditorModal
        isOpen={isKbAdminOpen}
        onClose={() => setIsKbAdminOpen(false)}
        kb={knowledgeBase}
        onSaveKb={(updated) => setKnowledgeBase(updated)}
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
