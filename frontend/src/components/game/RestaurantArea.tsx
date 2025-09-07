import React from 'react';
import { CustomerTables } from './CustomerTables';
import { CookingStations } from './CookingStations';
import { SpecialTable } from './SpecialTable';
import type { Customer } from '../../types/game';

interface RestaurantAreaProps {
  customers: Customer[];
  maxCustomers: number;
  onDragStart: (customer: Customer) => void;
  onDragEnd: () => void;
  onDishDrop: (customerId: number, dishColor: string, dishName: string) => void;
  onSpecialInvite: (customer: Customer) => void;
  onDishReady: (dishName: string) => void;
  onCustomerDrop: (customer: Customer) => void;
}

export const RestaurantArea: React.FC<RestaurantAreaProps> = ({
  customers,
  maxCustomers,
  onDragStart,
  onDragEnd,
  onDishDrop,
  onSpecialInvite,
  onDishReady,
  onCustomerDrop
}) => {
  return (
    <div className="space-y-6">
      {/* Customer Tables Section */}
      <CustomerTables
        customers={customers}
        maxCustomers={maxCustomers}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDishDrop={onDishDrop}
        onSpecialInvite={onSpecialInvite}
      />

      {/* Cooking Stations Section */}
      <CookingStations onDishReady={onDishReady} />

      {/* Special Table Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          🔪 Special Table
        </h3>
        <SpecialTable onDrop={onCustomerDrop} />
      </div>
    </div>
  );
};
