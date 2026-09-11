import Link from 'next/link';

/** AVX-02 · Cancellation & Modification Policy · v3.2 · in force 1 September 2026. Verbatim body — do not reword. */
export function CancellationV32() {
  return (
    <>
      <p>
        Which rules apply depends on where you booked. Your booking confirmation
        states which regime covers your stay.
      </p>

      <h2>1. Booked directly on avexastays.com — AVEXIAN members</h2>
      <p>
        AVEXA membership is free and unlocks flexible cancellation by right, on
        every direct booking:
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>When you cancel</th>
              <th>What you get back</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>72 hours or more before check-in</td>
              <td>100% refund</td>
            </tr>
            <tr>
              <td>Between 72 and 24 hours before check-in</td>
              <td>50% refund</td>
            </tr>
            <tr>
              <td>Under 24 hours before check-in, or no-show</td>
              <td>No refund</td>
            </tr>
            <tr>
              <td>City tax</td>
              <td>Always refunded in full, on any cancellation</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>2. Booked directly — without membership</h2>
      <p>
        Non-member bookings are non-refundable from the moment of booking. Online
        booking currently requires a free AVEXA membership account, so this applies
        once guest checkout without an account opens.
      </p>

      <h2>3. Booked through a platform (Airbnb, Booking.com and similar)</h2>
      <p>
        Your cancellation terms are the ones you selected on that platform at the
        time of booking — typically a Flexible or a Non-Refundable rate. The
        platform&apos;s confirmation is authoritative for those bookings; this page
        does not override it. Refunds for platform bookings are processed through
        the platform.
      </p>

      <h2>4. Early departure</h2>
      <p>
        If you leave before your scheduled check-out date, the remaining nights are
        not refunded, under any of the regimes above. Please still tell us — we
        need to know the apartment is empty.
      </p>

      <h2>5. Modifications</h2>
      <p>
        Date or apartment changes on a direct member booking follow the same grid
        as cancellation: free while you are 72 hours out, subject to availability
        and any price difference.
      </p>
      <p>
        Adding guests beyond the number booked requires our approval and may
        change the price. Unregistered guests are never permitted.
      </p>
      <p>Shortening a stay after the applicable deadline is treated as an early departure (section 4).</p>

      <h2>6. No-show</h2>
      <p>
        If you have not arrived and have not contacted us by 12:00 on the day
        after your scheduled check-in, the booking is treated as a no-show and the
        apartment is released. Tell us if you are simply arriving late — we hold
        the apartment for you at no charge.
      </p>

      <h2>7. Refunds</h2>
      <p>
        Eligible refunds on direct bookings are issued to the original payment
        method, without undue delay and in any case within 14 calendar days of the
        cancellation being confirmed. Your bank may need a further 5–10 business
        days to show the amount. We never deduct a processing fee from a refund we
        owe you. AVX Coins redeemed on a cancelled booking are re-credited in the
        same proportion as the cash refund — see the{' '}
        <Link href="/avexian-club-terms">AVEXIAN Club Terms (AVX-11)</Link>.
      </p>

      <h2>8. If we cancel, and force majeure</h2>
      <p>
        If we cancel a confirmed booking for any reason other than your breach of
        the Terms, you receive a full refund of everything paid, including the
        city tax, or we will offer an equivalent AVEXA apartment where one is
        available. If the stay becomes impossible because of an event outside
        either party&apos;s reasonable control, the remaining affected nights are
        refunded in full under every regime, including non-refundable rates.
      </p>

      <div className="my-6 rounded-xl border border-gray-line bg-cream px-5 py-4">
        <p className="mb-2 font-semibold text-ink">NO 14-DAY COOLING-OFF PERIOD</p>
        <p className="mb-0">
          Accommodation booked for a specific date or period is exempt from the
          statutory 14-day right of withdrawal under Art. 16(l) of Romanian
          Government Emergency Ordinance 34/2014. The rights on this page are your
          contractual cancellation rights.
        </p>
      </div>

      <p>
        AVEXA Stays is a trading name of Prime Gold Living SRL, Str. Fibrei 28,
        Sector 2, 020342 București, Romania. CUI RO52265361, Trade Register
        J2025057993006. Contact: office@avexastays.com, +40 721 347 642.
      </p>
    </>
  );
}
