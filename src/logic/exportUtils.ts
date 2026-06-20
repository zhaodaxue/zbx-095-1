import {
  Category,
  DeliveryPlanItem,
  RoutePlanResult,
  RouteStop,
} from '../types';
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

export function generateDeliveryPlanText(
  items: DeliveryPlanItem[],
  stops?: RouteStop[],
  plan?: RoutePlanResult
): string {
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

  const hasRoute = stops && stops.length > 0 && plan;
  const activeStopCount = stops ? stops.filter((s) => !s.excluded).length : 0;
  const excludedStopCount = stops ? stops.filter((s) => s.excluded).length : 0;

  if (hasRoute && activeStopCount > 0) {
    lines.push('【顺路编排 · 总览】');
    lines.push(
      `  站点数：${activeStopCount} 站  ·  总步行：${plan!.totalWalkMinutes} 分钟  ·  总距离：${formatDistance(plan!.totalDistanceMeters)}`
    );
    lines.push('');
    if (plan!.legs.length > 0) {
      lines.push('  分段路线：');
      plan!.legs.forEach((leg, i) => {
        lines.push(
          `  ${i + 1}. ${leg.summary}`
        );
      });
      lines.push('');
    }
  }

  const useRouteOrder = hasRoute && activeStopCount > 0;
  let stopList: RouteStop[];

  if (useRouteOrder) {
    stopList = stops!.slice().sort((a, b) => a.order - b.order);
  } else {
    const byCab = new Map<string, RouteStop>();
    items.forEach((item) => {
      const existing = byCab.get(item.cabinet.id);
      if (existing) {
        existing.categories.push(item.category);
        existing.planItems.push(item);
      } else {
        byCab.set(item.cabinet.id, {
          stopId: item.cabinet.id,
          cabinet: item.cabinet,
          categories: [item.category],
          planItems: [item],
          order: byCab.size + 1,
          locked: false,
          excluded: false,
          excludeReason: null,
        });
      }
    });
    stopList = [...byCab.values()];
  }

  lines.push('--------------------------------');
  lines.push('【投递站点详情】');
  lines.push('');

  stopList.forEach((stop) => {
    const metaNames = stop.categories
      .map((c) => CATEGORY_META[c].name)
      .join(' / ');

    const orderLabel = stop.excluded ? '⚠' : `${stop.order}`;
    const lockLabel = stop.locked ? ' [锁定]' : '';
    const excludedLabel = stop.excluded
      ? stop.excludeReason === 'full'
        ? ' [已满-暂不参与]'
        : ' [不支持-暂不参与]'
      : '';

    lines.push(
      `◆ 第 ${orderLabel} 站：${stop.cabinet.name}${lockLabel}${excludedLabel}`
    );
    lines.push(`    品类：${metaNames}`);
    lines.push(`    地址：${stop.cabinet.address}`);
    lines.push(
      `    距起点：${formatDistance(stop.cabinet.distance)}  步行约 ${stop.cabinet.walkMinutes} 分钟`
    );

    if (!stop.excluded) {
      const leg = plan?.legs.find((l) => l.toStopId === stop.stopId);
      if (leg) {
        lines.push(
          `    前序步行：${leg.walkMinutes} 分钟（${formatDistance(leg.distanceMeters)}）`
        );
        lines.push(`    ${leg.summary}`);
      }
    } else {
      const reasonText =
        stop.excludeReason === 'full'
          ? '对应品类已满柜，建议更换柜点或移除本项'
          : '该柜点暂不接收对应品类';
      lines.push(`    说明：${reasonText}`);
    }

    lines.push(`    路线指引：${stop.cabinet.routeDescription}`);
    lines.push('');
  });

  lines.push('================================');
  lines.push(`投递项总数：${items.length} 项`);
  lines.push(`独立站点：${stopList.length} 个`);
  if (hasRoute && activeStopCount > 0) {
    lines.push(
      `编排总步行：${plan!.totalWalkMinutes} 分钟（${formatDistance(plan!.totalDistanceMeters)}）`
    );
  }
  if (excludedStopCount > 0) {
    lines.push(`待处理站点：${excludedStopCount} 个（满柜或不支持）`);
  }
  lines.push('感谢您为环保做出贡献 ♻️');
  lines.push('================================');

  return lines.join('\n');
}

export function exportDeliveryPlan(
  items: DeliveryPlanItem[],
  stops?: RouteStop[],
  plan?: RoutePlanResult
): void {
  const text = generateDeliveryPlanText(items, stops, plan);
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
