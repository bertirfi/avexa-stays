/* Stay page — Main App */

function StayApp() {
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);
  const [amenOpen, setAmenOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  // Close popups on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('.cal-popup') && !e.target.closest('.bc-row')) {
        document.querySelectorAll('.cal-popup.open').forEach((el) => el.classList.remove('open'));
      }
    };
    // Escape key closes modals
    const esc = (e) => {
      if (e.key === 'Escape') {
        setAmenOpen(false);
        setMapOpen(false);
      }
    };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, []);

  return (
    <>
      {/* Breadcrumb */}
      <nav className="stay-breadcrumb">
        <a href="locations.html">Locations</a>
        <span className="sep">›</span>
        <a href="locations.html">{PROPERTY.neighborhood || 'City Centre'}</a>
        <span className="sep">›</span>
        <span style={{ color: 'var(--ink)' }}>{PROPERTY.subtitle || PROPERTY.name}</span>
      </nav>

      {/* Gallery */}
      <Gallery onOpen={(i) => {setLbIndex(i);setLbOpen(true);}} data-comment-anchor="9a87b90a41-div-10-152" />

      {/* Lightbox */}
      <Lightbox open={lbOpen} index={lbIndex}
      onClose={() => setLbOpen(false)}
      onChange={(i) => setLbIndex(i)} />

      {/* Main layout */}
      <div className="stay-layout">
        <div className="stay-left">
          <PropertyHeader />
          <Description />
          <AmenitiesSection onShowAll={() => setAmenOpen(true)} />
          <GoodToKnow />
          <FAQSection />
          <LocationSection onShowMap={() => setMapOpen(true)} />
          <TestimonialsSection />
          <InlineMapSection data-comment-anchor="c7106e19ac-div-336-9" />
        </div>
        <BookingSidebar />
      </div>

      {/* Modals */}
      <AmenityModal open={amenOpen} onClose={() => setAmenOpen(false)} />
      <MapModal open={mapOpen} onClose={() => setMapOpen(false)} />
    </>);

}

ReactDOM.createRoot(document.getElementById('stayRoot')).render(<StayApp />);