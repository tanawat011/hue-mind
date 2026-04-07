"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiAction, getPlayerId } from "@/lib/api";
import { Users, Play, LogOut, Loader2, X, Sparkles } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { GameBoard } from "@/components/GameBoard";

export default function RoomPage() {
  const params = useParams();
  const code = params?.code as string;
  const router = useRouter();
  const { theme } = useTheme();
  
  const [room, setRoom] = useState<any>(null);
  const [localPlayerId, setLocalPlayerId] = useState<string>("");
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Lobby Settings
  const [useTimer, setUseTimer] = useState<boolean>(false);
  const [timerDuration, setTimerDuration] = useState<number>(30);
  const [roundsCount, setRoundsCount] = useState<number>(2);
  const [botDifficulty, setBotDifficulty] = useState<string>("Medium");
  const [allowDuplicateGuesses, setAllowDuplicateGuesses] = useState<boolean>(false);
  const [boardSizePreset, setBoardSizePreset] = useState<string>("Large");

  useEffect(() => {
    const playerId = getPlayerId();
    if (!playerId) {
      router.push("/");
      return;
    }
    setLocalPlayerId(playerId);

    apiAction("getRoomState", { roomCode: code }).then((res: any) => {
      if (res.success) {
        setRoom(res.room);
      } else {
        router.push("/");
      }
    });

    const eventSource = new EventSource(`/api/stream?code=${code}&playerId=${playerId}`);
    
    eventSource.onmessage = (event) => {
      const data = event.data;
      if (data && data !== ':') {
        setRoom(JSON.parse(data));
      }
    };

    return () => {
      eventSource.close();
    };
  }, [code, router]);

  const handleStartGame = () => {
    let boardSize = { x: 30, y: 16 };
    if (boardSizePreset === 'Very Small') boardSize = { x: 10, y: 6 };
    else if (boardSizePreset === 'Small') boardSize = { x: 15, y: 8 };
    else if (boardSizePreset === 'Medium') boardSize = { x: 20, y: 12 };
    
    apiAction("startGame", { roomCode: code, settings: { botDifficulty, allowDuplicateGuesses, boardSize, useTimer, timerDuration, roundsCount } });
  };

  const leaveRoom = () => {
    router.push("/");
  };

  if (!room) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-锌-50">
        <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500" />
      </div>
    );
  }

  const me = room.players.find((p: any) => p.id === localPlayerId);
  const isHost = me?.isHost;

  return (
    <div className="flex flex-col min-h-screen bg-[#070b1a] overflow-hidden relative p-4 font-sans text-zinc-100">
      {/* Background neon bokeh orbs */}
      
      {/* Top Left Group */}
      <div className="fixed top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#00e5ff] opacity-[0.25] blur-[30px] mix-blend-screen pointer-events-none" />
      <div className="fixed top-[5%] left-[8%] w-[180px] h-[180px] rounded-full bg-[#00e5ff] opacity-[0.6] blur-[15px] mix-blend-screen pointer-events-none" />
      <div className="fixed top-[20%] left-[2%] w-[100px] h-[100px] rounded-full bg-[#ff00a0] opacity-[0.8] blur-[8px] mix-blend-screen pointer-events-none" />
      <div className="fixed top-[35%] left-[12%] w-[120px] h-[120px] rounded-full bg-[#0044ff] opacity-[0.7] blur-[12px] mix-blend-screen pointer-events-none" />
      <div className="fixed top-[15%] left-[22%] w-[80px] h-[80px] rounded-full bg-[#ff00a0] opacity-[0.9] blur-[6px] mix-blend-screen pointer-events-none" />

      {/* Top Center-Right Group */}
      <div className="fixed top-[12%] right-[25%] w-[140px] h-[140px] rounded-full bg-[#ff00ff] opacity-[0.85] blur-[12px] mix-blend-screen pointer-events-none" />
      <div className="fixed top-[-5%] right-[5%] w-[450px] h-[450px] rounded-full bg-[#0044ff] opacity-[0.4] blur-[35px] mix-blend-screen pointer-events-none" />
      <div className="fixed top-[20%] right-[8%] w-[90px] h-[90px] rounded-full bg-[#00e5ff] opacity-[0.9] blur-[8px] mix-blend-screen pointer-events-none" />
      <div className="fixed top-[32%] right-[18%] w-[110px] h-[110px] rounded-full bg-[#ff00a0] opacity-[0.8] blur-[10px] mix-blend-screen pointer-events-none" />

      {/* Middle Group */}
      <div className="fixed top-[45%] right-[12%] w-[180px] h-[180px] rounded-full bg-[#00e5ff] opacity-[0.6] blur-[15px] mix-blend-screen pointer-events-none" />
      <div className="fixed top-[55%] left-[5%] w-[140px] h-[140px] rounded-full bg-[#ff00ff] opacity-[0.7] blur-[12px] mix-blend-screen pointer-events-none" />
      
      {/* Bottom Left Group (Cyan Ring & Scatter) */}
      <div className="fixed bottom-[-15%] left-[-15%] w-[700px] h-[700px] rounded-full border-[60px] border-[#00e5ff] opacity-[0.5] blur-[25px] mix-blend-screen pointer-events-none" />
      <div className="fixed bottom-[15%] left-[20%] w-[100px] h-[100px] rounded-full bg-[#ff00a0] opacity-[0.8] blur-[8px] mix-blend-screen pointer-events-none" />
      <div className="fixed bottom-[8%] left-[8%] w-[150px] h-[150px] rounded-full bg-[#00e5ff] opacity-[0.7] blur-[12px] mix-blend-screen pointer-events-none" />
      <div className="fixed bottom-[30%] left-[12%] w-[80px] h-[80px] rounded-full bg-[#ff00ff] opacity-[0.9] blur-[5px] mix-blend-screen pointer-events-none" />

      {/* Bottom Right Group (Magenta Ring & Scatter) */}
      <div className="fixed bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full border-[80px] border-[#ff00a0] opacity-[0.5] blur-[30px] mix-blend-screen pointer-events-none" />
      <div className="fixed bottom-[20%] right-[28%] w-[120px] h-[120px] rounded-full bg-[#00e5ff] opacity-[0.9] blur-[10px] mix-blend-screen pointer-events-none z-0" />
      <div className="fixed bottom-[8%] right-[15%] w-[90px] h-[90px] rounded-full bg-[#ff00ff] opacity-[0.85] blur-[6px] mix-blend-screen pointer-events-none z-0" />
      <div className="fixed bottom-[35%] right-[5%] w-[140px] h-[140px] rounded-full bg-[#0044ff] opacity-[0.7] blur-[12px] mix-blend-screen pointer-events-none z-0" />
      
      {/* Center Bottom Sub-layer */}
      <div className="fixed bottom-[-5%] left-[40%] w-[400px] h-[400px] rounded-full bg-[#7000ff] opacity-[0.35] blur-[35px] mix-blend-screen pointer-events-none" />
      <div className="fixed bottom-[15%] left-[45%] w-[90px] h-[90px] rounded-full bg-[#ff00a0] opacity-[0.8] blur-[8px] mix-blend-screen pointer-events-none" />

      {/* Top Bar */}
      <div className="w-full max-w-[1400px] mx-auto lg:mt-2 flex flex-col md:flex-row items-center justify-between gap-3 relative z-20">
        {/* Left: Title */}
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="HueMind Logo" className="w-10 h-10 md:w-12 md:h-12 rounded-[10px] shadow-[0_0_15px_rgba(232,121,249,0.3)] select-none pointer-events-none" />
          <h1 className="text-3xl md:text-4xl font-black italic tracking-[0.08em] text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] select-none">
            HUEMIND
          </h1>
        </div>

        {/* Right: Status badges */}
        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3">
          {room.state === 'PLAYING' && room.gameState && (
            <div className="flex items-center gap-1.5 md:gap-2 bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-full px-3 md:px-4 py-1.5 shadow-lg shrink-0">
              <span className="text-zinc-400 text-[10px] md:text-xs font-bold hidden sm:inline">GAME</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span className="text-white font-black text-xs md:text-sm">{room.gameState.round}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 md:gap-2 bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-full px-3 md:px-4 py-1.5 shadow-lg shrink-0">
            <Users size={14} className="text-zinc-400" />
            <span className="text-white font-bold text-xs md:text-sm">{room.players.length}</span>
          </div>
          <button onClick={() => setShowGuide(true)} className="flex items-center justify-center bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-full px-3 md:px-4 py-1.5 text-zinc-300 text-[10px] md:text-xs font-bold hover:text-cyan-300 hover:border-cyan-500/30 transition-all shadow-lg shrink-0">
            <span className="hidden sm:inline">How to Play</span>
            <span className="sm:hidden">? Guide</span>
          </button>
          <button onClick={leaveRoom} className="text-red-400 hover:text-red-300 transition text-[10px] md:text-sm flex items-center justify-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-full px-3 md:px-4 py-1.5 shadow-lg shrink-0">
            <LogOut size={14}/> <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>

      <main className="w-full h-full max-w-[1400px] mx-auto relative z-10 flex flex-col flex-1 py-3 lg:py-4">

        {room.state === 'LOBBY' && (
          <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            <div className="p-8 rounded-[32px] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-linear-to-b from-cyan-500/5 to-transparent pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-3">
                  <Users className="text-cyan-400" />
                  <h2 className="text-xl font-bold tracking-widest text-white uppercase">Players ({room.players.length}/8)</h2>
                </div>
                {isHost && (
                  <button 
                    onClick={() => apiAction("addBot", { roomCode: code })}
                    className="px-4 py-2 text-xs font-black text-cyan-950 uppercase tracking-widest bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                  >
                    + Add Bot
                  </button>
                )}
              </div>
              
              <ul className="space-y-3 relative z-10">
                {room.players.map((p: any) => (
                  <li 
                    key={p.id} 
                    className={`flex items-center justify-between p-4 rounded-2xl border ${p.id === localPlayerId ? 'bg-fuchsia-500/20 border-fuchsia-500/50 shadow-[0_0_15px_rgba(232,121,249,0.2)]' : 'bg-black/30 border-white/5'}`}
                  >
                    <span className="font-bold text-lg">{p.name} {p.id === localPlayerId && <span className="text-fuchsia-400 text-xs block -mt-1 leading-none uppercase tracking-widest">You</span>}</span>
                    {p.isHost && (
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-cyan-500 text-cyan-950 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                        Host
                      </span>
                    )}
                  </li>
                ))}
                {room.players.length < 2 && (
                  <li className="p-4 text-center text-sm font-bold tracking-widest uppercase text-zinc-500 border border-dashed rounded-2xl border-white/10 bg-white/5">
                    Waiting for players...
                  </li>
                )}
              </ul>
            </div>

            <div className="flex flex-col justify-center items-center p-8 rounded-[32px] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-linear-to-t from-fuchsia-500/5 to-transparent pointer-events-none" />
              
              <div className="text-center mb-8 relative z-10 w-full max-w-sm">
                <h3 className="text-3xl font-black uppercase tracking-widest mb-2 text-white">Ready?</h3>
                <p className="text-zinc-400 mb-6 text-sm">
                  {isHost 
                    ? "As the host, start the match when ready."
                    : "Waiting for the host to begin."}
                </p>

                {isHost && (
                  <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-4 text-left backdrop-blur-sm mb-6">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Rounds (รอบตาเล่น)</label>
                      <select 
                        value={roundsCount} 
                        onChange={(e) => setRoundsCount(Number(e.target.value))}
                        className="bg-zinc-800 text-sm text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 transition-colors"
                      >
                        <option value={1}>1 รอบ (เร็วๆ เล่นไว)</option>
                        <option value={2}>2 รอบ (มาตรฐาน)</option>
                        <option value={3}>3 รอบ (เล่นยาวหน่อย)</option>
                        <option value={4}>4 รอบ (เล่นให้จุใจ)</option>
                        <option value={5}>5 รอบ (มาราธอน)</option>
                        <option value={6}>6 รอบ</option>
                        <option value={7}>7 รอบ</option>
                        <option value={8}>8 รอบ</option>
                        <option value={9}>9 รอบ</option>
                        <option value={10}>10 รอบ (โคตรโหด)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Grid Size</label>
                      <select 
                        value={boardSizePreset} 
                        onChange={(e) => setBoardSizePreset(e.target.value)}
                        className="bg-zinc-800 text-sm text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 transition-colors"
                      >
                        <option value="Very Small">เล็กมาก (10 x 6)</option>
                        <option value="Small">เล็ก (15 x 8)</option>
                        <option value="Medium">กลาง (20 x 12)</option>
                        <option value="Large">ใหญ่/ปกติ (30 x 16)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Bot Difficulty</label>
                      <select 
                        value={botDifficulty} 
                        onChange={(e) => setBotDifficulty(e.target.value)}
                        className="bg-zinc-800 text-sm text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 transition-colors"
                      >
                        <option value="Easy">ง่าย (Easy)</option>
                        <option value="Medium">ปานกลาง (Medium)</option>
                        <option value="Hard">ยาก (Hard)</option>
                        <option value="Very Hard">ยากมาก (Very Hard)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Allow Same Color Guess</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={allowDuplicateGuesses} onChange={(e) => setAllowDuplicateGuesses(e.target.checked)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                      </label>
                    </div>

                    <div className="pt-2 border-t border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Enable Turn Timer</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={useTimer} onChange={(e) => setUseTimer(e.target.checked)} className="sr-only peer" />
                          <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-fuchsia-500"></div>
                        </label>
                      </div>

                      {useTimer && (
                        <div className="flex flex-col gap-1 fade-in">
                          <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Timer Duration (Seconds)</label>
                          <select 
                            value={timerDuration} 
                            onChange={(e) => setTimerDuration(Number(e.target.value))}
                            className="bg-zinc-800 text-sm text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-fuchsia-500 transition-colors"
                          >
                            <option value={15}>15 วิ (เร็วมาก)</option>
                            <option value={30}>30 วิ (มาตรฐาน)</option>
                            <option value={45}>45 วิ (นาน)</option>
                            <option value={60}>60 วิ (ชิลๆ)</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {isHost ? (
                <button
                  onClick={handleStartGame}
                  disabled={room.players.length < 2}
                  className="relative z-10 flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white font-black text-lg uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_0_30px_rgba(232,121,249,0.4)] disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
                >
                  <Play fill="currentColor" size={20} />
                  Start Match
                </button>
              ) : (
                <div className="relative z-10 flex items-center gap-3 text-fuchsia-400 font-bold uppercase tracking-widest text-sm bg-fuchsia-500/10 px-6 py-3 rounded-full border border-fuchsia-500/20">
                  <Loader2 className="animate-spin" size={16} />
                  Waiting...
                </div>
              )}
            </div>
          </div>
        )}

        {room.state === 'PLAYING' && (
          <div className="flex-1 w-full flex justify-center items-center h-full mt-4">
             <GameBoard room={room} localPlayerId={localPlayerId} />
          </div>
        )}

        {room.state === 'FINISHED' && (
          <div className="flex-1 w-full flex justify-center items-center h-full">
            <div className="max-w-xl w-full p-10 rounded-[32px] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl text-center relative overflow-hidden">
               <div className="absolute inset-0 bg-linear-to-b from-fuchsia-500/10 to-transparent pointer-events-none" />
               <h2 className="text-4xl font-black uppercase tracking-widest text-white mb-8 drop-shadow-md">Match Finished</h2>
               
               <div className="space-y-4 mb-10 relative z-10">
                 {(() => {
                    const sortedPlayers = [...room.players].sort((a:any,b:any) => b.score - a.score);
                    return sortedPlayers.map((p:any, idx:number) => (
                      <div key={p.id} className={`flex items-center justify-between p-5 rounded-2xl border ${idx === 0 ? 'bg-fuchsia-500/30 border-fuchsia-400 shadow-[0_0_20px_rgba(232,121,249,0.3)] scale-105 transform' : 'bg-black/30 border-white/5'}`}>
                        <div className="flex items-center gap-4">
                           <span className="text-2xl font-black text-fuchsia-400">#{idx + 1}</span>
                           <span className="font-bold text-xl text-white">{p.name} {p.id === localPlayerId && "(You)"}</span>
                        </div>
                        <span className="text-3xl font-black text-white">{p.score} <span className="text-sm text-zinc-400 uppercase tracking-widest">pts</span></span>
                      </div>
                    ))
                 })()}
               </div>

               {isHost ? (
                 <button 
                   onClick={() => apiAction("returnToLobby", { roomCode: room.code })}
                   className="relative z-10 w-full py-4 rounded-2xl bg-linear-to-r from-fuchsia-500 to-cyan-500 text-white font-black text-lg uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_0_30px_rgba(232,121,249,0.4)]"
                 >
                   Return to Lobby
                 </button>
               ) : (
                 <div className="text-zinc-400 font-bold uppercase tracking-widest animate-pulse">
                   Waiting for host to restart...
                 </div>
               )}
            </div>
          </div>
        )}
      </main>

      {/* Guide Modal Overlay */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl">
           <div className="relative w-full max-w-2xl bg-[#0a0f25] border border-white/20 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden p-8 animate-in fade-in zoom-in-95 duration-200">
              <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-linear-to-bl from-cyan-500/20 to-transparent pointer-events-none rounded-full blur-3xl" />
              <button onClick={() => setShowGuide(false)} className="absolute top-6 right-6 z-20 text-zinc-400 hover:text-white transition cursor-pointer">
                 <X size={24} />
              </button>
              
              <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3 relative z-10">
                 <Sparkles className="text-fuchsia-400" /> How to Play
              </h2>
              
              <div className="space-y-6 text-zinc-300 text-sm md:text-base pr-4 max-h-[60vh] overflow-y-auto custom-scrollbar relative z-10">
                 <div>
                    <h3 className="font-bold text-cyan-400 mb-1 uppercase tracking-wider">The Goal</h3>
                    <p>HueMind is a color guessing game. Players take turns giving 1-2 word clues for a specific color on the board, while everyone else tries to guess the exact hue!</p>
                 </div>
                 
                 <div>
                    <h3 className="font-bold text-cyan-400 mb-1 uppercase tracking-wider">1. Clue Phase</h3>
                    <p>The "Clue Giver" will see a target color. They must enter a 1-2 word hint that describes this color (e.g., "Apple", "Deep Ocean", "Sunset") to help others guess it.</p>
                 </div>
                 
                 <div>
                    <h3 className="font-bold text-cyan-400 mb-1 uppercase tracking-wider">2. Guess Phase</h3>
                    <p>All other players will search the board and select the color they think matches the clue. Click any tile to test it, and press "SUBMIT GUESS" to lock it in.</p>
                 </div>

                 <div>
                    <h3 className="font-bold text-cyan-400 mb-1 uppercase tracking-wider">3. Scoring Phase</h3>
                    <p>Points are awarded based on proximity to the real target color:</p>
                    <ul className="list-disc ml-5 mt-2 space-y-2">
                      <li><strong className="text-white">+3 pts (Exact Match):</strong> You nailed it! The Clue Giver also gets +1 pt.</li>
                      <li><strong className="text-white">+2 pts (Inner Ring):</strong> You guessed in the 3x3 square immediately surrounding the color.</li>
                      <li><strong className="text-white">+1 pt (Outer Ring):</strong> You guessed in the 5x5 square outer ring.</li>
                    </ul>
                 </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10 flex justify-end relative z-10">
                <button onClick={() => setShowGuide(false)} className="px-8 py-3 rounded-xl bg-linear-to-r from-fuchsia-500 to-cyan-500 text-white font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                   Got it!
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
