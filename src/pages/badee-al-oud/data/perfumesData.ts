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
    id: 'oud-black',
    name: "Bade'e Al Oud Black (Oud for Glory)",
    timeTag: 'NIGHT',
    tagline: 'Saffron, Natural Oud Wood & Deep Musk',
    description: 'A majestic, warm, and spicy introduction of Saffron, Lavender, and Nutmeg unfolds into a rich, resinous, and exotic core of Natural Oud Wood and Agarwood, settling into a deep, mysterious, and incredibly long-lasting Patchouli-Musk trail. Eastern luxury at its most commanding.',
    priceUSD: 40,
    priceSSP: 320000,
    originalPriceUSD: 45,
    originalPriceSSP: 360000,
    rating: 4.9,
    reviewsCount: 211,
    image: '/images/oud_black.png',
    stockCount: 6,
    isBestSeller: true,
    badge: '⭐ SIGNATURE OUD - BEST SELLER',
    projection: 'Majestic & Long-Throw Sillage',
    longevity: '10 - 12 Hours',
    volume: '100ml',
    concentration: 'Eau de Parfum (EDP), 100ml',
    notesTop: ['Saffron', 'Lavender', 'Nutmeg'],
    notesTopDesc: 'A majestic, warm, and spicy introductory blend',
    notesMiddle: ['Natural Oud Wood', 'Agarwood'],
    notesMiddleDesc: 'A rich, resinous, and exotic woody core',
    notesBase: ['Patchouli', 'Musk'],
    notesBaseDesc: 'A deep, mysterious, and incredibly long-lasting earthy trail',
    bestTimeToWear: 'Nighttime events, cooler autumn and winter weather, formal occasions, and executive meetings.',
    notBestTimeToWear: 'Casual summer days or high-heat outdoor environments (the heavy, dense oud and spice can overpower hot air).',
    fragranceFamily: 'Spicy Oud & Deep Musk'
  },
  {
    id: 'oud-amethyst',
    name: "Bade'e Al Oud Amethyst",
    timeTag: 'NIGHT',
    tagline: 'Turkish Rose, Amber & Agarwood',
    description: 'A bright, zesty, and sparkling spicy-citrus opening of Pink Pepper and Bergamot blooms into a lavish, romantic, and opulent floral heart of Turkish Rose, Bulgarian Rose, and Jasmine, before settling into a warm, sweet, and deeply sophisticated gourmand-oud finish of Amber, Vanilla, and Agarwood.',
    priceUSD: 40,
    priceSSP: 320000,
    originalPriceUSD: 45,
    originalPriceSSP: 360000,
    rating: 4.9,
    reviewsCount: 178,
    image: '/images/oud_amethyst.png',
    stockCount: 5,
    isBestSeller: true,
    badge: '💜 EVENING FAVORITE - 5 LEFT',
    projection: 'Opulent Enveloping Sillage',
    longevity: '9 - 11 Hours',
    volume: '100ml',
    concentration: 'Eau de Parfum (EDP), 100ml',
    notesTop: ['Pink Pepper', 'Bergamot'],
    notesTopDesc: 'A bright, zesty, and sparkling spicy-citrus opening',
    notesMiddle: ['Turkish Rose', 'Bulgarian Rose', 'Jasmine'],
    notesMiddleDesc: 'A lavish, romantic, and opulent floral heart',
    notesBase: ['Amber', 'Vanilla', 'Agarwood (Oud)'],
    notesBaseDesc: 'A warm, sweet, and deeply sophisticated gourmand-oud finish',
    bestTimeToWear: 'Evening galas, romantic dates, cooler evenings, and upscale social gatherings.',
    notBestTimeToWear: 'Casual daytime errands or intense outdoor physical activity (its rich, rosy-amber sweetness shines brightest in controlled or cool atmospheres).',
    fragranceFamily: 'Floral Rose Amber Oud'
  },
  {
    id: 'oud-sublime',
    name: "Bade'e Al Oud Sublime",
    timeTag: 'DAY',
    tagline: 'Litchi, Jasmine & Creamy Patchouli',
    description: 'A fresh, ultra-juicy, and sweet fruity-floral opening of Litchi, Rose, and Apple leads into an exotic, lush, and rich fruity-floral core of Jasmine and Plum, grounded by a creamy, warm, and grounding earthy-sweet base of Moss, Vanilla, and Patchouli.',
    priceUSD: 40,
    priceSSP: 320000,
    originalPriceUSD: 45,
    originalPriceSSP: 360000,
    rating: 4.8,
    reviewsCount: 154,
    image: '/images/oud_sublime.png',
    stockCount: 4,
    badge: '☀️ DAYTIME SIGNATURE - 4 LEFT',
    projection: 'Radiant Fruity-Floral Sillage',
    longevity: '8 - 10 Hours',
    volume: '100ml',
    concentration: 'Eau de Parfum (EDP), 100ml',
    notesTop: ['Litchi', 'Rose', 'Apple'],
    notesTopDesc: 'A fresh, ultra-juicy, and sweet fruity-floral opening',
    notesMiddle: ['Jasmine', 'Plum'],
    notesMiddleDesc: 'An exotic, lush, and rich fruity-floral core',
    notesBase: ['Moss', 'Vanilla', 'Patchouli'],
    notesBaseDesc: 'A creamy, warm, and grounding earthy-sweet base',
    bestTimeToWear: 'Daytime signature wear, spring and summer outings, brunches, and casual social meetups.',
    notBestTimeToWear: 'Deep, freezing winter nights where heavy, dark fragrances are preferred over bright, juicy fruits.',
    fragranceFamily: 'Fruity Floral Oud'
  },
  {
    id: 'oud-noble-blush',
    name: "Bade'e Al Oud Noble Blush (Noble Rush)",
    timeTag: 'DAY',
    tagline: 'Rose Milk, Almond Meringue & Sandalwood',
    description: 'A delicate, creamy, and soft floral-lactonic introduction of Rose Milk unfolds into a sugary, nutty, and comforting gourmand heart of Almond and Meringue, finishing with a velvety, warm, and sensual wood-infused base of Sandalwood, Vanilla, and Musk.',
    priceUSD: 40,
    priceSSP: 320000,
    originalPriceUSD: 45,
    originalPriceSSP: 360000,
    rating: 4.9,
    reviewsCount: 132,
    image: '/images/oud_noble_blush.png',
    stockCount: 5,
    badge: '🌸 MOST LOVED FEMININE SCENT',
    projection: 'Soft & Velvety Sillage',
    longevity: '7 - 9 Hours',
    volume: '100ml',
    concentration: 'Eau de Parfum (EDP), 100ml',
    notesTop: ['Rose Milk'],
    notesTopDesc: 'A delicate, creamy, and soft floral-lactonic introduction',
    notesMiddle: ['Almond', 'Meringue'],
    notesMiddleDesc: 'A sugary, nutty, and comforting gourmand heart',
    notesBase: ['Sandalwood', 'Vanilla', 'Musk'],
    notesBaseDesc: 'A velvety, warm, and sensual wood-infused finish',
    bestTimeToWear: 'Daytime dates, cozy indoor gatherings, spring days, and evening casual outings.',
    notBestTimeToWear: 'High-intensity workouts or extreme outdoor heat (the rich, sweet meringue and milk profile is built for smooth, comforting elegance).',
    fragranceFamily: 'Gourmand Musk Sandalwood'
  },
  {
    id: 'oud-white',
    name: "Bade'e Al Oud White (Honor & Glory)",
    timeTag: 'DAY',
    tagline: 'Pineapple, Crème Brûlée & Warm Spice',
    description: 'A uniquely decadent, sweet, and creamy-fruity introduction of Pineapple and Crème Brûlée unfolds into a warm, exotic, and richly spiced heart of Cinnamon, Turmeric, Black Pepper, and Benzoin, settling into a smooth, woody, and comforting gourmand-oriental dry-down of Vanilla, Sandalwood, Cashmeran, and Moss. The luminous companion to Bade\'e Al Oud Black.',
    priceUSD: 40,
    priceSSP: 320000,
    originalPriceUSD: 45,
    originalPriceSSP: 360000,
    rating: 4.8,
    reviewsCount: 96,
    image: '/images/oud_white.png',
    stockCount: 6,
    badge: '🤍 NEW - HONOR & GLORY',
    projection: 'Rich & Radiant Sillage',
    longevity: '9 - 11 Hours',
    volume: '100ml',
    concentration: 'Eau de Parfum (EDP), 100ml',
    notesTop: ['Pineapple', 'Crème Brûlée'],
    notesTopDesc: 'A uniquely decadent, sweet, and creamy-fruity introduction',
    notesMiddle: ['Cinnamon', 'Turmeric', 'Black Pepper', 'Benzoin'],
    notesMiddleDesc: 'A warm, exotic, and richly spiced heart that adds depth and character',
    notesBase: ['Vanilla', 'Sandalwood', 'Cashmeran', 'Moss'],
    notesBaseDesc: 'A smooth, woody, and comforting gourmand-oriental dry-down',
    bestTimeToWear: 'Versatile for all seasons; exceptional for daytime outings, casual evenings, and settings where a sweet yet complex statement is desired.',
    notBestTimeToWear: 'High-intensity athletic sessions or extreme outdoor heat, as the rich crème brûlée and vanilla sweetness perform best in moderate temperatures.',
    fragranceFamily: 'Sweet Gourmand Spiced Oud'
  }
];

export const RECOMMENDED_BUNDLES: RecommendedBundle[] = [
  {
    id: 'bundle-night-duo',
    name: 'The Night Duo (Black + Amethyst)',
    badge: 'SAVE $10 (-$5 OFF EACH BOTTLE)',
    description: 'The ultimate evening combination for galas, formal events, and executive nights in Juba. Includes 1x Bade\'e Al Oud Black + 1x Bade\'e Al Oud Amethyst.',
    productIds: ['oud-black', 'oud-amethyst'],
    priceUSD: 70,
    originalPriceUSD: 80,
    savingsUSD: 10,
    isPopular: true
  },
  {
    id: 'bundle-day-duo',
    name: 'Sunrise Duo (Sublime + Noble Blush)',
    badge: 'BEST DAYTIME PAIRING',
    description: 'Wear Sublime for bright daytime energy, then switch to Noble Blush for cozy evenings. Includes 1x Sublime + 1x Noble Blush.',
    productIds: ['oud-sublime', 'oud-noble-blush'],
    priceUSD: 70,
    originalPriceUSD: 80,
    savingsUSD: 10,
    isPopular: true
  },
  {
    id: 'bundle-his-hers',
    name: 'His & Hers Set (Black + Noble Blush)',
    badge: 'PERFECT GIFT SET',
    description: 'A striking contrast duo for couples in Juba. 1x Bade\'e Al Oud Black for him + 1x Noble Blush for her.',
    productIds: ['oud-black', 'oud-noble-blush'],
    priceUSD: 70,
    originalPriceUSD: 80,
    savingsUSD: 10
  },
  {
    id: 'bundle-glory-duo',
    name: 'The Glory Duo (Black + White)',
    badge: 'OFFICIAL COMPANION SET',
    description: 'The signature Oud for Glory pairing. 1x Bade\'e Al Oud Black (Oud for Glory) + 1x Bade\'e Al Oud White (Honor & Glory) — dark and light, side by side.',
    productIds: ['oud-black', 'oud-white'],
    priceUSD: 70,
    originalPriceUSD: 80,
    savingsUSD: 10
  },
  {
    id: 'bundle-full-collection',
    name: "The Full Bade'e Al Oud Collection (All 5 Bottles)",
    badge: 'MAX SAVINGS - SAVE $25!',
    description: "Own the complete Lattafa Bade'e Al Oud Collection! Black, Amethyst, Sublime, Noble Blush, and White. Total 5x 100ml bottles.",
    productIds: ['oud-black', 'oud-amethyst', 'oud-sublime', 'oud-noble-blush', 'oud-white'],
    priceUSD: 175,
    originalPriceUSD: 200,
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
    quote: "Bade'e Al Oud Black smells unbelievably rich! Delivery to Munuki was under 3 hours on the exact same day. The oud trail lasts all night.",
    favoritePerfume: "Bade'e Al Oud Black",
    date: '2 days ago'
  },
  {
    id: 'rev-2',
    name: 'Deng A.',
    location: 'Tongping, Juba',
    rating: 5,
    quote: "I ordered the Night Duo bundle (Black + Amethyst) and automatically got $10 off. Original Lattafa bottles, incredibly luxurious!",
    favoritePerfume: 'Black & Amethyst Duo',
    date: '3 days ago'
  },
  {
    id: 'rev-3',
    name: 'Nyandeng K.',
    location: 'Hai Cinema, Juba',
    rating: 5,
    quote: "Noble Blush is my signature fragrance now! Sweet, elegant, and I get so many compliments at my office in Hai Cinema.",
    favoritePerfume: "Bade'e Al Oud Noble Blush",
    date: '1 week ago'
  },
  {
    id: 'rev-4',
    name: 'James L.',
    location: 'Custom Market Area, Juba',
    rating: 5,
    quote: "Sublime is extremely refreshing for daytime meetings. Delivery driver brought it straight to my store. Cash on delivery in Juba is so convenient.",
    favoritePerfume: "Bade'e Al Oud Sublime",
    date: '5 days ago'
  },
  {
    id: 'rev-5',
    name: 'Grace I.',
    location: 'Gudele 1, Juba',
    rating: 5,
    quote: "Fast same-day delivery to Gudele! 100% original perfume from Lattafa. The bundle discount saved me money when I bought for my sister too.",
    favoritePerfume: "Bade'e Al Oud Amethyst",
    date: '1 week ago'
  },
  {
    id: 'rev-7',
    name: 'Michael T.',
    location: 'Juba Town',
    rating: 5,
    quote: "Bade'e Al Oud White is unlike anything else I've worn — that creme brulee opening is so unique. Got the Glory Duo with Black too, perfect pairing!",
    favoritePerfume: "Bade'e Al Oud White",
    date: '4 days ago'
  },
  {
    id: 'rev-6',
    name: 'Emmanuel W.',
    location: 'Thongpiny, Juba',
    rating: 5,
    quote: "Bade'e Al Oud Black is a compliment magnet. Best oud I've worn in Juba. Juba Fashion Hub is the real deal for genuine designer perfumes!",
    favoritePerfume: "Bade'e Al Oud Black",
    date: '2 weeks ago'
  }
];

export const INITIAL_KNOWLEDGE_BASE: KnowledgeBase = {
  storeName: 'Juba Fashion Hub',
  tagline: 'Premier Luxury Perfume Store in Juba, South Sudan',
  location: 'Online Store based in Juba, South Sudan (Direct Supplier Warehouses)',
  contactPhone: '+211 911 267 703',
  contactWhatsApp: '+211 911 267 703',
  aboutStore: "Juba Fashion Hub is Juba's official destination for 100% authentic designer fragrances, featuring the majestic Lattafa Bade'e Al Oud Collection. We offer guaranteed same-day delivery across Juba and automatic bundle savings (-$5 off every bottle when you buy 2 or more!).",
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
