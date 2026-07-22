/* Stay page — Booking sidebar */

/* ════ CALENDAR ════ */
function CalendarPopup({ open, startDate, endDate, onSelect, onConfirm, onClose }) {
  const [baseMonth, setBaseMonth] = useState(5); // June 2026 = month index 5
  const months = [baseMonth, baseMonth + 1];

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dow = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  function getDays(monthIdx) {
    const year = 2026;
    const m = monthIdx % 12;
    const first = new Date(year, m, 1);
    const lastDay = new Date(year, m + 1, 0).getDate();
    let startDow = first.getDay(); // 0=Sun
    startDow = startDow === 0 ? 6 : startDow - 1; // shift to Mon=0
    const days = [];
    for (let i = 0; i < startDow; i++) days.push(null);
    for (let d = 1; d <= lastDay; d++) days.push(d);
    return days;
  }

  function isInRange(monthIdx, day) {
    if (!startDate || !endDate || !day) return false;
    const dt = new Date(2026, monthIdx % 12, day);
    return dt > startDate && dt < endDate;
  }
  function isStart(monthIdx, day) {
    if (!startDate || !day) return false;
    return startDate.getMonth() === monthIdx % 12 && startDate.getDate() === day;
  }
  function isEnd(monthIdx, day) {
    if (!endDate || !day) return false;
    return endDate.getMonth() === monthIdx % 12 && endDate.getDate() === day;
  }
  function isDisabled(monthIdx, day) {
    if (!day) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dt = new Date(2026, monthIdx % 12, day);
    return dt < today;
  }

  const nights = startDate && endDate ? Math.round((endDate - startDate) / 86400000) : 0;

  return (
    <div className={`cal-popup ${open ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
      <div className="cal-months">
        {months.map((mi, idx) =>
        <div key={mi}>
            <div className="cal-month-head">
              {idx === 0 ?
            <button onClick={() => setBaseMonth(Math.max(4, baseMonth - 1))}>
                  <StayIcon name="chevLeft" size={12} sw={2.5} />
                </button> :
            <span></span>}
              <h5>{monthNames[mi % 12]} 2026</h5>
              {idx === 1 ?
            <button onClick={() => setBaseMonth(Math.min(10, baseMonth + 1))}>
                  <StayIcon name="chevRight" size={12} sw={2.5} />
                </button> :
            <span></span>}
            </div>
            <div className="cal-days">
              {dow.map((d) => <span className="cal-dow" key={d}>{d}</span>)}
              {getDays(mi).map((day, i) => {
              const disabled = isDisabled(mi, day);
              const start = isStart(mi, day);
              const end = isEnd(mi, day);
              const inRange = isInRange(mi, day);
              let cls = 'cal-day';
              if (!day) cls += ' disabled';else
              if (disabled) cls += ' disabled';else
              {
                if (start) cls += ' start';
                if (end) cls += ' end';
                if (inRange) cls += ' in-range';
              }
              return (
                <span key={i} className={cls}
                onClick={() => day && !disabled && onSelect(new Date(2026, mi % 12, day))}>
                    {day || ''}
                  </span>);

            })}
            </div>
          </div>
        )}
      </div>
      <div className="cal-footer">
        <span>{nights} night{nights !== 1 ? 's' : ''}</span>
        <button className="cal-confirm" onClick={onConfirm}>Confirm</button>
      </div>
    </div>);

}

/* ════ GUEST POPUP ════ */
function GuestPopup({ open, guests, onUpdate, onApply, onCancel }) {
  const maxTotal = 6;
  const total = guests.adults + guests.children;
  return (
    <div className={`guest-popup ${open ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
      <div className="gp-cap">
        <StayIcon name="info" size={14} /> max {maxTotal} guests capacity
      </div>
      {[
      { key: 'adults', label: 'Adults', sub: 'Age 13 and above', min: 1 },
      { key: 'children', label: 'Children', sub: 'Age 2–12', min: 0 },
      { key: 'infants', label: 'Infants', sub: 'Under 2 years old', min: 0 }].
      map((row) =>
      <div className="gp-row" key={row.key}>
          <div className="gp-row-label">
            <h5>{row.label}</h5>
            <span>{row.sub}</span>
          </div>
          <div className="gp-controls">
            <button className={`gp-btn ${guests[row.key] <= row.min ? 'disabled' : ''}`}
          onClick={() => onUpdate(row.key, -1)}>
              <StayIcon name="minus" size={14} sw={2.5} />
            </button>
            <span className="gp-count">{guests[row.key]}</span>
            <button className={`gp-btn ${row.key !== 'infants' && total >= maxTotal ? 'disabled' : ''}`}
          onClick={() => onUpdate(row.key, 1)}>
              <StayIcon name="plus" size={14} sw={2.5} />
            </button>
          </div>
        </div>
      )}
      <div className="gp-footer">
        <button className="gp-cancel" onClick={onCancel}>Cancel</button>
        <button className="gp-apply" onClick={onApply}>Apply</button>
      </div>
    </div>);

}

/* ════ BOOKING SIDEBAR ════ */
function BookingSidebar() {
  const [startDate, setStartDate] = useState(new Date(2026, 5, 1));
  const [endDate, setEndDate] = useState(new Date(2026, 5, 6));
  const [calOpen, setCalOpen] = useState(false);
  const [calSelecting, setCalSelecting] = useState(null); // null, 'start', or 'end'
  const [tempStart, setTempStart] = useState(null);
  const [tempEnd, setTempEnd] = useState(null);

  const [guests, setGuests] = useState({ adults: 1, children: 0, infants: 0 });
  const [tempGuests, setTempGuests] = useState({ adults: 1, children: 0, infants: 0 });
  const [guestOpen, setGuestOpen] = useState(false);

  const [rate, setRate] = useState('saver');
  const [upgrades, setUpgrades] = useState({ breakfast: false, late_checkout: false, early_checkin: false });

  const [priceOpen, setPriceOpen] = useState(false);

  const nights = Math.round((endDate - startDate) / 86400000);
  const totalGuests = guests.adults + guests.children + (guests.infants > 0 ? ` + ${guests.infants} infant${guests.infants > 1 ? 's' : ''}` : '');
  const guestLabel = `${guests.adults + guests.children} guest${guests.adults + guests.children !== 1 ? 's' : ''}${guests.infants > 0 ? ` + ${guests.infants} infant${guests.infants > 1 ? 's' : ''}` : ''}`;

  const selectedRate = RATES.find((r) => r.id === rate);
  const regularPerNight = 175;
  const subtotal = regularPerNight * nights;
  const discountAmt = Math.round(subtotal * selectedRate.discount / 100);
  const afterDiscount = subtotal - discountAmt;

  const breakfastTotal = upgrades.breakfast ? 20 * nights * (guests.adults + guests.children) : 0;
  const cityTax = 3 * nights * (guests.adults + guests.children);
  const total = afterDiscount + breakfastTotal + cityTax;

  const fmt = (d) => {
    const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${m[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
  };

  function handleCalSelect(date) {
    if (!tempStart || tempStart && tempEnd) {
      setTempStart(date);setTempEnd(null);
    } else {
      if (date <= tempStart) {setTempStart(date);setTempEnd(null);} else
      setTempEnd(date);
    }
  }

  function openCal() {
    if (calOpen) { setCalOpen(false); return; }
    setTempStart(startDate);setTempEnd(endDate);setCalOpen(true);setGuestOpen(false);
  }
  function confirmCal() {
    if (tempStart && tempEnd) {setStartDate(tempStart);setEndDate(tempEnd);}
    setCalOpen(false);
  }

  function openGuests() {
    if (guestOpen) { setGuestOpen(false); return; }
    setTempGuests({ ...guests });setGuestOpen(true);setCalOpen(false);
  }
  function updateTempGuest(key, delta) {
    setTempGuests((prev) => {
      const v = Math.max(key === 'adults' ? 1 : 0, prev[key] + delta);
      if (key !== 'infants' && prev.adults + prev.children + delta > 4 && delta > 0) return prev;
      return { ...prev, [key]: v };
    });
  }

  function handleBook() {
    const booking = {
      property: PROPERTY,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      nights, guests, rate: selectedRate, upgrades,
      subtotal, discountAmt, afterDiscount, breakfastTotal, cityTax, total
    };
    localStorage.setItem('avexa_booking', JSON.stringify(booking));
    window.location.href = 'checkout.html';
  }

  return (
    <div className="stay-right">
      <div className="booking-card">
        <h3 className="bc-title">Book your stay</h3>

        {/* Dates */}
        <div className="bc-row" onClick={openCal} style={{ position: 'relative' }}>
          <span className="bc-row-label">Arrival / departure</span>
          <span className="bc-row-value">
            {fmt(startDate)} – {fmt(endDate)}
            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: 'var(--ink-60)', strokeWidth: 2, fill: 'none' }}>
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </span>
          <CalendarPopup open={calOpen}
          startDate={tempStart || startDate} endDate={tempEnd || endDate}
          onSelect={handleCalSelect} onConfirm={confirmCal} onClose={() => setCalOpen(false)} />
        </div>

        {/* Guests */}
        <div className="bc-row" onClick={openGuests} style={{ position: 'relative' }}>
          <span className="bc-row-label">Room 1</span>
          <span className="bc-row-value">
            {guestLabel}
            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: 'var(--ink-60)', strokeWidth: 2, fill: 'none' }}>
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </span>
          <GuestPopup open={guestOpen} guests={tempGuests}
          onUpdate={updateTempGuest}
          onApply={() => {setGuests({ ...tempGuests });setGuestOpen(false);}}
          onCancel={() => setGuestOpen(false)} />
        </div>

        {/* Add room */}
        <div className="bc-add-room">
          <StayIcon name="plus" size={14} sw={2} /> Add a room (5 left)
        </div>

        {/* Member benefits banner */}
        <div className="bc-member-banner">
          <strong>Member Benefits applied</strong>
          <span>Congrats, you're getting our best rate ({selectedRate.discount}% off applied)</span>
        </div>

        {/* Rate selection */}
        <div className="rate-section">
          <div className="rate-section-title">Select your rate</div>
          {RATES.map((r) => {
            const rateTotal = r.perNight * nights;
            const isActive = rate === r.id;
            return (
              <div key={r.id} className={`rate-card ${isActive ? 'active' : ''}`}
              onClick={() => setRate(r.id)}>
                <div className="rate-card-top">
                  <span className="rate-card-name">
                    <span className="rate-radio"><span className="rate-radio-dot"></span></span>
                    {r.name}
                  </span>
                  <span className="rate-card-price">€ {r.perNight}<small> / night</small>
                    <StayIcon name={isActive ? 'chevDown' : 'chevRight'} size={14} sw={2} />
                  </span>
                </div>
                {isActive && (
                  <>
                    <ul className="rate-perks">
                      <li style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>€ {rateTotal} total for {nights} nights</li>
                      {r.perks.map((p, i) => <li key={i} style={{ fontSize: "15px" }}>{p}</li>)}
                      {r.warn && <li style={{ color: 'var(--ink-60)' }}>{r.warn}</li>}
                      {r.highlight && <li className="highlight">{r.highlight}</li>}
                    </ul>
                    {r.cancelNote && <div className="rate-cancel-note">{r.cancelNote}</div>}
                  </>
                )}
              </div>);

          })}
        </div>

        {/* Upgrades */}
        <div className="upgrade-section">
          <div className="upgrade-section-title">Upgrade your stay</div>
          <div className="upgrade-cards">
            {UPGRADES.map((u) =>
            <div key={u.id}
            className={`upgrade-card ${upgrades[u.id] ? 'active' : ''}`}
            onClick={() => setUpgrades((prev) => ({ ...prev, [u.id]: !prev[u.id] }))}>
                <div className="uc-toggle">{upgrades[u.id] ? '✓' : '+'}</div>
                <div className="uc-icon">
                  <StayIcon name={u.id === 'breakfast' ? 'coffee' : u.id === 'late_checkout' ? 'moon' : 'sunrise'} size={24} />
                </div>
                <div className="uc-name">{u.name}</div>
                {u.free ?
              <>
                    <div className="uc-price" style={{ textDecoration: 'line-through' }}>€ {u.price}</div>
                    <div className="uc-free">Free</div>
                  </> :

              <div className="uc-price">€ {u.price} {u.unit}</div>
              }
              </div>
            )}
          </div>
        </div>

        {/* Price breakdown */}
        <div className="price-section">
          <div className={`price-toggle ${priceOpen ? 'open' : ''}`} onClick={() => setPriceOpen(!priceOpen)}>
            <h4>Price breakdown</h4>
            <StayIcon name="chevDown" size={16} sw={2} />
          </div>
          <div className="price-rows" style={{ maxHeight: priceOpen ? '400px' : '0', overflow: 'hidden' }}>
            <div className="price-row">
              <span className="pr-label">€ {regularPerNight} × {nights} nights</span>
              <span className="pr-val">€ {subtotal}</span>
            </div>
            <div className="price-row discount">
              <span className="pr-label">member discount –{selectedRate.discount}%</span>
              <span className="pr-val" style={{ color: '#2E7D32' }}>– € {discountAmt}</span>
            </div>
            {upgrades.breakfast &&
            <div className="price-row">
                <span className="pr-label">Breakfast · € 20 × {nights} days × {guests.adults + guests.children}</span>
                <span className="pr-val">€ {breakfastTotal}</span>
              </div>
            }
            <div className="price-row">
              <span className="pr-label">City Tax</span>
              <span className="pr-val">€ {cityTax}</span>
            </div>
          </div>
          <div className="price-total">
            <span className="price-total-label">Taxes and charges incl.</span>
            <span className="price-total-badge">Total € {total}</span>
          </div>
        </div>

        {/* CTA */}
        <button className="bc-cta" onClick={handleBook}>Book best rate →</button>
      </div>
    </div>);

}

Object.assign(window, { BookingSidebar });