import express from 'express';
import crypto from 'crypto';
import { INITIAL_KNOWLEDGE_BASE, DEFAULT_TELEGRAM_CONFIG } from '../../src/pages/nine-collection/data/perfumesData.js';
import { KnowledgeBase, TelegramConfig, Order } from '../../src/pages/nine-collection/types.js';
import { db, setDoc, doc, collection, getDocs, query, orderBy, limit, firebaseWebApiKey } from '../../src/lib/firebase.js';
import { generateEmailSignInLink } from './firebaseAdmin.js';
import { buildSignInEmailHtml } from './emailTemplates.js';
import * as nineCollectionCatalog from './catalogs/nineCollection.js';
import * as hawasCatalog from './catalogs/hawas.js';
import * as ceraveCatalog from './catalogs/cerave.js';
import * as badeeAlOudCatalog from './catalogs/badeeAlOud.js';

// In-app notification shown to signed-in customers on /account — either an
// admin-composed broadcast campaign, or an automatic note tied to one order
// (e.g. "your order was delivered" / "your order was canceled") along with
// whatever message the admin attached when changing that order's status.
interface Notification {
  id: string;
  type: 'campaign' | 'order_status';
  title: string;
  message: string;
  audience: 'all' | 'email';
  targetEmail?: string;
  orderId?: string;
  orderStatus?: 'delivered' | 'canceled';
  createdAt: string;
  readBy: string[];
}

interface Catalog {
  label: string;
  perfumesData: readonly { id: string; name: string; priceUSD: number; priceSSP: number }[];
  systemInstruction: string;
  generateSmartFallbackResponse: (userText: string, currency: string) => string;
}

const CATALOGS: Record<string, Catalog> = {
  'nine-collection': nineCollectionCatalog,
  hawas: hawasCatalog,
  cerave: ceraveCatalog,
  'badee-al-oud': badeeAlOudCatalog,
};

function resolveCatalog(storeSlug?: string): Catalog {
  return (storeSlug && CATALOGS[storeSlug]) || nineCollectionCatalog;
}

// --- Admin authentication -------------------------------------------------
// Stateless HMAC-signed session cookie (no database/session store needed —
// this backend runs as a Vercel serverless function, so anything kept in
// memory doesn't persist across invocations). The signing secret and admin
// credentials are read from environment variables, never hardcoded.
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'dev-only-insecure-secret-change-me';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ADMIN_SESSION_COOKIE = 'jfh_admin_session';
const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function signAdminSession(username: string, expiresAt: number): string {
  const payload = `${username}.${expiresAt}`;
  const sig = crypto.createHmac('sha256', ADMIN_SESSION_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}.${sig}`).toString('base64url');
}

function verifyAdminSession(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = decoded.split('.');
    if (parts.length !== 3) return false;
    const [username, expiresAtStr, sig] = parts;
    const expiresAt = Number(expiresAtStr);
    if (!username || !expiresAt || !sig || Date.now() > expiresAt) return false;
    const expectedSig = crypto.createHmac('sha256', ADMIN_SESSION_SECRET).update(`${username}.${expiresAtStr}`).digest('hex');
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expectedSig);
    return sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf);
  } catch {
    return false;
  }
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  cookieHeader.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    out[pair.slice(0, idx).trim()] = decodeURIComponent(pair.slice(idx + 1).trim());
  });
  return out;
}

function setAdminSessionCookie(res: express.Response, token: string, maxAgeSeconds: number) {
  const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly${secureFlag}; SameSite=Strict; Path=/; Max-Age=${maxAgeSeconds}`
  );
}

function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const cookies = parseCookies(req.headers.cookie);
  if (!verifyAdminSession(cookies[ADMIN_SESSION_COOKIE])) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// In-memory state
let currentKnowledgeBase: KnowledgeBase = { ...INITIAL_KNOWLEDGE_BASE };
let currentTelegramConfig: TelegramConfig = {
  ...DEFAULT_TELEGRAM_CONFIG,
  botToken: process.env.TELEGRAM_BOT_TOKEN || DEFAULT_TELEGRAM_CONFIG.botToken,
  chatId: process.env.TELEGRAM_CHAT_ID || DEFAULT_TELEGRAM_CONFIG.chatId,
  enabled: true,
};
let ordersStore: Order[] = [];

// Groq chat completions helper (OpenAI-compatible API). Throws on any
// failure so callers can fall back to a secondary model or the
// rule-based responses.
async function callGroq(
  systemInstruction: string,
  userContent: string,
  temperature: number,
  model: string
): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userContent },
      ],
      temperature,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`Groq API error ${res.status}: ${errBody}`);
  }

  const data: any = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Groq API returned no content');
  return text;
}

// Extracts the JSON payload following a "[TAGNAME: {...}]" marker without
// assuming the model closed it perfectly. Groq/Llama sometimes malforms or
// duplicates trailing structure (unlike Gemini, which was reliable here), so
// rather than a lazy "first }" regex match — which truncates mid-object and
// leaks a broken tail into the reply — this takes everything after the
// marker up to the LAST "}" in the remaining text and parses that. Tags are
// documented in the system prompt to always be the final thing in the
// message, so this is safe.
function extractTaggedJson(text: string, tagName: string): any | undefined {
  const marker = `[${tagName}:`;
  const idx = text.indexOf(marker);
  if (idx === -1) return undefined;

  let jsonPart = text.slice(idx + marker.length);
  const lastBrace = jsonPart.lastIndexOf('}');
  if (lastBrace === -1) return undefined;
  jsonPart = jsonPart.slice(0, lastBrace + 1).trim();

  try {
    return JSON.parse(jsonPart);
  } catch {
    return undefined;
  }
}

// Best-effort fallback for when the model names a product in its reply
// without the [RECOMMEND: id] tag. Matches on the product's core name
// (stripped of " by Brand" suffixes), longest name first so more specific
// products (e.g. "9PM Black Classic") win over shorter overlapping ones
// (e.g. "9PM Black").
function inferRecommendedProductId(
  text: string,
  perfumes: readonly { id: string; name: string }[]
): string | undefined {
  const lowerText = text.toLowerCase();
  const sorted = [...perfumes].sort((a, b) => b.name.length - a.name.length);
  for (const p of sorted) {
    const core = p.name.split(/ by /i)[0].replace(/[()]/g, '').trim().toLowerCase();
    if (core && lowerText.includes(core)) {
      return p.id;
    }
  }
  return undefined;
}

// Verifies a Firebase Auth ID token via the accounts:lookup REST endpoint,
// using only the public Web API key (already in firebase-applet-config.json)
// — no service account / Firebase Admin SDK credentials needed. Returns the
// verified email on success, or null if the token is missing/invalid.
async function verifyFirebaseIdToken(idToken: string | undefined): Promise<string | null> {
  if (!idToken) return null;
  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseWebApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) return null;
    const data: any = await res.json();
    const email = data?.users?.[0]?.email;
    return typeof email === 'string' ? email.toLowerCase() : null;
  } catch {
    return null;
  }
}

// Base64 of the small email-specific logo, fetched once per cold start and
// cached — used as a CID inline attachment on outgoing emails so the logo
// renders immediately instead of depending on the recipient's email client
// loading a remote image. Fetched over HTTP from the already-public static
// asset rather than read from disk, since the serverless function's bundle
// isn't guaranteed to include files under public/ (those are traced into
// dist/ for static serving, not necessarily into the function's filesystem).
let cachedLogoBase64Promise: Promise<string | null> | null = null;
async function getEmailLogoBase64(): Promise<string | null> {
  if (!cachedLogoBase64Promise) {
    cachedLogoBase64Promise = (async () => {
      try {
        const res = await fetch('https://jubafashionhub.link/images/juba_fashion_hub_logo_email.jpg');
        if (!res.ok) throw new Error(`Logo fetch returned ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        return buf.toString('base64');
      } catch (err) {
        console.error('Failed to load email logo attachment:', err);
        return null;
      }
    })();
  }
  return cachedLogoBase64Promise;
}

// Firestore Persistence Helpers
async function saveOrderToFirestore(order: Order) {
  try {
    await setDoc(doc(db, 'orders', order.id), order);
  } catch (err) {
    console.error('Failed to save order to Firestore:', err);
  }
}

async function saveNotificationToFirestore(notification: Notification) {
  try {
    await setDoc(doc(db, 'notifications', notification.id), notification);
  } catch (err) {
    console.error('Failed to save notification to Firestore:', err);
  }
}

async function saveHelpRequestToFirestore(helpData: { customerPhone: string; customerQuery: string; telegramNotified: boolean }) {
  try {
    const id = `HELP-${Date.now()}`;
    await setDoc(doc(db, 'helpRequests', id), {
      id,
      ...helpData,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to save help request to Firestore:', err);
  }
}

// Telegram Helper for Alex (Admin Backend Assistant)
function generateAlexFallbackResponse(
  query: string,
  totalOrders: number,
  totalUSD: number,
  totalSSP: number,
  orders: Order[],
  helpRequests: any[]
): string {
  const q = query.toLowerCase();

  if (q.includes('order') || q.includes('sale') || q.includes('recent') || q.includes('list')) {
    if (orders.length === 0) {
      return `📊 Juba Fashion Hub Operations Update\n\nNo orders registered in the system yet. Store is active and ready for orders!`;
    }
    const top3 = orders.slice(0, 3).map(o => `• #${o.id}: ${o.customerName} (${o.customerPhone}) - $${o.totalUSD} / ${o.totalSSP.toLocaleString()} SSP\n  Items: ${o.items.map(i => i.productName).join(', ')} (${o.deliveryAddress})`).join('\n\n');
    return `📊 Juba Fashion Hub - Recent Orders\n\nTotal Orders: ${totalOrders}\nGross Revenue: $${totalUSD} USD / ${totalSSP.toLocaleString()} SSP\n\nTop Recent Orders:\n${top3}`;
  }

  if (q.includes('revenue') || q.includes('money') || q.includes('total') || q.includes('income')) {
    return `💰 Juba Fashion Hub Revenue Summary\n\n• Total Orders Processed: ${totalOrders}\n• Total Revenue (USD): $${totalUSD} USD\n• Total Revenue (SSP): ${totalSSP.toLocaleString()} SSP\n• Express Delivery Zone: Juba (120-min dispatch)`;
  }

  if (q.includes('help') || q.includes('query') || q.includes('customer') || q.includes('support')) {
    if (helpRequests.length === 0) {
      return `💬 Customer Support Desk\n\nNo pending customer support queries at the moment! Amina is handling website sales smoothly.`;
    }
    const reqs = helpRequests.slice(0, 3).map(h => `• ${h.customerPhone}: "${h.customerQuery}"`).join('\n');
    return `💬 Recent Customer Help Requests:\n\n${reqs}`;
  }

  if (q.includes('price') || q.includes('stock') || q.includes('inventory') || q.includes('perfume')) {
    return `📦 Juba Fashion Hub - Stock & Prices\n\nThe 9 Collection (Afnan, 100ml EDP):\n• 9PM Rebel: $40 / 320,000 SSP\n• 9PM Elixir: $40 / 320,000 SSP\n• 9PM Black Classic: $35 / 280,000 SSP\n• 9AM Dive: $40 / 320,000 SSP\n• 9PM Pour Femme: $35 / 280,000 SSP\n\nRasasi Hawas Collection (100ml EDP):\n• Hawas for Him: $35 / 280,000 SSP\n• Hawas Ice: $35 / 280,000 SSP\n• Hawas Black: $35 / 280,000 SSP\n• Hawas Fire: $35 / 280,000 SSP\n• Hawas Pink: $35 / 280,000 SSP\n\nBade'e Al Oud Collection (Lattafa, 100ml EDP):\n• Oud Black: $40 / 320,000 SSP\n• Oud Amethyst: $40 / 320,000 SSP\n• Oud Sublime: $40 / 320,000 SSP\n• Oud Noble Blush: $40 / 320,000 SSP\n• Oud White: $40 / 320,000 SSP\n\nCeraVe Skincare Collection:\n• Foaming Cleanser: $25 / 200,000 SSP\n• Acne Control Cleanser: $25 / 200,000 SSP\n• Renewing SA Cleanser: $25 / 200,000 SSP\n• Hydrating Cleanser: $25 / 200,000 SSP\n• Hydrating Toner: $25 / 200,000 SSP\n• Moisturizing Lotion: $25 / 200,000 SSP\n• Resurfacing Retinol Serum: $20 / 160,000 SSP\n• Moisturizing Cream: $30 / 240,000 SSP\n\nAll authentic imports.`;
  }

  return `👨‍💼 Alex - Admin Operations Assistant\n\nHello Admin! I am Alex, your backend store operations assistant for Juba Fashion Hub.\n\nI can assist you with:\n• Orders & Sales (ask "show orders")\n• Revenue Stats (ask "total revenue")\n• Customer Enquiries (ask "customer queries")\n• Inventory & Pricing (ask "stock and prices")`;
}

async function getAlexTelegramReply(incomingText: string, senderName: string): Promise<string> {
  let allOrders: Order[] = [...ordersStore];
  try {
    const snapshot = await getDocs(query(collection(db, 'orders'), limit(50)));
    const firestoreOrders = snapshot.docs.map(d => d.data() as Order);
    const orderMap = new Map<string, Order>();
    firestoreOrders.forEach(o => orderMap.set(o.id, o));
    allOrders.forEach(o => { if (!orderMap.has(o.id)) orderMap.set(o.id, o); });
    allOrders = Array.from(orderMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    // ignore
  }

  let helpRequests: any[] = [];
  try {
    const snapshot = await getDocs(query(collection(db, 'helpRequests'), limit(20)));
    helpRequests = snapshot.docs.map(d => d.data());
  } catch (e) {
    // ignore
  }

  const totalOrdersCount = allOrders.length;
  const totalUSDRevenue = allOrders.reduce((sum, o) => sum + (o.totalUSD || 0), 0);
  const totalSSPRevenue = allOrders.reduce((sum, o) => sum + (o.totalSSP || 0), 0);

  const recentOrdersSummary = allOrders.slice(0, 5).map((o, idx) => {
    const itemsStr = o.items.map(i => `${i.quantity}x ${i.productName}`).join(', ');
    return `${idx + 1}. #${o.id} - ${o.customerName} (${o.customerPhone}) - Items: [${itemsStr}] - Total: $${o.totalUSD} / ${o.totalSSP.toLocaleString()} SSP - Address: ${o.deliveryAddress}`;
  }).join('\n');

  const recentHelpSummary = helpRequests.slice(0, 5).map((h, idx) => {
    return `${idx + 1}. Customer ${h.customerPhone}: "${h.customerQuery}"`;
  }).join('\n');

  const alexSystemPrompt = `
You are Alex, the Admin's Backend Store Manager & Operations AI Assistant for Juba Fashion Hub in South Sudan.
You are talking directly to the Store Admin (${senderName}) on Telegram.

YOUR IDENTITY & ROLE:
- Name: Alex (Admin Backend Operations Assistant).
- Role: You help the Admin monitor sales, store metrics, orders, customer help requests, inventory, delivery status, and operational questions.
- You are NOT a frontend client sales agent. Amina handles customer sales on the website. You handle backend store operations for the Admin.

LIVE STORE DATA IN JUBA FASHION HUB:
- Total Store Orders: ${totalOrdersCount}
- Total Gross Revenue: $${totalUSDRevenue} USD / ${totalSSPRevenue.toLocaleString()} SSP
- Top/Recent Orders:\n${recentOrdersSummary || 'No orders registered yet.'}
- Recent Customer Support Requests forwarded from site:\n${recentHelpSummary || 'No pending customer queries.'}

PRODUCTS & PRICING (Juba Fashion Hub sells three collections):
The 9 Collection (Afnan, 100ml EDP):
1. 9PM Rebel ($40 / 320,000 SSP)
2. 9PM Elixir ($40 / 320,000 SSP)
3. 9PM Black Classic ($35 / 280,000 SSP)
4. 9AM Dive ($40 / 320,000 SSP)
5. 9PM Pour Femme ($35 / 280,000 SSP)

Rasasi Hawas Collection (100ml EDP):
1. Hawas for Him ($35 / 280,000 SSP)
2. Hawas Ice ($35 / 280,000 SSP)
3. Hawas Black ($35 / 280,000 SSP)
4. Hawas Fire ($35 / 280,000 SSP)
5. Hawas Pink ($35 / 280,000 SSP)

Bade'e Al Oud Collection (Lattafa, 100ml EDP):
1. Oud Black ($40 / 320,000 SSP)
2. Oud Amethyst ($40 / 320,000 SSP)
3. Oud Sublime ($40 / 320,000 SSP)
4. Oud Noble Blush ($40 / 320,000 SSP)
5. Oud White ($40 / 320,000 SSP)

CeraVe Skincare Collection:
1. Foaming Facial Cleanser ($25 / 200,000 SSP)
2. Acne Control Cleanser ($25 / 200,000 SSP)
3. Renewing SA Cleanser ($25 / 200,000 SSP)
4. Hydrating Cleanser ($25 / 200,000 SSP)
5. Hydrating Toner ($25 / 200,000 SSP)
6. Moisturizing Lotion ($25 / 200,000 SSP)
7. Resurfacing Retinol Serum ($20 / 160,000 SSP)
8. Moisturizing Cream ($30 / 240,000 SSP)

STORE OPERATIONAL POLICIES:
- Delivery: FREE 120-minute Express Dispatch across Juba, South Sudan.
- Hours: Monday - Sunday, 9:00 AM – 4:30 PM.
- Payment Methods: Cash (USD/SSP), Bank Transfer, m-GURUSH.

INSTRUCTIONS FOR ALEX:
1. Address the admin professionally, directly, and concisely ("Hello Admin!", "Here is your store update...").
2. Answer their question clearly using the live store data provided.
3. Keep response clean and easy to read on Telegram.
4. If they ask "Who are you?", introduce yourself as Alex, their Admin Operations & Store Assistant.
`;

  try {
    const text = await callGroq(alexSystemPrompt, `Admin query: "${incomingText}"`, 0.5, 'llama-3.3-70b-versatile');
    if (text && text.trim()) {
      return text.trim();
    }
  } catch (err) {
    console.warn('Alex Groq call failed, using smart admin fallback:', err);
  }

  return generateAlexFallbackResponse(incomingText, totalOrdersCount, totalUSDRevenue, totalSSPRevenue, allOrders, helpRequests);
}

export function createApp(): express.Express {
  const app = express();
  app.use(express.json());

  // --- Admin auth endpoints ---
  app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body || {};
    if (!ADMIN_PASSWORD) {
      return res.status(500).json({ error: 'Admin login is not configured yet (missing ADMIN_PASSWORD).' });
    }
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }
    const expiresAt = Date.now() + ADMIN_SESSION_TTL_MS;
    const token = signAdminSession(username, expiresAt);
    setAdminSessionCookie(res, token, Math.floor(ADMIN_SESSION_TTL_MS / 1000));
    return res.json({ success: true });
  });

  app.post('/api/admin/logout', (req, res) => {
    setAdminSessionCookie(res, '', 0);
    return res.json({ success: true });
  });

  app.get('/api/admin/session', (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    return res.json({ authenticated: verifyAdminSession(cookies[ADMIN_SESSION_COOKIE]) });
  });

  // Helper to format Telegram Order Message for Juba Fashion Hub
  function formatTelegramOrderMessage(order: Order): string {
    const totalFormatted = order.currency === 'SSP'
      ? `SSP ${order.totalSSP.toLocaleString()}`
      : `$${order.totalUSD.toLocaleString()} USD`;

    const itemsText = order.items
      .map(
        (item) =>
          `• <b>${item.quantity}x ${item.productName}</b>\n  Price: ${order.currency === 'SSP' ? `SSP ${(item.unitPriceUSD * 8000).toLocaleString()}` : `$${item.unitPriceUSD}`}`
      )
      .join('\n');

    const discountInfo = order.bundleDiscountUSD > 0
      ? `\n🎁 <b>AUTOMATIC BUNDLE DISCOUNT APPLIED:</b> -$${order.bundleDiscountUSD} USD (SSP ${order.bundleDiscountSSP.toLocaleString()} off!)`
      : '';

    return `🌸 <b>JUBA FASHION HUB - NEW PERFUME ORDER (#${order.id})</b>\n\n` +
      `👤 <b>Customer Name:</b> ${order.customerName}\n` +
      `📞 <b>Phone Number:</b> ${order.customerPhone}\n` +
      `📍 <b>City:</b> ${order.deliveryCity}\n` +
      `🏠 <b>Delivery Address in Juba:</b> ${order.deliveryAddress}\n` +
      `💳 <b>Payment Method:</b> ${order.paymentMethod.toUpperCase()}\n` +
      `💵 <b>Payment Currency:</b> ${order.currency}\n\n` +
      `🛍️ <b>BOTTLES ORDERED:</b>\n${itemsText}${discountInfo}\n\n` +
      `💰 <b>FINAL AMOUNT DUE:</b> <b>${totalFormatted}</b>\n\n` +
      `🚚 <b>Delivery Status:</b> FREE 120-MIN EXPRESS JUBA DISPATCH\n` +
      `📅 <b>Order Time:</b> ${new Date(order.createdAt).toLocaleString()}\n` +
      `✨ <i>Juba Fashion Hub</i>`;
  }

  // 1. Sales Team Chat API Endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, chatHistory, selectedCurrency = 'SSP', storeSlug } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      const catalog = resolveCatalog(storeSlug);

      // System Prompt for Amina - Sales Team Concierge (per-collection persona)
      const systemInstruction = catalog.systemInstruction;

      const promptText = `
User Question: "${message}"
Selected Currency Context: ${selectedCurrency}

Previous Chat Context:
${Array.isArray(chatHistory) ? chatHistory.slice(-4).map((m: any) => `${m.sender}: ${m.text}`).join('\n') : ''}
      `;

      let responseText = '';

      try {
        responseText = await callGroq(systemInstruction, promptText, 0.7, 'llama-3.3-70b-versatile');
      } catch (e1) {
        console.warn('Groq llama-3.3-70b-versatile failed, trying llama-3.1-8b-instant:', e1);
        try {
          responseText = await callGroq(systemInstruction, promptText, 0.7, 'llama-3.1-8b-instant');
        } catch (e2) {
          console.warn('Groq llama-3.1-8b-instant failed, using smart fallback engine:', e2);
          responseText = catalog.generateSmartFallbackResponse(message, selectedCurrency);
        }
      }

      if (!responseText) {
        responseText = catalog.generateSmartFallbackResponse(message, selectedCurrency);
      }

      let recommendedProductId: string | undefined = undefined;
      let orderPayload: any = undefined;
      let helpForwarded = false;

      const recommendMatch = responseText.match(/\[RECOMMEND:\s*([a-zA-Z0-9_-]+)\]/);
      if (recommendMatch && recommendMatch[1]) {
        recommendedProductId = recommendMatch[1];
      } else {
        // Groq/Llama doesn't reliably append the [RECOMMEND: id] tag the way
        // Gemini did, even when it clearly names a product in the reply.
        // Fall back to matching a known product name in the response text so
        // the "Add to Cart" card still shows up.
        recommendedProductId = inferRecommendedProductId(responseText, catalog.perfumesData);
      }

      // Handle Help Forwarding to Telegram
      const helpData = extractTaggedJson(responseText, 'FORWARD_HELP');
      if (helpData) {
        try {
          const customerPhone = helpData.customerPhone || 'Not specified';
          const customerQuery = helpData.customerQuery || 'Requested human support';

          const botToken = process.env.TELEGRAM_BOT_TOKEN || currentTelegramConfig.botToken;
          const chatId = process.env.TELEGRAM_CHAT_ID || currentTelegramConfig.chatId;

          if (currentTelegramConfig.enabled && botToken && chatId) {
            const tgUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
            const helpMsgText =
              `🚨 <b>JUBA FASHION HUB - CUSTOMER HELP REQUEST</b>\n\n` +
              `📞 <b>Customer Phone:</b> ${customerPhone}\n` +
              `💬 <b>Client Question / Request:</b> ${customerQuery}\n` +
              `📅 <b>Time:</b> ${new Date().toLocaleString()}\n\n` +
              `✨ <i>Amina collected this query and forwarded it to your Telegram bot. Please contact this client directly!</i>`;

            await fetch(tgUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: helpMsgText,
                parse_mode: 'HTML',
              }),
            });
            helpForwarded = true;
          }

          // Always save help request to Firestore
          await saveHelpRequestToFirestore({
            customerPhone,
            customerQuery,
            telegramNotified: helpForwarded,
          });
        } catch (err) {
          console.error('Failed to forward client help to Telegram:', err);
        }
      }

      // Handle Direct Chat Order Creation & Telegram Notification
      const extractedOrder = extractTaggedJson(responseText, 'CREATE_ORDER');
      if (extractedOrder) {
        try {
          orderPayload = extractedOrder;
          const orderId = `JFH-${Math.floor(100000 + Math.random() * 900000)}`;

          const itemsList = (orderPayload.items || []).map((it: any) => {
            const perfume = catalog.perfumesData.find((p) => p.id === it.productId) || catalog.perfumesData[0];
            return {
              productId: perfume.id,
              productName: perfume.name,
              quantity: it.quantity || 1,
              unitPriceUSD: perfume.priceUSD,
              unitPriceSSP: perfume.priceSSP,
            };
          });

          const subtotalUSD = itemsList.reduce((acc: number, it: any) => acc + it.unitPriceUSD * it.quantity, 0);
          const subtotalSSP = subtotalUSD * 8000;
          const totalCount = itemsList.reduce((acc: number, it: any) => acc + it.quantity, 0);
          const bundleDiscountUSD = totalCount >= 2 ? totalCount * 5 : 0;
          const bundleDiscountSSP = bundleDiscountUSD * 8000;
          const totalUSD = Math.max(0, subtotalUSD - bundleDiscountUSD);
          const totalSSP = Math.max(0, subtotalSSP - bundleDiscountSSP);

          const chatOrder: Order = {
            id: orderId,
            storeSlug: storeSlug || 'nine-collection',
            items: itemsList,
            subtotalUSD,
            subtotalSSP,
            bundleDiscountUSD,
            bundleDiscountSSP,
            totalUSD,
            totalSSP,
            currency: orderPayload.currency || selectedCurrency || 'SSP',
            customerName: orderPayload.customerName || 'Chat Customer',
            customerPhone: orderPayload.customerPhone || 'N/A',
            customerEmail: '',
            deliveryCity: 'Juba',
            deliveryAddress: orderPayload.deliveryAddress || 'Juba Town',
            notes: 'Placed directly via Amina (Sales Chat)',
            paymentMethod: orderPayload.paymentMethod || 'cod',
            paymentStatus: 'pending',
            deliveryStatus: 'pending',
            createdAt: new Date().toISOString(),
            telegramNotified: false,
          };

          const botToken = process.env.TELEGRAM_BOT_TOKEN || currentTelegramConfig.botToken;
          const chatId = process.env.TELEGRAM_CHAT_ID || currentTelegramConfig.chatId;

          if (currentTelegramConfig.enabled && botToken && chatId) {
            try {
              const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
              const messageText = formatTelegramOrderMessage(chatOrder);

              const tgRes = await fetch(telegramUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: messageText,
                  parse_mode: 'HTML',
                }),
              });

              const tgData: any = await tgRes.json();
              if (tgData && tgData.ok) {
                chatOrder.telegramNotified = true;
              } else {
                chatOrder.telegramError = tgData?.description || 'Telegram non-ok response';
              }
            } catch (tgErr: any) {
              console.error('Chat order Telegram notification error:', tgErr);
              chatOrder.telegramError = tgErr?.message || String(tgErr);
            }
          }

          ordersStore.unshift(chatOrder);
          await saveOrderToFirestore(chatOrder);
        } catch (err) {
          console.error('Failed to parse CREATE_ORDER json:', err);
        }
      }

      // Tags are documented to always be the final thing in the message, so
      // truncate at the first one found rather than regex-removing each —
      // Groq/Llama sometimes malforms the trailing JSON in a way a lazy
      // regex can't cleanly strip, leaking a broken fragment into the reply.
      const cleanText = responseText
        .split(/\[RECOMMEND:|\[CREATE_ORDER:|\[FORWARD_HELP:/)[0]
        .replace(/\*\*/g, '')
        .trim();

      return res.json({
        text: cleanText,
        recommendedProductId,
        orderPayload,
        helpForwarded,
      });
    } catch (error: any) {
      console.error('Chat Error:', error);
      return res.status(500).json({
        error: 'Failed to process chat response',
        details: error?.message || String(error),
      });
    }
  });

  // 2. Order Submission & Telegram Bot Integration Endpoint
  app.post('/api/order', async (req, res) => {
    try {
      const {
        items,
        subtotalUSD,
        subtotalSSP,
        bundleDiscountUSD,
        bundleDiscountSSP,
        totalUSD,
        totalSSP,
        currency,
        customerName,
        customerPhone,
        customerEmail,
        deliveryCity,
        deliveryAddress,
        paymentMethod,
        notes,
        storeSlug,
        bundleName,
      } = req.body;

      if (!items || !items.length || !customerName || !customerPhone || !deliveryAddress) {
        return res.status(400).json({ error: 'Missing required order fields' });
      }

      const orderId = `JFH-${Math.floor(100000 + Math.random() * 900000)}`;
      const newOrder: Order = {
        id: orderId,
        storeSlug: storeSlug || 'nine-collection',
        items,
        subtotalUSD,
        subtotalSSP,
        bundleDiscountUSD: bundleDiscountUSD || 0,
        bundleDiscountSSP: bundleDiscountSSP || 0,
        totalUSD,
        totalSSP,
        currency: currency || 'SSP',
        customerName,
        customerPhone,
        customerEmail: customerEmail || '',
        deliveryCity: deliveryCity || 'Juba',
        deliveryAddress,
        notes: notes || '',
        paymentMethod,
        paymentStatus: 'pending',
        deliveryStatus: 'pending',
        bundleName: bundleName || undefined,
        createdAt: new Date().toISOString(),
        telegramNotified: false,
      };

      let telegramNotified = false;
      let telegramError = undefined;

      const botToken = process.env.TELEGRAM_BOT_TOKEN || currentTelegramConfig.botToken;
      const chatId = process.env.TELEGRAM_CHAT_ID || currentTelegramConfig.chatId;
      const isTelegramEnabled = currentTelegramConfig.enabled || Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

      if (isTelegramEnabled && botToken && chatId) {
        try {
          const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
          const messageText = formatTelegramOrderMessage(newOrder);

          const tgRes = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: messageText,
              parse_mode: 'HTML',
            }),
          });

          const tgData: any = await tgRes.json();
          if (tgData && tgData.ok) {
            telegramNotified = true;
          } else {
            telegramError = tgData?.description || 'Telegram API returned non-ok status';
          }
        } catch (tgErr: any) {
          telegramError = tgErr?.message || String(tgErr);
        }
      }

      newOrder.telegramNotified = telegramNotified;
      if (telegramError) newOrder.telegramError = telegramError;

      ordersStore.unshift(newOrder);
      await saveOrderToFirestore(newOrder);

      return res.json({
        success: true,
        order: newOrder,
        message: 'Order placed successfully! Saved to database & delivery team notified.',
      });
    } catch (error: any) {
      console.error('Order Submission Error:', error);
      return res.status(500).json({ error: 'Failed to process order', details: error.message });
    }
  });

  // Lightweight page-view tracking, fired once per page load from every
  // storefront. Public (no auth) since it's a write-only counter, not a
  // data-exposing read. Fire-and-forget from the client, so failures here
  // should never surface to the visitor.
  app.post('/api/track-pageview', async (req, res) => {
    try {
      const { storeSlug, path: pagePath } = req.body || {};
      const id = `pv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await setDoc(doc(db, 'pageviews', id), {
        id,
        storeSlug: storeSlug || 'unknown',
        path: pagePath || '/',
        createdAt: new Date().toISOString(),
      });
      return res.json({ success: true });
    } catch (err) {
      console.error('Failed to record pageview:', err);
      return res.json({ success: false });
    }
  });

  // POST Send a passwordless sign-in link, emailed by us (via Resend) with
  // full Juba Fashion Hub branding, instead of Firebase's own generic mail.
  // We generate the link via the Admin SDK (no email sent by Firebase
  // itself) and send it ourselves — the link is otherwise identical to one
  // Firebase would have emailed, so the client-side
  // isSignInWithEmailLink/signInWithEmailLink flow is unaffected.
  app.post('/api/auth/send-login-link', async (req, res) => {
    try {
      const { email, redirectPath } = req.body || {};
      const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
      if (!trimmedEmail || !trimmedEmail.includes('@')) {
        return res.status(400).json({ error: 'A valid email is required' });
      }
      const safePath = typeof redirectPath === 'string' && redirectPath.startsWith('/') ? redirectPath : '/account';
      const continueUrl = `${req.protocol}://${req.get('host')}${safePath}`;

      const link = await generateEmailSignInLink(trimmedEmail, continueUrl);

      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) {
        console.error('RESEND_API_KEY is not configured');
        return res.status(500).json({ error: 'Email sending is not configured yet. Please try again later.' });
      }

      const logoBase64 = await getEmailLogoBase64();

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Juba Fashion Hub <sign-in@jubafashionhub.link>',
          to: [trimmedEmail],
          subject: 'Your Juba Fashion Hub sign-in link',
          html: buildSignInEmailHtml(link),
          attachments: logoBase64
            ? [{ filename: 'logo.jpg', content: logoBase64, content_id: 'logo' }]
            : undefined,
        }),
      });

      if (!resendRes.ok) {
        const errText = await resendRes.text();
        console.error('Resend send failed:', errText);
        return res.status(502).json({ error: 'Could not send the sign-in email. Please try again shortly.' });
      }

      return res.json({ success: true });
    } catch (err: any) {
      console.error('send-login-link error:', err);
      return res.status(500).json({ error: err.message || 'Failed to send sign-in link', code: err.code });
    }
  });

  // POST Email capture (homepage newsletter signup). Public — no auth needed
  // to submit an email, matching how /api/track-pageview works.
  app.post('/api/leads', async (req, res) => {
    try {
      const { email, source, storeSlug } = req.body || {};
      const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
      if (!trimmedEmail || !trimmedEmail.includes('@')) {
        return res.status(400).json({ error: 'A valid email is required' });
      }
      const id = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await setDoc(doc(db, 'leads', id), {
        id,
        email: trimmedEmail,
        source: source || 'homepage',
        storeSlug: storeSlug || 'home',
        createdAt: new Date().toISOString(),
      });
      return res.json({ success: true });
    } catch (err) {
      console.error('Failed to record lead:', err);
      return res.status(500).json({ success: false });
    }
  });

  // GET Captured leads (admin dashboard)
  app.get('/api/admin/leads', requireAdminAuth, async (req, res) => {
    try {
      const q = query(collection(db, 'leads'), limit(1000));
      const snapshot = await getDocs(q);
      const leads = snapshot.docs
        .map((d) => d.data())
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return res.json(leads);
    } catch (err) {
      console.error('Error fetching leads:', err);
      return res.status(500).json({ error: 'Failed to load leads' });
    }
  });

  // Telegram Webhook Handler for Incoming Client Messages
  app.post('/api/telegram/webhook', async (req, res) => {
    try {
      const update = req.body;
      const message = update?.message || update?.edited_message;

      if (message && message.text) {
        const chatId = message.chat?.id;
        const incomingText = message.text;
        const senderName = message.from?.first_name || 'Valued Customer';

        const botToken = process.env.TELEGRAM_BOT_TOKEN || currentTelegramConfig.botToken;

        // Auto-save Chat ID if not set yet
        if (chatId && (!currentTelegramConfig.chatId || currentTelegramConfig.chatId === '')) {
          currentTelegramConfig.chatId = String(chatId);
        }

        if (botToken && chatId) {
          const replyText = await getAlexTelegramReply(incomingText, senderName);

          const tgUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
          await fetch(tgUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: replyText,
            }),
          });
        }
      }
      return res.json({ ok: true });
    } catch (err) {
      console.error('Telegram Webhook error:', err);
      return res.json({ ok: true });
    }
  });

  // Setup Webhook helper
  app.post('/api/telegram/setup-webhook', async (req, res) => {
    try {
      const { botToken } = req.body;
      const tokenToUse = botToken || process.env.TELEGRAM_BOT_TOKEN || currentTelegramConfig.botToken;

      if (!tokenToUse) {
        return res.status(400).json({ error: 'Bot token required' });
      }

      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const proto = req.headers['x-forwarded-proto'] || 'https';
      const webhookUrl = `${proto}://${host}/api/telegram/webhook`;

      const tgUrl = `https://api.telegram.org/bot${tokenToUse}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;
      const tgRes = await fetch(tgUrl);
      const tgData: any = await tgRes.json();

      if (tgData && tgData.ok) {
        return res.json({ success: true, webhookUrl, message: 'Telegram Webhook registered successfully! Bot will now respond to texts.' });
      } else {
        return res.status(400).json({ success: false, error: tgData?.description || 'Webhook registration failed' });
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || String(err) });
    }
  });

  // 3. Telegram Test Ping Endpoint
  app.post('/api/telegram/test', async (req, res) => {
    try {
      const { botToken, chatId } = req.body;
      const tokenToUse = botToken || process.env.TELEGRAM_BOT_TOKEN || currentTelegramConfig.botToken;
      const chatIdToUse = chatId || process.env.TELEGRAM_CHAT_ID || currentTelegramConfig.chatId;

      if (!tokenToUse || !chatIdToUse) {
        return res.status(400).json({ error: 'Telegram Bot Token and Chat ID are required' });
      }

      const telegramUrl = `https://api.telegram.org/bot${tokenToUse}/sendMessage`;
      const testMsg = `🌸 <b>Juba Fashion Hub Telegram Bot Connected!</b>\n\nYour order notification system is active across all collections.\nTime: ${new Date().toLocaleString()}`;

      const response = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatIdToUse,
          text: testMsg,
          parse_mode: 'HTML',
        }),
      });

      const data: any = await response.json();
      if (data && data.ok) {
        return res.json({ success: true, message: 'Test message sent to Telegram successfully!' });
      } else {
        let errorDesc = data?.description || 'Failed to send test message to Telegram';
        if (errorDesc.includes('chat not found')) {
          errorDesc = 'Bad Request: chat not found. FIX: Open Telegram, search your Bot, tap START (or send "hello"), then click "Auto-Detect Chat ID" above!';
        }
        return res.status(400).json({
          success: false,
          error: errorDesc,
        });
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || String(err) });
    }
  });

  // Helper endpoint to auto-detect numeric Chat ID from recent bot updates
  app.post('/api/telegram/detect-chat-id', async (req, res) => {
    try {
      const { botToken } = req.body;
      const tokenToUse = botToken || process.env.TELEGRAM_BOT_TOKEN || currentTelegramConfig.botToken;

      if (!tokenToUse) {
        return res.status(400).json({ error: 'Telegram Bot Token is required' });
      }

      const response = await fetch(`https://api.telegram.org/bot${tokenToUse}/getUpdates`);
      const data: any = await response.json();

      if (data && data.ok && Array.isArray(data.result) && data.result.length > 0) {
        const latestUpdate = data.result[data.result.length - 1];
        const chat = latestUpdate.message?.chat || latestUpdate.edited_message?.chat || latestUpdate.channel_post?.chat || latestUpdate.my_chat_member?.chat;

        if (chat && chat.id) {
          const detectedId = String(chat.id);
          currentTelegramConfig.chatId = detectedId;
          return res.json({
            success: true,
            chatId: detectedId,
            chatName: chat.first_name || chat.title || 'User',
            message: `Found Chat ID ${detectedId} (${chat.first_name || chat.title || 'Telegram User'})! Saved automatically.`,
          });
        }
      }

      return res.status(404).json({
        success: false,
        error: 'No recent messages found for this bot. Step 1: Open Telegram app, Step 2: Search your Bot name, Step 3: Tap START or send "hello", then click "Auto-Detect Chat ID" again!',
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || String(err) });
    }
  });

  // 4. Store & Order Admin Endpoints
  app.get('/api/kb', (req, res) => res.json(currentKnowledgeBase));
  app.post('/api/kb', requireAdminAuth, (req, res) => {
    currentKnowledgeBase = { ...currentKnowledgeBase, ...req.body };
    return res.json({ success: true, kb: currentKnowledgeBase });
  });

  app.get('/api/telegram/config', requireAdminAuth, (req, res) => {
    return res.json({
      ...currentTelegramConfig,
      botToken: process.env.TELEGRAM_BOT_TOKEN || currentTelegramConfig.botToken,
      chatId: process.env.TELEGRAM_CHAT_ID || currentTelegramConfig.chatId,
    });
  });
  app.post('/api/telegram/config', requireAdminAuth, (req, res) => {
    currentTelegramConfig = { ...currentTelegramConfig, ...req.body };
    return res.json({ success: true, config: currentTelegramConfig });
  });

  // GET Orders from Firestore & memory
  app.get('/api/orders', requireAdminAuth, async (req, res) => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(100));
      const snapshot = await getDocs(q);
      const firestoreOrders: Order[] = snapshot.docs.map((d) => d.data() as Order);

      const orderMap = new Map<string, Order>();
      firestoreOrders.forEach((o) => orderMap.set(o.id, o));
      ordersStore.forEach((o) => {
        if (!orderMap.has(o.id)) orderMap.set(o.id, o);
      });

      const combinedOrders = Array.from(orderMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return res.json(combinedOrders);
    } catch (err) {
      console.error('Error fetching orders from Firestore:', err);
      return res.json(ordersStore);
    }
  });

  // GET a signed-in customer's own orders across every collection. Auth is a
  // Firebase ID token (from the email-link sign-in flow) in the Authorization
  // header, verified via verifyFirebaseIdToken — this is a customer's own
  // account, not the admin dashboard, so it uses a different auth mechanism
  // than requireAdminAuth.
  app.get('/api/my-orders', async (req, res) => {
    try {
      const authHeader = req.headers.authorization || '';
      const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
      const email = await verifyFirebaseIdToken(idToken);

      if (!email) {
        return res.status(401).json({ error: 'Sign in required' });
      }

      const q = query(collection(db, 'orders'), limit(1000));
      const snapshot = await getDocs(q);
      const firestoreOrders: Order[] = snapshot.docs.map((d) => d.data() as Order);

      const orderMap = new Map<string, Order>();
      firestoreOrders.forEach((o) => orderMap.set(o.id, o));
      ordersStore.forEach((o) => {
        if (!orderMap.has(o.id)) orderMap.set(o.id, o);
      });

      const myOrders = Array.from(orderMap.values())
        .filter((o) => (o.customerEmail || '').toLowerCase() === email)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return res.json(myOrders);
    } catch (err) {
      console.error('Error fetching customer orders:', err);
      return res.status(500).json({ error: 'Failed to load your orders' });
    }
  });

  // GET Sales breakdown per landing page (admin dashboard)
  app.get('/api/admin/sales-by-page', requireAdminAuth, async (req, res) => {
    try {
      let allOrders: Order[] = [];
      try {
        const q = query(collection(db, 'orders'), limit(1000));
        const snapshot = await getDocs(q);
        const firestoreOrders: Order[] = snapshot.docs.map((d) => d.data() as Order);
        const orderMap = new Map<string, Order>();
        firestoreOrders.forEach((o) => orderMap.set(o.id, o));
        ordersStore.forEach((o) => {
          if (!orderMap.has(o.id)) orderMap.set(o.id, o);
        });
        allOrders = Array.from(orderMap.values());
      } catch (err) {
        console.error('Error fetching orders for sales-by-page aggregation:', err);
        allOrders = ordersStore;
      }

      const byStore: Record<string, {
        label: string;
        orderCount: number;
        revenueUSD: number;
        revenueSSP: number;
        products: Record<string, { productName: string; quantity: number }>;
      }> = {};

      for (const order of allOrders) {
        const slug = order.storeSlug || 'nine-collection';
        if (!byStore[slug]) {
          byStore[slug] = {
            label: CATALOGS[slug]?.label || slug,
            orderCount: 0,
            revenueUSD: 0,
            revenueSSP: 0,
            products: {},
          };
        }
        const entry = byStore[slug];
        entry.orderCount += 1;
        entry.revenueUSD += order.totalUSD || 0;
        entry.revenueSSP += order.totalSSP || 0;

        (order.items || []).forEach((item) => {
          if (!entry.products[item.productId]) {
            entry.products[item.productId] = { productName: item.productName, quantity: 0 };
          }
          entry.products[item.productId].quantity += item.quantity || 0;
        });
      }

      const result = Object.fromEntries(
        Object.entries(byStore).map(([slug, entry]) => [
          slug,
          {
            label: entry.label,
            orderCount: entry.orderCount,
            revenueUSD: entry.revenueUSD,
            revenueSSP: entry.revenueSSP,
            topProducts: Object.values(entry.products)
              .sort((a, b) => b.quantity - a.quantity)
              .slice(0, 5),
          },
        ])
      );

      const totalOrders = allOrders.length;
      const totalRevenueUSD = allOrders.reduce((sum, o) => sum + (o.totalUSD || 0), 0);

      return res.json({ byStore: result, totalOrders, totalRevenueUSD });
    } catch (err: any) {
      console.error('Error building sales-by-page report:', err);
      return res.status(500).json({ error: 'Failed to build sales report', details: err?.message });
    }
  });

  // GET Client Records — derived from orders, grouped by phone number, across all
  // three storefronts (nine-collection, hawas, cerave) since they share this backend.
  app.get('/api/clients', requireAdminAuth, async (req, res) => {
    try {
      let allOrders: Order[] = [];
      try {
        const q = query(collection(db, 'orders'), limit(500));
        const snapshot = await getDocs(q);
        const firestoreOrders: Order[] = snapshot.docs.map((d) => d.data() as Order);
        const orderMap = new Map<string, Order>();
        firestoreOrders.forEach((o) => orderMap.set(o.id, o));
        ordersStore.forEach((o) => {
          if (!orderMap.has(o.id)) orderMap.set(o.id, o);
        });
        allOrders = Array.from(orderMap.values());
      } catch (err) {
        console.error('Error fetching orders for client aggregation:', err);
        allOrders = ordersStore;
      }

      const VIP_THRESHOLD_USD = 100;
      const clientMap = new Map<string, {
        phone: string;
        name: string;
        email: string;
        city: string;
        stores: Set<string>;
        totalSpentUSD: number;
        totalSpentSSP: number;
        ordersCount: number;
        lastOrderDate: string;
        lastOrderId: string;
      }>();

      for (const order of allOrders) {
        const phoneKey = (order.customerPhone || 'unknown').trim();
        const existing = clientMap.get(phoneKey);
        const orderStore = order.storeSlug || 'nine-collection';

        if (existing) {
          existing.totalSpentUSD += order.totalUSD || 0;
          existing.totalSpentSSP += order.totalSSP || 0;
          existing.ordersCount += 1;
          existing.stores.add(orderStore);
          if (new Date(order.createdAt).getTime() > new Date(existing.lastOrderDate).getTime()) {
            existing.lastOrderDate = order.createdAt;
            existing.lastOrderId = order.id;
            // Keep the most recently used name/email/city for this client
            existing.name = order.customerName || existing.name;
            existing.email = order.customerEmail || existing.email;
            existing.city = order.deliveryCity || existing.city;
          }
        } else {
          clientMap.set(phoneKey, {
            phone: phoneKey,
            name: order.customerName || 'Unknown Customer',
            email: order.customerEmail || '',
            city: order.deliveryCity || 'Juba',
            stores: new Set([orderStore]),
            totalSpentUSD: order.totalUSD || 0,
            totalSpentSSP: order.totalSSP || 0,
            ordersCount: 1,
            lastOrderDate: order.createdAt,
            lastOrderId: order.id,
          });
        }
      }

      const clients = Array.from(clientMap.values())
        .map((c) => ({
          phone: c.phone,
          name: c.name,
          email: c.email,
          city: c.city,
          stores: Array.from(c.stores),
          totalSpentUSD: c.totalSpentUSD,
          totalSpentSSP: c.totalSpentSSP,
          ordersCount: c.ordersCount,
          lastOrderDate: c.lastOrderDate,
          lastOrderId: c.lastOrderId,
          status: c.totalSpentUSD >= VIP_THRESHOLD_USD ? 'VIP Buyer' : 'Active Customer',
        }))
        .sort((a, b) => b.totalSpentUSD - a.totalSpentUSD);

      return res.json(clients);
    } catch (err: any) {
      console.error('Error building client records:', err);
      return res.status(500).json({ error: 'Failed to build client records', details: err?.message });
    }
  });

  // GET Page-view traffic summary per landing page (admin dashboard)
  app.get('/api/admin/pageviews-summary', requireAdminAuth, async (req, res) => {
    try {
      const q = query(collection(db, 'pageviews'), limit(5000));
      const snapshot = await getDocs(q);
      const views = snapshot.docs.map((d) => d.data() as { storeSlug?: string; createdAt?: string });

      const byStore: Record<string, number> = {};
      const byDay: Record<string, number> = {};
      views.forEach((v) => {
        const store = v.storeSlug || 'unknown';
        byStore[store] = (byStore[store] || 0) + 1;
        const day = (v.createdAt || '').slice(0, 10);
        if (day) byDay[day] = (byDay[day] || 0) + 1;
      });

      return res.json({ total: views.length, byStore, byDay });
    } catch (err: any) {
      console.error('Error aggregating pageviews:', err);
      return res.status(500).json({ total: 0, byStore: {}, byDay: {}, error: err?.message });
    }
  });

  // GET Customer Help Requests from Firestore
  app.get('/api/help-requests', requireAdminAuth, async (req, res) => {
    try {
      const q = query(collection(db, 'helpRequests'), orderBy('createdAt', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map((d) => d.data());
      return res.json(requests);
    } catch (err) {
      console.error('Error fetching help requests from Firestore:', err);
      return res.json([]);
    }
  });

  // POST Resend Telegram notification for an order
  app.post('/api/orders/:id/resend-telegram', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      let targetOrder = ordersStore.find((o) => o.id === id);

      if (!targetOrder) {
        const q = query(collection(db, 'orders'), limit(100));
        const snapshot = await getDocs(q);
        const orders = snapshot.docs.map((d) => d.data() as Order);
        targetOrder = orders.find((o) => o.id === id);
      }

      if (!targetOrder) {
        return res.status(404).json({ error: 'Order not found in database' });
      }

      const botToken = process.env.TELEGRAM_BOT_TOKEN || currentTelegramConfig.botToken;
      const chatId = process.env.TELEGRAM_CHAT_ID || currentTelegramConfig.chatId;

      if (!botToken || !chatId) {
        return res.status(400).json({ error: 'Telegram Bot Token or Chat ID is missing' });
      }

      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const messageText = formatTelegramOrderMessage(targetOrder);

      const tgRes = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: 'HTML',
        }),
      });

      const tgData: any = await tgRes.json();
      if (tgData && tgData.ok) {
        targetOrder.telegramNotified = true;
        delete targetOrder.telegramError;
        await saveOrderToFirestore(targetOrder);
        return res.json({ success: true, message: 'Order details resent to Telegram bot successfully!' });
      } else {
        let errorMsg = tgData?.description || 'Telegram API returned error';
        if (errorMsg.includes('chat not found')) {
          errorMsg = 'Bad Request: chat not found. (Fix: Search your bot in Telegram, tap START, then click "Detect Chat ID" in Admin Bot Config)';
        }
        targetOrder.telegramError = errorMsg;
        await saveOrderToFirestore(targetOrder);
        return res.status(400).json({ success: false, error: errorMsg });
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || String(err) });
    }
  });

  // POST Update an order's delivery/fulfillment status (admin dashboard).
  // Optionally accepts a `message` the admin wants to attach — e.g. why an
  // order was canceled, or a delivery note — which is stored on the order
  // and, for delivered/canceled orders placed with an email on file, also
  // pushed out as an in-app notification the customer sees on /account.
  app.post('/api/orders/:id/status', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, message } = req.body || {};
      const validStatuses = ['pending', 'delivered', 'canceled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be one of: pending, delivered, canceled.' });
      }

      let targetOrder = ordersStore.find((o) => o.id === id);
      if (!targetOrder) {
        const q = query(collection(db, 'orders'), limit(500));
        const snapshot = await getDocs(q);
        const orders = snapshot.docs.map((d) => d.data() as Order);
        targetOrder = orders.find((o) => o.id === id);
      }

      if (!targetOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }

      targetOrder.deliveryStatus = status;
      if (typeof message === 'string') {
        targetOrder.adminMessage = message.trim() || undefined;
      }
      await saveOrderToFirestore(targetOrder);

      const customerEmail = (targetOrder.customerEmail || '').toLowerCase().trim();
      if ((status === 'delivered' || status === 'canceled') && customerEmail) {
        const defaultMessage = status === 'delivered'
          ? 'Your order has arrived — thank you for shopping with us!'
          : 'Your order was canceled. Contact us on WhatsApp if you have any questions.';
        const notification: Notification = {
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: 'order_status',
          title: status === 'delivered' ? `Order #${targetOrder.id} delivered` : `Order #${targetOrder.id} canceled`,
          message: (typeof message === 'string' && message.trim()) || defaultMessage,
          audience: 'email',
          targetEmail: customerEmail,
          orderId: targetOrder.id,
          orderStatus: status,
          createdAt: new Date().toISOString(),
          readBy: [],
        };
        await saveNotificationToFirestore(notification);
      }

      return res.json({ success: true, order: targetOrder });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || String(err) });
    }
  });

  // POST Send a broadcast campaign notification to every signed-in customer
  // (admin dashboard "Campaigns" tab).
  app.post('/api/admin/campaigns', requireAdminAuth, async (req, res) => {
    try {
      const { title, message } = req.body || {};
      const trimmedTitle = typeof title === 'string' ? title.trim() : '';
      const trimmedMessage = typeof message === 'string' ? message.trim() : '';
      if (!trimmedTitle || !trimmedMessage) {
        return res.status(400).json({ error: 'A title and message are required' });
      }
      const notification: Notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: 'campaign',
        title: trimmedTitle,
        message: trimmedMessage,
        audience: 'all',
        createdAt: new Date().toISOString(),
        readBy: [],
      };
      await saveNotificationToFirestore(notification);
      return res.json({ success: true, notification });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || String(err) });
    }
  });

  // GET Campaign send history (admin dashboard).
  app.get('/api/admin/campaigns', requireAdminAuth, async (req, res) => {
    try {
      const q = query(collection(db, 'notifications'), limit(1000));
      const snapshot = await getDocs(q);
      const campaigns = snapshot.docs
        .map((d) => d.data() as Notification)
        .filter((n) => n.type === 'campaign')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return res.json(campaigns);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      return res.status(500).json({ error: 'Failed to load campaigns' });
    }
  });

  // GET Every notification a signed-in customer should see — broadcast
  // campaigns plus any order-status notes addressed to their email.
  app.get('/api/my-notifications', async (req, res) => {
    try {
      const authHeader = req.headers.authorization || '';
      const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
      const email = await verifyFirebaseIdToken(idToken);
      if (!email) {
        return res.status(401).json({ error: 'Sign in required' });
      }

      const q = query(collection(db, 'notifications'), limit(1000));
      const snapshot = await getDocs(q);
      const mine = snapshot.docs
        .map((d) => d.data() as Notification)
        .filter((n) => n.audience === 'all' || n.targetEmail === email)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          orderId: n.orderId,
          orderStatus: n.orderStatus,
          createdAt: n.createdAt,
          read: (n.readBy || []).includes(email),
        }));

      return res.json(mine);
    } catch (err) {
      console.error('Error fetching customer notifications:', err);
      return res.status(500).json({ error: 'Failed to load notifications' });
    }
  });

  // POST Mark every notification currently visible to this customer as read.
  app.post('/api/my-notifications/mark-all-read', async (req, res) => {
    try {
      const authHeader = req.headers.authorization || '';
      const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
      const email = await verifyFirebaseIdToken(idToken);
      if (!email) {
        return res.status(401).json({ error: 'Sign in required' });
      }

      const q = query(collection(db, 'notifications'), limit(1000));
      const snapshot = await getDocs(q);
      const mine = snapshot.docs
        .map((d) => d.data() as Notification)
        .filter((n) => n.audience === 'all' || n.targetEmail === email);

      await Promise.all(
        mine
          .filter((n) => !(n.readBy || []).includes(email))
          .map((n) => saveNotificationToFirestore({ ...n, readBy: [...(n.readBy || []), email] }))
      );

      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || String(err) });
    }
  });

  return app;
}

// Long-polling engine for local/traditional hosting only.
// Not used on Vercel — the serverless entry relies on the /api/telegram/webhook route instead.
export function startTelegramPolling() {
  let lastUpdateId = 0;

  console.log('🤖 Telegram Long Polling Engine started...');

  const pollLoop = async () => {
    try {
      const tokenToUse = process.env.TELEGRAM_BOT_TOKEN || currentTelegramConfig.botToken;

      if (tokenToUse) {
        const url = `https://api.telegram.org/bot${tokenToUse}/getUpdates?offset=${lastUpdateId + 1}&timeout=10`;
        const response = await fetch(url);
        const data: any = await response.json();

        if (data && data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            lastUpdateId = Math.max(lastUpdateId, update.update_id);
            const message = update.message || update.edited_message;

            if (message && message.text) {
              const chatId = message.chat?.id;
              const incomingText = message.text;
              const senderName = message.from?.first_name || 'Customer';

              if (chatId && (!currentTelegramConfig.chatId || currentTelegramConfig.chatId === '')) {
                currentTelegramConfig.chatId = String(chatId);
                console.log(`Auto-saved Chat ID: ${chatId}`);
              }

              if (chatId) {
                const replyText = await getAlexTelegramReply(incomingText, senderName);

                await fetch(`https://api.telegram.org/bot${tokenToUse}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: chatId,
                    text: replyText,
                  }),
                });
              }
            }
          }
        } else if (data && data.error_code === 409) {
          // Webhook is blocking getUpdates -> delete webhook so polling works
          await fetch(`https://api.telegram.org/bot${tokenToUse}/deleteWebhook`);
        }
      }
    } catch (err) {
      // Silent catch for network hiccups during polling
    } finally {
      setTimeout(pollLoop, 2000);
    }
  };

  pollLoop();
}
