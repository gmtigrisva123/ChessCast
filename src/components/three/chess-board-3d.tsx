"use client";

import * as THREE from "three";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox, useCursor } from "@react-three/drei";
import type { Square } from "chess.js";
import type { PieceMap, TrackedPiece } from "@/lib/chess/tracker";
import { FILES, squareToXZ } from "@/lib/chess/engine";
import { getPieceGeometries, getPieceMaterials } from "./pieces";

const LIGHT = new THREE.Color("#7d82ad");
const DARK = new THREE.Color("#171928");

export type BoardProps = {
  pieces: PieceMap;
  lastMove?: { from: Square; to: Square } | null;
  selected?: Square | null;
  targets?: Square[];
  checkSquare?: Square | null;
  fogSquares?: Square[];
  onSquareClick?: (sq: Square) => void;
  interactive?: boolean;
  flash?: number;
  shake?: number;
  accent?: string;
  intro?: boolean;
};

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutBounce = (x: number) => {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (x < 1 / d1) return n1 * x * x;
  if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
  if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
  return n1 * (x -= 2.625 / d1) * x + 0.984375;
};

function idxToSquare(i: number): Square {
  const f = i % 8;
  const r = Math.floor(i / 8);
  return `${FILES[f]}${r + 1}` as Square;
}

function AnimatedPiece({
  p,
  hidden,
  lifted,
  intro,
  onClick,
  interactive,
}: {
  p: TrackedPiece;
  hidden: boolean;
  lifted: boolean;
  intro: boolean;
  onClick?: (sq: Square) => void;
  interactive?: boolean;
}) {
  const geoms = getPieceGeometries();
  const mats = getPieceMaterials();
  const ref = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered && !!interactive);
  const a = useRef({
    from: new THREE.Vector3(),
    to: new THREE.Vector3(),
    t: 1,
    dur: 0.6,
    arc: 0.5,
    delay: 0,
    first: true,
    lift: 0,
  });

  useLayoutEffect(() => {
    const [x, z] = squareToXZ(p.square);
    const s = a.current;
    const g = ref.current;
    if (s.first) {
      s.first = false;
      s.to.set(x, 0, z);
      if (intro) {
        s.from.set(x, 6 + Math.random() * 3, z);
        g.position.copy(s.from);
        s.t = 0;
        s.dur = 1.1;
        s.arc = 0;
        // xếp quân rơi theo hàng
        const rank = Number(p.square[1]);
        s.delay = 0.15 + (p.color === "w" ? rank : 9 - rank) * 0.09 + (p.square.charCodeAt(0) - 97) * 0.03;
      } else {
        g.position.copy(s.to);
        s.t = 1;
      }
      return;
    }
    s.from.copy(g.position);
    s.to.set(x, 0, z);
    const dist = Math.hypot(s.from.x - s.to.x, s.from.z - s.to.z);
    s.t = 0;
    s.delay = 0;
    s.dur = 0.38 + Math.min(0.45, dist * 0.07);
    s.arc = p.type === "n" ? 1.0 : Math.min(0.9, 0.18 + dist * 0.1);
  }, [p.square, p.color, p.type, intro]);

  useFrame((_, dt) => {
    const s = a.current;
    const g = ref.current;
    if (!g) return;
    const targetLift = lifted ? 0.32 : hovered && interactive ? 0.1 : 0;
    s.lift += (targetLift - s.lift) * Math.min(1, dt * 12);
    if (s.t < 1) {
      if (s.delay > 0) {
        s.delay -= dt;
        return;
      }
      s.t = Math.min(1, s.t + dt / s.dur);
      if (s.arc === 0) {
        const e = easeOutBounce(s.t);
        g.position.set(s.to.x, THREE.MathUtils.lerp(s.from.y, s.to.y, e), s.to.z);
      } else {
        const e = easeInOutCubic(s.t);
        g.position.lerpVectors(s.from, s.to, e);
        g.position.y += Math.sin(Math.PI * s.t) * s.arc;
        g.rotation.y = (p.type === "n" ? (p.color === "w" ? -Math.PI / 2 : Math.PI / 2) : 0) + Math.sin(Math.PI * s.t) * 0.4;
      }
    } else {
      g.position.y = s.to.y + s.lift;
    }
  });

  const rotY = p.type === "n" ? (p.color === "w" ? -Math.PI / 2 : Math.PI / 2) : 0;

  return (
    <group ref={ref} rotation={[0, rotY, 0]} visible={!hidden}>
      <mesh
        geometry={geoms[p.type]}
        material={mats[p.color]}
        castShadow
        receiveShadow
        onClick={(e) => {
          if (!onClick) return;
          e.stopPropagation();
          onClick(p.square);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      />
    </group>
  );
}

type GhostT = { key: string; piece: TrackedPiece; start: number; dir: THREE.Vector3; spin: number };

function Ghost({ g }: { g: GhostT }) {
  const geoms = getPieceGeometries();
  const mats = getPieceMaterials();
  const ref = useRef<THREE.Group>(null!);
  const [x, z] = squareToXZ(g.piece.square);
  useFrame(({ clock }) => {
    const t = Math.min(1, (clock.elapsedTime - g.start) / 1.1);
    const grp = ref.current;
    if (!grp) return;
    grp.position.set(x + g.dir.x * t * 6, Math.sin(Math.min(1, t * 1.2) * Math.PI) * 2.2 + t * 1.5, z + g.dir.z * t * 6);
    grp.rotation.set(t * g.spin, t * g.spin * 0.7, t * g.spin * 0.4);
    const s = Math.max(0.001, 1 - t * t);
    grp.scale.setScalar(s);
  });
  return (
    <group ref={ref} position={[x, 0, z]}>
      <mesh geometry={geoms[g.piece.type]} material={mats[g.piece.color]} castShadow />
    </group>
  );
}

const fogVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const fogFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColor;
  uniform vec2 uScale;
  varying vec2 vUv;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), u.x), mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y);
  }
  float fbm(vec2 p){ float v=0.0; float a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.03; a*=0.5; } return v; }
  void main(){
    vec2 p = vUv * uScale;
    float n = fbm(p + vec2(uTime*0.18, uTime*0.07));
    float n2 = fbm(p*1.6 - vec2(uTime*0.12, -uTime*0.05));
    float edge = smoothstep(0.0,0.08,vUv.x)*smoothstep(1.0,0.92,vUv.x)*smoothstep(0.0,0.12,vUv.y)*smoothstep(1.0,0.88,vUv.y);
    float a = clamp(0.74 + (n*n2)*1.2, 0.0, 1.0) * edge * uOpacity;
    vec3 col = mix(uColor, vec3(0.95,0.97,1.0), n*0.55);
    gl_FragColor = vec4(col, a);
  }
`;

function Fog({ squares }: { squares: Square[] }) {
  const matA = useRef<THREE.ShaderMaterial>(null!);
  const matB = useRef<THREE.ShaderMaterial>(null!);
  const opacity = useRef(0);
  const rect = useMemo(() => {
    if (!squares.length) return null;
    let minX = Infinity,
      maxX = -Infinity,
      minZ = Infinity,
      maxZ = -Infinity;
    for (const s of squares) {
      const [x, z] = squareToXZ(s);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
    }
    return { cx: (minX + maxX) / 2, cz: (minZ + maxZ) / 2, w: maxX - minX + 1.4, d: maxZ - minZ + 1.4 };
  }, [squares]);
  const last = useRef(rect);
  if (rect) last.current = rect;
  const uniformsA = useMemo(
    () => ({ uTime: { value: 0 }, uOpacity: { value: 0 }, uColor: { value: new THREE.Color("#4a5b80") }, uScale: { value: new THREE.Vector2(4, 2) } }),
    [],
  );
  const uniformsB = useMemo(
    () => ({ uTime: { value: 10 }, uOpacity: { value: 0 }, uColor: { value: new THREE.Color("#9fb3d9") }, uScale: { value: new THREE.Vector2(3, 1.5) } }),
    [],
  );
  useFrame((_, dt) => {
    const target = squares.length ? 1 : 0;
    opacity.current += (target - opacity.current) * Math.min(1, dt * 3);
    if (matA.current) {
      matA.current.uniforms.uTime.value += dt;
      matA.current.uniforms.uOpacity.value = opacity.current;
    }
    if (matB.current) {
      matB.current.uniforms.uTime.value += dt * 1.3;
      matB.current.uniforms.uOpacity.value = opacity.current * 0.85;
    }
  });
  const r = last.current;
  if (!r) return null;
  return (
    <group position={[r.cx, 0, r.cz]}>
      {[0.25, 0.7, 1.15].map((y, i) => (
        <mesh key={y} rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} renderOrder={10 + i}>
          <planeGeometry args={[r.w, r.d]} />
          <shaderMaterial
            ref={i === 1 ? matB : i === 0 ? matA : undefined}
            vertexShader={fogVertex}
            fragmentShader={fogFragment}
            uniforms={i === 1 ? uniformsB : uniformsA}
            transparent
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function SquareMarker({ sq, color, opacity = 0.55, size = 0.96, y = 0.004 }: { sq: Square; color: string; opacity?: number; size?: number; y?: number }) {
  const [x, z] = squareToXZ(sq);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, y, z]}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function TargetDot({ sq, capture }: { sq: Square; capture: boolean }) {
  const [x, z] = squareToXZ(sq);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.006, z]}>
      {capture ? <ringGeometry args={[0.36, 0.46, 40]} /> : <circleGeometry args={[0.13, 32]} />}
      <meshBasicMaterial color="#3ee6e0" transparent opacity={0.9} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

export function ChessBoard3D({
  pieces,
  lastMove,
  selected,
  targets = [],
  checkSquare,
  fogSquares = [],
  onSquareClick,
  interactive,
  flash = 0,
  shake = 0,
  accent = "#8b7cff",
  intro = true,
}: BoardProps) {
  const sqRef = useRef<THREE.InstancedMesh>(null!);
  const group = useRef<THREE.Group>(null!);
  const flashMat = useRef<THREE.MeshBasicMaterial>(null!);
  const flashT = useRef(1);
  const shakeT = useRef(1);
  const [hoverSq, setHoverSq] = useState<Square | null>(null);
  useCursor(!!hoverSq && !!interactive);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    for (let i = 0; i < 64; i++) {
      const sq = idxToSquare(i);
      const [x, z] = squareToXZ(sq);
      m.makeTranslation(x, -0.06, z);
      sqRef.current.setMatrixAt(i, m);
      const f = i % 8;
      const r = Math.floor(i / 8);
      sqRef.current.setColorAt(i, (f + r) % 2 === 0 ? DARK : LIGHT);
    }
    sqRef.current.instanceMatrix.needsUpdate = true;
    if (sqRef.current.instanceColor) sqRef.current.instanceColor.needsUpdate = true;
  }, []);

  useEffect(() => {
    if (flash) flashT.current = 0;
  }, [flash]);
  useEffect(() => {
    if (shake) shakeT.current = 0;
  }, [shake]);

  useFrame((_, dt) => {
    if (flashT.current < 1) {
      flashT.current = Math.min(1, flashT.current + dt / 0.9);
      if (flashMat.current) flashMat.current.opacity = (1 - flashT.current) * 0.55;
    } else if (flashMat.current && flashMat.current.opacity !== 0) flashMat.current.opacity = 0;
    if (shakeT.current < 1) {
      shakeT.current = Math.min(1, shakeT.current + dt / 1.1);
      const k = (1 - shakeT.current) * 0.18;
      group.current.position.set((Math.random() - 0.5) * k, (Math.random() - 0.5) * k * 0.5, (Math.random() - 0.5) * k);
      group.current.rotation.z = (Math.random() - 0.5) * k * 0.15;
    } else if (group.current.position.lengthSq() > 0) {
      group.current.position.set(0, 0, 0);
      group.current.rotation.z = 0;
    }
  });

  // Ghosts cho quân bị ăn
  const prev = useRef<PieceMap>(pieces);
  const [ghosts, setGhosts] = useState<GhostT[]>([]);
  const clockRef = useRef(0);
  useFrame(({ clock }) => {
    clockRef.current = clock.elapsedTime;
  });
  useEffect(() => {
    const removed: GhostT[] = [];
    for (const id in prev.current) {
      if (!pieces[id]) {
        const angle = Math.random() * Math.PI * 2;
        removed.push({
          key: id + "_" + Math.random().toString(36).slice(2, 6),
          piece: prev.current[id],
          start: clockRef.current,
          dir: new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)),
          spin: 6 + Math.random() * 6,
        });
      }
    }
    prev.current = pieces;
    if (removed.length) {
      setGhosts((g) => [...g, ...removed]);
      const keys = new Set(removed.map((r) => r.key));
      const t = setTimeout(() => setGhosts((g) => g.filter((x) => !keys.has(x.key))), 1300);
      return () => clearTimeout(t);
    }
  }, [pieces]);

  const fogSet = useMemo(() => new Set(fogSquares), [fogSquares]);
  const pieceList = useMemo(() => Object.values(pieces), [pieces]);
  const occupied = useMemo(() => new Set(pieceList.map((p) => p.square)), [pieceList]);

  const handleSquare = (e: ThreeEvent<MouseEvent>) => {
    if (!onSquareClick || e.instanceId === undefined) return;
    e.stopPropagation();
    onSquareClick(idxToSquare(e.instanceId));
  };

  return (
    <group ref={group}>
      {/* Khung bàn cờ */}
      <RoundedBox args={[9.1, 0.42, 9.1]} radius={0.16} smoothness={4} position={[0, -0.33, 0]} receiveShadow castShadow>
        <meshPhysicalMaterial color="#090a12" roughness={0.18} metalness={0.7} clearcoat={1} clearcoatRoughness={0.08} iridescence={0.6} iridescenceIOR={1.4} />
      </RoundedBox>
      {/* Viền phát sáng */}
      {[
        [0, 4.035, 8.1, 0.035],
        [0, -4.035, 8.1, 0.035],
        [4.035, 0, 0.035, 8.1],
        [-4.035, 0, 0.035, 8.1],
      ].map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, -0.075, z]}>
          <boxGeometry args={[w, 0.03, d]} />
          <meshBasicMaterial color={i < 2 ? accent : "#3ee6e0"} toneMapped={false} />
        </mesh>
      ))}
      {/* Nhãn cột/hàng */}
      <BoardLabels />
      {/* Ô cờ */}
      <instancedMesh
        ref={sqRef}
        args={[undefined, undefined, 64]}
        receiveShadow
        onClick={handleSquare}
        onPointerMove={(e) => {
          if (!interactive || e.instanceId === undefined) return;
          e.stopPropagation();
          setHoverSq(idxToSquare(e.instanceId));
        }}
        onPointerOut={() => setHoverSq(null)}
      >
        <boxGeometry args={[1, 0.12, 1]} />
        <meshPhysicalMaterial roughness={0.28} metalness={0.15} clearcoat={1} clearcoatRoughness={0.12} />
      </instancedMesh>

      {/* Đánh dấu */}
      {lastMove && (
        <>
          <SquareMarker sq={lastMove.from} color="#8b7cff" opacity={0.3} />
          <SquareMarker sq={lastMove.to} color="#8b7cff" opacity={0.5} />
        </>
      )}
      {selected && <SquareMarker sq={selected} color="#3ee6e0" opacity={0.45} />}
      {interactive && hoverSq && hoverSq !== selected && <SquareMarker sq={hoverSq} color="#ffffff" opacity={0.12} />}
      {targets.map((t) => (
        <TargetDot key={t} sq={t} capture={occupied.has(t)} />
      ))}
      {checkSquare && <SquareMarker sq={checkSquare} color="#ff4f7b" opacity={0.75} />}

      {/* Quân cờ */}
      {pieceList.map((p) => (
        <AnimatedPiece
          key={p.id}
          p={p}
          hidden={fogSet.has(p.square)}
          lifted={selected === p.square}
          intro={intro}
          onClick={onSquareClick}
          interactive={interactive}
        />
      ))}
      {ghosts.map((g) => (
        <Ghost key={g.key} g={g} />
      ))}

      <Fog squares={fogSquares} />

      {/* Flash khi có Chaos Card */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[8.2, 8.2]} />
        <meshBasicMaterial ref={flashMat} color="#8b7cff" transparent opacity={0} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function BoardLabels() {
  const tex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 1024;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, 1024, 1024);
    ctx.fillStyle = "rgba(166,171,190,0.6)";
    ctx.font = "500 26px 'JetBrains Mono Variable', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const cell = 1024 / 9.1;
    const off = (1024 - cell * 8) / 2;
    for (let i = 0; i < 8; i++) {
      ctx.fillText(FILES[i], off + cell * (i + 0.5), 1024 - off / 2);
      ctx.fillText(String(8 - i), off / 2, off + cell * (i + 0.5));
    }
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 8;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  if (!tex) return null;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.115, 0]}>
      <planeGeometry args={[9.1, 9.1]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
}
