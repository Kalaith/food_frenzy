// Game Balance Constants - Easy to tweak for difficulty
export const gameBalance = {
  // Customer Spawning
  CUSTOMER_SPAWN_INTERVAL: 20000, // 20 seconds between new customers
  INITIAL_SPAWN_DELAYS: [5000, 15000], // First customers at 5s and 15s

  // Customer Satisfaction
  BASE_SATISFACTION_GAIN: 8, // Base satisfaction per dish
  PREFERRED_SATISFACTION_GAIN: 12, // Satisfaction for preferred dishes
  MAX_SATISFACTION_PER_TYPE: 40, // How much each dish type can satisfy (was 25)

  // VIP Processing
  VIP_DELICIOUSNESS_THRESHOLD: 3,
  VIP_SATISFACTION_THRESHOLD: 120, // 75% of max possible (160 * 0.75)

  // Scoring
  BASE_SCORE_MULTIPLIER: 1,
  PREFERRED_DISH_SCORE_MULTIPLIER: 2,
  VIP_POINTS_PER_DELICIOUSNESS: 200,

  // Game Flow
  MAX_CUSTOMERS: 6,
  OVERFEED_MULTIPLIER: 1.5, // Can overfeed up to 1.5x max satisfaction
} as const;

// Helper function to calculate total max satisfaction
export const getTotalMaxSatisfaction = () =>
  gameBalance.MAX_SATISFACTION_PER_TYPE * 4; // 4 dish types

// Helper function to get VIP threshold as percentage
export const getVipThresholdPercentage = () =>
  (gameBalance.VIP_SATISFACTION_THRESHOLD / getTotalMaxSatisfaction()) * 100;
