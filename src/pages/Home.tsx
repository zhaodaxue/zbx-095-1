import { useEffect } from 'react';
import { Header } from '../components/Header';
import { CategorySelector } from '../components/CategorySelector';
import { CabinetList } from '../components/CabinetList';
import { FavoritesSection } from '../components/FavoritesSection';
import { ExportBar } from '../components/ExportBar';
import { useAppStore } from '../store/useAppStore';

export default function Home() {
  const { init, deliveryPlan } = useAppStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main
        className={`flex-1 container max-w-5xl mx-auto px-4 py-6 md:py-8 ${
          deliveryPlan.length > 0 ? 'pb-28' : ''
        }`}
      >
        <div className="flex flex-col gap-8 md:gap-10">
          <section className="animate-fade-in">
            <CategorySelector />
          </section>

          <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <FavoritesSection />
          </section>

          <section className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <CabinetList />
          </section>
        </div>
      </main>

      <ExportBar />
    </div>
  );
}
