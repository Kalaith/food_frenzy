import React from 'react';
import { CookingStation } from './CookingStation';
import { dishTypes } from '../../constants/gameData';

interface CookingStationsProps {
  onDishReady: (dishName: string) => void;
}

export const CookingStations: React.FC<CookingStationsProps> = ({ onDishReady }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        👨‍🍳 Cooking Stations
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dishTypes.map(dishType => (
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
