import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CustomerCard } from './CustomerCard';
import type { Customer } from '../../types/game';

const customer: Customer = {
  id: 123,
  guestId: 'pig-emily',
  displayName: 'Emily',
  type: {
    type: 'pig',
    name: 'Pig Girl',
    preferredDishes: ['blue'],
    baseDeliciousness: 3,
    description: 'Test customer',
  },
  satisfaction: { blue: 0, green: 0, yellow: 0, red: 0 },
  maxSatisfaction: { blue: 40, green: 40, yellow: 40, red: 40 },
  deliciousness: 3,
  totalSatisfaction: 0,
  overfed: false,
  isDragging: false,
  tableIndex: 0,
};

describe('CustomerCard', () => {
  it('writes customer data for native drag/drop', () => {
    const setData = vi.fn();

    render(
      <CustomerCard
        customer={customer}
        onDragStart={vi.fn()}
        onDragEnd={vi.fn()}
        onDishDrop={vi.fn()}
        onSpecialInvite={vi.fn()}
      />
    );

    fireEvent.dragStart(screen.getByText('Pig Girl').closest('[draggable="true"]')!, {
      dataTransfer: {
        effectAllowed: '',
        setData,
      },
    });

    expect(setData).toHaveBeenCalledWith('customer', JSON.stringify(customer));
  });
});
