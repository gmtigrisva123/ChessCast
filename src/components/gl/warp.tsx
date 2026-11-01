"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { FULLSCREEN_VERT } from "./glsl";

/** Speed multiplier written by the DOM (scroll velocity). */
export const warpSignal = { speed: 0 };

const FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uZ;
uniform vec2 uRes;
varying vec2 vUv;
vec3 pal(float t){
  vec3 a = vec3(0.43, 0.36, 1.0);
  vec3 b = vec3(0.30, 0.55, 1.0);
  vec3 c = vec3(0.24, 0.90, 0.88);
  vec3 d = vec3(1.0, 0.54, 0.30);
  t = fract(t) * 4.0;
  if (t < 1.0) return mix(a, b, t);
  if (t < 2.0) return mix(b, c, t - 1.0);
  if (t < 3.0) return mix(c, d, t - 2.0);
  return mix(d, a, t - 3.0);
}
void main(){
  vec2 uv = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  float r = length(uv);
  float a = atan(uv.y, uv.x);
  float z = 0.32 / max(r, 0.0005) + uZ;
  float u = a / 6.2831853 * 16.0;
  vec2 cell = floor(vec2(u, z * 1.6));
  float checker = mod(cell.x + cell.y, 2.0);
  vec2 f = abs(fract(vec2(u, z * 1.6)) - 0.5);
  float edge = smoothstep(0.44, 0.5, max(f.x, f.y));
  vec3 aur = pal(a / 6.2831853 + uTime * 0.03 + z * 0.02);
  vec3 tile = mix(vec3(0.02, 0.02, 0.05), aur * 0.22, checker);
  vec3 col = tile + aur * edge * 0.95;
  // depth fog towards the vanishing point, glowing ring, deep black core for the headline
  col *= smoothstep(0.03, 0.42, r);
  col += aur * 0.55 * exp(-abs(r - 0.2) * 22.0);
  col *= smoothstep(1.35, 0.35, r);
  gl_FragColor = vec4(col, 1.0);
}
`;

function Tunnel() {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const { size } = useThree();
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uZ: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } }), []);
  const sp = useRef(0);
  useFrame((_, dt) => {
    const u = mat.current.uniforms;
    const d = Math.min(dt, 0.1);
    u.uTime.value += d;
    sp.current += (0.45 + warpSignal.speed - sp.current) * Math.min(1, d * 2);
    u.uZ.value += d * sp.current;
    u.uRes.value.set(size.width, size.height);
  });
  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={FULLSCREEN_VERT} fragmentShader={FRAG} depthTest={false} depthWrite={false} />
    </mesh>
  );
}

/** Infinite chessboard tunnel — the finale portal. */
export default function Warp({ active = true }: { active?: boolean }) {
  return (
    <Canvas dpr={[1, 1.5]} frameloop={active ? "always" : "never"} gl={{ antialias: false, alpha: false, stencil: false, depth: false }} camera={{ position: [0, 0, 1] }}>
      <Tunnel />
    </Canvas>
  );
}
