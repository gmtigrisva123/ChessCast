"use client";

import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { PieceSymbol } from "chess.js";

type P = [number, number];

function smoothProfile(points: P[], samples = 90): THREE.Vector2[] {
  const curve = new THREE.SplineCurve(points.map(([x, y]) => new THREE.Vector2(x, y)));
  const pts = curve.getSpacedPoints(samples).map((v) => new THREE.Vector2(Math.max(0, v.x), Math.max(0, v.y)));
  pts[0].set(0, points[0][1]);
  pts[pts.length - 1].set(0, points[points.length - 1][1]);
  return pts;
}

function lathe(points: P[], segments = 44, samples = 90) {
  const g = new THREE.LatheGeometry(smoothProfile(points, samples), segments);
  return g.toNonIndexed();
}

function prep(g: THREE.BufferGeometry) {
  const n = g.index ? g.toNonIndexed() : g;
  // Make sure every part has the same attribute set so they can be merged
  if (!n.getAttribute("uv")) n.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array((n.getAttribute("position").count) * 2), 2));
  for (const k of Object.keys(n.attributes)) if (!["position", "normal", "uv"].includes(k)) n.deleteAttribute(k);
  return n;
}

function merge(parts: THREE.BufferGeometry[]) {
  const g = mergeGeometries(parts.map(prep), false)!;
  g.computeVertexNormals();
  g.computeBoundingBox();
  return g;
}

const BASE: P[] = [
  [0, 0],
  [0.34, 0],
  [0.355, 0.04],
  [0.33, 0.08],
  [0.28, 0.11],
  [0.27, 0.15],
  [0.21, 0.2],
];

function buildPawn() {
  return lathe([
    ...BASE,
    [0.15, 0.3],
    [0.115, 0.42],
    [0.2, 0.46],
    [0.2, 0.5],
    [0.12, 0.52],
    [0.15, 0.56],
    [0.185, 0.63],
    [0.165, 0.71],
    [0.09, 0.77],
    [0, 0.785],
  ]);
}

function buildRook() {
  const body = lathe(
    [
      [0, 0],
      [0.37, 0],
      [0.38, 0.045],
      [0.35, 0.085],
      [0.3, 0.115],
      [0.29, 0.16],
      [0.23, 0.21],
      [0.205, 0.4],
      [0.21, 0.56],
      [0.26, 0.6],
      [0.285, 0.64],
      [0.29, 0.74],
      [0.21, 0.745],
      [0.2, 0.7],
      [0, 0.7],
    ],
    44,
    120,
  );
  const merlons: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const b = new THREE.BoxGeometry(0.11, 0.11, 0.09);
    b.rotateY(-a);
    b.translate(Math.cos(a) * 0.25, 0.79, Math.sin(a) * 0.25);
    merlons.push(b);
  }
  return merge([body, ...merlons]);
}

function buildBishop() {
  const body = lathe(
    [
      ...BASE,
      [0.15, 0.36],
      [0.12, 0.58],
      [0.21, 0.62],
      [0.21, 0.66],
      [0.12, 0.68],
      [0.15, 0.73],
      [0.19, 0.82],
      [0.175, 0.92],
      [0.11, 1.0],
      [0.05, 1.03],
      [0.075, 1.07],
      [0.05, 1.11],
      [0, 1.12],
    ],
    44,
    120,
  );
  return body;
}

function buildQueen() {
  const body = lathe(
    [
      [0, 0],
      [0.37, 0],
      [0.385, 0.05],
      [0.34, 0.09],
      [0.29, 0.13],
      [0.285, 0.17],
      [0.21, 0.23],
      [0.155, 0.48],
      [0.13, 0.76],
      [0.23, 0.8],
      [0.23, 0.84],
      [0.15, 0.87],
      [0.18, 0.94],
      [0.25, 1.1],
      [0.21, 1.13],
      [0.12, 1.14],
      [0.1, 1.18],
      [0.06, 1.25],
      [0, 1.27],
    ],
    48,
    130,
  );
  const balls: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const s = new THREE.SphereGeometry(0.038, 10, 8);
    s.translate(Math.cos(a) * 0.235, 1.12, Math.sin(a) * 0.235);
    balls.push(s);
  }
  const top = new THREE.SphereGeometry(0.065, 16, 12);
  top.translate(0, 1.3, 0);
  return merge([body, ...balls, top]);
}

function buildKing() {
  const body = lathe(
    [
      [0, 0],
      [0.38, 0],
      [0.395, 0.05],
      [0.35, 0.09],
      [0.3, 0.13],
      [0.295, 0.17],
      [0.22, 0.23],
      [0.165, 0.5],
      [0.14, 0.8],
      [0.245, 0.84],
      [0.245, 0.88],
      [0.16, 0.91],
      [0.19, 0.98],
      [0.235, 1.13],
      [0.17, 1.17],
      [0.09, 1.2],
      [0, 1.21],
    ],
    48,
    130,
  );
  const v = new THREE.BoxGeometry(0.075, 0.28, 0.075);
  v.translate(0, 1.33, 0);
  const h = new THREE.BoxGeometry(0.22, 0.075, 0.075);
  h.translate(0, 1.37, 0);
  return merge([body, v, h]);
}

function buildKnight() {
  const base = lathe([...BASE, [0.2, 0.22], [0, 0.225]], 44, 70);
  const s = new THREE.Shape();
  s.moveTo(0.24, 0);
  s.lineTo(-0.22, 0);
  s.quadraticCurveTo(-0.15, 0.18, -0.05, 0.29);
  s.quadraticCurveTo(-0.2, 0.33, -0.31, 0.35);
  s.quadraticCurveTo(-0.41, 0.38, -0.39, 0.47);
  s.quadraticCurveTo(-0.36, 0.57, -0.22, 0.65);
  s.quadraticCurveTo(-0.08, 0.74, 0.01, 0.8);
  s.lineTo(0.035, 0.91);
  s.lineTo(0.12, 0.79);
  s.quadraticCurveTo(0.31, 0.67, 0.3, 0.4);
  s.quadraticCurveTo(0.3, 0.17, 0.24, 0);
  const depth = 0.2;
  const head = new THREE.ExtrudeGeometry(s, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.035,
    bevelSegments: 4,
    curveSegments: 18,
  });
  head.translate(0, 0.17, -depth / 2);
  // Eyes
  const eyeL = new THREE.SphereGeometry(0.03, 8, 6);
  eyeL.translate(-0.17, 0.78, depth / 2 + 0.035);
  const eyeR = new THREE.SphereGeometry(0.03, 8, 6);
  eyeR.translate(-0.17, 0.78, -depth / 2 - 0.035);
  return merge([base, head, eyeL, eyeR]);
}

let cache: Record<PieceSymbol, THREE.BufferGeometry> | null = null;

export function getPieceGeometries() {
  if (cache) return cache;
  cache = {
    p: buildPawn(),
    r: buildRook(),
    n: buildKnight(),
    b: buildBishop(),
    q: buildQueen(),
    k: buildKing(),
  };
  for (const g of Object.values(cache)) g.computeVertexNormals();
  return cache;
}

export type PieceTheme = "pearl" | "crystal";

const matCache: Partial<Record<PieceTheme, { w: THREE.MeshPhysicalMaterial; b: THREE.MeshPhysicalMaterial }>> = {};

/**
 * pearl   — iridescent pearl vs polished obsidian (best readability)
 * crystal — refractive glass with dispersion vs obsidian (showcase)
 */
export function getPieceMaterials(theme: PieceTheme = "pearl") {
  const hit = matCache[theme];
  if (hit) return hit;
  const obsidian = new THREE.MeshPhysicalMaterial({
    color: "#0b0c14",
    roughness: 0.1,
    metalness: 0.55,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    iridescence: 0.7,
    iridescenceIOR: 1.6,
    iridescenceThicknessMinimum: 300,
    iridescenceThicknessMaximum: 900,
  });
  const white =
    theme === "crystal"
      ? new THREE.MeshPhysicalMaterial({
          color: "#ffffff",
          roughness: 0.03,
          metalness: 0,
          transmission: 1,
          thickness: 1.1,
          ior: 1.5,
          dispersion: 5,
          attenuationColor: new THREE.Color("#d9d3ff"),
          attenuationDistance: 2.2,
          clearcoat: 1,
          clearcoatRoughness: 0.02,
          iridescence: 0.55,
          iridescenceIOR: 1.3,
          iridescenceThicknessMinimum: 200,
    iridescenceThicknessMaximum: 650,
          envMapIntensity: 1.4,
        })
      : new THREE.MeshPhysicalMaterial({
          color: "#ece8ff",
          roughness: 0.18,
          metalness: 0.04,
          clearcoat: 1,
          clearcoatRoughness: 0.06,
          iridescence: 1,
          iridescenceIOR: 1.32,
          iridescenceThicknessMinimum: 160,
    iridescenceThicknessMaximum: 620,
          sheen: 0.6,
          sheenColor: new THREE.Color("#c9c2ff"),
        });
  matCache[theme] = { w: white, b: obsidian };
  return matCache[theme]!;
}

let glass: THREE.MeshPhysicalMaterial | null = null;
/** Refractive glass used for the hero centerpiece and shards. */
export function getGlassMaterial() {
  if (glass) return glass;
  glass = new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    roughness: 0.04,
    metalness: 0,
    transmission: 1,
    thickness: 2.4,
    ior: 1.45,
    dispersion: 6,
    attenuationColor: new THREE.Color("#b9b0ff"),
    attenuationDistance: 3.5,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    iridescence: 0.9,
    iridescenceIOR: 1.3,
    iridescenceThicknessMinimum: 200,
    iridescenceThicknessMaximum: 700,
    envMapIntensity: 1.3,
  });
  return glass;
}
