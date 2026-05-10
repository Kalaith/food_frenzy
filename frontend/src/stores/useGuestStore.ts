import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GuestRecord } from '../types/game';

interface GuestStore {
  guests: GuestRecord[];
  applyBackendGuests: (guests: unknown[]) => void;
  createGuest: (name: string, customerType: string) => GuestRecord;
  recordGuestVisit: (guestId: string) => void;
  recordGuestFed: (guestId: string) => void;
  recordGuestProcessed: (guestId: string) => void;
  getReturningGuest: (
    customerType?: string,
    excludedGuestIds?: string[]
  ) => GuestRecord | undefined;
  resetGuests: () => void;
}

const createGuestId = (name: string, customerType: string) =>
  `${customerType}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const chooseRandom = <T>(items: T[]) =>
  items.length > 0 ? items[Math.floor(Math.random() * items.length)] : undefined;

export const useGuestStore = create<GuestStore>()(
  persist(
    (set, get) => ({
      guests: [],

      applyBackendGuests: guests => {
        set({
          guests: guests
            .filter((guest): guest is Record<string, unknown> => typeof guest === 'object' && guest !== null)
            .map((guest): GuestRecord => ({
              id: typeof guest.id === 'string' ? guest.id : 'guest',
              name: typeof guest.name === 'string' ? guest.name : 'Guest',
              customerType: typeof guest.customerType === 'string' ? guest.customerType : 'pig',
              visits: typeof guest.visits === 'number' ? guest.visits : 0,
              feedings: typeof guest.feedings === 'number' ? guest.feedings : 0,
              processedCount: typeof guest.processedCount === 'number' ? guest.processedCount : 0,
              lastSeenAt: typeof guest.lastSeenAt === 'number' ? guest.lastSeenAt : Date.now(),
            })),
        });
      },

      createGuest: (name, customerType) => {
        const trimmedName = name.trim() || 'Guest';
        const guest: GuestRecord = {
          id: createGuestId(trimmedName, customerType),
          name: trimmedName,
          customerType,
          visits: 0,
          feedings: 0,
          processedCount: 0,
          lastSeenAt: Date.now(),
        };

        set(state => ({
          guests: [...state.guests, guest],
        }));

        return guest;
      },

      recordGuestVisit: guestId =>
        set(state => ({
          guests: state.guests.map(guest =>
            guest.id === guestId
              ? { ...guest, visits: guest.visits + 1, lastSeenAt: Date.now() }
              : guest
          ),
        })),

      recordGuestFed: guestId =>
        set(state => ({
          guests: state.guests.map(guest =>
            guest.id === guestId
              ? { ...guest, feedings: guest.feedings + 1, lastSeenAt: Date.now() }
              : guest
          ),
        })),

      recordGuestProcessed: guestId =>
        set(state => ({
          guests: state.guests.map(guest =>
            guest.id === guestId
              ? { ...guest, processedCount: guest.processedCount + 1, lastSeenAt: Date.now() }
              : guest
          ),
        })),

      getReturningGuest: (customerType, excludedGuestIds = []) => {
        const excluded = new Set(excludedGuestIds);
        const fedGuests = get().guests.filter(
          guest =>
            guest.feedings > 0 &&
            !excluded.has(guest.id) &&
            (!customerType || guest.customerType === customerType)
        );

        return chooseRandom(fedGuests);
      },

      resetGuests: () => set({ guests: [] }),
    }),
    {
      name: 'feast-frenzy-guests',
      partialize: state => ({
        guests: state.guests,
      }),
    }
  )
);
