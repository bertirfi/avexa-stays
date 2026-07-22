/* Stay page data — Central Quiet Luxury (Suite 304) */
const { useState, useEffect, useRef, useCallback } = React;

/* ── Photo data (placeholders — swap with real images when provided) ── */
const PHOTOS = [
  { id:1, label:'Cover', src:'listing-304/00-cover.jpeg'},
  { id:2, label:'Living Room', src:'listing-304/01-living-room.jpeg'},
  { id:3, label:'Bedroom 1', src:'listing-304/02-bedroom1.jpeg'},
  { id:4, label:'Bedroom 1 — Workspace', src:'listing-304/03-bedroom1-desk.jpeg'},
  { id:5, label:'Bedroom 2', src:'listing-304/04-bedroom2.jpeg'},
  { id:6, label:'Hallway', src:'listing-304/05-hallway.jpeg'},
  { id:7, label:'Kitchenette', src:'listing-304/06a-kitchenette.jpeg'},
  { id:8, label:'Coffee Station', src:'listing-304/06b-coffee-station.jpeg'},
  { id:9, label:'Bathroom', src:'listing-304/07-bathroom.jpeg'},
  { id:10, label:'Shower', src:'listing-304/08-shower.jpeg'},
  { id:11, label:'Washer', src:'listing-304/09-washer.jpeg'},
  { id:12, label:'Kids Area', src:'listing-304/10-kids-area.jpeg'},
  { id:13, label:'Baby Crib', src:'listing-304/11-baby-crib.jpeg'},
  { id:14, label:'Terrace', src:'listing-304/12-terrace.jpeg'},
  { id:15, label:'Street View', src:'listing-304/13-street-view.jpeg'},
];

/* ── Property ── */
const PROPERTY = {
  name: 'Central Quiet Luxury',
  subtitle: 'AVEXA Suite 304',
  tagline: 'The city, effortlessly yours.',
  neighborhood: 'Bucharest City Centre',
  nbhColor: '#2E7D32',
  address: 'Polonă Street, Sector 1, Bucharest',
  stats: [
    {icon:'users', label:'6 Guests'},
    {icon:'bed', label:'2 Bedrooms'},
    {icon:'sofa', label:'3 Beds'},
    {icon:'bath', label:'1 Bathroom'},
  ],
  description: `Discover the perfect balance of central living and urban mobility. Located in the beating heart of the city, this stylish apartment offers immediate access to Bucharest's main subway network, making exploration completely effortless.\n\nEnjoy being just a 10-minute walk from Calea Victoriei and surrounded by a vibrant mix of top-tier restaurants, boutique shops, and must-see sights. It is a masterclass in smart city living, delivered with the signature AVEXA touch of luxury, peace, and seamless technology.\n\nA stylish, expansive living area designed for connection, featuring a cozy dining zone for six, perfect for families or groups.\n\nEngineered for versatility and long stays, featuring two charming bedrooms with wardrobes. The layout includes a plush Queen-size master bed and a comfortable double bed in the second suite.\n\nA modern, luxurious bathroom equipped with a sleek cabin shower and premium finishes, prepared with clinical precision to ensure your revitalization.\n\nStay effortlessly productive with high-speed Wi-Fi and dedicated climate control. The fully equipped gourmet kitchen, complete with a dishwasher and premium coffee maker, is stocked with essentials to keep your mornings focused and your stay hassle-free.`,
  pitch: `Zero Friction Access — Bypass the front desk completely. Secure digital entry allows you to arrive on your own schedule.\n\nSocially Centered Living — A stylish, expansive living area designed for connection, featuring a cozy dining zone for six, perfect for families or groups.\n\nFlexible Luxury Suites — Engineered for versatility and long stays, featuring two charming bedrooms with wardrobes. The layout includes a plush Queen-size master bed and a comfortable double bed in the second suite.\n\nEngineered for Rest — Experience absolute tranquility. Each bedroom is outfitted with premium linens and designed to guarantee a restorative night's sleep amidst the city's pulse.\n\nThe Spa Experience — A modern, luxurious bathroom equipped with a sleek cabin shower and premium finishes.\n\nExecutive Ready — Stay effortlessly productive with high-speed Wi-Fi and dedicated climate control. The fully equipped gourmet kitchen is stocked with essentials.`,
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
    question: 'How far is the nearest metro station?',
    answer: 'Stefan cel Mare Metro Station is just 450 meters away — roughly a 4-minute walk. Piata Romana is 1.1 km away.',
  },
  {
    question: 'Is this apartment suitable for families with children?',
    answer: 'Absolutely. The apartment sleeps up to 6, and a baby crib and high chair are available upon request. We also have children\'s books, toys, dinnerware, and window guards.',
  },
];

/* ── Amenities ── */
const AMENITIES_TOP = [
  'Free Wi-Fi','Air conditioning','Kitchen','Elevator',
  'Free washer','Hair dryer','Heating','Dedicated workspace',
  'Smart TV with Netflix','Private entrance',
];

const AMENITIES_ROOM = {
  'Bathroom': ['Hair dryer','Cleaning products','Shampoo','Body soap','Bidet','Hot water','Shower gel'],
  'Bedroom & Laundry': ['Free washer — In unit','Essentials (towels, bed sheets, soap, toilet paper)','Hangers','Bed linens','Cotton linens','Extra pillows and blankets','Iron','Drying rack for clothing','Mosquito net','Clothing storage: closet'],
  'Entertainment': ['Ethernet connection','65 inch HDTV with Netflix, premium cable'],
  'Family': ['Paid crib — available upon request','Children\'s books and toys (ages 0–5)','Paid high chair — available upon request','Children\'s dinnerware','Window guards','Outdoor playground'],
  'Heating & Cooling': ['Window AC unit','Central heating'],
  'Home Safety': ['Smoke alarm','Fire extinguisher','First aid kit'],
  'Kitchen & Dining': ['Microwave','Cooking basics (pots, pans, oil, salt & pepper)','Dishes and silverware','Mini fridge','Freezer','Induction stove','Single oven','Hot water kettle','Coffee maker (drip)','Wine glasses','Toaster','Kitchenette','Dining table','Coffee'],
};

const AMENITIES_PROPERTY = {
  'Internet & Office': ['Wi-Fi','Dedicated workspace'],
  'Location Features': ['Private entrance (separate street entrance)','Laundromat nearby'],
  'Outdoor': ['Private backyard — fully fenced','Outdoor furniture','Outdoor dining area'],
  'Parking & Facilities': ['Free street parking','Elevator','Paid street parking off premises','Single level home','No stairs in home'],
  'Services': ['Luggage dropoff allowed','Long term stays allowed','Self check-in (Lockbox)','Housekeeping — available at extra cost'],
  'Not Included': ['Pets not allowed','Carbon monoxide alarm','Full kitchen'],
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
    perNight: 119, discount: 15, refundable: false,
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
    perNight: 135, discount: 5, refundable: true,
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
    {name:'Museum of Art Collections', dist:'1.5 km'},
    {name:'Grigore Antipa National Museum of Natural History', dist:'1.6 km'},
    {name:'Museum of Romanian Peasant', dist:'1.7 km'},
    {name:'Revolution Square', dist:'1.8 km'},
    {name:'National Museum of Art of Romania', dist:'1.9 km'},
    {name:'Cismigiu Gardens', dist:'2.4 km'},
    {name:'Ceausescu Mansion', dist:'2.5 km'},
    {name:'Bucharest Arch of Triumph', dist:'2.9 km'},
    {name:'Dimitrie Gusti National Village Museum', dist:'3.4 km'},
    {name:'Herastrau Park', dist:'4.3 km'},
  ],
  'Restaurants & Cafés': [
    {name:'Chic Meniu', dist:'50 m'},
    {name:'Bake A Coffee', dist:'50 m'},
    {name:'5 To Go', dist:'50 m'},
  ],
  'Public Transit': [
    {name:'Stefan cel Mare Metro Station', dist:'450 m'},
    {name:'Piata Romana Metro Station', dist:'1.1 km'},
    {name:'Bucharest North Railway Station', dist:'2.5 km'},
    {name:'Gara Basarab', dist:'3.2 km'},
  ],
  'Closest Airports': [
    {name:'Băneasa Airport', dist:'5 km'},
    {name:'Henri Coandă International Airport', dist:'14 km'},
  ],
};

/* ── Testimonials ── */
const TESTIMONIALS = [
  {name:'Marius', date:'March 2026', stay:'Stayed a few nights', rating:5, yearsOnPlatform:'6 years on Airbnb',
   text:'Great stay overall! The hosts were very responsive and helpful, especially with our late arrival and flexible check-in. Clear instructions made everything easy, and communication was smooth throughout. The apartment was comfortable and suited our needs, even traveling with a baby.'},
  {name:'Anne', location:'Tel Aviv, Israel', date:'February 2026', stay:'Stayed with kids', rating:5,
   text:'We had a perfect time in this apartment. It is very spacious and comfortable and actually looks even better than the photos. The beds were very comfortable and the house was very clean and warm.'},
  {name:'Codrin', date:'January 2026', stay:'Stayed one night', rating:5, yearsOnPlatform:'4 years on Airbnb',
   text:'I had a great stay! The apartment is very beautiful (better than in the photos), clean, very quiet and with a very comfortable bed. I have received very clear check-in instructions with pictures. Friendly and warm hosts!'},
  {name:'Alex', date:'November 2025', rating:5, yearsOnPlatform:'12 years on Airbnb',
   text:'We had a wonderful stay at this very nice spacious and super clean apartment! Perfect for family with kids. Perfect location, bedrooms to the backside, very quiet.'},
  {name:'Delia', date:'October 2025', stay:'Stayed a few nights', rating:5, yearsOnPlatform:'8 years on Airbnb',
   text:'Absolutely loved our stay! The place was clean, cozy, and had everything we needed. The host was super friendly and easy to communicate with. We felt right at home and would definitely come back again.'},
  {name:'Albert', location:'Islip, New York', date:'September 2025', stay:'Stayed about a week', rating:5,
   text:'Probably the best value stay I\'ve ever booked on Airbnb compared to other options. The host went above and beyond to ensure our comfort. It\'s a brand new apartment and has many items included.'},
  {name:'Codrin', date:'August 2025', stay:'Stayed one night', rating:5, yearsOnPlatform:'4 years on Airbnb',
   text:'A newly renovated apartment, better than in the photos, a great surprise when I got there! Relaxing, with nature themes, very clean and super quiet. The mattress was extremely comfortable. Great hosts, very involved to offer a great service.'},
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
