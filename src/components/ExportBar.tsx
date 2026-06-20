import { Download, Trash2, ClipboardList, ChevronUp, ChevronDown, Footprints } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { exportDeliveryPlan } from '../logic/exportUtils';
import { RoutePlannerPanel } from './RoutePlannerPanel';
import { clsx } from 'clsx';
import { formatDistanceShort } from '../logic/routePlanner';

export function ExportBar() {
  const {
    deliveryPlan,
    routePanelOpen,
    routePlan,
    routeStops,
    clearPlan,
    toggleRoutePanel,
  } = useAppStore();

  const count = deliveryPlan.length;
  if (count === 0) return null;

  const canShowRoute = count > 1;
  const activeStopCount = routeStops.filter((s) => !s.excluded).length;
  const excludedCount = routeStops.length - activeStopCount;

  const handleExport = () => {
    exportDeliveryPlan(deliveryPlan, routeStops, routePlan);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 animate-fade-in">
      {routePanelOpen && canShowRoute && (
        <div className="container max-w-5xl mx-auto px-4 pb-3">
          <RoutePlannerPanel />
        </div>
      )}

      <div className="border-t border-forest-100 bg-cream-50/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(45,106,79,0.08)]">
        <div className="container max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-forest-600 text-white flex items-center justify-center shrink-0">
              <ClipboardList size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-forest-800">
                今日投递计划
              </p>
              <p className="text-xs text-forest-600/70 truncate">
                已添加 {count} 项
                {routePlan && activeStopCount > 1 && (
                  <span className="ml-2 inline-flex items-center gap-1 text-forest-700">
                    <Footprints size={11} />
                    共 {routePlan.totalWalkMinutes} 分钟（{formatDistanceShort(routePlan.totalDistanceMeters)}）
                  </span>
                )}
                {excludedCount > 0 && (
                  <span className="ml-2 text-danger-500">
                    · {excludedCount} 项待处理
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canShowRoute && (
              <button
                onClick={toggleRoutePanel}
                className={clsx(
                  'h-10 px-3 md:px-4 rounded-xl flex items-center gap-1.5 text-sm transition-all border',
                  routePanelOpen
                    ? 'bg-forest-100 border-forest-300 text-forest-700'
                    : 'bg-white border-forest-100 text-forest-600 hover:bg-forest-50 hover:border-forest-200'
                )}
              >
                <Footprints size={16} />
                <span className="hidden sm:inline">顺路编排</span>
                {routePanelOpen ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronUp size={16} />
                )}
              </button>
            )}
            <button
              onClick={clearPlan}
              className={clsx(
                'h-10 px-3 md:px-4 rounded-xl flex items-center gap-1.5 text-sm transition-all',
                'bg-white border border-forest-100 text-forest-600 hover:bg-forest-50 hover:border-forest-200'
              )}
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">清空</span>
            </button>
            <button
              onClick={handleExport}
              className="h-10 px-4 md:px-5 rounded-xl flex items-center gap-1.5 text-sm font-medium bg-forest-600 text-white hover:bg-forest-700 transition-all shadow-soft hover:shadow-soft-hover"
            >
              <Download size={16} />
              导出计划
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
