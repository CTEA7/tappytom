import {
  BIRD_X,
  DIE_FALL_DELAY,
  FIRST_PIPE_X,
  FLASH_TIME,
  FLAP_V,
  GRAVITY,
  GROUND_Y,
  HIT_H,
  HIT_W,
  HITSTOP,
  MAX_FALL,
  MAX_ROT,
  PIPE_GAP,
  PIPE_GAP_MIN,
  PIPE_SPACING,
  PIPE_SPEED,
  PIPE_SPEED_MAX,
  PIPE_W,
  ROT_DOWN_SPEED,
  ROT_UP,
  WORLD_H,
  WORLD_H_BASE,
  WORLD_W,
  setViewHeight,
} from "./constants";
import { GameAudio } from "./audio";
import {
  createAssets,
  drawBird,
  drawFlash,
  drawGetReady,
  drawGround,
  drawParallax,
  drawParticles,
  drawPipe,
  drawScore,
  drawSky,
  drawTitle,
  type Assets,
} from "./draw";
import { loadSave, writeSave, type SaveData } from "./storage";
import { PLAYER_DEAD_SRC, PLAYER_SRC } from "./playerSprite";
import type { Bird, Mode, Particle, Pipe } from "./engine-types";

const STEP = 1 / 60;

export class FlappyEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private audio = new GameAudio();
  private assets: Assets | null = null;
  private save: SaveData = loadSave();
  private raf = 0;
  private acc = 0;
  private last = 0;
  private running = false;
  private reduced = false;
  private night = false;

  private mode: Mode = "ready";
  private bird: Bird = { x: BIRD_X, y: 230, vy: 0, rot: 0, squash: 0 };
  private pipes: Pipe[] = [];
  private particles: Particle[] = [];
  private score = 0;
  private runBest = 0;
  private isNewBest = false;
  private groundOff = 0;
  private cityOff = 0;
  private cloudOff = 0;
  private bobT = 0;
  private flash = 0;
  private hitstop = 0;
  private trauma = 0;
  private overT = 0;
  private panelSlide = 0;
  private dyingT = 0;
  private time = 0;
  private scorePop = 0;
  private lastPadA = false;
  private lastFlapMs = 0;
  private sawPointer = false;
  private uiTop = 0;

  private onMuted?: (muted: boolean) => void;
  private onOver?: (score: number) => void;
  private onHud?: (score: number, best: number) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas 2D unavailable");
    this.ctx = ctx;
    this.reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  setMutedHandler(fn: (muted: boolean) => void) {
    this.onMuted = fn;
  }

  setOverHandler(fn: (score: number) => void) {
    this.onOver = fn;
  }

  setHudHandler(fn: (score: number, best: number) => void) {
    this.onHud = fn;
    fn(this.score, this.save.best);
  }

  restart() {
    this.resetReady(false);
  }

  get muted() {
    return this.audio.muted;
  }

  setMuted(muted: boolean) {
    this.audio.setMuted(muted);
    this.onMuted?.(muted);
  }

  async start() {
    const { player, playerDead } = await loadPlayers();
    this.assets = createAssets(player, playerDead);
    this.resetReady(true);
    this.bind();
    this.audio.preload();
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.unbind();
  }

  requestFlap() {
    this.audio.unlock();
    const now = performance.now();
    if (now - this.lastFlapMs < 40) return;
    this.lastFlapMs = now;

    if (this.mode === "ready") {
      this.beginPlay();
      this.doFlap();
      return;
    }
    if (this.mode === "playing") {
      this.doFlap();
      return;
    }
    if (this.mode === "over") {
      return;
    }
  }

  private loop = (now: number) => {
    if (!this.running) return;
    const raw = (now - this.last) / 1000;
    this.last = now;
    const dt = Math.min(raw, 0.1);
    this.pollPad();
    this.layout();
    this.acc += dt;
    while (this.acc >= STEP) {
      if (this.hitstop > 0) {
        this.hitstop -= STEP;
      } else {
        this.update(STEP);
      }
      this.acc -= STEP;
    }
    this.render();
    this.raf = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    this.time += dt;
    this.bobT += dt;
    this.flash = Math.max(0, this.flash - dt / FLASH_TIME);
    this.trauma = Math.max(0, this.trauma - dt * 3.2);
    this.bird.squash = Math.max(0, this.bird.squash - dt * 6);
    this.scorePop = Math.max(0, this.scorePop - dt * 5.5);

    const speed = this.currentSpeed();
    const moving = this.mode === "playing" || this.mode === "ready";

    if (moving) {
      this.groundOff += speed * dt;
      this.cityOff += speed * 0.42 * dt;
      this.cloudOff += speed * 0.18 * dt;
    }

    if (this.mode === "ready") {
      this.bird.y = this.readyY() + Math.sin(this.bobT * 5.2) * (this.reduced ? 0 : 5);
      this.bird.rot = 0;
      this.bird.vy = 0;
    } else if (this.mode === "playing") {
      this.integrateBird(dt);
      this.stepPipes(dt, speed);
      this.collide();
    } else if (this.mode === "dying") {
      this.dyingT += dt;
      if (this.dyingT > DIE_FALL_DELAY) this.integrateBird(dt);
      if (this.bird.y + birdHalfH(this.bird.rot) >= GROUND_Y - 1) {
        this.bird.y = GROUND_Y - birdHalfH(this.bird.rot);
        this.bird.vy = 0;
        this.bird.rot = MAX_ROT;
        this.enterOver();
      }
    } else if (this.mode === "over") {
      this.overT += dt;
      this.panelSlide = Math.min(1, this.panelSlide + dt * 2.6);
    }

    this.stepParticles(dt);
  }

  private currentSpeed() {
    if (this.score <= 15) return PIPE_SPEED;
    return Math.min(PIPE_SPEED_MAX, PIPE_SPEED + (this.score - 15) * 1.8);
  }

  private currentGap() {
    return Math.max(PIPE_GAP_MIN, PIPE_GAP - Math.max(0, this.score - 10) * 0.8);
  }

  private beginPlay() {
    this.mode = "playing";
    this.pipes = [];
    this.spawnPipe(FIRST_PIPE_X);
    this.spawnPipe(FIRST_PIPE_X + PIPE_SPACING);
    this.spawnPipe(FIRST_PIPE_X + PIPE_SPACING * 2);
  }

  private doFlap() {
    this.bird.vy = FLAP_V;
    this.bird.rot = ROT_UP;
    this.bird.squash = 1;
    this.audio.flap();
    this.spawnPuff();
  }

  private integrateBird(dt: number) {
    this.bird.vy = Math.min(MAX_FALL, this.bird.vy + GRAVITY * dt);
    this.bird.y += this.bird.vy * dt;
    if (this.bird.vy < 0) {
      this.bird.rot = ROT_UP;
    } else {
      this.bird.rot = Math.min(MAX_ROT, this.bird.rot + ROT_DOWN_SPEED * dt);
    }
  }

  private spawnPipe(x: number) {
    const gap = this.currentGap();
    const minY = 70 + gap / 2;
    const maxY = GROUND_Y - 50 - gap / 2;
    let gapY = minY + Math.random() * (maxY - minY);
    const prev = this.pipes[this.pipes.length - 1];
    if (prev) {
      const maxDelta = 145;
      gapY = Math.max(prev.gapY - maxDelta, Math.min(prev.gapY + maxDelta, gapY));
      gapY = Math.max(minY, Math.min(maxY, gapY));
    }
    this.pipes.push({ x, gapY, gapH: gap, scored: false });
  }

  private stepPipes(dt: number, speed: number) {
    for (const p of this.pipes) p.x -= speed * dt;
    while (this.pipes.length && this.pipes[0]!.x + PIPE_W < -40) this.pipes.shift();
    const last = this.pipes[this.pipes.length - 1];
    if (last && last.x < WORLD_W - PIPE_SPACING) this.spawnPipe(last.x + PIPE_SPACING);

    for (const p of this.pipes) {
      if (!p.scored && p.x + PIPE_W < this.bird.x) {
        p.scored = true;
        this.score += 1;
        this.scorePop = 1;
        this.audio.point();
        this.onHud?.(this.score, Math.max(this.save.best, this.score));
      }
    }
  }

  private collide() {
    const { x, y, rot } = this.bird;
    const { hw, hh } = birdExtents(rot);
    if (y + hh >= GROUND_Y) {
      this.kill();
      return;
    }
    for (const p of this.pipes) {
      if (boxPipe(x, y, hw, hh, p)) {
        this.kill();
        return;
      }
    }
  }

  private kill() {
    if (this.mode !== "playing") return;
    this.mode = "dying";
    this.dyingT = 0;
    this.flash = this.reduced ? 0.15 : 1;
    this.hitstop = this.reduced ? 0 : HITSTOP;
    this.trauma = this.reduced ? 0.15 : 0.85;
    this.audio.hit();
    this.audio.die();
    this.spawnBurst();
    this.bird.squash = 0;
    if (this.bird.y + birdHalfH(this.bird.rot) >= GROUND_Y) {
      this.bird.y = GROUND_Y - birdHalfH(this.bird.rot);
      this.enterOver();
    }
  }

  private enterOver() {
    if (this.mode === "over") return;
    this.mode = "over";
    this.overT = 0;
    this.panelSlide = 0;
    this.save.games += 1;
    this.isNewBest = this.score > this.save.best;
    if (this.isNewBest) this.save.best = this.score;
    this.runBest = this.save.best;
    writeSave(this.save);
    this.onHud?.(this.score, this.save.best);
    this.onOver?.(this.score);
  }

  private resetReady(randomNight: boolean) {
    if (randomNight) this.night = Math.random() < 0.28;
    this.mode = "ready";
    this.bird = { x: BIRD_X, y: this.readyY(), vy: 0, rot: 0, squash: 0 };
    this.pipes = [];
    this.particles = [];
    this.score = 0;
    this.isNewBest = false;
    this.runBest = this.save.best;
    this.flash = 0;
    this.hitstop = 0;
    this.trauma = 0;
    this.overT = 0;
    this.panelSlide = 0;
    this.bobT = 0;
    this.scorePop = 0;
    this.onHud?.(this.score, this.save.best);
  }

  private spawnPuff() {
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: this.bird.x - 10,
        y: this.bird.y + 6,
        vx: -40 - Math.random() * 50,
        vy: (Math.random() - 0.5) * 60,
        life: 0.28 + Math.random() * 0.12,
        max: 0.4,
        size: 2 + Math.random() * 3,
        rot: 0,
        vr: 0,
        color: "rgba(255,255,255,0.85)",
      });
    }
  }

  private spawnBurst() {
    const cols = ["#d4a574", "#c48a5a", "#eee4b8", "#73BF2E", "#ffffff"];
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 80 + Math.random() * 180;
      this.particles.push({
        x: this.bird.x,
        y: this.bird.y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 40,
        life: 0.4 + Math.random() * 0.35,
        max: 0.75,
        size: 2 + Math.random() * 4,
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 10,
        color: cols[i % cols.length]!,
      });
    }
  }

  private stepParticles(dt: number) {
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 420 * dt;
      p.rot += p.vr * dt;
    }
    if (this.particles.length > 80) this.particles.splice(0, this.particles.length - 80);
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  private readyY() {
    return GROUND_Y * 0.48;
  }

  private layout() {
    const cssW = Math.max(1, this.canvas.clientWidth || WORLD_W);
    const cssH = Math.max(1, this.canvas.clientHeight || WORLD_H_BASE);
    const aspect = cssH / cssW;
    const minAspect = WORLD_H_BASE / WORLD_W;
    setViewHeight(aspect >= minAspect ? WORLD_W * aspect : WORLD_H_BASE);
    const sat = readSafeTopPx();
    this.uiTop = (sat / cssH) * WORLD_H + 8;
  }

  private render() {
    const assets = this.assets;
    if (!assets) return;
    const { canvas, ctx } = this;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const cssW = canvas.clientWidth || WORLD_W;
    const cssH = canvas.clientHeight || WORLD_H;
    const bw = Math.max(1, Math.round(cssW * dpr));
    const bh = Math.max(1, Math.round(cssH * dpr));
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }

    const shake = this.reduced || this.trauma <= 0 ? 0 : this.trauma * this.trauma * 7;
    const jx = shake ? (Math.random() * 2 - 1) * shake : 0;
    const jy = shake ? (Math.random() * 2 - 1) * shake : 0;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = this.night ? "#04749B" : "#4EC0CA";
    ctx.fillRect(0, 0, bw, bh);

    const scaleX = bw / WORLD_W;
    const scaleY = bh / WORLD_H;
    if (Math.abs(scaleX - scaleY) < 0.02) {
      ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
    } else {
      const scale = Math.min(scaleX, scaleY);
      const ox = (bw - WORLD_W * scale) / 2;
      const oy = (bh - WORLD_H * scale) / 2;
      ctx.setTransform(scale, 0, 0, scale, ox, oy);
    }
    ctx.imageSmoothingEnabled = false;

    drawSky(ctx, this.night);
    ctx.save();
    ctx.translate(jx, jy);
    drawParallax(ctx, assets, this.night, this.cloudOff, this.cityOff);
    for (const p of this.pipes) drawPipe(ctx, p);
    drawParticles(ctx, this.particles);
    const dead = this.mode === "dying" || this.mode === "over";
    drawBird(
      ctx,
      assets,
      this.bird.x,
      this.bird.y,
      this.bird.rot,
      dead ? 0 : this.bird.squash,
      this.flash,
      dead,
    );
    drawGround(ctx, assets, this.groundOff);
    ctx.restore();

    if (this.mode === "ready") {
      drawTitle(ctx, this.uiTop);
      drawGetReady(ctx, this.time, this.uiTop, this.bird.y + 48);
    } else if (this.mode === "playing" || this.mode === "dying") {
      const base = 8;
      const pop = this.reduced ? 1 : 1 + this.scorePop * this.scorePop * 0.7;
      const y = 40 + this.uiTop;
      const cx = WORLD_W / 2;
      const cy = y + (7 * base) / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(pop, pop);
      ctx.translate(-cx, -cy);
      drawScore(ctx, this.score, cx, y, base);
      ctx.restore();
    } else if (this.mode === "over") {
      /* overlay owns game-over chrome */
    }

    drawFlash(ctx, this.flash * 0.55);
  }

  private bind() {
    const opts: AddEventListenerOptions = { passive: false, capture: true };
    window.addEventListener("pointerdown", this.onPointer, opts);
    window.addEventListener("touchstart", this.onTouch, opts);
    window.addEventListener("mousedown", this.onMouse, opts);
    window.addEventListener("click", this.onClick, true);
    window.addEventListener("keydown", this.onKey);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onBlur);
    document.addEventListener("visibilitychange", this.onVis);
    window.addEventListener("resize", this.onResize);
    window.visualViewport?.addEventListener("resize", this.onResize);
    window.addEventListener("contextmenu", this.onMenu);
  }

  private unbind() {
    const opts: AddEventListenerOptions = { capture: true };
    window.removeEventListener("pointerdown", this.onPointer, opts);
    window.removeEventListener("touchstart", this.onTouch, opts);
    window.removeEventListener("mousedown", this.onMouse, opts);
    window.removeEventListener("click", this.onClick, true);
    window.removeEventListener("keydown", this.onKey);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlur);
    document.removeEventListener("visibilitychange", this.onVis);
    window.removeEventListener("resize", this.onResize);
    window.visualViewport?.removeEventListener("resize", this.onResize);
    window.removeEventListener("contextmenu", this.onMenu);
  }

  private isUiControl(e: Event) {
    const t = e.target;
    return t instanceof Element && Boolean(t.closest("[data-no-flap]"));
  }

  private onPointer = (e: PointerEvent) => {
    if (this.isUiControl(e)) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    this.sawPointer = true;
    this.requestFlap();
  };

  private onTouch = (e: TouchEvent) => {
    if (this.isUiControl(e)) return;
    e.preventDefault();
    this.sawPointer = true;
    this.requestFlap();
  };

  private onMouse = (e: MouseEvent) => {
    if (this.isUiControl(e)) return;
    if (e.button !== 0) return;
    e.preventDefault();
    this.sawPointer = true;
    this.requestFlap();
  };

  private onClick = (e: MouseEvent) => {
    if (this.isUiControl(e)) return;
    e.preventDefault();
    if (this.sawPointer) {
      this.sawPointer = false;
      return;
    }
    this.requestFlap();
  };

  private onKey = (e: KeyboardEvent) => {
    if (e.repeat) return;
    const flap =
      e.code === "Space" ||
      e.code === "ArrowUp" ||
      e.code === "KeyW" ||
      e.code === "Enter" ||
      e.key === " " ||
      e.key === "ArrowUp" ||
      e.key === "w" ||
      e.key === "W" ||
      e.key === "Enter";
    if (flap) {
      e.preventDefault();
      this.requestFlap();
    }
    if (e.code === "KeyM" || e.key === "m" || e.key === "M") {
      this.setMuted(!this.audio.muted);
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (e.code === "Space" || e.code === "ArrowUp" || e.key === " ") e.preventDefault();
  };

  private onBlur = () => {
    this.lastPadA = false;
  };

  private onVis = () => {
    if (document.visibilityState === "visible") this.audio.unlock();
  };

  private onResize = () => {
    cachedSafeTop = null;
  };

  private onMenu = (e: Event) => e.preventDefault();

  private pollPad() {
    const pads = navigator.getGamepads?.() ?? [];
    let pressed = false;
    for (const pad of pads) {
      if (!pad) continue;
      if (pad.buttons[0]?.pressed) pressed = true;
    }
    if (pressed && !this.lastPadA) this.requestFlap();
    this.lastPadA = pressed;
  }
}

function birdExtents(rot: number) {
  const c = Math.abs(Math.cos(rot));
  const s = Math.abs(Math.sin(rot));
  return {
    hw: (HIT_W * c + HIT_H * s) / 2,
    hh: (HIT_W * s + HIT_H * c) / 2,
  };
}

function birdHalfH(rot: number) {
  return birdExtents(rot).hh;
}

function boxPipe(cx: number, cy: number, hw: number, hh: number, p: Pipe) {
  if (cx + hw <= p.x || cx - hw >= p.x + PIPE_W) return false;
  const gapTop = p.gapY - p.gapH / 2;
  const gapBot = p.gapY + p.gapH / 2;
  return cy - hh < gapTop || cy + hh > gapBot;
}

let cachedSafeTop: number | null = null;

function readSafeTopPx() {
  if (cachedSafeTop != null) return cachedSafeTop;
  if (typeof document === "undefined") return 0;
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:absolute;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top,0px)";
  document.body.appendChild(probe);
  cachedSafeTop = parseFloat(getComputedStyle(probe).paddingTop) || 0;
  probe.remove();
  return cachedSafeTop;
}

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function loadPlayers() {
  const [player, playerDead] = await Promise.all([
    loadImg(PLAYER_SRC),
    loadImg(PLAYER_DEAD_SRC),
  ]);
  return { player, playerDead };
}
