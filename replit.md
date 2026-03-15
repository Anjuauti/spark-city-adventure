# Spark City Adventure

## Project Overview
A React/Vite frontend application — an interactive educational game called "Spark City Adventure: From Generation to Home Electricity". Players restore electricity to Spark City through 8 interactive missions, guided by an AI robot called Volt.

## Architecture
- **Frontend only**: Pure React SPA built with Vite
- **UI**: Tailwind CSS + shadcn/ui component library
- **3D**: React Three Fiber (@react-three/fiber + @react-three/drei) for levels 1–4 and vanilla Three.js with OrbitControls for levels 5–8
- **Animations**: Framer Motion for UI transitions and screen animations
- **State**: Zustand (`src/store/game-store.ts`) for global game state
- **Routing**: React Router DOM v6

## Game Flow
Level 0: Start Screen → Level 1 (Hydro Dam) → Level 2 (Generator) → Level 3 (Transmission Lines) → Level 4 (Substation) → Level 5 (Home Entry) → Level 6 (Home Wiring) → Level 7 (Power Consumption) → Level 8 (Smart Home) → Level 9 (Final Screen)

## Key Files & Structure
```
src/
  store/
    game-store.ts         Zustand store — currentLevel, score, stars, voltMessage
  utils/
    three-helpers.ts      Shared Three.js scene init (vanilla renderer + OrbitControls)
  components/
    GameUI.tsx            GameHUD, VoltGuide (Volt robot bubble), NextLevelButton, InfoCard
    StartScreen.tsx       Animated dark intro screen with 8-step journey preview
    FinalScreen.tsx       Confetti celebration with score/stars summary
    levels/
      Level1Dam.tsx       React Three Fiber — turbine, reservoir, water flow particles
      Level2Generator.tsx React Three Fiber — rotor/stator, magnetic field, AC waveform
      Level3Transmission.tsx React Three Fiber — step-up transformer, 3 towers
      Level4Substation.tsx React Three Fiber — circuit breaker, step-down transformer, slider
      Level5House.tsx     Vanilla Three.js — home entry, service pole, meter, MCB panel
      Level6Wiring.tsx    Vanilla Three.js — 3-room house, room appliance switches
      Level7Consumption.tsx Vanilla Three.js — single appliances, watt tracking
      Level8SmartHome.tsx Vanilla Three.js — full house with smart scheduling
  game/
    Game.tsx              Main game shell — renders GameHUD + active level + overlays
  pages/
    Index.tsx             Entry point (renders Game)
  App.tsx                 Root with React Router DOM v6
```

## Development
- **Run**: `npm run dev` (Vite dev server on port 5000)
- **Build**: `npm run build`
- **Test**: `npm run test`

## Replit Configuration
- Workflow: "Start application" runs `npm run dev` on port 5000 (webview)
- Vite configured with `host: "0.0.0.0"` and `allowedHosts: true` for Replit proxy compatibility
