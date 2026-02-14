import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/useGameStore';
import type { DishType } from '../../types/game';

interface CookingStationProps {
  color: string;
  dishType: DishType;
  onDishReady: (color: string, dishName: string) => void;
}

export const CookingStation: React.FC<CookingStationProps> = ({ color, dishType, onDishReady }) => {
  const { addDish, removeDish: removeFromStore, getDishesForStation } = useGameStore();
  const [isCooking, setIsCooking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const dishes = getDishesForStation(color);

  const startCooking = () => {
    if (isCooking) return;

    setIsCooking(true);
    setTimeLeft(dishType.cookTime / 1000);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishCooking();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finishCooking = () => {
    setIsCooking(false);
    const randomDish = dishType.examples[Math.floor(Math.random() * dishType.examples.length)];
    addDish(color, randomDish);
    onDishReady(color, randomDish);
  };

  const handleRemoveDish = (index: number) => {
    removeFromStore(color, index);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className={`cooking-station ${color}-station ${isCooking ? 'cooking' : ''}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="station-header">
        <h4>{dishType.name}</h4>
        <div className="cook-timer">{isCooking ? formatTime(timeLeft) : ''}</div>
      </div>

      <div className="station-status">{isCooking ? 'Cooking...' : 'Ready'}</div>

      <div className="dishes-ready">
        {dishes.map((dish, index) => (
          <div
            key={`${dish}-${index}`}
            className={`dish ${color}`}
            draggable
            onDragStart={(e: React.DragEvent) => {
              e.dataTransfer.setData('dish', JSON.stringify({ color, name: dish, index }));
            }}
            onDragEnd={() => {
              // Remove dish after successful drag
              handleRemoveDish(index);
            }}
            onDoubleClick={() => handleRemoveDish(index)}
            title={`Drag ${dish} to a customer`}
            style={{ cursor: 'grab' }}
          >
            {dish}
          </div>
        ))}
      </div>

      {!isCooking && (
        <button className="cook-button" onClick={startCooking}>
          Cook {dishType.name}
        </button>
      )}
    </motion.div>
  );
};
