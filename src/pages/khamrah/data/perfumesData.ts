import { PerfumeProduct, RecommendedBundle, KnowledgeBase, TelegramConfig, CurrencyConfig, Review } from '../types';

export const DEFAULT_CURRENCY_CONFIG: CurrencyConfig = {
  rate: 8000, // 1 USD = 8000 SSP
  symbolUSD: '$',
  symbolSSP: 'SSP ',
  lastUpdated: new Date().toISOString(),
};

// Pricing: $40 USD flat per bottle (confirmed), with a $45 "regular price" shown struck-through
// per bottle to match the site's markdown style. Automatic bundle discount (-$5/bottle at 2+)
// applies on top, same as the rest of the storefront family.
export const PERFUMES_DATA: PerfumeProduct[] = [
  {
    id: 'khamrah',
    name: 'Lattafa Khamrah',
    timeTag: 'NIGHT',
    tagline: 'Cinnamon, Dates, Praline & Velvety Amberwood',
    description: 'A warm, spicy, and utterly inviting opening of Cinnamon, Nutmeg, and Bergamot melts into a luscious, ultra-sweet gourmand heart of Dates, Praline, and Tuberose, before settling into a deep, resinous, velvety-sweet dry-down of Vanilla, Myrrh, and Amberwood. The original Lattafa Khamrah — a modern gourmand icon.',
    priceUSD: 45,
    priceSSP: 360000,
    originalPriceUSD: 45,
    originalPriceSSP: 360000,
    rating: 4.9,
    reviewsCount: 142,
    image: '/images/khamrah_placeholder.svg',
    stockCount: 9,
    isBestSeller: true,
    badge: '🔥 VIRAL IN JUBA',
    projection: 'Strong & Enveloping Sillage',
    longevity: '9 - 11 Hours',
    volume: '100ml',
    concentration: 'Eau de Parfum (EDP), 100ml',
    notesTop: ['Cinnamon', 'Nutmeg', 'Bergamot'],
    notesTopDesc: 'A warm, spicy, and utterly inviting opening',
    notesMiddle: ['Dates', 'Praline', 'Tuberose', 'Mahonial'],
    notesMiddleDesc: 'A luscious, ultra-sweet gourmand heart',
    notesBase: ['Vanilla', 'Tonka Bean', 'Myrrh', 'Benzoin', 'Amberwood', 'Akigalawood'],
    notesBaseDesc: 'A deep, resinous, and velvety-sweet dry-down with immense richness',
    bestTimeToWear: 'Autumn and winter evenings, formal gatherings, romantic dates, and festive occasions.',
    notBestTimeToWear: 'Intense summer heat or high-humidity outdoor settings, as its heavy, rich sweetness shines brightest in cooler air.',
    fragranceFamily: 'Spiced Gourmand'
  },
  {
    id: 'khamrah-qahwa',
    name: 'Lattafa Khamrah Qahwa',
    timeTag: 'NIGHT',
    tagline: 'Cinnamon, Cardamom, Ginger & Roasted Coffee',
    description: 'A punchy, warm aromatic spice intro of Cinnamon, Cardamom, and Ginger blooms into a sweet, rich, and indulgent heart of Praline, Candied Fruits, and White Flowers, finishing on a deep, roasted coffee-infused gourmand base of Vanilla, Tonka Bean, and Musk. Khamrah Qahwa is Lattafa\'s beloved coffee-lover\'s edition.',
    priceUSD: 45,
    priceSSP: 360000,
    originalPriceUSD: 45,
    originalPriceSSP: 360000,
    rating: 4.8,
    reviewsCount: 97,
    image: '/images/khamrah_placeholder.svg',
    stockCount: 8,
    badge: '⭐ #1 GOURMAND',
    projection: 'Rich & Long-Throw Sillage',
    longevity: '8 - 10 Hours',
    volume: '100ml',
    concentration: 'Eau de Parfum (EDP), 100ml',
    notesTop: ['Cinnamon', 'Cardamom', 'Ginger'],
    notesTopDesc: 'A punchy, warm aromatic spice introduction',
    notesMiddle: ['Praline', 'Candied Fruits', 'White Flowers'],
    notesMiddleDesc: 'A sweet, rich, and indulgent gourmand heart',
    notesBase: ['Coffee', 'Vanilla', 'Tonka Bean', 'Benzoin', 'Musk'],
    notesBaseDesc: 'A deep, roasted coffee-infused gourmand finish',
    bestTimeToWear: 'Cold winter nights, coffee dates, evening socials, and high-end formal events.',
    notBestTimeToWear: 'Scorching daytime weather, where its dense roasted coffee and spice notes can feel overpowering.',
    fragranceFamily: 'Coffee Gourmand'
  },
  {
    id: 'khamrah-dukhan',
    name: 'Lattafa Khamrah Dukhan',
    timeTag: 'NIGHT',
    tagline: 'Warm Spices, Resins & Smoked Woods',
    description: 'A smoky, mysterious, and rich opening of Warm Spices and Resins gives way to a dark, smooth balance of Sweet Gourmand Notes and Woody Accords, before drying down into a deep, smoky-sweet, long-lasting oriental trail of Smoked Woods, Amber, and Vanilla. Khamrah Dukhan is the collection\'s most nocturnal, mysterious edition.',
    priceUSD: 50,
    priceSSP: 400000,
    originalPriceUSD: 45,
    originalPriceSSP: 360000,
    rating: 4.9,
    reviewsCount: 76,
    image: '/images/khamrah_placeholder.svg',
    stockCount: 7,
    badge: '🌙 NIGHT ESSENTIAL',
    projection: 'Deep & Smoky Sillage',
    longevity: '10 - 12 Hours',
    volume: '100ml',
    concentration: 'Eau de Parfum (EDP), 100ml',
    notesTop: ['Warm Spices', 'Resins'],
    notesTopDesc: 'A smoky, mysterious, and rich opening',
    notesMiddle: ['Sweet Gourmand Notes', 'Woody Accords'],
    notesMiddleDesc: 'A dark, smooth balance of sweetness and wood',
    notesBase: ['Smoked Woods', 'Amber', 'Vanilla', 'Balsamic Notes'],
    notesBaseDesc: 'A deep, smoky-sweet, and long-lasting oriental trail',
    bestTimeToWear: 'Late nights, cool weather, formal evening galas, and smoke-friendly social environments.',
    notBestTimeToWear: 'Bright spring or summer days, as the deep, smoky-resinous profile is engineered specifically for dark, cool atmospheres.',
    fragranceFamily: 'Smoky Oriental Gourmand'
  }
];

export const RECOMMENDED_BUNDLES: RecommendedBundle[] = [
  {
    id: 'bundle-full-collection',
    name: 'The Full Lattafa Khamrah Collection (All 3 Bottles)',
    badge: 'MAX SAVINGS - SAVE $15!',
    description: 'Own the complete Lattafa Khamrah gourmand trilogy! Khamrah, Khamrah Qahwa, and Khamrah Dukhan. Total 3x 100ml bottles, with -$5 off every bottle automatically applied.',
    productIds: ['khamrah', 'khamrah-qahwa', 'khamrah-dukhan'],
    priceUSD: 105,
    originalPriceUSD: 120,
    savingsUSD: 15,
    isPopular: true
  }
];

export const REVIEWS_DATA: Review[] = [
  {
    id: 'rev-1',
    name: 'Akuol M.',
    location: 'Munuki, Juba',
    rating: 5,
    quote: 'Lattafa Khamrah smells like a warm hug! Dates and praline all over cinnamon, so addictive. Delivery to Munuki was under 2 hours.',
    favoritePerfume: 'Lattafa Khamrah',
    date: '2 days ago'
  },
  {
    id: 'rev-2',
    name: 'Deng A.',
    location: 'Tongping, Juba',
    rating: 5,
    quote: 'Khamrah Qahwa is unreal — you can genuinely smell the roasted coffee in the dry-down. I got so many compliments at a wedding in Tongping.',
    favoritePerfume: 'Lattafa Khamrah Qahwa',
    date: '4 days ago'
  },
  {
    id: 'rev-3',
    name: 'Nyandeng K.',
    location: 'Konyo Konyo, Juba',
    rating: 5,
    quote: 'I ordered the Full Khamrah Collection bundle and saved $15 automatically. All three bottles are 100% authentic Lattafa, super luxurious for the price.',
    favoritePerfume: 'The Full Lattafa Khamrah Collection',
    date: '1 week ago'
  },
  {
    id: 'rev-4',
    name: 'James L.',
    location: 'Nyakuron, Juba',
    rating: 5,
    quote: 'Khamrah Dukhan is dark, smoky, and mysterious — perfect for cool Juba nights. Rider delivered straight to my gate in Nyakuron, cash on delivery.',
    favoritePerfume: 'Lattafa Khamrah Dukhan',
    date: '5 days ago'
  },
  {
    id: 'rev-5',
    name: 'Grace I.',
    location: 'Jebel, Juba',
    rating: 5,
    quote: 'Fast same-day delivery to Jebel! The gourmand sweetness on Khamrah lasts all evening. Juba Fashion Hub is the real deal for genuine imports.',
    favoritePerfume: 'Lattafa Khamrah',
    date: '1 week ago'
  }
];

export const INITIAL_KNOWLEDGE_BASE: KnowledgeBase = {
  storeName: 'Juba Fashion Hub',
  tagline: 'Premier Luxury Perfume Store in Juba, South Sudan',
  location: 'Online Store based in Juba, South Sudan (Direct Supplier Warehouses)',
  contactPhone: '+211 911 267 703',
  contactWhatsApp: '+211 911 267 703',
  aboutStore: 'Juba Fashion Hub is Juba\'s official destination for 100% authentic designer fragrances, featuring the indulgent Lattafa Khamrah Collection. We offer guaranteed same-day delivery across Juba and automatic bundle savings (-$5 off every bottle when you buy 2 or more!).',
  deliveryPolicy: 'Same-day express delivery within 120 minutes across all Juba locations for orders placed between 9:00 AM and 4:30 PM. Cash on delivery available!',
  paymentMethodsDetail: 'We accept payments in USD and SSP ($1 USD = 8,000 SSP):\n1. Cash on Delivery (COD) in USD or SSP ($0 fee).\n2. Bank Transfer on Delivery (USD $0 fee, or SSP with 50% liquidation fee).\n3. m-GURUSH Mobile Money.',
  activePromotions: [
    {
      code: 'AUTOMATIC_BUNDLE',
      description: 'Subtract -$5 USD (40,000 SSP) from EVERY bottle when you buy 2 or more bottles!'
    }
  ]
};

export const DEFAULT_TELEGRAM_CONFIG: TelegramConfig = {
  botToken: '7829102934:AAGx7q_Zk92812kX9a3182-JUBA_BOT',
  chatId: '-100234918239',
  enabled: true,
  autoNotifyOnOrder: true,
};
