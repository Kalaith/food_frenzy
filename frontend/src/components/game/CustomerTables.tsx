import React from 'react';
import { CustomerCard } from './CustomerCard';
import type { Customer } from '../../types/game';

interface CustomerTablesProps {
  customers: Customer[];
  maxCustomers: number;
  onDragStart: (customer: Customer) => void;
  onDragEnd: () => void;
  onDishDrop: (customerId: number, dishColor: string, dishName: string) => void;
  onSpecialInvite: (customer: Customer) => void;
}

export const CustomerTables: React.FC<CustomerTablesProps> = ({
  customers,
  maxCustomers,
  onDragStart,
  onDragEnd,
  onDishDrop,
  onSpecialInvite,
}) => {
  const customerTables = Array(maxCustomers).fill(null);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">🍽️ Customer Tables</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {customerTables.map((_, index) => {
          const customer = customers.find(c => c.tableIndex === index);
          return (
            <div
              key={index}
              className={`
                relative min-h-[200px] rounded-lg border-2 border-dashed p-4 transition-all duration-300
                ${
                  customer
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                }
              `}
            >
              {customer ? (
                <CustomerCard
                  customer={customer}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onDishDrop={onDishDrop}
                  onSpecialInvite={onSpecialInvite}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-center">
                  <div>
                    <div className="text-3xl mb-2">🪑</div>
                    <div className="text-sm font-medium">Waiting for customer...</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
