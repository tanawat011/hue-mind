"use client";

import { useState, useEffect } from "react";
import { apiAction } from "@/lib/api";
import { Users, MessageSquare, ScrollText, Clock } from "lucide-react";

function CountdownTimer({ deadline }: { deadline: number | null }) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!deadline) {
      setTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 500);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline) return null;

  const isUrgent = timeLeft <= 10;

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${isUrgent
      ? "bg-rose-500/20 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse"
      : "bg-black/30 border-white/10"
      }`}>
      <Clock className={isUrgent ? "text-rose-400" : "text-cyan-400"} size={20} />
      <span className={`text-xl font-black tabular-nums tracking-widest ${isUrgent ? "text-rose-400" : "text-cyan-400"}`}>
        00:{timeLeft.toString().padStart(2, '0')}
      </span>
    </div>
  );
}

type GameBoardProps = {
  room: any;
  localPlayerId: string;
};

export function GameBoard({ room, localPlayerId }: GameBoardProps) {
  const [clueInput, setClueInput] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{ x: number; y: number } | null>(null);
  const [selectedTargetChoice, setSelectedTargetChoice] = useState<number>(0);

  const gameState = room.gameState;
  if (!gameState) return null;

  const currentGiver = room.players[gameState.currentTurnIndex];
  const isMyTurnToGiveClue = currentGiver.id === localPlayerId;
  const iAmTarget = isMyTurnToGiveClue;

  const xMax = room.settings?.boardSize?.x || 30;
  const yMax = room.settings?.boardSize?.y || 16;

  const getCellColor = (x: number, y: number) => {
    const hue = Math.floor((x / xMax) * 360);
    const lightness = 75 - (y / yMax) * 45;
    return `hsl(${hue}, 100%, ${lightness}%)`;
  };

  const handleClueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clueInput.trim()) return;
    apiAction("submitClue", { roomCode: room.code, playerId: localPlayerId, clue: clueInput, targetChoiceIndex: selectedTargetChoice });
    setClueInput("");
  };

  const handleCellClick = (x: number, y: number) => {
    if (gameState.phase !== "GUESS_PHASE") return;
    if (iAmTarget) return;
    if (gameState.guesses[localPlayerId]) return;
    setSelectedLocation({ x, y });
  };

  const confirmGuess = () => {
    if (!selectedLocation) return;
    apiAction("submitGuess", { roomCode: room.code, playerId: localPlayerId, guessLocation: selectedLocation });
  };

  const handleNextTurn = () => {
    apiAction("nextTurn", { roomCode: room.code });
  };

  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatMessage.trim()) return;
    
    apiAction('sendChat', { roomCode: room.code, playerId: localPlayerId, message: chatMessage.trim() });
    setChatMessage('');
  };

  const isHost = room.players[0]?.id === localPlayerId;

  // Sort players by score for ranking badges
  const rankedPlayers = [...room.players].sort((a: any, b: any) => b.score - a.score);
  const getRankStyle = (playerId: string) => {
    const idx = rankedPlayers.findIndex((p: any) => p.id === playerId);
    if (idx === 0) return { label: "1ST", color: "text-cyan-300 border-cyan-400/50 bg-cyan-400/10 shadow-[0_0_10px_rgba(34,211,238,0.2)]", cardBorder: "border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-transparent" };
    if (idx === 1) return { label: "2ND", color: "text-yellow-300 border-yellow-400/50 bg-yellow-400/10", cardBorder: "border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-transparent" };
    if (idx === 2) return { label: "3RD", color: "text-fuchsia-300 border-fuchsia-400/50 bg-fuchsia-400/10", cardBorder: "border-fuchsia-500/20 bg-gradient-to-r from-fuchsia-500/5 to-transparent" };
    return { label: `${idx + 1}TH`, color: "text-zinc-400 border-zinc-600 bg-white/[0.02]", cardBorder: "border-white/5 bg-black/20 hover:bg-white/[0.04]" };
  };

  // Calculate tied rankings (Dense Ranking)
  const sortedPlayers = [...room.players].sort((a: any, b: any) => b.score - a.score);
  const distinctScores = Array.from(new Set(room.players.map((p: any) => p.score))).sort((a: any, b: any) => b - a) as number[];

  return (
    <div className="flex flex-col lg:flex-row w-full h-full lg:max-h-[90vh] gap-4 text-white pb-10 lg:pb-0">

      {/* LEFT COLUMN: Player Lobby */}
      <div className="flex w-full lg:w-[260px] xl:w-[280px] flex-col shrink-0 order-2 lg:order-1">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-3 lg:p-5 rounded-[20px] shadow-2xl flex-1 flex flex-col relative overflow-hidden">
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none" />

          <h3 className="font-bold text-[15px] text-white mb-3 lg:mb-5 relative z-10 tracking-wide hidden lg:block">Player Lobby</h3>

          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-y-auto lg:space-y-2.5 gap-2 lg:gap-0 relative z-10 pr-1 pb-2 lg:pb-0 custom-scrollbar items-center lg:items-stretch">
            {sortedPlayers.map((p: any) => {
              const idx = distinctScores.indexOf(p.score);
              
              let rankStyle = { label: `${idx + 1}TH`, color: "text-zinc-400 border-zinc-600 bg-white/[0.02]", wrapperClass: "bg-gradient-to-r from-zinc-500 via-gray-600 to-zinc-500", ringClass: "bg-gradient-to-br from-zinc-500 to-gray-500" };

              if (idx === 0) rankStyle = { label: "1ST", color: "text-cyan-300 border-cyan-400/50 bg-cyan-400/10", wrapperClass: "bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]", ringClass: "bg-gradient-to-br from-cyan-400 to-emerald-400" };
              else if (idx === 1) rankStyle = { label: "2ND", color: "text-amber-300 border-amber-400/50 bg-amber-400/10", wrapperClass: "bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-400", ringClass: "bg-gradient-to-br from-amber-400 to-orange-400" };
              else if (idx === 2) rankStyle = { label: "3RD", color: "text-fuchsia-300 border-fuchsia-400/50 bg-fuchsia-400/10", wrapperClass: "bg-gradient-to-r from-fuchsia-400 via-pink-500 to-rose-400", ringClass: "bg-gradient-to-br from-fuchsia-400 to-rose-400" };
              else if (idx === 3) rankStyle = { label: "4TH", color: "text-purple-300 border-purple-400/50 bg-purple-400/10", wrapperClass: "bg-gradient-to-r from-purple-400 via-indigo-500 to-violet-400", ringClass: "bg-gradient-to-br from-purple-400 to-violet-400" };
              else if (idx === 4) rankStyle = { label: "5TH", color: "text-emerald-300 border-emerald-400/50 bg-emerald-400/10", wrapperClass: "bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-400", ringClass: "bg-gradient-to-br from-emerald-400 to-cyan-400" };
              else if (idx === 5) rankStyle = { label: "6TH", color: "text-rose-300 border-rose-400/50 bg-rose-400/10", wrapperClass: "bg-gradient-to-r from-rose-400 via-red-500 to-orange-400", ringClass: "bg-gradient-to-br from-rose-400 to-orange-400" };
              else rankStyle = { label: `${idx + 1}TH`, color: "text-indigo-300 border-indigo-400/50 bg-indigo-400/10", wrapperClass: "bg-gradient-to-r from-indigo-400 via-slate-500 to-zinc-400", ringClass: "bg-gradient-to-br from-indigo-400 to-zinc-400" };

              const isCurrentGiver = p.id === currentGiver.id;
              const hasGuessed = !!gameState?.guesses?.[p.id];
              const guessPos = gameState?.guesses?.[p.id];
              const isCurrentlyGuessingPhase = gameState?.phase === 'GUESS_PHASE';

              const activeWrapper = isCurrentGiver
                ? "bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 shadow-[0_0_20px_rgba(232,121,249,0.4)]"
                : rankStyle.wrapperClass;

              const activeRing = isCurrentGiver
                ? "bg-gradient-to-tr from-fuchsia-400 to-cyan-400 shadow-[0_0_10px_#e879f9]"
                : rankStyle.ringClass;

              const originalIndex = room.players.findIndex((player: any) => player.id === p.id);
              const avatarIndex = (originalIndex % 8) + 1;

              return (
                <div key={p.id} className={`p-[1.5px] rounded-[20px] transition-all w-[220px] lg:w-full shrink-0 ${activeWrapper}`}>
                  <div className="bg-[#0b0c10]/90 backdrop-blur-2xl rounded-[18.5px] p-2.5 lg:p-3 flex items-center justify-between gap-1 lg:gap-3 w-full h-full">
                    <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
                      <div className="relative shrink-0">
                        <div className={`p-[1.5px] w-10 h-10 lg:w-13 lg:h-13 rounded-full ${activeRing}`}>
                          <div className="w-full h-full rounded-full bg-indigo-950/80 overflow-hidden shadow-inner flex items-center justify-center">
                            <img src={`/avatars/${avatarIndex}.png`} alt="avatar" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="font-black text-xs lg:text-sm text-white truncate drop-shadow-md">{p.name}</div>
                        <div className="flex items-center gap-1.5 lg:gap-2 mt-1">
                          <span className={`text-[9px] items-center justify-center flex font-black px-1.5 lg:px-2 py-0.5 rounded-full border tracking-widest ${idx <= 2 ? rankStyle.color : 'text-zinc-400 border-zinc-600'}`}>{rankStyle.label}</span>
                          <span className="text-[10px] text-zinc-300 font-bold whitespace-nowrap">
                            {p.score} pts
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0 pl-1">
                      {/* Dot and Status */}
                      <div className="flex items-center gap-1.5">
                        {!isCurrentGiver && hasGuessed ? (
                          <>
                            <span className="text-[10px] text-emerald-400 font-bold">Guessed</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                          </>
                        ) : !isCurrentGiver && isCurrentlyGuessingPhase ? (
                          <>
                            <span className="text-[10px] text-fuchsia-400 font-bold animate-pulse">Thinking</span>
                            <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse shadow-[0_0_8px_#e879f9]" />
                          </>
                        ) : (
                          <>
                            <span className="text-[10px] text-zinc-500 font-bold">{isCurrentGiver ? 'Giver' : 'Ready'}</span>
                            <div className="w-2 h-2 rounded-full bg-zinc-600" />
                          </>
                        )}
                      </div>
                      {/* If guessed, show the color swatch */}
                      {(!isCurrentGiver && hasGuessed && guessPos) && (
                        <div
                          className="w-5 h-5 rounded border border-white/30 shadow-md"
                          style={{ backgroundColor: getCellColor(guessPos.x, guessPos.y) }}
                          title={`Guessed x:${guessPos.x + 1}, y:${String.fromCharCode(65 + guessPos.y)}`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CENTER COLUMN: Game Board + Controls */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">

        {/* Top Status Bar: Round Info & Personal Score & Timer */}
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-y-2 px-2">
          <div className="flex flex-col items-start bg-black/30 border border-white/5 px-4 py-2 rounded-xl shrink-0">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Round {gameState.round} / {gameState.maxRounds}</span>
            <span className="text-sm font-black text-white uppercase tracking-widest">{gameState.phase.replace('_', ' ')}</span>
          </div>

          <div className="flex items-center gap-3 md:gap-4 bg-linear-to-r from-fuchsia-900/50 to-indigo-900/50 border border-fuchsia-500/30 px-4 py-1.5 md:py-2 rounded-xl shadow-[0_0_15px_rgba(232,121,249,0.15)] flex-1 md:mx-4 mx-1 justify-center order-last md:order-none w-full md:w-auto">
            <div className="text-right">
              <span className="block text-[10px] text-fuchsia-300 font-bold uppercase tracking-widest">My Score</span>
              <span className="block text-base font-black text-white drop-shadow-md">
                {room.players.find((p: any) => p.id === localPlayerId)?.score || 0} PTS
              </span>
            </div>
            <div className="w-px h-8 bg-fuchsia-500/30 skew-x-[-15deg]"></div>
            <div className="text-left">
              <span className="block text-[10px] text-fuchsia-300 font-bold uppercase tracking-widest">Rank</span>
              <span className="block text-base font-black text-white drop-shadow-md">
                #{distinctScores.indexOf(room.players.find((p: any) => p.id === localPlayerId)?.score || 0) + 1}
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <CountdownTimer deadline={room.gameState?.turnDeadline} />
          </div>
        </div>

        {/* Target Color Preview (shown to clue giver during CLUE_PHASE) */}
        {iAmTarget && gameState.phase === 'CLUE_PHASE' && (
          <div className="flex flex-col items-center gap-3">
            <span className="text-zinc-300 font-bold tracking-widest uppercase text-xs">Select a color to give a clue for:</span>
            <div className="flex justify-center gap-4">
              {gameState.targetChoices?.map((choice: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTargetChoice(idx)}
                  className={`w-14 h-14 rounded-xl transition-all duration-200 border-2 ${selectedTargetChoice === idx ? 'scale-110 border-white shadow-[0_0_30px_rgba(255,255,255,0.6)]' : 'border-white/20 hover:scale-105 hover:border-white/50'}`}
                  style={{
                    backgroundColor: getCellColor(choice.x, choice.y),
                    boxShadow: selectedTargetChoice === idx ? `0 0 25px ${getCellColor(choice.x, choice.y)}, inset 0 2px 6px rgba(255,255,255,0.5)` : 'none'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Current Clue Bar (shown to guessers) */}
        {gameState.phase === 'GUESS_PHASE' && (
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl py-2.5 px-6 text-center shadow-lg relative overflow-hidden mx-auto max-w-lg">
            <div className="absolute inset-0 bg-linear-to-r from-fuchsia-600/10 via-transparent to-cyan-600/10 pointer-events-none" />
            <span className="text-zinc-400 uppercase tracking-[0.15em] text-[11px] font-bold mr-3 relative z-10">CLUE:</span>
            <span className="text-lg font-black text-white tracking-wider relative z-10 drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]">
              "{gameState.clue}"
            </span>
          </div>
        )}

        {/* The Board Grid */}
        <div className="bg-white/[0.03] backdrop-blur-[40px] border border-white/10 p-4 rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex-1 flex flex-col items-center justify-center relative overflow-hidden">

          <div
            className="grid gap-[3px] md:gap-[4px] w-full bg-transparent"
            style={{
              aspectRatio: `${xMax} / ${yMax}`,
              gridTemplateColumns: `auto repeat(${xMax}, minmax(0, 1fr))`,
              gridTemplateRows: `auto repeat(${yMax}, minmax(0, 1fr))`
            }}
          >

            {/* Empty top-left cell */}
            <div style={{ gridColumn: 1, gridRow: 1 }} />

            {/* Column labels (1 to 30) */}
            {Array.from({ length: xMax }).map((_, i) => (
              <div key={`col-${i}`} className="flex items-center justify-center text-[7px] md:text-[10px] font-bold text-white/40 pb-1" style={{ gridColumn: i + 2, gridRow: 1 }}>
                {i + 1}
              </div>
            ))}

            {/* Row labels (A to P) */}
            {Array.from({ length: yMax }).map((_, i) => (
              <div key={`row-${i}`} className="flex items-center justify-center text-[7px] md:text-[10px] font-bold text-white/40 pr-2" style={{ gridColumn: 1, gridRow: i + 2 }}>
                {String.fromCharCode(65 + i)}
              </div>
            ))}

            {Array.from({ length: yMax }).map((_, y) => (
              Array.from({ length: xMax }).map((_, x) => {
                const baseColor = getCellColor(x, y);
                const previewTarget = iAmTarget && gameState.phase === 'CLUE_PHASE' ? gameState.targetChoices?.[selectedTargetChoice] : null;
                const isTarget = previewTarget && previewTarget.x === x && previewTarget.y === y;
                const isScorePhase = gameState.phase === 'SCORE_PHASE';
                const isActualTarget = isScorePhase && gameState.targetColor?.x === x && gameState.targetColor?.y === y;
                const guessersPlayers = Object.entries(gameState.guesses)
                  .filter(([_, g]: any) => g.x === x && g.y === y)
                  .map(([id]) => room.players.find((p: any) => p.id === id))
                  .filter(Boolean);
                const isSelectedByMe = selectedLocation?.x === x && selectedLocation?.y === y;

                return (
                  <div
                    key={`${x}-${y}`}
                    onClick={() => handleCellClick(x, y)}
                    className={`
                         group cursor-pointer relative transition-all duration-200
                         hover:scale-[1.8] hover:z-30 hover:brightness-125
                         ${isTarget ? 'ring-[3px] ring-white z-20 scale-125 shadow-[0_0_20px_rgba(255,255,255,0.9)]' : ''}
                         ${isSelectedByMe ? 'ring-[3px] ring-cyan-400 z-20 scale-125 shadow-[0_0_20px_rgba(34,211,238,0.9)]' : ''}
                         ${isActualTarget ? 'ring-[3px] ring-fuchsia-400 z-30 scale-150 shadow-[0_0_40px_rgba(232,121,249,1)]' : ''}
                       `}
                    style={{
                      gridColumn: x + 2,
                      gridRow: y + 2,
                      backgroundColor: baseColor,
                      borderRadius: 'max(4px, 15%)',
                      boxShadow: `0 0 5px ${baseColor}, inset 0 0 0 1.5px rgba(255, 255, 255, 0.5), inset 0 0 10px rgba(0, 0, 0, 0.2)`,
                      containerType: 'inline-size'
                    }}
                  >
                    {/* Coordinate Label */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                      <span
                        className="font-black text-white/40 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] transition-opacity group-hover:opacity-100"
                        style={{ fontSize: 'clamp(6px, 35cqw, 24px)' }}
                      >
                        {String.fromCharCode(65 + y)}{x + 1}
                      </span>
                    </div>

                    {/* Guess marker avatars */}
                    {guessersPlayers.length > 0 && (
                      <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-0.5 p-0.5 z-40 pointer-events-none">
                        {guessersPlayers.map((p: any, i) => {
                          const originalIndex = room.players.findIndex((player: any) => player.id === p.id);
                          const avatarIndex = (originalIndex % 8) + 1;
                          return (
                            <img
                              key={p.id || i}
                              src={`/avatars/${avatarIndex}.png`}
                              alt={p.name}
                              title={p.name}
                              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover border-[1.5px] border-white shadow-[0_0_10px_rgba(0,0,0,1)] pointer-events-auto transition-transform hover:scale-150"
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ))}

            {/* Scoring Overlays */}
            {gameState.phase === 'SCORE_PHASE' && gameState.targetColor && (() => {
              const tCol = gameState.targetColor.x + 2;
              const tRow = gameState.targetColor.y + 2;
              const b3sC = Math.max(2, tCol - 1), b3eC = Math.min(xMax + 2, tCol + 2);
              const b3sR = Math.max(2, tRow - 1), b3eR = Math.min(yMax + 2, tRow + 2);
              const b5sC = Math.max(2, tCol - 2), b5eC = Math.min(xMax + 2, tCol + 3);
              const b5sR = Math.max(2, tRow - 2), b5eR = Math.min(yMax + 2, tRow + 3);

              return (
                <>
                  <div
                    className="rounded-md z-30 pointer-events-none relative transition-all duration-500"
                    style={{
                      gridColumn: `${b5sC} / ${b5eC}`,
                      gridRow: `${b5sR} / ${b5eR}`,
                      background: 'rgba(34, 211, 238, 0.1)',
                      outline: '2px dashed rgba(34, 211, 238, 0.8)',
                      outlineOffset: '-2px',
                      boxShadow: 'inset 0 0 15px rgba(34, 211, 238, 0.2), 0 0 15px rgba(34, 211, 238, 0.4)'
                    }}
                  >
                    <div className="absolute -top-[14px] right-2 bg-[#070b1a]/15 text-cyan-400 font-bold px-2 py-0.5 rounded-t-lg rounded-bl-lg rounded-br-none text-[9px] md:text-[10px] border border-cyan-500/50 backdrop-blur-md shadow-lg">+1</div>
                  </div>
                  <div
                    className="rounded-md z-40 pointer-events-none relative transition-all duration-500"
                    style={{
                      gridColumn: `${b3sC} / ${b3eC}`,
                      gridRow: `${b3sR} / ${b3eR}`,
                      background: 'rgba(232, 121, 249, 0.15)',
                      outline: '3.5px solid rgba(255, 255, 255, 0.95)',
                      outlineOffset: '-3.5px',
                      boxShadow: 'inset 0 0 20px rgba(232, 121, 249, 0.5), 0 0 30px rgba(232, 121, 249, 0.7)'
                    }}
                  >
                    <div className="absolute -top-[16px] right-4 bg-white/5 text-fuchsia-700 font-black px-2.5 md:px-3 py-0.5 rounded-t-xl rounded-bl-xl rounded-br-none text-[10px] md:text-xs tracking-wider backdrop-blur-md shadow-lg">+2</div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* YOUR TURN instruction bar */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl py-3 px-6 text-center shadow-lg">
          <div className="font-bold text-white text-sm tracking-wide">
            {gameState.phase === 'CLUE_PHASE' && iAmTarget && "YOUR TURN:"}
            {gameState.phase === 'CLUE_PHASE' && !iAmTarget && `${currentGiver.name}'s turn`}
            {gameState.phase === 'GUESS_PHASE' && !iAmTarget && "YOUR TURN:"}
            {gameState.phase === 'GUESS_PHASE' && iAmTarget && "Waiting for guesses..."}
            {gameState.phase === 'SCORE_PHASE' && "ROUND RESULTS"}
          </div>
          <div className="text-zinc-400 text-xs mt-0.5">
            {gameState.phase === 'CLUE_PHASE' && iAmTarget && "Type a clue below to describe your target color."}
            {gameState.phase === 'CLUE_PHASE' && !iAmTarget && "Waiting for a clue to be given..."}
            {gameState.phase === 'GUESS_PHASE' && !iAmTarget && "Select a color to find a match, then submit your guess."}
            {gameState.phase === 'GUESS_PHASE' && iAmTarget && "Other players are guessing your color..."}
            {gameState.phase === 'SCORE_PHASE' && "Review the results, then end the turn."}
          </div>
        </div>

        {/* Bottom Control Buttons Row */}
        <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-3 mt-1 w-full max-w-full">
          {/* Clue Input (only for clue giver during CLUE_PHASE) */}
          {gameState.phase === 'CLUE_PHASE' && iAmTarget && (
            <form onSubmit={handleClueSubmit} className="flex flex-row flex-wrap items-center justify-center gap-2 lg:gap-3 w-full sm:w-auto">
              <input
                type="text"
                value={clueInput}
                onChange={e => setClueInput(e.target.value)}
                className="px-4 py-3 rounded-xl bg-black/50 border border-white/20 focus:border-cyan-400 focus:outline-none text-center font-bold text-white placeholder:text-zinc-600 uppercase tracking-widest text-sm w-48 shadow-inner"
                placeholder="CLUE..."
                maxLength={15}
              />
              <button
                type="submit"
                disabled={!clueInput}
                className="px-6 py-3 border border-emerald-500/60 text-emerald-400 bg-emerald-500/10 rounded-xl font-extrabold tracking-[0.15em] transition-all duration-200 hover:bg-emerald-500/20 hover:scale-105 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] disabled:opacity-40 text-sm whitespace-nowrap shadow-[0_0_10px_rgba(52,211,153,0.15)]"
              >
                GIVE CLUE
              </button>
            </form>
          )}

          <button
            onClick={confirmGuess}
            disabled={gameState.phase !== 'GUESS_PHASE' || iAmTarget || gameState.guesses[localPlayerId] || !selectedLocation}
            className="px-6 py-3 border border-emerald-400/70 text-emerald-300 bg-emerald-500/15 rounded-xl font-extrabold tracking-[0.15em] transition-all duration-200 hover:bg-emerald-500/30 hover:scale-105 hover:shadow-[0_0_20px_rgba(52,211,153,0.5)] disabled:opacity-25 disabled:hover:scale-100 text-sm whitespace-nowrap shadow-[0_0_10px_rgba(52,211,153,0.15)]"
          >
            SUBMIT GUESS
          </button>

          <button
            onClick={handleNextTurn}
            disabled={gameState.phase !== 'SCORE_PHASE' || (!isHost && !iAmTarget)}
            className="px-6 py-3 border border-rose-500/70 text-rose-400 bg-rose-500/10 rounded-xl font-extrabold tracking-[0.15em] transition-all duration-200 hover:bg-rose-500/25 hover:scale-105 hover:shadow-[0_0_20px_rgba(244,63,94,0.5)] disabled:opacity-25 disabled:hover:scale-100 text-sm whitespace-nowrap shadow-[0_0_10px_rgba(244,63,94,0.15)]"
          >
            END TURN
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Game Chat + Game Log */}
      <div className="hidden lg:flex w-[240px] flex-col gap-4">

        {/* Game Chat */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-[20px] shadow-2xl flex-1 flex flex-col relative overflow-hidden">
          <h3 className="font-bold text-[15px] text-white mb-4 relative z-10 tracking-wide">Game Chat</h3>

          <div className="flex-1 overflow-y-auto space-y-3 text-[13px] font-medium text-zinc-300 mb-3 pr-1 custom-scrollbar relative z-10">
            {room.chat && room.chat.map((msg: any, i: number) => (
              <div key={i}>
                <span className={msg.playerId === 'system' ? "text-fuchsia-400 font-bold" : (msg.playerId === localPlayerId ? "text-amber-400 font-bold" : "text-cyan-400 font-bold")}>
                  {msg.name}:
                </span>{' '}
                <span className={msg.playerId === 'system' ? "" : "text-white"}>{msg.message}</span>
              </div>
            ))}
            {(!room.chat || room.chat.length === 0) && (
              <div className="text-zinc-500 italic">No messages yet...</div>
            )}
          </div>

          {/* Chat Input */}
          <div className="relative z-10">
            <form onSubmit={handleSendChat} className="flex gap-2">
              <input 
                type="text" 
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                placeholder="Type a message..." 
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-300 shadow-inner focus:outline-none focus:border-cyan-400/50 placeholder:text-zinc-600" 
                maxLength={100}
              />
              <button 
                type="submit" 
                disabled={!chatMessage.trim()} 
                className="px-3 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors rounded-xl text-zinc-300 text-xs font-bold disabled:opacity-50"
              >
                ▶
              </button>
            </form>
          </div>
        </div>

        {/* Game Log */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-[20px] shadow-2xl flex-1 flex flex-col relative overflow-hidden">
          <h3 className="font-bold text-[15px] text-white mb-4 relative z-10 tracking-wide flex items-center gap-2">
            <ScrollText size={14} className="text-zinc-400" /> Game Log
          </h3>

          <div className="flex-1 overflow-y-auto space-y-2.5 text-[12px] font-medium text-zinc-400 pr-1 custom-scrollbar relative z-10">
            <div><span className="text-cyan-400 font-bold">{currentGiver.name}</span> gave a clue: <span className="text-white">"{gameState.clue || '...'}"</span></div>
            {gameState.phase === 'GUESS_PHASE' && (
              <div className="text-zinc-500">Players are submitting guesses...</div>
            )}
            {gameState.phase === 'SCORE_PHASE' && Object.keys(gameState.guesses).map(pid => {
              const p = room.players.find((pl: any) => pl.id === pid);
              return (
                <div key={pid}>
                  <span className="text-fuchsia-400 font-bold">{p?.name}</span> guessed <span className="text-emerald-400">{getCellColor(gameState.guesses[pid].x, gameState.guesses[pid].y)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
