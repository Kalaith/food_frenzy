import { useCallback } from 'react';
import { useGameStore } from '../stores/useGameStore';

export const useDishHandling = (showMessage: (message: string) => void) => {
  const customers = useGameStore(state => state.customers);
  const serveDish = useGameStore(state => state.serveDish);
  const lastMessage = useGameStore(state => state.lastMessage);

  const handleDishReady = useCallback(
    (dishName: string) => {
      showMessage(`${dishName} is ready! Drag it to a customer.`);
    },
    [showMessage]
  );

  const handleDishDropOnCustomer = useCallback(
    (customerId: number, dishColor: string, dishName: string, dishIndex: number) => {
      const customer = customers.find(item => item.id === customerId);
      if (!customer) return;

      void (async () => {
        await serveDish(customerId, dishColor, dishName, dishIndex);
        showMessage(useGameStore.getState().lastMessage ?? lastMessage ?? `${dishName} served.`);
      })();
    },
    [customers, lastMessage, serveDish, showMessage]
  );

  return {
    handleDishReady,
    handleDishDropOnCustomer,
  };
};
