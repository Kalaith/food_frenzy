import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Customer } from '../../types/game';
import { useGameStore } from '../../stores/useGameStore';
import { useProgressionStore } from '../../stores/useProgressionStore';

interface SpecialTableProps {
  onDrop: (customer: Customer) => void;
}

export const SpecialTable: React.FC<SpecialTableProps> = ({ onDrop }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [processingCustomer, setProcessingCustomer] = useState<Customer | null>(null);
  const { specialTableBusy, setSpecialTableBusy, updateIngredients, addScore, addToChain } = useGameStore();
  const { addCurrency } = useProgressionStore();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(true);
  };

  const handleDragLeave = () => {
    setIsHovered(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(false);

    const customerData = e.dataTransfer.getData('customer');
    if (!customerData) return;

    const customer: Customer = JSON.parse(customerData);

    if (specialTableBusy) {
      // Show message that table is busy
      return;
    }

    // Process the customer
    processCustomer(customer);
    onDrop(customer);
  };

  const processCustomer = (customer: Customer) => {
    setSpecialTableBusy(true);
    setProcessingCustomer(customer);

    // Calculate meat yield
    const totalSatisfaction = Object.values(customer.satisfaction).reduce((sum, val) => sum + val, 0);
    const meatGained = Math.floor(totalSatisfaction / 15) + Math.floor(customer.deliciousness);
    const meatType = `${customer.type.type}-meat`;

    // Add to chain
    addToChain(customer.id);

    setTimeout(() => {
      // Update ingredients
      updateIngredients({ [meatType]: (useGameStore.getState().ingredients[meatType] || 0) + meatGained });

      // Calculate score
      const scoreGained = meatGained * 10 * customer.deliciousness;
      addScore(scoreGained);

      // Add progression currency
      addCurrency(Math.floor(scoreGained / 5));

      // Reset table
      setSpecialTableBusy(false);
      setProcessingCustomer(null);
    }, 3000);
  };

  return (
    <motion.div
      className={`special-table ${specialTableBusy ? 'processing' : ''} ${isHovered ? 'hovered' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      whileHover={{ scale: 1.05 }}
      animate={{ scale: isHovered ? 1.1 : 1 }}
    >
      <h3>🏛️ VIP Dining Room</h3>

      <div className="special-status">
        {specialTableBusy ? 'VIP Experience in Progress...' : 'Exclusive dining for our finest guests'}
      </div>

      <div className="processing-area">
        {processingCustomer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            Preparing exclusive dining experience for {processingCustomer.type.name}...
            <div className="processing-animation">🍽️✨</div>
          </motion.div>
        )}
      </div>

      {isHovered && !specialTableBusy && (
        <motion.div
          className="drop-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Drop here to process!
        </motion.div>
      )}
    </motion.div>
  );
};
