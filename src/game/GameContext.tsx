import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type GameLevel = 
  | 'attract'
  | 'instructions' 
  | 'level1-hydro' 
  | 'level2-transmission' 
  | 'level3-house' 
  | 'level4-wiring' 
  | 'level5-connect' 
  | 'magic-moment'
  | 'explore' 
  | 'celebration';

export type HydroStep = 'idle' | 'dam-open' | 'water-flowing' | 'turbine-spinning' | 'generating' | 'complete';
export type TransmissionStep = 'idle' | 'tower1' | 'tower2' | 'tower3' | 'complete';

interface WiredComponent {
  id: string;
  room: string;
  name: string;
  placed: boolean;
}

interface WireConnection {
  id: string;
  from: string;
  to: string;
  color: string;
  connected: boolean;
}

interface GameState {
  currentLevel: GameLevel;
  hydroStep: HydroStep;
  transmissionStep: TransmissionStep;
  stars: number;
  placedComponents: string[];
  connectedWires: string[];
  switchStates: Record<string, boolean>;
  electroMessage: string;
  showElectro: boolean;
}

interface GameContextType extends GameState {
  setLevel: (level: GameLevel) => void;
  setHydroStep: (step: HydroStep) => void;
  setTransmissionStep: (step: TransmissionStep) => void;
  addStar: () => void;
  placeComponent: (id: string) => void;
  connectWire: (id: string) => void;
  toggleSwitch: (id: string) => void;
  setElectroMessage: (msg: string) => void;
  showElectroGuide: (msg: string) => void;
  hideElectro: () => void;
  resetGame: () => void;
  nextLevel: () => void;
  components: WiredComponent[];
  wires: WireConnection[];
}

const initialState: GameState = {
  currentLevel: 'attract',
  hydroStep: 'idle',
  transmissionStep: 'idle',
  stars: 0,
  placedComponents: [],
  connectedWires: [],
  switchStates: {},
  electroMessage: '',
  showElectro: false,
};

const COMPONENTS: WiredComponent[] = [
  { id: 'hall-light1', room: 'Hall', name: 'LED Light 1', placed: false },
  { id: 'hall-light2', room: 'Hall', name: 'LED Light 2', placed: false },
  { id: 'hall-light3', room: 'Hall', name: 'LED Light 3', placed: false },
  { id: 'hall-fan', room: 'Hall', name: 'Ceiling Fan', placed: false },
  { id: 'hall-switch', room: 'Hall', name: 'Switch Board', placed: false },
  { id: 'hall-tv', room: 'Hall', name: 'TV Socket', placed: false },
  { id: 'kitchen-light', room: 'Kitchen', name: 'LED Light', placed: false },
  { id: 'kitchen-socket', room: 'Kitchen', name: 'Socket Board', placed: false },
  { id: 'bed-light', room: 'Bedroom', name: 'LED Light', placed: false },
  { id: 'bed-fan', room: 'Bedroom', name: 'Ceiling Fan', placed: false },
  { id: 'bed-socket', room: 'Bedroom', name: 'Bedside Socket', placed: false },
];

const WIRES: WireConnection[] = [
  { id: 'wire1', from: 'main-breaker', to: 'hall-switch', color: 'red', connected: false },
  { id: 'wire2', from: 'hall-switch', to: 'hall-light1', color: 'blue', connected: false },
  { id: 'wire3', from: 'hall-switch', to: 'hall-fan', color: 'green', connected: false },
  { id: 'wire4', from: 'main-breaker', to: 'kitchen-light', color: 'red', connected: false },
  { id: 'wire5', from: 'main-breaker', to: 'bed-light', color: 'blue', connected: false },
  { id: 'wire6', from: 'bed-light', to: 'bed-fan', color: 'green', connected: false },
];

const GameContext = createContext<GameContextType | null>(null);

const levelOrder: GameLevel[] = [
  'attract', 'instructions', 'level1-hydro', 'level2-transmission',
  'level3-house', 'level4-wiring', 'level5-connect', 'magic-moment',
  'explore', 'celebration'
];

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(initialState);

  const setLevel = useCallback((level: GameLevel) => {
    setState(prev => ({ ...prev, currentLevel: level }));
  }, []);

  const setHydroStep = useCallback((step: HydroStep) => {
    setState(prev => ({ ...prev, hydroStep: step }));
  }, []);

  const setTransmissionStep = useCallback((step: TransmissionStep) => {
    setState(prev => ({ ...prev, transmissionStep: step }));
  }, []);

  const addStar = useCallback(() => {
    setState(prev => ({ ...prev, stars: prev.stars + 1 }));
  }, []);

  const placeComponent = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      placedComponents: [...prev.placedComponents, id],
    }));
  }, []);

  const connectWire = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      connectedWires: [...prev.connectedWires, id],
    }));
  }, []);

  const toggleSwitch = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      switchStates: { ...prev.switchStates, [id]: !prev.switchStates[id] },
    }));
  }, []);

  const setElectroMessage = useCallback((msg: string) => {
    setState(prev => ({ ...prev, electroMessage: msg, showElectro: true }));
  }, []);

  const showElectroGuide = useCallback((msg: string) => {
    setState(prev => ({ ...prev, electroMessage: msg, showElectro: true }));
  }, []);

  const hideElectro = useCallback(() => {
    setState(prev => ({ ...prev, showElectro: false }));
  }, []);

  const resetGame = useCallback(() => {
    setState({ ...initialState, currentLevel: 'instructions' });
  }, []);

  const nextLevel = useCallback(() => {
    setState(prev => {
      const idx = levelOrder.indexOf(prev.currentLevel);
      const next = idx < levelOrder.length - 1 ? levelOrder[idx + 1] : prev.currentLevel;
      return { ...prev, currentLevel: next };
    });
  }, []);

  return (
    <GameContext.Provider value={{
      ...state,
      setLevel,
      setHydroStep,
      setTransmissionStep,
      addStar,
      placeComponent,
      connectWire,
      toggleSwitch,
      setElectroMessage,
      showElectroGuide,
      hideElectro,
      resetGame,
      nextLevel,
      components: COMPONENTS,
      wires: WIRES,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
