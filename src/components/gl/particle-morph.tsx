"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { getPieceGeometries } from "../three/pieces";
import { SIMPLEX3 } from "./glsl";
import { morphSignal } from "../scene-signals";

/** 0..3 — 0 nebula, 1 king, 2 knight, 3 queen. Written by the DOM, read every frame. */

const VERT = /* glsl */ `
uniform float uT;
uniform float uTime;
uniform float uSize;
uniform float uPR;
attribute vec3 aP0;
attribute vec3 aP1;
attribute vec3 aP2;
attribute vec3 aP3;
attribute vec4 aRnd;
varying vec3 vColor;
varying float vAlpha;
${SIMPLEX3}
void main(){
  float t = clamp(uT, 0.0, 2.9999);
  float seg = floor(t);
  float f = t - seg;
  vec3 a = aP0; vec3 b = aP1;
  if (seg > 0.5) { a = aP1; b = aP2; }
  if (seg > 1.5) { a = aP2; b = aP3; }
  float dly = aRnd.x * 0.42;
  float k = smoothstep(dly, dly + 0.58, f);
  vec3 p = mix(a, b, k);
  float burst = sin(3.14159265 * k);
  p += flow(p * 0.32 + uTime * 0.11) * burst * 1.7;
  p += flow(p * 1.15 + uTime * 0.28) * 0.04;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPR * (0.45 + aRnd.w) / -mv.z;

  vec3 c1 = vec3(0.62, 0.55, 1.0);
  vec3 c2 = vec3(0.32, 0.58, 1.0);
  vec3 c3 = vec3(0.30, 0.95, 0.90);
  vec3 c4 = vec3(1.0, 0.62, 0.38);
  float h = clamp(p.y * 0.14 + 0.5 + (aRnd.y - 0.5) * 0.25, 0.0, 1.0);
  vec3 col = mix(c1, c2, smoothstep(0.0, 0.55, h));
  col = mix(col, c3, smoothstep(0.5, 1.0, h));
  if (aRnd.z > 0.982) col = c4;
  vColor = col * (0.75 + burst * 0.9);
  vAlpha = 0.45 + aRnd.w * 0.55;
}
`;

const FRAG = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  float glow = smoothstep(0.5, 0.0, r);
  float core = smoothstep(0.18, 0.0, r);
  gl_FragColor = vec4(vColor * (glow * 0.9 + core * 0.8), (glow * 0.6 + core) * vAlpha);
}
`;

function sampleShape(geom: THREE.BufferGeometry, n: number, height: number, out: Float32Array) {
  const g = geom.clone();
  g.computeBoundingBox();
  const bb = g.boundingBox!;
  const s = height / (bb.max.y - bb.min.y);
  const cx = (bb.max.x + bb.min.x) / 2;
  const cy = (bb.max.y + bb.min.y) / 2;
  const cz = (bb.max.z + bb.min.z) / 2;
  const sampler = new MeshSurfaceSampler(new THREE.Mesh(g)).build();
  const v = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    sampler.sample(v);
    out[i * 3] = (v.x - cx) * s;
    out[i * 3 + 1] = (v.y - cy) * s;
    out[i * 3 + 2] = (v.z - cz) * s;
  }
  g.dispose();
}

function Cloud({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null!);
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const geometry = useMemo(() => {
    const geoms = getPieceGeometries();
    const p0 = new Float32Array(count * 3);
    const p1 = new Float32Array(count * 3);
    const p2 = new Float32Array(count * 3);
    const p3 = new Float32Array(count * 3);
    const rnd = new Float32Array(count * 4);
    // nebula: a softly spiralling disc
    for (let i = 0; i < count; i++) {
      const r = Math.pow(Math.random(), 0.55) * 6.2;
      const a = Math.random() * Math.PI * 2 + r * 0.85;
      const arm = Math.floor(Math.random() * 3) * ((Math.PI * 2) / 3);
      const g = (Math.random() + Math.random() + Math.random() - 1.5) * 0.45;
      p0[i * 3] = Math.cos(a + arm) * r;
      p0[i * 3 + 1] = g * (1.2 - r / 7);
      p0[i * 3 + 2] = Math.sin(a + arm) * r;
      rnd[i * 4] = Math.random();
      rnd[i * 4 + 1] = Math.random();
      rnd[i * 4 + 2] = Math.random();
      rnd[i * 4 + 3] = Math.random();
    }
    sampleShape(geoms.k, count, 5.0, p1);
    sampleShape(geoms.n, count, 4.2, p2);
    sampleShape(geoms.q, count, 5.0, p3);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p1, 3));
    g.setAttribute("aP0", new THREE.BufferAttribute(p0, 3));
    g.setAttribute("aP1", new THREE.BufferAttribute(p1, 3));
    g.setAttribute("aP2", new THREE.BufferAttribute(p2, 3));
    g.setAttribute("aP3", new THREE.BufferAttribute(p3, 3));
    g.setAttribute("aRnd", new THREE.BufferAttribute(rnd, 4));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);
    return g;
  }, [count]);
  const uniforms = useMemo(() => ({ uT: { value: 0 }, uTime: { value: 0 }, uSize: { value: 30 }, uPR: { value: 1 } }), []);
  const sm = useRef({ t: 0, mx: 0, my: 0 });
  useFrame(({ gl, clock }, dt) => {
    const s = sm.current;
    s.t += (morphSignal.t - s.t) * Math.min(1, dt * 3.2);
    s.mx += (morphSignal.mx - s.mx) * Math.min(1, dt * 2);
    s.my += (morphSignal.my - s.my) * Math.min(1, dt * 2);
    const u = mat.current.uniforms;
    u.uT.value = s.t;
    u.uTime.value = clock.elapsedTime;
    u.uPR.value = gl.getPixelRatio();
    const pts = ref.current;
    const facing = s.t > 1.5 && s.t < 2.5 ? 0.35 : 1; // keep the knight's profile readable
    pts.rotation.y = Math.sin(clock.elapsedTime * 0.25) * 0.5 * facing + s.mx * 0.45 + (s.t < 1 ? clock.elapsedTime * 0.15 : 0);
    pts.rotation.x = s.my * 0.15 + (s.t < 1 ? 0.45 * (1 - s.t) : 0);
  });
  return (
    <points ref={ref} geometry={geometry} frustumCulled={false}>
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={VERT} fragmentShader={FRAG} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function ParticleMorph({ active = true }: { active?: boolean }) {
  const [count, setCount] = useState(16000);
  useEffect(() => {
    if (window.innerWidth < 768) setCount(9000);
  }, []);
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 34, position: [0, 0.2, 13.5], near: 0.1, far: 60 }}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance", stencil: false }}
    >
      <color attach="background" args={["#04040a"]} />
      <Cloud key={count} count={count} />
      <Sparkles count={70} scale={[16, 10, 8]} size={1.4} speed={0.2} color="#cfc8ff" opacity={0.45} />
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={0.15} luminanceSmoothing={0.3} intensity={0.85} radius={0.8} />
        <Vignette offset={0.2} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  );
}
