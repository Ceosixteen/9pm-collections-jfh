import { PerfumeProduct, RecommendedBundle, KnowledgeBase, TelegramConfig, CurrencyConfig, Review } from '../types';

export const DEFAULT_CURRENCY_CONFIG: CurrencyConfig = {
  rate: 8000, // 1 USD = 8000 SSP
  symbolUSD: '$',
  symbolSSP: 'SSP ',
  lastUpdated: new Date().toISOString(),
};

export const PERFUMES_DATA: PerfumeProduct[] = [
  {
    id: '9pm-rebel',
    name: '9PM Rebel by Afnan',
    timeTag: '9PM',
    tagline: 'Pineapple, Granny Smith Apple, Caramel & Dry Woods',
    description: 'A bold, intoxicating night fragrance engineered for maximum presence. Opens with an explosive, crisp, and fruity initial burst of Mandarin, Pineapple, and Granny Smith Apple, transitioning into a smooth earthy heart, and finishing with a deep, rich, and decadent caramel-wood dry-down that clings powerfully to the skin.',
    priceUSD: 40,
    priceSSP: 320000,
    originalPriceUSD: 50,
    originalPriceSSP: 400000,
    rating: 4.9,
    reviewsCount: 184,
    image: '/images/9pm_rebel.jpg',
    stockCount: 4,
    isBestSeller: true,
    badge: '🔥 FEW LEFT - SOON FINISHING!',
    projection: 'Strong & Radiating (2-3 Meters)',
    longevity: '8 - 10 Hours',
    volume: '100ml',
    concentration: 'Eau de Parfum (EDP), 100ml',
    notesTop: ['Mandarin', 'Pineapple', 'Granny Smith Apple'],
    notesTopDesc: 'An explosive, crisp, and fruity initial burst',
    notesMiddle: ['Cedarwood', 'Oakmoss', 'Vanilla'],
    notesMiddleDesc: 'A smooth, earthy, and softly sweet transition',
    notesBase: ['Caramel', 'Dry Woods', 'Ambergris', 'Musk'],
    notesBaseDesc: 'A deep, rich, and decadent finish that clings powerfully to the skin',
    bestTimeToWear: 'Nighttime, cooler evening weather, social gatherings, clubs, and high-energy outings.',
    notBestTimeToWear: 'Scorching hot summer afternoons or cramped, professional office spaces (the heavy sweetness and projection can overwhelm closed environments).',
    fragranceFamily: 'Decadent Fruity Wood & Caramel'
  },
  {
    id: '9pm-elixir',
    name: '9PM Elixir by Afnan',
    timeTag: '9PM',
    tagline: 'Opulent Cardamom, Spiced Leather & Resinous Labdanum',
    description: 'The pinnacle of luxury in the 9PM line. Opens with a warm, opulent, and boldly spiced opening of Cardamom, Nutmeg, and Elemi, unfolding into a rich, masculine floral-leathery heart, and settling into a dark, resinous, and deeply sophisticated dry-down.',
    priceUSD: 40,
    priceSSP: 320000,
    originalPriceUSD: 50,
    originalPriceSSP: 400000,
    rating: 5.0,
    reviewsCount: 142,
    image: '/images/9pm_elixir.jpg',
    stockCount: 5,
    isBestSeller: true,
    badge: '⚡ NEW LUXURY ELIXIR - LIMITED STOCK',
    projection: 'Intense Enveloping Sillage',
    longevity: '9 - 11 Hours',
    volume: '100ml',
    concentration: 'Eau de Parfum (EDP), 100ml',
    notesTop: ['Cardamom', 'Nutmeg', 'Elemi'],
    notesTopDesc: 'A warm, opulent, and boldly spiced opening',
    notesMiddle: ['Pimento', 'Leather', 'Lavender'],
    notesMiddleDesc: 'A rich, masculine, and intensely textured floral-leathery heart',
    notesBase: ['Vanilla', 'Patchouli', 'Labdanum', 'Rock Rose'],
    notesBaseDesc: 'A dark, resinous, and deeply sophisticated dry-down',
    bestTimeToWear: 'Formal night events, winter galas, romantic dates, and high-stakes evening meetings.',
    notBestTimeToWear: 'Casual daytime errands, outdoor sports, or hot, humid weather (the dense leather and spice profile thrives best in cooler air).',
    fragranceFamily: 'Warm Spiced Leather & Resinous Amber'
  },
  {
    id: '9pm-normal',
    name: '9PM Black (Classic) by Afnan',
    timeTag: '9PM',
    tagline: 'Apple, Cinnamon, Orange Blossom & Bourbon Vanilla',
    description: 'The world-famous compliment magnet! Features a sweet, spicy, and fruit-forward introduction of Apple, Cinnamon, Wild Lavender, and Bergamot, balanced by clean aromatic florals and anchored by a warm, intoxicating amber-vanilla trail offering legendary longevity.',
    priceUSD: 35,
    priceSSP: 280000,
    originalPriceUSD: 45,
    originalPriceSSP: 360000,
    rating: 4.9,
    reviewsCount: 389,
    image: '/images/9pm_classic_black.jpg',
    stockCount: 6,
    isBestSeller: true,
    badge: '⭐ ALL-TIME BEST SELLER IN JUBA',
    projection: 'Beast Mode High Projection',
    longevity: '9 - 12 Hours',
    volume: '100ml',
    concentration: 'Eau de Parfum (EDP), 100ml',
    notesTop: ['Apple', 'Cinnamon', 'Wild Lavender', 'Bergamot'],
    notesTopDesc: 'A sweet, spicy, and fruit-forward introduction',
    notesMiddle: ['Orange Blossom', 'Lily-of-the-Valley'],
    notesMiddleDesc: 'Clean, aromatic florals that balance the intense sweetness',
    notesBase: ['Vanilla', 'Tonka Bean', 'Amber', 'Patchouli'],
    notesBaseDesc: 'A warm, intoxicating, amber-vanilla trail offering legendary longevity',
    bestTimeToWear: 'Autumn and winter nights, parties, dates, and evening leisure.',
    notBestTimeToWear: 'High-heat outdoor activities or strict daytime corporate environments (its sweet profile is built to cut through cool night air).',
    fragranceFamily: 'Sweet Amber Vanilla Spicy'
  },
  {
    id: '9am-dive',
    name: '9AM Dive by Afnan',
    timeTag: '9AM',
    tagline: 'Mint, Lemon, Apple, Incense & Sandalwood',
    description: 'An ultra-refreshing, zesty, and minty aquatic explosion for daytime wear. Opens with Mint, Lemon, Black Currant, and Pink Pepper, grounded by a crisp fruity core with a mysterious, clean hint of incense, and finishing with a woody, spicy, clean-cut base.',
    priceUSD: 40,
    priceSSP: 320000,
    originalPriceUSD: 50,
    originalPriceSSP: 400000,
    rating: 4.8,
    reviewsCount: 167,
    image: '/images/9am_dive.jpg',
    stockCount: 3,
    badge: '🌊 FRESH DAYTIME FAVORITE - 3 LEFT',
    projection: 'Radiant Fresh Sillage',
    longevity: '7 - 9 Hours',
    volume: '100ml',
    concentration: 'Eau de Parfum (EDP), 100ml',
    notesTop: ['Mint', 'Lemon', 'Black Currant', 'Pink Pepper'],
    notesTopDesc: 'An ultra-refreshing, zesty, and minty aquatic explosion',
    notesMiddle: ['Apple', 'Incense', 'Cedar'],
    notesMiddleDesc: 'A crisp fruity core grounded by a mysterious, clean hint of smoke/incense',
    notesBase: ['Patchouli', 'Ginger', 'Sandalwood', 'Jasmine'],
    notesBaseDesc: 'A woody, spicy, and deeply clean-cut finish',
    bestTimeToWear: 'Daytime, spring and summer seasons, office environments, the gym, casual outdoor hangouts, and vacations.',
    notBestTimeToWear: 'Deep winter nights or formal black-tie galas (its bright, aquatic nature can feel too casual for freezing temperatures or ultra-formal wear).',
    fragranceFamily: 'Fresh Aquatic Citrus & Smoky Incense'
  },
  {
    id: '9pm-pour-femme',
    name: '9PM Pour Femme by Afnan',
    timeTag: '9PM',
    tagline: 'Luscious Raspberry, Peony, Iris & Earthy Cedar-Amber',
    description: 'An elegant, alluring feminine fragrance designed for aesthetic elegance. Opens with a mouth-watering, luscious, and bright berry-fruit opening of Raspberry, Apple, Violet, and Orange, blooming into a luxurious powdery floral heart, and anchored by a unique earthy woody-amber base.',
    priceUSD: 35,
    priceSSP: 280000,
    originalPriceUSD: 45,
    originalPriceSSP: 360000,
    rating: 4.9,
    reviewsCount: 205,
    image: '/images/9pm_pour_femme.jpg',
    stockCount: 5,
    badge: '💕 MOST LOVED FEMININE SCENT',
    projection: 'Soft & Alluring Sillage',
    longevity: '7 - 9 Hours',
    volume: '100ml',
    concentration: 'Eau de Parfum (EDP), 100ml',
    notesTop: ['Raspberry', 'Apple', 'Violet', 'Orange'],
    notesTopDesc: 'A mouth-watering, luscious, and bright berry-fruit opening',
    notesMiddle: ['Rose', 'Peony', 'Iris', 'Jasmine'],
    notesMiddleDesc: 'A luxurious, powdery, and romantic floral heart',
    notesBase: ['Cedar', 'Cypress', 'Pine Tree', 'Amber'],
    notesBaseDesc: 'A unique, earthy, woody-amber base that anchors the sweetness with elegance',
    bestTimeToWear: 'Versatile signature wear for daytime social events, romantic evening outings, brunches, and transitional weather.',
    notBestTimeToWear: 'Heavy physical workouts or rugged outdoor labor (the rich floral-fruit composition is designed for aesthetic elegance and social settings).',
    fragranceFamily: 'Luscious Floral Fruity & Woody Amber'
  }
];

export const RECOMMENDED_BUNDLES: RecommendedBundle[] = [
  {
    id: 'bundle-night-duo',
    name: 'The Night Duo (Rebel + Elixir)',
    badge: 'SAVE $10 (-$5 OFF EACH BOTTLE)',
    description: 'The ultimate evening combination for grand occasions, dinner dates, and night events in Juba. Includes 1x 9PM Rebel + 1x 9PM Elixir.',
    productIds: ['9pm-rebel', '9pm-elixir'],
    priceUSD: 70,
    originalPriceUSD: 80,
    savingsUSD: 10,
    isPopular: true
  },
  {
    id: 'bundle-day-night',
    name: 'Sunrise to Sundown (9AM Dive + 9PM Classic)',
    badge: 'BEST DAY & NIGHT PAIRING',
    description: 'Wear 9AM Dive for fresh workplace energy in the heat, then switch to 9PM Classic when evening rolls in. Includes 1x 9AM Dive + 1x 9PM Classic.',
    productIds: ['9am-dive', '9pm-normal'],
    priceUSD: 65,
    originalPriceUSD: 75,
    savingsUSD: 10,
    isPopular: true
  },
  {
    id: 'bundle-his-hers',
    name: 'His & Hers Couple Set (Rebel + Pour Femme)',
    badge: 'PERFECT GIFT SET',
    description: 'The romantic duo for couples in Juba. 1x 9PM Rebel for him + 1x 9PM Pour Femme for her.',
    productIds: ['9pm-rebel', '9pm-pour-femme'],
    priceUSD: 65,
    originalPriceUSD: 75,
    savingsUSD: 10
  },
  {
    id: 'bundle-full-collection',
    name: 'The Full 9 Collection (All 5 Bottles)',
    badge: 'MAX SAVINGS - SAVE $25!',
    description: 'Own the complete Afnan 9 Collection! 9PM Rebel, 9PM Elixir, 9PM Classic, 9AM Dive, and 9PM Pour Femme. Total 5x 100ml bottles.',
    productIds: ['9pm-rebel', '9pm-elixir', '9pm-normal', '9am-dive', '9pm-pour-femme'],
    priceUSD: 165,
    originalPriceUSD: 190,
    savingsUSD: 25,
    isPopular: true
  }
];

export const REVIEWS_DATA: Review[] = [
  {
    id: 'rev-1',
    name: 'Akuol M.',
    location: 'Munuki, Juba',
    rating: 5,
    quote: '9PM Rebel smells unbelievable! Delivery to Munuki was under 3 hours on the exact same day. The projection in Juba heat is beast mode!',
    favoritePerfume: '9PM Rebel by Afnan',
    date: '2 days ago'
  },
  {
    id: 'rev-2',
    name: 'Deng A.',
    location: 'Tongping, Juba',
    rating: 5,
    quote: 'I ordered the Night Duo bundle (9PM Elixir + 9PM Rebel) and automatically got $10 off. Original Afnan bottles, super luxurious!',
    favoritePerfume: '9PM Elixir & Rebel Duo',
    date: '3 days ago'
  },
  {
    id: 'rev-3',
    name: 'Nyandeng K.',
    location: 'Hai Cinema, Juba',
    rating: 5,
    quote: '9PM Pour Femme is my signature fragrance now! Sweet, elegant, and I get so many compliments at my office in Hai Cinema.',
    favoritePerfume: '9PM Pour Femme',
    date: '1 week ago'
  },
  {
    id: 'rev-4',
    name: 'James L.',
    location: 'Custom Market Area, Juba',
    rating: 5,
    quote: '9AM Dive is extremely refreshing for morning meetings. Delivery driver brought it straight to my store. Cash on delivery in Juba is so convenient.',
    favoritePerfume: '9AM Dive by Afnan',
    date: '5 days ago'
  },
  {
    id: 'rev-5',
    name: 'Grace I.',
    location: 'Gudele 1, Juba',
    rating: 5,
    quote: 'Fast same-day delivery to Gudele! 100% original perfume from Afnan. The bundle discount saved me money when I bought for my brother too.',
    favoritePerfume: '9PM Classic',
    date: '1 week ago'
  },
  {
    id: 'rev-6',
    name: 'Emmanuel W.',
    location: 'Thongpiny, Juba',
    rating: 5,
    quote: '9PM Classic is a compliment magnet. Best $35 spent in Juba. Juba Fashion Hub is the real deal for genuine designer perfumes!',
    favoritePerfume: '9PM Classic',
    date: '2 weeks ago'
  }
];

export const INITIAL_KNOWLEDGE_BASE: KnowledgeBase = {
  storeName: 'Juba Fashion Hub',
  tagline: 'Premier Luxury Perfume Store in Juba, South Sudan',
  location: 'Online Store based in Juba, South Sudan (Direct Supplier Warehouses)',
  contactPhone: '+211 911 267 703',
  contactWhatsApp: '+211 911 267 703',
  aboutStore: 'Juba Fashion Hub is Juba\'s official destination for 100% authentic designer fragrances, featuring the legendary Afnan 9PM and 9AM collection. We offer guaranteed same-day delivery across Juba and automatic bundle savings (-$5 off every bottle when you buy 2 or more!).',
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
