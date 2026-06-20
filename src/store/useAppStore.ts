import { create } from 'zustand';
import { AppState, Cabinet, Category, DeliveryPlanItem, RouteStop } from '../types';
import { dataService } from '../data/dataService';
import { favoritesManager } from '../logic/favoritesManager';
import {
  runRouteOptimization,
  reorderStop,
} from '../logic/routePlanner';

interface AppStore extends AppState {
  init: () => Promise<void>;
  setSelectedCategory: (category: Category | null) => void;
  toggleFavorite: (cabinetId: string) => void;
  toggleExpand: (cabinetId: string) => void;
  addToPlan: (category: Category, cabinet: Cabinet) => void;
  removeFromPlan: (category: Category, cabinetId: string) => void;
  clearPlan: () => void;
  isInPlan: (category: Category, cabinetId: string) => boolean;
  toggleRoutePanel: () => void;
  recalcRoute: () => void;
  toggleLockStop: (stopId: string) => void;
  moveStop: (stopId: string, newIndex: number) => void;
  getStopOrderFor: (category: Category, cabinetId: string) => number | null;
}

const DEFAULT_USER_POS = { latitude: 31.2304, longitude: 121.4737 };

export const useAppStore = create<AppStore>((set, get) => ({
  selectedCategory: null,
  cabinets: [],
  favorites: [],
  deliveryPlan: [],
  expandedCabinetId: null,
  routePanelOpen: false,
  routeStops: [],
  routePlan: null,
  userPosition: DEFAULT_USER_POS,

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
    const nextPlan = [
      ...deliveryPlan,
      { category, cabinet, timestamp: Date.now() },
    ];
    set({ deliveryPlan: nextPlan });
    get().recalcRoute();
  },

  removeFromPlan: (category, cabinetId) => {
    const { deliveryPlan } = get();
    const nextPlan = deliveryPlan.filter(
      (item) => !(item.category === category && item.cabinet.id === cabinetId)
    );
    set({ deliveryPlan: nextPlan });
    get().recalcRoute();
  },

  clearPlan: () => {
    set({ deliveryPlan: [], routeStops: [], routePlan: null });
  },

  isInPlan: (category, cabinetId) => {
    return get().deliveryPlan.some(
      (item) => item.category === category && item.cabinet.id === cabinetId
    );
  },

  toggleRoutePanel: () => {
    set({ routePanelOpen: !get().routePanelOpen });
  },

  recalcRoute: () => {
    const { deliveryPlan, routeStops, userPosition } = get();
    if (deliveryPlan.length === 0) {
      set({ routeStops: [], routePlan: null });
      return;
    }
    const { stops, plan } = runRouteOptimization(deliveryPlan, routeStops, userPosition);
    set({ routeStops: stops, routePlan: plan });
  },

  toggleLockStop: (stopId) => {
    const { routeStops } = get();
    const next: RouteStop[] = routeStops.map((s) =>
      s.stopId === stopId ? { ...s, locked: !s.locked } : s
    );
    const { stops, plan } = runRouteOptimization(
      get().deliveryPlan,
      next,
      get().userPosition
    );
    set({ routeStops: stops, routePlan: plan });
  },

  moveStop: (stopId, newIndex) => {
    const { routeStops, userPosition, deliveryPlan } = get();
    const target = routeStops.find((s) => s.stopId === stopId);
    if (!target || target.excluded) return;

    const reordered = reorderStop(routeStops, stopId, newIndex);
    const lockedPreserved: RouteStop[] = reordered.map((s) => {
      if (s.stopId === stopId) return s;
      return s;
    });

    const { stops, plan } = runRouteOptimization(
      deliveryPlan,
      lockedPreserved,
      userPosition
    );
    set({ routeStops: stops, routePlan: plan });
  },

  getStopOrderFor: (category, cabinetId) => {
    const { routeStops } = get();
    const stop = routeStops.find((s) => s.stopId === cabinetId);
    if (!stop || !stop.categories.includes(category)) return null;
    if (stop.excluded) return -1;
    return stop.order;
  },
}));
