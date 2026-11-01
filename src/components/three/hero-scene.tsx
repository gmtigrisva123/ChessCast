"use client";

import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, PerformanceMonitor, Sparkles } from "@react-three/drei";
import { Chess, type Square } from "chess.js";
import { ChessBoard3D } from "./chess-board-3d";
import { StageEffects, StageLights } from "./stage";
import { cardTexture, titleTexture } from "./textures";
import { applyMove, piecesFromFen, type PieceMap } from "@/lib/chess/tracker";
import { evaluate } from "@/lib/chess/engine";
import { CHAOS_CARDS } from "@/lib/catalog";
import { commentMove, type Line } from "@/lib/hosts";

/** Tín hiệu dùng chung giữa DOM và cảnh 3D (không gây re-render). */
export const heroSignal = { progress: 0, mx: 0, my: 0, chaos: false };

// Ván “Opera” kinh điển — đầy hy sinh và kết thúc bằng chiếu hết.
const SCRIPT = [
  "e4", "e5", "Nf3", "d6", "d4", "Bg4", "dxe5", "Bxf3", "Qxf3", "dxe5", "Bc4", "Nf6", "Qb3", "Qe7",
  "Nc3", "c6", "Bg5", "b5", "Nxb5", "cxb5", "Bxb5+", "Nbd7", "O-O-O", "Rd8", "Rxd7", "Rxd7", "Rd1",
  "Qe6", "Bxd7+", "Nxd7", "Qb8+", "Nxb8", "Rd8#",
];
const WHITE = "tốt_thí_123";
const BLACK = "HậuĐen_VN";
const FOG_SQUARES: Square[] = (["a", "b", "c", "d", "e", "f", "g", "h"] as const).flatMap((f) =>
  [4, 5].map((r) => `${f}${r}` as Square),
);

function useScriptedGame(onLine?: (l: Line, ply: number) => void) {
  const [state, setState] = useState(() => ({
    pieces: piecesFromFen(new Chess().fen()),
    last: null as null | { from: Square; to: Square },
    check: null as Square | null,
  }));
  const chessRef = useRef(new Chess());
  const ply = useRef(0);
  const cb = useRef(onLine);
  cb.current = onLine;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      const chess = chessRef.current;
      if (ply.current >= SCRIPT.length) {
        // reset sau khi chiếu hết
        timer = setTimeout(() => {
          chessRef.current = new Chess();
          ply.current = 0;
          setState({ pieces: piecesFromFen(chessRef.current.fen()), last: null, check: null });
          timer = setTimeout(step, 2600);
        }, 3400);
        return;
      }
      const before = evaluate(chess);
      const mover = chess.turn();
      const mv = chess.move(SCRIPT[ply.current]);
      const after = evaluate(chess);
      const sign = mover === "w" ? 1 : -1;
      let checkSq: Square | null = null;
      if (chess.inCheck()) {
        const k = chess.findPiece({ type: "k", color: chess.turn() })[0];
        checkSq = k ?? null;
      }
      setState((s) => ({ pieces: applyMove(s.pieces, mv).pieces, last: { from: mv.from, to: mv.to }, check: checkSq }));
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
      cb.current?.(lines[0], ply.current);
      ply.current++;
      timer = setTimeout(step, chess.isCheckmate() ? 1200 : 1900);
    };
    timer = setTimeout(step, 2400);
    return () => clearTimeout(timer);
  }, []);
  return state;
}

function TitleBackdrop() {
  const tex = useMemo(() => titleTexture("CHESSCAST"), []);
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    const p = heroSignal.progress;
    ref.current.position.y = 2.6 + p * 3;
    (ref.current.material as THREE.MeshBasicMaterial).opacity = 1 - p * 0.8;
  });
  return (
    <mesh ref={ref} position={[-1.5, 3.2, -11]}>
      <planeGeometry args={[34, 8.5]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

function FloatingCards() {
  const cards = useMemo(
    () => [
      { card: CHAOS_CARDS[0], pos: [-3.2, 4.4, -6.5] as const, rot: [0.1, 0.4, 0.12] as const },
      { card: CHAOS_CARDS[2], pos: [6.2, 3.4, -2.6] as const, rot: [0.05, -0.6, -0.14] as const },
      { card: CHAOS_CARDS[1], pos: [5.4, 1.6, 3.4] as const, rot: [-0.2, -0.4, 0.2] as const },
    ],
    [],
  );
  const textures = useMemo(() => cards.map((c) => cardTexture(c.card)), [cards]);
  const group = useRef<THREE.Group>(null!);
  useFrame(() => {
    const p = heroSignal.progress;
    group.current.children.forEach((child, i) => {
      // khi cuộn: lá bài thứ 2 lao xuống bàn cờ
      if (i === 1) {
        const k = THREE.MathUtils.smoothstep(p, 0.3, 0.55);
        child.position.set(
          THREE.MathUtils.lerp(6.2, 0.4, k),
          THREE.MathUtils.lerp(3.4, 0.25, k),
          THREE.MathUtils.lerp(-2.6, 0.2, k),
        );
        child.rotation.set(THREE.MathUtils.lerp(0.05, -Math.PI / 2, k), THREE.MathUtils.lerp(-0.6, 0, k), THREE.MathUtils.lerp(-0.14, 0.3, k));
        child.scale.setScalar(THREE.MathUtils.lerp(1, 1.5, k));
      } else {
        child.position.y = cards[i].pos[1] + p * 2;
      }
    });
  });
  return (
    <group ref={group}>
      {cards.map((c, i) => (
        <group key={c.card.id} position={c.pos as unknown as THREE.Vector3Tuple} rotation={c.rot as unknown as THREE.Vector3Tuple}>
          <Float speed={1.6 + i * 0.3} rotationIntensity={0.5} floatIntensity={0.8}>
            <mesh castShadow>
              <planeGeometry args={[1.6, 2.3]} />
              <meshPhysicalMaterial
                map={textures[i]}
                side={THREE.DoubleSide}
                roughness={0.25}
                metalness={0.1}
                clearcoat={1}
                transparent
                emissive={new THREE.Color(c.card.accent)}
                emissiveIntensity={0.08}
              />
            </mesh>
          </Float>
        </group>
      ))}
    </group>
  );
}

function CameraRig({ mobile }: { mobile: boolean }) {
  const { camera } = useThree();
  const look = useMemo(() => new THREE.Vector3(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const sm = useRef({ mx: 0, my: 0, p: 0 });
  useFrame((_, dt) => {
    const s = sm.current;
    const k = Math.min(1, dt * 3.2);
    s.mx += (heroSignal.mx - s.mx) * k;
    s.my += (heroSignal.my - s.my) * k;
    s.p += (heroSignal.progress - s.p) * Math.min(1, dt * 6);
    const p = s.p;
    const angle = THREE.MathUtils.lerp(0.32, -0.25, p) + s.mx * 0.18;
    const radius = THREE.MathUtils.lerp(mobile ? 17 : 15.2, mobile ? 14 : 12, p);
    const height = THREE.MathUtils.lerp(mobile ? 10.5 : 8.2, 13.5, p) - s.my * 0.9;
    pos.set(Math.sin(angle) * radius, height, Math.cos(angle) * radius);
    camera.position.copy(pos);
    look.set(mobile ? 0 : THREE.MathUtils.lerp(-3.4, -1.2, p), mobile ? 2.2 : 0.6, mobile ? 1 : 0);
    camera.lookAt(look);
  });
  return null;
}

function Scene({ mobile, onLine, effects }: { mobile: boolean; onLine?: (l: Line, ply: number) => void; effects: boolean }) {
  const game = useScriptedGame(onLine);
  const [chaos, setChaos] = useState(false);
  const [flash, setFlash] = useState(0);
  const boardRef = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    const on = heroSignal.progress > 0.5;
    if (on !== chaos) {
      setChaos(on);
      if (on) setFlash((f) => f + 1);
    }
    boardRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.15) * 0.06 - heroSignal.progress * 0.5;
  });
  return (
    <>
      <color attach="background" args={["#121317"]} />
      <fog attach="fog" args={["#121317", 16, 36]} />
      <StageLights shadows={!mobile} />
      <TitleBackdrop />
      <group ref={boardRef}>
        <ChessBoard3D pieces={game.pieces} lastMove={game.last} checkSquare={game.check} fogSquares={chaos ? FOG_SQUARES : []} flash={flash} />
      </group>
      <FloatingCards />
      <Sparkles count={mobile ? 40 : 90} scale={[18, 8, 18]} size={2.2} speed={0.35} color="#d8ff3c" opacity={0.6} position={[0, 3, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.56, 0]} receiveShadow>
        <circleGeometry args={[30, 64]} />
        <meshStandardMaterial color="#121317" roughness={0.9} />
      </mesh>
      <CameraRig mobile={mobile} />
      <StageEffects enabled={effects} />
    </>
  );
}

export default function HeroScene({ onLine, active = true }: { onLine?: (l: Line, ply: number) => void; active?: boolean }) {
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
      shadows="percentage"
      dpr={[1, dpr]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 34, position: [0, 7.4, 12.6], near: 0.1, far: 80 }}
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
        onIncline={() => setDpr(1.6)}
      />
      <Suspense fallback={null}>
        <Scene mobile={mobile} onLine={onLine} effects={effects} />
      </Suspense>
    </Canvas>
  );
}
