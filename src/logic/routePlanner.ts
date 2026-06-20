import {
  Cabinet,
  Category,
  DeliveryPlanItem,
  RouteLeg,
  RoutePlanResult,
  RouteStop,
  ExcludeReason,
} from '../types';
import { isCategoryAccepted, isCategoryFull } from './recommendEngine';

const WALK_SPEED_MPM = 80;

export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function walkMinutes(distanceMeters: number): number {
  return Math.max(1, Math.round(distanceMeters / WALK_SPEED_MPM));
}

export function cabinetWalkDistance(
  a: Cabinet,
  b: Cabinet
): number {
  return Math.round(
    haversineDistanceMeters(a.latitude, a.longitude, b.latitude, b.longitude)
  );
}

export function userToCabinetDistance(
  userLat: number,
  userLon: number,
  cabinet: Cabinet
): number {
  return Math.round(
    haversineDistanceMeters(userLat, userLon, cabinet.latitude, cabinet.longitude)
  );
}

export function planItemsToStops(items: DeliveryPlanItem[]): RouteStop[] {
  const byCabinet = new Map<string, DeliveryPlanItem[]>();
  items.forEach((item) => {
    const list = byCabinet.get(item.cabinet.id) || [];
    list.push(item);
    byCabinet.set(item.cabinet.id, list);
  });

  const stops: RouteStop[] = [];
  let order = 1;
  byCabinet.forEach((cabinetItems, cabId) => {
    const cabinet = cabinetItems[0].cabinet;
    const categories = cabinetItems.map((it) => it.category);

    let excluded = false;
    let excludeReason: ExcludeReason = null;

    const hasAnyAccepted = cabinetItems.some((it) =>
      isCategoryAccepted(cabinet, it.category)
    );
    const hasAnyAvailable = cabinetItems.some(
      (it) =>
        isCategoryAccepted(cabinet, it.category) &&
        !isCategoryFull(cabinet, it.category)
    );

    if (!hasAnyAccepted) {
      excluded = true;
      excludeReason = 'not-accepted';
    } else if (!hasAnyAvailable) {
      excluded = true;
      excludeReason = 'full';
    }

    stops.push({
      stopId: cabId,
      cabinet,
      categories,
      planItems: cabinetItems,
      order: order++,
      locked: false,
      excluded,
      excludeReason,
    });
  });

  return stops;
}

export function greedyOptimizeStops(
  stopsInput: RouteStop[],
  userPosition: { latitude: number; longitude: number } | null
): RouteStop[] {
  if (stopsInput.length <= 1) return stopsInput;

  const locked = stopsInput.filter((s) => s.locked && !s.excluded);
  const unlocked = stopsInput.filter((s) => !s.locked && !s.excluded);
  const excluded = stopsInput.filter((s) => s.excluded);

  if (unlocked.length === 0) {
    const merged = [...locked, ...excluded];
    return merged.map((s, i) => ({ ...s, order: i + 1 }));
  }

  const getLat = (pos: { lat: number; lon: number } | Cabinet) =>
    'latitude' in pos ? pos.latitude : pos.lat;
  const getLon = (pos: { lat: number; lon: number } | Cabinet) =>
    'longitude' in pos ? pos.longitude : pos.lon;

  const distBetween = (
    a: { lat: number; lon: number } | Cabinet,
    b: Cabinet
  ) => haversineDistanceMeters(getLat(a), getLon(a), b.latitude, b.longitude);

  let currentPos: { lat: number; lon: number } | Cabinet;
  if (userPosition) {
    currentPos = { lat: userPosition.latitude, lon: userPosition.longitude };
  } else {
    const allToSort = [...locked, ...unlocked];
    let nearest = allToSort[0].cabinet;
    let nearestDist = Infinity;
    allToSort.forEach((s) => {
      if (s.cabinet.distance < nearestDist) {
        nearestDist = s.cabinet.distance;
        nearest = s.cabinet;
      }
    });
    currentPos = nearest;
  }

  const slots: (RouteStop | null)[] = [];
  locked
    .slice()
    .sort((a, b) => a.order - b.order)
    .forEach((s) => {
      const idx = s.order - 1;
      while (slots.length <= idx) slots.push(null);
      slots[idx] = s;
    });

  let remaining = [...unlocked];

  for (let slotIdx = 0; slotIdx < slots.length; slotIdx++) {
    if (slots[slotIdx]) {
      currentPos = slots[slotIdx]!.cabinet;
      continue;
    }
    if (remaining.length === 0) break;

    let bestIdx = 0;
    let bestDist = Infinity;
    remaining.forEach((s, i) => {
      const d = distBetween(currentPos, s.cabinet);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });

    const [picked] = remaining.splice(bestIdx, 1);
    slots[slotIdx] = picked;
    currentPos = picked.cabinet;
  }

  const filled = slots.filter((s): s is RouteStop => s !== null);

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestDist = Infinity;
    const lastCab = filled[filled.length - 1]?.cabinet || currentPos;
    remaining.forEach((s, i) => {
      const d = distBetween(lastCab, s.cabinet);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });
    filled.push(remaining.splice(bestIdx, 1)[0]);
  }

  const merged = [...filled, ...excluded];
  return merged.map((s, i) => ({ ...s, order: i + 1 }));
}

export function buildRouteLegs(
  stops: RouteStop[],
  userPosition: { latitude: number; longitude: number } | null
): { legs: RouteLeg[]; totalWalkMinutes: number; totalDistanceMeters: number } {
  const legs: RouteLeg[] = [];
  let totalMin = 0;
  let totalDist = 0;

  const activeStops = stops.filter((s) => !s.excluded);
  if (activeStops.length === 0) {
    return { legs, totalWalkMinutes: 0, totalDistanceMeters: 0 };
  }

  let fromName = '当前位置';
  let fromLat: number;
  let fromLon: number;

  if (userPosition) {
    fromLat = userPosition.latitude;
    fromLon = userPosition.longitude;
  } else {
    const first = activeStops[0].cabinet;
    fromLat = first.latitude;
    fromLon = first.longitude;
    fromName = first.name;
  }

  let prevLat = fromLat;
  let prevLon = fromLon;
  let prevName = fromName;
  let prevId: string | null = null;

  activeStops.forEach((stop) => {
    const distance = Math.round(
      haversineDistanceMeters(prevLat, prevLon, stop.cabinet.latitude, stop.cabinet.longitude)
    );
    const minutes = walkMinutes(distance);

    if (distance > 0) {
      legs.push({
        fromStopId: prevId,
        toStopId: stop.stopId,
        fromName: prevName,
        toName: stop.cabinet.name,
        distanceMeters: distance,
        walkMinutes: minutes,
        summary: `从${prevName}出发，步行约 ${minutes} 分钟（${formatDistanceShort(distance)}）到达${stop.cabinet.name}`,
      });
      totalDist += distance;
      totalMin += minutes;
    }

    prevLat = stop.cabinet.latitude;
    prevLon = stop.cabinet.longitude;
    prevName = stop.cabinet.name;
    prevId = stop.stopId;
  });

  return { legs, totalWalkMinutes: totalMin, totalDistanceMeters: totalDist };
}

export function formatDistanceShort(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)}km`;
  return `${meters}m`;
}

export function buildRoutePlan(
  stops: RouteStop[],
  userPosition: { latitude: number; longitude: number } | null
): RoutePlanResult {
  const { legs, totalWalkMinutes, totalDistanceMeters } = buildRouteLegs(stops, userPosition);
  return { stops, legs, totalWalkMinutes, totalDistanceMeters };
}

export function runRouteOptimization(
  items: DeliveryPlanItem[],
  existingStops: RouteStop[],
  userPosition: { latitude: number; longitude: number } | null
): { stops: RouteStop[]; plan: RoutePlanResult } {
  const baseStops = planItemsToStops(items);

  const preservedLocks = new Map<string, { locked: boolean; order: number }>();
  existingStops.forEach((s) => {
    preservedLocks.set(s.stopId, { locked: s.locked, order: s.order });
  });

  const stopsWithPreserve = baseStops.map((s) => {
    const prev = preservedLocks.get(s.stopId);
    if (prev) {
      return { ...s, locked: prev.locked, order: prev.order };
    }
    return s;
  });

  const optimized = greedyOptimizeStops(stopsWithPreserve, userPosition);
  const plan = buildRoutePlan(optimized, userPosition);

  return { stops: optimized, plan };
}

export function reorderStop(
  stops: RouteStop[],
  stopId: string,
  newIndex: number
): RouteStop[] {
  const idx = stops.findIndex((s) => s.stopId === stopId);
  if (idx === -1) return stops;

  const target = stops[idx];
  const working = [...stops];
  working.splice(idx, 1);

  const insertAt = Math.max(
    0,
    Math.min(newIndex, working.filter((s) => !s.excluded).length)
  );

  let actualInsert = 0;
  let excludedSeen = 0;
  for (let i = 0; i < working.length; i++) {
    if (working[i].excluded) {
      excludedSeen++;
      continue;
    }
    if (actualInsert === insertAt) {
      break;
    }
    actualInsert++;
  }

  const insertPos = Math.min(
    working.length - excludedSeen,
    insertAt + excludedSeen
  );

  working.splice(insertPos, 0, target);

  return working.map((s, i) => ({ ...s, order: i + 1 }));
}
