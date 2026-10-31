# Huling Kapsula — Frontend Client

The official client application for **Huling Kapsula**, a 2D top-down bio-defense survival arcade game built in React 19 and Vite. Deployed inside a compromised biological host, you pilot an experimental microscopic capsule fighting waves of mutating bacterial and viral entities.

---

## 1. Game Premise & Features

- **Microscopic Combat:** Navigate through vascular corridors while defending against escalating swarms of bacteria.
- **Custom HTML5 Canvas Engine:** Custom 60 FPS rendering pipeline featuring dynamic particle bursts, camera tracking, screen shake, and sensor-based steering AI for pathfinding.
- **Synthesized Audio Engine:** Built using the Web Audio API with zero external audio assets for real-time sound effects (laser pops, low-frequency heartbeat warnings, cell division squelches, and death drones).
- **Dynamic Leaderboard:** Real-time top survivor tracking featuring custom badges for Gold, Silver, and Bronze rankings.
- **Role-Based Workflows:** Distinct gameplay loops for registered players alongside an administrative moderation dashboard for managing users and records.
- **Ephemeral Admin Sessions:** Enforces transient in-memory authentication for administrators, clearing session privileges on browser tab refresh or window closure.

---

## 2. Tech Stack

- **Framework & Build:** React 19 (`^19.0.0`), Vite (`^8.3.4`)
- **Routing:** React Router DOM 7 (`^7.18.4`)
- **State & Context:** React Context (`AuthContext`) with modular token management
- **Rendering & Animation:** Native HTML5 2D Canvas API
- **Audio:** Web Audio API (`AudioContext`, custom oscillators, and biquad noise filters)
- **Styling:** Custom CSS featuring an industrial containment UI theme

---

## 3. Game Controls & Mechanics

| Action | Control Key | Description |
| :--- | :---: | :--- |
| **Movement** | `W`, `A`, `S`, `D` | Omnidirectional navigation with directional momentum |
| **Discharge** | `Spacebar` | Fires antibiotic projectiles in the facing direction |
| **Tactical Pause** | `Esc` | Freezes the game canvas loop and presents menu options |
| **Audio Toggle** | HUD Button | Toggles master sound on or off |

### Hostile Entity Intel
- **Fast (`Yellow`):** Nimble, low-health chasers.
- **Tank (`Purple`):** High durability, heavier collision impact, emits audible low thuds.
- **Splitter (`Green`):** Mitotic enemies that divide into two smaller entities when destroyed.
- **Worm (`Blue`):** Serpentine pathogens with wavy locomotion and squirm audio cues.

---

## 4. Key Screens & Architecture

```text
├── src/
│   ├── api/                  # Modular fetch clients (authApi, scoreApi, adminApi)
│   ├── components/           # Navbar, ConfirmModal, UI components
│   ├── context/              # AuthContext handling player persistence & ephemeral admin state
│   ├── game/
│   │   ├── constants.js      # Player specs, enemy types, maps, & world bounds
│   │   ├── engine.js         # Game loop, steering AI, collisions, & canvas drawing
│   │   ├── GameCanvas.jsx    # React canvas lifecycle bridge
│   │   └── sound.js          # Procedural Web Audio synthesizer
│   ├── pages/
│   │   ├── Admin.jsx         # User & score moderation table with live search filters
│   │   ├── Game.jsx          # Gameplay orchestration, overlays, & score submission
│   │   ├── LandingPage.jsx   # Bio-defense briefing with live server ping
│   │   ├── Leaderboard.jsx   # Global Top 10 rankings with pagination
│   │   ├── Login.jsx         # Credential authentication
│   │   ├── Menu.jsx          # Personal high score summary & mission deployment
│   │   └── Register.jsx      # New agent creation
│   ├── App.jsx               # Route declarations and Protected route wrappers
│   └── main.jsx              # React root mount

```

---

## 5. Environment Configuration

Create a `.env` file in the frontend root using `env.example`:

```bash
cp env.example .env

```

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_URL` | Base URL pointing to the running backend service (without a trailing slash)

| `http://localhost:5000`

|

---

## 6. Local Installation & Scripts

### Prerequisites

* Node.js (v18+ or v20+)


* Running backend service instance



### Setup

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview local production build
npm run preview

# 5. Run ESLint code checks
npm run lint

```

---

## 7. Deployment Configuration

This client is configured for single-page application (SPA) routing on **Vercel** via `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}

```
