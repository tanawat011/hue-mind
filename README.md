<div align="center">
  <img src="public/opengraph-image.png" alt="HueMind Cyberpunk Board Game" width="100%" style="border-radius:20px; box-shadow: 0 0 40px rgba(232,121,249,0.3)"/>
</div>

<h1 align="center" style="color: #e879f9; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 900;">HUE MIND 🧠</h1>

<p align="center">
  <em>Decode the spectrum. Read their minds. Win the grid.</em><br>
  A high-fidelity, cyberpunk-themed implementation of the classic color-guessing board game.
</p>

---

## ⚡ ABOUT THE GAME

**HueMind** is a multiplayer deductive game set in a futuristic neural-grid aesthetic. Players take turns acting as the **"Clue Giver"**, providing a 1-to-2 word clue representing a specific color tile on a massive chromodynamic grid. The rest of the players are **"Guessers"**, dropping locators onto the board to hone in on the target.

With brutal Server-Authoritative timers, competitive scoring mechanics, and a strict 8-player room capacity, HueMind pushes color-theory intuition to its absolute limits.

## 🔥 GOD-TIER FEATURES

* 🎨 **Cyberpunk Glassmorphism UI**: High-impact visuals using pure CSS dropshadows, backdrop filters, and neon gradients (Fuchsia & Cyan).
* ⏱️ **Adrenaline Timer System**: Configurable host timeouts (15s to 60s) with auto-forfeiture to speed up game flow.
* 🤖 **Deterministic AI Avatars**: Automatic non-colliding avatar assignment for up to 8 real or AI participants. Advanced pathfinding logic for 4 bot difficulties (*Easy* to *Very Hard*).
* 📡 **Zero-Latency State Sync**: Powered by Server-Sent Events (SSE) instead of bloated WebSockets, enabling instant state propagation.
* 📱 **Flawless Mobile Engine**: Responsive horizontally-scrolling player rosters and fluid phase-action button bars constructed specifically for mobile vertical orientations.

## 🛠️ THE ARCHITECTURE

HueMind is meticulously engineered to squeeze maximum performance out of the modern web stack.

* **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
* **Runtime**: [Bun](https://bun.sh/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
* **State Delivery**: Server-Sent Events (SSE) API Endpoints
* **Assets**: In-browser vector computations combined with `.webp`/`.png` static deliverables.

---

## 🚀 BOOTUP SEQUENCE (LOCAL DEV)

Ensure your system is running `Bun` or `Node.js >= 18`.

```bash
# 1. Install dependencies footprint
npm install
# or
bun install

# 2. Boot the Next.js development server
npm run dev
# or 
bun run dev

# 3. Access the Mainframe
# Open http://localhost:3000
```

## 🎮 HOSTING A MATCH
1. Hit **CREATE ROOM**.
2. Customize the Room Settings inside the Lobby:
   * **Grid Size**: *Very Small (10x6)* up to *Large (30x16)*
   * **Bot Difficulty**: How sharp the AI perceives colors.
   * **Turn Timer**: Enable for strict deadlines (15s - 60s).
   * **Rounds**: From a 1-Round sprint to a 10-Round marathon.
3. Share the `ROOM CODE` with friends. (Bots can be injected to fill empty slots!).
4. Click **START MATCH** and connect back to the grid.

---
<p align="center">
  System Architecture Finalized. Awaiting Operator Input... 🟦🟪
</p>
