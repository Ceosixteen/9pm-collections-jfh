import '../loadEnv.js';
import { deleteField } from 'firebase/firestore';
import { db, collection, doc, getDocs, setDoc } from '../src/lib/firebase.js';
import { uploadImageToStorage } from '../api/_lib/firebaseAdmin.js';

type Product = { id: string; name: string; collectionSlug: string; image?: string; imageSourceUrl?: string; imageUpdatedAt?: string };

const CARE_PAGES: Record<string, string> = {
  'nivea-dark-spot-facewash': 'https://www.nivea.in/products/nivea-men-dark-spot-reduction-face-wash-40058082314230213.html',
  'nivea-deep-impact-facewash': 'https://www.nivea.in/products/nivea-men-deep-impact-face-wash-40059005182170213.html',
  'nivea-all-in-1-facewash': 'https://www.nivea.in/products/nivea-men-all-in-one-face-wash-40058089196040213.html',
  'nivea-energy-24hr-shower-gel': 'https://www.nivea-me.com/en-me/products/nivea-men-energy-shower-gel-250-ml-40058081350590214.html',
  'nivea-cool-kick-shower-gel': 'https://www.nivea.in/products/nivea-men-cool-kick-shower-gel-89042560006280213.html',
  'nivea-sensitive-shower-gel': 'https://www.nivea.co.uk/products/nivea-men-sensitive-shower-gel-250ml-40058081305730045.html',
  'nivea-boost-shower-gel': 'https://www.nivea.co.uk/products/nivea-men-fresh-boost-shower-gel-250ml-40059008316750045.html',
  'nivea-pure-impact-shower-gel': 'https://www.nivea.in/products/nivea-men-pure-impact-shower-gel-89042560008330213.html',
  'nivea-active-clean-shower-gel': 'https://www.nivea.in/products/active-clean-shower-gel-89042560011680213.html',
  'nivea-power-24hr-shower-gel': 'https://www.nivea-me.com/en-me/products/nivea-men-power-fresh-shower-gel-250-ml-40059004200910214.html',
  'dove-original-beauty-bar': 'https://www.dove.com/mx/p/dove-barra-de-belleza-original.html/00067238891190',
  'dove-pink-beauty-cream-bar': 'https://www.dove.com/ph/p/pink-beauty-bar.html/08717163616468',
  'dove-serum-bar': 'https://www.dove.com/br/p/sabonete-serum-barra-intense-hydration.html/07891150103665',
  'hs-silk-smooth': 'https://www.myaster.sa/en/online-pharmacy/p/head-shoulders-smooth-silky-anti-dandruff-shampoo-190ml/1618',
  'hs-total-care': 'https://www.myaster.sa/en/online-pharmacy/p/head-shoulders-total-care-shampoo-190ml/1637',
  'men-asad-black': 'https://www.lattafaindia.com/products/asad-black',
  'men-fakhar-black': 'https://www.lattafa-usa.com/products/fakhar-men',
  'men-liam-lattafa': 'https://lattafapakistan.com/products/liam-for-men-women-100ml-perfume',
  'sig-yara-pink': 'https://www.walmart.com/ip/Lattafa-Yara-for-Women-Eau-De-Parfum-Spray-3-40-Ounce-100-Ml-Pink-100ML/11872605527',
  'sig-mayar-blue': 'https://www.lattafa-usa.com/products/mayar-natural-intense',
};

const DIRECT_IMAGES: Record<string, { image: string; page: string }> = {
  'sig-yara-pink': {
    image: 'https://i5.walmartimages.com/seo/Lattafa-Yara-for-Women-Eau-De-Parfum-Spray-3-40-Ounce-100-Ml-Pink-100ML_7b5e252a-a5fe-4d36-86bc-8a678eb1b999.3537222d9164b0d069b846f45efd13af.jpeg',
    page: 'https://www.walmart.com/ip/Lattafa-Yara-for-Women-Eau-De-Parfum-Spray-3-40-Ounce-100-Ml-Pink-100ML/11872605527',
  },
  'hs-extra-volume': {
    image: 'https://pinoyhyper.com/cdn/shop/products/head-and-shoulders-extra-volume-anti-dandruff-shampoo-190ml-pinoyhyper-1.jpg?crop=center&height=1500&v=1738866290&width=1500',
    page: 'https://pinoyhyper.com/products/head-shoulders-extra-volume-anti-dandruff-shampoo-190ml',
  },
  'hs-daily-clean': {
    image: 'https://cdn.mafrservices.com/pim-content/UAE/media/product/2268790/1765617003/2268790_main.jpg',
    page: 'https://www.carrefouruae.com/mafuae/en/shampoos/hns-sh-cc-190ml/p/2268790',
  },
};

const TARGET_COLLECTIONS = new Set([
  'nivea-face-wash', 'nivea-shower-gel', 'dove-soap', 'head-shoulders',
  'khamrah', 'signature-men', 'signature-women',
]);

const REUSE_PRODUCT_IDS: Record<string, string> = {
  'men-oud-black': 'oud-black',
  'men-oud-sublime': 'oud-sublime',
  'sig-oud-amethyst': 'oud-amethyst',
  'sig-oud-sublime': 'oud-sublime',
  'sig-khamrah-dukhan': 'khamrah-dukhan',
  'sig-khamrah': 'khamrah',
};

const SEARCH_OVERRIDES: Record<string, string> = {
  'men-asad-black': 'Asad',
  'men-mahir-black': 'Maahir Black Edition',
  'men-rave-now-black': 'Rave Now',
  'sig-rave-now-for-her': 'Rave Now women',
  'sig-teriaq-pink': 'Teriaq',
};

const RESET_IDS = new Set(['men-al-ameed', 'men-al-areeq']);

function decodeHtml(value: string) {
  return value.replace(/&amp;/g, '&').replace(/&#038;/g, '&').replace(/&quot;/g, '"');
}

function normalize(value: string) {
  return value.toLowerCase()
    .replace(/lattafa|by lattafa|for oud lovers|eau de parfum|edp|100ml|\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function score(a: string, b: string) {
  const aa = new Set(normalize(a).split(' ').filter(Boolean));
  const bb = new Set(normalize(b).split(' ').filter(Boolean));
  let overlap = 0;
  for (const token of aa) if (bb.has(token)) overlap++;
  return overlap / Math.max(aa.size, bb.size, 1);
}

async function imageFromPage(pageUrl: string) {
  const response = await fetch(pageUrl, { headers: { 'User-Agent': 'Mozilla/5.0 JFH Product Image Sync' } });
  if (!response.ok) throw new Error(`Page HTTP ${response.status}`);
  const html = await response.text();
  const match = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image)["']/i);
  if (!match?.[1]) throw new Error('No social product image found');
  return decodeHtml(match[1]);
}

async function lattafaImage(productName: string, searchOverride?: string) {
  const query = normalize(searchOverride || productName);
  const endpoint = `https://lattafa.com/wp-json/wp/v2/product?search=${encodeURIComponent(query)}&per_page=10&_embed=1`;
  const response = await fetch(endpoint, { headers: { 'User-Agent': 'Mozilla/5.0 JFH Product Image Sync' } });
  if (!response.ok) throw new Error(`Lattafa search HTTP ${response.status}`);
  const candidates: any[] = await response.json();
  const ranked = candidates.map((item) => ({ item, rank: score(searchOverride || productName, item?.title?.rendered || '') }))
    .sort((a, b) => b.rank - a.rank);
  const best = ranked[0];
  if (!best || best.rank < 0.74) throw new Error('No confident official Lattafa match');
  const image = best.item?._embedded?.['wp:featuredmedia']?.[0]?.source_url
    || best.item?.yoast_head_json?.og_image?.[0]?.url;
  if (!image) throw new Error('Official Lattafa page has no product image');
  return { image, page: best.item.link as string, matchedTitle: best.item.title.rendered as string, rank: best.rank };
}

async function uploadRemoteImage(product: Product, imageUrl: string, sourcePage: string, minimumBytes = 10_000) {
  const response = await fetch(imageUrl, { headers: { 'User-Agent': 'Mozilla/5.0 JFH Product Image Sync' } });
  if (!response.ok) throw new Error(`Image HTTP ${response.status}`);
  const contentType = (response.headers.get('content-type') || 'image/jpeg').split(';')[0];
  if (!contentType.startsWith('image/')) throw new Error(`Unexpected content type ${contentType}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < minimumBytes) throw new Error('Image is too small to be a usable product photo');
  if (bytes.length > 12_000_000) throw new Error('Image exceeds 12MB');
  const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
  const storedUrl = await uploadImageToStorage(bytes.toString('base64'), contentType, `${product.id}.${extension}`);
  await setDoc(doc(db, 'products', product.id), {
    image: storedUrl,
    imageSourceUrl: sourcePage,
    imageUpdatedAt: new Date().toISOString(),
  }, { merge: true });
  return storedUrl;
}

async function main() {
  const snapshot = await getDocs(collection(db, 'products'));
  const products = snapshot.docs.map((item) => item.data() as Product);
  const byId = new Map(products.map((product) => [product.id, product]));
  for (const id of RESET_IDS) {
    await setDoc(doc(db, 'products', id), {
      image: '/images/signature_men_placeholder.svg',
      imageUpdatedAt: deleteField(),
      imageSourceUrl: deleteField(),
    }, { merge: true });
    const local = byId.get(id);
    if (local) local.imageUpdatedAt = undefined;
  }
  const targets = products.filter((product) =>
    TARGET_COLLECTIONS.has(product.collectionSlug)
    && !product.imageUpdatedAt
  );
  const successfulByName = new Map<string, { image: string; page: string }>();
  let uploaded = 0;
  const failures: string[] = [];

  async function processProduct(product: Product) {
    try {
      let source: { image: string; page: string } | undefined;
      if (DIRECT_IMAGES[product.id]) source = DIRECT_IMAGES[product.id];
      else if (CARE_PAGES[product.id]) source = { image: await imageFromPage(CARE_PAGES[product.id]), page: CARE_PAGES[product.id] };
      else if (REUSE_PRODUCT_IDS[product.id]) {
        const original = byId.get(REUSE_PRODUCT_IDS[product.id]);
        if (!original?.image || original.image.includes('placeholder')) throw new Error('Original product image is not ready yet');
        source = { image: original.image, page: original.imageSourceUrl || 'https://jubafashionhub.link' };
      }
      else if (['nivea-face-wash', 'nivea-shower-gel', 'dove-soap', 'head-shoulders'].includes(product.collectionSlug)) {
        throw new Error('No exact verified care-product source yet');
      }
      else {
        const duplicate = successfulByName.get(normalize(product.name));
        if (duplicate) source = duplicate;
        else {
          const official = await lattafaImage(product.name, SEARCH_OVERRIDES[product.id]);
          source = { image: official.image, page: official.page };
          console.log(`MATCH ${product.name} -> ${official.matchedTitle} (${official.rank.toFixed(2)})`);
        }
      }
      if (!source) throw new Error('No verified source');
      if (source.image.startsWith('/')) {
        await setDoc(doc(db, 'products', product.id), {
          image: source.image,
          imageSourceUrl: source.page,
          imageUpdatedAt: new Date().toISOString(),
        }, { merge: true });
      } else {
        const minimumBytes = CARE_PAGES[product.id] ? 2_000 : 10_000;
        await uploadRemoteImage(product, source.image, source.page, minimumBytes);
      }
      successfulByName.set(normalize(product.name), source);
      uploaded++;
      console.log(`✓ ${product.id} — ${product.name}`);
    } catch (error: any) {
      const message = `${product.id} — ${product.name}: ${error?.message || error}`;
      failures.push(message);
      console.warn(`✗ ${message}`);
    }
  }

  // Keep enough concurrency to finish a large catalogue promptly without
  // overwhelming manufacturer sites or Firebase Storage.
  for (let index = 0; index < targets.length; index += 6) {
    await Promise.all(targets.slice(index, index + 6).map(processProduct));
  }

  console.log(`\nUploaded ${uploaded}/${targets.length} verified product images.`);
  if (failures.length) {
    console.log('\nNeeds manual review:');
    failures.forEach((failure) => console.log(`- ${failure}`));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
