// Adds 3 new collections and their products to Firestore:
//   - Nivea Deodorant Spray (/collections/nivea-spray)   6 products, $7 each, bundle-all-6 $35
//   - Nivea Body Lotion      (/collections/nivea-lotion)  4 products, $13 each
//   - Pantene Pro-V Shampoo  (/collections/pantene)       6 products, $8 each
//
// Safe to re-run — upserts by id.
//
//   npx tsx scripts/seed-new-collections-3.ts
//
import '../loadEnv.js';
import { db, doc, setDoc } from '../src/lib/firebase.js';

const SSP_RATE = 8000;

// ─── Helper ──────────────────────────────────────────────────────────────────

function product(
  id: string,
  collectionSlug: string,
  name: string,
  tagline: string,
  description: string,
  priceUSD: number,
  image: string,
  extra: Record<string, unknown> = {},
  sortOrder = 0,
) {
  return {
    id,
    collectionSlug,
    name,
    timeTag: '',
    tagline,
    description,
    priceUSD,
    priceSSP: priceUSD * SSP_RATE,
    originalPriceUSD: priceUSD,
    originalPriceSSP: priceUSD * SSP_RATE,
    rating: 4.7,
    reviewsCount: 0,
    image,
    stockCount: 20,
    isBestSeller: false,
    badge: '',
    projection: '',
    longevity: '',
    volume: '',
    concentration: '',
    bestTimeToWear: '',
    notBestTimeToWear: '',
    notesTop: [],
    notesMiddle: [],
    notesBase: [],
    fragranceFamily: '',
    sortOrder,
    isActive: true,
    updatedAt: new Date().toISOString(),
    ...extra,
  };
}

// ─── Delivery steps (shared) ──────────────────────────────────────────────────

const DELIVERY_STEP_2 = {
  title: '2. Juba Address & Readiness',
  desc: 'Provide your phone number & address in Juba. Please only order if you are ready to receive your delivery TODAY!',
};
const DELIVERY_STEP_3 = {
  title: '3. Free 120-Min Delivery & Pay',
  desc: 'Delivered FREE across Juba in under 120 minutes! Pay cash (USD/SSP) on delivery, or bank transfer (50% advance deposit for SSP transfers).',
};

// ─── COLLECTION 1: Nivea Deodorant Spray ─────────────────────────────────────

const NIVEA_SPRAY_COLLECTION = {
  id: 'nivea-spray',
  routeSlug: 'nivea-spray',
  label: 'Nivea Deodorant Spray',
  category: 'personal-care',
  unitNounSingular: 'can',
  unitNounPlural: 'cans',
  detailsLabel: 'Details',
  navCategoryLabel: 'Nivea Deodorant Spray',
  heroCategory: 'NIVEA DEODORANT SPRAY COLLECTION',
  heroTitleMain: 'Nivea Deodorant Spray,',
  heroTitleAccent: '48-hour freshness protection.',
  heroDescription:
    'Stay fresh all day with Nivea Deodorant Spray — 48-hour freshness, alcohol-free options, and skin-caring formulas. 100% original imported sprays delivered fast across Juba.',
  heroCtaLabel: 'Shop Nivea Spray',
  heroFinderCtaLabel: 'Find My Spray',
  catalogTag: 'FRESHNESS PROTECTION CATALOG',
  catalogTitle: 'Stay Fresh in Juba Heat',
  catalogDescription:
    'Handpicked best-selling Nivea deodorant sprays in Juba. 48-hour freshness, gentle on skin, and guaranteed 100% original import.',
  catalogAllLabel: 'All Sprays',
  bundleTitle: 'Stock Up & Save — Bundle All 6 for $35',
  bundleMaxSavingsUSD: 7,
  bundleUnitLabel: 'CANS',
  bundleAllSixDealUSD: 35,
  deliverySteps: [
    {
      title: '1. Select Your Deodorant Spray',
      desc: 'Choose from 6 Nivea spray variants. Bundle all 6 cans together for only $35 — saving $7!',
    },
    DELIVERY_STEP_2,
    DELIVERY_STEP_3,
  ],
  quizTitle: 'Find Your Freshness Match',
  quizSubtitle: 'SPRAY FINDER QUIZ',
  quizDescription: 'Answer 2 quick questions to discover your ideal Nivea spray in Juba.',
  quizQ1: {
    text: 'What is your main freshness concern in Juba heat?',
    options: [
      { value: 'sensitive', emoji: '🌿', label: 'Sensitive or Irritated Skin', description: 'Needs a gentle, skin-caring formula.' },
      { value: 'sweat', emoji: '💧', label: 'Heavy Sweating & Odour Control', description: 'Needs maximum protection all day.' },
      { value: 'fresh', emoji: '✨', label: 'Just Daily Freshness & Clean Scent', description: 'Light, everyday protection.' },
    ],
  },
  quizQ2: {
    text: 'Do you prefer a scented or neutral deodorant?',
    options: [
      { value: 'classic_scent', emoji: '', label: 'Classic Fresh Scent', description: 'Clean, familiar Nivea freshness.' },
      { value: 'masculine_scent', emoji: '', label: 'Masculine Bold Scent', description: 'Confident, bold protection for men.' },
      { value: 'feminine_scent', emoji: '', label: 'Feminine Fresh Scent', description: 'Soft, light freshness for women.' },
      { value: 'neutral', emoji: '', label: 'Neutral / Subtle Scent', description: 'Understated protection for any skin.' },
    ],
  },
  quizResultMap: {
    sensitive: 'nivea-spray-protect-care',
    sweat: 'nivea-spray-black-white',
    fresh: 'nivea-spray-dry-comfort',
  },
  quizDefaultProductId: 'nivea-spray-dry-comfort',
  isActive: true,
  sortOrder: 4,
};

const NIVEA_SPRAY_PRODUCTS = [
  product(
    'nivea-spray-dry-comfort',
    'nivea-spray',
    'Nivea Dry Comfort',
    '48H protection, no white marks.',
    'Nivea Dry Comfort Deodorant Spray provides reliable 48-hour freshness protection. The unique formula helps prevent white marks on clothing while keeping you fresh and confident all day long in Juba.',
    7,
    '/images/nivea_spray_dry_comfort.png',
    { isBestSeller: true, badge: 'BEST SELLER', volume: '150ml' },
    0,
  ),
  product(
    'nivea-spray-black-white',
    'nivea-spray',
    'Nivea Black & White',
    'No stains on black or white clothes.',
    'Nivea Black & White Invisible Deodorant Spray is specially formulated to prevent yellow stains on white clothes and white marks on dark clothes. 48-hour freshness for maximum confidence in Juba.',
    7,
    '/images/nivea_spray_black_white.png',
    { badge: 'NO STAINS', volume: '150ml' },
    1,
  ),
  product(
    'nivea-spray-protect-care',
    'nivea-spray',
    'Nivea Protect & Care',
    'Sensitive formula, moisturising care.',
    'Nivea Protect & Care Deodorant Spray delivers 48-hour protection with a caring formula enriched with moisturising ingredients. Ideal for sensitive skin types in Juba heat.',
    7,
    '/images/nivea_spray_protect_care.png',
    { badge: 'SENSITIVE', volume: '150ml' },
    2,
  ),
  product(
    'nivea-spray-fresh',
    'nivea-spray',
    'Nivea Fresh Natural',
    'Natural freshness, 24H protection.',
    'Nivea Fresh Natural Deodorant Spray contains a natural extract formula that provides reliable 24-hour freshness. A light, clean scent that pairs perfectly with Juba daily life.',
    7,
    '/images/nivea_spray_fresh.svg',
    { volume: '150ml' },
    3,
  ),
  product(
    'nivea-spray-men-sensitive',
    'nivea-spray',
    'Nivea Men Sensitive',
    'For sensitive men\'s skin, 48H fresh.',
    'Nivea Men Sensitive Deodorant Spray is specially developed for sensitive skin. The alcohol-free formula provides reliable 48-hour freshness without irritation, keeping men fresh and confident in Juba.',
    7,
    '/images/nivea_spray_men_sensitive.svg',
    { badge: 'FOR MEN', volume: '150ml' },
    4,
  ),
  product(
    'nivea-spray-women-fresh-power',
    'nivea-spray',
    'Nivea Women Fresh Power',
    'Powerful freshness with floral scent.',
    'Nivea Women Fresh Power Deodorant Spray offers 48-hour powerful freshness protection with a fresh floral scent. Designed for the active woman in Juba who demands reliable, all-day protection.',
    7,
    '/images/nivea_spray_women_fresh_power.svg',
    { badge: 'FOR WOMEN', volume: '150ml' },
    5,
  ),
];

// ─── COLLECTION 2: Nivea Body Lotion ─────────────────────────────────────────

const NIVEA_LOTION_COLLECTION = {
  id: 'nivea-lotion',
  routeSlug: 'nivea-lotion',
  label: 'Nivea Body Lotion',
  category: 'skincare',
  unitNounSingular: 'bottle',
  unitNounPlural: 'bottles',
  detailsLabel: 'Details',
  navCategoryLabel: 'Nivea Body Lotion',
  heroCategory: 'NIVEA BODY LOTION COLLECTION',
  heroTitleMain: 'Nivea Body Lotion,',
  heroTitleAccent: 'deep moisturising care.',
  heroDescription:
    'Nourish your skin with Nivea Body Lotion — fast-absorbing formulas enriched with Aloe Vera, Cocoa Butter, and express hydration technology. 100% original delivered fast across Juba.',
  heroCtaLabel: 'Shop Nivea Lotion',
  heroFinderCtaLabel: 'Find My Lotion',
  catalogTag: 'MOISTURISING CARE CATALOG',
  catalogTitle: 'Deeply Nourished Skin in Juba',
  catalogDescription:
    'Handpicked best-selling Nivea body lotions in Juba. Fast-absorbing, deeply moisturising, and guaranteed 100% original import.',
  catalogAllLabel: 'All Lotions',
  bundleTitle: 'Special Skincare Bundle Deals',
  bundleMaxSavingsUSD: 20,
  bundleUnitLabel: 'BOTTLES',
  deliverySteps: [
    {
      title: '1. Select Your Body Lotion',
      desc: 'Choose from Aloe Hydration, Express Hydration, Soft Milk, or Cocoa Butter. Bundle 2+ bottles for -$5 off every bottle!',
    },
    DELIVERY_STEP_2,
    DELIVERY_STEP_3,
  ],
  quizTitle: 'Find Your Perfect Nivea Lotion',
  quizSubtitle: 'SKIN CARE QUIZ',
  quizDescription: 'Answer 2 quick questions to discover your ideal Nivea body lotion in Juba.',
  quizQ1: {
    text: 'What does your skin need most after bathing in Juba heat?',
    options: [
      { value: 'quick', emoji: '⚡', label: 'Quick Absorption, No Greasy Feel', description: 'Hydrates instantly and sinks in fast.' },
      { value: 'deep', emoji: '💧', label: 'Deep Long-Lasting Moisture', description: 'Rich formula for very dry or rough skin.' },
      { value: 'soothing', emoji: '🌿', label: 'Soothing & Light Freshness', description: 'Gentle, calming care for everyday use.' },
    ],
  },
  quizQ2: {
    text: 'Which ingredient benefit appeals most to you?',
    options: [
      { value: 'aloe', emoji: '', label: 'Aloe Vera & Refreshing Hydration', description: 'Soothing, cooling moisture for everyday skin.' },
      { value: 'express', emoji: '', label: 'Express Hydration Technology', description: 'Absorbs in seconds — no waiting around.' },
      { value: 'milk', emoji: '', label: 'Soft Milk & Long-Lasting Softness', description: 'Leaves skin silky-smooth and nourished.' },
      { value: 'cocoa', emoji: '', label: 'Cocoa Butter & Intensive Care', description: 'Rich, deep nourishment for very dry skin.' },
    ],
  },
  quizResultMap: {
    aloe: 'nivea-lotion-aloe-hydration',
    express: 'nivea-lotion-express-hydration',
    milk: 'nivea-lotion-soft-milk',
    cocoa: 'nivea-lotion-cocoa-butter',
  },
  quizDefaultProductId: 'nivea-lotion-aloe-hydration',
  isActive: true,
  sortOrder: 5,
};

const NIVEA_LOTION_PRODUCTS = [
  product(
    'nivea-lotion-aloe-hydration',
    'nivea-lotion',
    'Nivea Aloe Hydration',
    'Soothing Aloe Vera, 48H moisture.',
    'Nivea Aloe Hydration Body Lotion is enriched with Aloe Vera extract for soothing, refreshing hydration. The lightweight formula absorbs quickly and provides up to 48 hours of moisture — perfect for Juba heat.',
    13,
    '/images/nivea_lotion_aloe_hydration.png',
    { isBestSeller: true, badge: 'BEST SELLER', volume: '400ml' },
    0,
  ),
  product(
    'nivea-lotion-express-hydration',
    'nivea-lotion',
    'Nivea Express Hydration',
    'Absorbs in seconds, 48H moisture.',
    'Nivea Express Hydration Body Lotion features an innovative formula that absorbs in just a few seconds with no greasy residue. Long-lasting 48-hour moisture for the active lifestyle in Juba.',
    13,
    '/images/nivea_lotion_express_hydration.png',
    { badge: 'FAST ABSORBING', volume: '400ml' },
    1,
  ),
  product(
    'nivea-lotion-soft-milk',
    'nivea-lotion',
    'Nivea Soft Milk',
    'Rich milk proteins, silky-smooth skin.',
    'Nivea Soft Milk Body Lotion is enriched with milk protein and vitamin E for a rich, nourishing formula that leaves skin irresistibly soft and smooth. Deep moisturisation that lasts all day in Juba.',
    13,
    '/images/nivea_lotion_soft_milk.svg',
    { volume: '400ml' },
    2,
  ),
  product(
    'nivea-lotion-cocoa-butter',
    'nivea-lotion',
    'Nivea Cocoa Butter',
    'Intensive care for very dry skin.',
    'Nivea Cocoa Butter Body Lotion delivers intense moisturisation for very dry skin. Enriched with pure cocoa butter, it deeply nourishes and leaves skin feeling soft and comfortable even in Juba\'s dry heat.',
    13,
    '/images/nivea_lotion_cocoa_butter.svg',
    { badge: 'INTENSIVE CARE', volume: '400ml' },
    3,
  ),
];

// ─── COLLECTION 3: Pantene Pro-V Shampoo ─────────────────────────────────────

const PANTENE_COLLECTION = {
  id: 'pantene',
  routeSlug: 'pantene',
  label: 'Pantene Pro-V Shampoo',
  category: 'hair-care',
  unitNounSingular: 'bottle',
  unitNounPlural: 'bottles',
  detailsLabel: 'Details',
  navCategoryLabel: 'Pantene Pro-V Shampoo',
  heroCategory: 'PANTENE PRO-V SHAMPOO COLLECTION',
  heroTitleMain: 'Pantene Pro-V Shampoo,',
  heroTitleAccent: 'visibly stronger hair.',
  heroDescription:
    'Transform your hair with Pantene Pro-V Shampoo — the Pro-Vitamin formula fights breakage, dandruff, and damage for visibly stronger, healthier hair. 100% original delivered fast across Juba.',
  heroCtaLabel: 'Shop Pantene',
  heroFinderCtaLabel: 'Find My Shampoo',
  catalogTag: 'HAIR CARE CATALOG',
  catalogTitle: 'Stronger Hair in Juba',
  catalogDescription:
    'Handpicked best-selling Pantene Pro-V shampoos in Juba. Pro-Vitamin formula, salon-quality results, and guaranteed 100% original import.',
  catalogAllLabel: 'All Shampoos',
  bundleTitle: 'Special Hair Care Bundle Deals',
  bundleMaxSavingsUSD: 20,
  bundleUnitLabel: 'BOTTLES',
  deliverySteps: [
    {
      title: '1. Select Your Pantene Shampoo',
      desc: 'Choose from 6 Pro-V variants targeting dandruff, breakage, smoothness, volume, and more. Bundle 2+ bottles for -$5 off every bottle!',
    },
    DELIVERY_STEP_2,
    DELIVERY_STEP_3,
  ],
  quizTitle: 'Find Your Perfect Pantene Match',
  quizSubtitle: 'HAIR CARE QUIZ',
  quizDescription: 'Answer 2 quick questions to discover your ideal Pantene shampoo in Juba.',
  quizQ1: {
    text: 'What is your biggest hair concern in Juba?',
    options: [
      { value: 'dandruff', emoji: '❄️', label: 'Dandruff & Itchy Scalp', description: 'Needs anti-dandruff action and scalp relief.' },
      { value: 'damage', emoji: '💪', label: 'Breakage, Damage & Weak Hair', description: 'Needs strength and repair from root to tip.' },
      { value: 'frizz', emoji: '✨', label: 'Frizz, Dryness & Lack of Shine', description: 'Needs smoothing and moisturising care.' },
    ],
  },
  quizQ2: {
    text: 'What result matters most to you after washing?',
    options: [
      { value: 'anti_dandruff', emoji: '', label: 'Clean Scalp, Flake-Free', description: 'Clinically proven dandruff control.' },
      { value: 'repair', emoji: '', label: 'Stronger Hair, Less Breakage', description: 'Pantene\'s Pro-V repair complex.' },
      { value: 'smooth', emoji: '', label: 'Silky Smooth & Frizz-Free', description: 'Up to 3x smoother hair instantly.' },
      { value: 'volume', emoji: '', label: 'Lifted, Full, & Bouncy Volume', description: 'Fine hair that looks thick and full.' },
    ],
  },
  quizResultMap: {
    anti_dandruff: 'pantene-anti-dandruff',
    repair: 'pantene-repair-protect',
    smooth: 'pantene-smooth-sleek',
    volume: 'pantene-volume-fullness',
  },
  quizDefaultProductId: 'pantene-anti-dandruff',
  isActive: true,
  sortOrder: 6,
};

const PANTENE_PRODUCTS = [
  product(
    'pantene-anti-dandruff',
    'pantene',
    'Pantene Anti-Dandruff',
    'Clinically proven dandruff control.',
    'Pantene Pro-V Anti-Dandruff Shampoo uses a clinically proven formula to fight dandruff and relieve itchy scalp. The Pro-Vitamin complex nourishes hair from roots to tips while keeping the scalp clean and flake-free in Juba.',
    8,
    '/images/pantene_anti_dandruff.jpg',
    { isBestSeller: true, badge: 'BEST SELLER', volume: '400ml' },
    0,
  ),
  product(
    'pantene-classic-clean',
    'pantene',
    'Pantene Classic Clean',
    'Daily cleanse, Pro-V shine boost.',
    'Pantene Classic Clean Shampoo delivers a thorough daily cleanse with the iconic Pro-Vitamin formula that leaves hair visibly cleaner, shinier, and stronger. The everyday go-to for beautiful hair in Juba.',
    8,
    '/images/pantene_classic_clean.svg',
    { volume: '400ml' },
    1,
  ),
  product(
    'pantene-moisture-renewal',
    'pantene',
    'Pantene Moisture Renewal',
    'Deep hydration for dry, dull hair.',
    'Pantene Moisture Renewal Shampoo delivers deep hydration to dry, dull hair. The Pro-V moisture complex penetrates each strand to restore softness and natural shine — essential for hair in Juba\'s dry climate.',
    8,
    '/images/pantene_moisture_renewal.svg',
    { badge: 'HYDRATING', volume: '400ml' },
    2,
  ),
  product(
    'pantene-smooth-sleek',
    'pantene',
    'Pantene Smooth & Sleek',
    'Up to 3x smoother, frizz-free hair.',
    'Pantene Smooth & Sleek Shampoo tames frizz and leaves hair up to 3x smoother with the Pro-V smoothing complex. Perfect for humid Juba weather — get silky, sleek hair that lasts all day.',
    8,
    '/images/pantene_smooth_sleek.svg',
    { badge: 'ANTI-FRIZZ', volume: '400ml' },
    3,
  ),
  product(
    'pantene-volume-fullness',
    'pantene',
    'Pantene Volume & Fullness',
    'Lifted, bouncy, full-looking hair.',
    'Pantene Volume & Fullness Shampoo is designed for fine, flat hair needing a lift. The Pro-V lightweight formula adds body and fullness without weighing hair down — giving Juba\'s fine-haired customers visibly thicker-looking hair.',
    8,
    '/images/pantene_volume_fullness.svg',
    { volume: '400ml' },
    4,
  ),
  product(
    'pantene-repair-protect',
    'pantene',
    'Pantene Repair & Protect',
    'Strengthens damaged hair from within.',
    'Pantene Repair & Protect Shampoo targets damaged, brittle hair with the Pro-V repair complex. It reduces breakage and split ends, rebuilding hair strength from the inside out — ideal for over-processed or heat-damaged hair in Juba.',
    8,
    '/images/pantene_repair_protect.svg',
    { badge: 'REPAIR', volume: '400ml' },
    5,
  ),
];

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function main() {
  // Seed collection configs
  const collections = [NIVEA_SPRAY_COLLECTION, NIVEA_LOTION_COLLECTION, PANTENE_COLLECTION];
  for (const c of collections) {
    await setDoc(doc(db, 'collections', c.id), { ...c, updatedAt: new Date().toISOString() });
    console.log(`✓ collection: ${c.id} — ${c.label}`);
  }

  // Seed products
  const allProducts = [...NIVEA_SPRAY_PRODUCTS, ...NIVEA_LOTION_PRODUCTS, ...PANTENE_PRODUCTS];
  for (const p of allProducts) {
    await setDoc(doc(db, 'products', p.id), p);
    console.log(`  ✓ product: ${p.id} — ${p.name} ($${p.priceUSD})`);
  }

  console.log(`\n✅ Seeded ${collections.length} collections and ${allProducts.length} products into Firestore.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
