import { getRoom } from './roomManager';
import { ChatMessage } from './types';

export function sendChat(code: string, playerId: string, message: string) {
  const room = getRoom(code);
  if (!room) return { error: 'Room not found' };
  
  if (!room.chat) room.chat = [];
  
  const player = room.players.find(p => p.id === playerId);
  const name = player ? player.name : 'Unknown';
  
  const chatMessage: ChatMessage = {
    playerId,
    name,
    message,
    timestamp: Date.now()
  };
  
  room.chat.push(chatMessage);
  
  if (room.chat.length > 50) {
    room.chat.shift(); // Keep only last 50 messages
  }
  
  return { success: true };
}
