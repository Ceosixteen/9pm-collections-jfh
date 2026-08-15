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
  revenueUSD: number;
  revenueSSP: number;
  topProducts: { productName: string; quantity: number }[];
}

export interface SalesByPageResponse {
  byStore: Record<string, SalesByPageEntry>;
  totalOrders: number;
  totalRevenueUSD: number;
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
