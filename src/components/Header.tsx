import { Recycle, Info } from 'lucide-react';

export function Header() {
  return (
    <header className="w-full border-b border-forest-100/50 bg-cream-50/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-600 text-white flex items-center justify-center shadow-soft">
            <Recycle size={20} strokeWidth={2} />
          </div>
          <div>
            <h1 className="font-display text-lg md:text-xl font-bold text-forest-800 leading-tight">
              旧物回收指引
            </h1>
            <p className="text-xs text-forest-600/70">
              就近投递 · 环保出行
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-forest-600/70">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest-50">
            <Info size={13} />
            <span>数据为本地 Mock，仅作演示</span>
          </div>
        </div>
      </div>
    </header>
  );
}
