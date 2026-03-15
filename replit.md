# Spark City Adventure

## Project Overview
A React/Vite frontend application — an interactive educational game called "Spark City Adventure: From Generation to Home Electricity". Players restore electricity to Spark City through 8 interactive missions, guided by an AI robot called Volt.

## Architecture
- **Frontend only**: Pure React SPA built with Vite
- **UI**: Tailwind CSS + shadcn/ui component library
- **3D**: React Three Fiber + @react-three/drei for 3D game scenes
- **State**: Zustand for global game state, React Query for async data
- **Routing**: React Router DOM v6

## Key Files
- `src/App.tsx` — Root app with routing and providers
- `src/pages/Index.tsx` — Main landing page
- `src/game/` — Game scenes, context, screens, models, and guides
- `src/components/ui/` — shadcn/ui component library
- `vite.config.ts` — Vite config (port 5000, host 0.0.0.0 for Replit)

## Development
- **Run**: `npm run dev` (starts Vite dev server on port 5000)
- **Build**: `npm run build`
- **Test**: `npm run test`

## Replit Configuration
- Workflow: "Start application" runs `npm run dev` on port 5000 (webview)
- Vite configured with `host: "0.0.0.0"` and `allowedHosts: true` for Replit proxy compatibility
- Lovable-specific `componentTagger` plugin removed from Vite config
