import { clsx } from 'clsx';

interface CapacityBarProps {
  used: number;
  total: number;
  size?: 'sm' | 'md';
}

export function CapacityBar({ used, total, size = 'md' }: CapacityBarProps) {
  const ratio = total > 0 ? used / total : 1;
  const percentage = Math.round(ratio * 100);
  const remaining = Math.max(0, total - used);

  let colorClass = 'bg-forest-500';
  if (ratio >= 0.85) colorClass = 'bg-danger-500';
  else if (ratio >= 0.6) colorClass = 'bg-amber-400';

  const heightClass = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-forest-700/70 mb-1">
        <span>剩余容量</span>
        <span className="font-medium">
          {remaining} / {total} 格 ({100 - percentage}%)
        </span>
      </div>
      <div
        className={clsx(
          'w-full rounded-full bg-forest-100 overflow-hidden',
          heightClass
        )}
      >
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorClass
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
