import type { ReactNode } from 'react';
import Link from 'next/link';
import { WHATSAPP_URL, CONTACT_EMAIL } from '@/lib/contact';

/**
 * AVX-09 · PUB Guest FAQ · v3.2 · in force 1 September 2026.
 * Verbatim Q&A — docx artefacts (cover lines, DOCUMENT CLASS box, page
 * footer) dropped when mounting; closing company block kept in the page.
 *
 * Source note: the "How can I pay?" answer in AVX-09 repeats the RON/BNR
 * sentence twice verbatim (a docx duplication) — kept once here.
 *
 * Answers are arrays of sentences (each renders on its own line, matching
 * the site-wide convention). Inline links use [text](key) tokens resolved
 * via FAQ_LINKS so the JSON-LD plain text mirrors the visible copy.
 */
export interface FaqItem {
  q: string;
  a: string[];
}

export const FAQ_LINKS: Record<string, string> = {
  wa: WHATSAPP_URL,
  mail: `mailto:${CONTACT_EMAIL}`,
  mytrips: '/my-trips',
  cancellation: '/cancellation',
  damage: '/damage-policy',
  club: '/avexian-club-terms',
  privacy: '/privacy',
};

export const faqCategoriesV3_2: { title: string; items: FaqItem[] }[] = [
  {
    title: 'Online check-in',
    items: [
      {
        q: 'Why do I need to check in before I arrive?',
        a: [
          'Online check-in is how we register you as required by Romanian law, and how you receive your self check-in instructions and the PIN for the apartment.',
          'You get the link right after booking.',
          'Without it we cannot release your access code.',
        ],
      },
      {
        q: 'Where do I see the status of my online check-in?',
        a: ['In the [My Trips](mytrips) section of our website or app.'],
      },
      {
        q: 'When do I get my access code?',
        a: [
          'It depends on the apartment.',
          'Smart-lock apartments: your personal code is released 24 hours before check-in, or immediately if you complete the online check-in inside those 24 hours.',
          'Apartments with a physical key: collection instructions are sent at 12:00 Romanian time on the day of arrival.',
          'Either way, nothing is released until online check-in is complete.',
        ],
      },
      {
        q: 'Which doors does the PIN open?',
        a: [
          'Your PIN always opens your apartment door.',
          'For the main building entrance you receive a separate code or a digital tag for the intercom, depending on the building.',
        ],
      },
      {
        q: 'What ID do I need to provide?',
        a: [
          'A valid passport or national identity card for every guest staying, including children.',
          'Romanian law (Government Decision 237/2001) requires every guest to be registered on the basis of an identity document, and does not allow us to accommodate anyone without one — a driving licence is not an accepted identity document under this law.',
          'You type the details yourself at online check-in; we never ask for photos or scans.',
          'Details are stored encrypted and used for nothing else.',
        ],
      },
    ],
  },
  {
    title: 'Check-in and check-out',
    items: [
      {
        q: 'What are the standard times?',
        a: [
          'Check-in from 15:00, check-out until 11:00.',
          'We need that window to prepare and sanitise the apartment properly for the next guest.',
        ],
      },
      {
        q: 'Can I check in early or check out late?',
        a: [
          'Yes, subject to availability, as a paid upgrade through [My Trips](mytrips).',
          'Early check-in starts at 13:00 and late check-out runs until 13:00.',
          'You get a confirmation by WhatsApp or SMS within 48 hours of your request.',
        ],
      },
      {
        q: 'What if I stay past 11:00 without arranging it?',
        a: [
          'An unauthorised late check-out is charged at €50 per hour started, because it delays the cleaning team and the next guest.',
          'Just ask us the evening before and we will almost always say yes.',
        ],
      },
      {
        q: 'What if my flight lands at 2am?',
        a: [
          'That is fine — self check-in works at any hour.',
          'Tell us so we know to expect you.',
        ],
      },
    ],
  },
  {
    title: 'Fast human support',
    items: [
      {
        q: 'How do I reach you?',
        a: [
          'Our reception is digital: fast human support on [WhatsApp](wa).',
          'You will have the number in your check-in message and in the apartment.',
        ],
      },
      {
        q: 'Which languages do you support?',
        a: ['English and Romanian.'],
      },
    ],
  },
  {
    title: 'Money, deposits and damage',
    items: [
      {
        q: 'Do you take a security deposit?',
        a: [
          'No. We take no deposit and we place no holds on your card.',
          'The only amounts that can ever be charged after booking are the announced penalties and evidenced damage costs in our [Damage & Penalties Policy](damage) — always with dated evidence and 14 days for you to respond first.',
        ],
      },
      {
        q: 'How can I pay?',
        a: [
          'By card through Stripe: Visa, Mastercard, Apple Pay and Google Pay.',
          'We do not accept American Express, PayPal or cash.',
          'Prices are shown in RON by default; euro amounts are converted automatically at the official BNR rate of the previous day plus 1%.',
        ],
      },
      {
        q: 'What are AVX Coins?',
        a: [
          'Our loyalty currency.',
          'Members earn 5–15% of the net accommodation value back as AVX on every stay, worth 1 RON each on extra services.',
          'Platinum and Diamond members can also pay for accommodation with AVX at 2 AVX = 1 RON.',
          'Coins expire 365 days after they are earned.',
          'Full rules in the [AVEXIAN Club Terms](club).',
        ],
      },
      {
        q: 'What happens if I break something?',
        a: [
          'Tell us.',
          'Ordinary wear, a broken glass or a stain that washes out are never charged.',
          'For real damage we send you dated photographs and a repair quote within 7 days of check-out, and you have 14 days to respond before anything is charged.',
          'Most travel insurance policies cover accidental damage to rented accommodation.',
        ],
      },
      {
        q: 'Something was already broken when I arrived. What do I do?',
        a: [
          'Send us a photo by 12:00 (noon) on the day after your check-in.',
          'It is then recorded against the previous booking, not yours.',
          'This is the best protection you have, and it takes thirty seconds.',
        ],
      },
      {
        q: 'Is there a city tax?',
        a: [
          'Bucharest applies a local accommodation tax to short stays.',
          'Where it is not already included in your booking, it is collected at check-in and you get a receipt.',
          'We do not ask for undocumented cash.',
        ],
      },
      {
        q: 'Can I get an invoice for my company?',
        a: [
          'Yes.',
          'Fill in the company name, address and CUI/VAT number in the dedicated fields at online check-in and we will issue it.',
        ],
      },
    ],
  },
  {
    title: 'Cleaning, laundry and the apartment',
    items: [
      {
        q: 'What is included in cleaning?',
        a: [
          'Professional cleaning, freshened and sanitised before your arrival, and the final check-out clean are always included.',
        ],
      },
      {
        q: 'Can I get a clean during my stay?',
        a: [
          'Yes — Mid-journey Cleaning: a full professional clean including fresh linen and towels, RON 99–149 depending on apartment size, through [My Trips](mytrips).',
        ],
      },
      {
        q: 'Can I do laundry?',
        a: [
          'Most AVEXA apartments have a washing machine in the apartment.',
          'Check the amenities for your specific apartment in [My Trips](mytrips).',
        ],
      },
      {
        q: 'Do I need to take the rubbish out?',
        a: ['No. Leave it in a closed bag by the kitchen bin and our team handles it.'],
      },
      {
        q: 'Are pets allowed?',
        a: [
          'Not unless the specific apartment listing says so and we have confirmed it in writing.',
          'Please ask before you book rather than after.',
        ],
      },
      {
        q: 'Can I smoke on the balcony?',
        a: [
          'No. Smoking and vaping are not permitted anywhere indoors, including balconies and the building staircase.',
          'Smoke sensors are installed and a breach carries a €200 cleaning fee.',
          'Outside the building is fine.',
        ],
      },
      {
        q: 'Can I have friends over?',
        a: [
          'Daytime visitors are fine within reason and within quiet hours.',
          'Only registered guests may stay overnight — that is a legal registration requirement, not just a house rule.',
          'Parties and events are prohibited outright.',
        ],
      },
    ],
  },
  {
    title: 'Trip management',
    items: [
      {
        q: 'How do I cancel, change or extend my stay?',
        a: [
          'Through [My Trips](mytrips).',
          'What you can change depends on the rate plan you booked — see our [Cancellation Policy](cancellation).',
          'On the Flexible Rate, changes are free up to 48 hours before arrival.',
        ],
      },
      {
        q: 'Where can I park?',
        a: [
          'Public paid parking is available on the streets around all our buildings.',
          'Exact locations and the mobile apps you can use to pay are in your check-in link.',
        ],
      },
    ],
  },
  {
    title: 'Extras',
    items: [
      {
        q: 'Can I add a package to my stay?',
        a: [
          'Yes — from snack trays and movie-night kits to sleep and self-care packages.',
          'Browse them in [My Trips](mytrips); most need 24 hours’ notice.',
        ],
      },
      {
        q: 'Do you decorate for birthdays and special occasions?',
        a: [
          'We do, and we enjoy it.',
          'The Surprise Setup (balloons, hand-written card, non-alcoholic sparkling — RON 229) is requested through [My Trips](mytrips) at least 72 hours ahead so we have time to set it up properly.',
        ],
      },
      {
        q: 'I left something behind. Can you post it to me?',
        a: [
          'We keep lost property for 7 days from your departure.',
          'Tell us what and roughly where, and we will look.',
          'Return postage is at cost plus a small handling fee.',
        ],
      },
    ],
  },
  {
    title: 'If something goes wrong',
    items: [
      {
        q: 'Who do I contact and how fast will you answer?',
        a: [
          'Message us on [WhatsApp](wa) first — most things are fixed the same day.',
          `For a formal complaint, write to [${CONTACT_EMAIL}](mail) with your booking reference.`,
          'We acknowledge within 48 hours and give a full answer within 15 days.',
          'If you are still not satisfied you can go to ANPC (anpc.ro).',
        ],
      },
    ],
  },
];

const TOKEN_PART = /^\[([^\]]+)\]\((\w+)\)$/;

export function faqPlainText(lines: string[]): string {
  return lines.join(' ').replace(/\[([^\]]+)\]\((\w+)\)/g, '$1');
}

export function renderFaqLine(line: string): ReactNode {
  return line.split(/(\[[^\]]+\]\(\w+\))/g).map((part, i) => {
    const match = TOKEN_PART.exec(part);
    if (!match) return part;
    const [, text, key] = match;
    const href = FAQ_LINKS[key] ?? '#';
    const linkClass = 'font-semibold text-gold-dark underline underline-offset-2';
    if (href.startsWith('/')) {
      return (
        <Link key={i} href={href} className={linkClass}>
          {text}
        </Link>
      );
    }
    return (
      <a
        key={i}
        href={href}
        className={linkClass}
        {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {text}
      </a>
    );
  });
}

export const faqJsonLdV3_2 = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqCategoriesV3_2.flatMap((c) =>
    c.items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: faqPlainText(f.a) },
    })),
  ),
};
