import React from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../../stores/useGameStore";
import { useProgressionStore } from "../../stores/useProgressionStore";

export const GameHeader: React.FC = () => {
  const { score, combo, chain, ingredients } = useGameStore();
  const { currency } = useProgressionStore();

  return (
    <motion.div
      className="flex justify-between items-start mb-6 p-6 bg-white rounded-xl shadow-lg"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Score Panel */}
      <div className="flex gap-8">
        <motion.div className="text-center" whileHover={{ scale: 1.05 }}>
          <span className="block text-sm font-bold text-gray-600 mb-1">
            Score:
          </span>
          <motion.span
            key={score}
            initial={{ scale: 1.2, color: "#fbbf24" }}
            animate={{ scale: 1, color: "inherit" }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold text-gray-800"
          >
            {score.toLocaleString()}
          </motion.span>
        </motion.div>

        <motion.div className="text-center" whileHover={{ scale: 1.05 }}>
          <span className="block text-sm font-bold text-gray-600 mb-1">
            Combo:
          </span>
          <motion.span
            key={combo}
            initial={{
              scale: combo > 0 ? 1.2 : 1,
              color: combo > 0 ? "#ef4444" : "inherit",
            }}
            animate={{ scale: 1, color: "inherit" }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold text-gray-800"
          >
            {combo}
          </motion.span>
        </motion.div>

        <motion.div className="text-center" whileHover={{ scale: 1.05 }}>
          <span className="block text-sm font-bold text-gray-600 mb-1">
            Chain:
          </span>
          <motion.span
            key={chain}
            initial={{
              scale: chain > 0 ? 1.2 : 1,
              color: chain > 0 ? "#8b5cf6" : "inherit",
            }}
            animate={{ scale: 1, color: "inherit" }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold text-gray-800"
          >
            {chain}
          </motion.span>
        </motion.div>

        <motion.div className="text-center" whileHover={{ scale: 1.05 }}>
          <span className="block text-sm font-bold text-gray-600 mb-1">
            Currency:
          </span>
          <motion.span
            key={currency}
            initial={{ scale: 1.1, color: "#10b981" }}
            animate={{ scale: 1, color: "inherit" }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold text-gray-800"
          >
            {currency.toLocaleString()}
          </motion.span>
        </motion.div>
      </div>

      {/* Ingredient Inventory */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-lg font-bold text-gray-800 mb-3">Ingredients</h4>
        <div className="space-y-2">
          {Object.entries(ingredients).map(([type, count]) => (
            <motion.div
              key={type}
              className="flex justify-between items-center bg-white px-3 py-2 rounded-md shadow-sm"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-sm font-medium text-gray-700">
                {type === "regular"
                  ? "Regular Meat"
                  : type
                      .replace("-", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
              <span className="text-sm font-bold text-gray-900">
                {count === Infinity ? "∞" : count}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
