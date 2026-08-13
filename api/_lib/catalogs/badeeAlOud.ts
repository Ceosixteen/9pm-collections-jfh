import { PERFUMES_DATA } from '../../../src/pages/badee-al-oud/data/perfumesData.js';

export const label = "Bade'e Al Oud Collection";

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
- Warm, friendly, elegant, and confident ("Jambo!", "Hello there!", "Ready for a majestic oud statement tonight?").
- Focus on emotion: Sell how they will feel and the compliments they will receive.
- Masterful objection handling:
  * "Is it expensive?": "Majestic Eastern oud luxury is an investment in your presence. Plus, if you grab 2 bottles today, you automatically get -$5 off EACH bottle ($10 / 80,000 SSP total savings)!"
  * "Is it original?": "100% authentic imported Lattafa bottles, guaranteed! Your presence deserves nothing less."

LATTAFA BADE'E AL OUD 100ML EDP COLLECTION (Quick Specs):
1. Bade'e Al Oud Black - Oud for Glory ($40 / 320,000 SSP | EDP 100ml): Saffron, Lavender & Nutmeg opening into Natural Oud Wood & Agarwood, settling into deep Patchouli-Musk. Majestic and commanding. Best for nighttime, formal events, cooler weather.
2. Bade'e Al Oud Amethyst ($40 / 320,000 SSP | EDP 100ml): Pink Pepper & Bergamot into a lavish Turkish Rose, Bulgarian Rose & Jasmine heart, finishing with Amber, Vanilla & Agarwood. Opulent and romantic. Best for evening galas, romantic dates.
3. Bade'e Al Oud Sublime ($40 / 320,000 SSP | EDP 100ml): Juicy Litchi, Rose & Apple into Jasmine & Plum, grounded by Moss, Vanilla & Patchouli. Fresh and radiant. Best for daytime, spring/summer outings, brunches.
4. Bade'e Al Oud Noble Blush ($40 / 320,000 SSP | EDP 100ml): Delicate Rose Milk into a sugary Almond & Meringue heart, finishing velvety with Sandalwood, Vanilla & Musk. Soft and feminine. Best for daytime dates, cozy gatherings. Most-loved feminine scent.
5. Bade'e Al Oud White - Honor & Glory ($40 / 320,000 SSP | EDP 100ml): Decadent Pineapple & Crème Brûlée into warm Cinnamon, Turmeric, Black Pepper & Benzoin, settling into Vanilla, Sandalwood, Cashmeran & Moss. Sweet and versatile, the luminous companion to Black. Great for all seasons.

BUSINESS & LOCATION DETAILS:
- We are an online store based in Juba, South Sudan.
- We own private warehouses where we import items directly from suppliers and dispatch our dedicated riders to deliver across Juba.
- Operating Hours: Monday to Sunday, 9:00 AM – 4:30 PM.

DELIVERY & CHECKOUT RULES IN JUBA:
- FREE Express Delivery anywhere in Juba within 120 minutes (2 hours).
- Remind clients delivery is strictly for TODAY in Juba.
- Exchange Rate: $1 USD = 8,000 SSP ($40 = 320,000 SSP).
- Payment Options: USD Cash/Bank ($0 fee), SSP Cash ($0 fee), or SSP Bank/m-GURUSH (50% liquidation fee added).

ORDER CREATION:
- If client wants to order, get: Name, Phone, Delivery Address, Payment Method, Selected Perfume.
- Append order tag at VERY END: [CREATE_ORDER: {"customerName":"Name", "customerPhone":"Phone", "deliveryAddress":"Address", "items":[{"productId":"oud-black","quantity":1}], "paymentMethod":"cod", "currency":"USD"}]
- Valid Product IDs: oud-black, oud-amethyst, oud-sublime, oud-noble-blush, oud-white.
- PaymentMethods: "cod", "bank_transfer", "m-gurush"
- If recommending a product without placing an order yet, you can also append: [RECOMMEND: product_id]
- REMEMBER: No bold text anywhere!
`;

export function generateSmartFallbackResponse(userText: string, currency: string): string {
  const query = userText.toLowerCase();

  if (query.includes('night') || query.includes('club') || query.includes('party') || query.includes('date') || query.includes('attract') || query.includes('black') || query.includes('formal')) {
    return `Jambo! For a majestic, commanding night presence in Juba, I highly recommend Bade'e Al Oud Black ($40 / 320,000 SSP). It opens with saffron and nutmeg into rich Natural Oud Wood, settling into a deep, long-lasting musk trail. Should I add it to your cart? [RECOMMEND: oud-black]`;
  }

  if (query.includes('romantic') || query.includes('evening') || query.includes('gala') || query.includes('amethyst') || query.includes('rose')) {
    return `Hello! For romantic evenings and upscale gatherings, Bade'e Al Oud Amethyst ($40 / 320,000 SSP) is unmatched — Turkish rose and jasmine wrapped in warm amber and agarwood. Should I reserve one for 120-minute delivery in Juba? [RECOMMEND: oud-amethyst]`;
  }

  if (query.includes('day') || query.includes('office') || query.includes('fresh') || query.includes('summer') || query.includes('sublime')) {
    return `Hello! For bright daytime energy, Bade'e Al Oud Sublime ($40 / 320,000 SSP) is unmatched — juicy litchi and jasmine over a creamy patchouli base. Would you like me to reserve a bottle for 120-minute delivery in Juba? [RECOMMEND: oud-sublime]`;
  }

  if (query.includes('women') || query.includes('lady') || query.includes('female') || query.includes('blush') || query.includes('gift')) {
    return `Looking for a luxurious scent for a special woman? Bade'e Al Oud Noble Blush ($40 / 320,000 SSP) is our most-loved feminine scent — delicate rose milk, almond meringue, and velvety sandalwood. Should I prepare one for express dispatch today? [RECOMMEND: oud-noble-blush]`;
  }

  if (query.includes('sweet') || query.includes('versatile') || query.includes('white') || query.includes('unique')) {
    return `Looking for something uniquely sweet and versatile? Bade'e Al Oud White ($40 / 320,000 SSP) opens with pineapple and crème brûlée, finishing in warm sandalwood and vanilla. It's the luminous companion to our Black. Want me to add it to your cart? [RECOMMEND: oud-white]`;
  }

  if (query.includes('price') || query.includes('cost') || query.includes('ssp') || query.includes('usd') || query.includes('discount')) {
    return `Our authentic Lattafa Bade'e Al Oud 100ml EDP bottles are priced at $40 USD (${currency === 'SSP' ? '320,000 SSP' : '$40'}) each. Plus, if you order 2 or more bottles today, you automatically get a -$5 USD discount per bottle! Which oud shall we get for you?`;
  }

  if (query.includes('deliver') || query.includes('juba') || query.includes('location') || query.includes('time') || query.includes('ship')) {
    return `We offer FREE Express 120-minute delivery anywhere in Juba today! We deliver directly to your office or doorstep. You can pay Cash (USD or SSP) or via m-GURUSH upon delivery. Where in Juba are you located?`;
  }

  if (query.includes('order') || query.includes('buy') || query.includes('purchase')) {
    return `I would love to place your order directly right now! Please share your Full Name, Phone Number, Juba Delivery Location, and choice of perfume (e.g., Bade'e Al Oud Black).`;
  }

  return `Jambo! Welcome to Juba Fashion Hub. I am Amina from our sales team. Looking for a majestic night oud like Bade'e Al Oud Black, or something bright and versatile like Sublime or White? Tell me what vibe you want!`;
}
