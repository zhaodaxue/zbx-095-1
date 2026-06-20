import { dataService } from '../data/dataService';

export const favoritesManager = {
  getFavorites(): string[] {
    return dataService.getFavorites();
  },

  isFavorite(cabinetId: string, favorites: string[]): boolean {
    return favorites.includes(cabinetId);
  },

  toggleFavorite(cabinetId: string, currentFavorites: string[]): string[] {
    const next = currentFavorites.includes(cabinetId)
      ? currentFavorites.filter((id) => id !== cabinetId)
      : [...currentFavorites, cabinetId];
    dataService.saveFavorites(next);
    return next;
  },

  addFavorite(cabinetId: string, currentFavorites: string[]): string[] {
    if (currentFavorites.includes(cabinetId)) return currentFavorites;
    const next = [...currentFavorites, cabinetId];
    dataService.saveFavorites(next);
    return next;
  },

  removeFavorite(cabinetId: string, currentFavorites: string[]): string[] {
    const next = currentFavorites.filter((id) => id !== cabinetId);
    dataService.saveFavorites(next);
    return next;
  },
};
