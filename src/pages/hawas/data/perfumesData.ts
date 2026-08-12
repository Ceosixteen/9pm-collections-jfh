import { PerfumeProduct, RecommendedBundle, KnowledgeBase, TelegramConfig, CurrencyConfig, Review } from '../types';

export const DEFAULT_CURRENCY_CONFIG: CurrencyConfig = {
  rate: 8000, // 1 USD = 8000 SSP
  symbolUSD: '$',
  symbolSSP: 'SSP ',
  lastUpdated: new Date().toISOString(),
};

export const PERFUMES_DATA: PerfumeProduct[] = [
  {
    id: 'hawas-for-him',
    name: 'Hawas for Him by Rasasi',
    timeTag: 'DAY',
    tagline: 'Apple, Bergamot, Cinnamon & Legendary Ambergris',
    description: 'The original, mass-appealing Rasasi signature. Opens with a sparkling, bright, and mouth-watering fruity-citrus blast of Apple, Bergamot, Lemon, and Cinnamon, unfolding into an aquatic sweet-fruity heart balanced by clean florals and soft spice, and settling into a legendary, salty-sweet ambergris trail with immense depth.',
    priceUSD: 35,
    priceSSP: 280000,
    originalPriceUSD: 40,
    originalPriceSSP: 320000,
    rating: 4.9,
    reviewsCount: 231,
    image: '/images/hawas_for_him.jpg',
    stockCount: 6,
    isBestSeller: true,
    badge: '⭐ ALL-TIME BEST SELLER IN JUBA',
    projection: 'Strong & Radiating (2-3 Meters)',
    longevity: '8 - 10 Hours',
    volume: '100ml',
    concentration: 'Eau de Parfum (EDP), 100ml',
    notesTop: ['Apple', 'Bergamot', 'Lemon', 'Cinnamon'],
    notesTopDesc: 'A sparkling, bright, and mouth-watering fruity-citrus blast with a touch of warmth',
    notesMiddle: ['Water Notes', 'Plum', 'Orange Blossom', 'Cardamom'],
    notesMiddleDesc: 'An aquatic, sweet-fruity heart balanced by clean florals and soft spice',
    notesBase: ['Ambergris', 'Musk', 'Driftwood', 'Patchouli'],
    notesBaseDesc: 'A legendary, salty-sweet ambergris trail that provides immense depth and a signature mass-appealing finish',
    bestTimeToWear: 'Versatile year-round signature scent; phenomenal for daytime outings, gym sessions, casual hangouts, and warm weather.',
    notBestTimeToWear: 'Freezing winter nights where you want a heavily spiced, dark fragrance (though it can still pull compliments, it truly shines in moderate to high heat).',
    fragranceFamily: 'Fruity Citrus Amber Musk'
  },
  {
    id: 'hawas-ice',
    name: 'Hawas Ice by Rasasi',
    timeTag: 'DAY',
    tagline: 'Arctic Apple, Mint, Lemon & Icy Driftwood',
    description: 'An arctic, ultra-crisp, and hyper-refreshing citrus-mint explosion built for extreme heat. Opens with Apple, Bergamot, Lemon, Mint, and Italian Lemon, moving into a vibrant, sweet-spicy core that keeps the original Hawas DNA with an iced twist, and finishing with a clean, icy, woody-musky dry-down with nuclear longevity.',
    priceUSD: 35,
    priceSSP: 280000,
    originalPriceUSD: 40,
    originalPriceSSP: 320000,
    rating: 4.8,
    reviewsCount: 158,
    image: '/images/hawas_ice.png',
    stockCount: 5,
    badge: '❄️ HOT WEATHER FAVORITE - FEW LEFT',
    projection: 'Fresh & Radiant Sillage',
    longevity: '7 - 9 Hours',
    volume: '100ml',
    concentration: 'Eau de Parfum (EDP), 100ml',
    notesTop: ['Apple', 'Bergamot', 'Lemon', 'Mint', 'Italian Lemon'],
    notesTopDesc: 'An arctic, ultra-crisp, and hyper-refreshing citrus-mint explosion',
    notesMiddle: ['Orange Blossom', 'Cardamom', 'Plum'],
    notesMiddleDesc: 'A vibrant, sweet-spicy core that maintains the original Hawas DNA with an iced twist',
    notesBase: ['Ambergris', 'Musk', 'Driftwood', 'Moss'],
    notesBaseDesc: 'A clean, icy, woody-musky dry-down with nuclear longevity',
    bestTimeToWear: 'Hot summer days, intense heatwaves, daytime outdoor events, and high-energy athletic settings.',
    notBestTimeToWear: 'Cold winter weather (the freezing mint and ultra-aquatic freshness are tailor-made to cut through high temperatures).',
    fragranceFamily: 'Fresh Aquatic Citrus Mint'
  },
  {
    id: 'hawas-black',
    name: 'Hawas Black by Rasasi',
    timeTag: 'NIGHT',
    tagline: 'Grapefruit, Dark Berries, Lavender & Smoky Vetiver',
    description: 'A sharp, sophisticated, and deeper citrus-fruit opening of Bergamot, Grapefruit, Lemon, and Dark Berries, moving into a dark, aromatic, smoky-woody transition of Lavender, Patchouli, and Aquatic Accords, and settling into a rich, earthy, mysterious dry-down that leans mature and nocturnal.',
    priceUSD: 35,
    priceSSP: 280000,
    originalPriceUSD: 40,
    originalPriceSSP: 320000,
    rating: 4.9,
    reviewsCount: 197,
    image: '/images/hawas_black.png',
    stockCount: 4,
    isBestSeller: true,
    badge: '🖤 CLUB & NIGHT FAVORITE - 4 LEFT',
    projection: 'Deep & Enveloping Sillage',
    longevity: '9 - 11 Hours',
    volume: '100ml',
    concentration: 'Eau de Parfum (EDP), 100ml',
    notesTop: ['Bergamot', 'Grapefruit', 'Lemon', 'Dark Berries'],
    notesTopDesc: 'A sharp, sophisticated, and deeper citrus-fruit opening',
    notesMiddle: ['Lavender', 'Patchouli', 'Woody Notes', 'Aquatic Accords'],
    notesMiddleDesc: 'A dark, aromatic, and smoky-woody transition',
    notesBase: ['Ambergris', 'Oakmoss', 'Dark Musk', 'Vetiver'],
    notesBaseDesc: 'A rich, earthy, and mysterious dry-down that leans more mature and nocturnal',
    bestTimeToWear: 'Nighttime adventures, clubbing, autumn/spring evenings, and dates where you want a darker, more brooding edge.',
    notBestTimeToWear: 'Scorching summer afternoons or casual daytime office environments (its heavier, darker undertones prefer cooler air).',
    fragranceFamily: 'Dark Aromatic Woody Citrus'
  },
  {
    id: 'hawas-fire',
    name: 'Hawas Fire by Rasasi',
    timeTag: 'NIGHT',
    tagline: 'Blood Orange, Chili, Leather & Molten Amber',
    description: 'A hot, vibrant, and aggressively warm opening of Blood Orange, Spiced Pepper, and Cardamom, blazing into a spicy-floral core of Cinnamon, Chili, Lavender, and Geranium that packs a serious punch, and finishing with a rich, molten, intoxicatingly warm base of Amber, Leather, Cedarwood, and Tonka Bean.',
    priceUSD: 35,
    priceSSP: 280000,
    originalPriceUSD: 40,
    originalPriceSSP: 320000,
    rating: 4.9,
    reviewsCount: 121,
    image: '/images/hawas_fire.jpg',
    stockCount: 3,
    badge: '🔥 NEW WINTER RELEASE - 3 LEFT',
    projection: 'Intense & Long-Throw Sillage',
    longevity: '10 - 12 Hours',
    volume: '100ml',
    concentration: 'Eau de Parfum (EDP), 100ml',
    notesTop: ['Blood Orange', 'Spiced Pepper', 'Cardamom'],
    notesTopDesc: 'A hot, vibrant, and aggressively warm opening',
    notesMiddle: ['Cinnamon', 'Chili', 'Lavender', 'Geranium'],
    notesMiddleDesc: 'A blazing, spicy-floral core that packs a serious punch',
    notesBase: ['Amber', 'Leather', 'Cedarwood', 'Tonka Bean'],
    notesBaseDesc: 'A rich, molten, and intoxicatingly warm finish',
    bestTimeToWear: 'Winter nights, autumn evenings, bonfires, date nights, and cold-weather occasions.',
    notBestTimeToWear: 'Summer heat or hot daytime settings (the heavy spice and warming notes can quickly become cloying in high temperatures).',
    fragranceFamily: 'Spicy Warm Amber Leather'
  },
  {
    id: 'hawas-pink',
    name: 'Hawas Pink (Pour Femme) by Rasasi',
    timeTag: 'DAY',
    tagline: 'Pomegranate, Sambac Jasmine, Iris & Praline',
    description: 'A luscious, sparkling, and sweet-tart fruity opening of Grapefruit, Pomegranate, and Green Apple, blooming into a luxurious, powdery, deeply feminine floral-fruit heart of Jasmine Absolute, Iris, Peach, and Sambac Jasmine, and anchored by a creamy, sweet-gourmand trail with an addictive praline finish.',
    priceUSD: 35,
    priceSSP: 280000,
    originalPriceUSD: 40,
    originalPriceSSP: 320000,
    rating: 4.9,
    reviewsCount: 176,
    image: '/images/hawas_pink.jpg',
    stockCount: 5,
    badge: '💕 MOST LOVED FEMININE SCENT',
    projection: 'Soft & Magnetic Sillage',
    longevity: '7 - 9 Hours',
    volume: '100ml',
    concentration: 'Eau de Parfum (EDP), 100ml',
    notesTop: ['Grapefruit', 'Pomegranate', 'Green Apple'],
    notesTopDesc: 'A luscious, sparkling, and sweet-tart fruity opening',
    notesMiddle: ['Jasmine Absolute', 'Iris', 'Peach', 'Sambac Jasmine'],
    notesMiddleDesc: 'A luxurious, powdery, and deeply feminine floral-fruit heart',
    notesBase: ['Praline', 'Patchouli', 'Vetiver', 'White Musk'],
    notesBaseDesc: 'A creamy, sweet-gourmand trail with an addictive praline finish',
    bestTimeToWear: 'Daytime brunches, romantic dates, spring/summer social gatherings, and everyday signature wear.',
    notBestTimeToWear: 'Heavy physical workouts or rugged outdoor labor (the rich praline-floral sweetness is designed for elegance and magnetic projection).',
    fragranceFamily: 'Fruity Floral Gourmand'
  }
];

export const RECOMMENDED_BUNDLES: RecommendedBundle[] = [
  {
    id: 'bundle-night-duo',
    name: 'The Night Duo (Black + Fire)',
    badge: 'SAVE $10 (-$5 OFF EACH BOTTLE)',
    description: 'The ultimate evening combination for grand occasions, dinner dates, and night events in Juba. Includes 1x Hawas Black + 1x Hawas Fire.',
    productIds: ['hawas-black', 'hawas-fire'],
    priceUSD: 60,
    originalPriceUSD: 70,
    savingsUSD: 10,
    isPopular: true
  },
  {
    id: 'bundle-day-night',
    name: 'Sunrise to Sundown (For Him + Ice)',
    badge: 'BEST HEAT & EVERYDAY PAIRING',
    description: 'Wear Hawas Ice for extreme daytime heat, then switch to the original Hawas for Him for versatile evening wear. Includes 1x Hawas Ice + 1x Hawas for Him.',
    productIds: ['hawas-ice', 'hawas-for-him'],
    priceUSD: 60,
    originalPriceUSD: 70,
    savingsUSD: 10,
    isPopular: true
  },
  {
    id: 'bundle-his-hers',
    name: 'His & Hers Couple Set (For Him + Pink)',
    badge: 'PERFECT GIFT SET',
    description: 'The romantic duo for couples in Juba. 1x Hawas for Him + 1x Hawas Pink for her.',
    productIds: ['hawas-for-him', 'hawas-pink'],
    priceUSD: 60,
    originalPriceUSD: 70,
    savingsUSD: 10
  },
  {
    id: 'bundle-full-collection',
    name: 'The Full Hawas Collection (All 5 Bottles)',
    badge: 'MAX SAVINGS - SAVE $25!',
    description: 'Own the complete Rasasi Hawas Collection! Hawas for Him, Hawas Ice, Hawas Black, Hawas Fire, and Hawas Pink. Total 5x 100ml bottles.',
    productIds: ['hawas-for-him', 'hawas-ice', 'hawas-black', 'hawas-fire', 'hawas-pink'],
    priceUSD: 150,
    originalPriceUSD: 175,
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
    quote: 'Hawas for Him smells unbelievable! Delivery to Munuki was under 3 hours on the exact same day. The ambergris trail in Juba heat is beast mode!',
    favoritePerfume: 'Hawas for Him by Rasasi',
    date: '2 days ago'
  },
  {
    id: 'rev-2',
    name: 'Deng A.',
    location: 'Tongping, Juba',
    rating: 5,
    quote: 'I ordered the Night Duo bundle (Hawas Black + Hawas Fire) and automatically got $10 off. Original Rasasi bottles, super luxurious!',
    favoritePerfume: 'Hawas Black & Fire Duo',
    date: '3 days ago'
  },
  {
    id: 'rev-3',
    name: 'Nyandeng K.',
    location: 'Hai Cinema, Juba',
    rating: 5,
    quote: 'Hawas Pink is my signature fragrance now! Sweet, elegant, and I get so many compliments at my office in Hai Cinema.',
    favoritePerfume: 'Hawas Pink (Pour Femme)',
    date: '1 week ago'
  },
  {
    id: 'rev-4',
    name: 'James L.',
    location: 'Custom Market Area, Juba',
    rating: 5,
    quote: 'Hawas Ice is extremely refreshing for the Juba heat. Delivery driver brought it straight to my store. Cash on delivery is so convenient.',
    favoritePerfume: 'Hawas Ice by Rasasi',
    date: '5 days ago'
  },
  {
    id: 'rev-5',
    name: 'Grace I.',
    location: 'Gudele 1, Juba',
    rating: 5,
    quote: 'Fast same-day delivery to Gudele! 100% original perfume from Rasasi. The bundle discount saved me money when I bought for my brother too.',
    favoritePerfume: 'Hawas Black by Rasasi',
    date: '1 week ago'
  },
  {
    id: 'rev-6',
    name: 'Emmanuel W.',
    location: 'Thongpiny, Juba',
    rating: 5,
    quote: 'Hawas Fire is a compliment magnet on cold Juba evenings. Best $35 spent in Juba. Juba Fashion Hub is the real deal for genuine designer perfumes!',
    favoritePerfume: 'Hawas Fire by Rasasi',
    date: '2 weeks ago'
  }
];

export const INITIAL_KNOWLEDGE_BASE: KnowledgeBase = {
  storeName: 'Juba Fashion Hub',
  tagline: 'Premier Luxury Perfume Store in Juba, South Sudan',
  location: 'Online Store based in Juba, South Sudan (Direct Supplier Warehouses)',
  contactPhone: '+211 911 267 703',
  contactWhatsApp: '+211 911 267 703',
  aboutStore: 'Juba Fashion Hub is Juba\'s official destination for 100% authentic designer fragrances, featuring the legendary Rasasi Hawas Collection. We offer guaranteed same-day delivery across Juba and automatic bundle savings (-$5 off every bottle when you buy 2 or more!).',
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
