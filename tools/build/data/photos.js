'use strict';
/**
 * PHOTO CATALOGUE
 * Every image on the site comes from here. All photos are from Pexels (https://www.pexels.com),
 * which allows free commercial use without attribution (see the Pexels licence).
 * Each entry: id (Pexels photo id), r (width / height), c (average colour, used as a placeholder),
 * alt (descriptive alt text), pos (optional CSS object-position focal point).
 *
 * To use your own photography: drop files in assets/img/photos/ named <key>-<width>.jpg
 * (e.g. hero-ground-1600.jpg) or run `npm run images` to download and optimise these ones locally.
 * Photos are representative stock images; replace with the client's own aircraft and team photos before launch.
 */
const P = {
  // ---------- Hero and sky ----------
  heroGround: { id: 28772726, r: 1.5, c: '#606771', alt: 'Private jet on the apron at sunset with the sun on the horizon behind the nose', pos: '50% 62%' },
  heroSky: { id: 29442877, r: 1.5, c: '#5a4e50', alt: 'Sunset glowing over a layer of clouds seen from altitude' },
  skyPink: { id: 5668040, r: 1.5, c: '#99a4b8', alt: 'Soft pink clouds at dusk above the cloud layer' },
  wingDusk: { id: 14482714, r: 0.75, c: '#f2ab7f', alt: 'Aircraft wing over clouds at sunset' },
  wingPink: { id: 8691356, r: 0.75, c: '#5e546d', alt: 'Aircraft wing against a pink dusk sky' },
  nightCity: { id: 732142, r: 2.22, c: '#52656c', alt: 'Night long exposure of a city and an airport with light trails from aircraft' },
  runwayNight: { id: 12463499, r: 0.667, c: '#24373d', alt: 'Quiet airport runway at night lit by green and blue lights' },
  cockpitNight: { id: 12463498, r: 1.5, c: '#11080d', alt: 'Aircraft cockpit instruments lit at night' },

  // ---------- Aircraft ----------
  jetSunsetPortrait: { id: 33081324, r: 0.75, c: '#8e5f33', alt: 'Private jet on the tarmac in warm sunset light', pos: '50% 55%' },
  jetWetTarmac: { id: 12820604, r: 0.5625, c: '#e0945a', alt: 'Business jet on a wet tarmac under a dramatic sky', pos: '50% 60%' },
  jetLight: { id: 35636050, r: 1.5, c: '#876f6b', alt: 'Light private jet parked on the ramp at dusk' },
  jetSnowNose: { id: 35636053, r: 1.5, c: '#293450', alt: 'Close view of a private jet nose and landing gear on a snowy ramp' },
  jetSnow: { id: 35636052, r: 1.416, c: '#4c7fb4', alt: 'Private jet covered in snow parked on a winter airfield' },
  jetSnowMountains: { id: 8063450, r: 1.5, c: '#77808f', alt: 'Private jet taxiing on a snowy runway with mountains behind' },
  jetStairsSnow: { id: 20562287, r: 0.75, c: '#f0f5fb', alt: 'Private jet with its airstair door open on a snowy runway' },
  turboprop: { id: 18340232, r: 1.742, c: '#395b74', alt: 'Pilatus PC-12 turboprop parked on a runway at sunset' },
  jetGulfstream: { id: 12366198, r: 1.5, c: '#e0eaf6', alt: 'Large-cabin private jet parked on an airport apron' },
  jetInFlight: { id: 28281980, r: 1.5, c: '#6d6147', alt: 'Long-range private jet on approach with landing gear down' },
  jetApproach: { id: 37748845, r: 1.5, c: '#817c79', alt: 'Super-midsize business jet on final approach' },
  jetRear: { id: 39970626, r: 1.707, c: '#98b8c7', alt: 'Private jet seen from behind with landing gear extended against a blue sky' },
  jetFalcon: { id: 36093856, r: 1.5, c: '#b9b0b1', alt: 'Three-engine long-range business jet parked on the ramp under blue sky' },
  jetRunwayA: { id: 19766183, r: 1.5, c: '#ebe9ee', alt: 'Private jet rolling along an airport runway' },
  jetRunwayB: { id: 37304250, r: 1.5, c: '#94979e', alt: 'Private jet touching down on a runway' },
  jetRunwayC: { id: 28321097, r: 1.5, c: '#a4a2a5', alt: 'Private jet landing with city buildings in the background' },
  boarding: { id: 7355143, r: 0.75, c: '#1d1311', alt: 'Passenger boarding a private jet from the ramp' },
  boardingSun: { id: 19083887, r: 1.5, c: '#626262', alt: 'Traveller with a backpack walking toward a private jet on the apron' },
  jetDoorOpen: { id: 15953920, r: 1.507, c: '#a7a8a3', alt: 'Private jet with the cabin door and airstair open on the airport ramp' },
  exitJet: { id: 38335289, r: 0.667, c: '#e7e7e7', alt: 'Businessman in a suit stepping out of a private jet under blue sky' },
  smallPlane: { id: 11022592, r: 1.778, c: '#87889a', alt: 'Small private aircraft flying through a cloudy golden sky' },
  jetLine: { id: 2245279, r: 1.488, c: '#eaeceb', alt: 'Row of private jets parked on an airport apron under clear sky' },
  jetsDramatic: { id: 236070, r: 1.488, c: '#eacaa3', alt: 'Line of private jets parked on the tarmac under a dramatic sky' },
  hangar: { id: 36719803, r: 0.667, c: '#2c2e29', alt: 'Private jet in front of an aircraft hangar' },

  // ---------- Cabins and onboard ----------
  cabinEmpty1: { id: 20562279, r: 1.333, c: '#7d7165', alt: 'Private jet cabin with cream leather seats and wood trim' },
  cabinEmpty2: { id: 20562278, r: 1.333, c: '#795a48', alt: 'Luxurious private jet interior with club seating and polished wood' },
  cabinEmpty3: { id: 14914173, r: 0.75, c: '#1c130c', alt: 'Elegant private jet cabin with beige leather seats' },
  cabinEmpty4: { id: 14914172, r: 0.75, c: '#5d4835', alt: 'Private jet cabin seen from the aisle with leather club chairs' },
  cabinChampagne: { id: 5778470, r: 1.5, c: '#cab095', alt: 'Two passengers enjoying champagne in a private jet cabin' },
  cabinService: { id: 5778703, r: 1.5, c: '#d4ccb9', alt: 'Cabin attendant serving passengers in a private jet' },
  cabinCouple: { id: 15713593, r: 1.5, c: '#b6a9a1', alt: 'Couple enjoying wine in a private jet cabin' },
  cabinWindow: { id: 30462809, r: 0.667, c: '#b5938a', alt: 'Passenger in a suit looking out of a private jet window', pos: '50% 35%' },
  cabinWindow2: { id: 30462811, r: 0.667, c: '#6c523b', alt: 'Relaxed businessman seated by a private jet window', pos: '50% 35%' },
  cabinToast: { id: 5778712, r: 1.5, c: '#d5c7a2', alt: 'Woman with champagne and grapes on a private jet' },
  cabinTablet: { id: 5778553, r: 0.667, c: '#ada9a6', alt: 'Woman working on a tablet with coffee on a private jet', pos: '50% 30%' },
  cabinWorking: { id: 5778226, r: 1.5, c: '#ada99e', alt: 'Executive reading a newspaper in a private jet cabin' },
  cabinCouple2: { id: 35517954, r: 0.75, c: '#5b4c45', alt: 'Couple holding hands inside a luxurious private jet' },
  cabinServe: { id: 5778610, r: 0.667, c: '#baa496', alt: 'Flight attendant pouring drinks for passengers on a private jet', pos: '50% 35%' },
  cabinGroup: { id: 5778660, r: 1.5, c: '#784c33', alt: 'Group of passengers celebrating with champagne on a private jet' },
  cabinFriends: { id: 5778673, r: 1.5, c: '#766150', alt: 'Friends celebrating around a table in a private jet cabin' },

  // ---------- People and lifestyle ----------
  familyChild: { id: 37669246, r: 1.333, c: '#a6a2a3', alt: 'Father and child holding hands and looking at an aircraft' },
  familyLuggage: { id: 31711206, r: 1.5, c: '#b1afb2', alt: 'Mother and daughter walking with luggage outside an airport terminal' },
  petTravel: { id: 29093611, r: 1.5, c: '#6a5949', alt: 'Traveller with a suitcase and a dog on a sunny day' },
  chauffeur: { id: 7594130, r: 0.667, c: '#9b9798', alt: 'Chauffeur in a black suit beside a luxury black car', pos: '50% 30%' },
  carDoor: { id: 15774577, r: 1.5, c: '#a1a3af', alt: 'Chauffeur opening the door of a black car' },
  catering: { id: 15671273, r: 1.5, c: '#86612c', alt: 'Chef plating gourmet appetizers' },
  cateringTray: { id: 34321369, r: 1.5, c: '#b4a07f', alt: 'Elegant catering presentation with gourmet canapes' },
  helicopterInterior: { id: 17508699, r: 1.778, c: '#51423b', alt: 'Luxury helicopter interior with tan leather seats' },
  helicopterPad: { id: 31696154, r: 1.5, c: '#779bbd', alt: 'Helicopter on a landscaped helipad' },
  stadium: { id: 30651230, r: 1.333, c: '#789590', alt: 'Packed stadium under floodlights at night' },
  concert: { id: 4218027, r: 1.5, c: '#b07879', alt: 'Live music concert with lights and a cheering crowd' },
  golf: { id: 35918463, r: 0.712, c: '#494329', alt: 'Golf course green with a yellow flag at sunrise' },
  ski: { id: 30114126, r: 1.333, c: '#538391', alt: 'Skiers on a snowy mountain slope' },
  boardroom: { id: 7433840, r: 1.5, c: '#c3ada2', alt: 'Business professionals discussing documents around a meeting table' },
  boardroom2: { id: 6949494, r: 1.5, c: '#452f24', alt: 'Senior executives in a strategy meeting' },
  handshake: { id: 33175650, r: 1.5, c: '#d49b7d', alt: 'Two businessmen shaking hands' },
  yacht: { id: 37372235, r: 0.667, c: '#3f5260', alt: 'Luxury yacht cruising on calm water' },

  // ---------- Safety, crew and support ----------
  pilotsBack: { id: 4269510, r: 1.778, c: '#302f3f', alt: 'Two pilots in uniform in the cockpit seen from behind' },
  pilotsCockpit: { id: 2064123, r: 1.333, c: '#3a2b32', alt: 'Two pilots running through checks in a modern cockpit' },
  pilotsFocus: { id: 14186727, r: 1.5, c: '#41464c', alt: 'Two pilots managing the cockpit controls' },
  maintenance: { id: 37627542, r: 0.75, c: '#232124', alt: 'Aircraft engine and fuselage during maintenance in a hangar' },
  cockpitModern: { id: 19101602, r: 0.965, c: '#585453', alt: 'Detailed view of a modern aircraft cockpit' },
  support: { id: 7709255, r: 1.5, c: '#ebc8b2', alt: 'Customer service representative wearing a headset and smiling' },
  supportTeam: { id: 8867405, r: 1.5, c: '#ced4e4', alt: 'Group of customer service representatives with headsets' },
  lounge: { id: 10152891, r: 0.75, c: '#7b7261', alt: 'Contemporary airport lounge with sleek seating' },
  terminal: { id: 39538658, r: 0.75, c: '#40260f', alt: 'Spacious airport terminal with warm lighting and seating' },

  // ---------- Destinations ----------
  newyork: { id: 12327112, r: 1.594, c: '#d9e4ea', alt: 'New York City skyline across the Hudson River in daylight' },
  newyorkBridge: { id: 9404571, r: 0.667, c: '#6f7983', alt: 'Brooklyn Bridge with the Manhattan skyline' },
  newyorkDusk: { id: 8569166, r: 1.5, c: '#f6ca89', alt: 'Silhouette of the New York City skyline against a golden sunset' },
  miami: { id: 8574669, r: 1.5, c: '#b19788', alt: 'Aerial view of Miami Beach with the skyline and ocean' },
  miamiBeach: { id: 946689, r: 1.778, c: '#5c93bc', alt: 'Miami beach scene with the city skyline behind' },
  palmBeach: { id: 10408472, r: 0.667, c: '#bc9c8f', alt: 'Palm-tree-lined street at sunset in Palm Beach, Florida' },
  palmBeach2: { id: 33837662, r: 0.75, c: '#a48a7d', alt: 'Palm trees silhouetted against a glowing Florida sunset' },
  aspen: { id: 35210304, r: 1.5, c: '#d4dbe3', alt: 'Maroon Bells peaks near Aspen, Colorado, dusted with early snow' },
  aspenSnow: { id: 36560214, r: 0.667, c: '#203c52', alt: 'Snow-covered mountain range in Colorado' },
  aspenAutumn: { id: 35540029, r: 1.778, c: '#8c4823', alt: 'Aerial view of golden autumn aspen trees in Colorado' },
  hamptons: { id: 18295122, r: 0.667, c: '#cabbb8', alt: 'Quiet sandy beach on the East End of Long Island' },
  hamptonsSunset: { id: 28126058, r: 1.5, c: '#e1d3c8', alt: 'Sunset over a calm Long Island beach' },
  boston: { id: 21314036, r: 1.5, c: '#86ecfa', alt: 'Boston skyline with the John Hancock Tower under a blue sky' },
  nantucket: { id: 17641817, r: 0.75, c: '#696e68', alt: 'Waterfront houses and pier at dusk in Nantucket, Massachusetts' },
  lasvegas: { id: 36015098, r: 1.494, c: '#0f0832', alt: 'Neon lights and traffic trails on the Las Vegas Strip at night' },
  losangeles: { id: 35291216, r: 1.5, c: '#44424d', alt: 'Downtown Los Angeles skyline at night with light trails' },
  losangelesDay: { id: 35673253, r: 0.773, c: '#85856b', alt: 'Panoramic view of the Los Angeles skyline from Griffith Park' },
  sanfrancisco: { id: 8821401, r: 1.778, c: '#d8cabf', alt: 'Golden Gate Bridge over teal water in San Francisco' },
  loscabos: { id: 22912077, r: 1.778, c: '#2e9fa7', alt: 'Aerial view of the Cabo San Lucas Arch and turquoise sea' },
  loscabos2: { id: 18903765, r: 1.333, c: '#76baeb', alt: 'Rock formations and arch at Cabo San Lucas' },
  chicago: { id: 25811914, r: 1.78, c: '#4c5662', alt: 'Chicago skyline from Lake Michigan under a blue sky' },
  chicagoAerial: { id: 7156480, r: 1.5, c: '#3c413d', alt: 'Aerial view of the Chicago skyline and high-rise buildings' },
  dallas: { id: 13250722, r: 1.778, c: '#727f76', alt: 'Aerial view of the Dallas skyline in daylight' },
  houston: { id: 15353653, r: 1.778, c: '#66575a', alt: 'Illuminated downtown Houston at dusk from above' },
  atlanta: { id: 33133738, r: 1.78, c: '#5f5e5c', alt: 'Aerial view of the Atlanta skyline under a blue sky' },
  nassau: { id: 913100, r: 1.333, c: '#0188c8', alt: 'Aerial view of Nassau, Bahamas, with turquoise water' },
  nassauCoast: { id: 9400986, r: 1.5, c: '#2f3215', alt: 'Aerial view of the Nassau coastline with resort buildings' },
  washington: { id: 6580465, r: 0.667, c: '#7c858e', alt: 'US Capitol dome under a clear blue sky in Washington, DC' },
  jackson: { id: 31317377, r: 1.5, c: '#2c4f77', alt: 'Grand Teton mountain range above pine forest near Jackson Hole' },
  jackson2: { id: 30020598, r: 0.75, c: '#afaa94', alt: 'Jagged peaks of the Grand Teton range' },
};

const keys = Object.keys(P);
module.exports = { P, keys };
