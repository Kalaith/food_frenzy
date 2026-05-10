import { useCallback, useState } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { getCustomerDisplayName } from '../utils/customerDisplay';
import type { Customer } from '../types/game';

export const useVipInvitation = (showMessage: (message: string) => void) => {
  const [invitedCustomer, setInvitedCustomer] = useState<Customer | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const specialTableBusy = useGameStore(state => state.specialTableBusy);
  const canProcessCustomer = useGameStore(state => state.canProcessCustomer);
  const processCustomer = useGameStore(state => state.processCustomer);
  const setSpecialTableBusy = useGameStore(state => state.setSpecialTableBusy);
  const config = useGameStore(state => state.config);

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
      showMessage(`${getCustomerDisplayName(customer)} has been invited to our VIP dining experience.`);
    },
    [canProcessCustomer, showMessage, specialTableBusy]
  );

  const handleInviteAccept = useCallback(() => {
    if (!invitedCustomer) return;

    void (async () => {
      setSpecialTableBusy(true);
      const accepted = await processCustomer(invitedCustomer.id);
      showMessage(
        useGameStore.getState().lastMessage ??
          (accepted
            ? `${getCustomerDisplayName(invitedCustomer)} accepted the VIP invitation.`
            : `${getCustomerDisplayName(invitedCustomer)} is not ready yet.`)
      );
      setTimeout(() => {
        setSpecialTableBusy(false);
      }, config.specialTableProcessTime);
    })();

    setShowInviteModal(false);
    setInvitedCustomer(null);
  }, [config.specialTableProcessTime, invitedCustomer, processCustomer, setSpecialTableBusy, showMessage]);

  const handleInviteDecline = useCallback(() => {
    if (!invitedCustomer) return;

    showMessage(`${getCustomerDisplayName(invitedCustomer)} politely declined the invitation.`);
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
