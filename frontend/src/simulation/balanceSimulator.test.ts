import { describe, expect, it } from 'vitest';
import { runBalanceSimulation } from './balanceSimulator';

describe('balance simulator', () => {
  it('returns deterministic results for the same seed and options', () => {
    const options = {
      minutes: 10,
      runs: 8,
      seed: 1234,
      strategy: 'preferred' as const,
      autoBuyUpgrades: true,
      startingCapacityBonus: 0,
    };

    expect(runBalanceSimulation(options)).toEqual(runBalanceSimulation(options));
  });

  it('reports useful balance metrics and warnings', () => {
    const summary = runBalanceSimulation({
      minutes: 15,
      runs: 12,
      seed: 7,
      strategy: 'recipe-growth',
      autoBuyUpgrades: true,
      startingCapacityBonus: 0,
    });

    expect(summary.averages.score).toBeGreaterThan(0);
    expect(summary.averages.dishesServed).toBeGreaterThan(0);
    expect(summary.scorePerMinute).toBeGreaterThan(0);
    expect(summary.preferredServeRate).toBeGreaterThanOrEqual(0);
    expect(summary.preferredServeRate).toBeLessThanOrEqual(1);
    expect(summary.prestigeRunRate).toBeGreaterThanOrEqual(0);
    expect(summary.prestigeRunRate).toBeLessThanOrEqual(1);
    expect(Array.isArray(summary.warnings)).toBe(true);
  });
});
