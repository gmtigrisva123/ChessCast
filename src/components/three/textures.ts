"use client";

import * as THREE from "three";
import type { ChaosCard } from "@/lib/catalog";

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawCard(card: ChaosCard, canvas?: HTMLCanvasElement) {
  const c = canvas ?? document.createElement("canvas");
  c.width = 512;
  c.height = 736;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, c.width, c.height);
  const g = ctx.createLinearGradient(0, 0, 512, 736);
  g.addColorStop(0, "#1c1d24");
  g.addColorStop(1, "#0d0e12");
  roundRect(ctx, 6, 6, 500, 724, 44);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = card.accent;
  ctx.stroke();
  // checker pattern
  ctx.save();
  roundRect(ctx, 6, 6, 500, 724, 44);
  ctx.clip();
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = "#f2efe7";
  for (let y = 0; y < 736; y += 48) for (let x = (y / 48) % 2 ? 48 : 0; x < 512; x += 96) ctx.fillRect(x, y, 48, 48);
  ctx.globalAlpha = 1;
  const rg = ctx.createRadialGradient(256, 300, 10, 256, 300, 260);
  rg.addColorStop(0, card.accent + "66");
  rg.addColorStop(1, "transparent");
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, 512, 736);
  ctx.restore();
  ctx.fillStyle = card.accent;
  ctx.font = "700 30px 'Rubik Variable', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("CHAOS CARD", 46, 76);
  ctx.textAlign = "right";
  ctx.fillText(`${card.cost}◈`, 466, 76);
  ctx.textAlign = "center";
  ctx.fillStyle = "#f2efe7";
  ctx.font = "400 210px 'Rubik Variable', sans-serif";
  ctx.fillText(card.glyph, 256, 370);
  ctx.fillStyle = "#f2efe7";
  ctx.font = "700 54px 'Oswald Variable', sans-serif";
  const words = card.name.toUpperCase().split(" ");
  const mid = Math.ceil(words.length / 2);
  ctx.fillText(words.slice(0, mid).join(" "), 256, 520);
  ctx.fillText(words.slice(mid).join(" "), 256, 584);
  ctx.fillStyle = card.accent;
  ctx.font = "600 26px 'Rubik Variable', sans-serif";
  ctx.fillText(card.rarity.toUpperCase() + " · " + card.durationLabel.toUpperCase(), 256, 664);
  return c;
}

export function cardTexture(card: ChaosCard) {
  const canvas = drawCard(card);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  if (typeof document !== "undefined" && document.fonts) {
    document.fonts.ready.then(() => {
      drawCard(card, canvas);
      tex.needsUpdate = true;
    });
  }
  return tex;
}

export function drawTitle(text: string, canvas?: HTMLCanvasElement) {
  const c = canvas ?? document.createElement("canvas");
  c.width = 4096;
  c.height = 1024;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 760px 'Oswald Variable', Impact, sans-serif";
  ctx.lineWidth = 10;
  ctx.strokeStyle = "rgba(242,239,231,0.55)";
  ctx.strokeText(text, 2048, 540);
  const g = ctx.createLinearGradient(0, 0, 0, 1024);
  g.addColorStop(0, "rgba(242,239,231,0.10)");
  g.addColorStop(1, "rgba(242,239,231,0.0)");
  ctx.fillStyle = g;
  ctx.fillText(text, 2048, 540);
  return c;
}

export function titleTexture(text: string) {
  const canvas = drawTitle(text);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  if (typeof document !== "undefined" && document.fonts) {
    document.fonts.load("700 200px 'Oswald Variable'").then(() => {
      drawTitle(text, canvas);
      tex.needsUpdate = true;
    });
  }
  return tex;
}
