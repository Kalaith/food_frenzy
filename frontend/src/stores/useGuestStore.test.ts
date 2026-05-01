import { beforeEach, describe, expect, it } from 'vitest';
import { useGuestStore } from './useGuestStore';

describe('guest store', () => {
  beforeEach(() => {
    localStorage.clear();
    useGuestStore.getState().resetGuests();
  });

  it('returns fed guests for future visits', () => {
    const guest = useGuestStore.getState().createGuest('Emily', 'cat');

    expect(useGuestStore.getState().getReturningGuest()).toBeUndefined();

    useGuestStore.getState().recordGuestFed(guest.id);

    expect(useGuestStore.getState().getReturningGuest()?.name).toBe('Emily');
  });

  it('does not return an excluded active guest', () => {
    const guest = useGuestStore.getState().createGuest('Emily', 'cat');
    useGuestStore.getState().recordGuestFed(guest.id);

    expect(useGuestStore.getState().getReturningGuest(undefined, [guest.id])).toBeUndefined();
  });
});
