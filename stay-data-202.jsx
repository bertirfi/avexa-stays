/* Stay page data — The Modern Green Gem (Suite 202) */
const { useState, useEffect, useRef, useCallback } = React;

const PHOTOS = [
  { id:1, label:'Cover', src:'listing-202/00-cover.jpeg'},
  { id:2, label:'Bedroom', src:'listing-202/04-bedroom.jpeg'},
  { id:3, label:'Bedroom Closet', src:'listing-202/05a-bedroom-closet.jpeg'},
  { id:4, label:'Bathroom', src:'listing-202/07-bathroom.jpeg'},
  { id:5, label:'Kitchen', src:'listing-202/09-kitchen.jpeg'},
  { id:6, label:'Hallway', src:'listing-202/12-hallway.jpeg'},
  { id:7, label:'Interior Courtyard', src:'listing-202/32-courtyard.jpeg'},
  { id:8, label:'Open Streets Festival', src:'listing-202/33-open-streets.jpeg'},
  { id:9, label:'Restaurant Nearby', src:'listing-202/37-restaurant.jpeg'},
];

const PROPERTY = {
  name: 'The Modern Green Gem',
  subtitle: 'AVEXA Suite 202',
  tagline: 'The city, effortlessly yours.',
  neighborhood: 'Bucharest City Centre',
  nbhColor: '#2E7D32',
  address: 'Calea Victoriei 142-148, Sector 1, Bucharest',
  stats: [
    {icon:'users', label:'4 Guests'},
    {icon:'bed', label:'1 Bedroom'},
    {icon:'sofa', label:'2 Beds'},
    {icon:'bath', label:'1 Bathroom'},
  ],
  description: `Experience Bucharest from its most prestigious vantage point. Situated directly on Calea Victoriei, this sophisticated residence places you in the vibrant epicenter of the city's culture, fashion, and gastronomy.\n\nFrom world-class restaurants and artisanal coffee shops to high-end shopping and major landmarks, everything is within reach. This apartment offers a stunning blend of modern comfort and historic charm, boasting a direct view of the Stirbey Palace.\n\nStart your mornings with coffee on one of the two private balconies, overlooking the vibrant Calea Victoriei. Unwind in the living room with a massive 169 cm (65-inch) TV — perfect for movie nights.\n\nThe bedroom features a queen-size bed (160x200) with a premium orthopedic mattress. The living room sofa transforms into a comfortable 150x190 bed for extra guests.\n\nFully equipped kitchen with dishwasher, oven, full-size fridge, coffee maker, kettle, and toaster. A spa-like bathroom featuring modern design, LED mirror, and high-end finishes.`,
  pitch: `Zero Friction Access — Bypass the front desk completely. Secure digital entry allows you to arrive on your own schedule.\n\nA Botanical Retreat — The living space is uniquely crafted with lush green installations, designed to induce the serenity of nature in the heart of the urban center.\n\nEngineered for Rest — A supremely quiet master bedroom featuring a queen-size bed and premium linens, guaranteeing a restorative night's sleep.\n\nThe Spa Experience — A contemporary bathroom featuring a golden cabin shower, a smart shower and an ambient LED mirror, meticulously designed for pure relaxation.\n\nExecutive Ready — High-speed Wi-Fi, dedicated climate control, and a gourmet kitchen complete with a coffee machine to start your mornings focused and refreshed.`,
  checkin: '3:00 PM – 12:00 AM', checkout: '11:00 AM', maxGuests: 4,
};

const HOUSE_RULES = {
  checkin: '3:00 PM – 12:00 AM', earlyCheckin: 'Early check-in upon request via My Trips',
  checkout: 'Before 11:00 AM', lateCheckout: 'Late check-out upon request via My Trips',
  maxGuests: 4, rules: ['No smoking', 'No parties', 'No pets', 'Quiet hours: 10 PM – 8 AM'],
};

const FAQ = [
  {question:'Can I park there?', answer:'Free street parking is available nearby. Paid street parking is also available off premises. No reservation needed.'},
  {question:'Does the apartment have a balcony?', answer:'Yes — two private balconies overlooking Calea Victoriei and the beautiful Stirbey Palace landscape.'},
  {question:'Is there a view?', answer:'Stunning panoramic views of Stirbey Palace from both private balconies. The apartment is located directly on Calea Victoriei, Bucharest\'s most iconic boulevard.'},
];

const AMENITIES_TOP = [
  'Free Wi-Fi','Air conditioning','Kitchen','Elevator','Washer & Dryer','Hair dryer','Heating','Dishwasher','65" TV','Balcony',
];

const AMENITIES_ROOM = {
  'Bathroom': ['Hair dryer','Cleaning products','Shampoo','Body soap','Hot water','Shower gel'],
  'Bedroom & Laundry': ['Washer','Free dryer','Essentials (towels, bed sheets, soap, toilet paper)','Hangers','Bed linens','Cotton linens','Extra pillows and blankets','Room-darkening shades','Iron','Drying rack for clothing','Clothing storage: closet'],
  'Entertainment': ['Ethernet connection','65 inch TV'],
  'Family': ['Crib','Children\'s books and toys (ages 0–5)','Paid high chair — available upon request'],
  'Heating & Cooling': ['Window AC unit','Heating'],
  'Home Safety': ['Smoke alarm','Fire extinguisher'],
  'Kitchen & Dining': ['Kitchen','Microwave','Cooking basics (pots, pans, oil, salt & pepper)','Dishes and silverware','Freezer','Dishwasher','Induction stove','Oven','Hot water kettle','Wine glasses','Toaster','Dining table','Coffee'],
};

const AMENITIES_PROPERTY = {
  'Internet & Office': ['Wi-Fi','Dedicated workspace'],
  'Outdoor': ['Private patio or balcony'],
  'Parking & Facilities': ['Free street parking','Elevator','Paid street parking off premises','Single level home','No stairs in home'],
  'Services': ['Long term stays allowed','Self check-in (Lockbox)','Housekeeping — available at extra cost'],
  'Not Included': ['Pets not allowed','Carbon monoxide alarm','Private entrance'],
};

const AVEXA_STANDARD = ['24/7 online reception','High-speed Wi-Fi','Contactless check-in','Free tea and coffee','Shampoo and body soap'];

const RATES = [
  {id:'saver', name:'Member Saver', perNight:139, discount:15, refundable:false,
   perks:['Non-refundable rate','Best price: 15% off','Free early check-in & late check-out','Free welcome drinks & snacks'],
   warn:'No refund in the event of cancellation'},
  {id:'flex', name:'Member Flex', perNight:159, discount:5, refundable:true,
   perks:['Best price: 5% off','Free early check-in & late check-out','Free welcome drinks & snacks'],
   highlight:'Free cancellation until 4:00pm, one day before arrival',
   cancelNote:'Cancellation time shown is based on the location of the property'},
];

const UPGRADES = [
  {id:'breakfast', name:'Breakfast', price:20, unit:'/day/person', free:false},
  {id:'late_checkout', name:'Late check-out', price:20, unit:'', free:true},
  {id:'early_checkin', name:'Early check-in', price:20, unit:'', free:true},
];

const NEARBY = {
  'Top Attractions': [
    {name:'Museum of Art Collections', dist:'100 m'},{name:'Revolution Square', dist:'800 m'},
    {name:'National Museum of Art of Romania', dist:'850 m'},{name:'Cismigiu Gardens', dist:'1.2 km'},
    {name:'Grigore Antipa National Museum', dist:'1.6 km'},{name:'Museum of Romanian Peasant', dist:'1.7 km'},
    {name:'Bucharest Arch of Triumph', dist:'3.2 km'},{name:'Ceausescu Mansion', dist:'3.4 km'},
    {name:'National Museum Cotroceni', dist:'3.5 km'},{name:'Carol Park', dist:'3.7 km'},
  ],
  'Restaurants & Cafés': [
    {name:'French Bakery', dist:'50 m'},{name:'Cascara Coffee Roaster', dist:'50 m'},{name:'Eden Bistro', dist:'50 m'},
  ],
  'Public Transit': [
    {name:'Piata Romana Metro Station', dist:'600 m'},{name:'Piața Victoriei 1', dist:'1.2 km'},
    {name:'Bucharest North Railway Station', dist:'1.7 km'},{name:'Gara Basarab', dist:'2.5 km'},
  ],
  'Closest Airports': [
    {name:'Băneasa Airport', dist:'7 km'},{name:'Henri Coandă International Airport', dist:'15 km'},
  ],
};

const TESTIMONIALS = [
  {name:'Ariela', date:'March 2026', stay:'Stayed a few nights', rating:5, yearsOnPlatform:'3 years on Airbnb',
   text:'The flat was absolutely spotless and well equipped. The location is great! Walking distance or a very quick uber to most places. The area itself is great with lots of lovely cafes and restaurants and shops. The hosts were lovely, very helpful and responsive. Would highly recommend!'},
  {name:'Jamee', date:'April 2026', stay:'Stayed a few nights', rating:5, yearsOnPlatform:'7 years on Airbnb',
   text:'Perfect home away from home, it\'s just as described. Very nice touch providing kids toys. Very easy to access and very close to all the restaurants, cafes etc. I\'ll for sure stay here again the next time I\'m in Bucharest.'},
  {name:'Uldis', date:'April 2026', stay:'Stayed a few nights', rating:5, yearsOnPlatform:'11 years on Airbnb',
   text:'Great apartment, with all necessary equipment, clean and tidy. Great location. Recommend.'},
  {name:'Jason', location:'New York, United States', date:'February 2026', stay:'Stayed a few nights', rating:5,
   text:'Super comfortable apartment with modern amenities in a very accessible area on Calea Victoriei with great restaurants and cafes in every direction. The perfect place to stay. The hosts are amazing. Extremely responsive, understanding, and friendly. Hope to stay here again!'},
];

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

Object.assign(window, {
  PHOTOS, PROPERTY, AMENITIES_TOP, AMENITIES_ROOM, AMENITIES_PROPERTY,
  AVEXA_STANDARD, RATES, UPGRADES, NEARBY, HOUSE_RULES, FAQ, TESTIMONIALS, StayIcon,
});
