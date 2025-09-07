import React from 'react';
import { motion } from 'framer-motion';
import type { Customer } from '../../types/game';

interface VipInvitationModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const VipInvitationModal: React.FC<VipInvitationModalProps> = ({
  customer,
  isOpen,
  onAccept,
  onDecline
}) => {
  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black bg-opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Modal */}
      <motion.div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 text-center">
          <h2 className="text-2xl font-bold">🌟 VIP Dining Experience 🌟</h2>
        </div>
        
        {/* Body */}
        <div className="p-6">
          {/* Customer Portrait */}
          <div className="text-center mb-6">
            <div className={`
              inline-flex items-center justify-center w-20 h-20 rounded-full text-4xl mb-3
              ${customer.type.type === 'pig' ? 'bg-pink-100' : ''}
              ${customer.type.type === 'cow' ? 'bg-yellow-100' : ''}
              ${customer.type.type === 'sheep' ? 'bg-gray-100' : ''}
              ${customer.type.type === 'rabbit' ? 'bg-green-100' : ''}
              ${customer.type.type === 'cat' ? 'bg-orange-100' : ''}
              ${customer.type.type === 'deer' ? 'bg-emerald-100' : ''}
              ${customer.type.type === 'duck' ? 'bg-cyan-100' : ''}
              ${customer.type.type === 'chicken' ? 'bg-amber-100' : ''}
              ${customer.type.type === 'fish' ? 'bg-blue-100' : ''}
              ${customer.type.type === 'fox' ? 'bg-red-100' : ''}
              ${customer.type.type === 'goat' ? 'bg-lime-100' : ''}
              ${customer.type.type === 'bear' ? 'bg-amber-100' : ''}
              ${customer.type.type === 'monkey' ? 'bg-yellow-100' : ''}
            `}>
              😊
            </div>
            <h3 className="text-xl font-semibold text-gray-800">{customer.type.name}</h3>
          </div>
          
          {/* Invitation Text */}
          <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <p>Dear <span className="font-semibold">{customer.type.name}</span>,</p>
            <p>
              We are delighted to invite you to our exclusive VIP dining experience! 
              You have been selected for your exceptional appetite and refined taste.
            </p>
            <p className="font-medium text-purple-700">
              Would you like to accept this special invitation?
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <motion.button 
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
            onClick={onAccept}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ✨ Accept Invitation
          </motion.button>
          <motion.button 
            className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:bg-gray-600 transition-all duration-200"
            onClick={onDecline}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Maybe Later
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
