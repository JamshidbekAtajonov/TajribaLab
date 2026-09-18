import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import type { TitrationResult, TitrationState } from "@/lib/titration";

function Glassware({ state, result }: { state: TitrationState; result: TitrationResult }) {
  const liquidHeight = Math.max(0.04, Math.min(0.85, result.totalMl / 65));
  const liquidColor = result.color === "rangsiz" ? "#dceff2" : result.color === "och pushti" ? "#f6a7b9" : "#df4b7e";
  return <>
    <mesh position={[0, -1.15, 0]}><cylinderGeometry args={[3.7, 3.7, .22, 48]}/><meshStandardMaterial color="#d4cec2" roughness={.65}/></mesh>
    <group position={[0, -.9, 0]}>
      <mesh position={[-.85, 1.65, 0]}><cylinderGeometry args={[.08,.08,3.4,20]}/><meshStandardMaterial color="#747b78" metalness={.75} roughness={.25}/></mesh>
      <mesh position={[0,3.05,0]}><boxGeometry args={[1.9,.11,.12]}/><meshStandardMaterial color="#555d5a" metalness={.7}/></mesh>
      <mesh position={[0,1.65,0]}><cylinderGeometry args={[.12,.12,3.2,24]}/><meshPhysicalMaterial color="#eaf4f2" transparent opacity={.42} roughness={0} transmission={.45}/></mesh>
      <mesh position={[0,2.3,0]}><cylinderGeometry args={[.09,.09,Math.max(.05,state.baseInBuretteMl/18),24]}/><meshStandardMaterial color="#9edee2" transparent opacity={.85}/></mesh>
      <mesh position={[0,.04,0]}><boxGeometry args={[.6,.13,.13]}/><meshStandardMaterial color="#39413e" metalness={.6}/></mesh>
      {state.valveOpen&&state.baseInBuretteMl>0&&<mesh position={[0,-.25,0]}><cylinderGeometry args={[.025,.025,.55,12]}/><meshStandardMaterial color="#b8e9eb"/></mesh>}
      <group position={[0,-.45,0]}>
        <mesh><cylinderGeometry args={[.62,.34,.95,32,1,true]}/><meshPhysicalMaterial color="#e7f0ed" transparent opacity={.38} side={2} roughness={0} transmission={.55}/></mesh>
        <mesh position={[0,-.27,0]}><cylinderGeometry args={[.47,.3,liquidHeight,32]}/><meshStandardMaterial color={liquidColor} transparent opacity={.82}/></mesh>
        <mesh position={[0,.68,0]}><cylinderGeometry args={[.18,.18,.52,24,1,true]}/><meshPhysicalMaterial color="#e7f0ed" transparent opacity={.42} side={2}/></mesh>
      </group>
    </group>
  </>;
}

export function LabScene({ state, result }: { state: TitrationState; result: TitrationResult }) {
  return <div className="h-full min-h-[420px] w-full"><Canvas camera={{position:[5,3.5,7],fov:42}}><color attach="background" args={["#e9ece7"]}/><ambientLight intensity={1.4}/><directionalLight position={[4,7,5]} intensity={2.4}/><Glassware state={state} result={result}/><ContactShadows position={[0,-1.02,0]} opacity={.32} scale={9} blur={2}/><Environment preset="studio"/><OrbitControls makeDefault minDistance={5} maxDistance={11} maxPolarAngle={Math.PI/2.05}/></Canvas></div>;
}