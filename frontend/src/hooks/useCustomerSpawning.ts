import { useEffect, useCallback } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { useGuestStore } from '../stores/useGuestStore';
import { useProgressionStore } from '../stores/useProgressionStore';
import { gameBalance } from '../constants/gameBalance';
import { fetchGuestNames, getFallbackGuestName } from '../api/nameGenerator';
import { getCustomerDisplayName, getCustomerFullLabel } from '../utils/customerDisplay';
import type { Customer } from '../types/game';

export const useCustomerSpawning = (showMessage: (message: string) => void) => {
  const { customers, addCustomer, removeCustomer, resetCombo, config, customerTypes } =
    useGameStore();
  const recordCustomerLost = useProgressionStore(state => state.recordCustomerLost);
  const maxCustomersBonus = useProgressionStore(state =>
    state.getPurchasedEffect('maxCustomersBonus', 0)
  );
  const spawnIntervalMultiplier = useProgressionStore(state =>
    state.getPurchasedEffect('spawnIntervalMultiplier', 1)
  );
  const satisfactionDecayMultiplier = useProgressionStore(state =>
    state.getPurchasedEffect('satisfactionDecayMultiplier', 1)
  );
  const maxCustomers = config.maxCustomers + Math.floor(maxCustomersBonus);

  const spawnCustomer = useCallback(async () => {
    const emptyTableIndex = Array(maxCustomers)
      .fill(null)
      .findIndex((_, index) => !customers.some(c => c.tableIndex === index));

    if (emptyTableIndex === -1) return;

    const activeGuestIds = useGameStore.getState().customers.map(customer => customer.guestId);
    const returningGuest =
      Math.random() < 0.65
        ? useGuestStore.getState().getReturningGuest(undefined, activeGuestIds)
        : undefined;
    const randomType =
      customerTypes.find(type => type.type === returningGuest?.customerType) ||
      customerTypes[Math.floor(Math.random() * customerTypes.length)];
    const guest =
      returningGuest ||
      useGuestStore.getState().createGuest(
        await fetchGuestNames(1)
          .then(names => names[0] || getFallbackGuestName())
          .catch(getFallbackGuestName),
        randomType.type
      );

    const currentCustomers = useGameStore.getState().customers;
    const latestEmptyTableIndex = Array(maxCustomers)
      .fill(null)
      .findIndex((_, index) => !currentCustomers.some(c => c.tableIndex === index));

    if (latestEmptyTableIndex === -1) return;

    const feedingCapacityBonus = useProgressionStore.getState().feedingCapacityBonus || 0;
    const baseMaxSatisfaction = gameBalance.MAX_SATISFACTION_PER_TYPE + feedingCapacityBonus;

    // Apply special traits to max satisfaction
    let maxSatisfactionValues: Record<string, number> = {
      blue: baseMaxSatisfaction,
      green: baseMaxSatisfaction,
      yellow: baseMaxSatisfaction,
      red: baseMaxSatisfaction,
    };

    // Deer Girl: Low appetite - reduced max satisfaction
    if (randomType.specialTraits?.lowAppetite) {
      maxSatisfactionValues = {
        blue: Math.floor(baseMaxSatisfaction * 0.7),
        green: Math.floor(baseMaxSatisfaction * 0.7),
        yellow: Math.floor(baseMaxSatisfaction * 0.7),
        red: Math.floor(baseMaxSatisfaction * 0.7),
      };
    }

    // Bear Girl: High appetite - increased max satisfaction
    if (randomType.specialTraits?.highYield) {
      maxSatisfactionValues = {
        blue: Math.floor(baseMaxSatisfaction * 1.5),
        green: Math.floor(baseMaxSatisfaction * 1.5),
        yellow: Math.floor(baseMaxSatisfaction * 1.5),
        red: Math.floor(baseMaxSatisfaction * 1.5),
      };
    }
    const newCustomer: Customer = {
      id: Date.now() + Math.random(), // Better ID generation
      guestId: guest.id,
      displayName: guest.name,
      type: randomType,
      satisfaction: { blue: 0, green: 0, yellow: 0, red: 0 },
      maxSatisfaction: maxSatisfactionValues,
      deliciousness: randomType.baseDeliciousness,
      totalSatisfaction: 0,
      overfed: false,
      isDragging: false,
      tableIndex: latestEmptyTableIndex,
      arrivedAt: Date.now(),
    };

    useGuestStore.getState().recordGuestVisit(guest.id);
    addCustomer(newCustomer);

    // Special arrival messages based on traits
    let arrivalMessage = `${getCustomerFullLabel(newCustomer)} has arrived at table ${latestEmptyTableIndex + 1}!`;

    if (returningGuest) {
      arrivalMessage = `${getCustomerDisplayName(newCustomer)} returned to table ${latestEmptyTableIndex + 1}!`;
    }

    if (randomType.specialTraits?.lowAppetite) {
      arrivalMessage += " 🦌 (She's quite shy and has a small appetite)";
    } else if (randomType.specialTraits?.canWander) {
      arrivalMessage += ' 🦆 (Keep an eye on her - she might wander!)';
    } else if (randomType.specialTraits?.multipliesOnProcess) {
      arrivalMessage += ' 🐔 (Nervous but potentially profitable!)';
    } else if (randomType.specialTraits?.fastSpoilage) {
      arrivalMessage += " 🐟 (Serve her quickly - fish doesn't wait!)";
    } else if (randomType.specialTraits?.canStealFood) {
      arrivalMessage += ' 🦊 (Watch your cooking stations!)';
    } else if (randomType.specialTraits?.canEatWaste) {
      arrivalMessage += " 🐐 (She'll eat anything you give her!)";
    } else if (randomType.specialTraits?.highYield) {
      arrivalMessage += ' 🐻 (Big appetite, big rewards!)';
    } else if (randomType.specialTraits?.throwsFood) {
      arrivalMessage += ' 🐒 (Keep her entertained or chaos will ensue!)';
    }

    showMessage(arrivalMessage);
  }, [customers, maxCustomers, customerTypes, addCustomer, showMessage]);

  useEffect(() => {
    // Much slower initial spawn using game balance constants
    const spawnTimeouts = gameBalance.INITIAL_SPAWN_DELAYS.map(delay =>
      setTimeout(spawnCustomer, delay)
    );

    // Regular spawning after initial customers
    const spawnInterval = setInterval(
      spawnCustomer,
      Math.max(5000, config.customerSpawnTime * spawnIntervalMultiplier)
    );

    return () => {
      spawnTimeouts.forEach(clearTimeout);
      clearInterval(spawnInterval);
    };
  }, [spawnCustomer, config.customerSpawnTime, spawnIntervalMultiplier]);

  useEffect(() => {
    const patienceInterval = setInterval(() => {
      const patienceMultiplier = useProgressionStore
        .getState()
        .getPurchasedEffect('patienceMultiplier', 1);
      const patienceTime = gameBalance.CUSTOMER_PATIENCE_TIME * patienceMultiplier;
      const now = Date.now();

      useGameStore.getState().customers.forEach(customer => {
        const arrivedAt = customer.arrivedAt ?? now;
        const traitPatienceTime = customer.type.specialTraits?.fastSpoilage
          ? patienceTime * 0.55
          : patienceTime;
        if (now - arrivedAt > traitPatienceTime) {
          removeCustomer(customer.id);
          resetCombo();
          recordCustomerLost();
          showMessage(`${getCustomerDisplayName(customer)} left after waiting too long.`);
        }
      });
    }, 1000);

    return () => clearInterval(patienceInterval);
  }, [recordCustomerLost, removeCustomer, resetCombo, showMessage]);

  useEffect(() => {
    const decayInterval = setInterval(() => {
      const state = useGameStore.getState();
      const decayAmount = state.config.satisfactionDecayRate * satisfactionDecayMultiplier;

      state.customers.forEach(customer => {
        if (customer.totalSatisfaction <= 0) return;

        const nextSatisfaction = Object.fromEntries(
          Object.entries(customer.satisfaction).map(([color, amount]) => [
            color,
            Math.max(0, amount - decayAmount),
          ])
        );
        const nextTotal = Object.values(nextSatisfaction).reduce((sum, amount) => sum + amount, 0);
        const maxTotal = Object.values(customer.maxSatisfaction).reduce(
          (sum, amount) => sum + amount,
          0
        );

        state.updateCustomer(customer.id, {
          satisfaction: nextSatisfaction,
          totalSatisfaction: nextTotal,
          overfed: nextTotal > maxTotal,
        });
      });
    }, gameBalance.SATISFACTION_DECAY_INTERVAL);

    return () => clearInterval(decayInterval);
  }, [satisfactionDecayMultiplier]);

  useEffect(() => {
    const traitInterval = setInterval(() => {
      const state = useGameStore.getState();
      const customersSnapshot = state.customers;
      const dishesReady = state.dishesReady;
      const occupiedTables = new Set(customersSnapshot.map(customer => customer.tableIndex));

      customersSnapshot.forEach(customer => {
        if (customer.type.specialTraits?.canWander && Math.random() < 0.25) {
          const tableCount =
            state.config.maxCustomers +
            Math.floor(useProgressionStore.getState().getPurchasedEffect('maxCustomersBonus', 0));
          const emptyTables = Array.from({ length: tableCount }, (_, index) => index).filter(
            index => !occupiedTables.has(index)
          );

          if (emptyTables.length > 0) {
            const nextTable = emptyTables[Math.floor(Math.random() * emptyTables.length)];
            state.updateCustomer(customer.id, { tableIndex: nextTable });
            occupiedTables.delete(customer.tableIndex);
            occupiedTables.add(nextTable);
            showMessage(`${getCustomerDisplayName(customer)} wandered to table ${nextTable + 1}.`);
          }
        }

        if (customer.type.specialTraits?.canStealFood && Math.random() < 0.35) {
          const stationWithFood = Object.entries(dishesReady).find(
            ([, dishes]) => dishes.length > 0
          );
          if (stationWithFood) {
            const [stationColor, dishes] = stationWithFood;
            state.removeDish(stationColor, 0);
            showMessage(
              `${getCustomerDisplayName(customer)} snatched ${dishes[0]} from the kitchen.`
            );
          }
        }

        if (customer.type.specialTraits?.throwsFood && customer.totalSatisfaction < 60) {
          const stationWithFood = Object.entries(dishesReady).find(
            ([, dishes]) => dishes.length > 0
          );
          if (stationWithFood && Math.random() < 0.3) {
            const [stationColor, dishes] = stationWithFood;
            state.removeDish(stationColor, 0);
            state.resetCombo();
            showMessage(
              `${getCustomerDisplayName(customer)} caused a mess and knocked away ${dishes[0]}.`
            );
          }
        }

        if (customer.type.specialTraits?.fastSpoilage && customer.totalSatisfaction > 0) {
          const nextSatisfaction = Object.fromEntries(
            Object.entries(customer.satisfaction).map(([color, amount]) => [
              color,
              Math.max(0, amount - 2),
            ])
          );
          const nextTotal = Object.values(nextSatisfaction).reduce(
            (sum, amount) => sum + amount,
            0
          );
          state.updateCustomer(customer.id, {
            satisfaction: nextSatisfaction,
            totalSatisfaction: nextTotal,
          });
        }
      });
    }, gameBalance.TRAIT_TICK_INTERVAL);

    return () => clearInterval(traitInterval);
  }, [showMessage]);

  return { spawnCustomer };
};
