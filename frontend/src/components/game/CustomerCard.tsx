import React from "react";
import { motion } from "framer-motion";
import { gameBalance } from "../../constants/gameBalance";
import type { Customer } from "../../types/game";

interface CustomerCardProps {
  customer: Customer;
  onDragStart: (customer: Customer) => void;
  onDragEnd: () => void;
  onDishDrop: (customerId: number, dishColor: string, dishName: string) => void;
  onSpecialInvite: (customer: Customer) => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onDragStart,
  onDragEnd,
  onDishDrop,
  onSpecialInvite,
}) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onDragStart(customer);
  };

  const handleMouseUp = () => {
    onDragEnd();
  };

  // Handle dish drop on customer
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dishData = e.dataTransfer.getData("dish");
    if (dishData) {
      const { color, name } = JSON.parse(dishData);
      onDishDrop(customer.id, color, name);
    }
  };

  const totalSatisfaction = Object.values(customer.satisfaction).reduce(
    (sum, val) => sum + val,
    0,
  );
  const totalMax = Object.values(customer.maxSatisfaction).reduce(
    (sum, val) => sum + val,
    0,
  );
  const fillPercentage = Math.min(100, (totalSatisfaction / totalMax) * 100);
  const canBeProcessed =
    customer.deliciousness >= gameBalance.VIP_DELICIOUSNESS_THRESHOLD &&
    totalSatisfaction > gameBalance.VIP_SATISFACTION_THRESHOLD;

  const getCustomerBgColor = () => {
    switch (customer.type.type) {
      case "pig":
        return "bg-pink-100 border-pink-300";
      case "cow":
        return "bg-yellow-100 border-yellow-300";
      case "sheep":
        return "bg-gray-100 border-gray-300";
      case "rabbit":
        return "bg-green-100 border-green-300";
      case "cat":
        return "bg-orange-100 border-orange-300";
      case "deer":
        return "bg-emerald-100 border-emerald-300";
      case "duck":
        return "bg-cyan-100 border-cyan-300";
      case "chicken":
        return "bg-amber-100 border-amber-300";
      case "fish":
        return "bg-blue-100 border-blue-300";
      case "fox":
        return "bg-red-100 border-red-300";
      case "goat":
        return "bg-lime-100 border-lime-300";
      case "bear":
        return "bg-amber-100 border-amber-400";
      case "monkey":
        return "bg-yellow-100 border-yellow-400";
      default:
        return "bg-white border-gray-300";
    }
  };

  const getAvatarBgColor = () => {
    switch (customer.type.type) {
      case "pig":
        return "bg-pink-200";
      case "cow":
        return "bg-yellow-200";
      case "sheep":
        return "bg-gray-200";
      case "rabbit":
        return "bg-green-200";
      case "cat":
        return "bg-orange-200";
      case "deer":
        return "bg-emerald-200";
      case "duck":
        return "bg-cyan-200";
      case "chicken":
        return "bg-amber-200";
      case "fish":
        return "bg-blue-200";
      case "fox":
        return "bg-red-200";
      case "goat":
        return "bg-lime-200";
      case "bear":
        return "bg-amber-300";
      case "monkey":
        return "bg-yellow-200";
      default:
        return "bg-gray-200";
    }
  };

  return (
    <motion.div
      className={`
        relative p-4 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-lg
        ${getCustomerBgColor()}
        ${canBeProcessed ? "ring-2 ring-purple-400 ring-opacity-75 shadow-lg" : ""}
      `}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      drag
      dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }}
      onDragStart={() => onDragStart(customer)}
      onDragEnd={onDragEnd}
    >
      {/* Customer Info */}
      <div className="text-center mb-3">
        <div className="font-bold text-gray-800 text-sm">
          {customer.type.name}
        </div>
        <div className="text-xs text-gray-600 leading-tight">
          {customer.type.description}
        </div>
      </div>

      {/* Customer Avatar */}
      <div className="flex justify-center mb-3">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${getAvatarBgColor()}`}
        >
          😊
        </div>
      </div>

      {/* Satisfaction Meter */}
      <div className="mb-3">
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          {/* Color segments background */}
          <div className="absolute inset-0 flex">
            <div className="flex-1 bg-blue-200"></div>
            <div className="flex-1 bg-green-200"></div>
            <div className="flex-1 bg-yellow-200"></div>
            <div className="flex-1 bg-red-200"></div>
          </div>

          {/* Progress fill */}
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500 rounded-full"
            style={{ width: `${fillPercentage}%` }}
            animate={{ width: `${fillPercentage}%` }}
            transition={{ duration: 0.3 }}
          />

          {/* Overfed indicator */}
          {totalSatisfaction > totalMax && (
            <div className="absolute top-0 right-0 -mt-6 bg-red-500 text-white text-xs px-1 py-0.5 rounded animate-pulse">
              OVERFED!
            </div>
          )}
        </div>
        <div className="text-xs text-gray-600 text-center mt-1">
          Satisfaction
        </div>
      </div>

      {/* Deliciousness Rating */}
      <div className="mb-3">
        <div className="flex justify-center space-x-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-sm ${star <= customer.deliciousness ? "text-yellow-400" : "text-gray-300"}`}
            >
              ⭐
            </span>
          ))}
        </div>
        <div className="text-xs text-gray-600 text-center">Deliciousness</div>
      </div>

      {/* Special Invite Button */}
      {canBeProcessed && (
        <motion.button
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold py-2 px-3 rounded-lg shadow hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
          onClick={() => onSpecialInvite(customer)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="mr-1">✨</span>
          <span>VIP Invite</span>
        </motion.button>
      )}
    </motion.div>
  );
};
