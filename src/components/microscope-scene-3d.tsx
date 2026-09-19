import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import type { ObjectiveId } from "@/lib/microscope";

export function MicroscopeScene3D({ objective }: { objective: ObjectiveId }) {
  const objectiveLength = objective === "40x" ? 0.55 : 0.32;
  const objectiveRadius = objective === "40x" ? 0.09 : 0.13;
  return (
    <div className="h-full min-h-[380px] w-full">
      <Canvas camera={{ position: [3.2, 2.4, 3.6], fov: 40 }}>
        <color attach="background" args={["#eef1ea"]} />
        <ambientLight intensity={1.6} />
        <directionalLight position={[3, 6, 3]} intensity={2.1} />

        {/* Stol */}
        <mesh position={[0, -0.02, 0]} receiveShadow><boxGeometry args={[3.2, 0.05, 2.4]} /><meshStandardMaterial color="#c7cdc4" roughness={0.8} /></mesh>

        {/* Asos */}
        <mesh position={[0, 0.08, 0.5]}><boxGeometry args={[0.9, 0.15, 0.6]} /><meshStandardMaterial color="#33424a" metalness={0.4} roughness={0.4} /></mesh>
        {/* Ustun */}
        <mesh position={[-0.2, 0.9, 0.3]} rotation={[0, 0, -0.08]}><cylinderGeometry args={[0.08, 0.1, 1.6, 16]} /><meshStandardMaterial color="#455864" metalness={0.5} roughness={0.35} /></mesh>
        {/* Stage (predmet stoli) */}
        <mesh position={[0.05, 0.55, 0.15]}><boxGeometry args={[0.75, 0.06, 0.55]} /><meshStandardMaterial color="#8b96a0" metalness={0.4} /></mesh>
        <mesh position={[0.05, 0.59, 0.15]}><boxGeometry args={[0.35, 0.02, 0.22]} /><meshStandardMaterial color="#dce6e8" transparent opacity={0.8} /></mesh>

        {/* Tubus */}
        <mesh position={[-0.05, 1.35, 0.1]} rotation={[0.15, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.7, 20]} /><meshStandardMaterial color="#34424a" metalness={0.5} /></mesh>
        {/* Okulyar */}
        <mesh position={[-0.1, 1.72, -0.05]} rotation={[0.15, 0, 0]}><cylinderGeometry args={[0.09, 0.1, 0.28, 20]} /><meshStandardMaterial color="#20292e" /></mesh>
        {/* Obyektiv (tanlangan darajaga qarab uzunligi o'zgaradi) */}
        <mesh position={[0.02, 0.92, 0.18]}><cylinderGeometry args={[objectiveRadius, objectiveRadius * 1.3, objectiveLength, 20]} /><meshStandardMaterial color="#c9902f" metalness={0.6} roughness={0.3} /></mesh>

        {/* Fokus tugmasi */}
        <mesh position={[-0.42, 0.85, 0.35]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.09, 0.09, 0.12, 20]} /><meshStandardMaterial color="#5c6b66" /></mesh>

        <ContactShadows position={[0, 0.001, 0]} opacity={0.3} scale={6} blur={2} />
        <Environment preset="studio" />
        <OrbitControls makeDefault minDistance={3} maxDistance={8} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>
    </div>
  );
}
