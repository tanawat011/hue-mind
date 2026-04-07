import { Room, Player } from './types';
import { gameRooms, broadcastRoom } from './store';

function generateRoomCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function createRoom(password?: string): string {
  let code = generateRoomCode();
  while (gameRooms.has(code)) {
    code = generateRoomCode();
  }
  
  const newRoom: Room = {
    code,
    players: [],
    state: 'LOBBY',
    password: password || undefined,
    chat: [],
  };
  
  gameRooms.set(code, newRoom);
  return code;
}

export function joinRoom(code: string, password?: string, guestInfo?: { id: string, name: string }) {
  const room = gameRooms.get(code);
  
  if (!room) {
    return { success: false, error: 'Room not found' };
  }
  
  if (room.password && room.password !== password) {
    return { success: false, error: 'Incorrect password' };
  }
  
  if (room.state !== 'LOBBY') {
    return { success: false, error: 'Game already in progress' };
  }
  
  // Actually add the player if not already in room
  if (guestInfo) {
    if (room.players.length >= 8) {
      return { success: false, error: 'Room is full (max 8 players)' };
    }
    const existingPlayer = room.players.find(p => p.id === guestInfo.id);
    if (!existingPlayer) {
      const newPlayer: Player = {
        id: guestInfo.id,
        name: guestInfo.name,
        score: 0,
        isBot: false,
        isHost: room.players.length === 0
      };
      room.players.push(newPlayer);
      broadcastRoom(code);
    }
  }
  
  return { success: true, room };
}

export function addBotToRoom(code: string) {
  const room = gameRooms.get(code);
  if (!room || room.state !== 'LOBBY') return { success: false, error: 'Cannot add bot' };
  if (room.players.length >= 8) return { success: false, error: 'Room is full' };
  
  const botCount = room.players.filter(p => p.isBot).length;
  const botNames = ['Bot Alpha', 'Bot Beta', 'Bot Gamma', 'Bot Delta', 'Bot Epsilon'];
  const botName = botNames[Math.min(botCount, botNames.length - 1)] || `Bot ${botCount + 1}`;
  
  const newBot: Player = {
    id: `bot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: botName,
    score: 0,
    isBot: true,
    isHost: false
  };
  
  room.players.push(newBot);
  broadcastRoom(code);
  return { success: true, room };
}

export function getRoom(code: string): Room | undefined {
  return gameRooms.get(code);
}

export function sendChat(code: string, playerId: string, message: string) {
  const room = gameRooms.get(code);
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
  
  if (room.chat.length > 50) room.chat.shift();
  
  broadcastRoom(code);
  return { success: true };
}
