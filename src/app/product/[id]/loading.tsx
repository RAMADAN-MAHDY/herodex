import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import LoadingSpinner from '@/components/ui/loading';

export default function LoadingProductPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-store-muted/20 to-white">
      <Navbar />
      <main className="flex-1 py-6 md:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto bg-white rounded-[2rem] shadow-xl border border-neutral-100">
          <LoadingSpinner />
        </div>
      </main>
      <Footer />
    </div>
  );
}
