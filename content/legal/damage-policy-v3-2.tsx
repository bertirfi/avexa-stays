import Link from 'next/link';

/** AVX-03 · Damage & Penalties Policy · v3.2 · in force 1 September 2026. Verbatim body — do not reword. */
export function DamagePolicyV32() {
  return (
    <>
      <p>
        This policy exists to protect two things: the apartment, and your right to
        a fair, evidenced process. We do not make speculative charges, and we
        never charge without telling you first.
      </p>

      <h2>1. No deposit, no card hold</h2>
      <div className="my-6 rounded-xl border border-gray-line bg-cream px-5 py-4">
        <p className="mb-2 font-semibold text-ink">WE CURRENTLY TAKE NO SECURITY DEPOSIT</p>
        <p className="mb-0">
          We do not collect a deposit and we do not place pre-authorisation holds
          on your card. The only amounts that can ever be charged after booking are
          the announced penalties and evidenced damage costs described below,
          following the process in sections 4 and 5. We may introduce a deposit or
          pre-authorisation for future bookings; if we do, it will be stated
          clearly before you book and will never apply retroactively.
        </p>
      </div>

      <h2>2. Announced penalties</h2>
      <p>
        These amounts are fixed in advance because the real cost of putting the
        apartment back into service is predictable. They are not arbitrary and
        they are not for profit. They are shown before booking and accepted at
        online check-in. Penalties are charged in RON, at the official National
        Bank of Romania (BNR) exchange rate of the previous day plus 1%.
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Breach</th>
              <th>Penalty</th>
              <th>What it covers</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Smoking or vaping indoors</td>
              <td>€200</td>
              <td>
                Specialised deep clean, air purification, textile and curtain
                treatment, and the night lost while it is done.
              </td>
            </tr>
            <tr>
              <td>Party, event or unauthorised gathering</td>
              <td>€500 + immediate termination of the stay, no refund</td>
              <td>
                Deep clean, neighbour and building-management remediation, risk to
                our licence to operate.
              </td>
            </tr>
            <tr>
              <td>Unregistered overnight guest</td>
              <td>€100 per person, per night</td>
              <td>Breach of the legal guest-registration duty and of the occupancy limit.</td>
            </tr>
            <tr>
              <td>Unauthorised late check-out</td>
              <td>€50 per hour started, after 11:00</td>
              <td>Disruption to the cleaning schedule and to the next guest&apos;s arrival.</td>
            </tr>
            <tr>
              <td>Lost keys or access fob (where applicable) (where applicable)</td>
              <td>€100</td>
              <td>Cylinder replacement and re-keying of all copies for the apartment.</td>
            </tr>
            <tr>
              <td>Sharing the access PIN with a non-guest</td>
              <td>€100</td>
              <td>Security reset of the smart lock and re-issue of codes.</td>
            </tr>
            <tr>
              <td>Excessive cleaning beyond normal use</td>
              <td>At documented cost</td>
              <td>Only where the state of the apartment goes clearly beyond ordinary use.</td>
            </tr>
            <tr>
              <td>Missing inventory items</td>
              <td>Replacement cost</td>
              <td>Like-for-like replacement, evidenced by purchase invoice.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Penalties are cumulative where more than one breach occurs. They are
        additional to, not instead of, the cost of repairing any physical damage.
      </p>

      <h2>3. Damage versus fair wear and tear</h2>
      <p>We do not charge for ordinary use. The following are never charged:</p>
      <ul>
        <li>Normal marks on floors, walls and furniture consistent with ordinary use.</li>
        <li>Ageing or wear of textiles, fittings and appliances.</li>
        <li>A stain on bed linen or a towel that comes out in a normal wash.</li>
        <li>A single broken glass, plate or mug.</li>
        <li>Anything that was already there and that you reported by 12:00 (noon) on the day after your check-in.</li>
      </ul>
      <p>
        We do charge for damage caused by misuse, negligence or breach of the{' '}
        <Link href="/house-rules">House Rules</Link> — for example broken
        furniture, burns, water damage from an unattended tap, damage to
        appliances, or textiles that cannot be recovered.
      </p>
      <div className="my-6 rounded-xl border border-gray-line bg-cream px-5 py-4">
        <p className="mb-2 font-semibold text-ink">REPORT IT AND YOU ARE PROTECTED</p>
        <p className="mb-0">
          Anything you report to us in good faith reported by 12:00 (noon) on the
          day after your check-in is recorded against the previous booking, not
          yours. Send us a photo and a message — it takes thirty seconds and it is
          the best protection you have.
        </p>
      </div>

      <h2>4. How a claim is evidenced</h2>
      <p>Before any charge, we compile and send you:</p>
      <ul>
        <li>Dated photographs of the damage taken by our cleaning or maintenance team at check-out.</li>
        <li>The corresponding photograph from the pre-arrival inspection of the same apartment, showing the item intact.</li>
        <li>A repair or replacement quote or invoice from a third party, or our documented internal cost.</li>
        <li>Where relevant, third-party evidence such as a smoke-sensor alert log, a neighbour complaint, or a building-management notice.</li>
      </ul>

      <h2>5. Notice and your right to respond</h2>
      <p>We notify you by email within 7 calendar days of your check-out. After that period no claim is made for damage.</p>
      <p>You have 14 calendar days from our notice to respond, provide your own evidence or dispute the claim.</p>
      <p>We do not charge your card during that 14-day window unless you confirm the amount in writing.</p>
      <p>For bookings made through a platform, claims follow that platform&apos;s resolution process (for example Airbnb AirCover) within its deadlines.</p>
      <p>
        If we cannot agree, the complaints route in section 13 of the{' '}
        <Link href="/terms">Terms &amp; Conditions</Link> applies, including ANPC.
      </p>

      <h2>6. Limits</h2>
      <p>We charge the documented cost of repair or replacement, never a mark-up.</p>
      <p>Where an item is repairable, we repair rather than replace.</p>
      <p>Where a replaced item was already partly worn, we apply a fair reduction for its age.</p>

      <h2>7. Insurance</h2>
      <p>
        We recommend that every guest carries personal travel insurance including
        third-party liability. Most policies cover accidental damage to rented
        accommodation, which means an accident costs you nothing. We are happy to
        provide a signed damage statement for your insurer.
      </p>

      <h2>8. Lost property</h2>
      <p>
        We keep items left behind for 7 days from the day of your departure. Tell
        us what and where, and we will look. Return postage is at cost plus a
        handling fee shown in our{' '}
        <Link href="/extra-services">Extra Services &amp; Tariffs</Link>.
        Perishables and items of no value are disposed of.
      </p>

      <p>
        AVEXA Stays is a trading name of Prime Gold Living SRL, Str. Fibrei 28,
        Sector 2, 020342 București, Romania. CUI RO52265361, Trade Register
        J2025057993006. Contact: office@avexastays.com, +40 721 347 642.
      </p>
    </>
  );
}
