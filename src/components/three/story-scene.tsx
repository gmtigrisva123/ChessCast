"use client";

import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshReflectorMaterial, PerformanceMonitor, RoundedBox, Sparkles } from "@react-three/drei";
import { Chess, type Square } from "chess.js";
import { ChessBoard3D } from "./chess-board-3d";
import { AuroraBackdrop, StageEffects, StageLights } from "./stage";
import { getGlassMaterial } from "./pieces";
import { applyMove, piecesFromFen } from "@/lib/chess/tracker";
import { evaluate } from "@/lib/chess/engine";
import { commentMove, HOSTS, type HostId, type Line } from "@/lib/hosts";
import { storySignal } from "../scene-signals";


const SCRIPT = [
  "e4", "e5", "Nf3", "d6", "d4", "Bg4", "dxe5", "Bxf3", "Qxf3", "dxe5", "Bc4", "Nf6", "Qb3", "Qe7",
  "Nc3", "c6", "Bg5", "b5", "Nxb5", "cxb5", "Bxb5+", "Nbd7", "O-O-O", "Rd8", "Rxd7", "Rxd7", "Rd1",
  "Qe6", "Bxd7+", "Nxd7", "Qb8+", "Nxb8", "Rd8#",
];
const WHITE = "pawnstorm_23";
const BLACK = "QueenSlayer";
const FOG: Square[] = (["a", "b", "c", "d", "e", "f", "g", "h"] as const).flatMap((f) => [4, 5, 6].map((r) => `${f}${r}` as Square));

const ss = (a: number, b: number, x: number) => THREE.MathUtils.smoothstep(x, a, b);

function useScriptedGame(onLine?: (l: Line) => void) {
  const [state, setState] = useState(() => ({ pieces: piecesFromFen(new Chess().fen()), last: null as null | { from: Square; to: Square }, check: null as Square | null }));
  const chessRef = useRef(new Chess());
  const ply = useRef(0);
  const cb = useRef(onLine);
  cb.current = onLine;
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      const chess = chessRef.current;
      if (ply.current >= SCRIPT.length) {
        timer = setTimeout(() => {
          chessRef.current = new Chess();
          ply.current = 0;
          setState({ pieces: piecesFromFen(chessRef.current.fen()), last: null, check: null });
          timer = setTimeout(step, 2400);
        }, 3200);
        return;
      }
      const before = evaluate(chess);
      const mover = chess.turn();
      const mv = chess.move(SCRIPT[ply.current]);
      const after = evaluate(chess);
      const sign = mover === "w" ? 1 : -1;
      const check = chess.inCheck() ? (chess.findPiece({ type: "k", color: chess.turn() })[0] ?? null) : null;
      setState((s) => ({ pieces: applyMove(s.pieces, mv).pieces, last: { from: mv.from, to: mv.to }, check }));
      const lines = commentMove({
        san: mv.san,
        piece: mv.piece,
        captured: mv.captured,
        to: mv.to,
        player: mover === "w" ? WHITE : BLACK,
        opponent: mover === "w" ? BLACK : WHITE,
        check: chess.inCheck(),
        mate: chess.isCheckmate(),
        castle: mv.isKingsideCastle() || mv.isQueensideCastle(),
        promotion: mv.isPromotion(),
        swing: (after - before) * sign - 40,
        evalAfter: after * sign,
        ply: ply.current,
      });
      storySignal.speaking = lines[0].host;
      cb.current?.(lines[0]);
      ply.current++;
      timer = setTimeout(step, 1900);
    };
    timer = setTimeout(step, 1600);
    return () => clearTimeout(timer);
  }, []);
  return state;
}

const ORB_POS: Record<HostId, [number, number, number]> = {
  gambit: [-3.6, 3.2, -1.2],
  zugzwang: [0, 3.9, -2.8],
  blunder: [3.6, 3.2, -1.2],
};

function HostOrb3D({ id }: { id: HostId }) {
  const ref = useRef<THREE.Mesh>(null!);
  const halo = useRef<THREE.Mesh>(null!);
  const [a, b] = HOSTS[id].orb;
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(b),
        emissive: new THREE.Color(a),
        emissiveIntensity: 0.6,
        roughness: 0.15,
        clearcoat: 1,
        iridescence: 1,
        iridescenceIOR: 1.4,
      }),
    [a, b],
  );
  const pulse = useRef(0);
  useFrame(({ clock }, dt) => {
    const vis = 1 - ss(0.26, 0.38, storySignal.progress);
    const talking = storySignal.speaking === id;
    pulse.current += ((talking ? 1 : 0) - pulse.current) * Math.min(1, dt * 6);
    const k = vis * (0.55 + pulse.current * 0.18 + Math.sin(clock.elapsedTime * (talking ? 9 : 2)) * 0.03 * (talking ? 1 : 0.4));
    ref.current.scale.setScalar(Math.max(0.0001, k));
    mat.emissiveIntensity = 0.5 + pulse.current * 1.6;
    halo.current.scale.setScalar(Math.max(0.0001, vis * (1 + pulse.current * 0.6)));
    (halo.current.material as THREE.MeshBasicMaterial).opacity = 0.25 + pulse.current * 0.45;
  });
  return (
    <Float speed={2} floatIntensity={0.8} rotationIntensity={0.4}>
      <group position={ORB_POS[id]}>
        <mesh ref={ref} material={mat}>
          <sphereGeometry args={[1, 48, 48]} />
        </mesh>
        <mesh ref={halo}>
          <ringGeometry args={[0.82, 0.86, 64]} />
          <meshBasicMaterial color={a} transparent opacity={0.3} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </Float>
  );
}

function ChaosSlab() {
  const ref = useRef<THREE.Group>(null!);
  const glass = getGlassMaterial();
  useFrame(({ clock }) => {
    const p = storySignal.progress;
    const drop = ss(0.36, 0.5, p);
    const out = ss(0.64, 0.72, p);
    const g = ref.current;
    g.position.set(0.6, THREE.MathUtils.lerp(9, 0.55, drop) + out * 6, THREE.MathUtils.lerp(-3, 0.4, drop));
    g.rotation.set(THREE.MathUtils.lerp(-0.4, -Math.PI / 2, drop), clock.elapsedTime * 0.3 * (1 - drop) + drop * 0.35, THREE.MathUtils.lerp(0.6, 0, drop));
    g.scale.setScalar(Math.max(0.0001, ss(0.3, 0.38, p) * (1 - out) * 1.25));
  });
  return (
    <group ref={ref}>
      <RoundedBox args={[1.6, 2.2, 0.08]} radius={0.1} smoothness={4} material={glass} />
      <mesh position={[0, 0, 0.05]}>
        <ringGeometry args={[0.32, 0.36, 48]} />
        <meshBasicMaterial color="#b9b0ff" toneMapped={false} />
      </mesh>
    </group>
  );
}

function Rig() {
  const { camera } = useThree();
  const pos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const sm = useRef(0);
  const A = useMemo(() => new THREE.Vector3(7, 7.5, 9.5), []);
  const B = useMemo(() => new THREE.Vector3(0, 9.5, 9), []);
  const C = useMemo(() => new THREE.Vector3(0.01, 15, 1.2), []);
  useFrame(({ clock }, dt) => {
    sm.current += (storySignal.progress - sm.current) * Math.min(1, dt * 4);
    const p = sm.current;
    const k1 = ss(0.25, 0.42, p);
    const k2 = ss(0.62, 0.8, p);
    pos.copy(A).lerp(B, k1).lerp(C, k2);
    pos.x += Math.sin(clock.elapsedTime * 0.2) * 0.4 * (1 - k2);
    camera.position.copy(pos);
    look.set(0, THREE.MathUtils.lerp(0.6, 0, k1), 0);
    camera.lookAt(look);
  });
  return null;
}

function Scene({ onLine, effects }: { onLine?: (l: Line) => void; effects: boolean }) {
  const game = useScriptedGame(onLine);
  const [fog, setFog] = useState(false);
  const [flash, setFlash] = useState(0);
  useFrame(() => {
    const on = storySignal.progress > 0.47 && storySignal.progress < 0.7;
    if (on !== fog) {
      setFog(on);
      if (on) setFlash((f) => f + 1);
    }
  });
  return (
    <>
      <color attach="background" args={["#050508"]} />
      <fog attach="fog" args={["#050508", 18, 40]} />
      <AuroraBackdrop position={[0, 0, -16]} scale={[80, 40]} intensity={0.7} />
      <StageLights />
      <ChessBoard3D pieces={game.pieces} lastMove={game.last} checkSquare={game.check} fogSquares={fog ? FOG : []} flash={flash} theme="crystal" />
      {(Object.keys(ORB_POS) as HostId[]).map((h) => (
        <HostOrb3D key={h} id={h} />
      ))}
      <ChaosSlab />
      <Sparkles count={60} scale={[16, 6, 16]} size={1.6} speed={0.3} color="#cfc8ff" opacity={0.6} position={[0, 3, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.56, 0]} receiveShadow>
        <planeGeometry args={[70, 70]} />
        <MeshReflectorMaterial
          blur={[400, 120]}
          resolution={512}
          mixBlur={1}
          mixStrength={22}
          roughness={0.85}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#06060c"
          metalness={0.6}
          mirror={0.6}
        />
      </mesh>
      <Rig />
      <StageEffects enabled={effects} bloom={0.65} />
    </>
  );
}

export default function StoryScene({ onLine, active = true }: { onLine?: (l: Line) => void; active?: boolean }) {
  const [dpr, setDpr] = useState(1.5);
  const [effects, setEffects] = useState(true);
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, dpr]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 38, position: [7, 7.5, 9.5], near: 0.1, far: 90 }}
      gl={{ antialias: false, powerPreference: "high-performance", alpha: false, stencil: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <PerformanceMonitor
        onDecline={() => {
          setDpr(1);
          setEffects(false);
        }}
      />
      <Suspense fallback={null}>
        <Scene onLine={onLine} effects={effects} />
      </Suspense>
    </Canvas>
  );
}
