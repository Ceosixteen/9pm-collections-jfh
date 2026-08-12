export type Currency = 'USD' | 'SSP';

export interface CurrencyConfig {
  rate: number; // 1 USD = 8000 SSP
  symbolUSD: string;
  symbolSSP: string;
  lastUpdated: string;
}

export interface RecommendedBundle {
  id: string;
  name: string;
  badge: string;
  description: string;
  productIds: string[];
  priceUSD: number; // discounted total
  originalPriceUSD: number;
  savingsUSD: number;
  isPopular?: boolean;
}

export interface PerfumeProduct {
  id: string;
  name: string;
  timeTag: '9PM' | '9AM';
  tagline: string;
  description: string;
  priceUSD: number;
  priceSSP: number;
  originalPriceUSD: number;
  originalPriceSSP: number;
  rating: number;
  reviewsCount: number;
  image: string;
  stockCount: number;
  isBestSeller?: boolean;
  badge?: string;
  projection: string; // e.g. 'Moderate-Strong', 'Strong', 'Soft-Moderate'
  longevity: string; // e.g. '7-8 hrs', '8-10 hrs'
  volume: string; // e.g. '100ml / 3.4 oz Eau De Parfum'
  concentration?: string; // e.g. 'Eau de Parfum (EDP), 100ml'
  bestTimeToWear?: string;
  notBestTimeToWear?: string;
  notesTop: string[];
  notesMiddle: string[];
  notesBase: string[];
  notesTopDesc?: string;
  notesMiddleDesc?: string;
  notesBaseDesc?: string;
  fragranceFamily: string; // e.g. 'Aromatic Amber Oud', 'Spicy Leather', 'Fresh Aquatic Citrus'
}

export interface CartItem {
  product: PerfumeProduct;
  quantity: number;
  unitPriceUSD: number;
  unitPriceSSP: number;
}

export type PaymentMethod = 'm-gurush' | 'bank_transfer' | 'cod';

export interface Order {
  id: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPriceUSD: number;
    unitPriceSSP: number;
  }[];
  subtotalUSD: number;
  subtotalSSP: number;
  bundleDiscountUSD: number; // -$5 per bottle if count >= 2
  bundleDiscountSSP: number;
  totalUSD: number;
  totalSSP: number;
  currency: Currency;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryCity: string;
  deliveryAddress: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'completed';
  createdAt: string;
  telegramNotified: boolean;
  telegramError?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  recommendedProductId?: string;
  quickActions?: { label: string; action: string }[];
}

export interface Review {
  id: string;
  name: string;
  location: string; // e.g. Juba, Munuki
  rating: number;
  quote: string;
  favoritePerfume: string;
  date: string;
}

export interface KnowledgeBase {
  storeName: string;
  tagline: string;
  location: string;
  contactPhone: string;
  contactWhatsApp: string;
  aboutStore: string;
  deliveryPolicy: string;
  paymentMethodsDetail: string;
  activePromotions: { code: string; description: string }[];
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
  autoNotifyOnOrder: boolean;
}
