/* Checkout — React App (3 steps + summary) */
const { useState, useEffect } = React;

/* ── Load booking from localStorage ── */
function getBooking() {
  try { return JSON.parse(localStorage.getItem('avexa_booking')); } catch(e){ return null; }
}

function getUser() {
  try { return JSON.parse(localStorage.getItem('avexa_user')); } catch(e){ return null; }
}

const fallback = {
  property: { name:'The Floreasca Loft', address:'Strada Barbu Văcărescu 42, Sector 2, Bucharest', neighborhood:'Floreasca' },
  startDate: new Date(2026,5,1).toISOString(), endDate: new Date(2026,5,6).toISOString(),
  nights:5, guests:{adults:1,children:0,infants:0},
  rate:{id:'saver',name:'Member Saver',perNight:149,discount:15,refundable:false},
  upgrades:{breakfast:false,late_checkout:false,early_checkin:false},
  subtotal:875, discountAmt:131, afterDiscount:744, breakfastTotal:0, cityTax:15, total:759,
};

/* ── Icon helper ── */
function CkIcon({name, size=16, sw=1.8}) {
  const s = {width:size,height:size,strokeWidth:sw,stroke:'currentColor',fill:'none',strokeLinecap:'round',strokeLinejoin:'round'};
  const icons = {
    check: <svg viewBox="0 0 24 24" style={s}><path d="M20 6L9 17l-5-5"/></svg>,
    lock: <svg viewBox="0 0 24 24" style={s}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    info: <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>,
    user: <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
    card: <svg viewBox="0 0 24 24" style={s}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  };
  return icons[name] || null;
}

/* ── STEPPER ── */
function Stepper({step}) {
  const steps = [
    {num:1, label:'Contact Info', icon:'user'},
    {num:2, label:'Payment', icon:'card'},
    {num:3, label:'Booking Confirmation', icon:'check'},
  ];
  return (
    <div className="ck-stepper">
      {steps.map((s, i) => (
        <React.Fragment key={s.num}>
          <div className={`ck-step ${step === s.num ? 'active' : ''} ${step > s.num ? 'done' : ''}`}>
            <span className="ck-step-icon">
              {step > s.num ? '✓' : <CkIcon name={s.icon} size={16}/>}
            </span>
            <span className="ck-step-label">{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`ck-step-line ${step > s.num ? 'done' : ''}`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ── BOOKING SUMMARY SIDEBAR ── */
function BookingSummary({booking}) {
  const b = booking || fallback;
  const sd = new Date(b.startDate);
  const ed = new Date(b.endDate);
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fmt = (d) => `${m[d.getMonth()]} ${String(d.getDate()).padStart(2,'0')}`;
  const totalGuests = b.guests.adults + b.guests.children;

  return (
    <div className="ck-aside">
      <div className="ck-summary">
        <div className="ck-summary-head">Booking details</div>
        <div className="ck-summary-img">
          <div className="g-ph" style={{background:'repeating-linear-gradient(135deg, rgba(255,255,255,.06) 0 2px, transparent 2px 16px),linear-gradient(160deg, #a98d5d 0%, #4a3d25 100%)'}}></div>
          <div className="ck-summary-overlay">
            <h4>{b.property.name}</h4>
            <p>{b.property.address}</p>
          </div>
        </div>
        <div className="ck-summary-body">
          <div className="ck-summary-row">
            <span className="label">Check-In/Out</span>
            <span className="val">{fmt(sd)} – {fmt(ed)}</span>
          </div>
          <div className="ck-summary-row">
            <span className="label">Guests</span>
            <span className="val">{totalGuests} guest{totalGuests !== 1 ? 's' : ''}</span>
          </div>
          <div className="ck-summary-row sep">
            <span className="label">€ {b.rate.perNight} × {b.nights} nights</span>
            <span className="val">€ {b.rate.perNight * b.nights}</span>
          </div>
          <div className="ck-summary-row discount">
            <span className="label">member discount –{b.rate.discount}%</span>
            <span className="val">– € {b.discountAmt}</span>
          </div>
          {b.breakfastTotal > 0 && (
            <div className="ck-summary-row">
              <span className="label">Breakfast</span>
              <span className="val">€ {b.breakfastTotal}</span>
            </div>
          )}
          <div className="ck-summary-row sep">
            <span className="label">City Tax</span>
            <span className="val">€ {b.cityTax}</span>
          </div>
        </div>
        <div className="ck-summary-total">
          <span className="label">Taxes and charges incl.</span>
          <span className="badge">Total € {b.total}</span>
        </div>
        {!b.rate.refundable && (
          <div className="ck-summary-refund">
            <strong>*Non-refundable</strong>
            This booking is non-refundable, even for a cancellation, and the travel dates cannot be modified.
          </div>
        )}
        <button className="ck-summary-promo">+ Add Promo Code / Voucher</button>
      </div>
    </div>
  );
}

/* ── STEP 1: CONTACT INFO ── */
function ContactInfo({booking, form, setForm, onNext}) {
  const set = (k) => (e) => setForm(f => ({...f, [k]: e.target.value}));
  const isBiz = form.accountType === 'business';

  return (
    <div className="ck-main">
      <h1 className="ck-title">Contact Info</h1>

      <div className="ck-row">
        <div className="ck-field" style={{marginBottom:0}}>
          <label className="ck-label">First Name</label>
          <input className="ck-input" type="text" value={form.firstName} onChange={set('firstName')} placeholder="Jordan"/>
        </div>
        <div className="ck-field" style={{marginBottom:0}}>
          <label className="ck-label">Last Name</label>
          <input className="ck-input" type="text" value={form.lastName} onChange={set('lastName')} placeholder="Smith"/>
        </div>
      </div>
      <div className="ck-hint" style={{marginTop:8, marginBottom:20}}><CkIcon name="info" size={14}/> As shown on your ID or passport</div>

      <div className="ck-field">
        <label className="ck-label">Email Address</label>
        <input className="ck-input" type="email" value={form.email} onChange={set('email')} placeholder="your@email.com"/>
        <div className="ck-hint"><CkIcon name="info" size={14}/> We will send your booking confirmation here.</div>
      </div>

      <div className="ck-field">
        <label className="ck-label">Phone number</label>
        <div className="ck-phone-wrap">
          <input className="ck-phone-prefix" type="text" value={form.prefix} onChange={set('prefix')}/>
          <input className="ck-input" type="tel" value={form.phone} onChange={set('phone')} placeholder="712 345 678"/>
        </div>
      </div>

      <div className="ck-field">
        <label className="ck-label">Street Address</label>
        <input className="ck-input" type="text" value={form.street} onChange={set('street')} placeholder="Street name and number"/>
      </div>
      <div className="ck-row">
        <div className="ck-field">
          <label className="ck-label">City</label>
          <input className="ck-input" type="text" value={form.city} onChange={set('city')} placeholder="Bucharest"/>
        </div>
        <div className="ck-field">
          <label className="ck-label">Country</label>
          <input className="ck-input" type="text" value={form.country} onChange={set('country')} placeholder="Romania"/>
        </div>
      </div>

      {/* Booking type — individual or business */}
      <div className="ck-field" style={{borderTop:'1px solid var(--gray-line)', paddingTop:24, marginTop:4}}>
        <label className="ck-label">Booking type</label>
        <div className="ck-select-wrap">
          <select className="ck-select" value={form.accountType} onChange={set('accountType')}>
            <option value="individual">Individual — personal stay</option>
            <option value="business">Business — invoice to a company</option>
          </select>
        </div>
        <div className="ck-hint"><CkIcon name="info" size={14}/> Choose "Business" to receive a company invoice for this booking.</div>
      </div>

      {isBiz && (
        <div className="ck-biz-box">
          <div className="ck-biz-head">Business invoice details</div>
          <div className="ck-field">
            <label className="ck-label">Company Name</label>
            <input className="ck-input" type="text" value={form.companyName} onChange={set('companyName')} placeholder="Company SRL"/>
          </div>
          <div className="ck-row">
            <div className="ck-field">
              <label className="ck-label">VAT Number (CUI / CIF)</label>
              <input className="ck-input" type="text" value={form.vatNumber} onChange={set('vatNumber')} placeholder="RO12345678"/>
            </div>
            <div className="ck-field">
              <label className="ck-label">Trade Register No. (J)</label>
              <input className="ck-input" type="text" value={form.regNumber} onChange={set('regNumber')} placeholder="J40/1234/2020"/>
            </div>
          </div>
          <div className="ck-field">
            <label className="ck-label">Registered Address</label>
            <input className="ck-input" type="text" value={form.companyStreet} onChange={set('companyStreet')} placeholder="Street name and number"/>
          </div>
          <div className="ck-row">
            <div className="ck-field" style={{marginBottom:0}}>
              <label className="ck-label">City</label>
              <input className="ck-input" type="text" value={form.companyCity} onChange={set('companyCity')} placeholder="Bucharest"/>
            </div>
            <div className="ck-field" style={{marginBottom:0}}>
              <label className="ck-label">Country</label>
              <input className="ck-input" type="text" value={form.companyCountry} onChange={set('companyCountry')} placeholder="Romania"/>
            </div>
          </div>
        </div>
      )}

      {/* Who are you booking for */}
      <div style={{borderTop:'1px solid var(--gray-line)', padding:'24px 0 0', marginTop:24}}>
        <label className="ck-label" style={{marginBottom:12}}>Who are you booking for?</label>
        <div className="ck-radio-row">
          <div className={`ck-radio ${form.bookFor==='self'?'active':''}`} onClick={()=>setForm(f=>({...f,bookFor:'self'}))}>
            <span className="ck-radio-dot"><span className="ck-radio-inner"></span></span>
            For Myself
          </div>
          <div className={`ck-radio ${form.bookFor==='other'?'active':''}`} onClick={()=>setForm(f=>({...f,bookFor:'other'}))}>
            <span className="ck-radio-dot"><span className="ck-radio-inner"></span></span>
            For Someone Else
          </div>
        </div>
      </div>

      <p className="ck-legal">
        Expect emails and mobile updates from AVEXA to keep you informed about your bookings and our services. 
        By clicking "Next", you agree that your information will be handled as per our{' '}
        <a href="#">terms and conditions</a> and <a href="#">Privacy Policy</a>.
      </p>
      <button className="ck-next" onClick={onNext}>Next</button>
    </div>
  );
}

/* ── STEP 2: PAYMENT ── */
function Payment({booking, form, onNext}) {
  const b = booking || fallback;
  const isBiz = form.accountType === 'business';
  const [cardName, setCardName] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  return (
    <div className="ck-main">
      <h1 className="ck-title">Payment</h1>
      <div className="ck-amount-row">
        <span className="ck-amount-label">Amount to be paid</span>
        <span className="ck-secure"><CkIcon name="lock" size={14}/> Secure Payment</span>
      </div>
      <div className="ck-amount" style={{marginBottom:24}}>€ {b.total.toFixed(2)}</div>

      {isBiz && (
        <div className="ck-biz-reminder">
          <CkIcon name="info" size={18}/>
          <div>
            <strong>Remember to use your Business card</strong>
            <span>This stay will be invoiced to {form.companyName || 'your company'}. Pay with the company card so your records stay aligned.</span>
          </div>
        </div>
      )}

      <div className="ck-card-box">
        <div className="ck-card-box-head">
          <span className="ck-radio-dot" style={{borderColor:'var(--ink)'}}><span className="ck-radio-inner" style={{transform:'scale(1)'}}></span></span>
          <CkIcon name="card" size={18}/>
          <span>Card</span>
          <div className="ck-card-logos">
            <span className="ck-card-logo">VISA</span>
            <span className="ck-card-logo" style={{color:'#EB001B'}}>MC</span>
            <span className="ck-card-logo" style={{color:'#006FCF'}}>AMEX</span>
          </div>
        </div>
        <div className="ck-field" style={{marginBottom:14}}>
          <label className="ck-label">Cardholder name</label>
          <input className="ck-input" type="text" value={cardName} onChange={e=>setCardName(e.target.value)} placeholder="Jordan Smith"/>
        </div>
        <div className="ck-field" style={{marginBottom:14}}>
          <label className="ck-label">Card number</label>
          <input className="ck-input" type="text" value={cardNum} onChange={e=>setCardNum(e.target.value)} placeholder="1234 1234 1234 1234" maxLength={19}/>
        </div>
        <div className="ck-row">
          <div className="ck-field" style={{marginBottom:0}}>
            <label className="ck-label">Expiry date</label>
            <input className="ck-input" type="text" value={expiry} onChange={e=>setExpiry(e.target.value)} placeholder="MM/YY" maxLength={5}/>
          </div>
          <div className="ck-field" style={{marginBottom:0}}>
            <label className="ck-label">Security code</label>
            <input className="ck-input" type="text" value={cvv} onChange={e=>setCvv(e.target.value)} placeholder="CVV" maxLength={4}/>
          </div>
        </div>
        <button className="ck-pay-btn" onClick={onNext}>
          <CkIcon name="lock" size={16}/> Pay
        </button>
      </div>

      <div className="ck-alt-pay">
        <span className="ck-alt-pay-radio"></span>
        <span className="ck-alt-pay-badge" style={{background:'#000',color:'#fff'}}>Pay</span>
        <span>Apple Pay</span>
      </div>
      <div className="ck-alt-pay">
        <span className="ck-alt-pay-radio"></span>
        <span className="ck-alt-pay-badge">G Pay</span>
        <span>Google Pay</span>
      </div>
    </div>
  );
}

/* ── STEP 3: CONFIRMATION ── */
function Confirmation({booking}) {
  const b = booking || fallback;
  const sd = new Date(b.startDate);
  const ed = new Date(b.endDate);
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fmt = (d) => `${m[d.getMonth()]} ${String(d.getDate()).padStart(2,'0')}, ${d.getFullYear()}`;
  const confId = 'AVX-' + Math.random().toString(36).substr(2,8).toUpperCase();

  // Mark user as having trips
  useEffect(() => {
    localStorage.setItem('avexa_has_trips', 'true');
  }, []);

  return (
    <div className="ck-main">
      <div className="ck-confirm">
        <div className="ck-confirm-icon">
          <CkIcon name="check" size={40} sw={2.5}/>
        </div>
        <h2>Booking confirmed!</h2>
        <p>Your stay at {b.property.name} is all set. We've sent the confirmation details to your email.</p>
        <div className="ck-confirm-id">{confId}</div>
        <div className="ck-confirm-details">
          <div className="ck-confirm-row"><span className="k">Property</span><span className="v">{b.property.name}</span></div>
          <div className="ck-confirm-row"><span className="k">Check-in</span><span className="v">{fmt(sd)}, 3:00 PM</span></div>
          <div className="ck-confirm-row"><span className="k">Check-out</span><span className="v">{fmt(ed)}, 11:00 AM</span></div>
          <div className="ck-confirm-row"><span className="k">Guests</span><span className="v">{b.guests.adults + b.guests.children}</span></div>
          <div className="ck-confirm-row"><span className="k">Rate</span><span className="v">{b.rate.name}</span></div>
          <div className="ck-confirm-row"><span className="k">Total paid</span><span className="v" style={{color:'var(--gold-dark)', fontWeight:800}}>€ {b.total}</span></div>
          <div className="ck-confirm-row"><span className="k">Door code</span><span className="v" style={{color:'var(--gold-dark)', fontStyle:'italic'}}>Sent 24h before</span></div>
        </div>
        <div className="ck-confirm-actions">
          <a href="my-trips.html" className="ck-confirm-btn primary">View My Trips</a>
          <a href="locations.html" className="ck-confirm-btn outline">Browse more stays</a>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN APP ── */
function CheckoutApp() {
  const [step, setStep] = useState(1);
  const booking = getBooking() || fallback;
  const user = getUser();
  const [form, setForm] = useState(() => {
    const parts = (user?.name || '').trim().split(/\s+/).filter(Boolean);
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
      email: user?.email || '',
      prefix: '+40', phone: '',
      street: '', city: '', country: '',
      accountType: 'individual', bookFor: 'self',
      companyName: '', vatNumber: '', regNumber: '',
      companyStreet: '', companyCity: '', companyCountry: '',
    };
  });

  // Login gate — redirect to login if not authenticated
  if (!user || !user.loggedIn) {
    return (
      <div style={{minHeight:'calc(100vh - 68px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'80px 24px',background:'var(--cream)'}}>
        <div style={{textAlign:'center',maxWidth:420}}>
          <div style={{width:72,height:72,borderRadius:18,background:'var(--gold-pale)',display:'grid',placeItems:'center',margin:'0 auto 24px'}}><CkIcon name="lock" size={32} sw={1.5}/></div>
          <h2 style={{fontFamily:"'Plus Jakarta Sans'",fontWeight:800,fontSize:28,letterSpacing:'-0.02em',marginBottom:12}}>Sign in to book</h2>
          <p style={{fontSize:15,lineHeight:1.7,color:'var(--ink-80)',marginBottom:32}}>Log in or create a free account to complete your reservation. Your member discount will be applied automatically.</p>
          <a href="login.html" style={{display:'inline-flex',alignItems:'center',gap:8,background:'var(--ink)',color:'#fff',padding:'17px 36px',borderRadius:9999,fontWeight:700,fontSize:15,textDecoration:'none',transition:'background .25s'}}>Log in or sign up →</a>
        </div>
      </div>
    );
  }

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({top:0, behavior:'smooth'});
  }, [step]);

  return (
    <>
      <Stepper step={step}/>
      <div className={`ck-layout ${step === 3 ? 'ck-layout-confirm' : ''}`}>
        {step === 1 && <ContactInfo booking={booking} form={form} setForm={setForm} onNext={() => setStep(2)}/>}
        {step === 2 && <Payment booking={booking} form={form} onNext={() => setStep(3)}/>}
        {step === 3 && <Confirmation booking={booking}/>}
        {step < 3 && <BookingSummary booking={booking}/>}
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('checkoutRoot')).render(<CheckoutApp/>);
