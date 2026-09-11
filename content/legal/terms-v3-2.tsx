import Link from 'next/link';

/** AVX-01 · Terms & Conditions · v3.2 · in force 1 September 2026. Verbatim body — do not reword. */
export function TermsV32() {
  return (
    <>
      <h2>1. Who we are</h2>
      <p>
        The AVEXA Stays service is operated by Prime Gold Living SRL, Str. Fibrei 28,
        Sector 2, 020342 București, Romania (CUI RO52265361, Trade Register
        J2025057993006). Full company details are in our <Link href="/imprint">Imprint</Link>.
      </p>

      <h2>2. The service</h2>
      <p>
        We offer fully furnished apartments in central Bucharest for short and medium
        stays, booked directly through this website with digital, front-desk-free
        check-in. Each listing describes the apartment, its amenities, its
        classification details and any apartment-specific rules.
      </p>
      <p>
        Our apartments are classified tourist accommodation structures under Romanian
        law. The classification certificate number and, where applicable, the
        national registration number of each unit are published on that unit&apos;s own
        page.
      </p>

      <h2>3. Booking and contract</h2>
      <p>
        To make a booking you must be at least 18 years old and act as the lead
        guest. A booking is a request to stay for the dates and apartment you select.
        The contract is formed when we confirm your booking by email and your payment
        or payment guarantee has been successfully processed.
      </p>
      <p>
        As required by Romanian law, a valid government-issued ID or passport must be
        provided for every guest before check-in. We may decline or cancel a booking
        in the case of payment failure, suspected fraud, failure to provide
        identification, breach of these Terms, or unavailability of the apartment. In
        those cases any eligible amount already paid is refunded in full.
      </p>

      <h2>4. Prices, taxes and payment</h2>
      <p>
        Prices are shown by default in RON (Romanian lei), per apartment, per night,
        for the number of guests selected. You can optionally display them in euro
        (EUR) or US dollars (USD); the conversion is automatic, at the official
        National Bank of Romania (BNR) exchange rate of the previous day plus 1%. All
        charges are collected in RON; any amount expressed in euro in our documents is
        charged in RON at the same rate.
      </p>
      <p>The price shown at the moment of payment is the price that applies.</p>
      <p>Prices include Romanian VAT at the applicable rate. Your invoice shows the VAT separately.</p>
      <p>
        Local accommodation tax: Bucharest applies a local accommodation tax to short
        stays. Where it is not shown as included in your booking confirmation, it is
        collected at check-in against a receipt. We never request undocumented cash
        payments.
      </p>
      <p>
        Payment is taken securely through our payment provider, Stripe. We do not
        store your full card details.
      </p>
      <p>
        Depending on the rate plan you choose, we either charge the full amount at
        booking or pre-authorise your card as a guarantee. See the{' '}
        <Link href="/cancellation">Cancellation Policy</Link>.
      </p>
      <p>
        A VAT invoice is issued for every stay. If you need it made out to a company,
        fill in the company details (name, address, CUI/VAT number) in the dedicated
        fields at online check-in.
      </p>

      <h2>5. Right of withdrawal</h2>
      <div className="my-6 rounded-xl border border-gray-line bg-cream px-5 py-4">
        <p className="mb-2 font-semibold text-ink">STATUTORY EXCEPTION — PLEASE READ</p>
        <p className="mb-0">
          Accommodation services provided for a specific date or period are exempt
          from the 14-day right of withdrawal that normally applies to distance
          contracts. This exception is set out in Article 16(l) of Romanian
          Government Emergency Ordinance 34/2014, which implements Directive
          2011/83/EU. By booking, you acknowledge that you do not have a 14-day
          cooling-off period. Your cancellation rights are instead the contractual
          ones set out in our <Link href="/cancellation">Cancellation Policy</Link>.
        </p>
      </div>

      <h2>6. Check-in, check-out and access</h2>
      <p>
        Standard check-in is from 15:00 and standard check-out is by 11:00, unless
        your confirmation states otherwise — for example, where you have purchased an
        early check-in or late check-out service.
      </p>
      <p>
        Access codes and instructions are released once your online check-in is
        complete and all guest identification has been provided.
      </p>
      <p>
        Your access PIN is personal to your booking. Do not share it with anyone who
        is not a registered guest.
      </p>
      <p>
        Early check-in and late check-out are chargeable upgrades, subject to
        availability. See our <Link href="/extra-services">Extra Services &amp; Tariffs</Link>{' '}
        document.
      </p>

      <h2>7. Your responsibilities as a guest</h2>
      <p>Accurate information: provide correct booking and guest details. Only registered guests may stay overnight.</p>
      <p>
        Respect the property and the building: this is a residential building with
        permanent residents. Our <Link href="/house-rules">House Rules</Link> apply in
        full.
      </p>
      <p>
        Quiet hours: Romanian law protects residents&apos; rest between 22:00–08:00
        and 13:00–14:00 (Law 61/1991, Art. 2(26)).
      </p>
      <p>
        No parties or events; no smoking or vaping indoors. Both carry penalties set
        out in the <Link href="/damage-policy">Damage &amp; Penalties Policy</Link>.
      </p>
      <p>Pets: not permitted unless the apartment listing expressly states otherwise and we have confirmed in writing.</p>
      <p>
        Lawful use only: the apartment may be used for residential accommodation
        purposes only, never for commercial activity, subletting or filming without
        our written consent.
      </p>

      <h2>8. Damage, penalties and your payment method</h2>
      <p>
        We take no security deposit. You are responsible for damage, loss or
        extraordinary cleaning caused during your stay by you or anyone you allow
        into the apartment. Our <Link href="/damage-policy">Damage &amp; Penalties Policy</Link>{' '}
        sets out the announced penalty schedule, how we evidence a claim, how we
        notify you and how you can dispute a charge. We will not charge your payment
        method for damage or penalties without first sending you dated evidence and
        giving you the opportunity to respond, except where the amount was expressly
        agreed in advance.
      </p>

      <h2>9. Cancellation</h2>
      <p>
        Cancellations, modifications, no-shows and early departures are governed by
        our <Link href="/cancellation">Cancellation Policy</Link>, which forms a
        binding part of these Terms. Bookings made directly on avexastays.com follow
        the member and non-member rules in that policy. Bookings made through a
        booking platform (Airbnb, Booking.com and similar) follow the cancellation
        option you selected on that platform.
      </p>

      <h2>10. If we cannot provide the apartment</h2>
      <p>
        Very occasionally an apartment becomes unusable at short notice — a water
        leak, a building-wide utility failure, or damage caused by a previous guest.
        If that happens we will, at our choice and at no extra cost to you:
      </p>
      <ul>
        <li>move you to another AVEXA apartment of the same or higher standard for the same dates; or</li>
        <li>if no suitable apartment is available, cancel the affected nights and refund them in full.</li>
      </ul>
      <p>
        Our liability in these circumstances is limited to the refund and, where the
        relocation is to a materially different location, reasonable transfer costs.
        We are not liable for consequential losses such as missed events or
        non-refundable travel arrangements. We strongly recommend travel insurance.
      </p>

      <h2>11. Force majeure</h2>
      <p>
        Neither party is liable for failure to perform caused by events outside its
        reasonable control, including natural disasters, earthquakes, fire, flood,
        epidemic, war, terrorism, strikes, government orders, or failure of public
        utilities or transport networks. If such an event prevents the stay, we will
        refund all amounts paid for the affected nights. Neither party owes the
        other further compensation.
      </p>

      <h2>12. Liability</h2>
      <p>
        We provide the apartment as described and take reasonable care to keep it
        safe and the listing accurate. To the extent permitted by law, we are not
        liable for indirect or consequential loss, or for loss of or damage to
        personal belongings left in the apartment. Nothing in these Terms excludes
        or limits liability for death or personal injury caused by our negligence,
        for fraud, or any other liability that cannot be limited under Romanian law.
        Mandatory consumer rights are unaffected.
      </p>

      <h2>13. Complaints and dispute resolution</h2>
      <p>
        Tell us first — we resolve almost everything within a day. Write to{' '}
        <a href="mailto:office@avexastays.com">office@avexastays.com</a> with your
        booking reference. We acknowledge complaints within 48 hours and give a
        substantive answer within 15 calendar days.
      </p>
      <p>
        If you are not satisfied, you may contact the Romanian National Authority for
        Consumer Protection (ANPC, anpc.ro) or submit the dispute to alternative
        dispute resolution through the ANPC SAL system.
      </p>
      <div className="my-6 rounded-xl border border-gray-line bg-cream px-5 py-4">
        <p className="mb-2 font-semibold text-ink">NOTE ON THE FORMER EU ODR PLATFORM</p>
        <p className="mb-0">
          The European Online Dispute Resolution platform was permanently
          discontinued on 20 July 2025 by Regulation (EU) 2024/3228. References to
          it have been removed from all our documents.
        </p>
      </div>

      <h2>14. Governing law</h2>
      <p>
        These Terms are governed by Romanian law. Mandatory consumer-protection
        rules of your country of residence remain unaffected. Courts of Bucharest,
        Romania have jurisdiction, without prejudice to any right a consumer has to
        bring proceedings in their own country of residence.
      </p>

      <h2>15. Changes</h2>
      <p>
        We may update these Terms from time to time. The version that applies to
        your stay is the one published on this page at the moment you complete your
        booking. We keep dated previous versions and can send you the one that
        applied to your booking on request.
      </p>

      <p>
        AVEXA Stays is a trading name of Prime Gold Living SRL, Str. Fibrei 28,
        Sector 2, 020342 București, Romania. CUI RO52265361, Trade Register
        J2025057993006. Contact: office@avexastays.com, +40 721 347 642.
      </p>
    </>
  );
}
