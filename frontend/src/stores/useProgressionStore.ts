import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { webhatcheryGameApi, type WebHatcheryGameState } from '../api/webhatcheryGameApi';
import { gameBalance } from '../constants/gameBalance';
import { useWebHatcherySessionStore } from './webhatcherySessionStore';
import type { MetaProgression, Upgrade, Recipe, Achievement } from '../types/game';

export const initialUpgrades: Upgrade[] = [
  {
    id: 'cooking-speed',
    name: 'Faster Cooking',
    description: 'Reduce cooking time by 8% per level',
    cost: 80,
    baseCost: 80,
    level: 0,
    maxLevel: 8,
    costGrowth: 1.45,
    purchased: false,
    effects: { cookTimeMultiplier: -0.08 },
  },
  {
    id: 'customer-patience',
    name: 'Patient Customers',
    description: 'Customers wait 12% longer per level',
    cost: 90,
    baseCost: 90,
    level: 0,
    maxLevel: 8,
    costGrowth: 1.42,
    purchased: false,
    effects: { patienceMultiplier: 0.12 },
  },
  {
    id: 'processing-efficiency',
    name: 'Better Processing',
    description: 'Gain 12% more ingredients from VIP processing per level',
    cost: 120,
    baseCost: 120,
    level: 0,
    maxLevel: 8,
    costGrowth: 1.5,
    purchased: false,
    effects: { meatYieldMultiplier: 0.12 },
  },
  {
    id: 'combo-boost',
    name: 'Combo Master',
    description: 'Increase combo scoring by 8% per level',
    cost: 140,
    baseCost: 140,
    level: 0,
    maxLevel: 10,
    costGrowth: 1.55,
    purchased: false,
    effects: { comboMultiplier: 0.08 },
  },
  {
    id: 'dining-room',
    name: 'Dining Room Expansion',
    description: 'Add one customer table per level',
    cost: 180,
    baseCost: 180,
    level: 0,
    maxLevel: 4,
    costGrowth: 1.9,
    purchased: false,
    effects: { maxCustomersBonus: 1 },
  },
  {
    id: 'host-stand',
    name: 'Host Stand',
    description: 'Customers arrive 6% faster per level',
    cost: 110,
    baseCost: 110,
    level: 0,
    maxLevel: 6,
    costGrowth: 1.5,
    purchased: false,
    effects: { spawnIntervalMultiplier: -0.06 },
  },
  {
    id: 'service-training',
    name: 'Service Training',
    description: 'Slow satisfaction decay by 8% per level',
    cost: 130,
    baseCost: 130,
    level: 0,
    maxLevel: 8,
    costGrowth: 1.48,
    purchased: false,
    effects: { satisfactionDecayMultiplier: -0.08 },
  },
  {
    id: 'recipe-marketing',
    name: 'Recipe Marketing',
    description: 'Recipes sell for 10% more per level',
    cost: 260,
    baseCost: 260,
    level: 0,
    maxLevel: 8,
    costGrowth: 1.7,
    purchased: false,
    effects: { recipeValueMultiplier: 0.04 },
  },
  {
    id: 'portion-planning',
    name: 'Portion Planning',
    description: 'Recipes add 10% more future capacity per level',
    cost: 280,
    baseCost: 280,
    level: 0,
    maxLevel: 6,
    costGrowth: 1.75,
    purchased: false,
    effects: { capacityGainMultiplier: 0.04 },
  },
];

export const initialRecipes: Recipe[] = [
  {
    id: 'bacon-ramen',
    name: 'Bacon Ramen',
    description: 'A rich bowl that sells well and teaches the kitchen how to feed larger guests.',
    ingredients: { 'pig-meat': 5 },
    customerType: 'pig',
    unlocked: false,
    unlockCondition: 'Process 5 Pig Girls',
    profitMultiplier: 1.6,
    baseValue: 80,
    capacityBonus: 2,
  },
  {
    id: 'golden-cutlets',
    name: 'Golden Cutlets',
    description: 'A high-volume special that improves prep for bigger appetites.',
    ingredients: { 'chicken-meat': 6 },
    customerType: 'chicken',
    unlocked: false,
    unlockCondition: 'Process 3 Chicken Girls',
    profitMultiplier: 1.8,
    baseValue: 95,
    capacityBonus: 2,
  },
  {
    id: 'tidal-platter',
    name: 'Tidal Platter',
    description: 'A delicate course that rewards quick handling and expands portion planning.',
    ingredients: { 'fish-meat': 5 },
    customerType: 'fish',
    unlocked: false,
    unlockCondition: 'Process 3 Fish Girls',
    profitMultiplier: 1.9,
    baseValue: 105,
    capacityBonus: 2,
  },
  {
    id: 'street-skewers',
    name: 'Street Skewers',
    description: 'A spicy seller that offsets losses from tricky guests.',
    ingredients: { 'fox-meat': 5 },
    customerType: 'fox',
    unlocked: false,
    unlockCondition: 'Process 3 Fox Girls',
    profitMultiplier: 2.0,
    baseValue: 115,
    capacityBonus: 3,
  },
  {
    id: 'honey-roast-feast',
    name: 'Honey Roast Feast',
    description: 'A premium feast built around larger yields and larger future servings.',
    ingredients: { 'bear-meat': 5 },
    customerType: 'bear',
    unlocked: false,
    unlockCondition: 'Process 2 Bear Girls',
    profitMultiplier: 2.3,
    baseValue: 150,
    capacityBonus: 4,
  },
  {
    id: 'rainbow-stew',
    name: 'Rainbow Stew',
    description: 'Legendary stew from multiple guest types.',
    ingredients: {
      'pig-meat': 3,
      'cow-meat': 3,
      'sheep-meat': 3,
      'rabbit-meat': 3,
      'cat-meat': 3,
    },
    unlocked: false,
    unlockCondition: 'Process one of each animal type in a chain',
    profitMultiplier: 3.0,
    baseValue: 220,
    capacityBonus: 6,
  },
];

const initialAchievements: Achievement[] = [
  {
    id: 'first-customer',
    name: 'First Customer',
    description: 'Process your first customer',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    reward: 50,
  },
  {
    id: 'combo-master',
    name: 'Combo Master',
    description: 'Achieve a 10-customer combo chain',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    reward: 200,
  },
  {
    id: 'steady-service',
    name: 'Steady Service',
    description: 'Serve 25 dishes',
    unlocked: false,
    progress: 0,
    maxProgress: 25,
    reward: 150,
  },
  {
    id: 'favorite-service',
    name: 'Favorite Service',
    description: 'Serve 20 preferred dishes',
    unlocked: false,
    progress: 0,
    maxProgress: 20,
    reward: 200,
  },
  {
    id: 'recipe-merchant',
    name: 'Recipe Merchant',
    description: 'Prepare and sell 5 recipes',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
    reward: 250,
  },
  {
    id: 'capacity-planner',
    name: 'Capacity Planner',
    description: 'Reach +40 future guest capacity',
    unlocked: false,
    progress: 0,
    maxProgress: 40,
    reward: 300,
  },
  {
    id: 'broad-menu',
    name: 'Broad Menu',
    description: 'Process 8 different customer types',
    unlocked: false,
    progress: 0,
    maxProgress: 8,
    reward: 300,
  },
  {
    id: 'busy-night',
    name: 'Busy Night',
    description: 'Earn 1,000 total score',
    unlocked: false,
    progress: 0,
    maxProgress: 1000,
    reward: 150,
  },
  {
    id: 'restaurant-empire',
    name: 'Restaurant Empire',
    description: 'Earn 10,000 total score',
    unlocked: false,
    progress: 0,
    maxProgress: 10000,
    reward: 500,
  },
  {
    id: 'overfed-specialist',
    name: 'Overfed Specialist',
    description: 'Overfeed 10 customers',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    reward: 250,
  },
  {
    id: 'fresh-start',
    name: 'Fresh Start',
    description: 'Prestige once',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    reward: 500,
  },
];

const initialState: MetaProgression = {
  currency: 0,
  upgrades: initialUpgrades,
  recipes: initialRecipes,
  achievements: initialAchievements,
  prestigeLevel: 0,
  prestigePoints: 0,
  totalScore: 0,
  processedCustomerCounts: {},
  processedCustomerTypes: [],
  feedingCapacityBonus: 0,
  craftedRecipeCounts: {},
  totalDishesServed: 0,
  preferredDishesServed: 0,
  overfedCustomerCount: 0,
  customersLost: 0,
};

interface ProgressionStore extends MetaProgression {
  applyBackendProgression: (progression: Record<string, unknown>) => void;
  // Actions
  addCurrency: (amount: number) => void;
  spendCurrency: (amount: number) => boolean;
  purchaseUpgrade: (upgradeId: string) => Promise<boolean>;
  unlockRecipe: (recipeId: string) => void;
  updateAchievement: (achievementId: string, progress: number) => void;
  recordScore: (amount: number) => void;
  recordServedDish: (isPreferred: boolean, isOverfed: boolean) => void;
  recordProcessedCustomer: (customerType: string, chainLength: number) => void;
  recordCraftedRecipe: (recipeId: string, capacityBonus: number) => void;
  recordCustomerLost: () => void;
  prestige: () => Promise<boolean>;
  resetProgress: () => Promise<void>;

  // Getters
  getUpgrade: (id: string) => Upgrade | undefined;
  getRecipe: (id: string) => Recipe | undefined;
  getAchievement: (id: string) => Achievement | undefined;
  canAfford: (cost: number) => boolean;
  canPrestige: () => boolean;
  getPrestigeReward: () => number;
  getUpgradeCost: (upgradeId: string) => number;
  getPurchasedEffect: (effectKey: string, fallback?: number) => number;
}

const withAchievementProgress = (
  achievements: Achievement[],
  achievementId: string,
  progress: number
) =>
  achievements.map(achievement =>
    achievement.id === achievementId
      ? {
          ...achievement,
          progress: Math.min(Math.max(achievement.progress, progress), achievement.maxProgress),
          unlocked: achievement.unlocked || progress >= achievement.maxProgress,
        }
      : achievement
  );

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const syncSessionState = (gameState: WebHatcheryGameState): void => {
  useWebHatcherySessionStore.setState({
    gameState,
    user: gameState.user,
    isLoading: false,
    error: null,
  });
};

const extractProgression = (gameState: WebHatcheryGameState): Record<string, unknown> | null => {
  const state = gameState.save.state;
  if (!isRecord(state) || !isRecord(state.progression)) {
    return null;
  }

  return state.progression;
};

export const useProgressionStore = create<ProgressionStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      applyBackendProgression: progression => {
        set({
          currency: typeof progression.currency === 'number' ? progression.currency : 0,
          upgrades: Array.isArray(progression.upgrades) ? (progression.upgrades as Upgrade[]) : initialUpgrades,
          recipes: Array.isArray(progression.recipes) ? (progression.recipes as Recipe[]) : initialRecipes,
          achievements: Array.isArray(progression.achievements)
            ? (progression.achievements as Achievement[])
            : initialAchievements,
          prestigeLevel: typeof progression.prestigeLevel === 'number' ? progression.prestigeLevel : 0,
          prestigePoints: typeof progression.prestigePoints === 'number' ? progression.prestigePoints : 0,
          totalScore: typeof progression.totalScore === 'number' ? progression.totalScore : 0,
          processedCustomerCounts: isRecord(progression.processedCustomerCounts)
            ? (progression.processedCustomerCounts as Record<string, number>)
            : {},
          processedCustomerTypes: Array.isArray(progression.processedCustomerTypes)
            ? progression.processedCustomerTypes.filter((type): type is string => typeof type === 'string')
            : [],
          feedingCapacityBonus:
            typeof progression.feedingCapacityBonus === 'number' ? progression.feedingCapacityBonus : 0,
          craftedRecipeCounts: isRecord(progression.craftedRecipeCounts)
            ? (progression.craftedRecipeCounts as Record<string, number>)
            : {},
          totalDishesServed:
            typeof progression.totalDishesServed === 'number' ? progression.totalDishesServed : 0,
          preferredDishesServed:
            typeof progression.preferredDishesServed === 'number' ? progression.preferredDishesServed : 0,
          overfedCustomerCount:
            typeof progression.overfedCustomerCount === 'number' ? progression.overfedCustomerCount : 0,
          customersLost: typeof progression.customersLost === 'number' ? progression.customersLost : 0,
        });
      },

      addCurrency: amount =>
        set(state => ({
          currency: state.currency + amount,
        })),

      spendCurrency: amount => {
        const state = get();
        if (state.currency >= amount) {
          set({ currency: state.currency - amount });
          return true;
        }
        return false;
      },

      purchaseUpgrade: async upgradeId => {
        try {
          const gameState = await webhatcheryGameApi.applyIntent('purchase_upgrade', { upgradeId });
          syncSessionState(gameState);
          const progression = extractProgression(gameState);
          if (progression) {
            get().applyBackendProgression(progression);
          }
          return true;
        } catch {
          return false;
        }
      },

      purchaseUpgradeLocal: (upgradeId: string) => {
        const state = get();
        const upgrade = state.upgrades.find(u => u.id === upgradeId);
        const currentLevel = upgrade?.level ?? (upgrade?.purchased ? upgrade.maxLevel || 1 : 0);
        const maxLevel = upgrade?.maxLevel || 1;
        if (!upgrade || currentLevel >= maxLevel) {
          return false;
        }

        const upgradeCost = state.getUpgradeCost(upgradeId);
        if (!state.canAfford(upgradeCost)) {
          return false;
        }

        set({
          upgrades: state.upgrades.map(u => {
            if (u.id !== upgradeId) return u;

            const level = u.level ?? (u.purchased ? u.maxLevel || 1 : 0);
            const nextLevel = level + 1;
            const baseCost = u.baseCost ?? u.cost ?? 0;
            const costGrowth = u.costGrowth ?? 1.5;
            const upgradeMaxLevel = u.maxLevel || 1;
            return {
              ...u,
              level: nextLevel,
              cost: Math.ceil(baseCost * Math.pow(costGrowth, nextLevel)),
              purchased: nextLevel >= upgradeMaxLevel,
            };
          }),
        });
        state.spendCurrency(upgradeCost);
        return true;
      },

      unlockRecipe: recipeId =>
        set(state => ({
          recipes: state.recipes.map(r => (r.id === recipeId ? { ...r, unlocked: true } : r)),
        })),

      updateAchievement: (achievementId, progress) =>
        set(state => ({
          achievements: state.achievements.map(a =>
            a.id === achievementId
              ? {
                  ...a,
                  progress: Math.min(progress, a.maxProgress),
                  unlocked: progress >= a.maxProgress,
                }
              : a
          ),
        })),

      recordScore: amount =>
        set(state => {
          const totalScore = state.totalScore + Math.max(0, Math.floor(amount));
          let achievements = withAchievementProgress(state.achievements, 'busy-night', totalScore);
          achievements = withAchievementProgress(achievements, 'restaurant-empire', totalScore);

          return {
            totalScore,
            achievements,
          };
        }),

      recordServedDish: (isPreferred, isOverfed) =>
        set(state => {
          const totalDishesServed = state.totalDishesServed + 1;
          const preferredDishesServed = state.preferredDishesServed + (isPreferred ? 1 : 0);
          const overfedCustomerCount = state.overfedCustomerCount + (isOverfed ? 1 : 0);
          let achievements = withAchievementProgress(
            state.achievements,
            'steady-service',
            totalDishesServed
          );
          achievements = withAchievementProgress(
            achievements,
            'favorite-service',
            preferredDishesServed
          );
          achievements = withAchievementProgress(
            achievements,
            'overfed-specialist',
            overfedCustomerCount
          );

          return {
            totalDishesServed,
            preferredDishesServed,
            overfedCustomerCount,
            achievements,
          };
        }),

      recordProcessedCustomer: (customerType, chainLength) =>
        set(state => {
          const nextCounts = {
            ...state.processedCustomerCounts,
            [customerType]: (state.processedCustomerCounts[customerType] || 0) + 1,
          };
          const nextTypes = Array.from(new Set([...state.processedCustomerTypes, customerType]));
          const baseTypes = ['pig', 'cow', 'sheep', 'rabbit', 'cat'];

          return {
            processedCustomerCounts: nextCounts,
            processedCustomerTypes: nextTypes,
            recipes: state.recipes.map(recipe => {
              if (recipe.id === 'bacon-ramen' && nextCounts.pig >= 5) {
                return { ...recipe, unlocked: true };
              }
              if (recipe.id === 'golden-cutlets' && nextCounts.chicken >= 3) {
                return { ...recipe, unlocked: true };
              }
              if (recipe.id === 'tidal-platter' && nextCounts.fish >= 3) {
                return { ...recipe, unlocked: true };
              }
              if (recipe.id === 'street-skewers' && nextCounts.fox >= 3) {
                return { ...recipe, unlocked: true };
              }
              if (recipe.id === 'honey-roast-feast' && nextCounts.bear >= 2) {
                return { ...recipe, unlocked: true };
              }
              if (
                recipe.id === 'rainbow-stew' &&
                baseTypes.every(type => nextTypes.includes(type))
              ) {
                return { ...recipe, unlocked: true };
              }
              return recipe;
            }),
            achievements: withAchievementProgress(
              withAchievementProgress(
                withAchievementProgress(state.achievements, 'first-customer', 1),
                'combo-master',
                chainLength
              ),
              'broad-menu',
              nextTypes.length
            ),
          };
        }),

      recordCraftedRecipe: (recipeId, capacityBonus) =>
        set(state => {
          const feedingCapacityBonus = Math.min(
            gameBalance.MAX_FEEDING_CAPACITY_BONUS,
            state.feedingCapacityBonus + Math.max(0, capacityBonus)
          );
          const craftedRecipeCounts = {
            ...state.craftedRecipeCounts,
            [recipeId]: (state.craftedRecipeCounts[recipeId] || 0) + 1,
          };
          const totalCraftedRecipes = Object.values(craftedRecipeCounts).reduce(
            (sum, count) => sum + count,
            0
          );
          let achievements = withAchievementProgress(
            state.achievements,
            'recipe-merchant',
            totalCraftedRecipes
          );
          achievements = withAchievementProgress(
            achievements,
            'capacity-planner',
            feedingCapacityBonus
          );

          return {
            feedingCapacityBonus,
            craftedRecipeCounts,
            achievements,
          };
        }),

      recordCustomerLost: () =>
        set(state => ({
          customersLost: state.customersLost + 1,
        })),

      prestige: async () => {
        try {
          const gameState = await webhatcheryGameApi.applyIntent('prestige');
          syncSessionState(gameState);
          const progression = extractProgression(gameState);
          if (progression) {
            get().applyBackendProgression(progression);
          }
          return true;
        } catch {
          return false;
        }
      },

      resetProgress: async () => {
        const gameState = await webhatcheryGameApi.applyIntent('reset_progress');
        syncSessionState(gameState);
        const progression = extractProgression(gameState);
        if (progression) {
          get().applyBackendProgression(progression);
        }
      },

      getUpgrade: id => get().upgrades.find(u => u.id === id),
      getRecipe: id => get().recipes.find(r => r.id === id),
      getAchievement: id => get().achievements.find(a => a.id === id),
      canAfford: cost => get().currency >= cost,
      canPrestige: () => get().totalScore >= gameBalance.PRESTIGE_SCORE_REQUIREMENT,
      getPrestigeReward: () => {
        const state = get();
        const scoreReward = Math.floor(state.totalScore / 10000);
        const achievementReward = state.achievements.filter(
          achievement => achievement.unlocked
        ).length;
        const capacityReward = Math.floor(state.feedingCapacityBonus / 20);
        return Math.max(1, scoreReward + achievementReward + capacityReward);
      },
      getUpgradeCost: upgradeId => {
        const upgrade = get().upgrades.find(item => item.id === upgradeId);
        if (!upgrade) return 0;
        const baseCost = upgrade.baseCost ?? upgrade.cost ?? 0;
        const costGrowth = upgrade.costGrowth ?? 1.5;
        const level = upgrade.level ?? (upgrade.purchased ? upgrade.maxLevel || 1 : 0);
        return Math.ceil(baseCost * Math.pow(costGrowth, level));
      },
      getPurchasedEffect: (effectKey, fallback = 1) => {
        return get().upgrades.reduce((value, item) => {
          if (!Object.prototype.hasOwnProperty.call(item.effects, effectKey)) {
            return value;
          }

          const level = item.level ?? (item.purchased ? item.maxLevel || 1 : 0);
          const nextValue = value + item.effects[effectKey] * level;
          return fallback === 1 ? Math.max(0.25, nextValue) : nextValue;
        }, fallback);
      },
    }),
    {
      name: 'feast-frenzy-progression',
      partialize: state => ({
        currency: state.currency,
        upgrades: state.upgrades,
        recipes: state.recipes,
        achievements: state.achievements,
        prestigeLevel: state.prestigeLevel,
        prestigePoints: state.prestigePoints,
        totalScore: state.totalScore,
        processedCustomerCounts: state.processedCustomerCounts,
        processedCustomerTypes: state.processedCustomerTypes,
        feedingCapacityBonus: state.feedingCapacityBonus,
        craftedRecipeCounts: state.craftedRecipeCounts,
        totalDishesServed: state.totalDishesServed,
        preferredDishesServed: state.preferredDishesServed,
        overfedCustomerCount: state.overfedCustomerCount,
        customersLost: state.customersLost,
      }),
    }
  )
);
