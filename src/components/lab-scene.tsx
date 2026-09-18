import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import type { TitrationResult, TitrationState } from "@/lib/titration";

interface SceneProps {
  state: TitrationState;
  result: TitrationResult;
  dripping?: boolean;
  swirling?: boolean;
}

const COLORLESS = new THREE.Color("#dceff2");
const LIGHT_PINK = new THREE.Color("#f6a7b9");
const DEEP_PINK = new THREE.Color("#df4b7e");

function Glassware({ state, result, dripping, swirling }: SceneProps) {
  const flask = useRef<THREE.Group>(null);
  const liquid = useRef<THREE.Mesh>(null);
  const liquidMat = useRef<THREE.MeshStandardMaterial>(null);
  const buretteLiquid = useRef<THREE.Mesh>(null);
  const drop = useRef<THREE.Mesh>(null);
  const stream = useRef<THREE.Mesh>(null);
  const indicator = useRef<THREE.Mesh>(null);
  const clock = useRef(0);

  const targetColor =
    result.color === "rangsiz" ? COLORLESS : result.color === "och pushti" ? LIGHT_PINK : DEEP_PINK;

  useFrame((_, delta) => {
    clock.current += delta;
    const t = clock.current;

    // Kolbani joylashtirish: yuqoridan tushib joyiga o‘tiradi
    if (flask.current) {
      const g = flask.current;
      g.position.y = THREE.MathUtils.damp(g.position.y, state.flaskPlaced ? -0.45 : 1.8, 7, delta);
      const s = THREE.MathUtils.damp(g.scale.x, state.flaskPlaced ? 1 : 0.0001, 9, delta);
      g.scale.setScalar(s);
      // Aralashtirish: kolba chayqaladi
      const swirlAmount = swirling ? 0.16 : 0;
      g.rotation.z = THREE.MathUtils.damp(g.rotation.z, 0, 5, delta) + Math.sin(t * 9) * swirlAmount;
      g.position.x = Math.sin(t * 9 + 1.2) * swirlAmount * 0.35;
    }

    // Kislota/eritma sathi
    if (liquid.current) {
      const target = state.acidMl > 0 ? Math.max(0.06, Math.min(0.9, result.totalMl / 65)) : 0.0001;
      const h = THREE.MathUtils.damp(liquid.current.scale.y, target, 6, delta);
      liquid.current.scale.y = h;
      liquid.current.position.y = -0.7 + h / 2;
      liquid.current.visible = state.acidMl > 0;
    }
    if (liquidMat.current) liquidMat.current.color.lerp(targetColor, Math.min(1, delta * 4));

    // Byuretkadagi ishqor sathi
    if (buretteLiquid.current) {
      const target = Math.max(0.0001, state.baseInBuretteMl / 18);
      const h = THREE.MathUtils.damp(buretteLiquid.current.scale.y, target, 7, delta);
      buretteLiquid.current.scale.y = h;
      buretteLiquid.current.position.y = 0.72 + h / 2;
      buretteLiquid.current.visible = state.baseInBuretteMl > 0.01;
    }

    // Tomchi tushishi
    const canDrip = Boolean(dripping) && state.baseInBuretteMl > 0 && state.flaskPlaced;
    if (drop.current) {
      drop.current.visible = canDrip;
      if (canDrip) {
        const phase = (t * 2.2) % 1;
        drop.current.position.y = -0.12 - phase * 0.55;
        const m = drop.current.material as THREE.MeshStandardMaterial;
        m.opacity = 1 - phase * 0.7;
      }
    }
    if (stream.current) stream.current.visible = canDrip && state.valveOpen;

    // Indikator qo‘shilganda qisqa yorug‘ halqa
    if (indicator.current) {
      indicator.current.visible = state.indicatorAdded && state.acidMl > 0;
      const m = indicator.current.material as THREE.MeshStandardMaterial;
      m.opacity = state.indicatorAdded ? 0.25 + Math.sin(t * 2) * 0.08 : 0;
    }
  });

  return (
    <>
      <mesh position={[0, -1.15, 0]}>
        <cylinderGeometry args={[3.7, 3.7, 0.22, 48]} />
        <meshStandardMaterial color="#d4cec2" roughness={0.65} />
      </mesh>

      <group position={[0, -0.9, 0]}>
        {/* Shtativ */}
        <mesh position={[-0.85, 1.65, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 3.4, 20]} />
          <meshStandardMaterial color="#747b78" metalness={0.75} roughness={0.25} />
        </mesh>
        <mesh position={[0, 3.05, 0]}>
          <boxGeometry args={[1.9, 0.11, 0.12]} />
          <meshStandardMaterial color="#555d5a" metalness={0.7} />
        </mesh>

        {/* Byuretka */}
        <mesh position={[0, 1.65, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 3.2, 24]} />
          <meshPhysicalMaterial color="#eaf4f2" transparent opacity={0.42} roughness={0} transmission={0.45} />
        </mesh>
        <mesh ref={buretteLiquid} position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 1, 24]} />
          <meshStandardMaterial color="#9edee2" transparent opacity={0.85} />
        </mesh>

        {/* Kran — ochilganda qizg‘ish rangga o‘tadi */}
        <mesh position={[0, 0.04, 0]} rotation={[0, 0, state.valveOpen ? Math.PI / 2 : 0]}>
          <boxGeometry args={[0.6, 0.13, 0.13]} />
          <meshStandardMaterial color={state.valveOpen ? "#b4553f" : "#39413e"} metalness={0.6} />
        </mesh>

        {/* Oqim va tomchi */}
        <mesh ref={stream} position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 12]} />
          <meshStandardMaterial color="#b8e9eb" transparent opacity={0.7} />
        </mesh>
        <mesh ref={drop} position={[0, -0.12, 0]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshStandardMaterial color="#b8e9eb" transparent opacity={1} />
        </mesh>

        {/* Kolba */}
        <group ref={flask} position={[0, 1.8, 0]} scale={0.0001}>
          <mesh>
            <cylinderGeometry args={[0.62, 0.34, 0.95, 32, 1, true]} />
            <meshPhysicalMaterial
              color="#e7f0ed"
              transparent
              opacity={0.38}
              side={2}
              roughness={0}
              transmission={0.55}
            />
          </mesh>
          <mesh ref={liquid} position={[0, -0.27, 0]}>
            <cylinderGeometry args={[0.47, 0.3, 1, 32]} />
            <meshStandardMaterial ref={liquidMat} color="#dceff2" transparent opacity={0.85} />
          </mesh>
          <mesh ref={indicator} position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3, 0.45, 32]} />
            <meshStandardMaterial color="#f6a7b9" transparent opacity={0.25} />
          </mesh>
          <mesh position={[0, 0.68, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.52, 24, 1, true]} />
            <meshPhysicalMaterial color="#e7f0ed" transparent opacity={0.42} side={2} />
          </mesh>
        </group>
      </group>
    </>
  );
}

export function LabScene(props: SceneProps) {
  return (
    <div className="h-full min-h-[420px] w-full">
      <Canvas camera={{ position: [5, 3.5, 7], fov: 42 }}>
        <color attach="background" args={["#e9ece7"]} />
        <ambientLight intensity={1.4} />
        <directionalLight position={[4, 7, 5]} intensity={2.4} />
        <Glassware {...props} />
        <ContactShadows position={[0, -1.02, 0]} opacity={0.32} scale={9} blur={2} />
        <Environment preset="studio" />
        <OrbitControls makeDefault minDistance={5} maxDistance={11} maxPolarAngle={Math.PI / 2.05} />
      </Canvas>
    </div>
  );
}
