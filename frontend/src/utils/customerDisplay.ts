import type { Customer } from '../types/game';

export const getCustomerDisplayName = (customer: Customer) =>
  customer.displayName || customer.type.name;

export const getCustomerFullLabel = (customer: Customer) =>
  `${getCustomerDisplayName(customer)} the ${customer.type.name}`;
