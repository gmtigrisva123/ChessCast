"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

export function StageLights({ shadows = true, intensity = 1 }: { shadows?: boolean; intensity?: number }) {
  return (
    <>
      <ambientLight intensity={0.25 * intensity} color="#b9b0ff" />
      <spotLight
        position={[2, 14, 6]}
        angle={0.5}
        penumbra={0.9}
        intensity={240 * intensity}
        decay={2}
        color="#eef0ff"
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <pointLight position={[-8, 3, -2]} intensity={70 * intensity} color="#8b7cff" distance={24} decay={2} />
      <pointLight position={[8, 2.5, 3]} intensity={60 * intensity} color="#3ee6e0" distance={24} decay={2} />
      <pointLight position={[0, 3, -9]} intensity={40 * intensity} color="#ff8a4c" distance={20} decay={2} />
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#06060c"]} />
        <Lightformer form="rect" intensity={2.2} position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[14, 8, 1]} color="#eef0ff" />
        <Lightformer form="rect" intensity={4} position={[-8, 2, 1]} scale={[3, 9, 1]} color="#8b7cff" target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={3.5} position={[8, 2, -1]} scale={[3, 9, 1]} color="#3ee6e0" target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={3} position={[0, 3, 9]} scale={4} color="#ff8a4c" target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.6} position={[0, 1, -10]} scale={[16, 3, 1]} color="#4d8dff" target={[0, 0, 0]} />
      </Environment>
    </>
  );
}

export function StageEffects({ enabled = true, bloom = 0.7, aberration = false }: { enabled?: boolean; bloom?: number; aberration?: boolean }) {
  const offset = useMemo(() => new THREE.Vector2(0.0007, 0.0005), []);
  if (!enabled) return null;
  if (aberration)
    return (
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur luminanceThreshold={0.86} luminanceSmoothing={0.25} intensity={bloom} radius={0.75} />
        <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={offset} radialModulation modulationOffset={0.4} />
        <Vignette offset={0.22} darkness={0.78} />
      </EffectComposer>
    );
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur luminanceThreshold={0.86} luminanceSmoothing={0.25} intensity={bloom} radius={0.75} />
      <Vignette offset={0.22} darkness={0.78} />
    </EffectComposer>
  );
}

const auroraFrag = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1.,0.)), u.x), mix(hash(i+vec2(0.,1.)), hash(i+vec2(1.,1.)), u.x), u.y);
  }
  float fbm(vec2 p){ float v=0.; float a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.02; a*=.5; } return v; }
  void main(){
    vec2 uv = vUv;
    vec2 p = uv * vec2(3.0, 1.6);
    float t = uTime * 0.05;
    float n1 = fbm(p + vec2(t, -t*0.6));
    float n2 = fbm(p*1.3 - vec2(t*0.8, t*0.3) + n1);
    vec3 violet = vec3(0.43, 0.36, 1.0);
    vec3 azure  = vec3(0.30, 0.55, 1.0);
    vec3 teal   = vec3(0.24, 0.90, 0.88);
    vec3 ember  = vec3(1.0, 0.54, 0.30);
    vec3 col = mix(violet, azure, smoothstep(0.25, 0.75, n1));
    col = mix(col, teal, smoothstep(0.55, 0.9, n2) * 0.7);
    col = mix(col, ember, smoothstep(0.78, 0.98, n1*n2*1.6) * 0.35);
    float band = smoothstep(0.0, 0.55, uv.y) * smoothstep(1.0, 0.45, uv.y);
    float vign = smoothstep(0.0, 0.35, uv.x) * smoothstep(1.0, 0.65, uv.x);
    float a = (0.18 + 0.55 * n2) * band * mix(0.55, 1.0, vign) * uIntensity;
    gl_FragColor = vec4(col * a, 1.0);
  }
`;

/** Animated aurora backdrop — gives the glass something to refract. */
export function AuroraBackdrop({ position = [0, 2, -14], scale = [70, 36], intensity = 1 }: { position?: [number, number, number]; scale?: [number, number]; intensity?: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uIntensity: { value: intensity } }), [intensity]);
  useFrame((_, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value += dt;
  });
  return (
    <mesh position={position}>
      <planeGeometry args={scale} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
        fragmentShader={auroraFrag}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
}
