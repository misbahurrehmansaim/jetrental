'use strict';
/** FAQ bank. Pages pick entries by tag. Keep answers plain, specific and honest: they also feed FAQPage schema. */
const faqs = [
  {
    id: 'cost',
    tags: ['home', 'charter', 'cost', 'quote'],
    q: 'How much does it cost to charter a private jet?',
    a: 'Most charters are priced by flight time plus fees and taxes. Typical market ranges are about $2,200 to $3,200 per flight hour for turboprops, $3,500 to $5,000 for light jets, $4,500 to $6,500 for midsize, $6,000 to $8,500 for super-midsize, $8,500 to $12,000 for heavy jets and $11,000 to $15,000 for ultra-long-range aircraft. Landing, handling, catering and ground transport are extra, and domestic flights usually carry a federal excise tax. Use the instant estimator for a range on your exact route, then ask for a firm quote.',
  },
  {
    id: 'how-fast',
    tags: ['home', 'charter', 'booking', 'quote'],
    q: 'How quickly can I get a quote and fly?',
    a: 'A flight advisor can usually send a firm quote for your route within minutes, around the clock. Many flights can be arranged on a few hours\' notice depending on aircraft availability, and more complex trips benefit from 24 to 48 hours. Peak holiday weeks and major events book out earlier, so ask as soon as your plans are firm.',
  },
  {
    id: 'broker',
    tags: ['home', 'safety', 'charter', 'broker'],
    q: 'Do you own the aircraft or are you a broker?',
    a: 'We arrange charter flights on aircraft operated by independent, FAA-certificated Part 135 air carriers. We are not the operator of those flights, and the carrier is responsible for the operational control of the aircraft. The operator\'s name and tail number are shown on your quote and confirmation. Read our broker disclosure for the full detail.',
  },
  {
    id: 'safety',
    tags: ['home', 'safety', 'charter'],
    q: 'How do you check that a charter operator is safe?',
    a: 'Every flight is operated by a carrier that holds an FAA Part 135 air carrier certificate. We screen operators against independent third-party safety audits such as ARGUS and Wyvern, along with insurance, pilot experience and aircraft age and maintenance records. Read how the audit programmes differ on our safety page.',
  },
  {
    id: 'empty-leg',
    tags: ['home', 'empty', 'charter', 'cost'],
    q: 'What is an empty leg flight?',
    a: 'An empty leg is a repositioning flight where the aircraft flies without passengers to reach its next pickup or home base. Operators often discount these flights because the aircraft is moving anyway. The trade-off is flexibility: routes and times are set by the aircraft\'s schedule, and they can change or disappear at short notice.',
  },
  {
    id: 'jet-card',
    tags: ['home', 'card', 'cost'],
    q: 'Is a jet card better than booking individual charters?',
    a: 'It depends on how much you fly. A jet card is a prepaid block of flight hours that usually locks in hourly rates and gives priority availability. If you fly roughly 25 hours a year or more, a card can be worth comparing. If you fly a few times a year, on-demand charter has no commitment and lets you choose the best aircraft each time.',
  },
  {
    id: 'airports',
    tags: ['home', 'charter', 'airport'],
    q: 'Which airports can a private jet use?',
    a: 'Private jets can use thousands of airports in the United States, including many smaller airports that airlines do not serve. That often puts you closer to your final destination. Your advisor will recommend the best airport for your route, checking runway length, curfews and local access rules for the aircraft you choose.',
  },
  {
    id: 'arrive',
    tags: ['charter', 'booking'],
    q: 'How early should I arrive for a private flight?',
    a: 'Most private terminals ask passengers to arrive about 15 minutes before departure. There is no queue at security in the commercial sense. Your advisor will confirm the exact terminal address, arrival time and any ID requirements in your itinerary.',
  },
  {
    id: 'id',
    tags: ['charter', 'booking', 'intl'],
    q: 'What ID do I need to fly private?',
    a: 'Every passenger needs a valid government-issued photo ID, and the name must match the passenger manifest. International flights require a passport and any visas or entry documents for the destination. Provide full names as they appear on ID when you confirm the trip.',
  },
  {
    id: 'bags',
    tags: ['charter', 'booking', 'baggage', 'fleet'],
    q: 'How much baggage can I bring?',
    a: 'Baggage limits depend on the aircraft, not a fixed airline allowance. A light jet holds roughly six standard bags, while heavy jets have large holds for skis, golf clubs and oversized items. Tell your advisor what you are bringing, because weight and space also affect range and performance, especially at high-elevation airports.',
  },
  {
    id: 'pets',
    tags: ['charter', 'pets', 'concierge'],
    q: 'Can I fly with my pet?',
    a: 'Most operators allow pets in the cabin, often at no extra charge, but policies differ by carrier. Mention the animal\'s size and breed when you request a quote so the right aircraft and operator can be matched, and bring any travel documents required for your destination.',
  },
  {
    id: 'cancel',
    tags: ['charter', 'booking', 'cost'],
    q: 'What happens if I need to cancel or change my flight?',
    a: 'Cancellation and change terms are set by the operator and shown on your quote and charter agreement before you confirm. They commonly step up as departure approaches. If something may change, ask for flexible-date options up front and consider the terms before you pay.',
  },
  {
    id: 'payment',
    tags: ['charter', 'booking', 'cost'],
    q: 'How do I pay for a charter?',
    a: 'Flights are usually paid in advance by wire transfer or card before departure, with the payment terms shown on your quote. Card payments can carry a processing fee. Your advisor will confirm the accepted methods and send a written invoice with every line item.',
  },
  {
    id: 'fet',
    tags: ['cost', 'quote'],
    q: 'What taxes and fees are added to the base price?',
    a: 'On domestic charters there is generally a 7.5% federal excise tax on the transportation charge, plus per-passenger segment fees. Landing, parking, handling, catering, ground transport, de-icing and international customs fees can also apply. Our estimates include an allowance for airport fees; your written quote itemises all of them.',
  },
  {
    id: 'weather',
    tags: ['charter', 'booking'],
    q: 'What if weather affects my trip?',
    a: 'The pilot-in-command makes the final call on safety, including weather. Private flights can often depart around weather that disrupts airline schedules because they use alternative airports and have flexible timing, but delays and diversions can still happen. Your advisor will keep you updated and rebook where needed.',
  },
  {
    id: 'intl',
    tags: ['charter', 'intl'],
    q: 'Can you arrange international flights?',
    a: 'Yes. International charters need extra planning for customs and immigration, landing permits, overflight clearances and crew duty limits. Give your advisor as much notice as you can, and have passports ready for everyone on board.',
  },
  {
    id: 'group',
    tags: ['group', 'corporate', 'charter'],
    q: 'Can you charter larger aircraft for teams and groups?',
    a: 'Yes. Heavy jets carry up to about 16 passengers, and for bigger groups, such as sports teams or events, we can arrange VIP airliner charters on request. Share headcount, baggage and equipment early so we can match the right aircraft and operator.',
  },
  {
    id: 'wifi',
    tags: ['charter', 'fleet', 'concierge'],
    q: 'Is there Wi-Fi on board?',
    a: 'Many, but not all, charter aircraft have Wi-Fi, and speed and coverage vary by aircraft and region. If connectivity matters for your flight, say so when you request a quote and we will filter aircraft accordingly.',
  },
  {
    id: 'catering',
    tags: ['concierge', 'charter'],
    q: 'Can I order catering, ground transport or a helicopter transfer?',
    a: 'Yes. Your advisor can arrange catering from local restaurants or caterers, chauffeured cars to the aircraft door, hotels, and helicopter transfers where available. Tell us your preferences and any dietary needs when you book.',
  },
  {
    id: 'operator',
    tags: ['operators'],
    q: 'I own or operate a jet. Can I list it with you?',
    a: 'Operators holding an FAA Part 135 certificate can apply to list aircraft and receive verified charter requests. Send details through the operators page, including your certificate, insurance and safety audit status, and our team will follow up.',
  },
  {
    id: 'frac',
    tags: ['card', 'compare'],
    q: 'What is the difference between charter, a jet card and fractional ownership?',
    a: 'Charter is pay-per-flight with no commitment. A jet card prepays a block of hours, usually at fixed hourly rates and with priority availability. Fractional ownership buys a share of a specific aircraft, with a multi-year contract, a purchase cost and monthly management fees. Full ownership adds the cost and complexity of running your own aircraft.',
  },
];

const byTag = (tag, limit = 8) => faqs.filter((f) => f.tags.includes(tag)).slice(0, limit);
const pick = (...ids) => ids.map((id) => faqs.find((f) => f.id === id)).filter(Boolean);

module.exports = { faqs, byTag, pick };
