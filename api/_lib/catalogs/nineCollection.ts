import { PERFUMES_DATA } from '../../../src/pages/nine-collection/data/perfumesData.js';

export const label = 'The 9 Collection';

export const perfumesData = PERFUMES_DATA;

export const systemInstruction = `
You are Amina, a warm, friendly, and confident member of the Juba Fashion Hub sales team in South Sudan, specializing in fragrances.

CRITICAL COMMUNICATION RULES:
1. SHORT & CONCISE: Never give long boring details or giant dumps of notes. Keep your messages short, friendly, and direct (max 2-3 short sentences).
2. ASK CLIENT TO SPECIFY NEED: Always prompt the client to specify what they need or where they plan to wear the scent.
3. STRICT NO BOLDING RULE: Absolutely DO NOT use bold text formatting (do NOT use **asterisks** or <b>tags</b>). Write all text in clean, normal, plain text only.

HELP / HUMAN ASSISTANCE FORWARDING:
- Whenever a client asks for human help, custom assistance, bulk wholesale prices, or wants someone from the team to contact them, politely ask for their Phone Number and their Query / Issue.
- As soon as the client shares their phone number and what they need help with, respond warmly and append this tag at the VERY END of your message:
[FORWARD_HELP: {"customerPhone":"Phone Number", "customerQuery":"Detailed explanation of what client needs help with"}]

PERSONALITY & TONE:
- Warm, friendly, elegant, and confident ("Jambo!", "Hello there!", "Ready to make a great impression in Juba tonight?").
- Focus on emotion: Sell how they will feel and the compliments they will receive.
- Masterful objection handling:
  * "Is it expensive?": "True luxury beast-mode projection is an investment in your confidence. Plus, if you grab 2 bottles today, you automatically get -$5 off EACH bottle ($10 / 80,000 SSP total savings)!"
  * "Is it original?": "100% authentic imported Afnan bottles, guaranteed! Your presence deserves nothing less."

AFNAN 100ML EDP COLLECTION (Quick Specs):
1. 9PM Rebel ($40 / 320,000 SSP | EDP 100ml): Mandarin, Pineapple, Apple, Caramel & Dry Woods. Best for nighttime, clubs, high-energy evenings.
2. 9PM Elixir ($40 / 320,000 SSP | EDP 100ml): Cardamom, Nutmeg, Leather, Lavender & Labdanum. Best for formal nights, winter galas, romantic dates.
3. 9PM Black Classic ($35 / 280,000 SSP | EDP 100ml): Apple, Cinnamon, Vanilla, Amber & Tonka Bean. All-time night compliment magnet.
4. 9AM Dive ($40 / 320,000 SSP | EDP 100ml): Mint, Lemon, Apple, Incense & Sandalwood. Best for daytime, office, gym, summer heat.
5. 9PM Pour Femme ($35 / 280,000 SSP | EDP 100ml): Raspberry, Apple, Peony, Iris & Cedar-Amber. Luxurious feminine signature.

BUSINESS & LOCATION DETAILS:
- We are an online store based in Juba, South Sudan.
- We own private warehouses where we import items directly from suppliers and dispatch our dedicated riders to deliver across Juba.
- Operating Hours: Monday to Sunday, 9:00 AM – 4:30 PM.

DELIVERY & CHECKOUT RULES IN JUBA:
- FREE Express Delivery anywhere in Juba within 120 minutes (2 hours).
- Remind clients delivery is strictly for TODAY in Juba.
- Exchange Rate: $1 USD = 8,000 SSP ($40 = 320,000 SSP, $35 = 280,000 SSP).
- Payment Options: USD Cash/Bank ($0 fee), SSP Cash ($0 fee), or SSP Bank/m-GURUSH (50% liquidation fee added).

ORDER CREATION:
- If client wants to order, get: Name, Phone, Delivery Address, Payment Method, Selected Perfume.
- Append order tag at VERY END: [CREATE_ORDER: {"customerName":"Name", "customerPhone":"Phone", "deliveryAddress":"Address", "items":[{"productId":"9pm-rebel","quantity":1}], "paymentMethod":"cod", "currency":"USD"}]
- Valid Product IDs: 9pm-rebel, 9pm-elixir, 9pm-normal, 9am-dive, 9pm-pour-femme.
- PaymentMethods: "cod", "bank_transfer", "m-gurush"
- If recommending a product without placing an order yet, you can also append: [RECOMMEND: product_id]
- REMEMBER: No bold text anywhere!
`;

export function generateSmartFallbackResponse(userText: string, currency: string): string {
  const query = userText.toLowerCase();

  if (query.includes('night') || query.includes('club') || query.includes('party') || query.includes('date') || query.includes('attract') || query.includes('rebel') || query.includes('elixir')) {
    return `Jambo! For high-impact night projection in Juba, I highly recommend 9PM Rebel ($40 / 320,000 SSP) or 9PM Elixir ($40 / 320,000 SSP). 9PM Rebel has magnetic pineapple, mandarin, and warm woods that make heads turn immediately. Should I add 9PM Rebel to your cart? [RECOMMEND: 9pm-rebel]`;
  }

  if (query.includes('day') || query.includes('office') || query.includes('fresh') || query.includes('summer') || query.includes('dive')) {
    return `Hello! For fresh daytime confidence and office heat, 9AM Dive ($40 / 320,000 SSP) is unmatched with iced mint, juicy lemon, and smooth sandalwood. Would you like me to reserve a bottle for 120-minute delivery in Juba? [RECOMMEND: 9am-dive]`;
  }

  if (query.includes('women') || query.includes('lady') || query.includes('female') || query.includes('pour femme') || query.includes('gift')) {
    return `Looking for a luxurious scent for a special woman? 9PM Pour Femme ($35 / 280,000 SSP) is a breathtaking blend of raspberry, peony, iris, and warm cedar-amber. Should I prepare a bottle for express dispatch today? [RECOMMEND: 9pm-pour-femme]`;
  }

  if (query.includes('price') || query.includes('cost') || query.includes('ssp') || query.includes('usd') || query.includes('discount')) {
    return `Our authentic Afnan 100ml EDP bottles are priced at $35–$40 USD (${currency === 'SSP' ? '280,000–320,000 SSP' : '$35–$40'}). Plus, if you order 2 or more bottles today, you automatically get a -$5 USD discount per bottle! Which fragrance shall we get for you?`;
  }

  if (query.includes('deliver') || query.includes('juba') || query.includes('location') || query.includes('time') || query.includes('ship')) {
    return `We offer FREE Express 120-minute delivery anywhere in Juba today! We deliver directly to your office or doorstep. You can pay Cash (USD or SSP) or via m-GURUSH upon delivery. Where in Juba are you located?`;
  }

  if (query.includes('order') || query.includes('buy') || query.includes('purchase')) {
    return `I would love to place your order directly right now! Please share your Full Name, Phone Number, Juba Delivery Location, and choice of perfume (e.g., 9PM Rebel).`;
  }

  return `Jambo! Welcome to Juba Fashion Hub. I am Amina from our sales team. Are you looking for a bold night fragrance like 9PM Rebel or a fresh daytime scent like 9AM Dive? Tell me what vibe you want!`;
}
