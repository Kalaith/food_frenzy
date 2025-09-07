import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MetaProgression, Upgrade, Recipe, Achievement } from '../types/game';

const initialUpgrades: Upgrade[] = [
  {
    id: 'cooking-speed',
    name: 'Faster Cooking',
    description: 'Reduce cooking time by 20%',
    cost: 100,
    purchased: false,
    effects: { cookTimeMultiplier: 0.8 }
  },
  {
    id: 'customer-patience',
    name: 'Patient Customers',
    description: 'Customers wait 50% longer before leaving',
    cost: 150,
    purchased: false,
    effects: { patienceMultiplier: 1.5 }
  },
  {
    id: 'processing-efficiency',
    name: 'Better Processing',
    description: 'Get 25% more meat from processing',
    cost: 200,
    purchased: false,
    effects: { meatYieldMultiplier: 1.25 }
  },
  {
    id: 'combo-boost',
    name: 'Combo Master',
    description: 'Higher combo multipliers',
    cost: 250,
    purchased: false,
    effects: { comboMultiplier: 1.3 }
  }
];

const initialRecipes: Recipe[] = [
  {
    id: 'bacon-ramen',
    name: 'Bacon Ramen',
    description: 'Premium ramen made from Pig Girl meat',
    ingredients: { 'pig-meat': 2 },
    customerType: 'pig',
    unlocked: false,
    unlockCondition: 'Process 5 Pig Girls',
    profitMultiplier: 2.0
  },
  {
    id: 'rainbow-stew',
    name: 'Rainbow Stew',
    description: 'Legendary stew from all animal types',
    ingredients: { 'pig-meat': 1, 'cow-meat': 1, 'sheep-meat': 1, 'rabbit-meat': 1, 'cat-meat': 1 },
    unlocked: false,
    unlockCondition: 'Process one of each animal type in a chain',
    profitMultiplier: 5.0
  }
];

const initialAchievements: Achievement[] = [
  {
    id: 'first-customer',
    name: 'First Customer',
    description: 'Process your first customer',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    reward: 50
  },
  {
    id: 'combo-master',
    name: 'Combo Master',
    description: 'Achieve a 10-customer combo chain',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    reward: 200
  }
];

const initialState: MetaProgression = {
  currency: 0,
  upgrades: initialUpgrades,
  recipes: initialRecipes,
  achievements: initialAchievements,
  prestigeLevel: 0,
  totalScore: 0
};

interface ProgressionStore extends MetaProgression {
  // Actions
  addCurrency: (amount: number) => void;
  spendCurrency: (amount: number) => boolean;
  purchaseUpgrade: (upgradeId: string) => boolean;
  unlockRecipe: (recipeId: string) => void;
  updateAchievement: (achievementId: string, progress: number) => void;
  prestige: () => void;
  resetProgress: () => void;

  // Getters
  getUpgrade: (id: string) => Upgrade | undefined;
  getRecipe: (id: string) => Recipe | undefined;
  getAchievement: (id: string) => Achievement | undefined;
  canAfford: (cost: number) => boolean;
}

export const useProgressionStore = create<ProgressionStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addCurrency: (amount) => set((state) => ({
        currency: state.currency + amount
      })),

      spendCurrency: (amount) => {
        const state = get();
        if (state.currency >= amount) {
          set({ currency: state.currency - amount });
          return true;
        }
        return false;
      },

      purchaseUpgrade: (upgradeId) => {
        const state = get();
        const upgrade = state.upgrades.find(u => u.id === upgradeId);
        if (!upgrade || upgrade.purchased || !state.canAfford(upgrade.cost)) {
          return false;
        }

        set({
          upgrades: state.upgrades.map(u =>
            u.id === upgradeId ? { ...u, purchased: true } : u
          )
        });
        state.spendCurrency(upgrade.cost);
        return true;
      },

      unlockRecipe: (recipeId) => set((state) => ({
        recipes: state.recipes.map(r =>
          r.id === recipeId ? { ...r, unlocked: true } : r
        )
      })),

      updateAchievement: (achievementId, progress) => set((state) => ({
        achievements: state.achievements.map(a =>
          a.id === achievementId
            ? {
                ...a,
                progress: Math.min(progress, a.maxProgress),
                unlocked: progress >= a.maxProgress
              }
            : a
        )
      })),

      prestige: () => {
        const state = get();
        const prestigeBonus = Math.floor(state.totalScore / 1000);
        set({
          prestigeLevel: state.prestigeLevel + 1,
          currency: state.currency + prestigeBonus,
          upgrades: initialUpgrades,
          recipes: initialRecipes,
          achievements: initialAchievements
        });
      },

      resetProgress: () => set(initialState),

      getUpgrade: (id) => get().upgrades.find(u => u.id === id),
      getRecipe: (id) => get().recipes.find(r => r.id === id),
      getAchievement: (id) => get().achievements.find(a => a.id === id),
      canAfford: (cost) => get().currency >= cost
    }),
    {
      name: 'feast-frenzy-progression',
      partialize: (state) => ({
        currency: state.currency,
        upgrades: state.upgrades,
        recipes: state.recipes,
        achievements: state.achievements,
        prestigeLevel: state.prestigeLevel,
        totalScore: state.totalScore
      })
    }
  )
);
