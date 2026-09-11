import { CONTACT_EMAIL } from '@/lib/contact';

/**
 * AVX-08 · PUB Extra Services & Tariffs · v3.2 · in force 1 September 2026.
 * Verbatim body — docx artefacts (cover lines, DOCUMENT CLASS box, page
 * footer) dropped when mounting; closing company block kept per source.
 * Prices here must match lib/extras.ts (verified equal at mount time).
 */
export function ExtraServicesV3_2() {
  return (
    <>
      <p>
        Everything below can be requested through My Trips or by WhatsApp.
        Prices are per stay unless stated otherwise, include VAT, and are
        confirmed to you before anything is charged. They are collected in
        RON; amounts shown in another display currency are converted at the
        official BNR exchange rate of the previous day plus 1%. You will
        never find an unagreed line on your bill.
      </p>

      <h2>1. Included in every stay, at no extra charge</h2>
      <p>Wi-Fi, bed linen, bath towels, and starter supplies of coffee, tea, soap and toilet paper.</p>
      <p>Professional cleaning, freshened and sanitised before arrival, and the final check-out cleaning.</p>
      <p>Fast human support on WhatsApp, in English and Romanian.</p>
      <p>
        Restaurant bookings, local recommendations, and practical help in
        Romanian: calling a pharmacy, a doctor, or a museum ticket line.
      </p>
      <p>Cot or high chair, free on request, subject to availability — ask before booking.</p>

      <h2>2. The catalogue — ten services, one page</h2>
      <p>
        Packages are prepared once, for your arrival. They are not
        re-stocked during the stay. Lead time is 24 hours unless shown
        otherwise.
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>What it includes</th>
              <th>Price</th>
              <th>Request</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Early check-in</td>
              <td>Arrive from 13:00 instead of 15:00, subject to availability</td>
              <td>RON 119</td>
              <td>My Trips, 24h ahead</td>
            </tr>
            <tr>
              <td>Late check-out</td>
              <td>Keep the apartment until 13:00 instead of 11:00, subject to availability</td>
              <td>RON 119</td>
              <td>My Trips, the evening before</td>
            </tr>
            <tr>
              <td>Time &amp; Cravings</td>
              <td>
                Early check-in + late check-out + a Romanian snack tray waiting
                in the apartment (Buzău pretzels, sweets, water)
              </td>
              <td>RON 259</td>
              <td>My Trips, 24h ahead</td>
            </tr>
            <tr>
              <td>Mid-journey Cleaning</td>
              <td>
                A full professional clean during your stay, including a fresh
                set of bed linen and towels
              </td>
              <td>RON 99 / 129 / 149 for 1 / 2 / 3-room apartments</td>
              <td>My Trips, 24h ahead</td>
            </tr>
            <tr>
              <td>Deep Sleep &amp; Recovery</td>
              <td>
                Premium ear plugs, sleep mask, shower steamers, self-heating
                eye masks, lavender sachet
              </td>
              <td>RON 169</td>
              <td>My Trips, 24h ahead</td>
            </tr>
            <tr>
              <td>Cinema Cravings</td>
              <td>
                Gourmet popcorn, Romanian pretzels, premium tonic water or
                lemonade — the clean movie-night kit
              </td>
              <td>RON 139</td>
              <td>My Trips, 24h ahead</td>
            </tr>
            <tr>
              <td>Family Travel Light</td>
              <td>
                Stay-long rental: ergonomic baby carrier + white-noise device,
                with washable protections
              </td>
              <td>RON 129 / stay</td>
              <td>My Trips, 24h ahead</td>
            </tr>
            <tr>
              <td>Premium Self-Care</td>
              <td>Korean sheet masks, hydrogel eye patches, shower steamers — sealed, and yours to keep</td>
              <td>RON 169</td>
              <td>My Trips, 24h ahead</td>
            </tr>
            <tr>
              <td>Surprise Setup</td>
              <td>
                15–20 premium balloons inflated in the apartment, a
                hand-written card, non-alcoholic sparkling wine
              </td>
              <td>RON 229</td>
              <td>My Trips, 72h ahead</td>
            </tr>
            <tr>
              <td>Romanian Keepsake</td>
              <td>Sealed gift box: magnet, artisan soap, jarred honey, local tea — the take-home souvenir</td>
              <td>RON 169</td>
              <td>My Trips, 24h ahead</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Introductory prices, reviewed quarterly. Jacuzzi &amp; Home Spa and
        further packages arrive later, on selected apartments, and will
        unlock from Gold tier upward.
      </p>

      <h2>3. Paying with AVX Coins</h2>
      <p>
        Anyone can buy any service above with money. Paying with AVX Coins is
        a membership benefit: all ten services unlock from Silver tier
        upward, at 1 AVX = 1 RON. Future premium services will unlock from
        Gold upward. Platinum and Diamond members can additionally apply AVX
        to the net accommodation amount of a direct booking at 2 AVX = 1
        RON. Full rules in the AVEXIAN Club Terms (AVX-11).
      </p>

      <h2>4. Not available</h2>
      <p>
        There is no minibar and no room service in our apartments. Where a
        kitchen is provided, it is yours to use freely. We do not offer
        airport transfers, parking arrangements or late-night arrival
        assistance — self check-in works at any hour, and public parking
        guidance is in your check-in link.
      </p>

      <h2>5. Accommodation tax and invoicing</h2>
      <p>
        Bucharest&rsquo;s local accommodation tax is applied as required by
        law. Where it is not already included in your booking, it is
        collected at check-in against a receipt.
      </p>
      <p>
        A VAT invoice is issued for every stay. Fill in your company details
        in the dedicated fields at online check-in if you need it made out
        to a business.
      </p>
      <p>We do not ask for undocumented cash payments, for any service.</p>

      <h2>6. Cancelling an extra</h2>
      <p>
        An extra service can be cancelled free of charge up to the lead time
        shown above. After that, services we have already bought in or
        prepared (packages, decorations) are charged in full. Items left
        behind can be posted back at courier cost plus a RON 29 handling fee
        — message us within 7 days of departure.
      </p>

      <p>
        AVEXA Stays is a trading name of Prime Gold Living SRL, Str. Fibrei 28,
        Sector 2, 020342 București, Romania. CUI RO52265361, Trade Register
        J2025057993006. Contact: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>, +40 721 347 642.
      </p>
    </>
  );
}
