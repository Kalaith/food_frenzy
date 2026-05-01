import { gameBalance } from '../constants/gameBalance';
import { customerTypes, dishTypes } from '../constants/gameData';
import { initialRecipes, initialUpgrades } from '../stores/useProgressionStore';
import type { Customer, Recipe, Upgrade } from '../types/game';

export type SimulatorStrategy = 'steady' | 'preferred' | 'vip-rush' | 'recipe-growth';

export interface SimulationOptions {
  minutes: number;
  runs: number;
  seed: number;
  strategy: SimulatorStrategy;
  autoBuyUpgrades: boolean;
  startingCapacityBonus: number;
}

interface SimCustomer extends Customer {
  arrivedAt: number;
}

interface SimulationRunState {
  timeMs: number;
  score: number;
  currency: number;
  totalScore: number;
  combo: number;
  chain: number;
  customers: SimCustomer[];
  dishesReady: Record<string, number>;
  cookingRemaining: Record<string, number>;
  ingredients: Record<string, number>;
  upgradeLevels: Record<string, number>;
  processedCustomerCounts: Record<string, number>;
  processedCustomerTypes: string[];
  recipes: Recipe[];
  feedingCapacityBonus: number;
  dishesServed: number;
  preferredDishesServed: number;
  overfedCustomers: number;
  processedCustomers: number;
  recipesCrafted: number;
  customersLost: number;
  failedInvites: number;
  stolenDishes: number;
  timeToPrestigeMs: number | null;
}

export interface SimulationRunResult {
  score: number;
  currency: number;
  totalScore: number;
  processedCustomers: number;
  dishesServed: number;
  preferredDishesServed: number;
  recipesCrafted: number;
  customersLost: number;
  failedInvites: number;
  stolenDishes: number;
  feedingCapacityBonus: number;
  unlockedRecipes: number;
  upgradeLevels: number;
  timeToPrestigeMs: number | null;
}

export interface SimulationSummary {
  options: SimulationOptions;
  averages: SimulationRunResult;
  min: Pick<SimulationRunResult, 'score' | 'processedCustomers' | 'customersLost'>;
  max: Pick<SimulationRunResult, 'score' | 'processedCustomers' | 'customersLost'>;
  scorePerMinute: number;
  processRatePerMinute: number;
  lossRatePerMinute: number;
  preferredServeRate: number;
  prestigeRunRate: number;
  warnings: string[];
}

const TICK_MS = 1000;
const UPGRADE_PURCHASE_INTERVAL_MS = 5000;

const createRng = (seed: number) => {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
};

const cloneRecipes = () => initialRecipes.map(recipe => ({ ...recipe }));

const initialUpgradeLevels = () =>
  Object.fromEntries(initialUpgrades.map(upgrade => [upgrade.id, 0])) as Record<string, number>;

const getUpgradeCost = (upgrade: Upgrade, level: number) =>
  Math.ceil(upgrade.baseCost * Math.pow(upgrade.costGrowth, level));

const getEffect = (
  upgrades: Record<string, number>,
  effectKey: string,
  fallback: number
): number => {
  const effect = initialUpgrades.reduce((value, upgrade) => {
    const level = upgrades[upgrade.id] || 0;
    return value + (upgrade.effects[effectKey] || 0) * level;
  }, fallback);

  return fallback === 1 ? Math.max(0.25, effect) : effect;
};

const scorePoints = (
  state: SimulationRunState,
  points: number,
  options: { applyCombo?: boolean } = {}
) => {
  const comboBoost = getEffect(state.upgradeLevels, 'comboMultiplier', 1);
  const comboMultiplier = options.applyCombo === false ? 1 : 1 + state.combo * 0.1 * comboBoost;
  const scoredPoints = Math.floor(points * comboMultiplier);
  state.score += scoredPoints;
  state.totalScore += scoredPoints;

  if (
    state.timeToPrestigeMs === null &&
    state.totalScore >= gameBalance.PRESTIGE_SCORE_REQUIREMENT
  ) {
    state.timeToPrestigeMs = state.timeMs;
  }
};

const getMaxCustomers = (state: SimulationRunState) =>
  gameBalance.MAX_CUSTOMERS + Math.floor(getEffect(state.upgradeLevels, 'maxCustomersBonus', 0));

const getBaseMaxSatisfaction = (state: SimulationRunState) =>
  gameBalance.MAX_SATISFACTION_PER_TYPE + state.feedingCapacityBonus;

const createCustomer = (
  id: number,
  tableIndex: number,
  arrivedAt: number,
  baseMax: number,
  rng: () => number
): SimCustomer => {
  const type = customerTypes[Math.floor(rng() * customerTypes.length)];
  let maxPerType = baseMax;

  if (type.specialTraits?.lowAppetite) {
    maxPerType = Math.floor(baseMax * 0.7);
  }

  if (type.specialTraits?.highYield) {
    maxPerType = Math.floor(baseMax * 1.5);
  }

  return {
    id,
    guestId: `${type.type}-${id}`,
    displayName: `${type.name} ${id}`,
    type,
    satisfaction: { blue: 0, green: 0, yellow: 0, red: 0 },
    maxSatisfaction: {
      blue: maxPerType,
      green: maxPerType,
      yellow: maxPerType,
      red: maxPerType,
    },
    deliciousness: type.baseDeliciousness,
    totalSatisfaction: 0,
    overfed: false,
    isDragging: false,
    tableIndex,
    arrivedAt,
  };
};

const getMaxSatisfactionForCustomer = (customer: SimCustomer) => {
  return Object.values(customer.maxSatisfaction).reduce((sum, value) => sum + value, 0);
};

const spawnCustomer = (state: SimulationRunState, rng: () => number, nextCustomerId: number) => {
  const tableCount = getMaxCustomers(state);
  if (state.customers.length >= tableCount) return nextCustomerId;

  const occupiedTables = new Set(state.customers.map(customer => customer.tableIndex));
  const tableIndex = Array.from({ length: tableCount }, (_, index) => index).find(
    index => !occupiedTables.has(index)
  );
  if (tableIndex === undefined) return nextCustomerId;

  state.customers.push(
    createCustomer(nextCustomerId, tableIndex, state.timeMs, getBaseMaxSatisfaction(state), rng)
  );
  return nextCustomerId + 1;
};

const chooseDishColor = (state: SimulationRunState, strategy: SimulatorStrategy): string | null => {
  const colors = dishTypes.map(dish => dish.color);
  const readyColors = colors.filter(color => (state.dishesReady[color] || 0) > 0);
  if (readyColors.length === 0) return null;

  if (strategy === 'steady') {
    return readyColors.sort(
      (left, right) => (state.dishesReady[right] || 0) - (state.dishesReady[left] || 0)
    )[0];
  }

  const waitingCustomers = [...state.customers].sort(
    (left, right) => right.totalSatisfaction - left.totalSatisfaction
  );
  for (const customer of waitingCustomers) {
    const preferredReady = customer.type.preferredDishes.find(color => readyColors.includes(color));
    if (preferredReady) return preferredReady;
  }

  return readyColors[0];
};

const chooseCustomerForDish = (
  state: SimulationRunState,
  dishColor: string,
  strategy: SimulatorStrategy
) => {
  const candidates = state.customers.filter(customer => {
    const cap = customer.maxSatisfaction[dishColor] * gameBalance.OVERFEED_MULTIPLIER;
    return customer.satisfaction[dishColor] < cap;
  });
  if (candidates.length === 0) return null;

  const preferred = candidates.filter(
    customer =>
      customer.type.preferredDishes.includes(dishColor) || customer.type.specialTraits?.canEatWaste
  );
  const pool = preferred.length > 0 && strategy !== 'steady' ? preferred : candidates;
  return pool.sort((left, right) => {
    if (strategy === 'vip-rush') {
      return (
        right.deliciousness - left.deliciousness || right.totalSatisfaction - left.totalSatisfaction
      );
    }
    return left.totalSatisfaction - right.totalSatisfaction;
  })[0];
};

const serveDish = (state: SimulationRunState, customer: SimCustomer, dishColor: string) => {
  const isPreferred = customer.type.preferredDishes.includes(dishColor);
  let satisfactionGain = isPreferred
    ? gameBalance.PREFERRED_SATISFACTION_GAIN
    : gameBalance.BASE_SATISFACTION_GAIN;
  let deliciousnessGain = isPreferred ? 1 : 0;

  if (!isPreferred && customer.type.specialTraits?.canEatWaste) {
    satisfactionGain = gameBalance.PREFERRED_SATISFACTION_GAIN - 2;
    deliciousnessGain = 1;
  }

  const overfeedMultiplier = customer.type.specialTraits?.lowAppetite
    ? 1.25
    : gameBalance.OVERFEED_MULTIPLIER;
  customer.satisfaction[dishColor] = Math.min(
    customer.maxSatisfaction[dishColor] * overfeedMultiplier,
    customer.satisfaction[dishColor] + satisfactionGain
  );
  customer.deliciousness = Math.min(5, customer.deliciousness + deliciousnessGain);
  customer.totalSatisfaction = Object.values(customer.satisfaction).reduce(
    (sum, amount) => sum + amount,
    0
  );
  customer.overfed = customer.totalSatisfaction > getMaxSatisfactionForCustomer(customer);

  state.dishesReady[dishColor] = Math.max(0, (state.dishesReady[dishColor] || 0) - 1);
  state.dishesServed += 1;
  state.preferredDishesServed += isPreferred ? 1 : 0;
  state.overfedCustomers += customer.overfed ? 1 : 0;

  scorePoints(
    state,
    satisfactionGain *
      (isPreferred
        ? gameBalance.PREFERRED_DISH_SCORE_MULTIPLIER
        : gameBalance.BASE_SCORE_MULTIPLIER)
  );
};

const canProcessCustomer = (customer: SimCustomer) =>
  customer.deliciousness >= gameBalance.VIP_DELICIOUSNESS_THRESHOLD &&
  customer.totalSatisfaction > gameBalance.VIP_SATISFACTION_THRESHOLD;

const processReadyCustomers = (state: SimulationRunState, rng: () => number) => {
  const readyCustomer = state.customers.find(canProcessCustomer);
  if (!readyCustomer) return;

  if (rng() >= 0.85) {
    state.failedInvites += 1;
    return;
  }

  const yieldMultiplier = getEffect(state.upgradeLevels, 'meatYieldMultiplier', 1);
  const traitYieldMultiplier = readyCustomer.type.specialTraits?.highYield ? 1.35 : 1;
  const bonusMeat = readyCustomer.type.specialTraits?.multipliesOnProcess ? 2 : 0;
  const meatGained =
    Math.max(
      1,
      Math.floor(
        (Math.floor(readyCustomer.totalSatisfaction / 20) +
          Math.floor(readyCustomer.deliciousness)) *
          yieldMultiplier *
          traitYieldMultiplier
      )
    ) + bonusMeat;
  const meatType = `${readyCustomer.type.type}-meat`;
  state.ingredients[meatType] = (state.ingredients[meatType] || 0) + meatGained;
  state.customers = state.customers.filter(customer => customer.id !== readyCustomer.id);
  state.combo += 1;
  state.chain += 1;
  state.processedCustomers += 1;
  state.processedCustomerCounts[readyCustomer.type.type] =
    (state.processedCustomerCounts[readyCustomer.type.type] || 0) + 1;
  state.processedCustomerTypes = Array.from(
    new Set([...state.processedCustomerTypes, readyCustomer.type.type])
  );

  const points =
    gameBalance.VIP_POINTS_PER_DELICIOUSNESS * readyCustomer.deliciousness + meatGained * 10;
  scorePoints(state, points);
  state.currency += Math.floor(points / 5);
  unlockRecipes(state);
};

const unlockRecipes = (state: SimulationRunState) => {
  const baseTypes = ['pig', 'cow', 'sheep', 'rabbit', 'cat'];
  state.recipes = state.recipes.map(recipe => {
    if (recipe.id === 'bacon-ramen' && (state.processedCustomerCounts.pig || 0) >= 5) {
      return { ...recipe, unlocked: true };
    }
    if (recipe.id === 'golden-cutlets' && (state.processedCustomerCounts.chicken || 0) >= 3) {
      return { ...recipe, unlocked: true };
    }
    if (recipe.id === 'tidal-platter' && (state.processedCustomerCounts.fish || 0) >= 3) {
      return { ...recipe, unlocked: true };
    }
    if (recipe.id === 'street-skewers' && (state.processedCustomerCounts.fox || 0) >= 3) {
      return { ...recipe, unlocked: true };
    }
    if (recipe.id === 'honey-roast-feast' && (state.processedCustomerCounts.bear || 0) >= 2) {
      return { ...recipe, unlocked: true };
    }
    if (
      recipe.id === 'rainbow-stew' &&
      baseTypes.every(type => state.processedCustomerTypes.includes(type))
    ) {
      return { ...recipe, unlocked: true };
    }
    return recipe;
  });
};

const craftAvailableRecipes = (state: SimulationRunState, strategy: SimulatorStrategy) => {
  if (strategy !== 'recipe-growth') return;

  const unlockedRecipes = state.recipes
    .filter(recipe => recipe.unlocked)
    .sort((left, right) => right.capacityBonus - left.capacityBonus);

  for (const recipe of unlockedRecipes) {
    const canCraft = Object.entries(recipe.ingredients).every(
      ([ingredient, amount]) => (state.ingredients[ingredient] || 0) >= amount
    );
    if (!canCraft) continue;

    for (const [ingredient, amount] of Object.entries(recipe.ingredients)) {
      state.ingredients[ingredient] -= amount;
    }

    const recipeValueMultiplier = getEffect(state.upgradeLevels, 'recipeValueMultiplier', 1);
    const capacityGainMultiplier = getEffect(state.upgradeLevels, 'capacityGainMultiplier', 1);
    const scoreGained = Math.floor(
      recipe.baseValue * recipe.profitMultiplier * recipeValueMultiplier
    );
    scorePoints(state, scoreGained, { applyCombo: false });
    state.currency += Math.floor(scoreGained / 4);
    state.feedingCapacityBonus = Math.min(
      gameBalance.MAX_FEEDING_CAPACITY_BONUS,
      state.feedingCapacityBonus +
        Math.max(1, Math.floor(recipe.capacityBonus * capacityGainMultiplier))
    );
    state.recipesCrafted += 1;
  }
};

const buyBestUpgrade = (state: SimulationRunState, strategy: SimulatorStrategy) => {
  const priorityByStrategy: Record<SimulatorStrategy, string[]> = {
    steady: ['cooking-speed', 'customer-patience', 'dining-room', 'processing-efficiency'],
    preferred: ['cooking-speed', 'combo-boost', 'customer-patience', 'processing-efficiency'],
    'vip-rush': ['processing-efficiency', 'combo-boost', 'cooking-speed', 'customer-patience'],
    'recipe-growth': [
      'cooking-speed',
      'customer-patience',
      'recipe-marketing',
      'portion-planning',
      'processing-efficiency',
      'dining-room',
    ],
  };

  const affordable = initialUpgrades
    .filter(upgrade => (state.upgradeLevels[upgrade.id] || 0) < upgrade.maxLevel)
    .map(upgrade => ({
      upgrade,
      cost: getUpgradeCost(upgrade, state.upgradeLevels[upgrade.id] || 0),
      priority: priorityByStrategy[strategy].indexOf(upgrade.id),
    }))
    .filter(item => item.cost <= state.currency)
    .sort((left, right) => {
      const leftPriority = left.priority === -1 ? 99 : left.priority;
      const rightPriority = right.priority === -1 ? 99 : right.priority;
      return leftPriority - rightPriority || left.cost - right.cost;
    });

  const purchase = affordable[0];
  if (!purchase) return;

  state.currency -= purchase.cost;
  state.upgradeLevels[purchase.upgrade.id] = (state.upgradeLevels[purchase.upgrade.id] || 0) + 1;
};

const updateCooking = (state: SimulationRunState) => {
  const cookTimeMultiplier = getEffect(state.upgradeLevels, 'cookTimeMultiplier', 1);

  for (const dish of dishTypes) {
    const remaining = state.cookingRemaining[dish.color] || 0;
    if (remaining > 0) {
      const nextRemaining = Math.max(0, remaining - TICK_MS);
      state.cookingRemaining[dish.color] = nextRemaining;
      if (nextRemaining === 0) {
        state.dishesReady[dish.color] = (state.dishesReady[dish.color] || 0) + 1;
      }
      continue;
    }

    const readyBacklog = state.dishesReady[dish.color] || 0;
    if (readyBacklog < 3) {
      state.cookingRemaining[dish.color] = Math.max(
        1000,
        Math.floor(dish.cookTime * cookTimeMultiplier)
      );
    }
  }
};

const updateCustomerTimers = (state: SimulationRunState, rng: () => number) => {
  const patienceMultiplier = getEffect(state.upgradeLevels, 'patienceMultiplier', 1);
  const satisfactionDecayMultiplier = getEffect(
    state.upgradeLevels,
    'satisfactionDecayMultiplier',
    1
  );
  const patienceTime = gameBalance.CUSTOMER_PATIENCE_TIME * patienceMultiplier;

  state.customers = state.customers.filter(customer => {
    const traitPatienceTime = customer.type.specialTraits?.fastSpoilage
      ? patienceTime * 0.55
      : patienceTime;
    if (state.timeMs - customer.arrivedAt <= traitPatienceTime) return true;

    state.customersLost += 1;
    state.combo = 0;
    return false;
  });

  if (state.timeMs % gameBalance.SATISFACTION_DECAY_INTERVAL === 0) {
    const decayAmount = 0.5 * satisfactionDecayMultiplier;
    for (const customer of state.customers) {
      if (customer.totalSatisfaction <= 0) continue;

      for (const color of Object.keys(customer.satisfaction)) {
        customer.satisfaction[color] = Math.max(0, customer.satisfaction[color] - decayAmount);
      }
      customer.totalSatisfaction = Object.values(customer.satisfaction).reduce(
        (sum, amount) => sum + amount,
        0
      );
    }
  }

  if (state.timeMs % gameBalance.TRAIT_TICK_INTERVAL !== 0) return;

  for (const customer of state.customers) {
    if (customer.type.specialTraits?.canStealFood && rng() < 0.35) {
      const station = Object.entries(state.dishesReady).find(([, count]) => count > 0);
      if (station) {
        state.dishesReady[station[0]] -= 1;
        state.stolenDishes += 1;
      }
    }

    if (customer.type.specialTraits?.throwsFood && customer.totalSatisfaction < 60 && rng() < 0.3) {
      const station = Object.entries(state.dishesReady).find(([, count]) => count > 0);
      if (station) {
        state.dishesReady[station[0]] -= 1;
        state.stolenDishes += 1;
        state.combo = 0;
      }
    }

    if (customer.type.specialTraits?.fastSpoilage && customer.totalSatisfaction > 0) {
      for (const color of Object.keys(customer.satisfaction)) {
        customer.satisfaction[color] = Math.max(0, customer.satisfaction[color] - 2);
      }
      customer.totalSatisfaction = Object.values(customer.satisfaction).reduce(
        (sum, amount) => sum + amount,
        0
      );
    }
  }
};

const runSingleSimulation = (options: SimulationOptions, runIndex: number): SimulationRunResult => {
  const rng = createRng(options.seed + runIndex * 9973);
  const state: SimulationRunState = {
    timeMs: 0,
    score: 0,
    currency: 0,
    totalScore: 0,
    combo: 0,
    chain: 0,
    customers: [],
    dishesReady: Object.fromEntries(dishTypes.map(dish => [dish.color, 0])),
    cookingRemaining: Object.fromEntries(dishTypes.map(dish => [dish.color, 0])),
    ingredients: { regular: Infinity },
    upgradeLevels: initialUpgradeLevels(),
    processedCustomerCounts: {},
    processedCustomerTypes: [],
    recipes: cloneRecipes(),
    feedingCapacityBonus: options.startingCapacityBonus,
    dishesServed: 0,
    preferredDishesServed: 0,
    overfedCustomers: 0,
    processedCustomers: 0,
    recipesCrafted: 0,
    customersLost: 0,
    failedInvites: 0,
    stolenDishes: 0,
    timeToPrestigeMs: null,
  };

  let nextCustomerId = 1;
  let nextRegularSpawnMs = gameBalance.INITIAL_SPAWN_DELAYS[0];
  let initialSpawnIndex = 0;
  const endTimeMs = options.minutes * 60 * 1000;

  for (state.timeMs = 0; state.timeMs <= endTimeMs; state.timeMs += TICK_MS) {
    if (initialSpawnIndex < gameBalance.INITIAL_SPAWN_DELAYS.length) {
      if (state.timeMs >= gameBalance.INITIAL_SPAWN_DELAYS[initialSpawnIndex]) {
        nextCustomerId = spawnCustomer(state, rng, nextCustomerId);
        initialSpawnIndex += 1;
        nextRegularSpawnMs = state.timeMs + gameBalance.CUSTOMER_SPAWN_INTERVAL;
      }
    } else if (state.timeMs >= nextRegularSpawnMs) {
      nextCustomerId = spawnCustomer(state, rng, nextCustomerId);
      nextRegularSpawnMs =
        state.timeMs +
        Math.max(
          5000,
          gameBalance.CUSTOMER_SPAWN_INTERVAL *
            getEffect(state.upgradeLevels, 'spawnIntervalMultiplier', 1)
        );
    }

    updateCooking(state);
    updateCustomerTimers(state, rng);

    for (let servesThisTick = 0; servesThisTick < 2; servesThisTick += 1) {
      const dishColor = chooseDishColor(state, options.strategy);
      if (!dishColor) break;
      const customer = chooseCustomerForDish(state, dishColor, options.strategy);
      if (!customer) break;
      serveDish(state, customer, dishColor);
    }

    processReadyCustomers(state, rng);
    craftAvailableRecipes(state, options.strategy);

    if (options.autoBuyUpgrades && state.timeMs % UPGRADE_PURCHASE_INTERVAL_MS === 0) {
      buyBestUpgrade(state, options.strategy);
    }
  }

  return {
    score: state.score,
    currency: state.currency,
    totalScore: state.totalScore,
    processedCustomers: state.processedCustomers,
    dishesServed: state.dishesServed,
    preferredDishesServed: state.preferredDishesServed,
    recipesCrafted: state.recipesCrafted,
    customersLost: state.customersLost,
    failedInvites: state.failedInvites,
    stolenDishes: state.stolenDishes,
    feedingCapacityBonus: state.feedingCapacityBonus,
    unlockedRecipes: state.recipes.filter(recipe => recipe.unlocked).length,
    upgradeLevels: Object.values(state.upgradeLevels).reduce((sum, level) => sum + level, 0),
    timeToPrestigeMs: state.timeToPrestigeMs,
  };
};

const averageResults = (results: SimulationRunResult[]): SimulationRunResult => {
  const average = <K extends keyof SimulationRunResult>(key: K) => {
    const values = results.map(result => result[key]).filter(value => value !== null) as number[];
    if (values.length === 0) return null;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  };

  return {
    score: average('score') || 0,
    currency: average('currency') || 0,
    totalScore: average('totalScore') || 0,
    processedCustomers: average('processedCustomers') || 0,
    dishesServed: average('dishesServed') || 0,
    preferredDishesServed: average('preferredDishesServed') || 0,
    recipesCrafted: average('recipesCrafted') || 0,
    customersLost: average('customersLost') || 0,
    failedInvites: average('failedInvites') || 0,
    stolenDishes: average('stolenDishes') || 0,
    feedingCapacityBonus: average('feedingCapacityBonus') || 0,
    unlockedRecipes: average('unlockedRecipes') || 0,
    upgradeLevels: average('upgradeLevels') || 0,
    timeToPrestigeMs: average('timeToPrestigeMs'),
  };
};

const buildWarnings = (summary: Omit<SimulationSummary, 'warnings'>) => {
  const warnings: string[] = [];

  if (summary.lossRatePerMinute > 0.35) {
    warnings.push(
      'Customer losses are high; patience, spawn rate, or early cooking speed may need tuning.'
    );
  }

  if (summary.prestigeRunRate < 0.5 && summary.options.minutes >= 15) {
    warnings.push(
      'Most runs do not reach prestige; consider lowering the prestige threshold or increasing mid-run scoring.'
    );
  }

  if (summary.averages.upgradeLevels < 2 && summary.options.minutes >= 10) {
    warnings.push('Upgrade purchases are slow; early currency income may be too tight.');
  }

  if (summary.averages.unlockedRecipes < 1 && summary.options.minutes >= 15) {
    warnings.push(
      'Recipe unlocks are rare; processing requirements may be too steep for the current loop.'
    );
  }

  if (summary.preferredServeRate < 0.45) {
    warnings.push(
      'Preferred serving rate is low; dish production or auto-serving pressure may be too random.'
    );
  }

  return warnings;
};

export const runBalanceSimulation = (options: SimulationOptions): SimulationSummary => {
  const normalizedOptions = {
    ...options,
    minutes: Math.max(1, Math.floor(options.minutes)),
    runs: Math.max(1, Math.floor(options.runs)),
    seed: Math.floor(options.seed),
    startingCapacityBonus: Math.max(0, Math.floor(options.startingCapacityBonus)),
  };
  const results = Array.from({ length: normalizedOptions.runs }, (_, index) =>
    runSingleSimulation(normalizedOptions, index)
  );
  const averages = averageResults(results);
  const minutes = normalizedOptions.minutes;
  const prestigeRuns = results.filter(result => result.timeToPrestigeMs !== null).length;
  const summaryWithoutWarnings: Omit<SimulationSummary, 'warnings'> = {
    options: normalizedOptions,
    averages,
    min: {
      score: Math.min(...results.map(result => result.score)),
      processedCustomers: Math.min(...results.map(result => result.processedCustomers)),
      customersLost: Math.min(...results.map(result => result.customersLost)),
    },
    max: {
      score: Math.max(...results.map(result => result.score)),
      processedCustomers: Math.max(...results.map(result => result.processedCustomers)),
      customersLost: Math.max(...results.map(result => result.customersLost)),
    },
    scorePerMinute: averages.score / minutes,
    processRatePerMinute: averages.processedCustomers / minutes,
    lossRatePerMinute: averages.customersLost / minutes,
    preferredServeRate:
      averages.dishesServed > 0 ? averages.preferredDishesServed / averages.dishesServed : 0,
    prestigeRunRate: prestigeRuns / normalizedOptions.runs,
  };

  return {
    ...summaryWithoutWarnings,
    warnings: buildWarnings(summaryWithoutWarnings),
  };
};
