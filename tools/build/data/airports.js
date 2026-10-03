'use strict';
/**
 * Private-aviation-friendly airports used by the estimator, route pages and map.
 * Coordinates are approximate field locations (decimal degrees).
 * `intl: true` marks airports outside the contiguous US (no map dot, no US excise tax in the estimator).
 * `us: false` keeps them out of the map.
 */
const airports = [
  { code: 'TEB', city: 'New York', name: 'Teterboro Airport', lat: 40.8501, lon: -74.0608, region: 'NJ', hub: true },
  { code: 'HPN', city: 'Westchester', name: 'Westchester County Airport', lat: 41.067, lon: -73.7076, region: 'NY' },
  { code: 'HTO', city: 'The Hamptons', name: 'East Hampton Airport', lat: 40.9596, lon: -72.2518, region: 'NY' },
  { code: 'ACK', city: 'Nantucket', name: 'Nantucket Memorial Airport', lat: 41.2531, lon: -70.0602, region: 'MA' },
  { code: 'BED', city: 'Boston', name: 'Hanscom Field', lat: 42.47, lon: -71.289, region: 'MA', hub: true },
  { code: 'IAD', city: 'Washington, DC', name: 'Washington Dulles International', lat: 38.9445, lon: -77.4558, region: 'VA' },
  { code: 'PDK', city: 'Atlanta', name: 'DeKalb-Peachtree Airport', lat: 33.8756, lon: -84.302, region: 'GA', hub: true },
  { code: 'BNA', city: 'Nashville', name: 'Nashville International', lat: 36.1245, lon: -86.6782, region: 'TN' },
  { code: 'PBI', city: 'Palm Beach', name: 'Palm Beach International', lat: 26.6832, lon: -80.0956, region: 'FL', hub: true },
  { code: 'OPF', city: 'Miami', name: 'Opa-locka Executive Airport', lat: 25.907, lon: -80.2784, region: 'FL', hub: true },
  { code: 'APF', city: 'Naples', name: 'Naples Airport', lat: 26.1526, lon: -81.7753, region: 'FL' },
  { code: 'NAS', city: 'Nassau', name: 'Lynden Pindling International', lat: 25.039, lon: -77.4662, region: 'Bahamas', intl: true },
  { code: 'CUN', city: 'Cancun', name: 'Cancun International', lat: 21.0365, lon: -86.8771, region: 'Mexico', intl: true },
  { code: 'SJD', city: 'Los Cabos', name: 'Los Cabos International', lat: 23.1518, lon: -109.7211, region: 'Mexico', intl: true },
  { code: 'PWK', city: 'Chicago', name: 'Chicago Executive Airport', lat: 42.1142, lon: -87.9015, region: 'IL', hub: true },
  { code: 'DAL', city: 'Dallas', name: 'Dallas Love Field', lat: 32.8471, lon: -96.8518, region: 'TX', hub: true },
  { code: 'HOU', city: 'Houston', name: 'William P. Hobby Airport', lat: 29.6454, lon: -95.2789, region: 'TX' },
  { code: 'APA', city: 'Denver', name: 'Centennial Airport', lat: 39.5701, lon: -104.8493, region: 'CO' },
  { code: 'ASE', city: 'Aspen', name: 'Aspen/Pitkin County Airport', lat: 39.2232, lon: -106.8688, region: 'CO', hub: true },
  { code: 'EGE', city: 'Vail', name: 'Eagle County Regional Airport', lat: 39.6426, lon: -106.9177, region: 'CO' },
  { code: 'JAC', city: 'Jackson Hole', name: 'Jackson Hole Airport', lat: 43.6073, lon: -110.7377, region: 'WY' },
  { code: 'SUN', city: 'Sun Valley', name: 'Friedman Memorial Airport', lat: 43.5044, lon: -114.2958, region: 'ID' },
  { code: 'SDL', city: 'Scottsdale', name: 'Scottsdale Airport', lat: 33.6229, lon: -111.9105, region: 'AZ' },
  { code: 'LAS', city: 'Las Vegas', name: 'Harry Reid International', lat: 36.084, lon: -115.1537, region: 'NV', hub: true },
  { code: 'VNY', city: 'Los Angeles', name: 'Van Nuys Airport', lat: 34.2098, lon: -118.4899, region: 'CA', hub: true },
  { code: 'SFO', city: 'San Francisco', name: 'San Francisco International', lat: 37.6213, lon: -122.379, region: 'CA', hub: true },
  { code: 'BFI', city: 'Seattle', name: 'Boeing Field / King County International', lat: 47.53, lon: -122.3019, region: 'WA' },
];

const byCode = Object.fromEntries(airports.map((a) => [a.code, a]));

module.exports = { airports, byCode };
