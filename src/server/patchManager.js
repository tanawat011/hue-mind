import { getRoom } from './roomManager.js';

export function sendChat(code, playerId, message) {
  const room = getRoom(code);
  if (!room) return { error: 'Room not found' };
  
  if (!room.chat) room.chat = [];
  
  const player = room.players.find(p => p.id === playerId);
  const name = player ? player.name : 'Unknown';
  
  room.chat.push({
    playerId,
    name,
    message,
    timestamp: Date.now()
  });
  
  if (room.chat.length > 50) {
    room.chat.shift(); // Keep only last 50 messages
  }
  
  return { success: true };
}
