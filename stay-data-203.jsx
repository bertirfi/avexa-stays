/* Stay page data — The Modern Quartz Gem (Suite 203) */
const { useState, useEffect, useRef, useCallback } = React;

/* ── Photo data ── */
const PHOTOS = [
  { id:1, label:'Cover', src:'listing-203/00-cover.jpeg'},
  { id:2, label:'Living Room', src:'listing-203/01a-living-room.jpeg'},
  { id:3, label:'Living & Kitchen', src:'listing-203/01b-living-room.jpeg'},
  { id:4, label:'Bedroom', src:'listing-203/02-bedroom.jpeg'},
  { id:5, label:'Bedroom — Wardrobe', src:'listing-203/03-bedroom-wardrobe.jpeg'},
  { id:6, label:'Kitchen & Dining', src:'listing-203/04-kitchen.jpeg'},
  { id:7, label:'Kitchen', src:'listing-203/05a-kitchen-sink.jpeg'},
  { id:8, label:'Bathroom 1', src:'listing-203/05b-bathroom1.jpeg'},
  { id:9, label:'Bathroom 1 — Vanity', src:'listing-203/06-bathroom1-basins.jpeg'},
  { id:10, label:'Bathroom 2', src:'listing-203/07-bathroom2.jpeg'},
];

/* ── Property ── */
const PROPERTY = {
  name: 'The Modern Quartz Gem',
  subtitle: 'AVEXA Suite 203',
  tagline: 'The city, effortlessly yours.',
  neighborhood: 'Bucharest City Centre',
  nbhColor: '#2E7D32',
  address: 'Colței Street 25, Sector 3, Bucharest',
  stats: [
    {icon:'users', label:'4 Guests'},
    {icon:'bed', label:'1 Bedroom'},
    {icon:'sofa', label:'2 Beds'},
    {icon:'bath', label:'2 Bathrooms'},
  ],
  description: `Experience Bucharest from a sophisticated, central sanctuary. Situated just a 2-minute walk from the Old Town and minutes away from the central Universitate Subway Station, this residence places you at the vibrant epicenter of the city's culture, fashion, and gastronomy — while offering a surprisingly quiet, peaceful retreat from the urban bustle.\n\nFrom world-class restaurants to major landmarks, everything is within reach. This 5-star apartment is a masterclass in urban living, combining city-center excitement with the refined AVEXA standard of comfort and tech-enabled hospitality.\n\nThe spacious living space is uniquely modern, crafted to ensure a luxurious and relaxing stay in the heart of the urban center. A supremely quiet master bedroom featuring a Queen-size bed and premium linens, guaranteeing a restorative night's sleep.\n\nUnlike most central Bucharest rentals, this property features two contemporary bathrooms — one with a walk-in shower and one with a cabin shower — both prepared to pristine, immaculate standards.\n\nHigh-speed Wi-Fi, dedicated climate control, and a gourmet kitchen complete with a premium coffee machine to start your mornings focused and refreshed.`,
  pitch: `Zero Friction Access — Bypass the front desk completely. Secure digital entry allows you to arrive on your own schedule.\n\nA Special Retreat — The spacious living space is uniquely modern, crafted to ensure a luxurious and relaxing stay in the heart of the urban center.\n\nEngineered for Rest — A supremely quiet master bedroom featuring a Queen-size bed and premium linens, guaranteeing a restorative night's sleep.\n\nThe Rare Luxury of Space — Unlike most central Bucharest rentals, this property features two contemporary bathrooms — one with a walk-in shower and one with a cabin shower — both prepared to pristine, immaculate standards.\n\nExecutive Ready — High-speed Wi-Fi, dedicated climate control, and a gourmet kitchen complete with a premium coffee machine to start your mornings focused and refreshed.`,
  goodToKnowExtra: 'Situated on an elevated ground floor — just 5 steps up from the entrance — this apartment perfectly combines easy access for your luggage with enhanced privacy. Located steps away from the vibrant Old Town, it serves as a remarkably quiet urban oasis, ensuring a peaceful and restful night\'s sleep inside.',
  checkin: '3:00 PM – 12:00 AM',
  checkout: '11:00 AM',
  maxGuests: 4,
};

/* ── House Rules ── */
const HOUSE_RULES = {
  checkin: '3:00 PM – 12:00 AM',
  earlyCheckin: 'Early check-in upon request via My Trips',
  checkout: 'Before 11:00 AM',
  lateCheckout: 'Late check-out upon request via My Trips',
  maxGuests: 4,
  rules: ['No smoking', 'No parties', 'No pets', 'Quiet hours: 10 PM – 8 AM'],
};

/* ── FAQ ── */
const FAQ = [
  {
    question: 'Can I park there?',
    answer: 'Paid public parking is available on the street nearby. Reservation is not needed.',
  },
  {
    question: 'How far is the nearest metro station?',
    answer: 'Universitate Metro Station is just 500 meters away — roughly a 5-minute walk. Piata Unirii 2 is 1 km away.',
  },
  {
    question: 'Is the apartment noisy given its central location?',
    answer: 'Despite being in the heart of the city, the apartment is remarkably quiet. Quality soundproof windows ensure almost no street noise reaches inside, making it an ideal urban oasis for restful sleep.',
  },
];

/* ── Amenities ── */
const AMENITIES_TOP = [
  'Free Wi-Fi','Air conditioning','Kitchen','Elevator',
  'Washer','Hair dryer','Heating','Dishwasher',
  'TV','Private entrance',
];

const AMENITIES_ROOM = {
  'Bathroom': ['Hair dryer','Cleaning products','Shampoo','Body soap','Hot water','Shower gel'],
  'Bedroom & Laundry': ['Washer','Hangers','Bed linens','Extra pillows and blankets','Room-darkening shades','Iron','Drying rack for clothing','Clothing storage'],
  'Entertainment': ['Ethernet connection','TV','Books and reading material'],
  'Family': ['Paid crib — available upon request','Children\'s books and toys (ages 0–5)','Paid high chair — available upon request'],
  'Heating & Cooling': ['Air conditioning','Central heating'],
  'Home Safety': ['Smoke alarm','Carbon monoxide alarm','Fire extinguisher'],
  'Kitchen & Dining': ['Kitchen','Microwave','Cooking basics (pots, pans, oil, salt & pepper)','Dishes and silverware','Freezer','Dishwasher','Induction stove','Oven','Hot water kettle','Coffee maker (drip)','Wine glasses','Toaster','Dining table','Coffee'],
};

const AMENITIES_PROPERTY = {
  'Internet & Office': ['Wi-Fi'],
  'Location Features': ['Private entrance (separate street entrance)'],
  'Parking & Facilities': ['Elevator','Paid street parking off premises','Single level home','No stairs in home'],
  'Services': ['Luggage dropoff allowed','Long term stays allowed','Housekeeping — available at extra cost'],
  'Not Included': ['Pets not allowed'],
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
    perNight: 129, discount: 15, refundable: false,
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
    perNight: 145, discount: 5, refundable: true,
    perks: [
      'Best price: 5% off',
      'Free early check-in & late check-out',
      'Free welcome drinks & snacks',
    ],
    highlight: 'Free cancellation until 4:00pm, one day before arrival',
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
    {name:'Revolution Square', dist:'1.1 km'},
    {name:'National Museum of Art of Romania', dist:'1.5 km'},
    {name:'Cismigiu Gardens', dist:'1.6 km'},
    {name:'Museum of Art Collections', dist:'2.2 km'},
    {name:'Carol Park', dist:'2.7 km'},
    {name:'Grigore Antipa National Museum of Natural History', dist:'3.3 km'},
    {name:'Museum of Romanian Peasant', dist:'3.4 km'},
    {name:'Bucharest Botanical Garden', dist:'3.9 km'},
    {name:'National Museum Cotroceni', dist:'4.3 km'},
    {name:'Alexandru Ioan Cuza Park', dist:'4.8 km'},
  ],
  'Restaurants & Cafés': [
    {name:'Slow Restaurant', dist:'10 m'},
    {name:'The Legend Café', dist:'10 m'},
    {name:'Underworld Bar', dist:'20 m'},
  ],
  'Public Transit': [
    {name:'Universitate Metro Station', dist:'500 m'},
    {name:'Piața Unirii 2 Metro Station', dist:'1 km'},
    {name:'Bucharest North Railway Station', dist:'3.4 km'},
    {name:'Obor Station', dist:'3.5 km'},
  ],
  'Closest Airports': [
    {name:'Băneasa Airport', dist:'8 km'},
    {name:'Henri Coandă International Airport', dist:'16 km'},
  ],
};

/* ── Testimonials ── */
const TESTIMONIALS = [
  {name:'Viktoria', date:'May 2026', stay:'Stayed a few nights', rating:5, yearsOnPlatform:'7 years on Airbnb',
   text:'Amazing apartment and very helpful. Cozy, well-equipped and spotless. Even though it is on the first floor, windows are good enough to soundproof the place, so almost no noise was coming in from the street.'},
  {name:'Ilinca-Adina', date:'April 2026', rating:5,
   text:'I had a great stay! The apartment is beautiful and the bed is super comfortable. Top location too, just steps from the old town. I felt like home and will definitely be back!'},
  {name:'Mihai', location:'San Diego, California', date:'April 2026', stay:'Stayed about a week', rating:5,
   text:'Centrally located. Beautiful modern apartment. Wonderful attentive host.'},
  {name:'Carsten', date:'May 2026', stay:'Stayed a few nights', rating:5, yearsOnPlatform:'10 years on Airbnb',
   text:'Was a very nice place to stay and a super host. Thank you again.'},
  {name:'Gabriela', date:'April 2026', stay:'Stayed about a week', rating:5, yearsOnPlatform:'7 years on Airbnb',
   text:'A ten-star stay! The apartment is fantastic, it\'s impeccable, and it has absolutely everything you need. We really felt at home. The location is unbeatable: a very quiet area but at the same time super central, ideal for getting around on foot. A 10/10 for the hosts!'},
];

/* ── SVG icon helper ── */
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
    star: <svg viewBox="0 0 24 24" style={{...s, fill:'currentColor', stroke:'none'}}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  };
  return icons[name] || null;
}

/* Export to window */
Object.assign(window, {
  PHOTOS, PROPERTY, AMENITIES_TOP, AMENITIES_ROOM, AMENITIES_PROPERTY,
  AVEXA_STANDARD, RATES, UPGRADES, NEARBY, HOUSE_RULES, FAQ, TESTIMONIALS, StayIcon,
});
