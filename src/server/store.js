// Use global object to preserve state during Next.js hot reloads in dev mode
if (!global.gameRooms) {
  global.gameRooms = new Map();
}
if (!global.roomClients) {
  global.roomClients = new Map();
}

export const rooms = global.gameRooms;
export const clients = global.roomClients;

/**
 * Pushes the updated room state to all SSE clients listening in that room
 */
export function broadcastRoom(room) {
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
