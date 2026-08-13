import express from 'express';
import { INITIAL_KNOWLEDGE_BASE, DEFAULT_TELEGRAM_CONFIG } from '../../src/pages/nine-collection/data/perfumesData.js';
import { KnowledgeBase, TelegramConfig, Order } from '../../src/pages/nine-collection/types.js';
import { db, setDoc, doc, collection, getDocs, query, orderBy, limit } from '../../src/lib/firebase.js';
import * as nineCollectionCatalog from './catalogs/nineCollection.js';
import * as hawasCatalog from './catalogs/hawas.js';
import * as ceraveCatalog from './catalogs/cerave.js';
import * as badeeAlOudCatalog from './catalogs/badeeAlOud.js';

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

// Firestore Persistence Helpers
async function saveOrderToFirestore(order: Order) {
  try {
    await setDoc(doc(db, 'orders', order.id), order);
  } catch (err) {
    console.error('Failed to save order to Firestore:', err);
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
      const helpMatch = responseText.match(/\[FORWARD_HELP:\s*(\{.*?\})\]/s);
      if (helpMatch && helpMatch[1]) {
        try {
          const helpData = JSON.parse(helpMatch[1]);
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
      const orderMatch = responseText.match(/\[CREATE_ORDER:\s*(\{.*?\})\]/s);
      if (orderMatch && orderMatch[1]) {
        try {
          orderPayload = JSON.parse(orderMatch[1]);
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

      const cleanText = responseText
        .replace(/\[RECOMMEND:\s*([a-zA-Z0-9_-]+)\]/g, '')
        .replace(/\[CREATE_ORDER:\s*(\{.*?\})\]/gs, '')
        .replace(/\[FORWARD_HELP:\s*(\{.*?\})\]/gs, '')
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
  app.post('/api/kb', (req, res) => {
    currentKnowledgeBase = { ...currentKnowledgeBase, ...req.body };
    return res.json({ success: true, kb: currentKnowledgeBase });
  });

  app.get('/api/telegram/config', (req, res) => {
    return res.json({
      ...currentTelegramConfig,
      botToken: process.env.TELEGRAM_BOT_TOKEN || currentTelegramConfig.botToken,
      chatId: process.env.TELEGRAM_CHAT_ID || currentTelegramConfig.chatId,
    });
  });
  app.post('/api/telegram/config', (req, res) => {
    currentTelegramConfig = { ...currentTelegramConfig, ...req.body };
    return res.json({ success: true, config: currentTelegramConfig });
  });

  // GET Orders from Firestore & memory
  app.get('/api/orders', async (req, res) => {
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

  // GET Client Records — derived from orders, grouped by phone number, across all
  // three storefronts (nine-collection, hawas, cerave) since they share this backend.
  app.get('/api/clients', async (req, res) => {
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

  // GET Customer Help Requests from Firestore
  app.get('/api/help-requests', async (req, res) => {
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
  app.post('/api/orders/:id/resend-telegram', async (req, res) => {
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
