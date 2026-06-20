import { FileText, Recycle, Package, Shirt, type LucideIcon } from 'lucide-react';
import { Category } from '../types';
import { CATEGORY_LIST } from '../data/categories';
import { useAppStore } from '../store/useAppStore';
import { clsx } from 'clsx';

const iconMap: Record<Category, LucideIcon> = {
  paper: FileText,
  plastic: Recycle,
  metal: Package,
  fabric: Shirt,
};

export function CategorySelector() {
  const { selectedCategory, setSelectedCategory } = useAppStore();

  return (
    <div className="w-full">
      <h2 className="font-display text-xl font-semibold text-forest-800 mb-4">
        选择投递品类
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {CATEGORY_LIST.map((cat) => {
          const Icon = iconMap[cat.id];
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() =>
                setSelectedCategory(isSelected ? null : cat.id)
              }
              className={clsx(
                'group relative p-4 md:p-5 rounded-2xl border-2 transition-all duration-300 text-left',
                'focus:outline-none focus:ring-2 focus:ring-forest-400 focus:ring-offset-2',
                isSelected
                  ? 'bg-forest-50 border-forest-600 shadow-soft-hover scale-[1.02]'
                  : 'bg-white border-forest-100 hover:border-forest-300 hover:shadow-soft hover:-translate-y-0.5'
              )}
            >
              <div
                className={clsx(
                  'w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors',
                  isSelected ? 'bg-forest-600 text-white' : 'bg-forest-50 text-forest-600 group-hover:bg-forest-100'
                )}
              >
                <Icon size={24} strokeWidth={1.8} />
              </div>
              <h3
                className={clsx(
                  'font-display text-base md:text-lg font-semibold mb-1 transition-colors',
                  isSelected ? 'text-forest-700' : 'text-forest-800'
                )}
              >
                {cat.name}
              </h3>
              <p className="text-xs md:text-sm text-forest-600/70 leading-relaxed">
                {cat.description}
              </p>
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-forest-600 flex items-center justify-center animate-bounce-subtle">
                  <svg viewBox="0 0 20 20" fill="white" className="w-3 h-3">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
