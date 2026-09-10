import {
  BIRD_DRAW_H,
  BIRD_DRAW_W,
  COLORS,
  GROUND_H,
  GROUND_Y,
  PIPE_CAP_EXTRA,
  PIPE_CAP_H,
  PIPE_W,
  WORLD_H,
  WORLD_W,
} from "./constants";
import type { Particle, Pipe } from "./engine-types";

export type Assets = {
  player: HTMLImageElement | null;
  playerDead: HTMLImageElement | null;
  ground: HTMLCanvasElement;
  cityDay: HTMLCanvasElement;
  cityNight: HTMLCanvasElement;
};

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2d context");
  ctx.imageSmoothingEnabled = false;
  return { c, ctx };
}

function rr(n: number) {
  return Math.round(n);
}

export function createAssets(
  player: HTMLImageElement | null,
  playerDead: HTMLImageElement | null = null,
): Assets {
  return {
    player,
    playerDead,
    ground: drawGroundTile(),
    cityDay: drawCity(false),
    cityNight: drawCity(true),
  };
}

function drawGroundTile(): HTMLCanvasElement {
  const tw = 24;
  const { c, ctx } = makeCanvas(tw, GROUND_H);
  ctx.fillStyle = COLORS.grassLight;
  ctx.fillRect(0, 0, tw, 12);
  ctx.fillStyle = COLORS.grass;
  ctx.fillRect(0, 6, tw, 8);
  ctx.fillStyle = COLORS.grassDark;
  ctx.fillRect(0, 12, tw, 3);
  ctx.fillStyle = COLORS.dirt;
  ctx.fillRect(0, 15, tw, 97);
  ctx.fillStyle = COLORS.dirtLine;
  ctx.fillRect(0, 15, tw, 2);
  ctx.fillStyle = COLORS.dirtDark;
  ctx.fillRect(3, 28, 4, 3);
  ctx.fillRect(14, 40, 5, 3);
  ctx.fillRect(6, 58, 6, 4);
  ctx.fillRect(16, 78, 4, 3);
  ctx.fillRect(2, 96, 5, 3);
  ctx.fillStyle = COLORS.dirtSpot;
  ctx.fillRect(10, 34, 3, 2);
  ctx.fillRect(18, 64, 3, 2);
  ctx.fillRect(8, 86, 4, 2);
  return c;
}

function drawCity(night: boolean): HTMLCanvasElement {
  const h = 170;
  const { c, ctx } = makeCanvas(WORLD_W, h);
  const bcols = night
    ? ["#5A6A78", "#4A5866", "#3E4C58", "#687888"]
    : [COLORS.building, COLORS.building2, COLORS.building3, "#DAD4D8"];
  const win = night ? COLORS.windowNight : COLORS.windowDay;
  (
    [
      { x: 0, w: 38, h: 92 },
      { x: 36, w: 28, h: 70 },
      { x: 62, w: 44, h: 110 },
      { x: 104, w: 32, h: 78 },
      { x: 132, w: 50, h: 124 },
      { x: 178, w: 26, h: 66 },
      { x: 200, w: 40, h: 98 },
      { x: 236, w: 52, h: 84 },
    ] as const
  ).forEach((b, i) => {
    const y = 142 - b.h;
    ctx.fillStyle = bcols[i % bcols.length]!;
    ctx.fillRect(b.x, y, b.w, b.h);
    ctx.fillStyle = win;
    let n = 0;
    for (let wy = y + 8; wy < y + b.h - 8; wy += 12) {
      for (let wx = b.x + 5; wx < b.x + b.w - 6; wx += 8) {
        n += 1;
        if (night && (n * 17 + i * 13) % 7 > 3) continue;
        ctx.fillRect(wx, wy, 4, 6);
      }
    }
  });
  for (const [x, w, bh] of [
    [0, 28, 22],
    [22, 36, 24],
    [50, 24, 20],
    [78, 34, 26],
    [110, 22, 18],
    [136, 38, 26],
    [172, 28, 22],
    [204, 34, 24],
    [238, 26, 20],
    [264, 36, 24],
  ] as const) {
    ctx.fillStyle = COLORS.bushDark;
    ctx.fillRect(x, h - bh + 4, w + 6, bh);
    ctx.fillStyle = COLORS.bushMid;
    ctx.fillRect(x + 2, h - bh, w, bh);
    ctx.fillStyle = COLORS.bushLight;
    ctx.fillRect(x + 6, h - bh + 4, Math.max(8, w - 10), 8);
  }
  return c;
}

export function drawSky(ctx: CanvasRenderingContext2D, night: boolean) {
  ctx.fillStyle = night ? COLORS.skyNight : COLORS.skyDay;
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);
  if (night) {
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    for (const [x, y] of [
      [18, 22],
      [44, 48],
      [70, 16],
      [110, 36],
      [148, 12],
      [176, 44],
      [210, 20],
      [238, 52],
      [262, 18],
      [88, 60],
      [200, 70],
      [30, 80],
    ] as const) {
      ctx.fillRect(x, y, 2, 2);
    }
  }
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.fillStyle = COLORS.cloud;
  for (const [bx, by, bw, bh] of [
    [0, 8, 18, 12],
    [10, 0, 22, 16],
    [24, 6, 18, 12],
    [8, 10, 26, 10],
  ] as const) {
    ctx.fillRect(rr(x + bx * s), rr(y + by * s), rr(bw * s), rr(bh * s));
  }
  ctx.fillStyle = COLORS.cloudShade;
  ctx.fillRect(rr(x + 8 * s), rr(y + 14 * s), rr(22 * s), rr(4 * s));
}

export function drawParallax(
  ctx: CanvasRenderingContext2D,
  assets: Assets,
  night: boolean,
  cloudOff: number,
  cityOff: number,
) {
  const cloudY = [
    { x: 10, y: 36, s: 1 },
    { x: 118, y: 58, s: 0.85 },
    { x: 210, y: 28, s: 1.1 },
  ];
  const span = 368;
  const cx = ((cloudOff % span) + span) % span;
  for (let i = -1; i <= 1; i++) {
    for (const cl of cloudY) drawCloud(ctx, cl.x - cx + i * span, cl.y, cl.s);
  }
  const city = night ? assets.cityNight : assets.cityDay;
  const cityY = GROUND_Y - city.height + 6;
  const cy = ((cityOff % WORLD_W) + WORLD_W) % WORLD_W;
  ctx.drawImage(city, -cy, cityY);
  ctx.drawImage(city, -cy + WORLD_W, cityY);
}

export function drawGround(ctx: CanvasRenderingContext2D, assets: Assets, offset: number) {
  const tile = assets.ground;
  const tw = tile.width;
  const off = ((offset % tw) + tw) % tw;
  for (let x = -off; x < WORLD_W; x += tw) ctx.drawImage(tile, rr(x), GROUND_Y);
  ctx.fillStyle = COLORS.pipeEdge;
  ctx.fillRect(0, GROUND_Y, WORLD_W, 2);
}

export function drawPipe(ctx: CanvasRenderingContext2D, pipe: Pipe) {
  const gapTop = pipe.gapY - pipe.gapH / 2;
  const gapBot = pipe.gapY + pipe.gapH / 2;
  drawPipeColumn(ctx, pipe.x, 0, gapTop, "down");
  drawPipeColumn(ctx, pipe.x, gapBot, GROUND_Y - gapBot, "up");
}

function drawPipeColumn(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
  cap: "up" | "down",
) {
  if (h <= 0) return;
  const xi = rr(x);
  const yi = rr(y);
  const hi = rr(h);
  const w = PIPE_W;
  ctx.fillStyle = COLORS.pipeEdge;
  ctx.fillRect(xi - 1, yi, w + 2, hi);
  ctx.fillStyle = COLORS.pipe;
  ctx.fillRect(xi, yi, w, hi);
  ctx.fillStyle = COLORS.pipeLite;
  ctx.fillRect(xi + 1, yi, 8, hi);
  ctx.fillStyle = COLORS.pipeMid;
  ctx.fillRect(xi + 14, yi, 10, hi);
  ctx.fillStyle = COLORS.pipeDark;
  ctx.fillRect(xi + w - 12, yi, 12, hi);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(xi + 3, yi, 2, hi);
  const capY = cap === "down" ? yi + hi - PIPE_CAP_H : yi;
  const capX = xi - PIPE_CAP_EXTRA;
  const capW = w + PIPE_CAP_EXTRA * 2;
  ctx.fillStyle = COLORS.pipeEdge;
  ctx.fillRect(capX - 1, capY - 1, capW + 2, PIPE_CAP_H + 2);
  ctx.fillStyle = COLORS.pipe;
  ctx.fillRect(capX, capY, capW, PIPE_CAP_H);
  ctx.fillStyle = COLORS.pipeLite;
  ctx.fillRect(capX + 1, capY + 1, 10, PIPE_CAP_H - 2);
  ctx.fillStyle = COLORS.pipeDark;
  ctx.fillRect(capX + capW - 14, capY + 1, 14, PIPE_CAP_H - 2);
  ctx.fillStyle = COLORS.pipeLite;
  ctx.fillRect(capX, capY + 2, capW, 3);
  ctx.fillStyle = COLORS.pipeDark;
  ctx.fillRect(capX, capY + PIPE_CAP_H - 5, capW, 4);
}

export function drawBird(
  ctx: CanvasRenderingContext2D,
  assets: Assets,
  x: number,
  y: number,
  rot: number,
  squash: number,
  flash: number,
  dead = false,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const sx = 1 + squash * 0.18;
  const sy = 1 - squash * 0.14;
  ctx.scale(sx, sy);
  const w = BIRD_DRAW_W;
  const h = BIRD_DRAW_H;
  const sprite =
    dead && assets.playerDead && assets.playerDead.complete && assets.playerDead.naturalWidth > 0
      ? assets.playerDead
      : assets.player && assets.player.complete && assets.player.naturalWidth > 0
        ? assets.player
        : null;
  if (sprite) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(sprite, -w / 2, -h / 2, w, h);
    ctx.imageSmoothingEnabled = false;
  } else {
    ctx.fillStyle = "#d4a574";
    ctx.beginPath();
    ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (flash > 0) {
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = `rgba(255,255,255,${Math.min(1, flash * 1.4)})`;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.globalCompositeOperation = "source-over";
  }
  ctx.restore();
}

export function drawParticles(ctx: CanvasRenderingContext2D, parts: Particle[]) {
  for (const p of parts) {
    if (p.life <= 0) continue;
    const a = Math.max(0, p.life / p.max);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    ctx.restore();
  }
}

const DIGITS: Record<string, string[]> = {
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["01110", "10001", "00001", "00110", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["01110", "10000", "11110", "10001", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
};

export function drawScore(ctx: CanvasRenderingContext2D, score: number, cx: number, y: number, scale: number) {
  const str = String(Math.max(0, Math.floor(score)));
  const gw = 6 * scale;
  const total = str.length * gw - scale;
  let x = cx - total / 2;
  for (const ch of str) {
    drawDigit(ctx, ch, x, y, scale);
    x += gw;
  }
}

function drawDigit(ctx: CanvasRenderingContext2D, ch: string, x: number, y: number, scale: number) {
  const g = DIGITS[ch] ?? DIGITS["0"]!;
  for (let row = 0; row < g.length; row++) {
    const line = g[row]!;
    for (let col = 0; col < line.length; col++) {
      if (line[col] !== "1") continue;
      const px = rr(x + col * scale);
      const py = rr(y + row * scale);
      ctx.fillStyle = COLORS.uiBlack;
      ctx.fillRect(px - scale, py - scale, scale * 3, scale * 3);
    }
  }
  for (let row = 0; row < g.length; row++) {
    const line = g[row]!;
    for (let col = 0; col < line.length; col++) {
      if (line[col] !== "1") continue;
      ctx.fillStyle = COLORS.uiWhite;
      ctx.fillRect(rr(x + col * scale), rr(y + row * scale), scale, scale);
    }
  }
}

export function drawOutlinedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  fill: string,
  align: CanvasTextAlign = "center",
) {
  ctx.save();
  ctx.font = `${size}px "Press Start 2P", ui-monospace, monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.lineWidth = Math.max(3, Math.round(size * 0.22));
  ctx.strokeStyle = COLORS.uiBlack;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function drawGetReady(ctx: CanvasRenderingContext2D, t: number, uiTop = 0, tapY = 292) {
  drawOutlinedText(ctx, "GET READY", WORLD_W / 2, 118 + uiTop, 12, COLORS.uiYellow);
  const pulse = 0.55 + Math.sin(t * 6) * 0.25;
  ctx.save();
  ctx.globalAlpha = pulse;
  drawOutlinedText(ctx, "TAP", WORLD_W / 2, tapY, 10, COLORS.uiWhite);
  ctx.restore();
}

export function drawTitle(ctx: CanvasRenderingContext2D, uiTop = 0) {
  drawOutlinedText(ctx, "TAPPY", WORLD_W / 2, 40 + uiTop, 16, COLORS.uiYellow);
  drawOutlinedText(ctx, "TOM", WORLD_W / 2, 64 + uiTop, 16, COLORS.uiYellow);
}

export function drawFlash(ctx: CanvasRenderingContext2D, amount: number) {
  if (amount <= 0) return;
  ctx.fillStyle = `rgba(255,255,255,${amount})`;
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);
}
