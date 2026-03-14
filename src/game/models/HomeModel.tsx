import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ROOM_W = 3.5;
const ROOM_D = 4;
const WALL_H = 2.8;
const WALL_T = 0.12;

const FLOOR_COLORS: Record<string, string> = {
  Hall: '#C8B89A',
  Kitchen: '#B8C4B8',
  Bedroom: '#BDB5C8',
};

/* ---------- tiny appliance meshes ---------- */

function Bulb({ on, position }: { on: boolean; position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (on && ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.6 + Math.sin(clock.elapsedTime * 4) * 0.15;
    }
  });
  return (
    <group position={position}>
      {/* wire */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.3, 6]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh ref={ref}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial
          color={on ? '#FFF9C4' : '#E0E0E0'}
          emissive={on ? '#FFD54F' : '#000'}
          emissiveIntensity={on ? 0.6 : 0}
        />
      </mesh>
      {on && <pointLight intensity={0.6} distance={3} color="#FFD54F" />}
    </group>
  );
}

function Fan({ on, position }: { on: boolean; position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    if (on && ref.current) ref.current.rotation.y += dt * 6;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.16, 8]} />
        <meshStandardMaterial color="#78909C" metalness={0.6} />
      </mesh>
      <group ref={ref}>
        {[0, 1, 2, 3].map(i => (
          <mesh key={i} rotation={[0, (i * Math.PI) / 2, 0]} position={[0.35, 0, 0]}>
            <boxGeometry args={[0.6, 0.03, 0.18]} />
            <meshStandardMaterial color="#90A4AE" metalness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function TVModel({ on, position }: { on: boolean; position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* screen */}
      <mesh>
        <boxGeometry args={[0.9, 0.55, 0.05]} />
        <meshStandardMaterial
          color={on ? '#1A237E' : '#212121'}
          emissive={on ? '#42A5F5' : '#000'}
          emissiveIntensity={on ? 0.4 : 0}
        />
      </mesh>
      {/* bezel */}
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[1, 0.65, 0.02]} />
        <meshStandardMaterial color="#37474F" />
      </mesh>
      {/* stand */}
      <mesh position={[0, -0.38, 0.05]}>
        <boxGeometry args={[0.4, 0.06, 0.15]} />
        <meshStandardMaterial color="#37474F" />
      </mesh>
    </group>
  );
}

function Fridge({ on, position }: { on: boolean; position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.55, 1.2, 0.5]} />
        <meshStandardMaterial color="#ECEFF1" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* door line */}
      <mesh position={[0, 0.15, 0.26]}>
        <boxGeometry args={[0.5, 0.01, 0.01]} />
        <meshStandardMaterial color="#B0BEC5" />
      </mesh>
      {/* handle */}
      <mesh position={[0.22, -0.2, 0.27]}>
        <boxGeometry args={[0.03, 0.25, 0.03]} />
        <meshStandardMaterial color="#90A4AE" metalness={0.7} />
      </mesh>
      {on && <pointLight position={[0, 0, 0.3]} intensity={0.2} distance={1} color="#B3E5FC" />}
    </group>
  );
}

function Washer({ on, position }: { on: boolean; position: [number, number, number] }) {
  const drumRef = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => {
    if (on && drumRef.current) drumRef.current.rotation.z += dt * 4;
  });
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.55, 0.6, 0.5]} />
        <meshStandardMaterial color="#ECEFF1" metalness={0.2} />
      </mesh>
      {/* drum window */}
      <mesh ref={drumRef} position={[0, -0.05, 0.26]}>
        <torusGeometry args={[0.15, 0.03, 8, 16]} />
        <meshStandardMaterial color="#78909C" metalness={0.5} />
      </mesh>
    </group>
  );
}

/* ---------- Meter & MCB (external) ---------- */

function ElectricMeter({ active, position }: { active: boolean; position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (active && ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.15 + Math.sin(clock.elapsedTime * 2) * 0.1;
    }
  });
  return (
    <group position={position}>
      <mesh ref={ref}>
        <boxGeometry args={[0.5, 0.6, 0.15]} />
        <meshStandardMaterial
          color="#546E7A"
          emissive={active ? '#4CAF50' : '#000'}
          emissiveIntensity={0}
          metalness={0.5}
        />
      </mesh>
      {/* display */}
      <mesh position={[0, 0.1, 0.08]}>
        <boxGeometry args={[0.35, 0.18, 0.01]} />
        <meshStandardMaterial
          color={active ? '#1B5E20' : '#263238'}
          emissive={active ? '#66BB6A' : '#000'}
          emissiveIntensity={active ? 0.4 : 0}
        />
      </mesh>
      {/* disc */}
      <mesh position={[0, -0.12, 0.08]}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
        <meshStandardMaterial color="#B0BEC5" metalness={0.8} />
      </mesh>
    </group>
  );
}

function MCBPanel({ active, position }: { active: boolean; position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.6, 0.45, 0.12]} />
        <meshStandardMaterial color="#ECEFF1" metalness={0.3} />
      </mesh>
      {/* MCB switches */}
      {[-0.18, 0, 0.18].map((x, i) => (
        <mesh key={i} position={[x, 0, 0.07]}>
          <boxGeometry args={[0.1, 0.2, 0.04]} />
          <meshStandardMaterial
            color={active ? '#4CAF50' : '#F44336'}
            emissive={active ? '#4CAF50' : '#F44336'}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- Service Wire ---------- */

function ServiceWire({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null!);
  const count = 30;
  const positions = new Float32Array(count * 3);

  useFrame(({ clock }) => {
    if (!active || !ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const t = ((clock.elapsedTime * 0.4 + i / count) % 1);
      pos[i * 3] = -8 + t * 3.5;
      pos[i * 3 + 1] = 2 + Math.sin(t * Math.PI) * 0.3;
      pos[i * 3 + 2] = ROOM_D / 2 + 0.3;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      {/* Wire line */}
      <mesh position={[-6, 2, ROOM_D / 2 + 0.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 5, 6]} />
        <meshStandardMaterial color={active ? '#E53935' : '#757575'} />
      </mesh>
      {/* Pole */}
      <mesh position={[-8, 1.5, ROOM_D / 2 + 0.3]}>
        <cylinderGeometry args={[0.08, 0.1, 3, 8]} />
        <meshStandardMaterial color="#795548" roughness={0.9} />
      </mesh>
      <mesh position={[-8, 3.2, ROOM_D / 2 + 0.3]}>
        <boxGeometry args={[1, 0.08, 0.08]} />
        <meshStandardMaterial color="#795548" roughness={0.9} />
      </mesh>
      {/* Energy particles */}
      {active && (
        <points ref={ref}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
          </bufferGeometry>
          <pointsMaterial size={0.12} color="#FF9800" transparent opacity={0.8} />
        </points>
      )}
    </group>
  );
}

/* ---------- electricity flow inside house ---------- */

function InteriorFlow({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null!);
  const count = 40;
  const positions = new Float32Array(count * 3);

  useFrame(({ clock }) => {
    if (!active || !ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const t = ((clock.elapsedTime * 0.3 + i / count) % 1);
      // flow along ceiling from MCB to rooms
      const roomIndex = i % 3;
      const roomX = (roomIndex - 1) * ROOM_W;
      pos[i * 3] = roomX + (Math.random() - 0.5) * 2;
      pos[i * 3 + 1] = WALL_H - 0.2 - t * 1.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * ROOM_D * 0.6;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#FFC107" transparent opacity={0.7} />
    </points>
  );
}

/* ---------- APPLIANCE POSITIONS ---------- */

const APPLIANCE_POSITIONS: Record<string, { type: string; position: [number, number, number] }> = {
  'bulb-hall':    { type: 'bulb',   position: [-ROOM_W, WALL_H - 0.3, 0] },
  'fan-hall':     { type: 'fan',    position: [-ROOM_W + 1.2, WALL_H - 0.15, -0.5] },
  'tv-hall':      { type: 'tv',     position: [-ROOM_W, 1.2, -ROOM_D / 2 + 0.15] },
  'bulb-kitchen': { type: 'bulb',   position: [0, WALL_H - 0.3, 0] },
  'fridge':       { type: 'fridge', position: [0.8, 0.6, -ROOM_D / 2 + 0.35] },
  'washer':       { type: 'washer', position: [-0.8, 0.3, -ROOM_D / 2 + 0.35] },
  'bulb-bed':     { type: 'bulb',   position: [ROOM_W, WALL_H - 0.3, 0] },
  'fan-bed':      { type: 'fan',    position: [ROOM_W + 1.2, WALL_H - 0.15, -0.5] },
  'tv-bed':       { type: 'tv',     position: [ROOM_W, 1.2, -ROOM_D / 2 + 0.15] },
};

/* ---------- Room label (using drei Html would need import, use simple mesh) ---------- */

function RoomDivider({ x }: { x: number }) {
  return (
    <mesh position={[x, WALL_H / 2, 0]}>
      <boxGeometry args={[WALL_T, WALL_H, ROOM_D]} />
      <meshStandardMaterial color="#E0D8CC" roughness={0.8} />
    </mesh>
  );
}

/* ========== MAIN HOME MODEL ========== */

export interface HomeModelProps {
  placedAppliances?: string[];
  applianceStates?: Record<string, boolean>;
  showServiceWire?: boolean;
  serviceWireActive?: boolean;
  showMeter?: boolean;
  meterActive?: boolean;
  showMCB?: boolean;
  mcbActive?: boolean;
  showInteriorFlow?: boolean;
  highlightRoom?: string | null;
  highlightAppliance?: string | null;
}

export default function HomeModel({
  placedAppliances = [],
  applianceStates = {},
  showServiceWire = false,
  serviceWireActive = false,
  showMeter = false,
  meterActive = false,
  showMCB = false,
  mcbActive = false,
  showInteriorFlow = false,
  highlightRoom = null,
  highlightAppliance = null,
}: HomeModelProps) {
  const allAppliances = Object.keys(APPLIANCE_POSITIONS);
  const visibleAppliances = placedAppliances.length > 0 ? placedAppliances : [];

  return (
    <group position={[0, 0, 0]}>
      {/* ---- LIGHTING ---- */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[6, 8, 8]} intensity={0.8} castShadow />
      <directionalLight position={[-4, 6, -4]} intensity={0.3} />

      {/* ---- FLOOR ---- */}
      {(['Hall', 'Kitchen', 'Bedroom'] as const).map((room, i) => {
        const x = (i - 1) * ROOM_W;
        const isHighlighted = highlightRoom === room;
        return (
          <mesh key={room} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, 0]}>
            <planeGeometry args={[ROOM_W - 0.15, ROOM_D - 0.15]} />
            <meshStandardMaterial
              color={FLOOR_COLORS[room]}
              emissive={isHighlighted ? '#FFF9C4' : '#000'}
              emissiveIntensity={isHighlighted ? 0.15 : 0}
              roughness={0.8}
            />
          </mesh>
        );
      })}

      {/* ---- BACK WALL ---- */}
      <mesh position={[0, WALL_H / 2, -ROOM_D / 2]}>
        <boxGeometry args={[ROOM_W * 3 + WALL_T * 2, WALL_H, WALL_T]} />
        <meshStandardMaterial color="#E8E0D4" roughness={0.85} />
      </mesh>

      {/* ---- SIDE WALLS ---- */}
      <mesh position={[-ROOM_W * 1.5 - WALL_T / 2, WALL_H / 2, 0]}>
        <boxGeometry args={[WALL_T, WALL_H, ROOM_D]} />
        <meshStandardMaterial color="#E0D8CC" roughness={0.85} />
      </mesh>
      <mesh position={[ROOM_W * 1.5 + WALL_T / 2, WALL_H / 2, 0]}>
        <boxGeometry args={[WALL_T, WALL_H, ROOM_D]} />
        <meshStandardMaterial color="#E0D8CC" roughness={0.85} />
      </mesh>

      {/* ---- ROOM DIVIDERS ---- */}
      <RoomDivider x={-ROOM_W / 2} />
      <RoomDivider x={ROOM_W / 2} />

      {/* ---- ROOF (semi-transparent for cutaway) ---- */}
      <mesh position={[0, WALL_H, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM_W * 3 + WALL_T * 2, ROOM_D]} />
        <meshStandardMaterial color="#D7CFC2" transparent opacity={0.25} side={THREE.DoubleSide} roughness={0.9} />
      </mesh>

      {/* ---- EXTERNAL COMPONENTS ---- */}
      {showServiceWire && <ServiceWire active={serviceWireActive} />}
      {showMeter && (
        <ElectricMeter
          active={meterActive}
          position={[-ROOM_W * 1.5 - 0.5, 1.8, ROOM_D / 2 + 0.1]}
        />
      )}
      {showMCB && (
        <MCBPanel
          active={mcbActive}
          position={[-ROOM_W * 1.5 - 0.5, 1.1, ROOM_D / 2 + 0.1]}
        />
      )}

      {/* ---- APPLIANCES ---- */}
      {visibleAppliances.map(id => {
        const config = APPLIANCE_POSITIONS[id];
        if (!config) return null;
        const on = applianceStates[id] ?? false;
        const isHL = highlightAppliance === id;

        switch (config.type) {
          case 'bulb':
            return <Bulb key={id} on={on} position={config.position} />;
          case 'fan':
            return <Fan key={id} on={on} position={config.position} />;
          case 'tv':
            return <TVModel key={id} on={on} position={config.position} />;
          case 'fridge':
            return <Fridge key={id} on={on} position={config.position} />;
          case 'washer':
            return <Washer key={id} on={on} position={config.position} />;
          default:
            return null;
        }
      })}

      {/* ---- Placement highlights (empty slots glow) ---- */}
      {highlightAppliance && APPLIANCE_POSITIONS[highlightAppliance] && !visibleAppliances.includes(highlightAppliance) && (
        <mesh position={APPLIANCE_POSITIONS[highlightAppliance].position}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#FFC107" transparent opacity={0.4} emissive="#FFC107" emissiveIntensity={0.5} />
        </mesh>
      )}

      {/* ---- Interior electricity flow ---- */}
      <InteriorFlow active={showInteriorFlow} />

      {/* ---- GROUND ---- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[20, 14]} />
        <meshStandardMaterial color="#A5C9A0" roughness={0.95} />
      </mesh>
    </group>
  );
}

export { APPLIANCE_POSITIONS };
