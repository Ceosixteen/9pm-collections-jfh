// One-off migration: copies the products that used to live in the hardcoded
// src/pages/<slug>/data/perfumesData.ts files into the Firestore `products`
// collection, so they can be managed from the admin dashboard.
//
// Safe to re-run — it upserts by product id, so existing docs are overwritten
// rather than duplicated.
//
//   npx tsx scripts/seed-products.ts
//
import '../loadEnv.js';
import { db, doc, setDoc } from '../src/lib/firebase.js';

import { PERFUMES_DATA as NINE } from '../src/pages/nine-collection/data/perfumesData.js';
import { PERFUMES_DATA as HAWAS } from '../src/pages/hawas/data/perfumesData.js';
import { PERFUMES_DATA as CERAVE } from '../src/pages/cerave/data/perfumesData.js';
import { PERFUMES_DATA as OUD } from '../src/pages/badee-al-oud/data/perfumesData.js';

const SSP_RATE = 8000;

const SOURCES: { slug: string; products: readonly any[] }[] = [
  { slug: 'nine-collection', products: NINE },
  { slug: 'hawas', products: HAWAS },
  { slug: 'cerave', products: CERAVE },
  { slug: 'badee-al-oud', products: OUD },
];

async function main() {
  let total = 0;

  for (const { slug, products } of SOURCES) {
    console.log(`\n${slug} — ${products.length} products`);

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const stored = {
        id: p.id,
        collectionSlug: slug,
        name: p.name ?? '',
        timeTag: p.timeTag ?? '',
        tagline: p.tagline ?? '',
        description: p.description ?? '',
        priceUSD: p.priceUSD ?? 0,
        priceSSP: p.priceSSP ?? (p.priceUSD ?? 0) * SSP_RATE,
        originalPriceUSD: p.originalPriceUSD ?? p.priceUSD ?? 0,
        originalPriceSSP: p.originalPriceSSP ?? (p.originalPriceUSD ?? 0) * SSP_RATE,
        rating: p.rating ?? 4.8,
        reviewsCount: p.reviewsCount ?? 0,
        image: p.image ?? '',
        stockCount: p.stockCount ?? 10,
        isBestSeller: Boolean(p.isBestSeller),
        badge: p.badge ?? '',
        projection: p.projection ?? '',
        longevity: p.longevity ?? '',
        volume: p.volume ?? '',
        concentration: p.concentration ?? '',
        bestTimeToWear: p.bestTimeToWear ?? '',
        notBestTimeToWear: p.notBestTimeToWear ?? '',
        notesTop: p.notesTop ?? [],
        notesMiddle: p.notesMiddle ?? [],
        notesBase: p.notesBase ?? [],
        fragranceFamily: p.fragranceFamily ?? '',
        sortOrder: i,
        isActive: true,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'products', stored.id), stored);
      console.log(`  ✓ ${stored.id} — ${stored.name} ($${stored.priceUSD})`);
      total++;
    }
  }

  console.log(`\n✅ Seeded ${total} products into Firestore.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
