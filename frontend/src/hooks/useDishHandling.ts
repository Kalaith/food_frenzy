import { useCallback } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { useGuestStore } from '../stores/useGuestStore';
import { useProgressionStore } from '../stores/useProgressionStore';
import { gameBalance } from '../constants/gameBalance';
import { getCustomerDisplayName } from '../utils/customerDisplay';

export const useDishHandling = (showMessage: (message: string) => void) => {
  const { customers, updateCustomer, addScore, canProcessCustomer, removeDish } = useGameStore();
  const { recordServedDish } = useProgressionStore();

  const handleDishReady = useCallback(
    (dishName: string) => {
      showMessage(`${dishName} is ready! Drag it to a customer.`);
    },
    [showMessage]
  );

  const handleDishDropOnCustomer = useCallback(
    (customerId: number, dishColor: string, dishName: string, dishIndex: number) => {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) return;

      const isPreferred = customer.type.preferredDishes.includes(dishColor);
      let satisfactionGain: number = gameBalance.BASE_SATISFACTION_GAIN;
      let deliciousnessGain = 0;

      if (isPreferred) {
        satisfactionGain = gameBalance.PREFERRED_SATISFACTION_GAIN;
        deliciousnessGain = 1;
        showMessage(
          `${getCustomerDisplayName(customer)} loves ${dishName}! +${satisfactionGain} satisfaction!`
        );
      } else if (customer.type.specialTraits?.canEatWaste) {
        satisfactionGain = gameBalance.PREFERRED_SATISFACTION_GAIN - 2;
        deliciousnessGain = 1;
        showMessage(
          `${getCustomerDisplayName(customer)} happily accepts ${dishName}! +${satisfactionGain} satisfaction!`
        );
      } else {
        showMessage(
          `${getCustomerDisplayName(customer)} ate ${dishName}. +${satisfactionGain} satisfaction.`
        );
      }

      // Calculate new satisfaction
      const newSatisfaction = { ...customer.satisfaction };
      const overfeedMultiplier = customer.type.specialTraits?.lowAppetite
        ? 1.25
        : gameBalance.OVERFEED_MULTIPLIER;
      newSatisfaction[dishColor] = Math.min(
        customer.maxSatisfaction[dishColor] * overfeedMultiplier,
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
      recordServedDish(isPreferred, isOverfed);
      useGuestStore.getState().recordGuestFed(customer.guestId);
      removeDish(dishColor, dishIndex);

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
        showMessage(`${getCustomerDisplayName(customer)} is ready for the Special Table! 🔪`);
      }
    },
    [
      customers,
      updateCustomer,
      addScore,
      canProcessCustomer,
      removeDish,
      recordServedDish,
      showMessage,
    ]
  );

  return {
    handleDishReady,
    handleDishDropOnCustomer,
  };
};
