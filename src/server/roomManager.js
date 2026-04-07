import { rooms as storeRooms } from './store.js';
export const rooms = storeRooms;

function generateRoomCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function createRoom(password = null) {
  let roomCode = generateRoomCode();
  while (rooms.has(roomCode)) {
    roomCode = generateRoomCode();
  }

  const room = {
    code: roomCode,
    password: password,
    players: [], // { id, name, score, isHost }
    state: 'LOBBY', // LOBBY, PLAYING, FINISHED
    gameState: null
  };

  rooms.set(roomCode, room);
  return roomCode;
}

export function getRoom(code) {
  return rooms.get(code);
}

export function joinRoom(code, password, player) {
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
  const newPlayer = { ...player, isHost, score: 0 };
  
  // check if player is already in room (should not happen, but safeguard)
  if (!room.players.find(p => p.id === player.id)) {
      room.players.push(newPlayer);
  }
  return { success: true, room, newPlayer };
}

export function leaveRoom(code, playerId) {
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
      room.players[0].isHost = true;
    }
  }
  return { code, room };
}

export function removePlayerFromAllRooms(playerId) {
  const leftRooms = [];
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

export function addBotToRoom(code) {
  const room = rooms.get(code);
  if (!room) return { error: 'Room not found' };
  if (room.state !== 'LOBBY') return { error: 'Game already in progress' };
  if (room.players.length >= 8) return { error: 'Room is full' };
  
  const botCount = room.players.filter(p => p.isBot).length;
  const botName = `Bot ${botCount + 1}`;
  const botId = `bot-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  const newBot = { 
    id: botId, 
    name: botName, 
    score: 0, 
    isHost: false, 
    isBot: true 
  };
  
  room.players.push(newBot);
  return { success: true, room };
}
