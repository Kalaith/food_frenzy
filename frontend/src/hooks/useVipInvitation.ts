import { useState, useCallback } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { gameBalance } from '../constants/gameBalance';
import type { Customer } from '../types/game';

export const useVipInvitation = (showMessage: (message: string) => void) => {
  const [invitedCustomer, setInvitedCustomer] = useState<Customer | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  const { removeCustomer, addCombo, addScore } = useGameStore();

  const handleSpecialInvite = useCallback((customer: Customer) => {
    setInvitedCustomer(customer);
    setShowInviteModal(true);
    showMessage(`${customer.type.name} has been invited to our VIP dining experience! ✨`);
  }, [showMessage]);

  const handleInviteAccept = useCallback(() => {
    if (!invitedCustomer) return;
    
    // 85% chance of accepting (most customers are eager)
    const willAccept = Math.random() < 0.85;
    
    if (willAccept) {
      removeCustomer(invitedCustomer.id);
      addCombo();
      const points = gameBalance.VIP_POINTS_PER_DELICIOUSNESS * invitedCustomer.deliciousness;
      addScore(points);
      showMessage(`${invitedCustomer.type.name} accepted the VIP invitation! Gained ${points} points!`);
    } else {
      showMessage(`${invitedCustomer.type.name} got nervous and changed their mind. Try again later!`);
    }
    
    setShowInviteModal(false);
    setInvitedCustomer(null);
  }, [invitedCustomer, removeCustomer, addCombo, addScore, showMessage]);

  const handleInviteDecline = useCallback(() => {
    if (!invitedCustomer) return;
    
    showMessage(`${invitedCustomer.type.name} politely declined the invitation. Maybe next time!`);
    setShowInviteModal(false);
    setInvitedCustomer(null);
  }, [invitedCustomer, showMessage]);

  return {
    invitedCustomer,
    showInviteModal,
    handleSpecialInvite,
    handleInviteAccept,
    handleInviteDecline
  };
};
