import { useState, useCallback } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { useGuestStore } from '../stores/useGuestStore';
import { useProgressionStore } from '../stores/useProgressionStore';
import { gameBalance } from '../constants/gameBalance';
import { getCustomerDisplayName } from '../utils/customerDisplay';
import type { Customer } from '../types/game';

export const useVipInvitation = (showMessage: (message: string) => void) => {
  const [invitedCustomer, setInvitedCustomer] = useState<Customer | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const {
    removeCustomer,
    addCombo,
    addScore,
    addToChain,
    updateIngredients,
    setSpecialTableBusy,
    specialTableBusy,
    chain,
    canProcessCustomer,
    config,
  } = useGameStore();
  const { addCurrency, recordProcessedCustomer, getPurchasedEffect } = useProgressionStore();

  const handleSpecialInvite = useCallback(
    (customer: Customer) => {
      if (specialTableBusy) {
        showMessage('The VIP dining room is already busy.');
        return;
      }

      if (!canProcessCustomer(customer)) {
        showMessage(
          `${getCustomerDisplayName(customer)} is not ready for the VIP dining experience yet.`
        );
        return;
      }

      setInvitedCustomer(customer);
      setShowInviteModal(true);
      showMessage(
        `${getCustomerDisplayName(customer)} has been invited to our VIP dining experience! ✨`
      );
    },
    [canProcessCustomer, showMessage, specialTableBusy]
  );

  const handleInviteAccept = useCallback(() => {
    if (!invitedCustomer) return;

    // 85% chance of accepting (most customers are eager)
    const willAccept = Math.random() < 0.85;

    if (willAccept) {
      const totalSatisfaction = Object.values(invitedCustomer.satisfaction).reduce(
        (sum, val) => sum + val,
        0
      );
      const yieldMultiplier = getPurchasedEffect('meatYieldMultiplier', 1);
      const traitYieldMultiplier = invitedCustomer.type.specialTraits?.highYield ? 1.35 : 1;
      const bonusMeat = invitedCustomer.type.specialTraits?.multipliesOnProcess ? 2 : 0;
      const meatGained = Math.max(
        1,
        Math.floor(
          (Math.floor(totalSatisfaction / 20) + Math.floor(invitedCustomer.deliciousness)) *
            yieldMultiplier *
            traitYieldMultiplier
        ) + bonusMeat
      );
      const meatType = `${invitedCustomer.type.type}-meat`;
      const nextChain = chain + 1;

      setSpecialTableBusy(true);
      useGuestStore.getState().recordGuestProcessed(invitedCustomer.guestId);
      removeCustomer(invitedCustomer.id);
      addCombo();
      addToChain(invitedCustomer.id);
      updateIngredients({
        [meatType]: (useGameStore.getState().ingredients[meatType] || 0) + meatGained,
      });

      const points =
        gameBalance.VIP_POINTS_PER_DELICIOUSNESS * invitedCustomer.deliciousness + meatGained * 10;
      addScore(points);
      addCurrency(Math.floor(points / 5));
      recordProcessedCustomer(invitedCustomer.type.type, nextChain);
      showMessage(
        `${getCustomerDisplayName(invitedCustomer)} accepted the VIP invitation! Gained ${meatGained} ${meatType} and ${points} points!`
      );

      if (invitedCustomer.type.specialTraits?.multipliesOnProcess) {
        showMessage(
          `${getCustomerDisplayName(invitedCustomer)}'s trait produced extra ingredients.`
        );
      }

      setTimeout(() => {
        setSpecialTableBusy(false);
      }, config.specialTableProcessTime);
    } else {
      showMessage(
        `${getCustomerDisplayName(invitedCustomer)} got nervous and changed their mind. Try again later!`
      );
    }

    setShowInviteModal(false);
    setInvitedCustomer(null);
  }, [
    invitedCustomer,
    getPurchasedEffect,
    chain,
    config.specialTableProcessTime,
    setSpecialTableBusy,
    removeCustomer,
    addCombo,
    addToChain,
    updateIngredients,
    addScore,
    addCurrency,
    recordProcessedCustomer,
    showMessage,
  ]);

  const handleInviteDecline = useCallback(() => {
    if (!invitedCustomer) return;

    showMessage(
      `${getCustomerDisplayName(invitedCustomer)} politely declined the invitation. Maybe next time!`
    );
    setShowInviteModal(false);
    setInvitedCustomer(null);
  }, [invitedCustomer, showMessage]);

  return {
    invitedCustomer,
    showInviteModal,
    handleSpecialInvite,
    handleInviteAccept,
    handleInviteDecline,
  };
};
