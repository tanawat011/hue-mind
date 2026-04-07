import { NextRequest, NextResponse } from "next/server";
import { createRoom, joinRoom, addBotToRoom, getRoom, sendChat } from "../../../server/roomManager";
import { startGame, submitClue, submitGuess, nextTurn, returnToLobby, processRoomTick } from "../../../server/gameLogic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, payload } = body;
  
  let result: any = { success: false, error: 'Unknown action' };

  switch (action) {
    case 'createRoom': {
      const { password, playerName, playerId } = payload;
      const roomCode = await createRoom(password);
      result = await joinRoom(roomCode, password, { id: playerId, name: playerName });
      if (result.success) {
        result.roomCode = roomCode;
      }
      break;
    }
    case 'joinRoom': {
      const { code, password, playerName, playerId } = payload;
      result = await joinRoom(code.toUpperCase(), password, { id: playerId, name: playerName });
      if (result.success) {
        result.roomCode = result.room.code;
      }
      break;
    }
    case 'addBot': {
      const { roomCode } = payload;
      result = await addBotToRoom(roomCode);
      break;
    }
    case 'startGame': {
      const { roomCode, settings } = payload;
      const room = await startGame(roomCode, settings);
      if (room && !('error' in room)) {
        result = { success: true, room };
      } else {
        result = room || { error: 'Failed to start' };
      }
      break;
    }
    case 'submitClue': {
      const { roomCode, playerId, clue, targetChoiceIndex } = payload;
      result = await submitClue(roomCode, playerId, clue, targetChoiceIndex);
      break;
    }
    case 'submitGuess': {
      const { roomCode, playerId, guessLocation } = payload;
      result = await submitGuess(roomCode, playerId, guessLocation);
      break;
    }
    case 'nextTurn': {
      const { roomCode } = payload;
      result = await nextTurn(roomCode);
      break;
    }
    case 'returnToLobby': {
      const { roomCode } = payload;
      result = await returnToLobby(roomCode);
      break;
    }
    case 'sendChat': {
      const { roomCode, playerId, message } = payload;
      result = await sendChat(roomCode, playerId, message);
      break;
    }
    case 'getRoomState': {
      const { roomCode } = payload;
      const processedRoom = await processRoomTick(roomCode);
      
      if (processedRoom) {
        result = { success: true, room: processedRoom };
      } else {
        result = { error: 'Room not found' };
      }
      break;
    }
  }

  // With KV & Polling, we don't manually broadcast. The client fetches
  // updated state via polling `getRoomState`.

  return NextResponse.json(result);
}
