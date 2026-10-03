'use strict';
/**
 * Guides (blog). Each body is a function so numbers can be computed from the same fleet and route data
 * the estimator uses, which keeps the articles consistent with the site.
 */
const { classes, classById } = require('./fleet');
const { byCode } = require('./airports');
const { estimate } = require('../lib/estimate');
const { money, roundTo, hm } = require('../lib/util');

const rate = (c) => `${money(c.rate[0])} to ${money(c.rate[1])}`;
const rateRows = () =>
  classes
    .map((c) => `<tr><th scope="row"><a href="~/fleet/${c.slug}/">${c.name}</a></th><td>${c.paxLabel}</td><td>${rate(c)}</td><td>${c.range.toLocaleString('en-US')} mi</td></tr>`)
    .join('');

const posts = [
  {
    slug: 'how-much-does-it-cost-to-charter-a-private-jet',
    title: 'How Much Does It Cost to Charter a Private Jet?',
    h1: 'How much does it cost to charter a private jet?',
    description: 'Real 2026 price ranges per flight hour by aircraft class, what is and is not included, and a worked example for a New York to Miami charter.',
    photo: 'jetRunwayA',
    cat: 'Pricing',
    mins: 7,
    faq: ['cost', 'fet', 'cancel'],
    related: ['what-is-an-empty-leg-flight', 'private-jet-charter-vs-jet-card-vs-fractional', 'light-vs-midsize-vs-heavy-jet'],
    body: () => {
      const a = byCode.TEB, b = byCode.OPF;
      const mid = classById['midsize'];
      const e = estimate(a, b, mid);
      const sm = estimate(a, b, classById['super-midsize']);
      return `
<p class="lede">Chartering a private jet usually costs between about $2,200 and $15,000 per flight hour, depending on the aircraft. The all-in price of a trip is that hourly rate multiplied by flight time, plus airport fees, taxes and any extras you add.</p>
<h2>Hourly rates by aircraft class</h2>
<p>These are indicative 2026 market ranges. Your quote depends on the specific aircraft, the operator, the season and whether the plane has to reposition to pick you up.</p>
<div class="table-wrap"><table class="data-table"><thead><tr><th>Aircraft class</th><th>Seats</th><th>Typical hourly rate</th><th>Typical range</th></tr></thead><tbody>${rateRows()}</tbody></table></div>
<h2>What the price includes (and what it does not)</h2>
<ul class="check-list">
<li><strong>Usually included:</strong> the aircraft, two pilots, fuel, standard insurance and basic catering on many aircraft.</li>
<li><strong>Usually added:</strong> landing and parking fees, handling at the private terminal, de-icing, customs for international trips, crew overnight costs on multi-day trips, and catering and ground transport.</li>
<li><strong>Taxes:</strong> domestic charters generally carry a 7.5% federal excise tax on the transportation charge, plus small per-passenger segment fees.</li>
</ul>
<h2>Worked example: New York to Miami</h2>
<p>Teterboro to Opa-locka is about ${e.miles.toLocaleString('en-US')} miles, which is roughly ${hm(e.hours)} of billable flight time in a midsize jet. At the midsize range that comes to about <strong>${money(roundTo(e.low, 500))} to ${money(roundTo(e.high, 500))}</strong> one way including an allowance for airport fees and federal excise tax. A super-midsize jet on the same route is about ${money(roundTo(sm.low, 500))} to ${money(roundTo(sm.high, 500))}.</p>
<p>Try your own route in the <a href="~/instant-quote/">instant estimator</a>.</p>
<h2>Why quotes for the same trip differ</h2>
<ol>
<li><strong>Positioning.</strong> If the aircraft has to fly empty to reach you, some of that cost is passed on.</li>
<li><strong>Demand.</strong> Holiday weeks and big events lift prices and reduce availability.</li>
<li><strong>Aircraft age and amenities.</strong> Newer aircraft and larger cabins cost more per hour.</li>
<li><strong>Round trips versus one-way.</strong> One-way trips can be priced higher per leg because the aircraft returns empty.</li>
</ol>
<h2>Ways to pay less</h2>
<ul class="check-list">
<li>Be flexible by a day: <a href="~/empty-leg-flights/">empty leg flights</a> can be heavily discounted.</li>
<li>Choose the smallest cabin that fits your group and bags.</li>
<li>Book round trips and avoid peak days where you can.</li>
<li>If you fly regularly, compare a <a href="~/jet-card/">jet card</a> against on-demand rates.</li>
</ul>
<p>Prices on this page are market ranges for information, not a quote. Ask a flight advisor for a firm price on your exact trip.</p>`;
    },
  },
  {
    slug: 'what-is-an-empty-leg-flight',
    title: 'What Is an Empty Leg Flight? How It Works',
    h1: 'What is an empty leg flight?',
    description: 'Empty leg flights are discounted repositioning flights. Learn how they work, how much you can save, the trade-offs and how to catch one.',
    photo: 'jetRunwayB',
    cat: 'Savings',
    mins: 5,
    faq: ['empty-leg', 'cancel'],
    related: ['how-much-does-it-cost-to-charter-a-private-jet', 'how-to-charter-a-private-jet', 'private-jet-charter-vs-jet-card-vs-fractional'],
    body: () => `
<p class="lede">An empty leg is a flight where a private jet travels without passengers, usually to reposition for its next trip or return to base. Because the aircraft is flying anyway, operators often sell those seats at a reduced price.</p>
<h2>How empty legs happen</h2>
<p>Charters are often one-way. If a group flies from New York to Aspen, the aircraft might need to return to New York empty, or reposition to its next pickup in Denver. That empty segment is the empty leg. It can also happen when an aircraft ferries to a maintenance base or to meet a booking elsewhere.</p>
<h2>How much can you save?</h2>
<p>Discounts vary widely by operator, route and how close the departure is. Savings are often substantial compared with a normal one-way charter, but there is no standard percentage, and an empty leg is not always the cheapest option for a given trip. Ask your advisor to compare it with a standard quote.</p>
<h2>The trade-offs</h2>
<ul class="check-list">
<li><strong>Fixed route and time.</strong> You fly when and where the aircraft is already going. Adjusting the route is sometimes possible but usually costs more.</li>
<li><strong>Short notice.</strong> Many empty legs appear one to three days before departure.</li>
<li><strong>Can change.</strong> If the aircraft's own schedule changes, the flight can be moved or cancelled. Ask about the operator's policy and have a backup plan.</li>
<li><strong>One-way only.</strong> You may need a second booking for the return.</li>
</ul>
<h2>How to catch one</h2>
<ol>
<li>Flexible dates are the key. Tell your advisor the window you can travel in.</li>
<li>Set up <a href="~/empty-leg-flights/">empty leg alerts</a> for the routes you fly most often, such as New York to Florida or Los Angeles to Las Vegas.</li>
<li>Check popular corridors in season, because aircraft flow in one direction at the start and end of ski and winter seasons.</li>
</ol>
<h2>Are empty legs safe?</h2>
<p>Yes. The aircraft, crew and operator requirements are the same as for any charter flight: the carrier must hold an FAA Part 135 certificate. Read <a href="~/safety/">how we vet operators</a>.</p>`,
  },
  {
    slug: 'private-jet-charter-vs-jet-card-vs-fractional',
    title: 'Private Jet Charter vs Jet Card vs Fractional',
    h1: 'Private jet charter vs jet card vs fractional ownership',
    description: 'Compare on-demand charter, jet cards and fractional ownership by cost, commitment, availability and best use, with a simple rule of thumb for how much you fly.',
    photo: 'cabinEmpty1',
    cat: 'Comparison',
    mins: 6,
    faq: ['jet-card', 'frac'],
    related: ['how-much-does-it-cost-to-charter-a-private-jet', 'how-to-choose-a-private-jet-charter-company', 'how-to-charter-a-private-jet'],
    body: () => `
<p class="lede">The right way to fly private depends mostly on how many hours you fly a year. Occasional travellers usually do best with on-demand charter. Frequent flyers should compare jet cards. Heavy users with predictable schedules may look at fractional or full ownership.</p>
<div class="table-wrap"><table class="data-table"><thead><tr><th></th><th>On-demand charter</th><th>Jet card</th><th>Fractional share</th></tr></thead><tbody>
<tr><th scope="row">How you pay</th><td>Per flight</td><td>Prepaid block of hours</td><td>Purchase of a share plus monthly fee and hourly cost</td></tr>
<tr><th scope="row">Commitment</th><td>None</td><td>Prepay; terms vary by programme</td><td>Multi-year contract</td></tr>
<tr><th scope="row">Rates</th><td>Market rates that move with demand</td><td>Often fixed hourly rates</td><td>Fixed hourly operating cost</td></tr>
<tr><th scope="row">Availability</th><td>Subject to what is free</td><td>Priority, often with notice period</td><td>Guaranteed within notice terms</td></tr>
<tr><th scope="row">Aircraft choice</th><td>Any aircraft on the market</td><td>Usually a category or fleet</td><td>A specific aircraft type</td></tr>
<tr><th scope="row">Best for</th><td>Up to about 25 hours a year</td><td>About 25 to 100 hours a year</td><td>100 plus hours a year with a stable need</td></tr>
</tbody></table></div>
<p class="note">Hour thresholds are rules of thumb that circulate in the industry, not rules. Always compare the actual terms.</p>
<h2>On-demand charter</h2>
<p>You pay for each trip when you fly. There is no commitment, you pick the best aircraft for each journey and you can compare quotes. The downside is variable pricing and less certainty at peak times. See <a href="~/private-jet-charter/">how charter works</a>.</p>
<h2>Jet card</h2>
<p>You pre-purchase a block of flight hours, typically at set hourly rates by aircraft category, with a guaranteed availability window. Check what is included (repositioning, fuel surcharges, peak-day fees), whether unused funds are refundable and whether the card can be used on other aircraft. Explore the <a href="~/jet-card/">jet card programme</a>.</p>
<h2>Fractional ownership</h2>
<p>You buy a share of an aircraft and receive a proportional number of annual hours. It brings consistency and a managed fleet, but also a multi-year commitment, a purchase cost and a monthly management fee. Selling a share later depends on the market.</p>
<h2>A quick way to decide</h2>
<ol>
<li>Estimate your annual flight hours across everyone who will use the aircraft.</li>
<li>Check how predictable your trips are. Last-minute, one-off needs favour charter.</li>
<li>Price your top three routes on charter, then on a jet card.</li>
<li>Ask each provider for the full terms in writing before you decide.</li>
</ol>`,
  },
  {
    slug: 'how-to-charter-a-private-jet',
    title: 'How to Charter a Private Jet: Step by Step',
    h1: 'How to charter a private jet, step by step',
    description: 'A clear walkthrough of chartering a private jet: request a quote, compare aircraft, confirm and pay, and what happens on the day you fly.',
    photo: 'boardingSun',
    cat: 'How it works',
    mins: 6,
    faq: ['how-fast', 'arrive', 'id', 'payment'],
    related: ['how-much-does-it-cost-to-charter-a-private-jet', 'light-vs-midsize-vs-heavy-jet', 'how-to-choose-a-private-jet-charter-company'],
    body: () => `
<p class="lede">Chartering a private jet takes four steps: tell us where you are going, choose the aircraft, confirm and pay, then arrive at the private terminal and fly. Here is what happens at each stage.</p>
<h2>1. Request a quote</h2>
<p>Share your departure and arrival cities, dates, number of passengers and anything special such as pets, ski gear or catering. The <a href="~/instant-quote/">instant quote</a> form takes about a minute, and an advisor replies with options and firm prices.</p>
<h2>2. Compare aircraft</h2>
<p>Your advisor will usually offer two or three aircraft that fit your group and route. Compare cabin size, baggage space, range, Wi-Fi and price. If you are unsure, read our guide to <a href="~/guides/light-vs-midsize-vs-heavy-jet/">light, midsize and heavy jets</a>.</p>
<h2>3. Confirm and pay</h2>
<p>You will receive a charter agreement that names the operator and the aircraft, and itemises the price, taxes, fees and cancellation terms. Check it, then pay by wire or card as instructed. Provide each passenger's full name as it appears on their photo ID.</p>
<h2>4. Fly</h2>
<ul class="check-list">
<li>Your advisor sends the terminal address, tail number and crew details.</li>
<li>Arrive at the private terminal about 15 minutes before departure. There is no queue.</li>
<li>Your bags are loaded for you, and you board when you are ready.</li>
<li>On arrival, your car or helicopter can meet you at the aircraft.</li>
</ul>
<h2>Questions to ask before you book</h2>
<ul class="check-list">
<li>Who is the operator, and do they hold an FAA Part 135 certificate?</li>
<li>What independent safety audits do they have?</li>
<li>What is included in the price, and what is extra?</li>
<li>What are the change and cancellation terms?</li>
<li>Is there a substitution clause, meaning could the aircraft be swapped?</li>
</ul>`,
  },
  {
    slug: 'private-jet-safety-argus-wyvern-explained',
    title: 'Private Jet Safety: ARGUS, Wyvern and Part 135',
    h1: 'Private jet charter safety: Part 135, ARGUS and Wyvern explained',
    description: 'What FAA Part 135 certification means for charter flights and how independent ARGUS and Wyvern audits help you check an operator before you fly.',
    photo: 'pilotsBack',
    cat: 'Safety',
    mins: 6,
    faq: ['safety', 'broker'],
    related: ['how-to-choose-a-private-jet-charter-company', 'how-to-charter-a-private-jet', 'private-jet-charter-vs-jet-card-vs-fractional'],
    body: () => `
<p class="lede">Every legal charter flight in the United States must be operated by a carrier with an FAA Part 135 air carrier certificate. Independent audits such as ARGUS and Wyvern add a second layer, because they check how the operator actually runs its flights.</p>
<h2>FAA Part 135: the legal minimum</h2>
<p>Part 135 sets operating, maintenance, training and crew requirements for on-demand charter flights. Only the certificate holder, the operator, is entitled to operate the flight. A broker that arranges flights does not operate them. For the exact terms, see our <a href="~/broker-disclosure/">broker disclosure</a>.</p>
<h2>Third-party safety audits</h2>
<p>Many charter customers and corporate flight departments go beyond the legal minimum and ask for an independent audit rating.</p>
<ul class="check-list">
<li><strong>ARGUS</strong> rates operators in tiers based on operational data, safety management and pilot experience. The top tier is Platinum.</li>
<li><strong>Wyvern</strong> audits operators against its own standards and publishes registered operator levels.</li>
<li><strong>IS-BAO</strong> is a safety management standard for business aviation operators.</li>
</ul>
<p>Each organisation publishes its own criteria and a way to verify a rating. Ask for the operator's certificate and rating and check them with the audit provider directly.</p>
<h2>What to check before you fly</h2>
<ol>
<li>The operator's name and Part 135 certificate number.</li>
<li>The tail number of the aircraft assigned to your flight.</li>
<li>Insurance cover and who is named on the policy.</li>
<li>Pilot minimum experience and training standards.</li>
<li>The substitution policy: if the aircraft changes, who approves it?</li>
</ol>
<p>Learn how we apply these checks on our <a href="~/safety/">safety page</a>.</p>`,
  },
  {
    slug: 'light-vs-midsize-vs-heavy-jet',
    title: 'Light vs Midsize vs Heavy Jet: Which to Charter',
    h1: 'Light vs midsize vs heavy jets: which should you charter?',
    description: 'Choose the right aircraft class by passengers, distance, baggage and budget. Compare light, midsize, super-midsize, heavy and long-range jets.',
    photo: 'jetGulfstream',
    cat: 'Aircraft',
    mins: 7,
    faq: ['bags', 'airports', 'wifi'],
    related: ['how-much-does-it-cost-to-charter-a-private-jet', 'how-to-charter-a-private-jet', 'flying-private-with-pets-and-kids'],
    body: () => `
<p class="lede">Pick the smallest aircraft that comfortably fits your passengers, bags and distance. A bigger cabin costs more per hour, but a smaller one may need a fuel stop on long routes.</p>
<div class="table-wrap"><table class="data-table"><thead><tr><th>Aircraft class</th><th>Seats</th><th>Typical hourly rate</th><th>Typical range</th></tr></thead><tbody>${rateRows()}</tbody></table></div>
<h2>Light jets</h2>
<p>${classById.light.blurb} ${classById.light.best}</p>
<h2>Midsize and super-midsize</h2>
<p>${classById.midsize.blurb} ${classById['super-midsize'].blurb} Choose super-midsize for coast-to-coast flights and wide cabins; midsize suits most other domestic trips.</p>
<h2>Heavy and ultra-long-range</h2>
<p>${classById.heavy.blurb} ${classById['ultra-long-range'].blurb}</p>
<h2>Turboprops</h2>
<p>${classById.turboprop.blurb} ${classById.turboprop.best}</p>
<h2>Four questions to settle it</h2>
<ol>
<li><strong>How many people?</strong> Number of seats is the first filter, but leave room for comfort.</li>
<li><strong>How far?</strong> Add up the longest leg and add a margin for headwinds.</li>
<li><strong>How much baggage?</strong> Skis, golf clubs and big cases need hold space.</li>
<li><strong>Which airports?</strong> Short runways and high-elevation airports limit larger aircraft.</li>
</ol>
<p>See each class in detail on the <a href="~/fleet/">fleet pages</a>.</p>`,
  },
  {
    slug: 'flying-private-with-pets-and-kids',
    title: 'Flying Private with Pets and Kids: What to Know',
    h1: 'Flying private with pets and children: what to know',
    description: 'Practical advice for private jet charter with dogs, cats and young children: policies, documents, cabin planning and questions to ask your advisor.',
    photo: 'familyChild',
    cat: 'Planning',
    mins: 5,
    faq: ['pets', 'bags', 'arrive'],
    related: ['how-to-charter-a-private-jet', 'light-vs-midsize-vs-heavy-jet', 'how-much-does-it-cost-to-charter-a-private-jet'],
    body: () => `
<p class="lede">Private charter is popular with families and pet owners because there are no airline queues, cargo holds or tight gates. A little planning ahead makes the day smoother.</p>
<h2>Flying with pets</h2>
<ul class="check-list">
<li><strong>Policies vary by operator.</strong> Many allow dogs and cats in the cabin, often at no extra charge, but some limit size or breed.</li>
<li><strong>Tell your advisor early.</strong> Mention the species, size and breed when you request a quote so the right aircraft and operator are matched.</li>
<li><strong>Bring documents.</strong> Health certificates and vaccination records are essential for many destinations, especially international flights.</li>
<li><strong>Plan the cabin.</strong> Bring a carrier or bed, a familiar blanket and water. Ask whether a seat can be reserved for the animal.</li>
</ul>
<h2>Flying with children</h2>
<ul class="check-list">
<li><strong>Car seats.</strong> Rules for child restraints on charter aircraft vary. Ask the operator what is approved and bring your own approved seat if allowed.</li>
<li><strong>Schedule.</strong> Without airport queues, you can time departure around naps and meals.</li>
<li><strong>Catering.</strong> Ask for snacks and meals your children actually eat.</li>
<li><strong>Entertainment.</strong> Not all aircraft have screens, so load devices and downloads in advance.</li>
</ul>
<h2>Questions to ask before booking</h2>
<ol>
<li>Does the operator allow my pet, and are there size or breed restrictions?</li>
<li>Which child seats are permitted on this aircraft?</li>
<li>Can we bring strollers, bikes or extra bags?</li>
<li>What is the Wi-Fi situation on this specific aircraft?</li>
</ol>
<p>Our <a href="~/concierge/">concierge team</a> can arrange catering, car seats in your car and pet-friendly ground transport.</p>`,
  },
  {
    slug: 'how-to-choose-a-private-jet-charter-company',
    title: 'How to Choose a Private Jet Charter Company',
    h1: 'How to choose a private jet charter company',
    description: 'A practical checklist for comparing private jet charter companies: operator versus broker, safety audits, pricing transparency, availability and service.',
    photo: 'handshake',
    cat: 'Buying guide',
    mins: 6,
    faq: ['broker', 'safety', 'cancel'],
    related: ['private-jet-safety-argus-wyvern-explained', 'private-jet-charter-vs-jet-card-vs-fractional', 'how-much-does-it-cost-to-charter-a-private-jet'],
    body: () => `
<p class="lede">The best charter company for you is the one that is clear about who operates your flight, is transparent about price, and can fly you when you need it. Use this checklist to compare providers side by side.</p>
<h2>1. Operator or broker?</h2>
<p>An operator owns or manages aircraft and holds the FAA Part 135 certificate. A broker arranges flights on operators' aircraft and does not operate them. Neither is automatically better: brokers can search widely, and operators control their own fleet. What matters is that they tell you which they are.</p>
<h2>2. Safety credentials</h2>
<p>Ask for the Part 135 operator's name and certificate, plus any ARGUS, Wyvern or IS-BAO ratings. See <a href="~/guides/private-jet-safety-argus-wyvern-explained/">our safety explainer</a> for what each means.</p>
<h2>3. Price transparency</h2>
<ul class="check-list">
<li>Is the quote itemised: flight time, fees, taxes, extras?</li>
<li>Are cancellation and change terms clear before you pay?</li>
<li>Does the price include a possible aircraft substitution policy?</li>
</ul>
<h2>4. Availability and reach</h2>
<p>Ask how large the network of aircraft is, and how quickly they can find alternatives if the first choice falls through. For regular flyers, a <a href="~/jet-card/">jet card</a> or membership may add priority.</p>
<h2>5. Service when things go wrong</h2>
<p>Weather, maintenance and air traffic can all disrupt a flight. Good providers have a 24/7 flight desk and a clear process for rebooking.</p>
<h2>A short scorecard</h2>
<div class="table-wrap"><table class="data-table"><thead><tr><th>Check</th><th>What good looks like</th></tr></thead><tbody>
<tr><th scope="row">Who flies me?</th><td>Operator and certificate named on the quote</td></tr>
<tr><th scope="row">Safety</th><td>Independent audit ratings you can verify</td></tr>
<tr><th scope="row">Price</th><td>Itemised, with taxes and fees shown</td></tr>
<tr><th scope="row">Terms</th><td>Cancellation and substitution policy in writing</td></tr>
<tr><th scope="row">Support</th><td>Named advisor and a 24/7 contact</td></tr>
</tbody></table></div>`,
  },
];

const bySlug = Object.fromEntries(posts.map((p) => [p.slug, p]));
module.exports = { posts, bySlug };
