import { useMemo } from 'react';
import { Leaf, AlertTriangle, Ban } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { recommendCabinets } from '../logic/recommendEngine';
import { CabinetCard } from './CabinetCard';
import { CATEGORY_META } from '../data/categories';

export function CabinetList() {
  const { cabinets, selectedCategory } = useAppStore();

  const recommendations = useMemo(
    () => recommendCabinets(cabinets, selectedCategory),
    [cabinets, selectedCategory]
  );

  const availableCount = recommendations.filter(
    (r) => r.isAccepted && !r.isFull
  ).length;
  const fullCount = recommendations.filter((r) => r.isFull).length;
  const notAcceptedCount = recommendations.filter((r) => !r.isAccepted).length;

  if (cabinets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-forest-600">
        <Leaf size={48} className="animate-pulse mb-4 opacity-50" />
        <p className="text-sm">加载柜点数据中...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-forest-800">
            推荐柜点
          </h2>
          <p className="text-sm text-forest-600/70 mt-1">
            {selectedCategory
              ? `基于「${CATEGORY_META[selectedCategory].name}」推荐`
              : '请先选择投递品类获取精准推荐'}
          </p>
        </div>
        {selectedCategory && (
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded-full bg-forest-50 text-forest-700 font-medium">
              可用 {availableCount}
            </span>
            {fullCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-danger-500/10 text-danger-500 font-medium">
                <AlertTriangle size={12} />
                已满 {fullCount}
              </span>
            )}
            {notAcceptedCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">
                <Ban size={12} />
                不支持 {notAcceptedCount}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {recommendations.map((result) => (
          <CabinetCard key={result.cabinet.id} result={result} />
        ))}
      </div>
    </div>
  );
}
