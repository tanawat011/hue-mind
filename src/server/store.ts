import { Room } from './types';

// Use global object to preserve state during Next.js hot reloads in dev mode
declare global {
  var gameRooms: Map<string, Room>;
  var roomClients: Map<string, Set<{ id: string; controller: ReadableStreamDefaultController }>>;
}

if (!global.gameRooms) {
  global.gameRooms = new Map<string, Room>();
}
if (!global.roomClients) {
  global.roomClients = new Map<string, Set<{ id: string; controller: ReadableStreamDefaultController }>>();
}

export const rooms = global.gameRooms;
export const clients = global.roomClients;

/**
 * Pushes the updated room state to all SSE clients listening in that room
 */
export function broadcastRoom(room: Room | undefined | null) {
  if (!room || !room.code) return;
  const roomListeners = clients.get(room.code);
  if (roomListeners) {
    const message = `data: ${JSON.stringify(room)}\n\n`;
    roomListeners.forEach(client => {
      try {
        client.controller.enqueue(new TextEncoder().encode(message));
      } catch (e) {
        // Ignored, client probably disconnected
      }
    });
  }
}
