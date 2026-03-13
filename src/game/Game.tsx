import { GameProvider, useGame } from './GameContext';
import VoltGuide from './VoltGuide';
import StarCounter from './StarCounter';
import AttractScreen from './screens/AttractScreen';
import InstructionsScreen from './screens/InstructionsScreen';
import HydroScene from './scenes/HydroScene';
import GeneratorScene from './scenes/GeneratorScene';
import TransmissionScene from './scenes/TransmissionScene';
import SubstationScene from './scenes/SubstationScene';
import HomeEntryScene from './scenes/HomeEntryScene';
import WiringPuzzle from './screens/WiringPuzzle';
import WireConnect from './screens/WireConnect';
import ConsumptionScreen from './screens/ConsumptionScreen';
import SmartHomeScreen from './screens/SmartHomeScreen';
import CelebrationScreen from './screens/CelebrationScreen';

function GameContent() {
  const { currentLevel } = useGame();

  return (
    <div className="w-full h-screen overflow-hidden bg-background relative">
      {currentLevel === 'attract' && <AttractScreen />}
      {currentLevel === 'instructions' && <InstructionsScreen />}
      {currentLevel === 'level1-hydro' && <HydroScene />}
      {currentLevel === 'level2-generator' && <GeneratorScene />}
      {currentLevel === 'level3-transmission' && <TransmissionScene />}
      {currentLevel === 'level4-substation' && <SubstationScene />}
      {currentLevel === 'level5-home-entry' && <HomeEntryScene />}
      {currentLevel === 'level6-wiring' && <WiringPuzzle />}
      {currentLevel === 'level7-consumption' && <WireConnect />}
      {currentLevel === 'level8-smart-home' && <ConsumptionScreen />}
      {currentLevel === 'celebration' && <CelebrationScreen />}

      <VoltGuide />
      <StarCounter />
    </div>
  );
}

export default function Game() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}
