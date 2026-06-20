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

export interface AppState {
  selectedCategory: Category | null;
  cabinets: Cabinet[];
  favorites: string[];
  deliveryPlan: DeliveryPlanItem[];
  expandedCabinetId: string | null;
}
