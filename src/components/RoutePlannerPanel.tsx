import { useState, useRef } from 'react';
import {
  Lock,
  Unlock,
  GripVertical,
  FileText,
  Recycle,
  Package,
  Shirt,
  Footprints,
  AlertTriangle,
  Ban,
  ArrowRight,
  X,
  type LucideIcon,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Category, RouteStop, RouteLeg } from '../types';
import { useAppStore } from '../store/useAppStore';
import { CATEGORY_META } from '../data/categories';
import { formatDistanceShort } from '../logic/routePlanner';

const categoryIconMap: Record<Category, LucideIcon> = {
  paper: FileText,
  plastic: Recycle,
  metal: Package,
  fabric: Shirt,
};

interface StopItemProps {
  stop: RouteStop;
  index: number;
  leg?: RouteLeg;
  onDragStart: (stopId: string) => void;
  onDragOver: (index: number) => void;
  onDrop: () => void;
  onRemove: (cabinetId: string, categories: Category[]) => void;
  isDragging: boolean;
  isDragOver: boolean;
}

function StopItem({
  stop,
  index,
  leg,
  onDragStart,
  onDragOver,
  onDrop,
  onRemove,
  isDragging,
  isDragOver,
}: StopItemProps) {
  const { toggleLockStop, removeFromPlan } = useAppStore();
  const displayOrder = stop.excluded ? '—' : stop.order;

  return (
    <div
      draggable={!stop.excluded}
      onDragStart={() => !stop.excluded && onDragStart(stop.stopId)}
      onDragOver={(e) => {
        e.preventDefault();
        if (!stop.excluded) onDragOver(index);
      }}
      onDrop={() => onDrop()}
      className={clsx(
        'relative rounded-xl border transition-all',
        isDragging && 'opacity-50 scale-[0.98]',
        isDragOver && !stop.excluded && 'ring-2 ring-forest-400',
        stop.excluded
          ? 'bg-gray-50 border-gray-200'
          : 'bg-white border-forest-100 hover:border-forest-300'
      )}
    >
      {leg && !stop.excluded && (
        <div className="flex items-center gap-1.5 px-3 pt-2 text-[11px] text-forest-600/80">
          <ArrowRight size={12} />
          <span>
            前序步行 {leg.walkMinutes} 分钟（{formatDistanceShort(leg.distanceMeters)}）
          </span>
        </div>
      )}

      <div className="p-3 flex items-center gap-2.5">
        {!stop.excluded && (
          <button
            className="cursor-grab active:cursor-grabbing p-1 rounded-md text-forest-400 hover:text-forest-600 hover:bg-forest-50 shrink-0"
            aria-label="拖拽排序"
          >
            <GripVertical size={16} />
          </button>
        )}

        <div
          className={clsx(
            'shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm',
            stop.excluded
              ? 'bg-gray-200 text-gray-500'
              : 'bg-forest-600 text-white shadow-soft'
          )}
        >
          {displayOrder}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4
              className={clsx(
                'font-medium text-sm truncate',
                stop.excluded ? 'text-gray-500' : 'text-forest-800'
              )}
            >
              {stop.cabinet.name}
            </h4>
            {stop.excluded && stop.excludeReason === 'full' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-danger-500/10 text-danger-500 text-[10px] font-medium">
                <AlertTriangle size={10} />
                已满
              </span>
            )}
            {stop.excluded && stop.excludeReason === 'not-accepted' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-200 text-gray-500 text-[10px] font-medium">
                <Ban size={10} />
                不支持
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            {stop.categories.map((cat) => {
              const Icon = categoryIconMap[cat];
              const meta = CATEGORY_META[cat];
              return (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-forest-50 text-forest-700 text-[10px]"
                  title={meta.name}
                >
                  <Icon size={10} />
                  {meta.name}
                </span>
              );
            })}
          </div>
          {stop.excluded && (
            <p className="text-[11px] text-gray-500 mt-1">
              {stop.excludeReason === 'full'
                ? '该柜点对应品类已满柜，建议更换柜点或移除本项'
                : '该柜点暂不接收对应品类'}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!stop.excluded && (
            <button
              onClick={() => toggleLockStop(stop.stopId)}
              className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                stop.locked
                  ? 'bg-amber-400/20 text-amber-600 hover:bg-amber-400/30'
                  : 'text-forest-300 hover:text-forest-500 hover:bg-forest-50'
              )}
              aria-label={stop.locked ? '解锁站点' : '锁定站点位次'}
              title={stop.locked ? '位次已锁定，自动重排不会移动' : '点击锁定位次'}
            >
              {stop.locked ? <Lock size={14} /> : <Unlock size={14} />}
            </button>
          )}
          <button
            onClick={() => onRemove(stop.stopId, stop.categories)}
            className="w-8 h-8 rounded-full text-gray-400 hover:text-danger-500 hover:bg-danger-500/10 flex items-center justify-center transition-all"
            aria-label="移除站点"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function RoutePlannerPanel() {
  const { routeStops, routePlan, moveStop, removeFromPlan } = useAppStore();
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragIdRef = useRef<string | null>(null);

  const activeStops = routeStops.filter((s) => !s.excluded);
  const excludedStops = routeStops.filter((s) => s.excluded);
  const legByToId = new Map<string, RouteLeg>();
  routePlan?.legs.forEach((leg) => legByToId.set(leg.toStopId, leg));

  const handleDragStart = (stopId: string) => {
    setDragId(stopId);
    dragIdRef.current = stopId;
  };

  const handleDragOver = (index: number) => {
    setDragOverIndex(index);
  };

  const handleDrop = () => {
    const id = dragIdRef.current;
    const targetIdx = dragOverIndex;
    if (id && targetIdx !== null) {
      moveStop(id, targetIdx);
    }
    setDragId(null);
    setDragOverIndex(null);
    dragIdRef.current = null;
  };

  const handleRemoveStop = (cabinetId: string, categories: Category[]) => {
    categories.forEach((cat) => removeFromPlan(cat, cabinetId));
  };

  return (
    <div className="w-full animate-slide-down">
      <div className="bg-white/80 backdrop-blur-sm border border-forest-100 rounded-2xl p-4 shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-forest-600 text-white flex items-center justify-center">
              <Footprints size={16} />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-forest-800">
                顺路编排
              </h3>
              <p className="text-[11px] text-forest-600/70">
                自动按柜点坐标排出最近访问顺序 · 可拖拽调序 · 锁定后位次不变
              </p>
            </div>
          </div>
          {routePlan && activeStops.length > 0 && (
            <div className="text-right">
              <p className="text-sm font-semibold text-forest-700">
                总步行 {routePlan.totalWalkMinutes} 分钟
              </p>
              <p className="text-[11px] text-forest-600/70">
                约 {formatDistanceShort(routePlan.totalDistanceMeters)}
              </p>
            </div>
          )}
        </div>

        {activeStops.length === 0 && excludedStops.length === 0 ? (
          <div className="py-6 text-center text-sm text-forest-600/60">
            暂无计划项
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {activeStops.map((stop, i) => (
              <StopItem
                key={stop.stopId}
                stop={stop}
                index={i}
                leg={legByToId.get(stop.stopId)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onRemove={handleRemoveStop}
                isDragging={dragId === stop.stopId}
                isDragOver={dragOverIndex === i && dragId !== stop.stopId}
              />
            ))}

            {excludedStops.length > 0 && (
              <>
                <div className="pt-3 mt-1 border-t border-forest-100/60">
                  <p className="text-[11px] text-gray-500 mb-2 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    以下计划项暂不参与编排：
                  </p>
                </div>
                {excludedStops.map((stop) => (
                  <StopItem
                    key={stop.stopId}
                    stop={stop}
                    index={-1}
                    onDragStart={() => {}}
                    onDragOver={() => {}}
                    onDrop={() => {}}
                    onRemove={handleRemoveStop}
                    isDragging={false}
                    isDragOver={false}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
