"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MonitorPlay } from "lucide-react";
import { apiAction, getPlayerId } from "@/lib/api";

export default function MainMenu() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem("hueMindAlias");
    if (savedName) setName(savedName);
    
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const codeParam = urlParams.get('code');
      if (codeParam) {
        setRoomCode(codeParam.toUpperCase());
        setError("Please enter your name and click Join to enter the room!");
      }
    }
  }, []);

  const handleAction = async (mode: 'create'|'join') => {
    if (!name.trim()) return setError("Please enter your name!");
    if (mode === 'join' && !roomCode.trim()) return setError("Please enter a room code!");
    
    setIsLoading(true);
    setError("");
    localStorage.setItem("hueMindAlias", name.trim());

    try {
      const playerId = getPlayerId();
      let result;
      
      if (mode === 'create') {
        result = await apiAction('createRoom', { password: null, playerName: name, playerId });
      } else {
        result = await apiAction('joinRoom', { code: roomCode, password: null, playerName: name, playerId });
      }

      setIsLoading(false);
      if (result.success) {
        router.push(`/room/${result.roomCode}`);
      } else {
        setError(result.error || "Failed to join room");
      }
    } catch (err) {
      setError("Network error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-[#050505] p-4 sm:p-6 text-zinc-100 font-sans selection:bg-cyan-500/30">
      
      {/* Cyberpunk Grid Background EXACTLY matching Lobby */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        {/* Background neon bokeh orbs from Lobby */}
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
      </div>

      {/* Main Glassmorphic Card (Matching the Lobby Card) */}
      <div className="w-full max-w-[420px] bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[32px] overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] relative z-10">
        
        {/* Inner glow line exactly like Lobby */}
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />
        
        <div className="p-8 sm:p-10">
          
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] mb-6 border border-white/10 hover:scale-105 transition-transform duration-300">
              <img src="/logo.png" alt="HueMind Logo" className="w-full h-full object-cover" />
            </div>
            {/* Same text gradient as GameBoard "HUES & CUES" logo */}
            <h1 className="text-4xl font-black italic tracking-widest text-transparent bg-clip-text bg-linear-to-br from-white via-zinc-200 to-zinc-500 drop-shadow-lg uppercase">
              Hue<span className="text-transparent bg-clip-text bg-linear-to-br from-cyan-400 to-fuchsia-500">Mind</span>
            </h1>
            <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">
              Neural Grid Protocol
            </p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold ml-1">
                Your Alias
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                className="w-full bg-black/40 text-sm text-white px-5 py-4 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500 focus:bg-white/5 transition-all font-bold tracking-wider placeholder:text-zinc-600/80 placeholder:font-medium"
                placeholder="Enter Display Name"
                maxLength={16}
              />
            </div>

            <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent my-2" />

            <button
              onClick={() => handleAction('create')}
              disabled={isLoading}
              className="w-full relative group overflow-hidden rounded-xl p-[1px] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              <div className="absolute inset-0 bg-linear-to-r from-cyan-500 to-fuchsia-500 rounded-xl opacity-70 group-hover:opacity-100 blur-sm transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-3 bg-zinc-950 px-6 py-4 rounded-xl transition-colors group-hover:bg-zinc-900/90">
                <MonitorPlay className="w-5 h-5 text-cyan-400 group-hover:text-white transition-colors" />
                <span className="font-black text-white tracking-[0.2em] uppercase text-xs sm:text-sm drop-shadow-md">
                  {isLoading ? "BOOTING..." : "CREATE ROOM"}
                </span>
              </div>
            </button>

            <div className="relative flex items-center justify-center py-2">
               <div className="absolute inset-x-0 h-px bg-white/5" />
               <span className="relative px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-[#050505] border border-white/5 rounded-full py-1">
                 Join Link
               </span>
            </div>

            <div className="flex w-full gap-2 overflow-hidden">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase());
                  setError("");
                }}
                className="flex-1 min-w-0 border-box bg-black/40 text-lg text-center font-black tracking-[0.2em] text-white px-2 sm:px-4 py-4 rounded-xl border border-white/10 focus:outline-none focus:border-fuchsia-500 focus:bg-white/5 transition-all placeholder:font-medium placeholder:tracking-widest placeholder:text-zinc-600/80 placeholder:text-xs sm:placeholder:text-sm uppercase"
                placeholder="CODE"
                maxLength={4}
              />
              <button
                onClick={() => handleAction('join')}
                disabled={isLoading || roomCode.length !== 4}
                className="relative group overflow-hidden rounded-xl p-px transition-all hover:scale-[1.05] active:scale-[0.95] disabled:opacity-50 disabled:pointer-events-none shrink-0"
              >
                <div className="absolute inset-0 bg-fuchsia-500 rounded-xl opacity-80 group-hover:opacity-100 blur-sm transition-opacity duration-300" />
                <div className="relative flex items-center justify-center h-full bg-zinc-950 px-4 sm:px-6 rounded-xl transition-colors group-hover:bg-zinc-900/90">
                  <span className="font-black text-white tracking-[0.1em] uppercase text-xs sm:text-sm drop-shadow-md">
                    JOIN
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Credit */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 pointer-events-auto">
        <a 
          href="https://github.com/tanawat011/hue-mind" 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-black/40 border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all group backdrop-blur-xl"
        >
          <svg className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
          <span className="text-[10px] sm:text-xs font-medium text-zinc-400 group-hover:text-white uppercase tracking-widest transition-colors">
            Created by <span className="text-cyan-400 font-black group-hover:text-cyan-300">tanawat011</span>
          </span>
        </a>
      </div>
    </div>
  );
}
