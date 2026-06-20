export type Category = 'paper' | 'plastic' | 'metal' | 'fabric';

export interface CategoryMeta {
  id: Category;
  name: string;
  description: string;
  icon: string;
}

export interface CompartmentStatus {
  category: Category;
  total: number;
  used: number;
  accepted: boolean;
}

export interface Cabinet {
  id: string;
  name: string;
  address: string;
  distance: number;
  walkMinutes: number;
  routeDescription: string;
  compartments: CompartmentStatus[];
  latitude: number;
  longitude: number;
}

export interface RecommendationResult {
  cabinet: Cabinet;
  availableCapacity: number;
  totalCapacity: number;
  isFull: boolean;
  isAccepted: boolean;
  score: number;
}

export interface DeliveryPlanItem {
  category: Category;
  cabinet: Cabinet;
  timestamp: number;
}

export type ExcludeReason = 'full' | 'not-accepted' | null;

export interface RouteStop {
  stopId: string;
  cabinet: Cabinet;
  categories: Category[];
  planItems: DeliveryPlanItem[];
  order: number;
  locked: boolean;
  excluded: boolean;
  excludeReason: ExcludeReason;
}

export interface RouteLeg {
  fromStopId: string | null;
  toStopId: string;
  fromName: string;
  toName: string;
  distanceMeters: number;
  walkMinutes: number;
  summary: string;
}

export interface RoutePlanResult {
  stops: RouteStop[];
  legs: RouteLeg[];
  totalWalkMinutes: number;
  totalDistanceMeters: number;
}

export interface AppState {
  selectedCategory: Category | null;
  cabinets: Cabinet[];
  favorites: string[];
  deliveryPlan: DeliveryPlanItem[];
  expandedCabinetId: string | null;
  routePanelOpen: boolean;
  routeStops: RouteStop[];
  routePlan: RoutePlanResult | null;
  userPosition: { latitude: number; longitude: number } | null;
}
