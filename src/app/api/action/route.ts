import { NextRequest, NextResponse } from "next/server";
import { createRoom, joinRoom, addBotToRoom, getRoom, sendChat } from "../../../server/roomManager.js";
import { startGame, submitClue, submitGuess, nextTurn, returnToLobby } from "../../../server/gameLogic.js";
import { broadcastRoom } from "../../../server/store.js";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, payload } = body;
  
  let result: any = { success: false, error: 'Unknown action' };
  let shouldBroadcast = false;
  let broadcastCode: string | null = null;

  switch (action) {
    case 'createRoom': {
      const { password, playerName, playerId } = payload;
      const roomCode = createRoom(password);
      result = joinRoom(roomCode, password, { id: playerId, name: playerName });
      if (result.success) {
        shouldBroadcast = true;
        broadcastCode = roomCode;
        result.roomCode = roomCode;
      }
      break;
    }
    case 'joinRoom': {
      const { code, password, playerName, playerId } = payload;
      result = joinRoom(code.toUpperCase(), password, { id: playerId, name: playerName });
      if (result.success) {
        shouldBroadcast = true;
        broadcastCode = result.room.code;
        result.roomCode = result.room.code;
      }
      break;
    }
    case 'addBot': {
      const { roomCode } = payload;
      result = addBotToRoom(roomCode);
      if (result.success) {
        shouldBroadcast = true;
        broadcastCode = roomCode;
      }
      break;
    }
    case 'startGame': {
      const { roomCode, settings } = payload;
      const room = startGame(roomCode, settings);
      if (room && !room.error) {
        result = { success: true, room };
        shouldBroadcast = true;
        broadcastCode = roomCode;
      } else {
        result = room || { error: 'Failed to start' };
      }
      break;
    }
    case 'submitClue': {
      const { roomCode, playerId, clue, targetChoiceIndex } = payload;
      result = submitClue(roomCode, playerId, clue, targetChoiceIndex);
      if (result && result.success) {
        shouldBroadcast = true;
        broadcastCode = roomCode;
      }
      break;
    }
    case 'submitGuess': {
      const { roomCode, playerId, guessLocation } = payload;
      result = submitGuess(roomCode, playerId, guessLocation);
      if (result.success) {
        shouldBroadcast = true;
        broadcastCode = roomCode;
      }
      break;
    }
    case 'nextTurn': {
      const { roomCode } = payload;
      result = nextTurn(roomCode);
      if (result.success) {
        shouldBroadcast = true;
        broadcastCode = roomCode;
      }
      break;
    }
    case 'returnToLobby': {
      const { roomCode } = payload;
      result = returnToLobby(roomCode);
      if (result.success) {
        shouldBroadcast = true;
        broadcastCode = roomCode;
      }
      break;
    }
    case 'sendChat': {
      const { roomCode, playerId, message } = payload;
      result = sendChat(roomCode, playerId, message);
      if (result.success) {
        shouldBroadcast = true;
        broadcastCode = roomCode;
      }
      break;
    }
    case 'getRoomState': {
      const { roomCode } = payload;
      const room = getRoom(roomCode);
      if (room) {
        result = { success: true, room };
      } else {
        result = { error: 'Room not found' };
      }
      break;
    }
  }

  if (shouldBroadcast && broadcastCode && result.room) {
    setTimeout(() => {
        broadcastRoom(result.room);
    }, 0);
  } else if (shouldBroadcast && broadcastCode) {
      setTimeout(() => {
        broadcastRoom(getRoom(broadcastCode));
    }, 0);
  }

  return NextResponse.json(result);
}
