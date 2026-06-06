import { Reveal } from '@/components/Reveal';

export function ContactSection() {
  return (
    <section className="bg-ink py-[clamp(90px,11vw,150px)] text-white">
      <div className="mx-auto max-w-[900px] px-4 md:px-6 lg:px-10">
        <Reveal direction="up" className="mb-9 md:mb-14">
          <p className="font-mono-label text-gold-dark">— Get in touch</p>
          <h2 className="font-display mt-3.5 text-[clamp(44px,6.2vw,80px)] leading-none">
            We&apos;re here to help
            <span
              aria-hidden
              className="ml-[0.08em] inline-block size-[0.14em] translate-y-[0.04em] rounded-full bg-gold-dark align-baseline pulse-dot"
            />
          </h2>
          <p className="mt-4.5 max-w-[520px] text-base leading-relaxed text-white/55">
            Whether you need help with a booking, have a question about membership, or just want to say hello — reach out anytime.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <Reveal direction="up" delay={0}>
            <a
              href="mailto:office@avexastays.com"
              className="group flex h-full flex-col gap-2 rounded-[20px] border border-white/10 bg-white/5 px-8 py-9 transition-[transform,background-color,border-color] duration-[400ms] ease-[var(--ease-snap)] hover:-translate-y-1.5 hover:border-gold/20 hover:bg-gold/[0.08]"
            >
              <span className="mb-2 grid size-[52px] place-items-center rounded-[14px] bg-white/[0.08] text-gold">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-6"
                  aria-hidden
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 4L12 13L2 4" />
                </svg>
              </span>
              <span className="font-mono-label mt-1 text-white/40">Email us</span>
              <span className="font-display text-2xl leading-tight tracking-[-0.01em] text-white">
                office@avexastays.com
              </span>
              <span className="font-mono-label mt-3 tracking-[0.14em] text-gold transition-transform duration-200 group-hover:translate-x-1.5">
                Send email →
              </span>
            </a>
          </Reveal>

          <Reveal direction="up" delay={0.12}>
            <a
              href="https://wa.me/40712345678"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col gap-2 rounded-[20px] border border-white/10 bg-white/5 px-8 py-9 transition-[transform,background-color,border-color] duration-[400ms] ease-[var(--ease-snap)] hover:-translate-y-1.5 hover:border-gold/20 hover:bg-gold/[0.08]"
            >
              <span className="mb-2 grid size-[52px] place-items-center rounded-[14px] bg-[#25D366]/[0.12] text-[#25D366]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-[22px]" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </span>
              <span className="font-mono-label mt-1 text-white/40">WhatsApp</span>
              <span className="font-display text-2xl leading-tight tracking-[-0.01em] text-white">
                +40 712 345 678
              </span>
              <span className="font-mono-label mt-3 tracking-[0.14em] text-gold transition-transform duration-200 group-hover:translate-x-1.5">
                Open chat →
              </span>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
