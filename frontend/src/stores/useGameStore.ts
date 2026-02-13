import { create } from "zustand";
import { persist } from "zustand/middleware";
import { gameBalance } from "../constants/gameBalance";
import type {
  GameState,
  Customer,
  CustomerType,
  GameConfig,
} from "../types/game";

// Game data
const customerTypes: CustomerType[] = [
  {
    type: "pig",
    name: "Pig Girl",
    preferredDishes: ["blue", "red"],
    baseDeliciousness: 2,
    description: "Loves hearty main courses and sweet desserts",
  },
  {
    type: "cow",
    name: "Cow Girl",
    preferredDishes: ["green", "yellow"],
    baseDeliciousness: 3,
    description: "Enjoys soups and substantial meals",
  },
  {
    type: "sheep",
    name: "Sheep Girl",
    preferredDishes: ["blue", "green"],
    baseDeliciousness: 2,
    description: "Prefers light appetizers and warm soups",
  },
  {
    type: "rabbit",
    name: "Rabbit Girl",
    preferredDishes: ["blue", "red"],
    baseDeliciousness: 1,
    description: "Loves appetizers and desserts",
  },
  {
    type: "cat",
    name: "Cat Girl",
    preferredDishes: ["yellow", "blue"],
    baseDeliciousness: 4,
    description: "Enjoys main courses and appetizers",
  },
  {
    type: "deer",
    name: "Deer Girl",
    preferredDishes: ["green", "blue"],
    baseDeliciousness: 3,
    description:
      "🦌 Polite and shy, prefers fresh greens and forest-inspired dishes",
    specialTraits: { lowAppetite: true },
  },
  {
    type: "duck",
    name: "Duck Girl",
    preferredDishes: ["yellow", "green"],
    baseDeliciousness: 2,
    description:
      "🦆 Quirky and loud, loves bread-based meals and waterfowl-friendly soups",
    specialTraits: { canWander: true },
  },
  {
    type: "chicken",
    name: "Chicken Girl",
    preferredDishes: ["yellow", "red"],
    baseDeliciousness: 2,
    description:
      "🐔 Nervous and fussy, prefers grain-based meals and fried snacks",
    specialTraits: { multipliesOnProcess: true },
  },
  {
    type: "fish",
    name: "Fish Girl",
    preferredDishes: ["blue", "green"],
    baseDeliciousness: 4,
    description:
      "🐟 Laid-back and cool, enjoys seaweed, sushi, and lighter fare",
    specialTraits: { fastSpoilage: true },
  },
  {
    type: "fox",
    name: "Fox Girl",
    preferredDishes: ["red", "yellow"],
    baseDeliciousness: 3,
    description: "🦊 Cunning and playful, loves spicy dishes and street food",
    specialTraits: { canStealFood: true },
  },
  {
    type: "goat",
    name: "Goat Girl",
    preferredDishes: ["green", "yellow"],
    baseDeliciousness: 2,
    description: "🐐 Stubborn and quirky, enjoys chewy foods and herbs",
    specialTraits: { canEatWaste: true },
  },
  {
    type: "bear",
    name: "Bear Girl",
    preferredDishes: ["red", "yellow"],
    baseDeliciousness: 5,
    description:
      "🐻 Big appetite and warm demeanor, loves honey desserts and hearty stews",
    specialTraits: { highYield: true },
  },
  {
    type: "monkey",
    name: "Monkey Girl",
    preferredDishes: ["red", "blue"],
    baseDeliciousness: 2,
    description: "🐒 Energetic and cheeky, prefers fruits and finger foods",
    specialTraits: { throwsFood: true },
  },
];

const gameConfig: GameConfig = {
  maxCustomers: gameBalance.MAX_CUSTOMERS,
  customerSpawnTime: gameBalance.CUSTOMER_SPAWN_INTERVAL,
  satisfactionDecayRate: 0.5,
  overfeedThreshold: 1.2,
  maxDeliciousness: 5,
  comboMultiplier: 1.5,
  specialTableProcessTime: 3000,
};

interface GameStore extends GameState {
  // Actions
  addScore: (points: number) => void;
  addCombo: () => void;
  resetCombo: () => void;
  addToChain: (customerId: number) => void;
  addCustomer: (customer: Customer) => void;
  removeCustomer: (customerId: number) => void;
  updateCustomer: (customerId: number, updates: Partial<Customer>) => void;
  setSpecialTableBusy: (busy: boolean) => void;
  updateIngredients: (ingredients: Record<string, number>) => void;
  resetGame: () => void;

  // Dish management
  addDish: (stationColor: string, dishName: string) => void;
  removeDish: (stationColor: string, dishIndex: number) => void;
  getDishesForStation: (stationColor: string) => string[];

  // Getters
  getCustomerById: (id: number) => Customer | undefined;
  canProcessCustomer: (customer: Customer) => boolean;

  // Config
  config: GameConfig;
  customerTypes: CustomerType[];
}

const initialState: GameState = {
  score: 0,
  combo: 0,
  chain: 0,
  customers: [],
  ingredients: { regular: Infinity },
  cookingTimers: {},
  specialTableBusy: false,
  chainHistory: [],
  nextCustomerId: 1,
  dishesReady: {},
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      config: gameConfig,
      customerTypes,

      addScore: (points) =>
        set((state) => ({
          score: state.score + Math.floor(points * (1 + state.combo * 0.1)),
        })),

      addCombo: () => set((state) => ({ combo: state.combo + 1 })),

      resetCombo: () => set({ combo: 0 }),

      addToChain: (customerId) =>
        set((state) => ({
          chainHistory: [...state.chainHistory, customerId],
          chain: state.chainHistory.length + 1,
        })),

      addCustomer: (customer) =>
        set((state) => ({
          customers: [...state.customers, customer],
        })),

      removeCustomer: (customerId) =>
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== customerId),
        })),

      updateCustomer: (customerId, updates) =>
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === customerId ? { ...c, ...updates } : c,
          ),
        })),

      setSpecialTableBusy: (busy) => set({ specialTableBusy: busy }),

      updateIngredients: (newIngredients) =>
        set((state) => ({
          ingredients: { ...state.ingredients, ...newIngredients },
        })),

      resetGame: () => set(initialState),

      // Dish management
      addDish: (stationColor, dishName) =>
        set((state) => ({
          dishesReady: {
            ...state.dishesReady,
            [stationColor]: [
              ...(state.dishesReady[stationColor] || []),
              dishName,
            ],
          },
        })),

      removeDish: (stationColor, dishIndex) =>
        set((state) => ({
          dishesReady: {
            ...state.dishesReady,
            [stationColor]: (state.dishesReady[stationColor] || []).filter(
              (_, i) => i !== dishIndex,
            ),
          },
        })),

      getDishesForStation: (stationColor) =>
        get().dishesReady[stationColor] || [],

      getCustomerById: (id) => get().customers.find((c) => c.id === id),

      canProcessCustomer: (customer) => {
        return (
          customer.deliciousness >= gameBalance.VIP_DELICIOUSNESS_THRESHOLD &&
          customer.totalSatisfaction > gameBalance.VIP_SATISFACTION_THRESHOLD
        );
      },
    }),
    {
      name: "feast-frenzy-game",
      partialize: (state) => ({
        score: state.score,
        ingredients: state.ingredients,
        nextCustomerId: state.nextCustomerId,
        dishesReady: state.dishesReady,
      }),
    },
  ),
);
