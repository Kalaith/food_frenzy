import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from './useGameStore';
import { useGuestStore } from './useGuestStore';
import { useProgressionStore } from './useProgressionStore';

describe('game and progression stores', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.getState().resetGame();
    useProgressionStore.getState().resetProgress();
    useGuestStore.getState().resetGuests();
  });

  it('records score in progression when game score changes', () => {
    useGameStore.getState().addScore(50);

    expect(useGameStore.getState().score).toBe(50);
    expect(useProgressionStore.getState().totalScore).toBe(50);
  });

  it('scales upgrade costs and effects by level', () => {
    useProgressionStore.getState().addCurrency(1000);

    const firstCost = useProgressionStore.getState().getUpgradeCost('cooking-speed');
    expect(firstCost).toBe(80);

    expect(useProgressionStore.getState().purchaseUpgrade('cooking-speed')).toBe(true);
    expect(useProgressionStore.getState().getUpgrade('cooking-speed')?.level).toBe(1);
    expect(useProgressionStore.getState().getUpgradeCost('cooking-speed')).toBeGreaterThan(
      firstCost
    );
    expect(useProgressionStore.getState().getPurchasedEffect('cookTimeMultiplier', 1)).toBeCloseTo(
      0.92
    );

    expect(useProgressionStore.getState().purchaseUpgrade('cooking-speed')).toBe(true);
    expect(useProgressionStore.getState().getPurchasedEffect('cookTimeMultiplier', 1)).toBeCloseTo(
      0.84
    );
  });

  it('tracks serving achievements', () => {
    const progression = useProgressionStore.getState();

    for (let index = 0; index < 25; index += 1) {
      progression.recordServedDish(index < 20, index < 10);
    }

    expect(useProgressionStore.getState().getAchievement('steady-service')?.unlocked).toBe(true);
    expect(useProgressionStore.getState().getAchievement('favorite-service')?.unlocked).toBe(true);
    expect(useProgressionStore.getState().getAchievement('overfed-specialist')?.unlocked).toBe(
      true
    );
  });

  it('tracks processed customers for achievements and recipe unlocks', () => {
    const progression = useProgressionStore.getState();

    progression.recordProcessedCustomer('pig', 1);
    progression.recordProcessedCustomer('pig', 2);
    progression.recordProcessedCustomer('pig', 3);
    progression.recordProcessedCustomer('pig', 4);
    progression.recordProcessedCustomer('pig', 5);

    expect(useProgressionStore.getState().getAchievement('first-customer')?.unlocked).toBe(true);
    expect(useProgressionStore.getState().getRecipe('bacon-ramen')?.unlocked).toBe(true);

    useProgressionStore.getState().recordProcessedCustomer('cow', 10);

    expect(useProgressionStore.getState().getAchievement('combo-master')?.unlocked).toBe(true);
  });

  it('unlocks special trait recipes from processed customer counts', () => {
    const progression = useProgressionStore.getState();

    progression.recordProcessedCustomer('chicken', 1);
    progression.recordProcessedCustomer('chicken', 2);
    progression.recordProcessedCustomer('chicken', 3);
    progression.recordProcessedCustomer('fish', 4);
    progression.recordProcessedCustomer('fish', 5);
    progression.recordProcessedCustomer('fish', 6);
    progression.recordProcessedCustomer('bear', 7);
    progression.recordProcessedCustomer('bear', 8);

    expect(useProgressionStore.getState().getRecipe('golden-cutlets')?.unlocked).toBe(true);
    expect(useProgressionStore.getState().getRecipe('tidal-platter')?.unlocked).toBe(true);
    expect(useProgressionStore.getState().getRecipe('honey-roast-feast')?.unlocked).toBe(true);
  });

  it('crafts unlocked recipes into score, currency, and future capacity', () => {
    const progression = useProgressionStore.getState();

    progression.unlockRecipe('bacon-ramen');
    useGameStore.getState().updateIngredients({ 'pig-meat': 5 });

    const recipe = useProgressionStore.getState().getRecipe('bacon-ramen');
    expect(recipe).toBeDefined();
    expect(useGameStore.getState().craftRecipe(recipe!)).toBe(true);

    expect(useGameStore.getState().ingredients['pig-meat']).toBe(0);
    expect(useGameStore.getState().score).toBe(128);
    expect(useProgressionStore.getState().currency).toBe(32);
    expect(useProgressionStore.getState().feedingCapacityBonus).toBe(2);
    expect(useProgressionStore.getState().craftedRecipeCounts['bacon-ramen']).toBe(1);
  });

  it('prestiges into permanent power after enough total score', () => {
    useGameStore.getState().addScore(50000);

    expect(useProgressionStore.getState().canPrestige()).toBe(true);

    const reward = useProgressionStore.getState().getPrestigeReward();
    useProgressionStore.getState().prestige();

    expect(useProgressionStore.getState().prestigeLevel).toBe(1);
    expect(useProgressionStore.getState().prestigePoints).toBe(reward);
    expect(useProgressionStore.getState().currency).toBe(reward);
    expect(useProgressionStore.getState().totalScore).toBe(0);
    expect(useProgressionStore.getState().getAchievement('fresh-start')?.unlocked).toBe(true);
  });

  it('removes ready dishes only when explicitly served', () => {
    useGameStore.getState().addDish('blue', 'Spring Rolls');

    expect(useGameStore.getState().getDishesForStation('blue')).toEqual(['Spring Rolls']);

    useGameStore.getState().removeDish('blue', 0);

    expect(useGameStore.getState().getDishesForStation('blue')).toEqual([]);
  });
});
