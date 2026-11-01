"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";

export function StageLights({ shadows = true }: { shadows?: boolean }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <spotLight
        position={[3, 13, 7]}
        angle={0.55}
        penumbra={0.85}
        intensity={260}
        decay={2}
        color="#fff3df"
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <pointLight position={[-7, 3.5, -2]} intensity={60} color="#d8ff3c" distance={22} decay={2} />
      <pointLight position={[7, 3, 4]} intensity={55} color="#ff4d6a" distance={22} decay={2} />
      <pointLight position={[0, 4, -8]} intensity={30} color="#48e5ff" distance={20} decay={2} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.4} position={[0, 7, 0]} rotation-x={Math.PI / 2} scale={[12, 8, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[0, 2, 9]} scale={[14, 3, 1]} color="#fff2dc" />
        <Lightformer form="ring" color="#d8ff3c" intensity={5} position={[-7, 2.5, 1]} scale={3.2} target={[0, 0, 0]} />
        <Lightformer form="rect" color="#ff4d6a" intensity={4} position={[7, 2.5, -1]} scale={[3, 7, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" color="#48e5ff" intensity={2} position={[0, 2, -9]} scale={[10, 2, 1]} target={[0, 0, 0]} />
      </Environment>
    </>
  );
}

export function StageEffects({ enabled = true, bloom = 0.85 }: { enabled?: boolean; bloom?: number }) {
  if (!enabled) return null;
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.2} intensity={bloom} radius={0.72} />
      <Vignette offset={0.28} darkness={0.72} />
    </EffectComposer>
  );
}
