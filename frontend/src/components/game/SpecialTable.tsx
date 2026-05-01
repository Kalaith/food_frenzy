import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Customer } from '../../types/game';
import { useGameStore } from '../../stores/useGameStore';

interface SpecialTableProps {
  onDrop: (customer: Customer) => void;
}

export const SpecialTable: React.FC<SpecialTableProps> = ({ onDrop }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { specialTableBusy } = useGameStore();

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

    onDrop(customer);
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
        {specialTableBusy
          ? 'VIP Experience in Progress...'
          : 'Exclusive dining for our finest guests'}
      </div>

      <div className="processing-area">
        {specialTableBusy && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            Preparing the exclusive dining experience...
            <div className="processing-animation">🍽️✨</div>
          </motion.div>
        )}
      </div>

      {isHovered && !specialTableBusy && (
        <motion.div className="drop-indicator" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Drop here to process!
        </motion.div>
      )}
    </motion.div>
  );
};
