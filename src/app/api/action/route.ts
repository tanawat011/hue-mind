import { NextRequest, NextResponse } from "next/server";
import { createRoom, joinRoom, addBotToRoom, getRoom, sendChat } from "../../../server/roomManager";
import { startGame, submitClue, submitGuess, nextTurn, returnToLobby } from "../../../server/gameLogic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, payload } = body;
  
  let result: any = { success: false, error: 'Unknown action' };

  switch (action) {
    case 'createRoom': {
      const { password, playerName, playerId } = payload;
      const roomCode = createRoom(password);
      result = joinRoom(roomCode, password, { id: playerId, name: playerName });
      if (result.success) {
        result.roomCode = roomCode;
      }
      break;
    }
    case 'joinRoom': {
      const { code, password, playerName, playerId } = payload;
      result = joinRoom(code.toUpperCase(), password, { id: playerId, name: playerName });
      if (result.success) {
        result.roomCode = result.room.code;
      }
      break;
    }
    case 'addBot': {
      const { roomCode } = payload;
      result = addBotToRoom(roomCode);
      break;
    }
    case 'startGame': {
      const { roomCode, settings } = payload;
      const room = startGame(roomCode, settings);
      if (room && !('error' in room)) {
        result = { success: true, room };
      } else {
        result = room || { error: 'Failed to start' };
      }
      break;
    }
    case 'submitClue': {
      const { roomCode, playerId, clue, targetChoiceIndex } = payload;
      result = submitClue(roomCode, playerId, clue, targetChoiceIndex);
      break;
    }
    case 'submitGuess': {
      const { roomCode, playerId, guessLocation } = payload;
      result = submitGuess(roomCode, playerId, guessLocation);
      break;
    }
    case 'nextTurn': {
      const { roomCode } = payload;
      result = nextTurn(roomCode);
      break;
    }
    case 'returnToLobby': {
      const { roomCode } = payload;
      result = returnToLobby(roomCode);
      break;
    }
    case 'sendChat': {
      const { roomCode, playerId, message } = payload;
      result = sendChat(roomCode, playerId, message);
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

  return NextResponse.json(result);
}
