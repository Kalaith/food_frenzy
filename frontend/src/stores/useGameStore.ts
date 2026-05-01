import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { gameBalance } from '../constants/gameBalance';
import { customerTypes } from '../constants/gameData';
import { useProgressionStore } from './useProgressionStore';
import type { GameState, Customer, CustomerType, GameConfig, Recipe } from '../types/game';

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
  addScore: (points: number, options?: { applyCombo?: boolean }) => void;
  addCombo: () => void;
  resetCombo: () => void;
  addToChain: (customerId: number) => void;
  addCustomer: (customer: Customer) => void;
  removeCustomer: (customerId: number) => void;
  updateCustomer: (customerId: number, updates: Partial<Customer>) => void;
  setSpecialTableBusy: (busy: boolean) => void;
  updateIngredients: (ingredients: Record<string, number>) => void;
  spendIngredients: (ingredients: Record<string, number>) => boolean;
  craftRecipe: (recipe: Recipe) => boolean;
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

      addScore: (points, options) =>
        set(state => {
          const progression = useProgressionStore.getState();
          const comboBoost = progression.getPurchasedEffect('comboMultiplier', 1);
          const prestigeMultiplier = 1 + progression.prestigePoints * 0.03;
          const comboMultiplier =
            options?.applyCombo === false ? 1 : 1 + state.combo * 0.1 * comboBoost;
          const scoredPoints = Math.floor(points * comboMultiplier * prestigeMultiplier);
          progression.recordScore(scoredPoints);

          return {
            score: state.score + scoredPoints,
          };
        }),

      addCombo: () => set(state => ({ combo: state.combo + 1 })),

      resetCombo: () => set({ combo: 0 }),

      addToChain: customerId =>
        set(state => ({
          chainHistory: [...state.chainHistory, customerId],
          chain: state.chainHistory.length + 1,
        })),

      addCustomer: customer =>
        set(state => ({
          customers: [...state.customers, customer],
        })),

      removeCustomer: customerId =>
        set(state => ({
          customers: state.customers.filter(c => c.id !== customerId),
        })),

      updateCustomer: (customerId, updates) =>
        set(state => ({
          customers: state.customers.map(c => (c.id === customerId ? { ...c, ...updates } : c)),
        })),

      setSpecialTableBusy: busy => set({ specialTableBusy: busy }),

      updateIngredients: newIngredients =>
        set(state => ({
          ingredients: { ...state.ingredients, ...newIngredients },
        })),

      spendIngredients: ingredients => {
        const state = get();
        const hasIngredients = Object.entries(ingredients).every(
          ([ingredient, amount]) => (state.ingredients[ingredient] || 0) >= amount
        );

        if (!hasIngredients) {
          return false;
        }

        set({
          ingredients: Object.entries(ingredients).reduce(
            (nextIngredients, [ingredient, amount]) => ({
              ...nextIngredients,
              [ingredient]: nextIngredients[ingredient] - amount,
            }),
            { ...state.ingredients }
          ),
        });

        return true;
      },

      craftRecipe: recipe => {
        if (!recipe.unlocked || !get().spendIngredients(recipe.ingredients)) {
          return false;
        }

        const progression = useProgressionStore.getState();
        const recipeValueMultiplier = progression.getPurchasedEffect('recipeValueMultiplier', 1);
        const capacityGainMultiplier = progression.getPurchasedEffect('capacityGainMultiplier', 1);
        const scoreGained = Math.floor(
          recipe.baseValue * recipe.profitMultiplier * recipeValueMultiplier
        );
        get().addScore(scoreGained, { applyCombo: false });

        progression.addCurrency(Math.floor(scoreGained / 4));
        progression.recordCraftedRecipe(
          recipe.id,
          Math.max(1, Math.floor(recipe.capacityBonus * capacityGainMultiplier))
        );

        return true;
      },

      resetGame: () => set(initialState),

      // Dish management
      addDish: (stationColor, dishName) =>
        set(state => ({
          dishesReady: {
            ...state.dishesReady,
            [stationColor]: [...(state.dishesReady[stationColor] || []), dishName],
          },
        })),

      removeDish: (stationColor, dishIndex) =>
        set(state => ({
          dishesReady: {
            ...state.dishesReady,
            [stationColor]: (state.dishesReady[stationColor] || []).filter(
              (_, i) => i !== dishIndex
            ),
          },
        })),

      getDishesForStation: stationColor => get().dishesReady[stationColor] || [],

      getCustomerById: id => get().customers.find(c => c.id === id),

      canProcessCustomer: customer => {
        return (
          customer.deliciousness >= gameBalance.VIP_DELICIOUSNESS_THRESHOLD &&
          customer.totalSatisfaction > gameBalance.VIP_SATISFACTION_THRESHOLD
        );
      },
    }),
    {
      name: 'feast-frenzy-game',
      partialize: state => ({
        score: state.score,
        ingredients: state.ingredients,
        nextCustomerId: state.nextCustomerId,
        dishesReady: state.dishesReady,
      }),
    }
  )
);
