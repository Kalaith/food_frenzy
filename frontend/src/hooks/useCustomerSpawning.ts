import { useEffect, useCallback } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { gameBalance } from '../constants/gameBalance';
import type { Customer } from '../types/game';

export const useCustomerSpawning = (showMessage: (message: string) => void) => {
  const { customers, addCustomer, config, customerTypes } = useGameStore();

  const spawnCustomer = useCallback(() => {
    const emptyTableIndex = Array(config.maxCustomers)
      .fill(null)
      .findIndex((_, index) => !customers.some(c => c.tableIndex === index));

    if (emptyTableIndex === -1) return;

    const randomType = customerTypes[Math.floor(Math.random() * customerTypes.length)];
    
    // Apply special traits to max satisfaction
    let maxSatisfactionValues: Record<string, number> = {
      blue: gameBalance.MAX_SATISFACTION_PER_TYPE, 
      green: gameBalance.MAX_SATISFACTION_PER_TYPE, 
      yellow: gameBalance.MAX_SATISFACTION_PER_TYPE, 
      red: gameBalance.MAX_SATISFACTION_PER_TYPE
    };

    // Deer Girl: Low appetite - reduced max satisfaction
    if (randomType.specialTraits?.lowAppetite) {
      maxSatisfactionValues = {
        blue: Math.floor(gameBalance.MAX_SATISFACTION_PER_TYPE * 0.7),
        green: Math.floor(gameBalance.MAX_SATISFACTION_PER_TYPE * 0.7),
        yellow: Math.floor(gameBalance.MAX_SATISFACTION_PER_TYPE * 0.7),
        red: Math.floor(gameBalance.MAX_SATISFACTION_PER_TYPE * 0.7)
      };
    }

    // Bear Girl: High appetite - increased max satisfaction
    if (randomType.specialTraits?.highYield) {
      maxSatisfactionValues = {
        blue: Math.floor(gameBalance.MAX_SATISFACTION_PER_TYPE * 1.5),
        green: Math.floor(gameBalance.MAX_SATISFACTION_PER_TYPE * 1.5),
        yellow: Math.floor(gameBalance.MAX_SATISFACTION_PER_TYPE * 1.5),
        red: Math.floor(gameBalance.MAX_SATISFACTION_PER_TYPE * 1.5)
      };
    }
    const newCustomer: Customer = {
      id: Date.now() + Math.random(), // Better ID generation
      type: randomType,
      satisfaction: { blue: 0, green: 0, yellow: 0, red: 0 },
      maxSatisfaction: maxSatisfactionValues,
      deliciousness: randomType.baseDeliciousness,
      totalSatisfaction: 0,
      overfed: false,
      isDragging: false,
      tableIndex: emptyTableIndex
    };

    addCustomer(newCustomer);
    
    // Special arrival messages based on traits
    let arrivalMessage = `${newCustomer.type.name} has arrived at table ${emptyTableIndex + 1}!`;
    
    if (randomType.specialTraits?.lowAppetite) {
      arrivalMessage += " 🦌 (She's quite shy and has a small appetite)";
    } else if (randomType.specialTraits?.canWander) {
      arrivalMessage += " 🦆 (Keep an eye on her - she might wander!)";
    } else if (randomType.specialTraits?.multipliesOnProcess) {
      arrivalMessage += " 🐔 (Nervous but potentially profitable!)";
    } else if (randomType.specialTraits?.fastSpoilage) {
      arrivalMessage += " 🐟 (Serve her quickly - fish doesn't wait!)";
    } else if (randomType.specialTraits?.canStealFood) {
      arrivalMessage += " 🦊 (Watch your cooking stations!)";
    } else if (randomType.specialTraits?.canEatWaste) {
      arrivalMessage += " 🐐 (She'll eat anything you give her!)";
    } else if (randomType.specialTraits?.highYield) {
      arrivalMessage += " 🐻 (Big appetite, big rewards!)";
    } else if (randomType.specialTraits?.throwsFood) {
      arrivalMessage += " 🐒 (Keep her entertained or chaos will ensue!)";
    }
    
    showMessage(arrivalMessage);
  }, [customers, config, customerTypes, addCustomer, showMessage]);

  useEffect(() => {
    // Much slower initial spawn using game balance constants
    const spawnTimeouts = gameBalance.INITIAL_SPAWN_DELAYS.map((delay) =>
      setTimeout(spawnCustomer, delay)
    );

    // Regular spawning after initial customers
    const spawnInterval = setInterval(spawnCustomer, config.customerSpawnTime);

    return () => {
      spawnTimeouts.forEach(clearTimeout);
      clearInterval(spawnInterval);
    };
  }, [spawnCustomer, config.customerSpawnTime]);

  return { spawnCustomer };
};
