import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type GameLevel =
  | 'attract'
  | 'instructions'
  | 'level1-hydro'
  | 'level2-generator'
  | 'level3-transmission'
  | 'level4-substation'
  | 'level5-home-entry'
  | 'level6-wiring'
  | 'level7-consumption'
  | 'level8-smart-home'
  | 'celebration';

export type HydroStep = 'idle' | 'dam-open' | 'water-flowing' | 'turbine-spinning' | 'generating' | 'complete';
export type GeneratorStep = 'idle' | 'spinning' | 'magnetic-field' | 'current-generated' | 'complete';
export type TransmissionStep = 'idle' | 'tower1' | 'tower2' | 'tower3' | 'complete';
export type SubstationStep = 'idle' | 'breaker-on' | 'voltage-set' | 'complete';
export type HomeEntryStep = 'idle' | 'service-connected' | 'meter-on' | 'mcb-set' | 'complete';

interface Appliance {
  id: string;
  name: string;
  room: string;
  watts: number;
  icon: string;
  on: boolean;
}

interface GameState {
  currentLevel: GameLevel;
  hydroStep: HydroStep;
  generatorStep: GeneratorStep;
  transmissionStep: TransmissionStep;
  substationStep: SubstationStep;
  homeEntryStep: HomeEntryStep;
  stars: number;
  points: number;
  placedComponents: string[];
  connectedWires: string[];
  applianceStates: Record<string, boolean>;
  voltMessage: string;
  showVolt: boolean;
  voltageLevel: number;
  turbineRPM: number;
  totalConsumption: number;
}

interface GameContextType extends GameState {
  setLevel: (level: GameLevel) => void;
  setHydroStep: (step: HydroStep) => void;
  setGeneratorStep: (step: GeneratorStep) => void;
  setTransmissionStep: (step: TransmissionStep) => void;
  setSubstationStep: (step: SubstationStep) => void;
  setHomeEntryStep: (step: HomeEntryStep) => void;
  addStar: () => void;
  addPoints: (n: number) => void;
  placeComponent: (id: string) => void;
  connectWire: (id: string) => void;
  toggleAppliance: (id: string) => void;
  showVoltGuide: (msg: string) => void;
  hideVolt: () => void;
  setVoltageLevel: (v: number) => void;
  setTurbineRPM: (rpm: number) => void;
  resetGame: () => void;
  nextLevel: () => void;
  appliances: Appliance[];
}

const initialState: GameState = {
  currentLevel: 'attract',
  hydroStep: 'idle',
  generatorStep: 'idle',
  transmissionStep: 'idle',
  substationStep: 'idle',
  homeEntryStep: 'idle',
  stars: 0,
  points: 0,
  placedComponents: [],
  connectedWires: [],
  applianceStates: {},
  voltMessage: '',
  showVolt: false,
  voltageLevel: 0,
  turbineRPM: 0,
  totalConsumption: 0,
};

export const APPLIANCES: Appliance[] = [
  { id: 'bulb1', name: 'LED Bulb', room: 'Hall', watts: 9, icon: '💡', on: false },
  { id: 'bulb2', name: 'LED Bulb 2', room: 'Hall', watts: 9, icon: '💡', on: false },
  { id: 'bulb3', name: 'LED Bulb 3', room: 'Hall', watts: 9, icon: '💡', on: false },
  { id: 'fan1', name: 'Ceiling Fan', room: 'Hall', watts: 70, icon: '🌀', on: false },
  { id: 'tv', name: 'TV', room: 'Hall', watts: 120, icon: '📺', on: false },
  { id: 'bulb-k', name: 'Kitchen Light', room: 'Kitchen', watts: 9, icon: '💡', on: false },
  { id: 'fridge', name: 'Refrigerator', room: 'Kitchen', watts: 300, icon: '🧊', on: false },
  { id: 'bulb-b', name: 'Bedroom Light', room: 'Bedroom', watts: 9, icon: '💡', on: false },
  { id: 'fan2', name: 'Bedroom Fan', room: 'Bedroom', watts: 70, icon: '🌀', on: false },
  { id: 'washer', name: 'Washing Machine', room: 'Bedroom', watts: 500, icon: '🫧', on: false },
];

const GameContext = createContext<GameContextType | null>(null);

const levelOrder: GameLevel[] = [
  'attract', 'instructions', 'level1-hydro', 'level2-generator',
  'level3-transmission', 'level4-substation', 'level5-home-entry',
  'level6-wiring', 'level7-consumption', 'level8-smart-home', 'celebration'
];

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(initialState);

  const setLevel = useCallback((level: GameLevel) => {
    setState(prev => ({ ...prev, currentLevel: level }));
  }, []);

  const setHydroStep = useCallback((step: HydroStep) => {
    setState(prev => ({ ...prev, hydroStep: step }));
  }, []);

  const setGeneratorStep = useCallback((step: GeneratorStep) => {
    setState(prev => ({ ...prev, generatorStep: step }));
  }, []);

  const setTransmissionStep = useCallback((step: TransmissionStep) => {
    setState(prev => ({ ...prev, transmissionStep: step }));
  }, []);

  const setSubstationStep = useCallback((step: SubstationStep) => {
    setState(prev => ({ ...prev, substationStep: step }));
  }, []);

  const setHomeEntryStep = useCallback((step: HomeEntryStep) => {
    setState(prev => ({ ...prev, homeEntryStep: step }));
  }, []);

  const addStar = useCallback(() => {
    setState(prev => ({ ...prev, stars: prev.stars + 1 }));
  }, []);

  const addPoints = useCallback((n: number) => {
    setState(prev => ({ ...prev, points: prev.points + n }));
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

  const toggleAppliance = useCallback((id: string) => {
    setState(prev => {
      const newStates = { ...prev.applianceStates, [id]: !prev.applianceStates[id] };
      const consumption = APPLIANCES.reduce((sum, a) => sum + (newStates[a.id] ? a.watts : 0), 0);
      return { ...prev, applianceStates: newStates, totalConsumption: consumption };
    });
  }, []);

  const showVoltGuide = useCallback((msg: string) => {
    setState(prev => ({ ...prev, voltMessage: msg, showVolt: true }));
  }, []);

  const hideVolt = useCallback(() => {
    setState(prev => ({ ...prev, showVolt: false }));
  }, []);

  const setVoltageLevel = useCallback((v: number) => {
    setState(prev => ({ ...prev, voltageLevel: v }));
  }, []);

  const setTurbineRPM = useCallback((rpm: number) => {
    setState(prev => ({ ...prev, turbineRPM: rpm }));
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
      setGeneratorStep,
      setTransmissionStep,
      setSubstationStep,
      setHomeEntryStep,
      addStar,
      addPoints,
      placeComponent,
      connectWire,
      toggleAppliance,
      showVoltGuide,
      hideVolt,
      setVoltageLevel,
      setTurbineRPM,
      resetGame,
      nextLevel,
      appliances: APPLIANCES,
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
