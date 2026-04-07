"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Palette, Moon, Sun, MonitorPlay } from "lucide-react";
import { apiAction, getPlayerId } from "@/lib/api";
import { useTheme } from "@/components/ThemeProvider";

export default function MainMenu() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (mode: 'create'|'join') => {
    if (!name.trim()) return setError("Please enter your name!");
    if (mode === 'join' && !roomCode.trim()) return setError("Please enter a room code!");
    
    setIsLoading(true);
    setError("");

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500 p-4">
      
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/20 blur-[120px] pointer-events-none" />

      {/* Theme Toggle */}
      <button 
        onClick={toggleTheme} 
        className="absolute top-6 right-6 p-3 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 hover:scale-105 transition-all z-50 text-zinc-700 dark:text-zinc-300 shadow-sm"
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Main Card */}
      <div className="w-full max-w-md p-8 rounded-3xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl relative z-10 transition-all duration-300 hover:shadow-cyan-500/5">
        
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden shadow-2xl mb-6 shadow-cyan-500/30 border border-white/20 hover:scale-105 transition-all">
            <img src="/logo.png" alt="HueMind Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-cyan-500">
            HueMind
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            A real-time multiplayer color guessing game.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium text-center border border-red-200 dark:border-red-500/20">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 ml-1">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              className="w-full px-5 py-3 rounded-2xl bg-white/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
              placeholder="Enter your alias"
              maxLength={16}
            />
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent my-6" />

          <button
            onClick={() => handleAction('create')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all focus:ring-2 focus:ring-zinc-900/20 active:scale-[0.98] disabled:opacity-50"
          >
            <MonitorPlay size={18} />
            {isLoading ? "Connecting..." : "Create New Room"}
          </button>

          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-x-0 h-px bg-zinc-200 dark:bg-zinc-800" />
            <span className="relative px-4 text-xs font-medium uppercase tracking-wider text-zinc-400 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-full">
              Or join existing
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => {
                setRoomCode(e.target.value.toUpperCase());
                setError("");
              }}
              className="flex-1 px-5 py-3 rounded-2xl bg-white/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all font-bold text-center tracking-widest text-zinc-900 dark:text-zinc-100 placeholder:font-normal placeholder:tracking-normal placeholder:text-zinc-400 uppercase"
              placeholder="CODE"
              maxLength={4}
            />
            <button
              onClick={() => handleAction('join')}
              disabled={isLoading || roomCode.length !== 4}
              className="px-6 py-3 rounded-2xl bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-semibold transition-all focus:ring-2 focus:ring-fuchsia-500/50 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              Join
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
