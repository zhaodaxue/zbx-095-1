import { Download, Trash2, ClipboardList } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { exportDeliveryPlan } from '../logic/exportUtils';
import { clsx } from 'clsx';

export function ExportBar() {
  const { deliveryPlan, clearPlan } = useAppStore();
  const count = deliveryPlan.length;

  if (count === 0) {
    return null;
  }

  const handleExport = () => {
    exportDeliveryPlan(deliveryPlan);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-forest-100 bg-cream-50/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(45,106,79,0.08)] animate-fade-in">
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
              已添加 {count} 个柜点
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
  );
}
