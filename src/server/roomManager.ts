import { rooms as storeRooms } from './store';
import { Room, Player } from './types';

export const rooms = storeRooms;

function generateRoomCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function createRoom(password: string | null = null): string {
  let roomCode = generateRoomCode();
  while (rooms.has(roomCode)) {
    roomCode = generateRoomCode();
  }

  const room: Room = {
    code: roomCode,
    password: password,
    players: [],
    state: 'LOBBY',
    gameState: null,
    chat: []
  };

  rooms.set(roomCode, room);
  return roomCode;
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code);
}

export function joinRoom(code: string, password: string | null, player: Omit<Player, 'isHost' | 'score'>) {
  const room = rooms.get(code);
  if (!room) return { error: 'Room not found' };
  
  if (room.password && room.password !== password) {
    return { error: 'Incorrect password' };
  }

  if (room.state !== 'LOBBY') {
    return { error: 'Game already in progress' };
  }

  if (room.players.length >= 8) {
    return { error: 'Room is full (max 8 players)' };
  }

  const isHost = room.players.length === 0;
  const newPlayer: Player = { ...player, isHost, score: 0 };
  
  // check if player is already in room (should not happen, but safeguard)
  if (!room.players.find(p => p.id === player.id)) {
      room.players.push(newPlayer);
  }
  return { success: true, room, newPlayer };
}

export function sendChat(code: string, playerId: string, message: string) {
  const room = rooms.get(code);
  if (!room) return { error: 'Room not found' };
  
  if (!room.chat) room.chat = [];
  
  const player = room.players.find(p => p.id === playerId);
  const name = player ? player.name : (playerId === 'system' ? 'System' : 'Unknown');
  
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

export function leaveRoom(code: string, playerId: string) {
  const room = rooms.get(code);
  if (!room) return null;

  const playerIndex = room.players.findIndex(p => p.id === playerId);
  if (playerIndex !== -1) {
    const isHost = room.players[playerIndex].isHost;
    room.players.splice(playerIndex, 1);
    
    // If room is empty, delete it
    if (room.players.length === 0) {
      rooms.delete(code);
      return { code, deleted: true };
    } else if (isHost) {
      // Reassign host
      if (room.players[0]) {
        room.players[0].isHost = true;
      }
    }
  }
  return { code, room };
}

export function removePlayerFromAllRooms(playerId: string) {
  const leftRooms: Array<{code: string; room?: Room; deleted?: boolean}> = [];
  for (const [code, room] of rooms.entries()) {
    if (room.players.some(p => p.id === playerId)) {
      const updateDetails = leaveRoom(code, playerId);
      if (updateDetails) {
        leftRooms.push(updateDetails);
      }
    }
  }
  return leftRooms;
}

export function addBotToRoom(code: string) {
  const room = rooms.get(code);
  if (!room) return { error: 'Room not found' };
  if (room.state !== 'LOBBY') return { error: 'Game already in progress' };
  if (room.players.length >= 8) return { error: 'Room is full' };
  
  const botCount = room.players.filter(p => p.isBot).length;
  const botName = `Bot ${botCount + 1}`;
  const botId = `bot-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  const newBot: Player = { 
    id: botId, 
    name: botName, 
    score: 0, 
    isHost: false, 
    isBot: true 
  };
  
  room.players.push(newBot);
  return { success: true, room };
}
