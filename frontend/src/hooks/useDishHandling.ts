import { useCallback } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { gameBalance } from '../constants/gameBalance';

export const useDishHandling = (showMessage: (message: string) => void) => {
  const { customers, updateCustomer, addScore, canProcessCustomer } = useGameStore();

  const handleDishReady = useCallback(
    (dishName: string) => {
      showMessage(`${dishName} is ready! Drag it to a customer.`);
    },
    [showMessage]
  );

  const handleDishDropOnCustomer = useCallback(
    (customerId: number, dishColor: string, dishName: string) => {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) return;

      const isPreferred = customer.type.preferredDishes.includes(dishColor);
      let satisfactionGain: number = gameBalance.BASE_SATISFACTION_GAIN;
      let deliciousnessGain = 0;

      if (isPreferred) {
        satisfactionGain = gameBalance.PREFERRED_SATISFACTION_GAIN;
        deliciousnessGain = 1;
        showMessage(`${customer.type.name} loves ${dishName}! +${satisfactionGain} satisfaction!`);
      } else {
        showMessage(`${customer.type.name} ate ${dishName}. +${satisfactionGain} satisfaction.`);
      }

      // Calculate new satisfaction
      const newSatisfaction = { ...customer.satisfaction };
      newSatisfaction[dishColor] = Math.min(
        customer.maxSatisfaction[dishColor] * 1.5, // Allow overfeeding up to 1.5x
        customer.satisfaction[dishColor] + satisfactionGain
      );

      // Calculate new deliciousness (capped at 5)
      const newDeliciousness = Math.min(5, customer.deliciousness + deliciousnessGain);

      // Calculate total satisfaction
      const newTotalSatisfaction = Object.values(newSatisfaction).reduce(
        (sum, val) => sum + val,
        0
      );
      const maxTotal = Object.values(customer.maxSatisfaction).reduce((sum, val) => sum + val, 0);
      const isOverfed = newTotalSatisfaction > maxTotal;

      updateCustomer(customerId, {
        satisfaction: newSatisfaction,
        deliciousness: newDeliciousness,
        totalSatisfaction: newTotalSatisfaction,
        overfed: isOverfed,
      });

      // Score points using game balance
      addScore(
        satisfactionGain *
          (isPreferred
            ? gameBalance.PREFERRED_DISH_SCORE_MULTIPLIER
            : gameBalance.BASE_SCORE_MULTIPLIER)
      );

      if (
        canProcessCustomer({
          ...customer,
          deliciousness: newDeliciousness,
          totalSatisfaction: newTotalSatisfaction,
        })
      ) {
        showMessage(`${customer.type.name} is ready for the Special Table! 🔪`);
      }
    },
    [customers, updateCustomer, addScore, canProcessCustomer, showMessage]
  );

  return {
    handleDishReady,
    handleDishDropOnCustomer,
  };
};
