// Post-build step: generates a real, unique index.html per route with
// baked-in <title>/meta description/canonical/Open Graph/Twitter Card/JSON-LD
// tags. Social + chat link-unfurlers (Slack, WhatsApp, iMessage, Twitter,
// Facebook, Telegram) and most SEO crawlers do NOT execute JavaScript, so a
// single client-rendered index.html with generic tags is invisible to them.
// Real users still get the full React Router SPA once the JS bundle boots.
//
// Rather than surgically editing the built index.html (fragile — string
// collisions between the base URL and image URLs that start with it), this
// extracts the two build-specific pieces (hashed asset <script>/<link> tags,
// and the <body> markup) from Vite's output and reconstructs a fresh <head>
// around them for each route.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
const SITE_URL = 'https://9pm-collections-jfh.vercel.app';

const PAGES = [
  {
    route: '/',
    outFile: 'index.html',
    title: 'Juba Fashion Hub | Authentic Perfumes & Skincare in Juba, South Sudan',
    description:
      'Shop 100% authentic Afnan 9PM, Rasasi Hawas fragrances and CeraVe skincare in Juba, South Sudan. Free express delivery, pay on delivery, and an AI shopping assistant to help you choose.',
    image: '/images/juba_fashion_hub_logo.jpg',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'OnlineStore',
      name: 'Juba Fashion Hub',
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/images/juba_fashion_hub_logo.jpg`,
      image: `${SITE_URL}/images/juba_fashion_hub_logo.jpg`,
      telephone: '+211911267703',
      priceRange: '$$',
      address: { '@type': 'PostalAddress', addressLocality: 'Juba', addressCountry: 'SS' },
      areaServed: 'Juba, South Sudan',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Collections',
        itemListElement: [
          { '@type': 'OfferCatalog', name: 'The 9 Collection', url: `${SITE_URL}/collections/9pm` },
          { '@type': 'OfferCatalog', name: 'Rasasi Hawas Collection', url: `${SITE_URL}/collections/hawas` },
          { '@type': 'OfferCatalog', name: "Bade'e Al Oud Collection", url: `${SITE_URL}/collections/badee-al-oud` },
          { '@type': 'OfferCatalog', name: 'CeraVe Skincare Collection', url: `${SITE_URL}/collections/cerave` },
        ],
      },
    },
  },
  {
    route: '/collections/9pm',
    outFile: 'collections/9pm/index.html',
    title: 'The 9 Collection by Afnan | Juba Fashion Hub',
    description:
      'Shop the legendary Afnan 9PM Collection — 9PM Rebel, Elixir, Classic, 9AM Dive & Pour Femme. 100% authentic 100ml EDP, free express delivery across Juba.',
    image: '/images/9pm_rebel.jpg',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'The 9 Collection by Afnan',
      url: `${SITE_URL}/collections/9pm`,
      itemListElement: [
        { '@type': 'Product', position: 1, name: '9PM Rebel by Afnan', image: `${SITE_URL}/images/9pm_rebel.jpg`, offers: { '@type': 'Offer', priceCurrency: 'USD', price: '40' } },
        { '@type': 'Product', position: 2, name: '9PM Elixir by Afnan', image: `${SITE_URL}/images/9pm_elixir.jpg`, offers: { '@type': 'Offer', priceCurrency: 'USD', price: '40' } },
        { '@type': 'Product', position: 3, name: '9PM Black (Classic) by Afnan', image: `${SITE_URL}/images/9pm_classic_black.jpg`, offers: { '@type': 'Offer', priceCurrency: 'USD', price: '35' } },
        { '@type': 'Product', position: 4, name: '9AM Dive by Afnan', image: `${SITE_URL}/images/9am_dive.jpg`, offers: { '@type': 'Offer', priceCurrency: 'USD', price: '40' } },
        { '@type': 'Product', position: 5, name: '9PM Pour Femme by Afnan', image: `${SITE_URL}/images/9pm_pour_femme.jpg`, offers: { '@type': 'Offer', priceCurrency: 'USD', price: '35' } },
      ],
    },
  },
  {
    route: '/collections/hawas',
    outFile: 'collections/hawas/index.html',
    title: 'Rasasi Hawas Collection | Juba Fashion Hub',
    description:
      'Shop the Rasasi Hawas Collection — Hawas for Him, Ice, Black, Fire & Pink. 100% authentic 100ml EDP, free express delivery across Juba.',
    image: '/images/hawas_for_him.jpg',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Rasasi Hawas Collection',
      url: `${SITE_URL}/collections/hawas`,
      itemListElement: [
        { '@type': 'Product', position: 1, name: 'Hawas for Him by Rasasi', image: `${SITE_URL}/images/hawas_for_him.jpg`, offers: { '@type': 'Offer', priceCurrency: 'USD', price: '35' } },
        { '@type': 'Product', position: 2, name: 'Hawas Ice by Rasasi', image: `${SITE_URL}/images/hawas_ice.png`, offers: { '@type': 'Offer', priceCurrency: 'USD', price: '35' } },
        { '@type': 'Product', position: 3, name: 'Hawas Black by Rasasi', image: `${SITE_URL}/images/hawas_black.png`, offers: { '@type': 'Offer', priceCurrency: 'USD', price: '35' } },
        { '@type': 'Product', position: 4, name: 'Hawas Fire by Rasasi', image: `${SITE_URL}/images/hawas_fire.jpg`, offers: { '@type': 'Offer', priceCurrency: 'USD', price: '35' } },
        { '@type': 'Product', position: 5, name: 'Hawas Pink by Rasasi', image: `${SITE_URL}/images/hawas_pink.jpg`, offers: { '@type': 'Offer', priceCurrency: 'USD', price: '35' } },
      ],
    },
  },
  {
    route: '/collections/cerave',
    outFile: 'collections/cerave/index.html',
    title: 'CeraVe Skincare Collection | Juba Fashion Hub',
    description:
      'Shop dermatologist-developed CeraVe skincare — cleansers, toner, moisturizers & retinol serum. 100% authentic imports, free express delivery across Juba.',
    image: '/images/cerave_foaming_cleanser.jpg',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'CeraVe Skincare Collection',
      url: `${SITE_URL}/collections/cerave`,
      itemListElement: [
        { '@type': 'Product', position: 1, name: 'CeraVe Foaming Facial Cleanser', image: `${SITE_URL}/images/cerave_foaming_cleanser.jpg`, offers: { '@type': 'Offer', priceCurrency: 'USD', price: '25' } },
        { '@type': 'Product', position: 2, name: 'CeraVe Acne Control Cleanser', image: `${SITE_URL}/images/cerave_acne_cleanser.jpg`, offers: { '@type': 'Offer', priceCurrency: 'USD', price: '25' } },
        { '@type': 'Product', position: 3, name: 'CeraVe Renewing SA Cleanser', image: `${SITE_URL}/images/cerave_renewing_sa_cleanser.jpg`, offers: { '@type': 'Offer', priceCurrency: 'USD', price: '25' } },
        { '@type': 'Product', position: 4, name: 'CeraVe Hydrating Cleanser', image: `${SITE_URL}/images/cerave_hydrating_cleanser.jpg`, offers: { '@type': 'Offer', priceCurrency: 'USD', price: '25' } },
        { '@type': 'Product', position: 5, name: 'CeraVe Resurfacing Retinol Serum', image: `${SITE_URL}/images/cerave_retinol_serum.jpg`, offers: { '@type': 'Offer', priceCurrency: 'USD', price: '20' } },
      ],
    },
  },
  {
    route: '/collections/badee-al-oud',
    outFile: 'collections/badee-al-oud/index.html',
    title: "Bade'e Al Oud Collection by Lattafa | Juba Fashion Hub",
    description:
      "Shop the Lattafa Bade'e Al Oud Collection — Black, Amethyst, Sublime, Noble Blush & White. 100% authentic 100ml EDP, free express delivery across Juba.",
    image: '/images/oud_black.png',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: "Bade'e Al Oud Collection",
      url: `${SITE_URL}/collections/badee-al-oud`,
      itemListElement: [
        { '@type': 'Product', position: 1, name: "Bade'e Al Oud Black", image: `${SITE_URL}/images/oud_black.png`, offers: { '@type': 'Offer', priceCurrency: 'USD', price: '40' } },
        { '@type': 'Product', position: 2, name: "Bade'e Al Oud Amethyst", image: `${SITE_URL}/images/oud_amethyst.png`, offers: { '@type': 'Offer', priceCurrency: 'USD', price: '40' } },
        { '@type': 'Product', position: 3, name: "Bade'e Al Oud Sublime", image: `${SITE_URL}/images/oud_sublime.png`, offers: { '@type': 'Offer', priceCurrency: 'USD', price: '40' } },
        { '@type': 'Product', position: 4, name: "Bade'e Al Oud Noble Blush", image: `${SITE_URL}/images/oud_noble_blush.png`, offers: { '@type': 'Offer', priceCurrency: 'USD', price: '40' } },
        { '@type': 'Product', position: 5, name: "Bade'e Al Oud White", image: `${SITE_URL}/images/oud_white.png`, offers: { '@type': 'Offer', priceCurrency: 'USD', price: '40' } },
      ],
    },
  },
];

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHead(page, assetTags) {
  const absoluteImage = page.image.startsWith('http') ? page.image : `${SITE_URL}${page.image}`;
  const canonicalUrl = `${SITE_URL}${page.route}`;
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);

  return `<meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="theme-color" content="#B24BF3" />
    <link rel="canonical" href="${canonicalUrl}" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Juba Fashion Hub" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${absoluteImage}" />
    <meta property="og:locale" content="en_US" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${absoluteImage}" />

    <!-- Favicons -->
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="512x512" href="/favicon.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

    <script type="application/ld+json">${JSON.stringify(page.jsonLd)}</script>
    ${assetTags}`;
}

function main() {
  const templatePath = path.join(distDir, 'index.html');
  const template = readFileSync(templatePath, 'utf-8');

  // Vite hoists the hashed module script + stylesheet link into <head>.
  // Extract that block so we can carry it into every generated page as-is.
  const scriptMatch = template.match(/<script type="module"[^>]*><\/script>/);
  const styleMatch = template.match(/<link rel="stylesheet"[^>]*>/);
  if (!scriptMatch) {
    throw new Error('generate-seo-html: could not find built module <script> tag in dist/index.html');
  }
  const assetTags = [scriptMatch[0], styleMatch ? styleMatch[0] : ''].filter(Boolean).join('\n    ');

  // Extract the exact built <body>...</body> (just the #root mount div).
  const bodyMatch = template.match(/<body[\s\S]*<\/body>/);
  if (!bodyMatch) {
    throw new Error('generate-seo-html: could not find <body> in dist/index.html');
  }
  const bodyBlock = bodyMatch[0];

  for (const page of PAGES) {
    const outPath = path.join(distDir, page.outFile);
    mkdirSync(path.dirname(outPath), { recursive: true });
    const html = `<!doctype html>
<html lang="en">
  <head>
    ${buildHead(page, assetTags)}
  </head>
  ${bodyBlock}
</html>
`;
    writeFileSync(outPath, html);
    console.log(`SEO: wrote ${page.outFile} for ${page.route}`);
  }
}

main();
