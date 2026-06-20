import { Cabinet } from '../types';
import { mockCabinets } from './mockCabinets';

const STORAGE_KEYS = {
  favorites: 'recycle-favorites',
  deliveryPlan: 'recycle-delivery-plan',
};

export const dataService = {
  async getCabinets(): Promise<Cabinet[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockCabinets), 100);
    });
  },

  getFavorites(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.favorites);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveFavorites(ids: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(ids));
    } catch {
      console.warn('Failed to save favorites');
    }
  },
};
