import { useCallback, useEffect } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { useProgressionStore } from '../stores/useProgressionStore';
import { gameBalance } from '../constants/gameBalance';

export const useCustomerSpawning = (showMessage: (message: string) => void) => {
  const customers = useGameStore(state => state.customers);
  const config = useGameStore(state => state.config);
  const spawnCustomerIntent = useGameStore(state => state.spawnCustomer);
  const customerLeft = useGameStore(state => state.customerLeft);
  const satisfactionDecayTick = useGameStore(state => state.satisfactionDecayTick);
  const traitTick = useGameStore(state => state.traitTick);
  const lastMessage = useGameStore(state => state.lastMessage);
  const maxCustomersBonus = useProgressionStore(state =>
    state.getPurchasedEffect('maxCustomersBonus', 0)
  );
  const spawnIntervalMultiplier = useProgressionStore(state =>
    state.getPurchasedEffect('spawnIntervalMultiplier', 1)
  );
  const maxCustomers = config.maxCustomers + Math.floor(maxCustomersBonus);

  const spawnCustomer = useCallback(async () => {
    if (customers.length >= maxCustomers) {
      return;
    }

    await spawnCustomerIntent();
  }, [customers.length, maxCustomers, spawnCustomerIntent]);

  useEffect(() => {
    if (lastMessage) {
      showMessage(lastMessage);
    }
  }, [lastMessage, showMessage]);

  useEffect(() => {
    const spawnTimeouts = gameBalance.INITIAL_SPAWN_DELAYS.map(delay =>
      setTimeout(() => {
        void spawnCustomer();
      }, delay)
    );
    const spawnInterval = setInterval(
      () => {
        void spawnCustomer();
      },
      Math.max(5000, config.customerSpawnTime * spawnIntervalMultiplier)
    );

    return () => {
      spawnTimeouts.forEach(clearTimeout);
      clearInterval(spawnInterval);
    };
  }, [spawnCustomer, config.customerSpawnTime, spawnIntervalMultiplier]);

  useEffect(() => {
    const patienceInterval = setInterval(() => {
      const now = Date.now();
      const patienceMultiplier = useProgressionStore
        .getState()
        .getPurchasedEffect('patienceMultiplier', 1);
      const patienceTime = gameBalance.CUSTOMER_PATIENCE_TIME * patienceMultiplier;

      useGameStore.getState().customers.forEach(customer => {
        const arrivedAt = customer.arrivedAt ?? now;
        const traitPatienceTime = customer.type.specialTraits?.fastSpoilage
          ? patienceTime * 0.55
          : patienceTime;
        if (now - arrivedAt > traitPatienceTime) {
          void customerLeft(customer.id);
        }
      });
    }, 1000);

    return () => clearInterval(patienceInterval);
  }, [customerLeft]);

  useEffect(() => {
    const decayInterval = setInterval(() => {
      void satisfactionDecayTick();
    }, gameBalance.SATISFACTION_DECAY_INTERVAL);

    return () => clearInterval(decayInterval);
  }, [satisfactionDecayTick]);

  useEffect(() => {
    const traitInterval = setInterval(() => {
      void traitTick();
    }, gameBalance.TRAIT_TICK_INTERVAL);

    return () => clearInterval(traitInterval);
  }, [traitTick]);

  return { spawnCustomer };
};
