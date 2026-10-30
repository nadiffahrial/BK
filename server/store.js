import { INITIAL_BUILDINGS, INITIAL_BOOKINGS } from './data/initialData.js';

// In-memory data store for live modifications during server runtime
export const state = {
  buildings: JSON.parse(JSON.stringify(INITIAL_BUILDINGS)),
  bookings: JSON.parse(JSON.stringify(INITIAL_BOOKINGS))
};

// Helper to find room across all buildings & floors
export const findRoomById = (roomId) => {
  for (const b of state.buildings) {
    for (const f of b.floors) {
      const room = f.rooms.find(r => r.id === roomId);
      if (room) {
        return { room, floor: f, building: b };
      }
    }
  }
  return null;
};
