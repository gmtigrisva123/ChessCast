"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { SIMPLEX3 } from "./glsl";

const VERT = /* glsl */ `
uniform float uTime;
uniform float uTalk;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
${SIMPLEX3}
void main(){
  vec3 n = normalize(normal);
  float slow = snoise(n * 1.5 + uTime * 0.32);
  float fast = snoise(n * 3.6 + uTime * (0.9 + uTalk * 1.6));
  float d = slow * (0.12 + uTalk * 0.14) + fast * (0.02 + uTalk * 0.09);
  vec3 p = position + n * d;
  vNoise = slow;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vNormal = normalize(normalMatrix * n);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;
uniform float uTime;
uniform float uTalk;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
void main(){
  float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 2.2);
  float bands = 0.5 + 0.5 * sin(dot(vNormal, vec3(3.0, 2.0, 1.4)) * 5.0 + uTime * 0.8 + vNoise * 3.0);
  vec3 col = mix(uB, uA, smoothstep(-0.6, 0.8, vNoise + vNormal.y * 0.5));
  col = mix(col, uC, bands * 0.35);
  col += uC * fres * (1.1 + uTalk * 0.8);
  col += vec3(1.0) * pow(max(dot(normalize(vNormal), normalize(vec3(-0.4, 0.6, 0.7))), 0.0), 24.0) * 0.9;
  float core = 1.0 - fres;
  col *= 0.55 + core * 0.55;
  gl_FragColor = vec4(col, 1.0);
}
`;

function Blob({ colors, talking }: { colors: [string, string, string]; talking: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const mesh = useRef<THREE.Mesh>(null!);
  const target = useMemo(() => colors.map((c) => new THREE.Color(c)), [colors]);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uTalk: { value: 0 }, uA: { value: new THREE.Color(colors[0]) }, uB: { value: new THREE.Color(colors[1]) }, uC: { value: new THREE.Color(colors[2]) } }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  useFrame(({ clock }, dt) => {
    const u = mat.current.uniforms;
    u.uTime.value = clock.elapsedTime;
    u.uTalk.value += ((talking ? 1 : 0.25) - u.uTalk.value) * Math.min(1, dt * 4);
    (u.uA.value as THREE.Color).lerp(target[0], Math.min(1, dt * 3));
    (u.uB.value as THREE.Color).lerp(target[1], Math.min(1, dt * 3));
    (u.uC.value as THREE.Color).lerp(target[2], Math.min(1, dt * 3));
    mesh.current.rotation.y += dt * 0.15;
    const s = 1 + Math.sin(clock.elapsedTime * (talking ? 7 : 1.5)) * (talking ? 0.025 : 0.01);
    mesh.current.scale.setScalar(s);
  });
  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.25, 48]} />
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={VERT} fragmentShader={FRAG} />
    </mesh>
  );
}

/** Siri-style fluid voice orb rendered with a noise-displaced, fresnel-lit sphere. */
export default function VoiceOrb({ colors, talking, active = true }: { colors: [string, string, string]; talking: boolean; active?: boolean }) {
  return (
    <Canvas dpr={[1, 2]} frameloop={active ? "always" : "never"} camera={{ fov: 30, position: [0, 0, 6.2] }} gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}>
      <Blob colors={colors} talking={talking} />
    </Canvas>
  );
}
