import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { terminals, type CircuitState, type TerminalId } from "@/lib/circuit";

// Maps each 2D schematic terminal to a fixed point on the 3D bench, purely for
// drawing wires between the same real equipment shown in the 2D board.
const POS_3D: Record<TerminalId, [number, number, number]> = {
  src_pos: [-3.2, 0.55, 0.35],
  src_neg: [-3.2, 0.55, -0.35],
  amm_a: [-1, 1.1, 0],
  amm_b: [0, 1.1, 0],
  res_a: [2.6, 0.9, 0.3],
  res_b: [2.6, 0.9, -0.3],
  volt_a: [1.4, 0.15, 1.3],
  volt_b: [2.6, 0.15, 1.3],
};

const UP = new THREE.Vector3(0, 1, 0);

// A straight cylinder stretched and rotated between two points — a small, safe
// stand-in for a "wire" that avoids react-three-fiber's <line>/drei <Line>
// primitives (both crash in this project's dev toolchain with a
// "Cannot set data-tsd-source" error from an unrelated dev-instrumentation
// plugin that intercepts every created three.js object).
function Wire({ a, b, live }: { a: TerminalId; b: TerminalId; live: boolean }) {
  const from = new THREE.Vector3(...POS_3D[a]);
  const to = new THREE.Vector3(...POS_3D[b]);
  const { position, quaternion, length } = useMemo(() => {
    const dir = to.clone().sub(from);
    const len = dir.length();
    const mid = from.clone().add(to).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize());
    return { position: mid, quaternion: quat, length: len };
  }, [a, b]);
  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[0.025, 0.025, length, 8]} />
      <meshStandardMaterial color={live ? "#e0a338" : "#5c6b66"} />
    </mesh>
  );
}

function CurrentPulse({ a, b, speed }: { a: TerminalId; b: TerminalId; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const from = useMemo(() => new THREE.Vector3(...POS_3D[a]), [a]);
  const to = useMemo(() => new THREE.Vector3(...POS_3D[b]), [b]);
  const clock = useRef(Math.random());
  useFrame((_, delta) => {
    clock.current = (clock.current + delta * speed) % 1;
    if (ref.current) ref.current.position.lerpVectors(from, to, clock.current);
  });
  return <mesh ref={ref}><sphereGeometry args={[0.05, 8, 8]} /><meshBasicMaterial color="#f4c869" /></mesh>;
}

export function CircuitScene3D({ state, closed, current }: { state: CircuitState; closed: boolean; current: number | null }) {
  const pulseSpeed = current ? Math.max(0.3, Math.min(2.5, current * 6)) : 0;
  return (
    <div className="h-full min-h-[380px] w-full">
      <Canvas camera={{ position: [1, 4, 7], fov: 42 }}>
        <color attach="background" args={["#eef1ea"]} />
        <ambientLight intensity={1.5} />
        <directionalLight position={[4, 6, 4]} intensity={2} />

        <mesh position={[0, -0.05, 0]} receiveShadow>
          <boxGeometry args={[9, 0.1, 4]} />
          <meshStandardMaterial color="#c7cdc4" roughness={0.8} />
        </mesh>

        {/* Manba (batareya) */}
        <mesh position={[-3.2, 0.55, 0]}>
          <boxGeometry args={[0.6, 1.1, 0.9]} />
          <meshStandardMaterial color="#2f6f5e" metalness={0.3} roughness={0.5} />
        </mesh>

        {/* Ampermetr */}
        <mesh position={[-0.5, 1.1, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.18, 32]} />
          <meshStandardMaterial color="#f4f6f2" />
        </mesh>
        <mesh position={[-0.5, 1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.5, 32]} />
          <meshStandardMaterial color={closed ? "#e0a338" : "#9aa39c"} />
        </mesh>

        {/* Rezistor */}
        <mesh position={[2.6, 0.6, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.9, 20]} />
          <meshStandardMaterial color="#d8b26a" />
        </mesh>

        {/* Voltmetr (probe bilan pastda) */}
        <mesh position={[2, 0.15, 1.3]}>
          <cylinderGeometry args={[0.4, 0.4, 0.16, 32]} />
          <meshStandardMaterial color="#f4f6f2" />
        </mesh>
        <mesh position={[2, 0.24, 1.3]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.22, 0.36, 32]} />
          <meshStandardMaterial color={state.wires.length ? "#4c8fa8" : "#9aa39c"} />
        </mesh>

        {state.wires.map(([a, b], i) => <Wire key={i} a={a} b={b} live={closed} />)}
        {closed && current && state.wires.map(([a, b], i) => <CurrentPulse key={`p${i}`} a={a} b={b} speed={pulseSpeed} />)}

        <ContactShadows position={[0, 0.001, 0]} opacity={0.3} scale={10} blur={2.4} />
        <Environment preset="studio" />
        <OrbitControls makeDefault minDistance={5} maxDistance={13} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>
    </div>
  );
}
