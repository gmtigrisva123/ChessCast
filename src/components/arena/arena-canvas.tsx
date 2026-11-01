"use client";

import * as THREE from "three";
import { memo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerformanceMonitor, Sparkles } from "@react-three/drei";
import type { Square } from "chess.js";
import { ChessBoard3D } from "../three/chess-board-3d";
import { StageEffects, StageLights } from "../three/stage";
import type { PieceMap } from "@/lib/chess/tracker";

type Props = {
  pieces: PieceMap;
  last: { from: Square; to: Square } | null;
  check: Square | null;
  fog: Square[];
  selected: Square | null;
  targets: Square[];
  flash: number;
  shake: number;
  interactive: boolean;
  onSquare: (sq: Square) => void;
  active: boolean;
};

function ArenaCanvasImpl(p: Props) {
  const [dpr, setDpr] = useState(1.6);
  const [fx, setFx] = useState(true);
  const [portrait] = useState(() => (typeof window !== "undefined" ? window.innerWidth < 640 : false));
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, dpr]}
      frameloop={p.active ? "always" : "never"}
      camera={{ fov: 36, position: portrait ? [0, 18, 13.5] : [0, 12.8, 11.6], near: 0.1, far: 80 }}
      gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <PerformanceMonitor
        onDecline={() => {
          setDpr(1);
          setFx(false);
        }}
      />
      <color attach="background" args={["#15161b"]} />
      <fog attach="fog" args={["#15161b", 18, 40]} />
      <StageLights />
      <ChessBoard3D
        pieces={p.pieces}
        lastMove={p.last}
        checkSquare={p.check}
        fogSquares={p.fog}
        selected={p.selected}
        targets={p.targets}
        flash={p.flash}
        shake={p.shake}
        interactive={p.interactive}
        onSquareClick={p.interactive ? p.onSquare : undefined}
      />
      <Sparkles count={50} scale={[16, 6, 16]} size={2} speed={0.3} color="#d8ff3c" opacity={0.5} position={[0, 3, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.56, 0]} receiveShadow>
        <circleGeometry args={[30, 64]} />
        <meshStandardMaterial color="#15161b" roughness={0.95} />
      </mesh>
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={0.12}
        maxPolarAngle={1.18}
        minDistance={8}
        maxDistance={24}
        target={[0, 0, 0.9]}
        rotateSpeed={0.6}
      />
      <StageEffects enabled={fx} bloom={0.75} />
    </Canvas>
  );
}

export default memo(ArenaCanvasImpl);
