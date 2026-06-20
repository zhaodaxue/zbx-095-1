import { Cabinet, Category, RecommendationResult } from '../types';

export function getCompartmentForCategory(cabinet: Cabinet, category: Category) {
  return cabinet.compartments.find((c) => c.category === category) || null;
}

export function getAvailableCapacity(cabinet: Cabinet, category: Category): number {
  const compartment = getCompartmentForCategory(cabinet, category);
  if (!compartment || !compartment.accepted) return 0;
  return Math.max(0, compartment.total - compartment.used);
}

export function getTotalCapacity(cabinet: Cabinet, category: Category): number {
  const compartment = getCompartmentForCategory(cabinet, category);
  return compartment ? compartment.total : 0;
}

export function isCategoryAccepted(cabinet: Cabinet, category: Category): boolean {
  const compartment = getCompartmentForCategory(cabinet, category);
  return compartment ? compartment.accepted : false;
}

export function isCategoryFull(cabinet: Cabinet, category: Category): boolean {
  return getAvailableCapacity(cabinet, category) === 0 && isCategoryAccepted(cabinet, category);
}

export function calculateScore(cabinet: Cabinet, category: Category): number {
  const compartment = getCompartmentForCategory(cabinet, category);
  if (!compartment || !compartment.accepted) return -1;

  const maxDistance = 3000;
  const distanceNorm = Math.max(0, 1 - cabinet.distance / maxDistance);
  const capacityRatio = (compartment.total - compartment.used) / compartment.total;

  return distanceNorm * 0.75 + capacityRatio * 0.25;
}

export function recommendCabinets(
  cabinets: Cabinet[],
  category: Category | null
): RecommendationResult[] {
  if (!category) {
    return cabinets.map((cabinet) => ({
      cabinet,
      availableCapacity: 0,
      totalCapacity: 0,
      isFull: false,
      isAccepted: true,
      score: -cabinet.distance,
    }));
  }

  const results: RecommendationResult[] = cabinets.map((cabinet) => {
    const availableCapacity = getAvailableCapacity(cabinet, category);
    const totalCapacity = getTotalCapacity(cabinet, category);
    const isAccepted = isCategoryAccepted(cabinet, category);
    const isFull = isCategoryFull(cabinet, category);
    const score = isAccepted && !isFull ? calculateScore(cabinet, category) : -1;

    return {
      cabinet,
      availableCapacity,
      totalCapacity,
      isFull,
      isAccepted,
      score,
    };
  });

  return results.sort((a, b) => {
    if (!a.isAccepted && b.isAccepted) return 1;
    if (a.isAccepted && !b.isAccepted) return -1;
    if (a.isFull && !b.isFull) return 1;
    if (!a.isFull && b.isFull) return -1;
    return b.score - a.score;
  });
}
