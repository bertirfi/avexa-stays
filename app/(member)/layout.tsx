import { Nav } from '@/components/chrome/Nav';
import { Footer } from '@/components/chrome/Footer';
import { TabBar } from '@/components/chrome/TabBar';

// These pages are dynamic via cookies() today; pin it so a refactor that ever
// drops the cookie read can't accidentally make protected pages static.
export const dynamic = 'force-dynamic';

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">{children}</main>
      <Footer />
      <TabBar />
    </>
  );
}
