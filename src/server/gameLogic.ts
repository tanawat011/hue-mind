import { getRoom } from './roomManager';
import { broadcastRoom } from './store';
import { Room, Coordinate, Settings } from './types';

export function startGame(roomCode: string, settings: Settings = {}) {
  const room = getRoom(roomCode);
  if (!room) return;

  room.settings = settings;

  if (room.players.length < 2) {
    return { error: 'Need at least 2 players to start!' };
  }

  room.players.forEach(p => p.score = 0);
  
  room.state = 'PLAYING';
  room.gameState = {
    round: 1,
    maxRounds: room.settings?.roundsCount || 2,
    currentTurnIndex: 0,
    targetColor: null,
    clue: null,
    guesses: {},
    phase: 'CLUE_PHASE',
  };

  startNewTurn(room);
  return room;
}

function clearPhaseTimer(room: Room) {
  if (room.timerId) {
    clearTimeout(room.timerId);
    room.timerId = undefined;
  }
}

function setPhaseTimer(room: Room, callback: () => void) {
  clearPhaseTimer(room);
  if (!room.settings || !room.settings.useTimer) return;
  
  const durationMs = (room.settings.timerDuration || 30) * 1000;
  if(room.gameState) {
    room.gameState.turnDeadline = Date.now() + durationMs;
  }
  
  room.timerId = setTimeout(() => {
    room.timerId = undefined;
    callback();
  }, durationMs);
}

export function startNewTurn(room: Room) {
  if (!room.gameState) return;

  const currentGiver = room.players[room.gameState.currentTurnIndex];
  if (!currentGiver) return;
  
  const xMax = room.settings?.boardSize?.x || 30;
  const yMax = room.settings?.boardSize?.y || 16;
  
  room.gameState.targetChoices = Array.from({ length: 4 }).map(() => ({
    x: Math.floor(Math.random() * xMax),
    y: Math.floor(Math.random() * yMax)
  }));
  
  room.gameState.targetColor = null;
  room.gameState.clue = null;
  room.gameState.guesses = {};
  room.gameState.phase = 'CLUE_PHASE';
  
  setPhaseTimer(room, () => {
    if (room.gameState && room.gameState.phase === 'CLUE_PHASE') {
      room.gameState.clue = "TIMEOUT";
      room.gameState.phase = 'SCORE_PHASE';
      broadcastRoom(room.code);
    }
  });

  if (currentGiver.isBot) {
    setTimeout(() => {
      const adjectives = ["Warm", "Cold", "Bright", "Dark", "Neon", "Pastel", "Deep", "Soft", "Vibrant", "Ocean", "Sunset", "Forest", "Earth"];
      const clue = adjectives[Math.floor(Math.random() * adjectives.length)];
      const chosenIndex = Math.floor(Math.random() * 4);
      submitClue(room.code, currentGiver.id, clue, chosenIndex);
    }, 2000);
  }

  broadcastRoom(room.code);
}

export function submitClue(roomCode: string, playerId: string, clue: string, targetChoiceIndex: number = 0) {
  const room = getRoom(roomCode);
  if (!room || room.state !== 'PLAYING' || !room.gameState) return { error: 'Game not running' };
  
  const currentGiver = room.players[room.gameState.currentTurnIndex];
  if (!currentGiver || currentGiver.id !== playerId) return { error: 'Not your turn to give a clue' };
  if (room.gameState.phase !== 'CLUE_PHASE') return { error: 'Not the clue phase' };

  if(room.gameState.targetChoices) {
    room.gameState.targetColor = room.gameState.targetChoices[targetChoiceIndex];
  }
  room.gameState.clue = clue;
  room.gameState.phase = 'GUESS_PHASE';
  
  setPhaseTimer(room, () => {
    if (room.gameState && room.gameState.phase === 'GUESS_PHASE') {
      calculateScoresAndNextPhase(room);
    }
  });

  const botsToGuess = room.players.filter(p => p.isBot && p.id !== currentGiver.id);
  botsToGuess.forEach(bot => {
    setTimeout(() => {
      let gx=0, gy=0;
      const target = room.gameState?.targetColor;
      if(target) {
          let maxDist = 5;
          if (room.settings?.botDifficulty === 'Easy') maxDist = 12;
          else if (room.settings?.botDifficulty === 'Medium') maxDist = 6;
          else if (room.settings?.botDifficulty === 'Hard') maxDist = 2;
          else if (room.settings?.botDifficulty === 'Very Hard') maxDist = 1;
          
          let dx = Math.floor(Math.random() * (maxDist * 2 + 1)) - maxDist;
          let dy = Math.floor(Math.random() * (maxDist * 2 + 1)) - maxDist;
          
          const xMax = room.settings?.boardSize?.x || 30;
          const yMax = room.settings?.boardSize?.y || 16;
          
          gx = Math.max(0, Math.min(xMax - 1, target.x + dx));
          gy = Math.max(0, Math.min(yMax - 1, target.y + dy));
      }
      submitGuess(roomCode, bot.id, { x: gx, y: gy });
    }, 1500 + Math.random() * 2000);
  });

  broadcastRoom(room.code);
  return { success: true, room };
}

export function submitGuess(roomCode: string, playerId: string, guessLocation: Coordinate) {
  const room = getRoom(roomCode);
  if (!room || room.state !== 'PLAYING' || !room.gameState) return { error: 'Game not running' };

  const currentGiver = room.players[room.gameState.currentTurnIndex];
  if (!currentGiver || currentGiver.id === playerId) return { error: 'Clue giver cannot guess' };
  if (room.gameState.phase !== 'GUESS_PHASE') return { error: 'Not the guess phase' };

  if (room.settings && !room.settings.allowDuplicateGuesses) {
    const duplicate = Object.values(room.gameState.guesses).some(
      (g) => g.x === guessLocation.x && g.y === guessLocation.y
    );
    if (duplicate) return { error: 'Color already guessed' };
  }

  room.gameState.guesses[playerId] = guessLocation; 

  const guessersCount = room.players.length - 1;
  const currentGuesses = Object.keys(room.gameState.guesses).length;

  if (currentGuesses >= guessersCount) {
    calculateScoresAndNextPhase(room);
  } else {
    broadcastRoom(room.code);
  }

  return { success: true, room };
}

function calculateScoresAndNextPhase(room: Room) {
  if (!room.gameState) return;
  
  clearPhaseTimer(room);
  room.gameState.phase = 'SCORE_PHASE';
  const target = room.gameState.targetColor;
  const currentGiver = room.players[room.gameState.currentTurnIndex];
  if (!target || !currentGiver) return;
  
  let giverPoints = 0;

  Object.entries(room.gameState.guesses).forEach(([pid, guess]) => {
    const dx = Math.abs(guess.x - target.x);
    const dy = Math.abs(guess.y - target.y);
    const distance = Math.max(dx, dy);

    const player = room.players.find(p => p.id === pid);
    if (!player) return;

    if (distance === 0) {
      player.score += 3;
      giverPoints += 1; 
    } else if (distance === 1) {
      player.score += 2;
      giverPoints += 1; 
    } else if (distance === 2) {
      player.score += 1;
    }
  });

  currentGiver.score += giverPoints;
  broadcastRoom(room.code);
}

export function nextTurn(roomCode: string) {
  const room = getRoom(roomCode);
  if (!room || room.state !== 'PLAYING' || !room.gameState) return { error: 'Game not running' };
  if (room.gameState.phase !== 'SCORE_PHASE') return { error: 'Current turn not finished' };

  room.gameState.currentTurnIndex++;
  
  if (room.gameState.currentTurnIndex >= room.players.length) {
    room.gameState.currentTurnIndex = 0;
    room.gameState.round++;
  }

  if (room.gameState.round > room.gameState.maxRounds) {
    room.state = 'FINISHED';
    broadcastRoom(room.code);
  } else {
    startNewTurn(room);
  }

  return { success: true, room };
}

export function returnToLobby(roomCode: string) {
  const room = getRoom(roomCode);
  if (!room) return { error: 'Room not found' };
  
  clearPhaseTimer(room);
  room.state = 'LOBBY';
  room.players.forEach(p => {
    p.score = 0;
  });
  room.gameState = null;
  broadcastRoom(room.code);
  return { success: true, room };
}
