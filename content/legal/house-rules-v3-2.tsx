import Link from 'next/link';

/** AVX-04 · House Rules & Local Guidelines · v3.2 · in force 1 September 2026. Verbatim body — do not reword. */
export function HouseRulesV32() {
  return (
    <>
      <p>
        Welcome to Bucharest. Our apartments sit in ordinary residential buildings,
        with families and long-term neighbours. These rules are what keeps us
        welcome here — and what lets us keep hosting you. Please read them once;
        they take two minutes.
      </p>

      <h2>1. Quiet hours — required by Romanian law</h2>
      <div className="my-6 rounded-xl border border-gray-line bg-cream px-5 py-4">
        <p className="mb-2 font-semibold text-ink">22:00 – 08:00 AND 13:00 – 14:00</p>
        <p className="mb-0">
          Romanian Law 61/1991, Art. 2(26), makes disturbing residents&apos; peace
          during these hours a punishable offence. Romanians know this law well and
          neighbours do call the police. Fines are issued to the person causing the
          noise. Please keep music and voices low during these windows, especially
          near open windows and on the staircase.
        </p>
      </div>

      <h2>2. No parties or events</h2>
      <p>
        Gatherings, parties and commercial photo or video shoots are strictly
        prohibited. A breach ends the stay immediately, with no refund, and carries
        a €500 penalty. This is not negotiable — a single party can cost us an
        apartment permanently.
      </p>

      <h2>3. No smoking, anywhere indoors</h2>
      <p>
        Smoking, vaping and e-cigarettes are forbidden inside the apartment and in
        the building&apos;s common areas, including the staircase and the balcony
        where the listing says so. Our apartments have smart sensors. A breach
        carries a €200 professional cleaning fee. You are very welcome to smoke
        outside the building.
      </p>

      <h2>4. Only registered guests</h2>
      <p>
        Only the guests named on your booking may stay overnight. Romanian law
        requires us to register every guest by name and identity document.
      </p>
      <p>Daytime visitors are fine, within reason and within quiet hours.</p>
      <p>Your access PIN is personal. Please do not give it to visitors, delivery drivers or anyone else.</p>

      <h2>5. Treat the space with care</h2>
      <p>Please leave rubbish in a closed bag by the kitchen bin. You do not need to take it out — our team does.</p>
      <p>Close the windows and switch off the air conditioning and lights when you go out.</p>
      <p>Do not move furniture between rooms or remove anything from the apartment.</p>
      <p>Tell us straight away if something breaks or leaks. Anything reported in good faith is not charged to you.</p>

      <h2>6. Safety</h2>
      <p>Emergency number: 112 — free, 24/7, answered in Romanian and English.</p>
      <p>Do not leave cooking or the bath unattended. Open flames are not permitted and candles are forbidden.</p>
      <p>Keep the apartment door and the building street door locked. Never prop the building entrance open.</p>
      <p>Windows and the staircase are not childproofed. Please supervise children.</p>

      <p>
        What happens if a rule is broken. Minor issues we simply talk about. Serious
        breaches — a party, smoking indoors, unregistered guests, or behaviour that
        puts our relationship with the building at risk — end the stay immediately
        without refund, and the penalties in our{' '}
        <Link href="/damage-policy">Damage &amp; Penalties Policy</Link> apply.
        Every penalty is evidenced and you always get the chance to respond.
      </p>

      <p>Make yourself at home. Enjoy the city, sleep well, and message us the moment anything is not right. We are always a text away.</p>

      <p>Your hosts, Anca &amp; Vlad — AVEXA Stays</p>

      <p>
        AVEXA Stays is a trading name of Prime Gold Living SRL, Str. Fibrei 28,
        Sector 2, 020342 București, Romania. CUI RO52265361, Trade Register
        J2025057993006. Contact: office@avexastays.com, +40 721 347 642.
      </p>
    </>
  );
}
