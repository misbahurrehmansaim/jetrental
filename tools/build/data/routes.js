'use strict';
/**
 * 20 route pages. Distances, times and prices are COMPUTED at build time from airports.js and fleet.js,
 * so only the editorial (unique) copy lives here. Keep each `note` factual and specific to the route.
 */
const { byCode } = require('./airports');
const { classes } = require('./fleet');
const { estimate, recommend } = require('../lib/estimate');
const { slug } = require('../lib/util');

const raw = [
  {
    from: 'TEB', to: 'OPF', typicalPax: 6,
    note: 'The busiest winter corridor in private aviation. Teterboro sits about 12 miles from midtown Manhattan, and Opa-locka is the quick-access executive airport in north Miami-Dade, which usually saves time over the commercial terminals.',
    bestFor: 'Weekend escapes, family trips and same-day business in South Florida.',
    season: 'Peak demand runs roughly December through April and around holiday weekends, so ask for aircraft early.',
    tips: ['Both ends are dedicated business-aviation airports with short ground times.', 'Ask about Palm Beach as an alternative if your final destination is north of Miami.'],
  },
  {
    from: 'TEB', to: 'PBI', typicalPax: 6,
    note: 'A classic winter shuttle between the New York area and Palm Beach. Palm Beach International has private terminals on the airfield, so you skip the main concourse entirely.',
    bestFor: 'Winter homes, golf trips and holiday travel from the tri-state area.',
    season: 'Busiest from late autumn through spring; Thanksgiving and the December holidays book out first.',
    tips: ['Flight time is short enough for a light jet to be the most economical choice.', 'Return trips on Sunday evenings are the most in-demand legs.'],
  },
  {
    from: 'TEB', to: 'VNY', typicalPax: 6,
    note: 'Coast to coast in a single non-stop flight, from Teterboro to Van Nuys, one of the largest general-aviation airports in the world and close to the west side of Los Angeles and the San Fernando Valley.',
    bestFor: 'Executive teams, entertainment-industry travel and anyone who needs a full workday on board.',
    season: 'Steady all year; film and awards seasons and major conferences create spikes.',
    tips: ['Choose a super-midsize or larger cabin for comfortable non-stop range.', 'Westbound flights are usually quicker to book than eastbound red-eyes.'],
  },
  {
    from: 'TEB', to: 'ASE', min: 'midsize', typicalPax: 6,
    note: 'Aspen/Pitkin County is a high-elevation mountain airport with operating restrictions, and aircraft performance matters in warm weather and at full loads. Eagle County (Vail) is a common alternative when conditions or restrictions bite.',
    bestFor: 'Ski season, summer festivals and mountain-home weekends.',
    season: 'Winter holidays and peak ski weeks are the busiest; summer weekends are the second peak.',
    tips: ['Ask your advisor to confirm the aircraft type is approved and performs at Aspen with your passenger and bag count.', 'Plan for possible weather diversions to Eagle or Rifle.'],
  },
  {
    from: 'TEB', to: 'HTO', typicalPax: 4,
    note: 'Under an hour in the air from the New York area to the East End of Long Island. East Hampton Airport operates under local noise and access rules, so confirm current requirements before you book.',
    bestFor: 'Summer weekends and Friday-afternoon getaways when the road traffic is at its worst.',
    season: 'Summer, especially Memorial Day to Labor Day weekends.',
    tips: ['A turboprop or light jet is usually the right size for this hop.', 'Check access rules and ask about nearby alternative airports if slots are tight.'],
  },
  {
    from: 'TEB', to: 'BED', typicalPax: 4,
    note: 'Hanscom Field in Bedford, Massachusetts is the main business-aviation airport for Boston, roughly 15 miles northwest of downtown, with far shorter processing than the commercial terminals.',
    bestFor: 'Same-day business between New York and Boston, university visits and sports weekends.',
    season: 'Year-round, with extra demand around graduation and major sports events.',
    tips: ['Same-day round trips are practical on a light jet.', 'Allow for winter weather delays on the Northeast corridor.'],
  },
  {
    from: 'BED', to: 'ACK', typicalPax: 4,
    note: 'Nantucket Memorial Airport is a busy summer destination with limited ramp space, so timing and parking matter. The flight itself is under an hour.',
    bestFor: 'Summer weekends on the island and quick business trips from Boston.',
    season: 'Peak summer weekends are crowded. Book early and be flexible by an hour or two if you can.',
    tips: ['Ask about parking and overnight ramp options when you request your quote.', 'A turboprop can be the most cost-effective for this short hop.'],
  },
  {
    from: 'VNY', to: 'LAS', typicalPax: 6,
    note: 'One of the highest-frequency leisure routes in the West. A flight of about an hour takes you from Van Nuys to the private-aviation facilities at Harry Reid International, so you step out close to the Strip.',
    bestFor: 'Weekend trips, conventions, concerts and sporting events.',
    season: 'Friday and Sunday are busiest; major conventions and fight weekends sell out aircraft.',
    tips: ['Turboprops and light jets are the most economical choices for a trip this short.', 'Book return legs together to avoid one-way pricing.'],
  },
  {
    from: 'VNY', to: 'SFO', typicalPax: 4,
    note: 'California\'s classic business shuttle. San Francisco International has private-aviation facilities, and the Bay Area also has other business airports your advisor can compare for ground-time savings.',
    bestFor: 'Day trips between Los Angeles and the Bay Area, and investor or board meetings.',
    season: 'Year-round, with Monday-morning and Thursday-evening peaks.',
    tips: ['Ask for the airport closest to your final meeting, not just the largest one.', 'A light or midsize jet handles the route comfortably.'],
  },
  {
    from: 'VNY', to: 'ASE', min: 'midsize', typicalPax: 6,
    note: 'West-coast skiers and summer festival-goers take this route to Aspen. Mountain-airport restrictions and high elevation apply, so aircraft choice and passenger and baggage weight matter.',
    bestFor: 'Ski holidays, summer festivals and second-home owners.',
    season: 'Winter holidays and peak ski weeks, then summer weekends.',
    tips: ['Confirm approval and performance for Aspen before you confirm the aircraft.', 'Pack skis and golf bags in advance so your advisor can size the baggage hold.'],
  },
  {
    from: 'VNY', to: 'SJD', min: 'midsize', typicalPax: 6,
    note: 'An international trip to Los Cabos, which means passports, customs and immigration clearance at both ends, and a slightly different fee structure to a domestic flight.',
    bestFor: 'Beach holidays, fishing trips and group celebrations.',
    season: 'Winter and spring break are busiest; summer is hot and quieter.',
    tips: ['Passengers need valid passports; your advisor will handle the manifest.', 'A midsize cabin is comfortable for the roughly 2.5-hour flight.'],
  },
  {
    from: 'PWK', to: 'ASE', min: 'midsize', typicalPax: 6,
    note: 'Chicago Executive in the northwest suburbs is a convenient departure point for Aspen. High-altitude mountain operations apply at the destination.',
    bestFor: 'Ski weeks, summer trips and family getaways from the Midwest.',
    season: 'Christmas and New Year, President\'s Day week and spring break.',
    tips: ['A midsize or larger jet is a good fit for passengers plus ski gear.', 'Ask about flexible departure times if weather is expected at either end.'],
  },
  {
    from: 'PWK', to: 'TEB', typicalPax: 4,
    note: 'A fast business route between the Midwest and the New York area. Chicago Executive is closer than O\'Hare for many suburban travellers.',
    bestFor: 'Executive travel, board meetings and day trips.',
    season: 'Year-round, with winter weather the main variable.',
    tips: ['A light or midsize jet is the usual choice.', 'Ask about same-day round trips for meeting-heavy days.'],
  },
  {
    from: 'DAL', to: 'ASE', min: 'midsize', typicalPax: 6,
    note: 'Dallas Love Field is only a few miles from downtown, which makes this one of the quickest ways to reach the Colorado mountains from Texas.',
    bestFor: 'Ski weekends, summer escapes and client entertaining.',
    season: 'December through March, then summer weekends.',
    tips: ['Confirm mountain-airport approval for the aircraft before booking.', 'Group trips often fit in a midsize or super-midsize cabin.'],
  },
  {
    from: 'DAL', to: 'VNY', typicalPax: 6,
    note: 'Dallas Love Field to Van Nuys is a well-travelled route for business and entertainment travellers moving between Texas and California.',
    bestFor: 'Business teams, film and music industry travel and sports travel.',
    season: 'Year-round.',
    tips: ['A midsize jet is typically comfortable at this distance.', 'Ask whether a nearby airport would be quicker for your final destination.'],
  },
  {
    from: 'HOU', to: 'ASE', min: 'midsize', typicalPax: 6,
    note: 'From Houston Hobby, a short drive from many southeast Houston addresses, to the Roaring Fork Valley. Aspen\'s high-elevation airport carries operating limits that your advisor will check.',
    bestFor: 'Winter holidays and Texas families with second homes in Aspen.',
    season: 'Holiday weeks and spring break.',
    tips: ['Confirm approval and weight limits before you pick the aircraft.', 'Consider Eagle County if Aspen has weather or curfew limits.'],
  },
  {
    from: 'PDK', to: 'PBI', typicalPax: 6,
    note: 'DeKalb-Peachtree is the main business-aviation airport for Atlanta, and Palm Beach is one of the top winter destinations in the Southeast. The flight is well under two hours.',
    bestFor: 'Winter weekends, golf trips and business meetings in Palm Beach County.',
    season: 'Peak demand December through April.',
    tips: ['A light jet is the economical choice for four to six passengers.', 'Ask about Fort Lauderdale or Miami executive airports if your plans change.'],
  },
  {
    from: 'OPF', to: 'NAS', typicalPax: 6,
    note: 'An international hop of roughly 40 minutes to Nassau, with customs and immigration clearance on arrival and again on return. Fees differ from a domestic flight.',
    bestFor: 'Resort weekends, boating trips and quick escapes from South Florida.',
    season: 'Winter and spring; hurricane season (June to November) can affect schedules.',
    tips: ['Everyone needs a valid passport and the right entry documents.', 'A turboprop or light jet is usually the best size for this route.'],
  },
  {
    from: 'IAD', to: 'PBI', typicalPax: 6,
    note: 'Washington Dulles has private-aviation facilities on the airfield, and the flight to Palm Beach takes about two hours. Dulles is a good fit for northern Virginia and Capitol-area travellers.',
    bestFor: 'Government and corporate travel, winter getaways and golf.',
    season: 'Winter and spring; the Washington political calendar drives business demand.',
    tips: ['A midsize jet gives comfortable range and cabin space.', 'Ask about Reagan National access rules if you want a closer-in airport.'],
  },
  {
    from: 'SFO', to: 'JAC', min: 'midsize', typicalPax: 6,
    note: 'Jackson Hole Airport lies inside Grand Teton National Park, so noise and operating rules are strict and slots are limited in peak weeks. The flight from the Bay Area takes under two hours.',
    bestFor: 'Ski trips, summer national-park visits and mountain weddings.',
    season: 'Winter holidays and peak summer months.',
    tips: ['Book early for holiday weeks.', 'Ask your advisor about alternates such as Idaho Falls or Driggs if Jackson is constrained.'],
  },
];

const photoMap = {
  'new-york-to-miami': ['miami', 'newyork'],
  'new-york-to-palm-beach': ['palmBeach', 'newyorkDusk'],
  'new-york-to-los-angeles': ['losangeles', 'newyork'],
  'new-york-to-aspen': ['aspen', 'newyorkDusk'],
  'new-york-to-the-hamptons': ['hamptons', 'newyorkBridge'],
  'new-york-to-boston': ['boston', 'newyork'],
  'boston-to-nantucket': ['nantucket', 'boston'],
  'los-angeles-to-las-vegas': ['lasvegas', 'losangelesDay'],
  'los-angeles-to-san-francisco': ['sanfrancisco', 'losangeles'],
  'los-angeles-to-aspen': ['aspenAutumn', 'losangelesDay'],
  'los-angeles-to-los-cabos': ['loscabos', 'losangeles'],
  'chicago-to-aspen': ['aspenSnow', 'chicago'],
  'chicago-to-new-york': ['newyorkBridge', 'chicagoAerial'],
  'dallas-to-aspen': ['ski', 'dallas'],
  'dallas-to-los-angeles': ['losangelesDay', 'dallas'],
  'houston-to-aspen': ['jetSnowMountains', 'houston'],
  'atlanta-to-palm-beach': ['palmBeach2', 'atlanta'],
  'miami-to-nassau': ['nassau', 'miamiBeach'],
  'washington-dc-to-palm-beach': ['washington', 'palmBeach2'],
  'san-francisco-to-jackson-hole': ['jackson', 'sanfrancisco'],
};

const routes = raw.map((r) => {
  const a = byCode[r.from];
  const b = byCode[r.to];
  const slugStr = `${slug(a.city)}-to-${slug(b.city)}`;
  const miles0 = estimate(a, b, classes[1]).miles;
  let cls = recommend(classes, miles0, r.typicalPax);
  if (r.min) {
    const order = ['turboprop', 'light', 'midsize', 'super-midsize', 'heavy', 'ultra-long-range'];
    if (order.indexOf(cls.id) < order.indexOf(r.min)) cls = classes.find((c) => c.id === r.min);
  }
  const byClass = classes.map((c) => ({ cls: c, ...estimate(a, b, c) }));
  const [photo, photoFrom] = photoMap[slugStr] || ['jetLine', 'jetLine'];
  return { ...r, photo, photoFrom, a, b, slug: slugStr, label: `${a.city} to ${b.city}`, rec: cls, recEst: estimate(a, b, cls), byClass, miles: byClass[0].miles };
});

module.exports = { routes, routeBySlug: Object.fromEntries(routes.map((r) => [r.slug, r])) };
