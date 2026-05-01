import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameMessagesProps {
  messages: string[];
}

export const GameMessages: React.FC<GameMessagesProps> = ({ messages }) => {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setShowWelcome(false);
    }, 8000);

    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-50 space-y-2 max-w-md">
      {/* Welcome Message */}
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg"
        >
          <div className="text-blue-800 text-sm leading-relaxed">
            Welcome to Feast Frenzy! Cook delicious dishes and serve them to customers. When
            customers are satisfied and well-fed, they may receive an exclusive VIP dining
            invitation! ✨
          </div>
        </motion.div>
      )}

      {/* Dynamic Messages */}
      <AnimatePresence>
        {messages.map((message, index) => (
          <motion.div
            key={`${message}-${index}`}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-green-50 border border-green-200 rounded-lg p-3 shadow-lg"
          >
            <div className="text-green-800 text-sm font-medium">{message}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
