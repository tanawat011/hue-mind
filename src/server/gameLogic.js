import { getRoom } from './roomManager.js';
import { broadcastRoom } from './store.js';

export function startGame(roomCode, settings = {}) {
  const room = getRoom(roomCode);
  if (!room) return;

  room.settings = settings;

  if (room.players.length < 2) {
    return { error: 'Need at least 2 players to start!' };
  }

  // Reset scores and set up initial game state
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

function clearPhaseTimer(room) {
  if (room.timerId) {
    clearTimeout(room.timerId);
    room.timerId = null;
  }
  if (room.gameState) {
    room.gameState.turnDeadline = null;
  }
}

function setPhaseTimer(room, timeoutCallback) {
  clearPhaseTimer(room);
  if (!room.settings || !room.settings.useTimer) return;
  
  const durationMs = (room.settings.timerDuration || 30) * 1000;
  room.gameState.turnDeadline = Date.now() + durationMs;
  
  room.timerId = setTimeout(() => {
    timeoutCallback(room);
  }, durationMs);
}

export function startNewTurn(room) {
  const currentGiver = room.players[room.gameState.currentTurnIndex];
  
  // Generate random target color coordinate (assuming 30x16 grid: x: 0-29, y: 0-15)
  // For simplicity we will use an x,y coordinate system.
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
  
  setPhaseTimer(room, (r) => {
    if (r.gameState && r.gameState.phase === 'CLUE_PHASE') {
      r.gameState.clue = "TIMEOUT";
      r.gameState.phase = 'SCORE_PHASE';
      broadcastRoom(r);
    }
  });
  
  processBotActions(room);
}

export function submitClue(roomCode, playerId, clue, targetChoiceIndex = 0) {
  const room = getRoom(roomCode);
  if (!room || room.state !== 'PLAYING') return { error: 'Game not running' };
  
  const currentGiver = room.players[room.gameState.currentTurnIndex];
  if (currentGiver.id !== playerId) return { error: 'Not your turn to give a clue' };
  if (room.gameState.phase !== 'CLUE_PHASE') return { error: 'Not the clue phase' };

  room.gameState.targetColor = room.gameState.targetChoices[targetChoiceIndex];
  room.gameState.clue = clue;
  room.gameState.phase = 'GUESS_PHASE';
  
  setPhaseTimer(room, (r) => {
    if (r.gameState && r.gameState.phase === 'GUESS_PHASE') {
      calculateScoresAndNextPhase(r);
      broadcastRoom(r);
    }
  });
  
  processBotActions(room);

  return { success: true, room };
}

export function submitGuess(roomCode, playerId, guessLocation) {
  const room = getRoom(roomCode);
  if (!room || room.state !== 'PLAYING') return { error: 'Game not running' };

  const currentGiver = room.players[room.gameState.currentTurnIndex];
  if (currentGiver.id === playerId) return { error: 'Clue giver cannot guess' };
  if (room.gameState.phase !== 'GUESS_PHASE') return { error: 'Not the guess phase' };

  if (room.settings && !room.settings.allowDuplicateGuesses) {
    const duplicate = Object.values(room.gameState.guesses).some(
      (g) => g.x === guessLocation.x && g.y === guessLocation.y
    );
    if (duplicate) return { error: 'Color already guessed' };
  }

  // Only one guess allowed per player in our simple version
  room.gameState.guesses[playerId] = guessLocation; // { x, y }

  // Check if everyone has guessed
  const guessersCount = room.players.length - 1;
  const currentGuesses = Object.keys(room.gameState.guesses).length;

  if (currentGuesses >= guessersCount) {
    clearPhaseTimer(room);
    calculateScoresAndNextPhase(room);
  } else {
    processBotActions(room);
  }

  return { success: true, room };
}

function calculateScoresAndNextPhase(room) {
  clearPhaseTimer(room);
  room.gameState.phase = 'SCORE_PHASE';
  const target = room.gameState.targetColor;
  const currentGiver = room.players[room.gameState.currentTurnIndex];
  
  let anyoneGuessedCorrectly = false; // Just to reward the giver slightly if it was a good clue

  Object.entries(room.gameState.guesses).forEach(([pid, guess]) => {
    // Calculate Chebyshev distance (max of x dist and y dist)
    const dx = Math.abs(guess.x - target.x);
    const dy = Math.abs(guess.y - target.y);
    const distance = Math.max(dx, dy);

    const player = room.players.find(p => p.id === pid);
    if (!player) return;

    if (distance === 0) {
      player.score += 3;
      anyoneGuessedCorrectly = true;
    } else if (distance === 1) {
      player.score += 2;
    } else if (distance === 2) {
      player.score += 1;
    }
  });

  // Small reward for good clue
  if (anyoneGuessedCorrectly) {
    currentGiver.score += 1;
  }
}

export function nextTurn(roomCode) {
  const room = getRoom(roomCode);
  if (!room || room.state !== 'PLAYING') return { error: 'Game not running' };
  if (room.gameState.phase !== 'SCORE_PHASE') return { error: 'Current turn not finished' };

  room.gameState.currentTurnIndex++;
  
  // Check if all players have gone this round
  if (room.gameState.currentTurnIndex >= room.players.length) {
    room.gameState.currentTurnIndex = 0;
    room.gameState.round++;
  }

  // Check if game is over
  if (room.gameState.round > room.gameState.maxRounds) {
    room.state = 'FINISHED';
  } else {
    startNewTurn(room);
  }

  return { success: true, room };
}

export function returnToLobby(roomCode) {
  const room = getRoom(roomCode);
  if (!room) return { error: 'Room not found' };
  
  clearPhaseTimer(room);
  room.state = 'LOBBY';
  room.players.forEach(p => {
    p.score = 0;
  });
  room.gameState = null;
  return { success: true, room };
}

// Bot AI routines
function processBotActions(room) {
  if (room.state !== 'PLAYING') return;

  const gameState = room.gameState;
  const currentGiver = room.players[gameState.currentTurnIndex];

  if (gameState.phase === 'CLUE_PHASE' && currentGiver.isBot) {
    const adjectives = ["Warm", "Cold", "Bright", "Dark", "Neon", "Pastel", "Deep", "Soft", "Vibrant", "Ocean", "Sunset", "Forest", "Earth"];
    const clue = adjectives[Math.floor(Math.random() * adjectives.length)];
    const chosenIndex = Math.floor(Math.random() * 4);
    
    setTimeout(() => {
      // Validate still valid phase and player
      if (room.gameState.phase === 'CLUE_PHASE' && room.players[room.gameState.currentTurnIndex].id === currentGiver.id) {
         submitClue(room.code, currentGiver.id, clue, chosenIndex);
         broadcastRoom(room);
      }
    }, 2000);
  }

  if (gameState.phase === 'GUESS_PHASE') {
    const botsToGuess = room.players.filter(p => p.isBot && p.id !== currentGiver.id && !gameState.guesses[p.id]);
    
    botsToGuess.forEach(bot => {
      setTimeout(() => {
        if (room.gameState.phase === 'GUESS_PHASE' && !room.gameState.guesses[bot.id]) {
           const target = room.gameState.targetColor;
           let gx, gy;
           
           let maxDist = 5;
           if (room.settings?.botDifficulty === 'Easy') maxDist = 12;
           else if (room.settings?.botDifficulty === 'Medium') maxDist = 6;
           else if (room.settings?.botDifficulty === 'Hard') maxDist = 2;
           else if (room.settings?.botDifficulty === 'Very Hard') maxDist = 1;
           
           let attempts = 0;
           let valid = false;

           const xMax = room.settings?.boardSize?.x || 30;
           const yMax = room.settings?.boardSize?.y || 16;

           while(!valid && attempts < 50) {
             let dx = Math.floor(Math.random() * (maxDist * 2 + 1)) - maxDist;
             let dy = Math.floor(Math.random() * (maxDist * 2 + 1)) - maxDist;
             
             gx = Math.max(0, Math.min(xMax - 1, target.x + dx));
             gy = Math.max(0, Math.min(yMax - 1, target.y + dy));
             
             valid = true;
             if (room.settings && !room.settings.allowDuplicateGuesses) {
                const dup = Object.values(room.gameState.guesses).some(g => g.x === gx && g.y === gy);
                if (dup) valid = false;
             }
             attempts++;
           }
           
           submitGuess(room.code, bot.id, { x: gx, y: gy });
           broadcastRoom(room);
        }
      }, 1000 + Math.random() * 3000); // 1 to 4s delay
    });
  }
}

