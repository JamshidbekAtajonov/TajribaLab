import { Canvas, ThreeEvent, useFrame } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { isMaterial, materials, type LabAction, type LabObject } from '@/lib/sandbox';

function Model({ object }: { object: LabObject }) {
  const t = object.type;
  const liquid = object.contents.filter(c => c.material === 'water' || c.material === 'bromine');
  const total = liquid.reduce((n, c) => n + c.quantity, 0);
  const hasBromine = liquid.some(c => c.material === 'bromine');
  const glass = <meshPhysicalMaterial color="#d7f1f0" transparent opacity={0.38} roughness={0.08} metalness={0.05} side={THREE.DoubleSide} depthWrite={false} />;
  const liquidMesh = total > 0 && <mesh position={[0, Math.min(.7, total / 130) / 2 + .04, 0]}><cylinderGeometry args={[t === 'flask' ? .25 : .23, t === 'flask' ? .37 : .23, Math.min(.7, total / 130), 28]} /><meshStandardMaterial color={object.reaction ? '#734b36' : hasBromine ? materials.bromine.color : materials.water.color} transparent opacity={.7} /></mesh>;
  const gas = object.contents.some(c => c.material === 'hydrogen');
  const solid = object.contents.some(c => c.material === 'iron');
  const contents = <>{gas&&[0,1,2,3,4,5].map(i=><mesh key={`g${i}`} position={[Math.sin(i*2.5)*.12,.22+(i%3)*.15,Math.cos(i*2.5)*.12]}><sphereGeometry args={[.025,8,8]}/><meshBasicMaterial color="#d5f5f7" transparent opacity={.8}/></mesh>)}{solid&&<mesh position={[.08,.1,0]}><dodecahedronGeometry args={[.12]}/><meshStandardMaterial color="#78868a" metalness={.7}/></mesh>}</>;
  if (t === 'iron') return <group><mesh position={[0,.13,0]}><dodecahedronGeometry args={[.22]} /><meshStandardMaterial color="#77838a" metalness={.8} roughness={.28} /></mesh><mesh position={[.1,.24,.06]}><dodecahedronGeometry args={[.1]} /><meshStandardMaterial color="#929b9e" metalness={.8} /></mesh></group>;
  if (t === 'hydrogen') return <group><mesh position={[0,.18,0]}><cylinderGeometry args={[.25,.29,.36,24]} /><meshPhysicalMaterial color="#b4dfe7" transparent opacity={.45} /></mesh>{[0,1,2,3,4].map(i=><mesh key={i} position={[Math.sin(i*2)*.14,.14+i*.035,Math.cos(i*2)*.12]}><sphereGeometry args={[.025,8,8]} /><meshBasicMaterial color="#e4fbff" /></mesh>)}</group>;
  if (t === 'bromine' || t === 'water') return <group><mesh position={[0,.32,0]}><cylinderGeometry args={[.24,.28,.62,28]} />{glass}</mesh><mesh position={[0,.19,0]}><cylinderGeometry args={[.23,.25,.35,28]} /><meshStandardMaterial color={materials[t].color} transparent opacity={.82} /></mesh><mesh position={[0,.65,0]}><cylinderGeometry args={[.14,.14,.05,24]} /><meshStandardMaterial color="#53636d" metalness={.6} /></mesh></group>;
  if (t === 'flask') return <group>{liquidMesh}{contents}<mesh position={[0,.35,0]}><cylinderGeometry args={[.14,.39,.7,32,1,true]} />{glass}</mesh><mesh position={[0,.79,0]}><cylinderGeometry args={[.14,.14,.25,24,1,true]} />{glass}</mesh></group>;
  if (t === 'beaker' || t === 'cylinder' || t === 'tube') { const radius = t === 'tube' ? .1 : t === 'cylinder' ? .15 : .31; const height = t === 'tube' ? .7 : t === 'cylinder' ? 1 : .58; return <group>{liquidMesh}{contents}<mesh position={[0,height/2,0]}><cylinderGeometry args={[radius,radius,height,28,1,true]} />{glass}</mesh><mesh position={[0,.025,0]}><cylinderGeometry args={[radius,radius,.05,28]} />{glass}</mesh></group>; }
  if (t === 'rack') return <group><mesh position={[0,.13,0]}><boxGeometry args={[.9,.12,.38]} /><meshStandardMaterial color="#798687" /></mesh>{[-.3,0,.3].map(x=><mesh key={x} position={[x,.36,0]}><cylinderGeometry args={[.09,.09,.38,16,1,true]} /><meshStandardMaterial color="#899b9d" metalness={.5} /></mesh>)}</group>;
  if (t === 'burner') return <group><mesh position={[0,.06,0]}><cylinderGeometry args={[.32,.32,.12,24]} /><meshStandardMaterial color="#475663" metalness={.7} /></mesh><mesh position={[0,.35,0]}><cylinderGeometry args={[.12,.16,.52,24]} /><meshStandardMaterial color="#687880" metalness={.75} /></mesh></group>;
  return <group rotation={[0,0,t === 'rod' ? 1.2 : 0]}><mesh position={[0,.4,0]}><cylinderGeometry args={[t === 'pipette' ? .035 : .025,.025,.8,12]} /><meshStandardMaterial color={t === 'thermometer' ? '#bbd9dc' : '#a3b5b6'} metalness={.25} /></mesh>{t === 'thermometer' && <mesh position={[0,.08,0]}><sphereGeometry args={[.07]} /><meshStandardMaterial color="#b85142" /></mesh>}</group>;
}
function Item({ object, selected, dispatch }: { object: LabObject; selected: boolean; dispatch: React.Dispatch<LabAction> }) {
  const ref = useRef<THREE.Group>(null); const [dragging, setDragging] = useState(false);
  useFrame((_, delta) => { if (ref.current) ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, 0, 8, delta); });
  const move = (e: ThreeEvent<PointerEvent>) => { if (!dragging) return; e.stopPropagation(); const x = THREE.MathUtils.clamp(e.point.x, -3.5, 3.5); const z = THREE.MathUtils.clamp(e.point.z, -1.7, 1.7); if (ref.current) ref.current.position.set(x, 0, z); };
  const end = (e: ThreeEvent<PointerEvent>) => { if (!dragging) return; e.stopPropagation(); setDragging(false); (e.target as Element).releasePointerCapture(e.pointerId); if (ref.current) dispatch({ type: 'move', id: object.id, position: [ref.current.position.x, 0, ref.current.position.z] }); };
  return <group ref={ref} position={[object.position[0], 1.8, object.position[2]]} rotation={[0,object.rotation,0]} onPointerDown={e=>{e.stopPropagation(); dispatch({type:'select',id:object.id});setDragging(true);(e.target as Element).setPointerCapture(e.pointerId)}} onPointerMove={move} onPointerUp={end}>
    {selected && <mesh rotation={[-Math.PI/2,0,0]} position={[0,.012,0]}><ringGeometry args={[.36,.4,32]} /><meshBasicMaterial color="#d5a963" /></mesh>}
    <Model object={object} />
  </group>;
}
export function SandboxScene({ objects, selected, dispatch, transfer }: { objects: LabObject[]; selected: string | null; dispatch: React.Dispatch<LabAction>; transfer?: {source:string;target:string;material:string} | null }) { const from=objects.find(x=>x.id===transfer?.source); const to=objects.find(x=>x.id===transfer?.target); return <Canvas shadows camera={{position:[5,5,7],fov:43}} onPointerMissed={()=>dispatch({type:'select',id:null})}>
  <color attach="background" args={['#dbe5e3']} /><ambientLight intensity={1.8} /><directionalLight position={[3,7,4]} intensity={2.2} castShadow />
  <mesh position={[0,-.16,0]} receiveShadow><boxGeometry args={[8,.3,4.2]} /><meshStandardMaterial color="#aab7b4" roughness={.75} /></mesh>
  <mesh position={[0,-.43,0]}><boxGeometry args={[7.6,.3,3.9]} /><meshStandardMaterial color="#364955" metalness={.3} /></mesh>
  <gridHelper args={[8,16,'#adbfbb','#c5d0cd']} position={[0,.006,0]} />
  {objects.map(x=><Item key={x.id} object={x} selected={x.id===selected} dispatch={dispatch} />)}
  {from&&to&&transfer&&<TransferVisual from={from.position} to={to.position} material={transfer.material}/>}
  <ContactShadows position={[0,.008,0]} opacity={.25} scale={9} blur={2.5} />
  <OrbitControls makeDefault minDistance={4} maxDistance={12} maxPolarAngle={Math.PI/2.1} />
 </Canvas>; }
function TransferVisual({from,to,material}:{from:[number,number,number];to:[number,number,number];material:string}){const midpoint:[number,number,number]=[(from[0]+to[0])/2,.65,(from[2]+to[2])/2];const distance=Math.hypot(to[0]-from[0],to[2]-from[2]);const angle=Math.atan2(to[2]-from[2],to[0]-from[0]);return <group>{material==='hydrogen'?[0,1,2,3,4,5].map(i=><mesh key={i} position={[from[0]+(to[0]-from[0])*i/6,.45+Math.sin(i)*.16,from[2]+(to[2]-from[2])*i/6]}><sphereGeometry args={[.045,10,10]}/><meshBasicMaterial color="#c5f1f4" transparent opacity={.65}/></mesh>):material==='iron'?<mesh position={midpoint}><dodecahedronGeometry args={[.1]}/><meshStandardMaterial color="#859093" metalness={.7}/></mesh>:<mesh position={midpoint} rotation={[0,-angle,Math.PI/2]}><cylinderGeometry args={[.018,.018,Math.max(.3,distance),10]}/><meshStandardMaterial color={material==='bromine'?materials.bromine.color:materials.water.color} transparent opacity={.75}/></mesh>}</group>}
