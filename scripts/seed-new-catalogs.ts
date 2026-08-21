import '../loadEnv.js';
import { db, doc, setDoc } from '../src/lib/firebase.js';

import { PERFUMES_DATA as HEAD_SHOULDERS } from '../src/pages/head-shoulders/data/lotionsData.js';
import { PERFUMES_DATA as NIVEA_SHOWER } from '../src/pages/nivea-shower-gel/data/lotionsData.js';
import { PERFUMES_DATA as KHAMRAH } from '../src/pages/khamrah/data/perfumesData.js';
import { PERFUMES_DATA as SIGNATURE_MEN } from '../src/pages/signature-men/data/perfumesData.js';
import { PERFUMES_DATA as NIVEA_FACE } from '../src/pages/nivea-face-wash/data/lotionsData.js';
import { PERFUMES_DATA as DOVE } from '../src/pages/dove-soap/data/lotionsData.js';
import { PERFUMES_DATA as SIGNATURE_WOMEN } from '../src/pages/signature-women/data/perfumesData.js';

const RATE = 8000;
const CATALOGS = [
  { slug: 'nivea-face-wash', label: 'Nivea Men Face Wash Collection', category: 'Face Care', products: NIVEA_FACE },
  { slug: 'dove-soap', label: 'Dove Beauty Bar Collection', category: 'Bath & Body', products: DOVE },
  { slug: 'head-shoulders', label: 'Head & Shoulders Anti-Dandruff Collection', category: 'Hair Care', products: HEAD_SHOULDERS },
  { slug: 'nivea-shower-gel', label: 'Nivea Men Shower Gel Collection', category: 'Men’s Grooming', products: NIVEA_SHOWER },
  { slug: 'khamrah', label: 'Lattafa Khamrah Collection', category: 'Fragrances', products: KHAMRAH },
  { slug: 'signature-women', label: 'Signature Fragrances for Women', category: 'Women’s Fragrances', products: SIGNATURE_WOMEN },
  { slug: 'signature-men', label: 'Signature Fragrances for Men', category: 'Men’s Fragrances', products: SIGNATURE_MEN },
] as const;

async function main() {
  let total = 0;
  for (let c = 0; c < CATALOGS.length; c++) {
    const catalog = CATALOGS[c];
    await setDoc(doc(db, 'collections', catalog.slug), {
      id: catalog.slug,
      routeSlug: catalog.slug,
      label: catalog.label,
      category: catalog.category,
      isActive: true,
      sortOrder: 20 + c,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    for (let i = 0; i < catalog.products.length; i++) {
      const p = catalog.products[i] as any;
      const storedProduct = JSON.parse(JSON.stringify({
        ...p,
        collectionSlug: catalog.slug,
        priceSSP: p.priceSSP ?? p.priceUSD * RATE,
        originalPriceSSP: p.originalPriceSSP ?? p.originalPriceUSD * RATE,
        sortOrder: i,
        isActive: true,
        updatedAt: new Date().toISOString(),
      }));
      await setDoc(doc(db, 'products', p.id), storedProduct, { merge: true });
      total++;
    }
    console.log(`Seeded ${catalog.label}: ${catalog.products.length} products`);
  }
  console.log(`Seeded ${total} new products across ${CATALOGS.length} collections.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
