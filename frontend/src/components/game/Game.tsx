import React, { useState, useCallback, useEffect } from 'react';
import { GameHeader } from './GameHeader';
import { RestaurantArea } from './RestaurantArea';
import { GameMessages } from './GameMessages';
import { VipInvitationModal } from './VipInvitationModal';
import { BalanceSimulatorPanel } from './BalanceSimulatorPanel';
import ProgressionPanel from './ProgressionPanel';
import { useGameStore } from '../../stores/useGameStore';
import { useProgressionStore } from '../../stores/useProgressionStore';
import { useGameMessages } from '../../hooks/useGameMessages';
import { useCustomerSpawning } from '../../hooks/useCustomerSpawning';
import { useVipInvitation } from '../../hooks/useVipInvitation';
import { useDishHandling } from '../../hooks/useDishHandling';
import type { Customer } from '../../types/game';

export const Game: React.FC = () => {
  const { customers, config, initBackendGame, loadError, lastMessage } = useGameStore();
  const maxCustomersBonus = useProgressionStore(state =>
    state.getPurchasedEffect('maxCustomersBonus', 0)
  );
  const [progressionPanelOpen, setProgressionPanelOpen] = useState(false);
  const maxCustomers = config.maxCustomers + Math.floor(maxCustomersBonus);

  useEffect(() => {
    void initBackendGame();
  }, [initBackendGame]);

  // Custom hooks for game logic
  const { messages, showMessage } = useGameMessages();
  const { handleDishReady, handleDishDropOnCustomer } = useDishHandling(showMessage);
  const {
    invitedCustomer,
    showInviteModal,
    handleSpecialInvite,
    handleInviteAccept,
    handleInviteDecline,
  } = useVipInvitation(showMessage);

  // Initialize customer spawning
  useCustomerSpawning(showMessage);

  // Simple drag handlers (can be enhanced later)
  const handleDragStart = useCallback((customer: Customer) => {
    console.log('Dragging customer:', customer.type.name);
  }, []);

  const handleDragEnd = useCallback(() => {
    console.log('Drag ended');
  }, []);

  const handleCustomerDrop = useCallback(
    (customer: Customer) => {
      handleSpecialInvite(customer);
    },
    [handleSpecialInvite]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-200 p-4 font-['Comic_Sans_MS',_cursive,_sans-serif]">
      <GameHeader />

      <RestaurantArea
        customers={customers}
        maxCustomers={maxCustomers}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDishDrop={handleDishDropOnCustomer}
        onSpecialInvite={handleSpecialInvite}
        onDishReady={handleDishReady}
        onCustomerDrop={handleCustomerDrop}
      />

      <GameMessages messages={messages} />
      {(loadError || lastMessage) && (
        <div className="fixed bottom-4 left-4 z-40 max-w-sm rounded-lg bg-white/95 px-4 py-3 text-sm shadow-lg">
          {loadError ?? lastMessage}
        </div>
      )}

      <ProgressionPanel
        isOpen={progressionPanelOpen}
        onToggle={() => setProgressionPanelOpen(!progressionPanelOpen)}
      />

      <VipInvitationModal
        customer={invitedCustomer}
        isOpen={showInviteModal}
        onAccept={handleInviteAccept}
        onDecline={handleInviteDecline}
      />

      <BalanceSimulatorPanel />
    </div>
  );
};
