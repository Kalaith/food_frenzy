import { create } from 'zustand';
import { webhatcheryGameApi, type WebHatcheryGameState } from '../api/webhatcheryGameApi';
import { gameBalance } from '../constants/gameBalance';
import { customerTypes } from '../constants/gameData';
import { useWebHatcherySessionStore } from './webhatcherySessionStore';
import { useGuestStore } from './useGuestStore';
import { useProgressionStore } from './useProgressionStore';
import type { Customer, CustomerType, GameConfig, GameState, Recipe } from '../types/game';

const gameConfig: GameConfig = {
  maxCustomers: gameBalance.MAX_CUSTOMERS,
  customerSpawnTime: gameBalance.CUSTOMER_SPAWN_INTERVAL,
  satisfactionDecayRate: 0.5,
  overfeedThreshold: 1.2,
  maxDeliciousness: 5,
  comboMultiplier: 1.5,
  specialTableProcessTime: 3000,
};

interface BackendState {
  game?: Partial<GameState>;
  progression?: Record<string, unknown>;
  guests?: unknown[];
  lastMessage?: string;
}

interface GameStore extends GameState {
  loadError: string | null;
  lastMessage: string | null;
  initBackendGame: () => Promise<void>;
  spawnCustomer: () => Promise<void>;
  customerLeft: (customerId: number) => Promise<void>;
  satisfactionDecayTick: () => Promise<void>;
  traitTick: () => Promise<void>;
  cookDish: (stationColor: string) => Promise<string | null>;
  serveDish: (customerId: number, dishColor: string, dishName: string, dishIndex: number) => Promise<void>;
  processCustomer: (customerId: number) => Promise<boolean>;
  setSpecialTableBusy: (busy: boolean) => void;

  addScore: (points: number, options?: { applyCombo?: boolean }) => void;
  addCombo: () => void;
  resetCombo: () => void;
  addToChain: (customerId: number) => void;
  addCustomer: (customer: Customer) => void;
  removeCustomer: (customerId: number) => void;
  updateCustomer: (customerId: number, updates: Partial<Customer>) => void;
  updateIngredients: (ingredients: Record<string, number>) => void;
  spendIngredients: (ingredients: Record<string, number>) => boolean;
  craftRecipe: (recipe: Recipe) => Promise<boolean>;
  resetGame: () => void;
  addDish: (stationColor: string, dishName: string) => void;
  removeDish: (stationColor: string, dishIndex: number) => void;
  getDishesForStation: (stationColor: string) => string[];
  getCustomerById: (id: number) => Customer | undefined;
  canProcessCustomer: (customer: Customer) => boolean;
  config: GameConfig;
  customerTypes: CustomerType[];
}

const initialState: GameState = {
  score: 0,
  combo: 0,
  chain: 0,
  customers: [],
  ingredients: { regular: Number.MAX_SAFE_INTEGER },
  cookingTimers: {},
  specialTableBusy: false,
  chainHistory: [],
  nextCustomerId: 1,
  dishesReady: {},
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asBackendState = (gameState: WebHatcheryGameState): BackendState => {
  const state = gameState.save.state;
  return isRecord(state) ? state : {};
};

const syncSessionState = (gameState: WebHatcheryGameState): void => {
  useWebHatcherySessionStore.setState({
    gameState,
    user: gameState.user,
    isLoading: false,
    error: null,
  });
};

const loadOrCreateBackendGame = async (): Promise<WebHatcheryGameState> => {
  const sessionStore = useWebHatcherySessionStore.getState();
  try {
    return await sessionStore.loadGame();
  } catch {
    return sessionStore.continueAsGuest();
  }
};

const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

export const useGameStore = create<GameStore>()((set, get) => {
  const applyBackendState = (gameState: WebHatcheryGameState): BackendState => {
    syncSessionState(gameState);
    const backendState = asBackendState(gameState);
    const game = isRecord(backendState.game) ? backendState.game : {};
    const progression = isRecord(backendState.progression) ? backendState.progression : null;
    const guests = Array.isArray(backendState.guests) ? backendState.guests : [];

    set({
      ...initialState,
      ...game,
      loadError: null,
      lastMessage: typeof backendState.lastMessage === 'string' ? backendState.lastMessage : null,
    });

    if (progression) {
      useProgressionStore.getState().applyBackendProgression(progression);
    }
    useGuestStore.getState().applyBackendGuests(guests);
    return backendState;
  };

  const runIntent = async (intent: string, payload: Record<string, unknown> = {}): Promise<BackendState> => {
    const gameState = await webhatcheryGameApi.applyIntent(intent, payload);
    return applyBackendState(gameState);
  };

  return {
    ...initialState,
    loadError: null,
    lastMessage: null,
    config: gameConfig,
    customerTypes,

    initBackendGame: async () => {
      try {
        set({ loadError: null });
        applyBackendState(await loadOrCreateBackendGame());
      } catch (error) {
        set({ loadError: errorMessage(error, 'Unable to load game state.') });
      }
    },

    spawnCustomer: async () => {
      await runIntent('spawn_customer');
    },

    customerLeft: async (customerId) => {
      await runIntent('customer_left', { customerId });
    },

    satisfactionDecayTick: async () => {
      await runIntent('satisfaction_decay_tick');
    },

    traitTick: async () => {
      await runIntent('trait_tick');
    },

    cookDish: async (stationColor) => {
      const before = get().getDishesForStation(stationColor).length;
      const backendState = await runIntent('cook_dish', { stationColor });
      const game = isRecord(backendState.game) ? backendState.game : {};
      const dishesReady = isRecord(game.dishesReady) ? game.dishesReady : {};
      const dishes = Array.isArray(dishesReady[stationColor])
        ? dishesReady[stationColor].filter((dish): dish is string => typeof dish === 'string')
        : [];
      return dishes[before] ?? dishes[dishes.length - 1] ?? null;
    },

    serveDish: async (customerId, dishColor, dishName, dishIndex) => {
      await runIntent('serve_dish', { customerId, dishColor, dishName, dishIndex });
    },

    processCustomer: async (customerId) => {
      try {
        await runIntent('process_customer', { customerId });
        return true;
      } catch (error) {
        set({ lastMessage: errorMessage(error, 'Unable to process customer.') });
        return false;
      }
    },

    setSpecialTableBusy: (busy) => {
      set({ specialTableBusy: busy });
      void runIntent('set_special_table_busy', { busy }).catch(error => {
        set({ lastMessage: errorMessage(error, 'Unable to update VIP table.') });
      });
    },

    addScore: () => undefined,
    addCombo: () => undefined,
    resetCombo: () => undefined,
    addToChain: () => undefined,
    addCustomer: () => {
      void runIntent('spawn_customer').catch(error => set({ lastMessage: errorMessage(error, 'Unable to add customer.') }));
    },
    removeCustomer: (customerId) => {
      void runIntent('customer_left', { customerId }).catch(error => set({ lastMessage: errorMessage(error, 'Unable to remove customer.') }));
    },
    updateCustomer: () => undefined,
    updateIngredients: () => undefined,
    spendIngredients: () => false,
    craftRecipe: async (recipe) => {
      try {
        await runIntent('craft_recipe', { recipeId: recipe.id });
        return true;
      } catch (error) {
        set({ lastMessage: errorMessage(error, 'Unable to craft recipe.') });
        return false;
      }
    },
    resetGame: () => {
      void runIntent('reset_game').catch(error => set({ lastMessage: errorMessage(error, 'Unable to reset game.') }));
    },
    addDish: (stationColor) => {
      void runIntent('cook_dish', { stationColor }).catch(error => set({ lastMessage: errorMessage(error, 'Unable to cook dish.') }));
    },
    removeDish: (stationColor, dishIndex) => {
      void runIntent('remove_dish', { stationColor, dishIndex }).catch(error => set({ lastMessage: errorMessage(error, 'Unable to remove dish.') }));
    },
    getDishesForStation: stationColor => get().dishesReady[stationColor] || [],
    getCustomerById: id => get().customers.find(c => c.id === id),
    canProcessCustomer: customer =>
      customer.deliciousness >= gameBalance.VIP_DELICIOUSNESS_THRESHOLD &&
      customer.totalSatisfaction > gameBalance.VIP_SATISFACTION_THRESHOLD,
  };
});
