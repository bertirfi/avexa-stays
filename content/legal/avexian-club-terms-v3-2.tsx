import Link from 'next/link';

/** AVX-11 · AVEXIAN Club — Programme Terms · v3.2 · in force 1 September 2026. Verbatim body — do not reword. */
export function AvexianClubTermsV32() {
  return (
    <>
      <p>
        The AVEXIAN Club is the loyalty programme of AVEXA Stays, operated by Prime
        Gold Living SRL. These terms govern membership, tiers and AVX Coins. They
        form part of the <Link href="/terms">Terms &amp; Conditions</Link>.
      </p>

      <h2>1. Membership</h2>
      <p>Membership is free. You must be at least 18 and hold one account per person, in your own name.</p>
      <p>Membership starts at Bronze tier and is required for direct online booking on avexastays.com.</p>
      <p>We may refuse or close an account used fraudulently or in breach of these terms (section 9).</p>

      <h2>2. Tiers and progression</h2>
      <p>
        Your tier is recalculated on a rolling 12-month window. Both thresholds —
        completed stays AND nights — must be met. A completed stay is one that was
        not cancelled and was actually occupied.
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Tier</th>
              <th>Stays (rolling 12 months)</th>
              <th>Nights (rolling 12 months)</th>
              <th>Earning rate</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Bronze</td>
              <td>joining level</td>
              <td>—</td>
              <td>5%</td>
            </tr>
            <tr>
              <td>Silver</td>
              <td>2+</td>
              <td>5+</td>
              <td>8%</td>
            </tr>
            <tr>
              <td>Gold</td>
              <td>3+</td>
              <td>10+</td>
              <td>10%</td>
            </tr>
            <tr>
              <td>Platinum</td>
              <td>5+</td>
              <td>20+</td>
              <td>12.5%</td>
            </tr>
            <tr>
              <td>Diamond</td>
              <td>7+</td>
              <td>35+</td>
              <td>15%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        If the rolling window drops you below a threshold, your tier adjusts at the
        next recalculation. Coins already earned keep their original value and
        expiry.
      </p>

      <h2>3. Earning AVX</h2>
      <p>You earn the percentage above of the net accommodation value of each completed stay booked directly on avexastays.com.</p>
      <p>
        Net accommodation value means the accommodation price excluding VAT, city
        tax, cleaning fees, extra services and any amount paid with AVX.
      </p>
      <p>Coins are credited within 72 hours after check-out.</p>
      <p>Stays cancelled by you or terminated for breach earn no coins.</p>
      <p>Platform bookings (Airbnb, Booking.com and similar) do not earn AVX.</p>

      <h2>4. Value and spending</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Tier</th>
              <th>What you can spend AVX on</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Bronze</td>
              <td>Earning only — spending unlocks from Silver</td>
              <td>—</td>
            </tr>
            <tr>
              <td>Silver and above</td>
              <td>
                The full current extra-services catalogue (
                <Link href="/extra-services">AVX-08</Link> — all ten services)
              </td>
              <td>1 AVX = 1 RON</td>
            </tr>
            <tr>
              <td>Gold and above</td>
              <td>Future premium services, as they are introduced</td>
              <td>1 AVX = 1 RON</td>
            </tr>
            <tr>
              <td>Platinum &amp; Diamond</td>
              <td>Additionally: the net accommodation amount of a direct booking, up to 100% of it</td>
              <td>2 AVX = 1 RON</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>AVX never covers VAT, city tax or cleaning fees — these are always paid in money.</p>
      <p>Coins are spent oldest-first (first earned, first spent).</p>
      <p>
        The exact catalogue is shown in your account and in{' '}
        <Link href="/extra-services">Extra Services &amp; Tariffs (AVX-08)</Link>.
        Anyone can buy any service with money, regardless of tier — the unlocks
        apply to paying with AVX.
      </p>

      <h2>5. Expiry</h2>
      <div className="my-6 rounded-xl border border-gray-line bg-cream px-5 py-4">
        <p className="mb-2 font-semibold text-ink">365 DAYS</p>
        <p className="mb-0">
          Each AVX Coin expires 365 days after the day it was earned. Expiry runs
          per coin, not per account — earning new coins does not extend old ones.
          Your account shows the expiry date of every batch, and we remind you
          before a batch expires. Expired coins are removed and cannot be
          reinstated.
        </p>
      </div>

      <h2>6. Cancellations and refunds</h2>
      <p>
        Member cancellation rights are in the{' '}
        <Link href="/cancellation">Cancellation Policy (AVX-02)</Link>: 100%
        refund at 72+ hours, 50% between 72 and 24 hours, none under 24 hours; city
        tax always refunded.
      </p>
      <p>AVX redeemed on a cancelled booking is re-credited in the same proportion as the cash refund, with the original expiry dates.</p>
      <p>AVX that would have been earned on a cancelled stay is not credited.</p>

      <h2>7. Nature of AVX</h2>
      <p>AVX Coins are a promotional benefit. They are not money, not electronic money, not a voucher and not a security.</p>
      <p>They have no cash value, cannot be bought, sold, transferred or inherited, and are never paid out in cash.</p>
      <p>They belong to the account, and the account belongs to one person.</p>

      <h2>8. Taxes and invoicing</h2>
      <p>
        Where AVX is applied, the invoice shows the price and the AVX discount
        transparently. Any tax treatment of the benefit in your own country is your
        responsibility.
      </p>

      <h2>9. Fair use and fraud</h2>
      <p>
        Creating multiple accounts, self-referral schemes, chargeback abuse, or
        earning coins on stays that are resold or not genuinely occupied leads to
        removal of the coins involved and may lead to account closure. We will
        always tell you what we found and give you the chance to respond before
        closing an account.
      </p>

      <h2>10. Changes and termination of the programme</h2>
      <p>
        We may amend these terms and the earning or spending rates with 30 days&apos;
        notice by email. Changes never reduce the value or shorten the expiry of
        coins already earned.
      </p>
      <p>We may end the programme with 90 days&apos; notice. You then have those 90 days to spend your balance, after which remaining coins lapse.</p>

      <h2>11. Data</h2>
      <p>
        Programme data is processed as described in our{' '}
        <Link href="/privacy">Privacy Policy (AVX-06)</Link>, on the legal basis of
        the contract between us. Marketing emails remain opt-in and separate from
        programme emails.
      </p>

      <p>
        AVEXA Stays is a trading name of Prime Gold Living SRL, Str. Fibrei 28,
        Sector 2, 020342 București, Romania. CUI RO52265361, Trade Register
        J2025057993006. Contact: office@avexastays.com, +40 721 347 642.
      </p>
    </>
  );
}
