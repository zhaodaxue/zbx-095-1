import { Category, DeliveryPlanItem } from '../types';
import { CATEGORY_META } from '../data/categories';

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} 公里`;
  }
  return `${meters} 米`;
}

export function generateDeliveryPlanText(items: DeliveryPlanItem[]): string {
  const now = new Date();
  const lines: string[] = [];

  lines.push('================================');
  lines.push('     今日旧物投递计划');
  lines.push(`     生成时间：${formatDate(now)}`);
  lines.push('================================');
  lines.push('');

  if (items.length === 0) {
    lines.push('暂无投递计划。');
    lines.push('请先选择品类和柜点添加计划。');
    return lines.join('\n');
  }

  const grouped: Record<Category, DeliveryPlanItem[]> = {
    paper: [],
    plastic: [],
    metal: [],
    fabric: [],
  };

  items.forEach((item) => {
    grouped[item.category].push(item);
  });

  let index = 1;
  (Object.keys(grouped) as Category[]).forEach((category) => {
    const categoryItems = grouped[category];
    if (categoryItems.length === 0) return;

    const meta = CATEGORY_META[category];
    lines.push(`【${meta.name}】${meta.description}`);
    lines.push('');

    categoryItems.forEach((item) => {
      lines.push(`  ${index}. ${item.cabinet.name}`);
      lines.push(`     地址：${item.cabinet.address}`);
      lines.push(`     距离：${formatDistance(item.cabinet.distance)}  步行约 ${item.cabinet.walkMinutes} 分钟`);
      lines.push(`     路线：${item.cabinet.routeDescription}`);
      lines.push('');
      index++;
    });
  });

  lines.push('================================');
  lines.push(`共计 ${items.length} 个投递点`);
  lines.push('感谢您为环保做出贡献 ♻️');
  lines.push('================================');

  return lines.join('\n');
}

export function exportDeliveryPlan(items: DeliveryPlanItem[]): void {
  const text = generateDeliveryPlanText(items);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const filename = `投递计划_${dateStr}.txt`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
