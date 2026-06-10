import { Nav } from '@/components/chrome/Nav';
import { Footer } from '@/components/chrome/Footer';
import { TabBar } from '@/components/chrome/TabBar';
import { MobileSearchHeader } from '@/components/search/MobileSearchHeader';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <MobileSearchHeader />
      <main className="pb-20 md:pb-0">{children}</main>
      <Footer />
      <TabBar />
    </>
  );
}
