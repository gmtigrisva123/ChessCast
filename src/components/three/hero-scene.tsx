"use client";

import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, PerformanceMonitor, RoundedBox, Sparkles } from "@react-three/drei";
import type { PieceSymbol } from "chess.js";
import { AuroraBackdrop, StageEffects, StageLights } from "./stage";
import { getGlassMaterial, getPieceGeometries, getPieceMaterials } from "./pieces";

/** Tín hiệu dùng chung giữa DOM và cảnh 3D (không gây re-render). */
export const heroSignal = { progress: 0, mx: 0, my: 0 };

const ORBIT: { type: PieceSymbol; color: "w" | "b" }[] = [
  { type: "q", color: "w" },
  { type: "n", color: "b" },
  { type: "p", color: "w" },
  { type: "r", color: "b" },
  { type: "b", color: "w" },
  { type: "p", color: "b" },
  { type: "n", color: "w" },
  { type: "q", color: "b" },
  { type: "p", color: "w" },
  { type: "b", color: "b" },
];

function Centerpiece() {
  const geoms = getPieceGeometries();
  const glass = getGlassMaterial();
  const ref = useRef<THREE.Group>(null!);
  const sm = useRef({ mx: 0, my: 0 });
  useFrame(({ clock }, dt) => {
    const s = sm.current;
    s.mx += (heroSignal.mx - s.mx) * Math.min(1, dt * 2.5);
    s.my += (heroSignal.my - s.my) * Math.min(1, dt * 2.5);
    const g = ref.current;
    g.rotation.y = clock.elapsedTime * 0.25 + s.mx * 0.5 + heroSignal.progress * 2.2;
    g.rotation.x = s.my * 0.12;
    g.rotation.z = -s.mx * 0.06;
    g.position.y = -3.0 + Math.sin(clock.elapsedTime * 0.8) * 0.08;
  });
  return (
    <group ref={ref} position={[0, -3.0, 0]}>
      <mesh geometry={geoms.k} material={glass} scale={3.3} />
    </group>
  );
}

function Halo() {
  const ring = useRef<THREE.Mesh>(null!);
  const disc = useRef<THREE.Mesh>(null!);
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(160,150,255,0.85)");
    g.addColorStop(0.35, "rgba(110,92,255,0.35)");
    g.addColorStop(0.7, "rgba(62,230,224,0.08)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  useFrame(({ clock }) => {
    ring.current.rotation.z = clock.elapsedTime * 0.4;
    const s = 1 + Math.sin(clock.elapsedTime * 1.3) * 0.03;
    disc.current.scale.set(s, s, 1);
  });
  return (
    <group position={[0, -3.05, 0]}>
      <mesh ref={disc} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9, 9]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <torusGeometry args={[2.05, 0.012, 16, 160]} />
        <meshBasicMaterial color="#b9b0ff" toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <torusGeometry args={[3.1, 0.006, 16, 200]} />
        <meshBasicMaterial color="#3ee6e0" toneMapped={false} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function Orbit() {
  const geoms = getPieceGeometries();
  const mats = getPieceMaterials();
  const group = useRef<THREE.Group>(null!);
  const pieces = useRef<THREE.Group[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const p = heroSignal.progress;
    group.current.rotation.y = t * 0.12 + p * 3;
    const spread = 1 + p * 0.9;
    pieces.current.forEach((g, i) => {
      if (!g) return;
      const a = (i / ORBIT.length) * Math.PI * 2;
      const r = 4.6 * spread;
      g.position.set(Math.cos(a) * r, Math.sin(t * 0.9 + i) * 0.35 + (i % 2 ? 0.4 : -0.3), Math.sin(a) * r);
      g.rotation.set(Math.sin(t * 0.5 + i) * 0.25, t * 0.6 + i, Math.cos(t * 0.4 + i) * 0.2);
    });
  });
  return (
    <group ref={group} position={[0, -1.7, 0]} rotation={[0.18, 0, -0.06]}>
      {ORBIT.map((o, i) => (
        <group key={i} ref={(el) => void (el && (pieces.current[i] = el))}>
          <mesh geometry={geoms[o.type]} material={mats[o.color]} scale={0.95} position={[0, -0.5, 0]} />
        </group>
      ))}
    </group>
  );
}

function Shards() {
  const glass = getGlassMaterial();
  const items = useMemo(
    () => [
      { pos: [-5.8, 2.2, -1.5], rot: [0.2, 0.6, 0.15], s: 1 },
      { pos: [5.6, 2.8, -2.2], rot: [-0.1, -0.7, -0.2], s: 0.85 },
      { pos: [4.4, -1.4, 2.2], rot: [0.3, -0.4, 0.35], s: 0.7 },
      { pos: [-4.6, -1.8, 2.4], rot: [-0.25, 0.5, -0.3], s: 0.6 },
    ],
    [],
  );
  const group = useRef<THREE.Group>(null!);
  useFrame(() => {
    group.current.position.y = heroSignal.progress * 3;
  });
  return (
    <group ref={group}>
      {items.map((it, i) => (
        <Float key={i} speed={1.2 + i * 0.25} rotationIntensity={0.8} floatIntensity={1.2}>
          <RoundedBox args={[1.2, 1.6, 0.06]} radius={0.08} smoothness={4} position={it.pos as THREE.Vector3Tuple} rotation={it.rot as THREE.Vector3Tuple} scale={it.s} material={glass} />
        </Float>
      ))}
    </group>
  );
}

function Rig({ mobile }: { mobile: boolean }) {
  const { camera } = useThree();
  const look = useMemo(() => new THREE.Vector3(0, 0.9, 0), []);
  const sm = useRef({ mx: 0, my: 0, p: 0 });
  useFrame((_, dt) => {
    const s = sm.current;
    s.mx += (heroSignal.mx - s.mx) * Math.min(1, dt * 2);
    s.my += (heroSignal.my - s.my) * Math.min(1, dt * 2);
    s.p += (heroSignal.progress - s.p) * Math.min(1, dt * 5);
    const dist = (mobile ? 17 : 12.5) - s.p * 3;
    camera.position.set(s.mx * 1.4, 0.9 - s.my * 0.6 + s.p * 2.5, dist);
    look.set(0, 0.9 - s.p * 0.8, 0);
    camera.lookAt(look);
  });
  return null;
}

function Scene({ mobile, effects }: { mobile: boolean; effects: boolean }) {
  return (
    <>
      <color attach="background" args={["#050508"]} />
      <fog attach="fog" args={["#050508", 14, 34]} />
      <AuroraBackdrop position={[0, -7, -14]} intensity={0.5} />
      <StageLights shadows={false} intensity={0.9} />
      <Centerpiece />
      <Halo />
      <Orbit />
      <Shards />
      <Sparkles count={mobile ? 50 : 110} scale={[20, 10, 12]} size={1.6} speed={0.25} color="#cfc8ff" opacity={0.7} />
      <Rig mobile={mobile} />
      <StageEffects enabled={effects} bloom={0.8} aberration />
    </>
  );
}

export default function HeroScene({ active = true }: { active?: boolean }) {
  const [mobile, setMobile] = useState(false);
  const [dpr, setDpr] = useState(1.6);
  const [effects, setEffects] = useState(true);
  useEffect(() => {
    const m = window.matchMedia("(max-width: 767px)");
    const on = () => setMobile(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return (
    <Canvas
      dpr={[1, dpr]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 36, position: [0, 0.9, 12.5], near: 0.1, far: 90 }}
      gl={{ antialias: false, powerPreference: "high-performance", alpha: false, stencil: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
      }}
    >
      <PerformanceMonitor
        onDecline={() => {
          setDpr(1);
          setEffects(false);
        }}
        onIncline={() => setDpr(1.6)}
      />
      <Suspense fallback={null}>
        <Scene mobile={mobile} effects={effects} />
      </Suspense>
    </Canvas>
  );
}
