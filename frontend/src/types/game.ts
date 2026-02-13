// Game Types
export interface CustomerType {
  type: string;
  name: string;
  preferredDishes: string[];
  baseDeliciousness: number;
  description: string;
  specialTraits?: {
    lowAppetite?: boolean; // Deer - harder to overfeed
    canWander?: boolean; // Duck - might wander away
    multipliesOnProcess?: boolean; // Chicken - yields extra dishes
    fastSpoilage?: boolean; // Fish - requires faster cooking
    canStealFood?: boolean; // Fox - steals from cooking stations
    canEatWaste?: boolean; // Goat - can eat failed dishes
    highYield?: boolean; // Bear - extremely high meat yield
    throwsFood?: boolean; // Monkey - throws food when impatient
  };
}

export interface DishType {
  color: string;
  name: string;
  cookTime: number;
  examples: string[];
}

export interface Customer {
  id: number;
  type: CustomerType;
  satisfaction: Record<string, number>;
  maxSatisfaction: Record<string, number>;
  deliciousness: number;
  totalSatisfaction: number;
  overfed: boolean;
  isDragging: boolean;
  tableIndex?: number; // Optional table index for rendering
}

export interface GameState {
  score: number;
  combo: number;
  chain: number;
  customers: Customer[];
  ingredients: Record<string, number>;
  cookingTimers: Record<string, number>;
  specialTableBusy: boolean;
  chainHistory: number[];
  nextCustomerId: number;
  dishesReady: Record<string, string[]>; // stationColor -> array of ready dishes
}

export interface CookingStation {
  color: string;
  cooking: boolean;
  cookTime: number;
  dishes: string[];
}

// Progression Types
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  purchased: boolean;
  effects: Record<string, number>;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: Record<string, number>;
  customerType?: string;
  unlocked: boolean;
  unlockCondition: string;
  profitMultiplier: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  reward: number;
}

export interface MetaProgression {
  currency: number;
  upgrades: Upgrade[];
  recipes: Recipe[];
  achievements: Achievement[];
  prestigeLevel: number;
  totalScore: number;
}

// Game Configuration
export interface GameConfig {
  maxCustomers: number;
  customerSpawnTime: number;
  satisfactionDecayRate: number;
  overfeedThreshold: number;
  maxDeliciousness: number;
  comboMultiplier: number;
  specialTableProcessTime: number;
}

// UI Types
export interface DragState {
  isDragging: boolean;
  draggedItem: Customer | null;
  dragOffset: { x: number; y: number };
}

export interface GameMessage {
  id: string;
  text: string;
  type: "info" | "success" | "warning" | "error" | "combo";
  timestamp: number;
}
