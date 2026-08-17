export interface AdminOrder {
  id: string;
  storeSlug?: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPriceUSD: number;
    unitPriceSSP: number;
  }[];
  totalUSD: number;
  totalSSP: number;
  currency: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryCity: string;
  deliveryAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryStatus?: 'pending' | 'delivered' | 'canceled';
  adminMessage?: string;
  bundleName?: string;
  createdAt: string;
  telegramNotified?: boolean;
  telegramError?: string;
}

export interface AdminProduct {
  id: string;
  collectionSlug: string;
  name: string;
  timeTag: string;
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
  isBestSeller: boolean;
  badge: string;
  projection: string;
  longevity: string;
  volume: string;
  concentration: string;
  bestTimeToWear: string;
  notBestTimeToWear: string;
  notesTop: string[];
  notesMiddle: string[];
  notesBase: string[];
  fragranceFamily: string;
  sortOrder: number;
  isActive: boolean;
  updatedAt?: string;
}

export interface QuizOption {
  value: string;
  emoji: string;
  label: string;
  description: string;
}

export interface QuizQuestion {
  text: string;
  options: QuizOption[];
}

export interface DeliveryStep {
  title: string;
  desc: string;
}

export interface AdminCollection {
  id: string;
  routeSlug: string;
  label: string;
  category: string;
  unitNounSingular: string;
  unitNounPlural: string;
  detailsLabel: string;
  navCategoryLabel: string;
  heroCategory: string;
  heroTitleMain: string;
  heroTitleAccent: string;
  heroDescription: string;
  heroCtaLabel: string;
  heroFinderCtaLabel: string;
  catalogTag: string;
  catalogTitle: string;
  catalogDescription: string;
  catalogAllLabel: string;
  bundleTitle: string;
  bundleMaxSavingsUSD: number;
  bundleUnitLabel: string;
  deliverySteps: DeliveryStep[];
  quizTitle: string;
  quizSubtitle: string;
  quizDescription: string;
  quizQ1: QuizQuestion;
  quizQ2: QuizQuestion;
  quizResultMap: Record<string, string>;
  quizDefaultProductId: string;
  isActive: boolean;
  sortOrder: number;
  updatedAt?: string;
}

export interface AdminCampaign {
  id: string;
  title: string;
  message: string;
  audience: 'all';
  createdAt: string;
}

export interface AdminClient {
  phone: string;
  name: string;
  email: string;
  city: string;
  stores: string[];
  totalSpentUSD: number;
  totalSpentSSP: number;
  ordersCount: number;
  lastOrderDate: string;
  lastOrderId: string;
  status: string;
}

export interface AdminHelpRequest {
  id: string;
  customerPhone: string;
  customerQuery: string;
  createdAt: string;
  telegramNotified?: boolean;
}

export interface SalesByPageEntry {
  label: string;
  orderCount: number;
  deliveredCount: number;
  revenueUSD: number;
  revenueSSP: number;
  topProducts: { productName: string; quantity: number }[];
}

export interface SalesByPageResponse {
  byStore: Record<string, SalesByPageEntry>;
  totalOrders: number;
  deliveredCount: number;
  /** Revenue from delivered orders only — money actually collected. */
  totalRevenueUSD: number;
  /** Value of orders still awaiting delivery, shown as context. */
  pendingRevenueUSD: number;
}

export interface PageviewsSummaryResponse {
  total: number;
  byStore: Record<string, number>;
  byDay: Record<string, number>;
}

export interface AdminLead {
  id: string;
  email: string;
  source: string;
  storeSlug: string;
  createdAt: string;
}

export const STORE_LABELS: Record<string, string> = {
  home: 'Homepage',
  'nine-collection': 'The 9 Collection',
  hawas: 'Rasasi Hawas',
  'badee-al-oud': "Bade'e Al Oud",
  cerave: 'CeraVe Skincare',
};
