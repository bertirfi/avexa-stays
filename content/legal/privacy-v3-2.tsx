import { CONTACT_EMAIL } from '@/lib/contact';

/**
 * AVX-06 · PUB Privacy Policy · v3.2 · in force 1 September 2026.
 * Body text is verbatim from the client's official document — do not reword,
 * shorten, or "improve" it. Only docx artefacts (cover lines, DOCUMENT CLASS
 * box, page footer) were dropped when mounting; the closing company block is
 * kept per source.
 */
export function PrivacyPolicyV3_2() {
  return (
    <>
      <h2>1. Who we are</h2>
      <p>
        Prime Gold Living SRL, trading as AVEXA Stays, is the data controller for
        the personal data described in this policy.
      </p>
      <div className="overflow-x-auto">
        <table>
          <tbody>
            <tr>
              <th>Controller</th>
              <td>Prime Gold Living SRL</td>
            </tr>
            <tr>
              <th>Registered office</th>
              <td>Str. Fibrei 28, Sector 2, 020342 București, Romania</td>
            </tr>
            <tr>
              <th>CUI / Trade Register</th>
              <td>RO52265361 / J2025057993006</td>
            </tr>
            <tr>
              <th>Privacy contact</th>
              <td>
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </td>
            </tr>
            <tr>
              <th>Data Protection Officer</th>
              <td>
                Not appointed — not required under Art. 37 GDPR for our scale of
                processing. Privacy questions go to the address above.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>2. What we collect and why</h2>
      <p>
        We collect only what we need to host you legally and well. Each purpose
        has a legal basis under Article 6 GDPR:
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Purpose</th>
              <th>Legal basis</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Name, contact details, billing address</td>
              <td>Managing your booking and your stay</td>
              <td>Art. 6(1)(b) — performance of a contract</td>
            </tr>
            <tr>
              <td>
                Identity-document details of every guest (passport or national ID
                card — text details only, never photographs or scans)
              </td>
              <td>
                Mandatory registration of tourists at arrival under Government
                Decision 237/2001; reporting non-EU nationals to the immigration
                authority
              </td>
              <td>Art. 6(1)(c) — legal obligation</td>
            </tr>
            <tr>
              <td>Payment and transaction data</td>
              <td>Taking payment, refunds, evidenced damage claims</td>
              <td>Art. 6(1)(b) and Art. 6(1)(c) for accounting</td>
            </tr>
            <tr>
              <td>Booking, stay and service preferences</td>
              <td>Delivering the stay and the extras you request</td>
              <td>Art. 6(1)(b)</td>
            </tr>
            <tr>
              <td>Messages with our online reception (WhatsApp, e-mail)</td>
              <td>Guest support and record of what was agreed</td>
              <td>Art. 6(1)(b) and Art. 6(1)(f) — our legitimate interest in resolving disputes</td>
            </tr>
            <tr>
              <td>Damage evidence (photographs, reports)</td>
              <td>Establishing, exercising or defending a claim</td>
              <td>Art. 6(1)(f) — legitimate interest</td>
            </tr>
            <tr>
              <td>Marketing emails, if you opt in</td>
              <td>Offers and news about AVEXA apartments</td>
              <td>Art. 6(1)(a) — consent, withdrawable at any time</td>
            </tr>
            <tr>
              <td>Website cookies and analytics</td>
              <td>See our Cookie Policy</td>
              <td>Consent, except strictly necessary cookies</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="my-6 rounded-lg border border-gold/30 bg-gold/5 px-5 py-4">
        <p className="font-mono-label mb-2 text-ink">WHAT WE DO NOT DO</p>
        <p className="mb-0">
          We do not sell your data. We do not profile you. We do not use
          automated decision-making that produces legal effects for you. We do
          not install cameras or any recording device inside our apartments —
          not in any room, not on any balcony.
        </p>
      </div>

      <h2>3. Who we share it with</h2>
      <p>Stripe Payments Europe Ltd. — payment processing. Full card numbers are never stored on our systems.</p>
      <p>
        IT, hosting and booking-system providers — to run the website, the
        Guest Portal and the smart locks, under written data-processing
        agreements.
      </p>
      <p>Booking platforms — where you booked through them, and only as needed to manage that reservation.</p>
      <p>
        Public authorities — tourism, police and immigration authorities, and
        ANAF, strictly where Romanian law requires it.
      </p>
      <p>Our accountant and, if needed, our lawyer — under professional confidentiality.</p>

      <h2>4. International transfers</h2>
      <p>
        Our data stays in the European Economic Area wherever possible. Where a
        provider processes data outside the EEA, we rely on an adequacy
        decision of the European Commission or on the Standard Contractual
        Clauses, and we can send you a copy of the safeguards on request.
      </p>

      <h2>5. How long we keep it</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Retention</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Booking and stay records</td>
              <td>3 years from the end of the stay (limitation period for contractual claims)</td>
            </tr>
            <tr>
              <td>Financial and billing records</td>
              <td>10 years, as required by Romanian accounting and tax law</td>
            </tr>
            <tr>
              <td>Guest registration records (arrival/departure forms)</td>
              <td>5 years, as required by Government Decision 237/2001, then deleted</td>
            </tr>
            <tr>
              <td>Damage evidence</td>
              <td>Until the claim is resolved, then 3 years</td>
            </tr>
            <tr>
              <td>Guest messages</td>
              <td>2 years</td>
            </tr>
            <tr>
              <td>Marketing consent</td>
              <td>Until you withdraw it, then a suppression record only</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>6. How we protect it</h2>
      <p>Access is limited to the two owners and the specific staff who need it for a task.</p>
      <p>
        Identity documents are stored encrypted and are never sent over
        WhatsApp or ordinary email.
      </p>
      <p>Access PINs are unique per booking and expire at check-out.</p>
      <p>We keep a record of processing activities and review it annually.</p>

      <h2>7. Your rights</h2>
      <p>
        Under the GDPR you have the right to access your data, to have it
        corrected, to have it erased where no legal obligation requires us to
        keep it, to restrict or object to processing, to data portability, and
        to withdraw consent at any time without affecting processing already
        carried out.
      </p>
      <p>
        Write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We
        answer within one month, and will tell you if we need to extend that
        period.
      </p>

      <div className="my-6 rounded-lg border border-gold/30 bg-gold/5 px-5 py-4">
        <p className="font-mono-label mb-2 text-ink">YOUR RIGHT TO COMPLAIN</p>
        <p className="mb-0">
          If you are not satisfied with how we handle your data, you may lodge
          a complaint with the Romanian supervisory authority: Autoritatea
          Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal
          (ANSPDCP), B-dul G-ral. Gheorghe Magheru 28–30, Sector 1, București —
          dataprotection.ro. You may also complain to the authority in your own
          country of residence.
        </p>
      </div>

      <h2>8. Children</h2>
      <p>
        Our service is not directed at children. Bookings can only be made by
        adults. Where children stay as part of a booking, we collect only the
        identity data required by law and only from the accompanying adult.
      </p>

      <h2>9. Changes</h2>
      <p>
        We may update this policy to reflect changes in law or in how we work.
        The current version is always published at avexastays.com, with the
        date it took effect.
      </p>

      <p>
        AVEXA Stays is a trading name of Prime Gold Living SRL, Str. Fibrei 28,
        Sector 2, 020342 București, Romania. CUI RO52265361, Trade Register
        J2025057993006. Contact: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>, +40 721 347 642.
      </p>
    </>
  );
}
