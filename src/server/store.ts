import { Room } from './types';

// Global memory for rooms. Fast and synchronous!
const globalAny: any = global;

if (!globalAny.gameRooms) {
  globalAny.gameRooms = new Map<string, Room>();
}
if (!globalAny.roomStreams) {
  globalAny.roomStreams = new Map<string, Set<ReadableStreamDefaultController>>();
}

export const gameRooms = globalAny.gameRooms as Map<string, Room>;
export const roomStreams = globalAny.roomStreams as Map<string, Set<ReadableStreamDefaultController>>;

// Broadcast a room state to all connected SSE clients
export function broadcastRoom(roomCode: string) {
  const room = gameRooms.get(roomCode);
  if (!room) return;

  const streams = roomStreams.get(roomCode);
  if (streams) {
    const data = `data: ${JSON.stringify(room)}\n\n`;
    streams.forEach(controller => {
      try {
        controller.enqueue(new TextEncoder().encode(data));
      } catch (e) {
        // If stream is closed or errored, remove it
        streams.delete(controller);
      }
    });
  }
}
