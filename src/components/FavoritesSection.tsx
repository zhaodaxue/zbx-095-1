import { useMemo } from 'react';
import { Star, Leaf } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { recommendCabinets } from '../logic/recommendEngine';
import { CabinetCard } from './CabinetCard';

export function FavoritesSection() {
  const { cabinets, favorites, selectedCategory } = useAppStore();

  const favoriteCabinets = useMemo(() => {
    if (favorites.length === 0) return [];
    const favCabinetList = cabinets.filter((c) => favorites.includes(c.id));
    return recommendCabinets(favCabinetList, selectedCategory);
  }, [cabinets, favorites, selectedCategory]);

  if (favorites.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-500 flex items-center justify-center">
          <Star size={16} fill="currentColor" />
        </div>
        <h2 className="font-display text-xl font-semibold text-forest-800">
          我的收藏
        </h2>
        <span className="text-sm text-forest-600/60">
          ({favorites.length} 个柜点)
        </span>
      </div>

      {favoriteCabinets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 rounded-2xl bg-white/50 border border-dashed border-forest-200">
          <Leaf size={32} className="opacity-30 mb-2" />
          <p className="text-sm text-forest-600/60">暂无收藏柜点</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {favoriteCabinets.map((result) => (
            <CabinetCard key={result.cabinet.id} result={result} />
          ))}
        </div>
      )}
    </div>
  );
}
