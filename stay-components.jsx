/* Stay page — Gallery + Lightbox + Modals */

/* ════ GALLERY ════ */
function Gallery({ onOpen }) {
  return (
    <div className="stay-gallery">
      <div className="gallery-grid" onClick={() => onOpen(0)}>
        {PHOTOS.slice(0, 5).map((p, i) =>
        <div className="g-img" key={p.id} onClick={(e) => {e.stopPropagation();onOpen(i);}}>
            {p.src ? <img src={p.src} alt={p.label} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : <div className="g-ph" style={{ background: p.bg }}></div>}
            {i === 4 &&
          <button className="g-show-all" onClick={(e) => {e.stopPropagation();onOpen(0);}}>
                <StayIcon name="grid" size={16} sw={2} />
                Show all photos
              </button>
          }
          </div>
        )}
      </div>
    </div>);

}

/* ════ LIGHTBOX ════ */
function Lightbox({ open, index, onClose, onChange }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onChange(Math.min(index + 1, PHOTOS.length - 1));
      if (e.key === 'ArrowLeft') onChange(Math.max(index - 1, 0));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, index]);

  const photo = PHOTOS[index] || PHOTOS[0];
  return (
    <div className={`lightbox-overlay ${open ? 'open' : ''}`} onClick={onClose}>
      <button className="lb-close" onClick={onClose}>✕</button>
      <span className="lb-counter">{index + 1} / {PHOTOS.length}</span>
      <div className="lb-img" onClick={(e) => e.stopPropagation()}>
        {photo.src ? <img src={photo.src} alt={photo.label} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : <div className="g-ph" style={{ background: photo.bg }}></div>}
      </div>
      {index > 0 &&
      <button className="lb-arrow prev" onClick={(e) => {e.stopPropagation();onChange(index - 1);}}>
          <StayIcon name="chevLeft" size={22} sw={2.5} />
        </button>
      }
      {index < PHOTOS.length - 1 &&
      <button className="lb-arrow next" onClick={(e) => {e.stopPropagation();onChange(index + 1);}}>
          <StayIcon name="chevRight" size={22} sw={2.5} />
        </button>
      }
    </div>);

}

/* ════ AMENITY MODAL ════ */
function AmenityModal({ open, onClose }) {
  const [tab, setTab] = useState('property');

  if (!open) return null;
  const data = tab === 'room' ? AMENITIES_ROOM : AMENITIES_PROPERTY;

  return (
    <>
      <div className={`stay-modal-backdrop ${open ? 'open' : ''}`} onClick={onClose}></div>
      <div className={`stay-modal ${open ? 'open' : ''}`}>
        <div className="sm-head">
          <h3>All Amenities</h3>
          <button className="sm-close" onClick={onClose}>✕</button>
        </div>
        <div className="sm-body">
          <div className="sm-tabs">
            <button className={`sm-tab ${tab === 'property' ? 'active' : ''}`} onClick={() => setTab('property')}>Property Amenities</button>
            <button className={`sm-tab ${tab === 'room' ? 'active' : ''}`} onClick={() => setTab('room')}>Room Amenities</button>
          </div>
          {tab === 'room' &&
          <p style={{ fontSize: 13, color: 'var(--ink-60)', marginBottom: 16 }}>
              <strong style={{ fontWeight: 600, color: 'var(--ink)' }}>2 Bedroom Apartment · {PROPERTY.subtitle || ''}</strong><br />
              The available amenities may differ based on the room type.
            </p>
          }
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px 32px' }}>
            {Object.entries(data).map(([cat, items]) =>
            <div key={cat} style={{ marginBottom: 16 }}>
                <div className="am-cat-title">{cat}</div>
                {items.map((item) =>
              <div className="am-cat-item" key={item}>
                    <StayIcon name="check" size={16} />
                    <span>{item}</span>
                  </div>
              )}
              </div>
            )}
          </div>
          <div className="am-standard">
            <h4><StayIcon name="info" size={16} /> AVEXA Standard Amenities</h4>
            <ul style={{ padding: 0, margin: 0 }}>
              {AVEXA_STANDARD.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </>);

}

/* ════ MAP MODAL ════ */
function MapModal({ open, onClose }) {
  if (!open) return null;
  return (
    <>
      <div className={`stay-modal-backdrop ${open ? 'open' : ''}`} onClick={onClose}></div>
      <div className={`map-modal ${open ? 'open' : ''}`}>
        <button className="mm-close" onClick={onClose}>✕</button>
        <div className="mm-info">
          <h3>Neighbourhood of {PROPERTY.subtitle || PROPERTY.name}</h3>
          <div className="mm-addr">
            <StayIcon name="copy" size={14} />
            <span>{PROPERTY.address}</span>
          </div>
          {Object.entries(NEARBY).map(([cat, places]) =>
          <div key={cat} style={{ marginBottom: 18 }}>
              <div className="mm-cat-title">{cat}</div>
              {places.map((p) =>
            <div className="mm-place" key={p.name}>
                  <span className="name"><StayIcon name="pin" size={14} /> {p.name}</span>
                  <span className="dist">{p.dist}</span>
                </div>
            )}
            </div>
          )}
        </div>
        <div className="mm-map">
          <iframe
            src="https://maps.google.com/maps?q=Calea+Victoriei+Bucharest+Romania&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"
            title="Map">
          </iframe>
        </div>
      </div>
    </>);

}

/* ════ PROPERTY SECTIONS ════ */
function PropertyHeader() {
  return (
    <div className="prop-header">
      <div className="prop-nbh">
        <span className="dot" style={{ background: PROPERTY.nbhColor }}></span>
        {PROPERTY.neighborhood}
      </div>
      <h1 className="prop-title">{PROPERTY.name}</h1>
      {PROPERTY.subtitle && <div className="prop-subtitle">{PROPERTY.subtitle}</div>}
      <p className="prop-tagline" style={{ fontWeight: "500" }}>{PROPERTY.tagline}</p>
      <div className="prop-stats">
        {PROPERTY.stats.map((s) =>
        <span className="prop-stat" key={s.label}>
            <StayIcon name={s.icon} size={16} sw={1.8} /> {s.label}
          </span>
        )}
      </div>
    </div>);

}

function Description() {
  const [expanded, setExpanded] = useState(false);
  const paras = PROPERTY.description.split('\n\n');
  const pitchParas = PROPERTY.pitch ? PROPERTY.pitch.split('\n\n') : [];
  const shown = expanded ? paras : paras.slice(0, 2);
  return (
    <div className="stay-section">
      <h2 className="stay-section-title">About this space</h2>
      <div className="desc-text">
        {shown.map((p, i) => <p key={i}>{p}</p>)}
      </div>
      {!expanded && paras.length > 2 &&
      <button className="desc-more" onClick={() => setExpanded(true)}>Show more ↓</button>
      }
      {pitchParas.length > 0 &&
      <>
          <h2 className="stay-section-title" style={{ marginTop: 32 }}>The pitch</h2>
          <div className="desc-text">
            {pitchParas.map((p, i) => <p key={`pitch-${i}`}>{p}</p>)}
          </div>
        </>
      }
    </div>);

}

function AmenitiesSection({ onShowAll }) {
  return (
    <div className="stay-section">
      <h2 className="stay-section-title">Room amenities</h2>
      <div className="amen-grid">
        {AMENITIES_TOP.map((a) =>
        <div className="amen-item" key={a}>
            <StayIcon name="check" size={18} /> {a}
          </div>
        )}
      </div>
      <button className="amen-show-all" onClick={onShowAll}>
        Show all amenities
      </button>
    </div>);

}

function GoodToKnow() {
  return (
    <div className="stay-section">
      <h2 className="stay-section-title">Good to know</h2>
      <div className="gtk-grid">
        <div className="gtk-card">
          <StayIcon name="clock" size={24} />
          <h4>Check-in</h4>
          <p>{HOUSE_RULES.checkin}<br />{HOUSE_RULES.earlyCheckin}</p>
        </div>
        <div className="gtk-card">
          <StayIcon name="moon" size={24} />
          <h4>Check-out</h4>
          <p>{HOUSE_RULES.checkout}<br />{HOUSE_RULES.lateCheckout}</p>
        </div>
        <div className="gtk-card">
          <StayIcon name="key" size={24} />
          <h4>House rules</h4>
          <p>{HOUSE_RULES.maxGuests} guests maximum<br />{HOUSE_RULES.rules.join(' · ')}</p>
        </div>
      </div>
    </div>);

}

function FAQSection() {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div className="stay-section">
      <h2 className="stay-section-title">Frequently asked questions</h2>
      <div className="faq-list">
        {FAQ.map((item, i) =>
        <div key={i} className={`faq-item ${openIdx === i ? 'open' : ''}`}>
            <button className="faq-q" onClick={() => setOpenIdx(openIdx === i ? null : i)}>
              <span>{item.question}</span>
              <StayIcon name={openIdx === i ? 'minus' : 'plus'} size={18} sw={2} />
            </button>
            <div className="faq-a" style={{ maxHeight: openIdx === i ? '200px' : '0', overflow: 'hidden', transition: 'max-height .35s cubic-bezier(.16,1,.3,1)' }}>
              <p style={{ padding: '12px 0 4px' }}>{item.answer}</p>
            </div>
          </div>
        )}
      </div>
    </div>);

}

function LocationSection({ onShowMap }) {
  return (
    <div className="stay-section">
      <h2 className="stay-section-title">Location</h2>
      <div className="loc-addr">
        <StayIcon name="pin" size={18} />
        <span>{PROPERTY.address}</span>
      </div>
      <button className="loc-show-map" onClick={onShowMap}>Show on map →</button>
    </div>);

}

/* ════ TESTIMONIALS ════ */
function TestimonialsSection() {
  const testimonials = window.TESTIMONIALS;
  if (!testimonials || testimonials.length === 0) return null;
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? testimonials : testimonials.slice(0, 4);

  return (
    <div className="stay-section">
      <h2 className="stay-section-title">Guest reviews</h2>
      <div className="reviews-summary">
        <span className="reviews-score">
          <StayIcon name="star" size={18} /> 5.0
        </span>
        <span className="reviews-count">{testimonials.length} reviews</span>
      </div>
      <div className="reviews-grid">
        {shown.map((r, i) =>
        <div className="review-card" key={i}>
            <div className="review-head">
              <div className="review-avatar">{r.name.charAt(0)}</div>
              <div className="review-meta">
                <strong>{r.name}</strong>
                {r.location && <span className="review-loc">{r.location}</span>}
              </div>
            </div>
            <div className="review-stars">
              {[...Array(r.rating)].map((_, j) => <StayIcon key={j} name="star" size={12} />)}
              <span className="review-date">{r.date}</span>
              {r.stay && <span className="review-stay"> · {r.stay}</span>}
            </div>
            <p className="review-text">{r.text}</p>
          </div>
        )}
      </div>
      {!showAll && testimonials.length > 4 &&
      <button className="amen-show-all" onClick={() => setShowAll(true)}>
          Show all {testimonials.length} reviews
        </button>
      }
    </div>);

}

/* ════ INLINE MAP (bottom of page) ════ */
function InlineMapSection() {
  const addr = PROPERTY.address ? PROPERTY.address.replace(/\s/g, '+') : 'Bucharest+Romania';
  return (
    <div className="stay-section">
      <h2 className="stay-section-title">Where you'll be</h2>
      <p style={{ fontSize: 14, color: 'var(--ink-60)', marginBottom: 16 }}>{PROPERTY.address}</p>
      <div className="inline-map">
        <iframe
          src={`https://maps.google.com/maps?q=${addr}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
          width="100%" height="100%" style={{ border: 0, borderRadius: 16 }} allowFullScreen="" loading="lazy"
          title="Map">
        </iframe>
      </div>
      {window.NEARBY &&
      <div className="nearby-grid" style={{ fontSize: "16px" }}>
          {Object.entries(NEARBY).map(([cat, places]) =>
        <div key={cat} className="nearby-col">
              <h4 className="nearby-cat" style={{ fontSize: "14px" }}>{cat}</h4>
              {places.map((p) =>
          <div className="nearby-item" key={p.name}>
                  <span>{p.name}</span>
                  <span className="nearby-dist">{p.dist}</span>
                </div>
          )}
            </div>
        )}
        </div>
      }
    </div>);

}

Object.assign(window, {
  Gallery, Lightbox, AmenityModal, MapModal,
  PropertyHeader, Description, AmenitiesSection, GoodToKnow, FAQSection, LocationSection,
  TestimonialsSection, InlineMapSection
});