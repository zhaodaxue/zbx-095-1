import { create } from 'zustand';
import { AppState, Cabinet, Category, DeliveryPlanItem } from '../types';
import { dataService } from '../data/dataService';
import { favoritesManager } from '../logic/favoritesManager';

interface AppStore extends AppState {
  init: () => Promise<void>;
  setSelectedCategory: (category: Category | null) => void;
  toggleFavorite: (cabinetId: string) => void;
  toggleExpand: (cabinetId: string) => void;
  addToPlan: (category: Category, cabinet: Cabinet) => void;
  removeFromPlan: (category: Category, cabinetId: string) => void;
  clearPlan: () => void;
  isInPlan: (category: Category, cabinetId: string) => boolean;
}

export const useAppStore = create<AppStore>((set, get) => ({
  selectedCategory: null,
  cabinets: [],
  favorites: [],
  deliveryPlan: [],
  expandedCabinetId: null,

  init: async () => {
    const cabinets = await dataService.getCabinets();
    const favorites = favoritesManager.getFavorites();
    set({ cabinets, favorites });
  },

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  toggleFavorite: (cabinetId) => {
    const { favorites } = get();
    const next = favoritesManager.toggleFavorite(cabinetId, favorites);
    set({ favorites: next });
  },

  toggleExpand: (cabinetId) => {
    const { expandedCabinetId } = get();
    set({ expandedCabinetId: expandedCabinetId === cabinetId ? null : cabinetId });
  },

  addToPlan: (category, cabinet) => {
    const { deliveryPlan } = get();
    if (
      deliveryPlan.some(
        (item) => item.category === category && item.cabinet.id === cabinet.id
      )
    )
      return;
    set({
      deliveryPlan: [
        ...deliveryPlan,
        { category, cabinet, timestamp: Date.now() },
      ],
    });
  },

  removeFromPlan: (category, cabinetId) => {
    const { deliveryPlan } = get();
    set({
      deliveryPlan: deliveryPlan.filter(
        (item) => !(item.category === category && item.cabinet.id === cabinetId)
      ),
    });
  },

  clearPlan: () => set({ deliveryPlan: [] }),

  isInPlan: (category, cabinetId) => {
    return get().deliveryPlan.some(
      (item) => item.category === category && item.cabinet.id === cabinetId
    );
  },
}));
