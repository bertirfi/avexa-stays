/* Stay page data + constants */
const { useState, useEffect, useRef, useCallback } = React;

/* ── Photo data ── */
const PHOTOS = [
  { id:1, label:'Living Room & Dining', src:'listing-photos/00-cover.jpeg'},
  { id:2, label:'Hallway', src:'listing-photos/09-hallway.jpeg'},
  { id:3, label:'Bedroom 2', src:'listing-photos/11-bedroom2.jpeg'},
  { id:4, label:'Bedroom 1', src:'listing-photos/15-bedroom1.jpg'},
  { id:5, label:'Kitchen', src:'listing-photos/16-kitchen.jpg'},
  { id:6, label:'Bathroom', src:'listing-photos/19-bathroom.jpeg'},
  { id:7, label:'Washer & Dryer', src:'listing-photos/19b-washer.jpg'},
  { id:8, label:'Palace View', src:'listing-photos/20-palace-view.jpeg'},
  { id:9, label:'Street View', src:'listing-photos/23-street-view.jpg'},
  { id:10, label:'Courtyard Garden', src:'listing-photos/25-courtyard.jpg'},
  { id:11, label:'Living Room', src:'listing-photos/30-living-room.jpeg'},
  { id:12, label:'Bedroom 2 View', src:'listing-photos/31-bedroom2-view.jpeg'},
  { id:13, label:'Interior Courtyard', src:'listing-photos/32-interior-courtyard.jpeg'},
  { id:14, label:'Open Streets Festival', src:'listing-photos/33-open-streets.jpeg'},
  { id:15, label:'Restaurant Nearby', src:'listing-photos/37-restaurant.jpeg'},
];

/* ── Property ── */
const PROPERTY = {
  name: 'The Ultracentral Gem Calea Victoriei & Palace View',
  subtitle: 'AVEXA Suite 301',
  tagline: 'The city, effortlessly yours.',
  neighborhood: 'Bucharest City Centre',
  nbhColor: '#2E7D32',
  address: 'Calea Victoriei, Sector 1, Bucharest',
  stats: [
    {icon:'users', label:'6 Guests'},
    {icon:'bed', label:'2 Bedrooms'},
    {icon:'sofa', label:'3 Beds'},
    {icon:'bath', label:'1 Bathroom'},
  ],
  description: `Welcome and enjoy this relaxing apartment, placed in a centrally located residence, set in the upscale Calea Victoriei area.\n\nSurrounded by fine restaurants, stylish shops, and major attractions, this elegant apartment is perfect for both family getaways and peaceful retreats. Relax and unwind while taking in the beautiful, calming views over Calea Victoriei.\n\nA stylish living room with a cozy dining area (table + 6 chairs) for you and your friends or family to enjoy. A spacious, comfortable sofa that converts into a bed (150 × 190 cm).\n\nTwo charming bedrooms: the first featuring a comfortable queen-size bed, a spacious closet, fresh linens & towels. The second featuring a single divan bed that easily converts into a comfortable queen-size bed, fresh linens & towels.\n\nA modern, luxurious bathroom with a walk-in shower, sink, toilet, and fresh towels. A fully equipped kitchen with a stove, oven, refrigerator, microwave, coffee maker, kettle, toaster, dishwasher and essentials.\n\nExtra amenities: toiletries, an iron & ironing board, good heating, A/C, washing machine with dryer. A baby crib and child seat are available upon request.`,
  pitch: `Experience Bucharest from its most prestigious vantage point. Situated directly on Calea Victoriei, this sophisticated residence places you in the vibrant epicenter of the city's culture, fashion, and gastronomy.\n\nFrom world-class restaurants and artisanal coffee shops to high-end shopping and major landmarks, everything is within reach. This 5-star apartment is a masterclass in urban living, combining the excitement of the city center with the refined AVEXA standard of comfort and tech-enabled hospitality.`,
  checkin: '3:00 PM – 12:00 AM',
  checkout: '11:00 AM',
  maxGuests: 6,
};

/* ── House Rules ── */
const HOUSE_RULES = {
  checkin: '3:00 PM – 12:00 AM',
  earlyCheckin: 'Early check-in upon request via My Trips',
  checkout: 'Before 11:00 AM',
  lateCheckout: 'Late check-out upon request via My Trips',
  maxGuests: 6,
  rules: ['No smoking', 'No parties', 'No pets', 'Quiet hours: 10 PM – 8 AM'],
};

/* ── FAQ ── */
const FAQ = [
  {
    question: 'Can I park there?',
    answer: 'Public parking is available at a location nearby (reservation is not needed) and costs 30 lei per day.',
  },
  {
    question: 'Do they serve breakfast?',
    answer: 'There\'s no breakfast option available.',
  },
  {
    question: 'What are the check-in and check-out times?',
    answer: 'Check-in from 15:00 to 22:00. Check-out until 11:00. If you\'d like to request an early or late check-in or check-out, you can make a special request when you book.',
  },
];

/* ── Amenities ── */
const AMENITIES_TOP = [
  'Parking','Free Wi-Fi','Family rooms','Non-smoking rooms',
  'Elevator','Heating','Air conditioning','Kitchen',
  'Washer & Dryer','Dishwasher',
];

const AMENITIES_ROOM = {
  'Bathroom': ['Hair dryer','Cleaning products','Shampoo','Body soap','Hot water','Shower gel'],
  'Bedroom & Laundry': ['Washer','Free dryer — In unit','Essentials (towels, bed sheets, soap, toilet paper)','Hangers','Bed linens','Extra pillows and blankets','Room-darkening shades','Iron','Drying rack for clothing','Clothing storage'],
  'Entertainment': ['Ethernet connection','74 inch HDTV with Netflix, premium cable'],
  'Family': ['Paid crib — available upon request','Children\'s books and toys','Paid high chair — available upon request','Children\'s dinnerware'],
  'Heating & Cooling': ['Air conditioning','Heating'],
  'Home Safety': ['Smoke alarm','Fire extinguisher'],
  'Kitchen & Dining': ['Kitchen','Refrigerator','Microwave','Cooking basics (pots, pans, oil, salt & pepper)','Dishes and silverware','Freezer','Dishwasher','Stainless steel gas stove','Oven','Hot water kettle','Coffee maker (drip)','Wine glasses','Toaster','Coffee'],
};

const AMENITIES_PROPERTY = {
  'Internet & Office': ['Wi-Fi'],
  'Location Features': ['Private entrance (separate street entrance)'],
  'Parking & Facilities': ['Free street parking','Elevator','Paid street parking off premises','Single level home','No stairs in home'],
  'Services': ['Luggage dropoff allowed','Long term stays allowed','Self check-in (Lockbox)','Housekeeping — available at extra cost'],
  'Not Included': ['Exterior security cameras','Carbon monoxide alarm'],
};

const AVEXA_STANDARD = [
  '24/7 online reception',
  'High-speed Wi-Fi',
  'Contactless check-in',
  'Free tea and coffee',
  'Shampoo and body soap',
];

/* ── Rates ── */
const RATES = [
  {
    id:'saver', name:'Member Saver',
    perNight: 149, discount: 15, refundable: false,
    perks: [
      'Non-refundable rate',
      'Best price: 15% off',
      'Free early check-in & late check-out',
      'Free welcome drinks & snacks',
    ],
    warn: 'No refund in the event of cancellation',
  },
  {
    id:'flex', name:'Member Flex',
    perNight: 166, discount: 5, refundable: true,
    perks: [
      'Best price: 5% off',
      'Free early check-in & late check-out',
      'Free welcome drinks & snacks',
    ],
    highlight: 'Free cancellation until 4:00pm, Jun 01, 2026',
    cancelNote: 'Cancellation time shown is based on the location of the property',
  },
];

/* ── Upgrades ── */
const UPGRADES = [
  {id:'breakfast', name:'Breakfast', price:20, unit:'/day/person', free:false},
  {id:'late_checkout', name:'Late check-out', price:20, unit:'', free:true},
  {id:'early_checkin', name:'Early check-in', price:20, unit:'', free:true},
];

/* ── Nearby places ── */
const NEARBY = {
  'Top Attractions': [
    {name:'Museum of Art Collections', dist:'100 m'},
    {name:'Revolution Square', dist:'800 m'},
    {name:'National Museum of Art of Romania', dist:'850 m'},
    {name:'Cismigiu Gardens', dist:'1.2 km'},
    {name:'Grigore Antipa National Museum', dist:'1.6 km'},
    {name:'Museum of Romanian Peasant', dist:'1.7 km'},
    {name:'Bucharest Arch of Triumph', dist:'3.2 km'},
    {name:'Ceausescu Mansion', dist:'3.4 km'},
    {name:'National Museum Cotroceni', dist:'3.5 km'},
    {name:'Carol Park', dist:'3.7 km'},
  ],
  'Restaurants & Cafés': [
    {name:'French Bakery', dist:'50 m'},
    {name:'Cascara Coffee Roaster', dist:'50 m'},
    {name:'Eden Bistro', dist:'50 m'},
  ],
  'Public Transit': [
    {name:'Piata Romana Metro Station', dist:'600 m'},
    {name:'Piața Victoriei 1', dist:'1.2 km'},
    {name:'Bucharest North Railway Station', dist:'1.7 km'},
    {name:'Gara Basarab', dist:'2.5 km'},
  ],
  'Closest Airports': [
    {name:'Băneasa Airport', dist:'7 km'},
    {name:'Henri Coandă International Airport', dist:'15 km'},
  ],
};

/* ── SVG icon helper ── */

/* ── Testimonials (none for this listing yet) ── */
const TESTIMONIALS = [];

function StayIcon({name, size=20, sw=1.6}) {
  const s = {width:size, height:size, strokeWidth:sw, stroke:'currentColor', fill:'none', strokeLinecap:'round', strokeLinejoin:'round'};
  const icons = {
    users: <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
    expand: <svg viewBox="0 0 24 24" style={s}><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>,
    bed: <svg viewBox="0 0 24 24" style={s}><path d="M3 7v10M21 7v10M3 17h18M3 12h18V9a2 2 0 00-2-2H5a2 2 0 00-2 2v3z"/></svg>,
    bath: <svg viewBox="0 0 24 24" style={s}><path d="M4 12h16a1 1 0 011 1v3a4 4 0 01-4 4H7a4 4 0 01-4-4v-3a1 1 0 011-1zM6 12V5a2 2 0 012-2h1a2 2 0 012 2v1"/></svg>,
    sofa: <svg viewBox="0 0 24 24" style={s}><path d="M4 11V8a4 4 0 014-4h8a4 4 0 014 4v3"/><rect x="2" y="11" width="20" height="7" rx="2"/><path d="M4 18v2M20 18v2"/></svg>,
    check: <svg viewBox="0 0 24 24" style={s}><path d="M20 6L9 17l-5-5"/></svg>,
    chevDown: <svg viewBox="0 0 24 24" style={s}><path d="M6 9l6 6 6-6"/></svg>,
    chevLeft: <svg viewBox="0 0 24 24" style={s}><path d="M15 18l-6-6 6-6"/></svg>,
    chevRight: <svg viewBox="0 0 24 24" style={s}><path d="M9 18l6-6-6-6"/></svg>,
    x: <svg viewBox="0 0 24 24" style={s}><path d="M18 6L6 18M6 6l12 12"/></svg>,
    pin: <svg viewBox="0 0 24 24" style={s}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>,
    clock: <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
    grid: <svg viewBox="0 0 24 24" style={s}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    info: <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>,
    key: <svg viewBox="0 0 24 24" style={s}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.78 7.78 5.5 5.5 0 017.78-7.78zM15.5 7.5l-1 1"/></svg>,
    shield: <svg viewBox="0 0 24 24" style={s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    coffee: <svg viewBox="0 0 24 24" style={s}><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/></svg>,
    sunrise: <svg viewBox="0 0 24 24" style={s}><path d="M17 18a5 5 0 00-10 0"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/></svg>,
    moon: <svg viewBox="0 0 24 24" style={s}><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/></svg>,
    plus: <svg viewBox="0 0 24 24" style={s}><path d="M12 5v14M5 12h14"/></svg>,
    minus: <svg viewBox="0 0 24 24" style={s}><path d="M5 12h14"/></svg>,
    copy: <svg viewBox="0 0 24 24" style={s}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  };
  return icons[name] || null;
}

/* Export to window */
Object.assign(window, {
  PHOTOS, PROPERTY, AMENITIES_TOP, AMENITIES_ROOM, AMENITIES_PROPERTY,
  AVEXA_STANDARD, RATES, UPGRADES, NEARBY, HOUSE_RULES, FAQ, StayIcon,
});
