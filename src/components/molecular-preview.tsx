import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
export function MolecularPreview({ type }: { type: 'hydrogen' | 'bromine' | 'iron' }) {
  return <div className="molecular-preview"><Canvas camera={{position:[2,1.5,3],fov:40}}><ambientLight intensity={1.8}/><directionalLight position={[2,3,4]} intensity={2}/><Structure type={type}/></Canvas></div>;
}
function Structure({ type }: { type: 'hydrogen' | 'bromine' | 'iron' }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({clock})=>{if(group.current){group.current.rotation.y=clock.elapsedTime*.35;group.current.position.y=Math.sin(clock.elapsedTime)*.06;}});
  const iron = type==='iron'; const color = iron?'#8a959b':type==='bromine'?'#a7472e':'#d5e9ef';
  const atoms = iron ? [[-.5,-.3,0],[.2,-.3,0],[.55,.3,0],[-.15,.3,0],[-.15,-.3,.65],[.2,.3,.65]] : [[-.42,0,0],[.42,0,0]];
  return <group ref={group}>{atoms.map((p,i)=><mesh key={i} position={p as [number,number,number]}><sphereGeometry args={[iron?.22:.28,24,24]}/><meshStandardMaterial color={color} metalness={iron?.65:.15} roughness={.3}/></mesh>)}{!iron&&<mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.065,.065,.75,12]}/><meshStandardMaterial color="#9eaaad" metalness={.5}/></mesh>}</group>;
}
