// One-off migration: captures the exact hero/catalog/bundle/quiz copy that
// currently lives hardcoded in the 4 collection page component trees, and
// writes it into the Firestore `collections` collection — so the dynamic
// /collections/:slug template (built in a later step) can render each of
// them with zero difference from what's live today.
//
// Safe to re-run — upserts by id.
//
//   npx tsx scripts/seed-collections.ts
//
import '../loadEnv.js';
import { db, doc, setDoc } from '../src/lib/firebase.js';

const DELIVERY_STEP_2 = {
  title: '2. Juba Address & Readiness',
  desc: 'Provide your phone number & address in Juba. Please only order if you are ready to receive your delivery TODAY!',
};
const DELIVERY_STEP_3 = {
  title: '3. Free 120-Min Delivery & Pay',
  desc: 'Delivered FREE across Juba in under 120 minutes! Pay cash (USD/SSP) on delivery, or bank transfer (50% advance deposit for SSP transfers).',
};

const SCENT_QUIZ_Q1 = {
  text: 'When do you plan to wear this fragrance most in Juba?',
  options: [
    { value: 'night', emoji: '🌙', label: 'Evenings, Lounge Parties & Dates', description: 'Intense, warm, beast-mode projection for nightlife.' },
    { value: 'day', emoji: '☀️', label: 'Workplace, Daytime Meetings & Daily Wear', description: 'Fresh, aquatic, zesty citrus for Juba heat.' },
    { value: 'feminine', emoji: '💕', label: 'Alluring Feminine Elegant Wear', description: 'Soft florals, white jasmine, and powdery vanilla musk.' },
  ],
};

const COLLECTIONS = [
  {
    id: 'nine-collection',
    routeSlug: '9pm',
    label: 'The 9 Collection',
    category: 'fragrance',
    unitNounSingular: 'bottle',
    unitNounPlural: 'bottles',
    detailsLabel: 'Notes',
    navCategoryLabel: '9PM & 9AM Afnan',
    heroCategory: 'AFNAN 9PM COLLECTION',
    heroTitleMain: 'Afnan 9PM Collection,',
    heroTitleAccent: 'beast-mode projection.',
    heroDescription: 'Experience the legendary Afnan 9PM collection — 9PM Rebel, 9PM Elixir, 9PM Classic, 9AM Dive, and 9PM Pour Femme. 100% original imported fragrances delivered fast across Juba.',
    heroCtaLabel: 'Shop 9PM',
    heroFinderCtaLabel: 'Find My Scent',
    catalogTag: 'VIRAL PERFUME CATALOG',
    catalogTitle: 'Trending Fragrances in Juba',
    catalogDescription: 'Handpicked best-selling perfumes in Juba. Long-lasting performance, beast-mode projection, and guaranteed 100% original import.',
    catalogAllLabel: 'All Fragrances',
    bundleTitle: 'Special Perfume Bundle Deals',
    bundleMaxSavingsUSD: 25,
    bundleUnitLabel: 'BOTTLES',
    deliverySteps: [
      { title: '1. Select Your Fragrance', desc: 'Choose from 9PM Rebel, 9PM Elixir, 9PM Classic, 9AM Dive, or 9PM Pour Femme. Bundle 2+ bottles for automatic -$5 off every bottle!' },
      DELIVERY_STEP_2, DELIVERY_STEP_3,
    ],
    quizTitle: 'Find Your Signature Fragrance',
    quizSubtitle: 'SCENT FINDER QUIZ',
    quizDescription: 'Answer 2 quick questions to discover your ideal scent match in Juba.',
    quizQ1: SCENT_QUIZ_Q1,
    quizQ2: {
      text: 'Which fragrance notes sound most appealing to you?',
      options: [
        { value: 'plum_oud', emoji: '', label: 'Dark Plum, Cinnamon & Smoky Oud', description: 'Mysterious, dark fruity spicy resinous vibe.' },
        { value: 'leather_spice', emoji: '', label: 'Cardamom, Nutmeg & Soft Leather', description: 'Rich, smooth, luxury elixir for gentlemen.' },
        { value: 'sweet_vanilla', emoji: '', label: 'Sweet Green Apple, Cinnamon & Vanilla', description: 'The iconic compliment magnet beast mode.' },
        { value: 'fresh_citrus', emoji: '', label: 'Zesty Lemon, Spearmint & Incense', description: 'Crisp blue aquatic citrus energizer.' },
        { value: 'floral_musk', emoji: '', label: 'White Florals, Jasmine & Powdery Musk', description: 'Elegant feminine softness and grace.' },
      ],
    },
    quizResultMap: { plum_oud: '9pm-rebel', leather_spice: '9pm-elixir', fresh_citrus: '9am-dive', floral_musk: '9pm-pour-femme' },
    quizDefaultProductId: '9pm-normal', // sweet_vanilla + fallback
    isActive: true,
    sortOrder: 0,
  },
  {
    id: 'hawas',
    routeSlug: 'hawas',
    label: 'Rasasi Hawas',
    category: 'fragrance',
    unitNounSingular: 'bottle',
    unitNounPlural: 'bottles',
    detailsLabel: 'Notes',
    navCategoryLabel: 'Rasasi Hawas Collection',
    heroCategory: 'RASASI HAWAS COLLECTION',
    heroTitleMain: 'Rasasi Hawas Collection,',
    heroTitleAccent: 'legendary performance.',
    heroDescription: 'Experience the legendary Rasasi Hawas collection — Hawas for Him, Hawas Ice, Hawas Black, Hawas Fire, and Hawas Pink. 100% original imported fragrances delivered fast across Juba.',
    heroCtaLabel: 'Shop Hawas',
    heroFinderCtaLabel: 'Find My Scent',
    catalogTag: 'VIRAL PERFUME CATALOG',
    catalogTitle: 'Trending Fragrances in Juba',
    catalogDescription: 'Handpicked best-selling perfumes in Juba. Long-lasting performance, beast-mode projection, and guaranteed 100% original import.',
    catalogAllLabel: 'All Fragrances',
    bundleTitle: 'Special Perfume Bundle Deals',
    bundleMaxSavingsUSD: 25,
    bundleUnitLabel: 'BOTTLES',
    deliverySteps: [
      { title: '1. Select Your Fragrance', desc: 'Choose from Hawas for Him, Hawas Ice, Hawas Black, Hawas Fire, or Hawas Pink. Bundle 2+ bottles for automatic -$5 off every bottle!' },
      DELIVERY_STEP_2, DELIVERY_STEP_3,
    ],
    quizTitle: 'Find Your Signature Fragrance',
    quizSubtitle: 'SCENT FINDER QUIZ',
    quizDescription: 'Answer 2 quick questions to discover your ideal scent match in Juba.',
    quizQ1: SCENT_QUIZ_Q1,
    quizQ2: {
      text: 'Which fragrance notes sound most appealing to you?',
      options: [
        { value: 'plum_oud', emoji: '', label: 'Dark Berries, Lavender & Smoky Vetiver', description: 'Mysterious, dark aromatic woody nocturnal vibe.' },
        { value: 'leather_spice', emoji: '', label: 'Blood Orange, Chili & Molten Leather', description: 'Hot, rich, and intoxicatingly warm for gentlemen.' },
        { value: 'sweet_vanilla', emoji: '', label: 'Apple, Cinnamon & Legendary Ambergris', description: 'The iconic Hawas compliment magnet, beast mode.' },
        { value: 'fresh_citrus', emoji: '', label: 'Icy Apple, Mint & Frozen Lemon', description: 'Crisp arctic aquatic citrus energizer.' },
        { value: 'floral_musk', emoji: '', label: 'Sambac Jasmine, Iris & Praline Musk', description: 'Elegant feminine sweetness and grace.' },
      ],
    },
    quizResultMap: { plum_oud: 'hawas-black', leather_spice: 'hawas-fire', fresh_citrus: 'hawas-ice', floral_musk: 'hawas-pink' },
    quizDefaultProductId: 'hawas-for-him',
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'cerave',
    routeSlug: 'cerave',
    label: 'CeraVe Skincare',
    category: 'skincare',
    unitNounSingular: 'item',
    unitNounPlural: 'items',
    detailsLabel: 'Details',
    navCategoryLabel: 'CeraVe Skincare',
    heroCategory: 'CERAVE SKINCARE COLLECTION',
    heroTitleMain: 'CeraVe Skincare Collection,',
    heroTitleAccent: 'dermatologist-developed care.',
    heroDescription: 'Experience the complete CeraVe lineup — cleansers, toner, moisturizers, and resurfacing retinol serum. 100% original, dermatologist-developed skincare delivered fast across Juba.',
    heroCtaLabel: 'Shop CeraVe',
    heroFinderCtaLabel: 'Find My Match',
    catalogTag: 'DERMATOLOGIST-DEVELOPED CATALOG',
    catalogTitle: 'Trending Skincare in Juba',
    catalogDescription: 'Handpicked best-selling CeraVe products in Juba. Ceramide-powered formulas, dermatologist-developed, and guaranteed 100% original import.',
    catalogAllLabel: 'All Products',
    bundleTitle: 'Special Skincare Bundle Deals',
    bundleMaxSavingsUSD: 40,
    bundleUnitLabel: 'PRODUCTS',
    deliverySteps: [
      { title: '1. Select Your Skincare', desc: 'Choose from CeraVe cleansers, toner, moisturizers, or the Resurfacing Retinol Serum. Bundle 2+ products for automatic -$5 off every item!' },
      DELIVERY_STEP_2, DELIVERY_STEP_3,
    ],
    quizTitle: 'Find Your Perfect CeraVe Match',
    quizSubtitle: 'SKIN FINDER QUIZ',
    quizDescription: 'Answer 2 quick questions to discover your ideal skincare match in Juba.',
    quizQ1: {
      text: 'What describes your skin day-to-day in Juba heat?',
      options: [
        { value: 'oily', emoji: '🛢️', label: 'Oily, Shiny & Breakout-Prone', description: 'Needs oil control and help clearing active acne.' },
        { value: 'dry', emoji: '🌵', label: 'Dry, Tight & Sensitive', description: 'Craves deep hydration and barrier repair.' },
        { value: 'texture', emoji: '✨', label: 'Normal, But Uneven Texture or Marks', description: 'Wants smoothing, renewal, and a healthy glow.' },
      ],
    },
    quizQ2: {
      text: 'Which ingredient benefit sounds most like what you need?',
      options: [
        { value: 'acne_oily', emoji: '', label: 'Salicylic Acid & Acne Control', description: 'Clears active breakouts and blackheads fast.' },
        { value: 'texture_pores', emoji: '', label: 'Encapsulated Retinol & Pore Refining', description: 'Resurfaces skin and fades post-acne marks over time.' },
        { value: 'normal_daily', emoji: '', label: 'Niacinamide & Daily Balance', description: 'The all-time favorite for everyday cleansing.' },
        { value: 'dryness_barrier', emoji: '', label: 'Ceramides & Deep Hydration', description: 'Locks in moisture and restores the skin barrier.' },
        { value: 'rough_bumpy', emoji: '', label: 'Salicylic Acid & Gentle Exfoliation', description: 'Smooths rough, bumpy texture without harsh scrubbing.' },
      ],
    },
    quizResultMap: { acne_oily: 'cerave-acne-cleanser', texture_pores: 'cerave-retinol-serum', dryness_barrier: 'cerave-hydrating-cleanser', rough_bumpy: 'cerave-renewing-sa-cleanser' },
    quizDefaultProductId: 'cerave-foaming-cleanser', // normal_daily + fallback
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'badee-al-oud',
    routeSlug: 'badee-al-oud',
    label: "Bade'e Al Oud",
    category: 'fragrance',
    unitNounSingular: 'bottle',
    unitNounPlural: 'bottles',
    detailsLabel: 'Notes',
    navCategoryLabel: "Bade'e Al Oud Collection",
    heroCategory: "BADE'E AL OUD COLLECTION",
    heroTitleMain: "Lattafa Bade'e Al Oud,",
    heroTitleAccent: 'majestic Eastern luxury.',
    heroDescription: "Experience the majestic Lattafa Bade'e Al Oud collection — Black, Amethyst, Sublime, and Noble Blush. 100% original imported fragrances delivered fast across Juba.",
    heroCtaLabel: "Shop Bade'e Al Oud",
    heroFinderCtaLabel: 'Find My Scent',
    catalogTag: 'VIRAL PERFUME CATALOG',
    catalogTitle: 'Trending Fragrances in Juba',
    catalogDescription: 'Handpicked best-selling perfumes in Juba. Long-lasting performance, beast-mode projection, and guaranteed 100% original import.',
    catalogAllLabel: 'All Fragrances',
    bundleTitle: 'Special Perfume Bundle Deals',
    bundleMaxSavingsUSD: 25,
    bundleUnitLabel: 'BOTTLES',
    deliverySteps: [
      { title: '1. Select Your Fragrance', desc: "Choose from Bade'e Al Oud Black, Amethyst, Sublime, Noble Blush, or White. Bundle 2+ bottles for automatic -$5 off every bottle!" },
      DELIVERY_STEP_2, DELIVERY_STEP_3,
    ],
    quizTitle: 'Find Your Signature Fragrance',
    quizSubtitle: 'SCENT FINDER QUIZ',
    quizDescription: 'Answer 2 quick questions to discover your ideal scent match in Juba.',
    quizQ1: SCENT_QUIZ_Q1,
    quizQ2: {
      text: 'Which fragrance notes sound most appealing to you?',
      options: [
        { value: 'saffron_oud', emoji: '', label: 'Saffron, Natural Oud Wood & Deep Musk', description: 'Majestic, warm, and commanding nocturnal vibe.' },
        { value: 'rose_amber', emoji: '', label: 'Turkish Rose, Amber & Agarwood', description: 'Opulent, romantic, and richly floral for evenings.' },
        { value: 'litchi_jasmine', emoji: '', label: 'Litchi, Jasmine & Creamy Patchouli', description: 'Fresh, juicy, and vibrant for daytime wear.' },
        { value: 'rose_milk', emoji: '', label: 'Rose Milk, Almond & Sandalwood', description: 'Soft, sweet, and velvety gourmand elegance.' },
        { value: 'pineapple_creme', emoji: '', label: 'Pineapple, Crème Brûlée & Warm Spice', description: 'Decadent, sweet, and complex for any season.' },
      ],
    },
    quizResultMap: { saffron_oud: 'oud-black', rose_amber: 'oud-amethyst', litchi_jasmine: 'oud-sublime', rose_milk: 'oud-noble-blush', pineapple_creme: 'oud-white' },
    quizDefaultProductId: 'oud-black',
    isActive: true,
    sortOrder: 3,
  },
];

async function main() {
  for (const c of COLLECTIONS) {
    const stored = { ...c, updatedAt: new Date().toISOString() };
    await setDoc(doc(db, 'collections', c.id), stored);
    console.log(`✓ ${c.id} — ${c.label} (/collections/${c.routeSlug})`);
  }
  console.log(`\n✅ Seeded ${COLLECTIONS.length} collections into Firestore.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
