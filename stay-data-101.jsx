/* Stay page data — The Little Gem (Suite 101) */
const { useState, useEffect, useRef, useCallback } = React;

const PHOTOS = [
  { id:1, label:'Cover', src:'listing-101/00-cover.jpeg'},
  { id:2, label:'Bedroom', src:'listing-101/04-bedroom.jpeg'},
  { id:3, label:'Bathroom', src:'listing-101/11-bathroom-shower.jpeg'},
  { id:4, label:'Bathroom Detail', src:'listing-101/13-bathroom-toilet.jpeg'},
  { id:5, label:'Kitchenette', src:'listing-101/14-kitchenette.jpeg'},
  { id:6, label:'Hallway', src:'listing-101/16-hallway.jpeg'},
  { id:7, label:'Entrance', src:'listing-101/18-entrance.jpeg'},
  { id:8, label:'Building Hallway', src:'listing-101/19-building-hallway.jpeg'},
  { id:9, label:'Decor', src:'listing-101/20-decor.jpeg'},
  { id:10, label:'Exterior View', src:'listing-101/23-exterior.jpeg'},
  { id:11, label:'Building Entrance', src:'listing-101/25-building-entrance.jpeg'},
];

const PROPERTY = {
  name: 'The Little Gem',
  subtitle: 'AVEXA Suite 101',
  tagline: 'The city, effortlessly yours.',
  neighborhood: 'Bucharest City Centre',
  nbhColor: '#2E7D32',
  address: 'Calea Victoriei Nr. 2, Sector 3, Bucharest',
  stats: [
    {icon:'users', label:'2 Guests'},
    {icon:'bed', label:'Studio'},
    {icon:'sofa', label:'1 Bed'},
    {icon:'bath', label:'1 Bathroom'},
  ],
  description: `Reside in a piece of Bucharest's history. Located within the iconic Palace of the "Adriatica" Society, this unique sanctuary blends interwar elegance with the AVEXA standard of tech-enabled hospitality.\n\nPositioned exactly at the gateway to the vibrant Old Town, you are completely connected to the city's pulse, yet insulated in absolute comfort.\n\nIf you're visiting Bucharest for a city break with just a backpack and a desire for adventure, this stylish, compact sanctuary offers everything you need to recharge in the heart of the city.\n\nA chic and comfortable bedroom featuring a cozy double bed, relaxing wall plants, a spacious closet, and fresh linens & towels. A modern, well-appointed bathroom equipped with a sleek shower cabin, sink, toilet, and fresh towels.\n\nA fully equipped kitchenette with a small refrigerator, coffee maker, toaster, microwave, induction cooktop, and kettle — perfect for preparing quick meals and drinks.\n\nThoughtful amenities: toiletries, coffee, tea, sugar, salt, pepper, oil, and vinegar are provided to make you feel at home.`,
  pitch: `Zero Friction Access — Bypass the front desk completely. Secure digital entry allows you to arrive on your own schedule.\n\nA Botanical Retreat — The room is uniquely crafted with lush green installations, designed to induce the serenity of nature in the heart of the urban center.\n\nEngineered for Rest — A supremely quiet room featuring a double bed and premium linens, guaranteeing a restorative night's sleep.\n\nThe Spa Experience — A contemporary compact yet sophisticated bathroom featuring a high-end shower cabin, modern fixtures, and a refreshing ambiance.\n\nExecutive Ready — High-speed Wi-Fi, dedicated climate control, and a gourmet kitchenette complete with a coffee machine to start your mornings focused and refreshed.`,
  checkin: '3:00 PM – 12:00 AM',
  checkout: '11:00 AM',
  maxGuests: 2,
};

const HOUSE_RULES = {
  checkin: '3:00 PM – 12:00 AM',
  earlyCheckin: 'Early check-in upon request via My Trips',
  checkout: 'Before 11:00 AM',
  lateCheckout: 'Late check-out upon request via My Trips',
  maxGuests: 2,
  rules: ['No smoking', 'No parties', 'No pets', 'Quiet hours: 10 PM – 8 AM'],
};

const FAQ = [
  {question:'Can I park there?', answer:'Paid public parking is available on the street nearby. Reservation is not needed.'},
  {question:'How far is the Old Town?', answer:'The Old Town is literally at your doorstep — a 2-minute walk from the building entrance. You\'re at the gateway to Bucharest\'s most vibrant district.'},
  {question:'Is the apartment suitable for longer stays?', answer:'Yes, long-term stays of 28 days or more are welcome. The kitchenette is fully equipped for self-catering, and housekeeping is available at extra cost.'},
];

const AMENITIES_TOP = [
  'Free Wi-Fi','Air conditioning','Kitchenette','Elevator',
  'Hair dryer','Heating','Smart TV with Netflix','Dedicated workspace',
  'Private entrance','Self check-in',
];

const AMENITIES_ROOM = {
  'Bathroom': ['Hair dryer','Shampoo','Body soap','Hot water','Shower gel'],
  'Bedroom & Laundry': ['Essentials (towels, bed sheets, soap, toilet paper)','Hangers','Bed linens','Cotton linens','Iron','Drying rack for clothing','Clothing storage: closet and wardrobe'],
  'Entertainment': ['Ethernet connection','42 inch HDTV with Netflix, premium cable'],
  'Family': ['Paid crib — available upon request (mini size)'],
  'Heating & Cooling': ['Air conditioning','Central heating'],
  'Home Safety': ['Smoke alarm','Fire extinguisher'],
  'Kitchen & Dining': ['Microwave','Cooking basics (pots, pans, oil, salt & pepper)','Dishes and silverware','Mini fridge','Freezer','Hot water kettle','Coffee maker (drip)','Wine glasses','Toaster','Kitchenette','Coffee'],
};

const AMENITIES_PROPERTY = {
  'Internet & Office': ['Wi-Fi','Dedicated workspace'],
  'Location Features': ['Private entrance (separate street entrance)'],
  'Parking & Facilities': ['Elevator','Paid street parking off premises','Single level home','No stairs in home'],
  'Services': ['Luggage dropoff allowed','Long term stays allowed','Self check-in (Lockbox)','Housekeeping — available at extra cost'],
  'Not Included': ['Pets not allowed','Full kitchen','Washer','Carbon monoxide alarm'],
};

const AVEXA_STANDARD = [
  '24/7 online reception','High-speed Wi-Fi','Contactless check-in','Free tea and coffee','Shampoo and body soap',
];

const RATES = [
  {id:'saver', name:'Member Saver', perNight:79, discount:15, refundable:false,
   perks:['Non-refundable rate','Best price: 15% off','Free early check-in & late check-out','Free welcome drinks & snacks'],
   warn:'No refund in the event of cancellation'},
  {id:'flex', name:'Member Flex', perNight:89, discount:5, refundable:true,
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
    {name:'Cismigiu Gardens', dist:'1.1 km'},{name:'Revolution Square', dist:'1.3 km'},
    {name:'National Museum of Art of Romania', dist:'1.4 km'},{name:'Carol Park', dist:'1.8 km'},
    {name:'Museum of Art Collections', dist:'2 km'},{name:'Bucharest Botanical Garden', dist:'3 km'},
    {name:'Grigore Antipa National Museum', dist:'3.6 km'},{name:'Museum of Romanian Peasant', dist:'3.6 km'},
    {name:'National Museum Cotroceni', dist:'3.7 km'},{name:'Bucharest Arch of Triumph', dist:'5 km'},
  ],
  'Restaurants & Cafés': [
    {name:"Abel's Wine Bar", dist:'50 m'},{name:'The Artist', dist:'50 m'},{name:'Anika', dist:'50 m'},
  ],
  'Public Transit': [
    {name:'Piata Unirii Metro Station', dist:'700 m'},{name:'Piața Unirii 2', dist:'750 m'},
    {name:'Bucharest North Railway Station', dist:'2.8 km'},{name:'Gara Basarab', dist:'3.6 km'},
  ],
  'Closest Airports': [
    {name:'Băneasa Airport', dist:'8 km'},{name:'Henri Coandă International Airport', dist:'16 km'},
  ],
};

const TESTIMONIALS = [
  {name:'Eleana', date:'December 2025', stay:'Stayed a few nights', rating:5, yearsOnPlatform:'8 years on Airbnb',
   text:'Thank you very much for the stay. The apartment was centrally located which helped us walk to various important monuments. Very good communication with the hosts who gave us tips on places worth visiting. Highly recommend!'},
  {name:'Cezara', date:'October 2025', stay:'Stayed a few nights', rating:5, yearsOnPlatform:'11 years on Airbnb',
   text:"Such a lovely place! It's so hard to find a quiet apartment in this area with good sleep. Sparkling clean, comfy bed, fresh towels and everything you need. There is a fridge, TV with Netflix, iron, hair dryer — perfect for being in the heart of the city. Highly recommended!"},
  {name:'Simona', date:'August 2025', stay:'Stayed a few nights', rating:5, yearsOnPlatform:'8 years on Airbnb',
   text:'Very lovely place for a quick getaway, very close to the best part of town, terraces, clubs, all the fun you can get. Easy to check in, responsive host, lovely recommendations. Overall great stay.'},
  {name:'Florin', location:'New York, New York', date:'August 2025', stay:'Stayed a few nights', rating:5,
   text:"Very nice, clean, small and cute apartment located right downtown next to Old Town in Bucharest. Definitely recommend for anyone looking to visit for a couple of days. The host was very responsive. We're going to stay here again."},
  {name:'Adina Ioana', date:'August 2025', stay:'Stayed a few nights', rating:5,
   text:'The apartment is extremely well maintained. Super cozy and very clean. Beautiful surroundings with places to walk and very good restaurants. I highly recommend this flat and the owners are really nice people. Loved it and I would come back.'},
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
