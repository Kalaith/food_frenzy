import React from 'react';
import { CookingStation } from './CookingStation';
import type { DishType } from '../../types/game';

interface CookingStationsProps {
  onDishReady: (dishName: string) => void;
}

export const CookingStations: React.FC<CookingStationsProps> = ({ onDishReady }) => {
  const dishTypes: DishType[] = [
    {
      color: "blue",
      name: "Appetizers",
      cookTime: 3000,
      examples: ["Spring Rolls", "Cheese Bites", "Mini Salads"]
    },
    {
      color: "green",
      name: "Soups",
      cookTime: 5000,
      examples: ["Vegetable Soup", "Bone Broth", "Mushroom Bisque"]
    },
    {
      color: "yellow",
      name: "Main Courses",
      cookTime: 7000,
      examples: ["Grilled Steaks", "Roasted Chicken", "Pasta Dishes"]
    },
    {
      color: "red",
      name: "Desserts",
      cookTime: 4000,
      examples: ["Chocolate Cake", "Ice Cream", "Fruit Tarts"]
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        👨‍🍳 Cooking Stations
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dishTypes.map((dishType) => (
          <CookingStation
            key={dishType.color}
            color={dishType.color}
            dishType={dishType}
            onDishReady={onDishReady}
          />
        ))}
      </div>
    </div>
  );
};
