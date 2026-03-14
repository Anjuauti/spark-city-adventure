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
import ConsumptionScreen from './screens/ConsumptionScreen';
import SmartHomeScreen from './screens/SmartHomeScreen';
import CelebrationScreen from './screens/CelebrationScreen';

// Levels that have Volt integrated in their side panel
const INLINE_VOLT_LEVELS = ['level5-home-entry', 'level6-wiring', 'level7-consumption', 'level8-smart-home'];

function GameContent() {
  const { currentLevel } = useGame();
  const showFloatingVolt = !INLINE_VOLT_LEVELS.includes(currentLevel);

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
      {currentLevel === 'level7-consumption' && <ConsumptionScreen />}
      {currentLevel === 'level8-smart-home' && <SmartHomeScreen />}
      {currentLevel === 'celebration' && <CelebrationScreen />}

      {showFloatingVolt && <VoltGuide />}
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
