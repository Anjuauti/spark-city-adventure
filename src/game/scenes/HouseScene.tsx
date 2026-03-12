import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useGame } from '../GameContext';

function Furniture() {
  return (
    <group>
      {/* Hall - Sofa */}
      <mesh position={[-3, 0.4, 1]}>
        <boxGeometry args={[2.5, 0.8, 1]} />
        <meshStandardMaterial color="#5D4037" roughness={0.8} />
      </mesh>
      <mesh position={[-3, 0.9, 1.4]}>
        <boxGeometry args={[2.5, 0.6, 0.2]} />
        <meshStandardMaterial color="#5D4037" roughness={0.8} />
      </mesh>

      {/* Hall - TV */}
      <mesh position={[-3, 1.5, -1.9]}>
        <boxGeometry args={[2, 1.2, 0.1]} />
        <meshStandardMaterial color="#212121" metalness={0.5} />
      </mesh>

      {/* Hall - Center table */}
      <mesh position={[-3, 0.3, 0]}>
        <boxGeometry args={[1.2, 0.05, 0.6]} />
        <meshStandardMaterial color="#795548" roughness={0.7} />
      </mesh>
      {[[-0.5, -0.25], [0.5, -0.25], [-0.5, 0.25], [0.5, 0.25]].map(([x, z], i) => (
        <mesh key={i} position={[-3 + x, 0.15, z]}>
          <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
      ))}

      {/* Kitchen - Counter */}
      <mesh position={[3, 0.5, -1.5]}>
        <boxGeometry args={[3, 1, 0.8]} />
        <meshStandardMaterial color="#ECEFF1" roughness={0.3} />
      </mesh>
      {/* Kitchen - Cabinets */}
      <mesh position={[3, 2, -1.8]}>
        <boxGeometry args={[3, 1.2, 0.4]} />
        <meshStandardMaterial color="#BCAAA4" roughness={0.6} />
      </mesh>
      {/* Kitchen - Sink */}
      <mesh position={[3.5, 1.05, -1.3]}>
        <boxGeometry args={[0.6, 0.1, 0.4]} />
        <meshStandardMaterial color="#B0BEC5" metalness={0.8} />
      </mesh>

      {/* Bedroom - Bed */}
      <mesh position={[0, 0.3, 5]}>
        <boxGeometry args={[2, 0.6, 2.5]} />
        <meshStandardMaterial color="#E8EAF6" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.7, 6]}>
        <boxGeometry args={[2, 0.4, 0.5]} />
        <meshStandardMaterial color="#C5CAE9" roughness={0.9} />
      </mesh>
      {/* Bedroom - Wardrobe */}
      <mesh position={[2.5, 1.2, 5]}>
        <boxGeometry args={[0.8, 2.4, 1.5]} />
        <meshStandardMaterial color="#8D6E63" roughness={0.7} />
      </mesh>
      {/* Bedroom - Side table */}
      <mesh position={[-1.5, 0.3, 5]}>
        <boxGeometry args={[0.5, 0.6, 0.5]} />
        <meshStandardMaterial color="#A1887F" roughness={0.7} />
      </mesh>
    </group>
  );
}

function House() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 2]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#E8E0D8" roughness={0.8} />
      </mesh>

      {/* Walls */}
      {/* Back wall */}
      <mesh position={[0, 1.5, -2]}>
        <boxGeometry args={[12, 3, 0.15]} />
        <meshStandardMaterial color="#FAFAFA" roughness={0.6} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-6, 1.5, 2]}>
        <boxGeometry args={[0.15, 3, 8]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.6} />
      </mesh>
      {/* Right wall */}
      <mesh position={[6, 1.5, 2]}>
        <boxGeometry args={[0.15, 3, 8]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.6} />
      </mesh>
      {/* Front wall (partial) */}
      <mesh position={[-4, 1.5, 6]}>
        <boxGeometry args={[4, 3, 0.15]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.6} />
      </mesh>
      <mesh position={[4, 1.5, 6]}>
        <boxGeometry args={[4, 3, 0.15]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.6} />
      </mesh>

      {/* Room dividers */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.1, 3, 4]} />
        <meshStandardMaterial color="#EEEEEE" roughness={0.6} />
      </mesh>
      <mesh position={[-1, 1.5, 3.5]}>
        <boxGeometry args={[10, 3, 0.1]} />
        <meshStandardMaterial color="#EEEEEE" roughness={0.6} transparent opacity={0.4} />
      </mesh>

      {/* Room labels */}

      <Furniture />
    </group>
  );
}

function HouseContent() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-3, 2.5, 0]} intensity={0.5} color="#FFF9C4" />
      <pointLight position={[3, 2.5, -1]} intensity={0.5} color="#FFF9C4" />
      <pointLight position={[0, 2.5, 5]} intensity={0.5} color="#FFF9C4" />

      <House />

      {/* Ground outside */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#81C784" roughness={0.9} />
      </mesh>

      <OrbitControls 
        enablePan={false}
        minDistance={8}
        maxDistance={25}
        maxPolarAngle={Math.PI / 2.5}
        target={[0, 1, 2]}
      />
      <Environment preset="apartment" />
    </>
  );
}

export default function HouseScene() {
  const { nextLevel } = useGame();

  return (
    <div className="fixed inset-0 z-30">
      <Canvas shadows camera={{ position: [10, 12, 15], fov: 45 }}>
        <HouseContent />
      </Canvas>

      <div className="fixed top-6 left-6 z-50 game-panel py-3 px-5">
        <p className="font-fredoka-one text-sm text-accent uppercase tracking-wider">Level 3</p>
        <p className="font-fredoka-one text-xl text-foreground">Power the Smart Home</p>
      </div>

      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 game-panel py-2 px-4">
        <p className="font-fredoka text-foreground text-center">
          🏠 Explore the house! It needs wiring to get electricity.
        </p>
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <button onClick={nextLevel} className="game-btn game-btn-accent text-xl animate-float">
          Start Wiring Puzzle →
        </button>
      </div>
    </div>
  );
}
