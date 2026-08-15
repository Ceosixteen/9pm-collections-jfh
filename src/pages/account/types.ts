export interface CustomerOrder {
  id: string;
  storeSlug?: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPriceUSD: number;
    unitPriceSSP: number;
  }[];
  subtotalUSD: number;
  subtotalSSP: number;
  bundleDiscountUSD: number;
  bundleDiscountSSP: number;
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
  bundleName?: string;
  createdAt: string;
}

export const STORE_LABELS: Record<string, string> = {
  'nine-collection': 'The 9 Collection',
  hawas: 'Rasasi Hawas',
  'badee-al-oud': "Bade'e Al Oud",
  cerave: 'CeraVe Skincare',
};

export const PAYMENT_LABELS: Record<string, string> = {
  cod: 'Cash on Delivery',
  bank_transfer: 'Bank Transfer',
  'm-gurush': 'm-GURUSH',
};
