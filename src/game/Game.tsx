import { GameProvider, useGame } from './GameContext';
import ElectroGuide from './ElectroGuide';
import StarCounter from './StarCounter';
import AttractScreen from './screens/AttractScreen';
import InstructionsScreen from './screens/InstructionsScreen';
import HydroScene from './scenes/HydroScene';
import TransmissionScene from './scenes/TransmissionScene';
import HouseScene from './scenes/HouseScene';
import WiringPuzzle from './screens/WiringPuzzle';
import WireConnect from './screens/WireConnect';
import MagicMoment from './screens/MagicMoment';
import ExploreMode from './screens/ExploreMode';
import CelebrationScreen from './screens/CelebrationScreen';

function GameContent() {
  const { currentLevel } = useGame();

  return (
    <div className="w-full h-screen overflow-hidden bg-background relative">
      {currentLevel === 'attract' && <AttractScreen />}
      {currentLevel === 'instructions' && <InstructionsScreen />}
      {currentLevel === 'level1-hydro' && <HydroScene />}
      {currentLevel === 'level2-transmission' && <TransmissionScene />}
      {currentLevel === 'level3-house' && <HouseScene />}
      {currentLevel === 'level4-wiring' && <WiringPuzzle />}
      {currentLevel === 'level5-connect' && <WireConnect />}
      {currentLevel === 'magic-moment' && <MagicMoment />}
      {currentLevel === 'explore' && <ExploreMode />}
      {currentLevel === 'celebration' && <CelebrationScreen />}
      
      <ElectroGuide />
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
