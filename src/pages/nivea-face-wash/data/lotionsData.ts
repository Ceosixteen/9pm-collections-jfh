import { PerfumeProduct, RecommendedBundle, CurrencyConfig, Review } from '../types';

export const DEFAULT_CURRENCY_CONFIG: CurrencyConfig = {
  rate: 8000, // 1 USD = 8000 SSP
  symbolUSD: '$',
  symbolSSP: 'SSP ',
  lastUpdated: new Date().toISOString(),
};

export const PERFUMES_DATA: PerfumeProduct[] = [
  {
    id: 'nivea-dark-spot-facewash',
    name: 'Nivea Men Dark Spot Reduction Face Wash (100g)',
    timeTag: 'GROOM',
    tagline: 'Whitening & Vitamin-Powered Dark Spot Fade',
    description: 'Powered by whitening and vitamin-rich complexes to target dark spots caused by dirt, oil, and sun exposure. Gently cleanses while helping to visibly brighten and even out skin tone without drying out your face.',
    priceUSD: 15,
    priceSSP: 120000,
    originalPriceUSD: 15,
    originalPriceSSP: 120000,
    rating: 4.7,
    reviewsCount: 85,
    image: '/images/nivea_face_wash_placeholder.svg',
    stockCount: 12,
    isBestSeller: true,
    badge: '⭐ TOP SELLER IN JUBA',
    projection: 'Whitening Gel Face Wash',
    longevity: 'All-day brightness',
    volume: '100g',
    concentration: 'Face Wash, 100g',
    notesTop: ['Whitening Complex', 'Vitamins'],
    notesTopDesc: 'Fades dark spots and brightens tone',
    notesMiddle: ['Dirt & Oil Removal'],
    notesMiddleDesc: 'Gently cleanses without stripping skin',
    notesBase: ['Non-Drying Formula'],
    notesBaseDesc: 'Leaves skin soft, never tight',
    bestTimeToWear: 'Men dealing with uneven skin tone, stubborn dark spots, and dull complexions.',
    notBestTimeToWear: 'If your main concern is deep pore congestion from pollution, try the Deep Impact Face Wash instead.',
    fragranceFamily: 'Brightening & Grooming'
  },
  {
    id: 'nivea-deep-impact-facewash',
    name: 'Nivea Men Deep Impact Face Wash (100g)',
    timeTag: 'GROOM',
    tagline: 'Black Charcoal Deep-Pore Purification',
    description: 'Infused with Black Charcoal, it acts like a magnet to extract deep-seated dirt, pollution, and impurities from your pores. Leaves your skin feeling intensely refreshed, clean, and invigorated.',
    priceUSD: 15,
    priceSSP: 120000,
    originalPriceUSD: 15,
    originalPriceSSP: 120000,
    rating: 4.8,
    reviewsCount: 104,
    image: '/images/nivea_face_wash_placeholder.svg',
    stockCount: 14,
    isBestSeller: true,
    badge: '🔥 JUBA FAVORITE',
    projection: 'Black Charcoal Gel Wash',
    longevity: 'Deep-clean feel all day',
    volume: '100g',
    concentration: 'Face Wash, 100g',
    notesTop: ['Black Charcoal'],
    notesTopDesc: 'Extracts dirt, pollution and impurities',
    notesMiddle: ['Deep Pore Purification'],
    notesMiddleDesc: 'Draws out deep-seated grime like a magnet',
    notesBase: ['Refreshing Formula'],
    notesBaseDesc: 'Leaves skin intensely clean and invigorated',
    bestTimeToWear: 'Active men or those exposed to heavy city pollution and excess sebum build-up.',
    notBestTimeToWear: 'If your main concern is dark spots and dull tone, try the Dark Spot Reduction Face Wash instead.',
    fragranceFamily: 'Charcoal Detox'
  },
  {
    id: 'nivea-all-in-1-facewash',
    name: 'Nivea Men All-In-1 Charcoal Face Wash (100g)',
    timeTag: 'GROOM',
    tagline: 'The Ultimate Multi-Action Daily Defense',
    description: 'The ultimate multi-action powerhouse. Fights pimples, controls oil production for up to 12 hours, clears blackheads, and prevents future breakouts while detoxifying the skin with active charcoal.',
    priceUSD: 15,
    priceSSP: 120000,
    originalPriceUSD: 15,
    originalPriceSSP: 120000,
    rating: 4.6,
    reviewsCount: 62,
    image: '/images/nivea_face_wash_placeholder.svg',
    stockCount: 9,
    isBestSeller: false,
    badge: '💪 DAILY DEFENSE PICK',
    projection: 'Multi-Action Charcoal Wash',
    longevity: 'Oil control up to 12 hrs',
    volume: '100g',
    concentration: 'Face Wash, 100g',
    notesTop: ['Active Charcoal', 'Oil Control'],
    notesTopDesc: 'Fights pimples and controls oil for up to 12 hours',
    notesMiddle: ['Blackhead Clearing'],
    notesMiddleDesc: 'Clears blackheads and prevents future breakouts',
    notesBase: ['Detoxifying Formula'],
    notesBaseDesc: 'Deep daily detox for oily, acne-prone skin',
    bestTimeToWear: 'Oily, acne-prone skin requiring an all-encompassing daily defense wash.',
    notBestTimeToWear: 'If you mainly need dark spot brightening, try the Dark Spot Reduction Face Wash instead.',
    fragranceFamily: 'Multi-Action Defense'
  },
];

export const RECOMMENDED_BUNDLES: RecommendedBundle[] = [
  {
    id: 'bundle-dark-spot-deep-impact',
    name: 'Brighten & Purify Duo (Dark Spot + Deep Impact)',
    badge: 'GLOW + DEEP CLEAN',
    description: 'Total face transformation — brightening dark spots and deep pore purification. Includes 1x Dark Spot Reduction Face Wash + 1x Deep Impact Face Wash.',
    productIds: ['nivea-dark-spot-facewash', 'nivea-deep-impact-facewash'],
    priceUSD: 25,
    originalPriceUSD: 30,
    savingsUSD: 5,
    isPopular: true
  },
  {
    id: 'bundle-deep-impact-all-in-1',
    name: 'Charcoal Defense Duo (Deep Impact + All-In-1)',
    badge: 'DOUBLE CHARCOAL POWER',
    description: 'Maximum daily pore control, morning and night. Includes 1x Deep Impact Face Wash + 1x All-In-1 Charcoal Face Wash.',
    productIds: ['nivea-deep-impact-facewash', 'nivea-all-in-1-facewash'],
    priceUSD: 25,
    originalPriceUSD: 30,
    savingsUSD: 5,
    isPopular: true
  }
];

export const REVIEWS_DATA: Review[] = [
  {
    id: 'rev-1',
    name: 'Emmanuel L.',
    location: 'Munuki, Juba',
    rating: 5,
    quote: 'The Dark Spot Reduction Face Wash cleared up patches on my jawline in just two weeks. My skin tone looks so much more even now. Fast delivery to Munuki too.',
    favoritePerfume: 'Nivea Men Dark Spot Reduction Face Wash',
    date: '3 days ago'
  },
  {
    id: 'rev-2',
    name: 'James K.',
    location: 'Tongping, Juba',
    rating: 5,
    quote: 'I work outdoors all day and my face used to feel clogged by evening. The Deep Impact Charcoal wash pulls out all the grime — genuinely feels squeaky clean after.',
    favoritePerfume: 'Nivea Men Deep Impact Face Wash',
    date: '5 days ago'
  },
  {
    id: 'rev-3',
    name: 'Peter A.',
    location: 'Hai Cinema, Juba',
    rating: 5,
    quote: 'Been breaking out for months and the All-In-1 Charcoal wash finally controlled the oil and pimples. Use it twice a day now, huge difference.',
    favoritePerfume: 'Nivea Men All-In-1 Charcoal Face Wash',
    date: '1 week ago'
  },
  {
    id: 'rev-4',
    name: 'Michael D.',
    location: 'Gudele, Juba',
    rating: 5,
    quote: 'Got the Charcoal Defense Duo and saved $5 automatically. Both washes are original Nivea Men, exactly as ordered. Best grooming find in Juba so far.',
    favoritePerfume: 'Charcoal Defense Duo (Deep Impact + All-In-1)',
    date: '2 weeks ago'
  }
];
