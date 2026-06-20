import { Star, MapPin, Footprints, ChevronDown, ChevronUp, Plus, Check, FileText, Recycle, Package, Shirt, type LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { RecommendationResult, Category } from '../types';
import { useAppStore } from '../store/useAppStore';
import { CapacityBar } from './CapacityBar';
import { getCompartmentForCategory } from '../logic/recommendEngine';
import { CATEGORY_META } from '../data/categories';

const categoryIconMap: Record<Category, LucideIcon> = {
  paper: FileText,
  plastic: Recycle,
  metal: Package,
  fabric: Shirt,
};

interface CabinetCardProps {
  result: RecommendationResult;
  showCategoryBadges?: boolean;
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
}

export function CabinetCard({ result, showCategoryBadges = true }: CabinetCardProps) {
  const { cabinet, isFull, isAccepted, availableCapacity, totalCapacity } = result;
  const { selectedCategory, favorites, expandedCabinetId, toggleFavorite, toggleExpand, addToPlan, removeFromPlan, isInPlan } = useAppStore();

  const isExpanded = expandedCabinetId === cabinet.id;
  const isFav = favorites.includes(cabinet.id);
  const inPlan = isInPlan(cabinet.id);

  const compartment = selectedCategory
    ? getCompartmentForCategory(cabinet, selectedCategory)
    : null;

  return (
    <div
      className={clsx(
        'w-full bg-white rounded-2xl border transition-all duration-300 overflow-hidden',
        isAccepted && !isFull
          ? 'border-forest-100 hover:border-forest-300 hover:shadow-soft-hover'
          : 'border-gray-200 opacity-80'
      )}
    >
      <div className="p-4 md:p-5">
        <div className="flex items-start gap-3 md:gap-4">
          <div
            className={clsx(
              'shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-xl flex flex-col items-center justify-center font-display',
              isAccepted && !isFull
                ? 'bg-forest-50 text-forest-700'
                : 'bg-gray-100 text-gray-500'
            )}
          >
            <span className="text-lg md:text-xl font-bold">{formatDistance(cabinet.distance)}</span>
            <span className="text-[10px] md:text-xs opacity-70">约 {cabinet.walkMinutes} 分钟</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-display text-base md:text-lg font-semibold text-forest-800 truncate">
                {cabinet.name}
              </h3>
              <div className="flex items-center gap-1 shrink-0">
                {!isAccepted && selectedCategory && (
                  <span className="text-[10px] md:text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                    暂不接收
                  </span>
                )}
                {isAccepted && isFull && (
                  <span className="text-[10px] md:text-xs px-2 py-0.5 rounded-full bg-danger-500/10 text-danger-500 font-medium">
                    已满
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs md:text-sm text-forest-600/80 mb-2">
              <MapPin size={14} className="shrink-0" />
              <span className="truncate">{cabinet.address}</span>
            </div>

            {showCategoryBadges && (
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                {cabinet.compartments.map((c) => {
                  const Icon = categoryIconMap[c.category];
                  const meta = CATEGORY_META[c.category];
                  const thisFull = c.used >= c.total;
                  return (
                    <span
                      key={c.category}
                      title={meta.name}
                      className={clsx(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] md:text-xs',
                        !c.accepted
                          ? 'bg-gray-100 text-gray-400 line-through'
                          : thisFull
                          ? 'bg-danger-500/10 text-danger-500'
                          : 'bg-forest-50 text-forest-700'
                      )}
                    >
                      <Icon size={11} />
                      {meta.name}
                    </span>
                  );
                })}
              </div>
            )}

            {compartment && (
              <CapacityBar used={compartment.used} total={compartment.total} size="sm" />
            )}

            {!compartment && !selectedCategory && (
              <div className="text-xs text-forest-600/60">
                请先选择品类查看容量
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 shrink-0">
            <button
              onClick={() => toggleFavorite(cabinet.id)}
              className={clsx(
                'w-9 h-9 rounded-full flex items-center justify-center transition-all',
                isFav
                  ? 'bg-amber-400/20 text-amber-500 hover:bg-amber-400/30'
                  : 'bg-forest-50 text-forest-400 hover:bg-forest-100 hover:text-forest-600'
              )}
              aria-label={isFav ? '取消收藏' : '收藏柜点'}
            >
              <Star
                size={18}
                fill={isFav ? 'currentColor' : 'none'}
                className={clsx(isFav && 'animate-bounce-subtle')}
              />
            </button>

            {selectedCategory && isAccepted && !isFull && (
              <button
                onClick={() =>
                  inPlan ? removeFromPlan(cabinet.id) : addToPlan(selectedCategory, cabinet)
                }
                className={clsx(
                  'w-9 h-9 rounded-full flex items-center justify-center transition-all',
                  inPlan
                    ? 'bg-forest-600 text-white hover:bg-forest-700'
                    : 'bg-forest-100 text-forest-600 hover:bg-forest-200'
                )}
                aria-label={inPlan ? '从计划移除' : '加入投递计划'}
              >
                {inPlan ? <Check size={18} /> : <Plus size={18} />}
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => toggleExpand(cabinet.id)}
          className="w-full mt-3 pt-3 border-t border-forest-50 flex items-center justify-between text-xs md:text-sm text-forest-600 hover:text-forest-800 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Footprints size={14} />
            查看步行路线
          </span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isExpanded && (
          <div className="mt-3 p-3 md:p-4 rounded-xl bg-cream-50 border border-cream-100 animate-slide-down">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-forest-600 text-white flex items-center justify-center">
                <Footprints size={13} />
              </div>
              <span className="font-medium text-forest-800 text-sm">
                步行约 {cabinet.walkMinutes} 分钟（{formatDistance(cabinet.distance)}）
              </span>
            </div>
            <p className="text-xs md:text-sm text-forest-700/80 leading-relaxed pl-8">
              {cabinet.routeDescription}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
