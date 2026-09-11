import Link from 'next/link';

/** AVX-10 · Imprint / Legal Notice · v3.2 · in force 1 September 2026. Verbatim body — do not reword. */
export function ImprintV32() {
  return (
    <>
      <h2>Operator</h2>
      <div className="overflow-x-auto">
        <table>
          <tbody>
            <tr>
              <td>Company name</td>
              <td>Prime Gold Living SRL</td>
            </tr>
            <tr>
              <td>Trading as</td>
              <td>AVEXA Stays</td>
            </tr>
            <tr>
              <td>Registered office</td>
              <td>Str. Fibrei 28, Sector 2, 020342 București, Romania</td>
            </tr>
            <tr>
              <td>Trade Register number</td>
              <td>J2025057993006</td>
            </tr>
            <tr>
              <td>Tax identification (CUI/CIF)</td>
              <td>RO52265361</td>
            </tr>
            <tr>
              <td>VAT status</td>
              <td>Registered for VAT in Romania</td>
            </tr>
            <tr>
              <td>Legal representative</td>
              <td>Vlad Cristian Smighelschi — Administrator</td>
            </tr>
            <tr>
              <td>Email</td>
              <td>office@avexastays.com</td>
            </tr>
            <tr>
              <td>Phone (official)</td>
              <td>+40 721 347 642</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Activity and authorisation</h2>
      <p>
        Prime Gold Living SRL operates classified tourist accommodation structures
        (apartments) in Bucharest, Romania, under the Romanian rules on the
        classification of tourist reception structures. Classification certificate
        numbers and national registration numbers are published on each
        apartment&apos;s own page, as required.
      </p>
      <div className="overflow-x-auto">
        <table>
          <tbody>
            <tr>
              <td>Supervisory authority for classification</td>
              <td>Ministerul Economiei, Digitalizării, Antreprenoriatului și Turismului (MEDAT)</td>
            </tr>
            <tr>
              <td>Classification certificates</td>
              <td>
                Applications submitted for all operated units; issuance pending with
                the authority. Certificate numbers are published on each
                apartment&apos;s page as they are issued.
              </td>
            </tr>
            <tr>
              <td>National registration number of units</td>
              <td>To be displayed when the national registration system becomes operational</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Consumer protection and dispute resolution</h2>
      <p>
        Complaints should first be sent to office@avexastays.com with your booking
        reference. We acknowledge within 48 hours and give a substantive answer
        within 15 calendar days.
      </p>
      <p>Autoritatea Națională pentru Protecția Consumatorilor (ANPC) — anpc.ro</p>
      <p>Alternative dispute resolution (SAL) — through the ANPC SAL system.</p>
      <div className="my-6 rounded-xl border border-gray-line bg-cream px-5 py-4">
        <p className="mb-2 font-semibold text-ink">THE EU ODR PLATFORM NO LONGER EXISTS</p>
        <p className="mb-0">
          The European Online Dispute Resolution platform was permanently
          discontinued on 20 July 2025 by Regulation (EU) 2024/3228, which repealed
          Regulation (EU) 524/2013. The obligation to link to it has been removed
          and any surviving link on a website is now misleading. This Imprint has
          been updated accordingly.
        </p>
      </div>

      <h2>Data protection</h2>
      <p>
        Supervisory authority: Autoritatea Națională de Supraveghere a Prelucrării
        Datelor cu Caracter Personal (ANSPDCP), B-dul G-ral. Gheorghe Magheru
        28–30, Sector 1, București — dataprotection.ro. See our{' '}
        <Link href="/privacy">Privacy Policy (AVX-06)</Link> and{' '}
        <Link href="/cookies">Cookie Policy (AVX-07)</Link>.
      </p>

      <h2>Content and copyright</h2>
      <p>
        All text, photographs and graphic material on avexastays.com are the
        property of Prime Gold Living SRL unless credited otherwise, and may not be
        reproduced without written permission. We take care to keep the content
        accurate but accept no liability for the content of external websites we
        link to.
      </p>

      <p>
        AVEXA Stays is a trading name of Prime Gold Living SRL, Str. Fibrei 28,
        Sector 2, 020342 București, Romania. CUI RO52265361, Trade Register
        J2025057993006. Contact: office@avexastays.com, +40 721 347 642.
      </p>
    </>
  );
}
