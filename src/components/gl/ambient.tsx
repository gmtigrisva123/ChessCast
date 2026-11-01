"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { FULLSCREEN_VERT } from "./glsl";

const FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uScroll;
uniform vec2 uRes;
uniform vec2 uMouse;
varying vec2 vUv;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1.,0.)), u.x), mix(hash(i+vec2(0.,1.)), hash(i+vec2(1.,1.)), u.x), u.y);
}
float fbm(vec2 p){ float v = 0.; float a = .5; for (int i = 0; i < 5; i++){ v += a*noise(p); p *= 2.03; a *= .5; } return v; }

vec3 palette(float t){
  vec3 violet = vec3(0.43, 0.36, 1.0);
  vec3 azure  = vec3(0.30, 0.55, 1.0);
  vec3 teal   = vec3(0.24, 0.90, 0.88);
  vec3 ember  = vec3(1.0, 0.54, 0.30);
  t = fract(t);
  if (t < 0.33) return mix(violet, azure, t / 0.33);
  if (t < 0.66) return mix(azure, teal, (t - 0.33) / 0.33);
  return mix(teal, mix(ember, violet, 0.35), (t - 0.66) / 0.34);
}

void main(){
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
  p += uMouse * 0.03;
  float t = uTime * 0.04;
  vec3 col = vec3(0.012, 0.012, 0.03);

  // Aurora ribbons
  for (int i = 0; i < 3; i++){
    float fi = float(i);
    float wave = 0.18 * sin(p.x * (1.2 + fi * 0.5) + t * (3.0 + fi) + fi * 2.1) + 0.12 * (fbm(vec2(p.x * 1.4 + t * 2.0, fi * 3.7)) - 0.5);
    float y = p.y - (0.12 + fi * 0.09) - wave + uScroll * 0.25;
    float band = exp(-abs(y) * (7.0 + fi * 3.0));
    float streak = 0.55 + 0.45 * fbm(vec2(p.x * 6.0 - t * 8.0, fi * 9.1));
    col += palette(0.12 + fi * 0.18 + uScroll * 0.55 + p.x * 0.05) * band * streak * (0.16 - fi * 0.035);
  }

  // Deep nebula haze
  float neb = fbm(p * 1.6 + vec2(t * 1.5, -t));
  col += palette(0.2 + neb * 0.4 + uScroll * 0.5) * pow(neb, 3.0) * 0.18;

  // Perspective chess floor near the bottom
  float horizon = -0.18;
  if (p.y < horizon) {
    float z = 0.42 / (horizon - p.y);
    float x = p.x * z;
    vec2 g = vec2(x, z + uTime * 0.35);
    vec2 cell = floor(g);
    float checker = mod(cell.x + cell.y, 2.0);
    vec2 f = abs(fract(g) - 0.5);
    float line = smoothstep(0.47, 0.5, max(f.x, f.y));
    float fade = smoothstep(14.0, 1.2, z) * smoothstep(horizon, horizon - 0.06, p.y);
    vec3 gc = palette(0.05 + uScroll * 0.5 + x * 0.01);
    col += (gc * line * 0.45 + gc * checker * 0.035) * fade;
  }

  // Stars
  vec2 sp = uv * uRes / 3.0;
  float s = hash(floor(sp));
  float tw = 0.5 + 0.5 * sin(uTime * 2.0 + s * 40.0);
  col += vec3(0.85, 0.85, 1.0) * step(0.9975, s) * tw * 0.6 * smoothstep(-0.1, 0.4, p.y);

  // Vignette
  float v = smoothstep(1.25, 0.25, length(p * vec2(0.8, 1.2)));
  col *= v;
  gl_FragColor = vec4(col, 1.0);
}
`;

function Plane() {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const { size } = useThree();
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uScroll: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uMouse: { value: new THREE.Vector2() } }),
    [],
  );
  const target = useRef({ x: 0, y: 0, s: 0 });
  useEffect(() => {
    const on = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, []);
  useFrame((_, dt) => {
    const u = mat.current.uniforms;
    u.uTime.value += Math.min(dt, 0.1);
    u.uRes.value.set(size.width, size.height);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    target.current.s = max > 0 ? window.scrollY / max : 0;
    u.uScroll.value += (target.current.s - u.uScroll.value) * 0.05;
    u.uMouse.value.x += (target.current.x - u.uMouse.value.x) * 0.04;
    u.uMouse.value.y += (target.current.y - u.uMouse.value.y) * 0.04;
  });
  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={FULLSCREEN_VERT} fragmentShader={FRAG} depthTest={false} depthWrite={false} />
    </mesh>
  );
}

function Driver() {
  const { invalidate } = useThree();
  useEffect(() => {
    let id = 0;
    let last = 0;
    const loop = (t: number) => {
      id = requestAnimationFrame(loop);
      if (document.hidden) return;
      if (t - last < 33) return; // ~30 fps is plenty for a slow ambient field
      last = t;
      invalidate();
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [invalidate]);
  return null;
}

/** Fixed, site-wide living background: aurora ribbons, nebula haze, a perspective chess floor and stars. */
export default function Ambient() {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(!window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  if (!ok) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <Canvas frameloop="demand" dpr={0.6} gl={{ antialias: false, alpha: false, powerPreference: "low-power", stencil: false, depth: false }} camera={{ position: [0, 0, 1] }}>
        <Plane />
        <Driver />
      </Canvas>
    </div>
  );
}
