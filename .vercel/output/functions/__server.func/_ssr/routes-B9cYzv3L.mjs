import { o as __toESM } from "../_runtime.mjs";
import { R as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as string, i as object, r as number, t as _enum } from "../_libs/zod.mjs";
import { i as Pencil, n as Volume2, t as VolumeX } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B9cYzv3L.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var WORLD_H = 512;
var GROUND_Y = WORLD_H - 112;
function setViewHeight(h) {
	WORLD_H = Math.max(512, h);
	GROUND_Y = WORLD_H - 112;
}
var GRAVITY = 1380;
var FLAP_V = -420;
var ROT_UP = -28 * (Math.PI / 180);
var ROT_DOWN_SPEED = 2.8;
var MAX_ROT = 90 * (Math.PI / 180);
var FLASH_TIME = .18;
var HITSTOP = .09;
var STORAGE_KEY = "tappy-tom-v2";
var COLORS = {
	skyDay: "#4EC0CA",
	skyNight: "#04749B",
	skyDeep: "#2A8A94",
	cloud: "#E8FCFF",
	cloudShade: "#C5E8F0",
	building: "#E6E0E0",
	building2: "#D2CCCC",
	building3: "#C4BFC4",
	windowDay: "#9EC8C8",
	windowNight: "#E8D878",
	bushLight: "#6BB82A",
	bushMid: "#50921E",
	bushDark: "#3A6E16",
	grassLight: "#9CE659",
	grass: "#73BF2E",
	grassDark: "#4B9B1E",
	dirt: "#DED895",
	dirtDark: "#D4C07A",
	dirtSpot: "#C8B068",
	dirtLine: "#C4A056",
	pipeLite: "#9CE659",
	pipe: "#73BF2E",
	pipeMid: "#5AA824",
	pipeDark: "#3E7A18",
	pipeEdge: "#163A08",
	uiYellow: "#F7E14A",
	uiOrange: "#E07A22",
	uiWhite: "#FFFFFF",
	uiBlack: "#100C08",
	panel: "#EEE4B8",
	panelDark: "#C9B878",
	panelEdge: "#4A3A20",
	gameOver: "#D44A3A",
	medalBronze: "#C47A3A",
	medalSilver: "#C8D0D4",
	medalGold: "#F0C84A",
	medalPlat: "#D8F0F4"
};
var GameAudio = class {
	ctx = null;
	bus = null;
	muted = false;
	unlock() {
		const ctx = this.ensure();
		if (ctx.state === "suspended") ctx.resume();
	}
	setMuted(muted) {
		this.muted = muted;
		const bus = this.bus;
		if (!bus) return;
		const t = bus.master.context.currentTime;
		bus.master.gain.setTargetAtTime(muted ? 0 : 1, t, .02);
	}
	flap() {
		const ctx = this.ensure();
		if (this.muted) return;
		const t = ctx.currentTime;
		const osc = ctx.createOscillator();
		const g = ctx.createGain();
		osc.type = "triangle";
		osc.frequency.setValueAtTime(520, t);
		osc.frequency.exponentialRampToValueAtTime(240, t + .09);
		g.gain.setValueAtTime(1e-4, t);
		g.gain.exponentialRampToValueAtTime(.18, t + .012);
		g.gain.exponentialRampToValueAtTime(1e-4, t + .11);
		osc.connect(g);
		g.connect(this.sfx());
		osc.start(t);
		osc.stop(t + .12);
		this.noise(t, .05, .06, 1400);
	}
	point() {
		const ctx = this.ensure();
		if (this.muted) return;
		const t = ctx.currentTime;
		this.tone(t, 880, .07, .12, "square");
		this.tone(t + .07, 1320, .09, .12, "square");
	}
	hit() {
		const ctx = this.ensure();
		if (this.muted) return;
		const t = ctx.currentTime;
		this.noise(t, .14, .22, 600);
		this.tone(t, 140, .18, .22, "sine");
	}
	die() {
		const ctx = this.ensure();
		if (this.muted) return;
		const t = ctx.currentTime;
		const osc = ctx.createOscillator();
		const g = ctx.createGain();
		osc.type = "sawtooth";
		osc.frequency.setValueAtTime(420, t);
		osc.frequency.exponentialRampToValueAtTime(70, t + .42);
		g.gain.setValueAtTime(1e-4, t);
		g.gain.exponentialRampToValueAtTime(.16, t + .02);
		g.gain.exponentialRampToValueAtTime(1e-4, t + .45);
		osc.connect(g);
		g.connect(this.sfx());
		osc.start(t);
		osc.stop(t + .46);
	}
	swoosh() {
		const ctx = this.ensure();
		if (this.muted) return;
		this.noise(ctx.currentTime, .12, .08, 900);
	}
	ensure() {
		if (!this.ctx) {
			const Ctx = window.AudioContext || window.webkitAudioContext;
			this.ctx = new Ctx({ latencyHint: "interactive" });
			const master = this.ctx.createGain();
			const sfx = this.ctx.createGain();
			sfx.gain.value = .9;
			master.gain.value = this.muted ? 0 : 1;
			sfx.connect(master);
			master.connect(this.ctx.destination);
			this.bus = {
				master,
				sfx
			};
		}
		return this.ctx;
	}
	sfx() {
		this.ensure();
		return this.bus.sfx;
	}
	tone(when, freq, dur, vol, type) {
		const ctx = this.ensure();
		const osc = ctx.createOscillator();
		const g = ctx.createGain();
		osc.type = type;
		osc.frequency.setValueAtTime(freq, when);
		g.gain.setValueAtTime(1e-4, when);
		g.gain.exponentialRampToValueAtTime(vol, when + .01);
		g.gain.exponentialRampToValueAtTime(1e-4, when + dur);
		osc.connect(g);
		g.connect(this.sfx());
		osc.start(when);
		osc.stop(when + dur + .02);
	}
	noise(when, dur, vol, cutoff) {
		const ctx = this.ensure();
		const n = 2 * ctx.sampleRate * dur;
		const buf = ctx.createBuffer(1, n, ctx.sampleRate);
		const data = buf.getChannelData(0);
		for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
		const src = ctx.createBufferSource();
		src.buffer = buf;
		const filter = ctx.createBiquadFilter();
		filter.type = "lowpass";
		filter.frequency.value = cutoff;
		const g = ctx.createGain();
		g.gain.setValueAtTime(vol, when);
		g.gain.exponentialRampToValueAtTime(1e-4, when + dur);
		src.connect(filter);
		filter.connect(g);
		g.connect(this.sfx());
		src.start(when);
		src.stop(when + dur + .02);
	}
};
function makeCanvas(w, h) {
	const c = document.createElement("canvas");
	c.width = w;
	c.height = h;
	const ctx = c.getContext("2d");
	if (!ctx) throw new Error("2d context");
	ctx.imageSmoothingEnabled = false;
	return {
		c,
		ctx
	};
}
function rr(n) {
	return Math.round(n);
}
function createAssets(player, playerDead = null) {
	return {
		player,
		playerDead,
		ground: drawGroundTile(),
		cityDay: drawCity(false),
		cityNight: drawCity(true)
	};
}
function drawGroundTile() {
	const tw = 24;
	const { c, ctx } = makeCanvas(tw, 112);
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
function drawCity(night) {
	const h = 170;
	const { c, ctx } = makeCanvas(288, h);
	const bcols = night ? [
		"#5A6A78",
		"#4A5866",
		"#3E4C58",
		"#687888"
	] : [
		COLORS.building,
		COLORS.building2,
		COLORS.building3,
		"#DAD4D8"
	];
	const win = night ? COLORS.windowNight : COLORS.windowDay;
	[
		{
			x: 0,
			w: 38,
			h: 92
		},
		{
			x: 36,
			w: 28,
			h: 70
		},
		{
			x: 62,
			w: 44,
			h: 110
		},
		{
			x: 104,
			w: 32,
			h: 78
		},
		{
			x: 132,
			w: 50,
			h: 124
		},
		{
			x: 178,
			w: 26,
			h: 66
		},
		{
			x: 200,
			w: 40,
			h: 98
		},
		{
			x: 236,
			w: 52,
			h: 84
		}
	].forEach((b, i) => {
		const y = 142 - b.h;
		ctx.fillStyle = bcols[i % bcols.length];
		ctx.fillRect(b.x, y, b.w, b.h);
		ctx.fillStyle = win;
		let n = 0;
		for (let wy = y + 8; wy < y + b.h - 8; wy += 12) for (let wx = b.x + 5; wx < b.x + b.w - 6; wx += 8) {
			n += 1;
			if (night && (n * 17 + i * 13) % 7 > 3) continue;
			ctx.fillRect(wx, wy, 4, 6);
		}
	});
	for (const [x, w, bh] of [
		[
			0,
			28,
			22
		],
		[
			22,
			36,
			24
		],
		[
			50,
			24,
			20
		],
		[
			78,
			34,
			26
		],
		[
			110,
			22,
			18
		],
		[
			136,
			38,
			26
		],
		[
			172,
			28,
			22
		],
		[
			204,
			34,
			24
		],
		[
			238,
			26,
			20
		],
		[
			264,
			36,
			24
		]
	]) {
		ctx.fillStyle = COLORS.bushDark;
		ctx.fillRect(x, h - bh + 4, w + 6, bh);
		ctx.fillStyle = COLORS.bushMid;
		ctx.fillRect(x + 2, h - bh, w, bh);
		ctx.fillStyle = COLORS.bushLight;
		ctx.fillRect(x + 6, h - bh + 4, Math.max(8, w - 10), 8);
	}
	return c;
}
function drawSky(ctx, night) {
	ctx.fillStyle = night ? COLORS.skyNight : COLORS.skyDay;
	ctx.fillRect(0, 0, 288, WORLD_H);
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
			[30, 80]
		]) ctx.fillRect(x, y, 2, 2);
	}
}
function drawCloud(ctx, x, y, s) {
	ctx.fillStyle = COLORS.cloud;
	for (const [bx, by, bw, bh] of [
		[
			0,
			8,
			18,
			12
		],
		[
			10,
			0,
			22,
			16
		],
		[
			24,
			6,
			18,
			12
		],
		[
			8,
			10,
			26,
			10
		]
	]) ctx.fillRect(rr(x + bx * s), rr(y + by * s), rr(bw * s), rr(bh * s));
	ctx.fillStyle = COLORS.cloudShade;
	ctx.fillRect(rr(x + 8 * s), rr(y + 14 * s), rr(22 * s), rr(4 * s));
}
function drawParallax(ctx, assets, night, cloudOff, cityOff) {
	const cloudY = [
		{
			x: 10,
			y: 36,
			s: 1
		},
		{
			x: 118,
			y: 58,
			s: .85
		},
		{
			x: 210,
			y: 28,
			s: 1.1
		}
	];
	const span = 368;
	const cx = (cloudOff % span + span) % span;
	for (let i = -1; i <= 1; i++) for (const cl of cloudY) drawCloud(ctx, cl.x - cx + i * span, cl.y, cl.s);
	const city = night ? assets.cityNight : assets.cityDay;
	const cityY = GROUND_Y - city.height + 6;
	const cy = (cityOff % 288 + 288) % 288;
	ctx.drawImage(city, -cy, cityY);
	ctx.drawImage(city, -cy + 288, cityY);
}
function drawGround(ctx, assets, offset) {
	const tile = assets.ground;
	const tw = tile.width;
	const off = (offset % tw + tw) % tw;
	for (let x = -off; x < 288; x += tw) ctx.drawImage(tile, rr(x), GROUND_Y);
	ctx.fillStyle = COLORS.pipeEdge;
	ctx.fillRect(0, GROUND_Y, 288, 2);
}
function drawPipe(ctx, pipe) {
	const gapTop = pipe.gapY - pipe.gapH / 2;
	const gapBot = pipe.gapY + pipe.gapH / 2;
	drawPipeColumn(ctx, pipe.x, 0, gapTop, "down");
	drawPipeColumn(ctx, pipe.x, gapBot, GROUND_Y - gapBot, "up");
}
function drawPipeColumn(ctx, x, y, h, cap) {
	if (h <= 0) return;
	const xi = rr(x);
	const yi = rr(y);
	const hi = rr(h);
	const w = 52;
	ctx.fillStyle = COLORS.pipeEdge;
	ctx.fillRect(xi - 1, yi, 54, hi);
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
	const capY = cap === "down" ? yi + hi - 26 : yi;
	const capX = xi - 3;
	const capW = 58;
	ctx.fillStyle = COLORS.pipeEdge;
	ctx.fillRect(capX - 1, capY - 1, 60, 28);
	ctx.fillStyle = COLORS.pipe;
	ctx.fillRect(capX, capY, capW, 26);
	ctx.fillStyle = COLORS.pipeLite;
	ctx.fillRect(capX + 1, capY + 1, 10, 24);
	ctx.fillStyle = COLORS.pipeDark;
	ctx.fillRect(capX + capW - 14, capY + 1, 14, 24);
	ctx.fillStyle = COLORS.pipeLite;
	ctx.fillRect(capX, capY + 2, capW, 3);
	ctx.fillStyle = COLORS.pipeDark;
	ctx.fillRect(capX, capY + 26 - 5, capW, 4);
}
function drawBird(ctx, assets, x, y, rot, squash, flash, dead = false) {
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(rot);
	const sx = 1 + squash * .18;
	const sy = 1 - squash * .14;
	ctx.scale(sx, sy);
	const w = 46;
	const h = 62;
	const sprite = dead && assets.playerDead && assets.playerDead.complete && assets.playerDead.naturalWidth > 0 ? assets.playerDead : assets.player && assets.player.complete && assets.player.naturalWidth > 0 ? assets.player : null;
	if (sprite) {
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = "high";
		ctx.drawImage(sprite, -23, -31, w, h);
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
		ctx.fillRect(-23, -31, w, h);
		ctx.globalCompositeOperation = "source-over";
	}
	ctx.restore();
}
function drawParticles(ctx, parts) {
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
var DIGITS = {
	"0": [
		"01110",
		"10001",
		"10011",
		"10101",
		"11001",
		"10001",
		"01110"
	],
	"1": [
		"00100",
		"01100",
		"00100",
		"00100",
		"00100",
		"00100",
		"01110"
	],
	"2": [
		"01110",
		"10001",
		"00001",
		"00010",
		"00100",
		"01000",
		"11111"
	],
	"3": [
		"01110",
		"10001",
		"00001",
		"00110",
		"00001",
		"10001",
		"01110"
	],
	"4": [
		"00010",
		"00110",
		"01010",
		"10010",
		"11111",
		"00010",
		"00010"
	],
	"5": [
		"11111",
		"10000",
		"11110",
		"00001",
		"00001",
		"10001",
		"01110"
	],
	"6": [
		"01110",
		"10000",
		"11110",
		"10001",
		"10001",
		"10001",
		"01110"
	],
	"7": [
		"11111",
		"00001",
		"00010",
		"00100",
		"01000",
		"01000",
		"01000"
	],
	"8": [
		"01110",
		"10001",
		"10001",
		"01110",
		"10001",
		"10001",
		"01110"
	],
	"9": [
		"01110",
		"10001",
		"10001",
		"01111",
		"00001",
		"00001",
		"01110"
	]
};
function drawScore(ctx, score, cx, y, scale) {
	const str = String(Math.max(0, Math.floor(score)));
	const gw = 6 * scale;
	let x = cx - (str.length * gw - scale) / 2;
	for (const ch of str) {
		drawDigit(ctx, ch, x, y, scale);
		x += gw;
	}
}
function drawDigit(ctx, ch, x, y, scale) {
	const g = DIGITS[ch] ?? DIGITS["0"];
	for (let row = 0; row < g.length; row++) {
		const line = g[row];
		for (let col = 0; col < line.length; col++) {
			if (line[col] !== "1") continue;
			const px = rr(x + col * scale);
			const py = rr(y + row * scale);
			ctx.fillStyle = COLORS.uiBlack;
			ctx.fillRect(px - scale, py - scale, scale * 3, scale * 3);
		}
	}
	for (let row = 0; row < g.length; row++) {
		const line = g[row];
		for (let col = 0; col < line.length; col++) {
			if (line[col] !== "1") continue;
			ctx.fillStyle = COLORS.uiWhite;
			ctx.fillRect(rr(x + col * scale), rr(y + row * scale), scale, scale);
		}
	}
}
function drawOutlinedText(ctx, text, x, y, size, fill, align = "center") {
	ctx.save();
	ctx.font = `${size}px "Press Start 2P", ui-monospace, monospace`;
	ctx.textAlign = align;
	ctx.textBaseline = "middle";
	ctx.lineJoin = "round";
	ctx.miterLimit = 2;
	ctx.lineWidth = Math.max(3, Math.round(size * .22));
	ctx.strokeStyle = COLORS.uiBlack;
	ctx.strokeText(text, x, y);
	ctx.fillStyle = fill;
	ctx.fillText(text, x, y);
	ctx.restore();
}
function drawGetReady(ctx, t, uiTop = 0, tapY = 292) {
	drawOutlinedText(ctx, "GET READY", 144, 118 + uiTop, 12, COLORS.uiYellow);
	const pulse = .55 + Math.sin(t * 6) * .25;
	ctx.save();
	ctx.globalAlpha = pulse;
	drawOutlinedText(ctx, "TAP", 144, tapY, 10, COLORS.uiWhite);
	ctx.restore();
}
function drawTitle(ctx, uiTop = 0) {
	drawOutlinedText(ctx, "TAPPY", 144, 40 + uiTop, 16, COLORS.uiYellow);
	drawOutlinedText(ctx, "TOM", 144, 64 + uiTop, 16, COLORS.uiYellow);
}
function drawFlash(ctx, amount) {
	if (amount <= 0) return;
	ctx.fillStyle = `rgba(255,255,255,${amount})`;
	ctx.fillRect(0, 0, 288, WORLD_H);
}
var EMPTY = {
	version: 1,
	best: 0,
	games: 0
};
function loadSave() {
	if (typeof window === "undefined") return { ...EMPTY };
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return { ...EMPTY };
		const parsed = JSON.parse(raw);
		return {
			version: 1,
			best: typeof parsed.best === "number" && parsed.best >= 0 ? parsed.best : 0,
			games: typeof parsed.games === "number" && parsed.games >= 0 ? parsed.games : 0
		};
	} catch {
		return { ...EMPTY };
	}
}
function writeSave(data) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch {}
}
var STEP = 1 / 60;
var FlappyEngine = class {
	canvas;
	ctx;
	audio = new GameAudio();
	assets = null;
	save = loadSave();
	raf = 0;
	acc = 0;
	last = 0;
	running = false;
	reduced = false;
	night = false;
	mode = "ready";
	bird = {
		x: 72,
		y: 230,
		vy: 0,
		rot: 0,
		squash: 0
	};
	pipes = [];
	particles = [];
	score = 0;
	runBest = 0;
	isNewBest = false;
	groundOff = 0;
	cityOff = 0;
	cloudOff = 0;
	bobT = 0;
	flash = 0;
	hitstop = 0;
	trauma = 0;
	overT = 0;
	panelSlide = 0;
	dyingT = 0;
	time = 0;
	scorePop = 0;
	lastPadA = false;
	lastFlapMs = 0;
	sawPointer = false;
	uiTop = 0;
	onMuted;
	onOver;
	onHud;
	constructor(canvas) {
		this.canvas = canvas;
		const ctx = canvas.getContext("2d", { alpha: false });
		if (!ctx) throw new Error("Canvas 2D unavailable");
		this.ctx = ctx;
		this.reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	}
	setMutedHandler(fn) {
		this.onMuted = fn;
	}
	setOverHandler(fn) {
		this.onOver = fn;
	}
	setHudHandler(fn) {
		this.onHud = fn;
		fn(this.score, this.save.best);
	}
	restart() {
		this.resetReady(false);
	}
	get muted() {
		return this.audio.muted;
	}
	setMuted(muted) {
		this.audio.setMuted(muted);
		this.onMuted?.(muted);
	}
	async start() {
		const { player, playerDead } = await loadPlayers();
		this.assets = createAssets(player, playerDead);
		this.resetReady(true);
		this.bind();
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
		if (this.mode === "over") return;
	}
	loop = (now) => {
		if (!this.running) return;
		const raw = (now - this.last) / 1e3;
		this.last = now;
		const dt = Math.min(raw, .1);
		this.pollPad();
		this.layout();
		this.acc += dt;
		while (this.acc >= STEP) {
			if (this.hitstop > 0) this.hitstop -= STEP;
			else this.update(STEP);
			this.acc -= STEP;
		}
		this.render();
		this.raf = requestAnimationFrame(this.loop);
	};
	update(dt) {
		this.time += dt;
		this.bobT += dt;
		this.flash = Math.max(0, this.flash - dt / FLASH_TIME);
		this.trauma = Math.max(0, this.trauma - dt * 3.2);
		this.bird.squash = Math.max(0, this.bird.squash - dt * 6);
		this.scorePop = Math.max(0, this.scorePop - dt * 5.5);
		const speed = this.currentSpeed();
		if (this.mode === "playing" || this.mode === "ready") {
			this.groundOff += speed * dt;
			this.cityOff += speed * .42 * dt;
			this.cloudOff += speed * .18 * dt;
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
			if (this.dyingT > .05) this.integrateBird(dt);
			if (this.bird.y + 13 >= GROUND_Y - 1) {
				this.bird.y = GROUND_Y - 13;
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
	currentSpeed() {
		if (this.score <= 15) return 118;
		return Math.min(168, 118 + (this.score - 15) * 1.8);
	}
	currentGap() {
		return Math.max(124, 148 - Math.max(0, this.score - 10) * .8);
	}
	beginPlay() {
		this.mode = "playing";
		this.pipes = [];
		this.spawnPipe(340);
		this.spawnPipe(516);
		this.spawnPipe(692);
	}
	doFlap() {
		this.bird.vy = FLAP_V;
		this.bird.rot = ROT_UP;
		this.bird.squash = 1;
		this.audio.flap();
		this.spawnPuff();
	}
	integrateBird(dt) {
		this.bird.vy = Math.min(520, this.bird.vy + GRAVITY * dt);
		this.bird.y += this.bird.vy * dt;
		if (this.bird.vy < 0) this.bird.rot = ROT_UP;
		else this.bird.rot = Math.min(MAX_ROT, this.bird.rot + ROT_DOWN_SPEED * dt);
	}
	spawnPipe(x) {
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
		this.pipes.push({
			x,
			gapY,
			gapH: gap,
			scored: false
		});
	}
	stepPipes(dt, speed) {
		for (const p of this.pipes) p.x -= speed * dt;
		while (this.pipes.length && this.pipes[0].x + 52 < -40) this.pipes.shift();
		const last = this.pipes[this.pipes.length - 1];
		if (last && last.x < 112) this.spawnPipe(last.x + 176);
		for (const p of this.pipes) if (!p.scored && p.x + 52 < this.bird.x) {
			p.scored = true;
			this.score += 1;
			this.scorePop = 1;
			this.audio.point();
			this.onHud?.(this.score, Math.max(this.save.best, this.score));
		}
	}
	collide() {
		const { x, y } = this.bird;
		if (y + 13 >= GROUND_Y) {
			this.kill();
			return;
		}
		for (const p of this.pipes) if (circlePipe(x, y, 13, p)) {
			this.kill();
			return;
		}
	}
	kill() {
		if (this.mode !== "playing") return;
		this.mode = "dying";
		this.dyingT = 0;
		this.flash = this.reduced ? .15 : 1;
		this.hitstop = this.reduced ? 0 : HITSTOP;
		this.trauma = this.reduced ? .15 : .85;
		this.audio.hit();
		this.spawnBurst();
		this.bird.squash = 0;
		if (this.bird.y + 13 >= GROUND_Y) {
			this.bird.y = GROUND_Y - 13;
			this.enterOver();
		}
	}
	enterOver() {
		if (this.mode === "over") return;
		this.mode = "over";
		this.overT = 0;
		this.panelSlide = 0;
		this.audio.die();
		this.save.games += 1;
		this.isNewBest = this.score > this.save.best;
		if (this.isNewBest) this.save.best = this.score;
		this.runBest = this.save.best;
		writeSave(this.save);
		this.onHud?.(this.score, this.save.best);
		this.onOver?.(this.score);
	}
	resetReady(randomNight) {
		if (randomNight) this.night = Math.random() < .28;
		this.mode = "ready";
		this.bird = {
			x: 72,
			y: this.readyY(),
			vy: 0,
			rot: 0,
			squash: 0
		};
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
	spawnPuff() {
		for (let i = 0; i < 4; i++) this.particles.push({
			x: this.bird.x - 10,
			y: this.bird.y + 6,
			vx: -40 - Math.random() * 50,
			vy: (Math.random() - .5) * 60,
			life: .28 + Math.random() * .12,
			max: .4,
			size: 2 + Math.random() * 3,
			rot: 0,
			vr: 0,
			color: "rgba(255,255,255,0.85)"
		});
	}
	spawnBurst() {
		const cols = [
			"#d4a574",
			"#c48a5a",
			"#eee4b8",
			"#73BF2E",
			"#ffffff"
		];
		for (let i = 0; i < 14; i++) {
			const a = Math.random() * Math.PI * 2;
			const sp = 80 + Math.random() * 180;
			this.particles.push({
				x: this.bird.x,
				y: this.bird.y,
				vx: Math.cos(a) * sp,
				vy: Math.sin(a) * sp - 40,
				life: .4 + Math.random() * .35,
				max: .75,
				size: 2 + Math.random() * 4,
				rot: Math.random() * 6,
				vr: (Math.random() - .5) * 10,
				color: cols[i % cols.length]
			});
		}
	}
	stepParticles(dt) {
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
	readyY() {
		return GROUND_Y * .48;
	}
	layout() {
		const cssW = Math.max(1, this.canvas.clientWidth || 288);
		const cssH = Math.max(1, this.canvas.clientHeight || 512);
		const aspect = cssH / cssW;
		setViewHeight(aspect >= 512 / 288 ? 288 * aspect : 512);
		const sat = readSafeTopPx();
		this.uiTop = sat / cssH * WORLD_H + 8;
	}
	render() {
		const assets = this.assets;
		if (!assets) return;
		const { canvas, ctx } = this;
		const dpr = Math.min(window.devicePixelRatio || 1, 3);
		const cssW = canvas.clientWidth || 288;
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
		const scaleX = bw / 288;
		const scaleY = bh / WORLD_H;
		if (Math.abs(scaleX - scaleY) < .02) ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
		else {
			const scale = Math.min(scaleX, scaleY);
			const ox = (bw - 288 * scale) / 2;
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
		drawBird(ctx, assets, this.bird.x, this.bird.y, this.bird.rot, dead ? 0 : this.bird.squash, this.flash, dead);
		drawGround(ctx, assets, this.groundOff);
		ctx.restore();
		if (this.mode === "ready") {
			drawTitle(ctx, this.uiTop);
			drawGetReady(ctx, this.time, this.uiTop, this.bird.y + 48);
		} else if (this.mode === "playing" || this.mode === "dying") {
			const base = 8;
			const pop = this.reduced ? 1 : 1 + this.scorePop * this.scorePop * .7;
			const y = 40 + this.uiTop;
			const cx = 144;
			const cy = y + 28;
			ctx.save();
			ctx.translate(cx, cy);
			ctx.scale(pop, pop);
			ctx.translate(-144, -cy);
			drawScore(ctx, this.score, cx, y, base);
			ctx.restore();
		} else if (this.mode === "over") {}
		drawFlash(ctx, this.flash * .55);
	}
	bind() {
		const opts = {
			passive: false,
			capture: true
		};
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
	unbind() {
		const opts = { capture: true };
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
	isUiControl(e) {
		const t = e.target;
		return t instanceof Element && Boolean(t.closest("[data-no-flap]"));
	}
	onPointer = (e) => {
		if (this.isUiControl(e)) return;
		if (e.pointerType === "mouse" && e.button !== 0) return;
		e.preventDefault();
		this.sawPointer = true;
		this.requestFlap();
	};
	onTouch = (e) => {
		if (this.isUiControl(e)) return;
		e.preventDefault();
		this.sawPointer = true;
		this.requestFlap();
	};
	onMouse = (e) => {
		if (this.isUiControl(e)) return;
		if (e.button !== 0) return;
		e.preventDefault();
		this.sawPointer = true;
		this.requestFlap();
	};
	onClick = (e) => {
		if (this.isUiControl(e)) return;
		e.preventDefault();
		if (this.sawPointer) {
			this.sawPointer = false;
			return;
		}
		this.requestFlap();
	};
	onKey = (e) => {
		if (e.repeat) return;
		if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW" || e.code === "Enter" || e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W" || e.key === "Enter") {
			e.preventDefault();
			this.requestFlap();
		}
		if (e.code === "KeyM" || e.key === "m" || e.key === "M") this.setMuted(!this.audio.muted);
	};
	onKeyUp = (e) => {
		if (e.code === "Space" || e.code === "ArrowUp" || e.key === " ") e.preventDefault();
	};
	onBlur = () => {
		this.lastPadA = false;
	};
	onVis = () => {
		if (document.visibilityState === "visible") this.audio.unlock();
	};
	onResize = () => {
		cachedSafeTop = null;
	};
	onMenu = (e) => e.preventDefault();
	pollPad() {
		const pads = navigator.getGamepads?.() ?? [];
		let pressed = false;
		for (const pad of pads) {
			if (!pad) continue;
			if (pad.buttons[0]?.pressed) pressed = true;
		}
		if (pressed && !this.lastPadA) this.requestFlap();
		this.lastPadA = pressed;
	}
};
function circlePipe(cx, cy, r, p) {
	const topH = p.gapY - p.gapH / 2;
	const botY = p.gapY + p.gapH / 2;
	if (circleRect(cx, cy, r, p.x, 0, 52, topH)) return true;
	if (circleRect(cx, cy, r, p.x, botY, 52, GROUND_Y - botY)) return true;
	return false;
}
function circleRect(cx, cy, r, x, y, w, h) {
	const nx = Math.max(x, Math.min(cx, x + w));
	const ny = Math.max(y, Math.min(cy, y + h));
	const dx = cx - nx;
	const dy = cy - ny;
	return dx * dx + dy * dy < r * r;
}
var cachedSafeTop = null;
function readSafeTopPx() {
	if (cachedSafeTop != null) return cachedSafeTop;
	if (typeof document === "undefined") return 0;
	const probe = document.createElement("div");
	probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top,0px)";
	document.body.appendChild(probe);
	cachedSafeTop = parseFloat(getComputedStyle(probe).paddingTop) || 0;
	probe.remove();
	return cachedSafeTop;
}
function loadImg(src) {
	return new Promise((resolve) => {
		const img = new Image();
		img.decoding = "async";
		img.onload = () => resolve(img);
		img.onerror = () => resolve(null);
		img.src = src;
	});
}
async function loadPlayers() {
	const [player, playerDead] = await Promise.all([loadImg("/player.png"), loadImg("/player-dead.png")]);
	return {
		player,
		playerDead
	};
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var USERNAME_KEY = "tappy-tom-username";
var PLAYER_KEY = "tappy-tom-player-id";
var playerIdSchema = string().trim().min(8).max(64).regex(/^[A-Za-z0-9_-]+$/);
function sanitizeUsername(raw) {
	return raw.replace(/[^A-Za-z0-9_]/g, "").slice(0, 16);
}
function randomUsername() {
	return `Tom${Math.floor(1e3 + Math.random() * 9e3)}`;
}
function getPlayerId() {
	if (typeof window === "undefined") return "";
	try {
		const existing = window.localStorage.getItem(PLAYER_KEY);
		if (existing && playerIdSchema.safeParse(existing).success) return existing;
		const id = crypto.randomUUID();
		window.localStorage.setItem(PLAYER_KEY, id);
		return id;
	} catch {
		return "";
	}
}
function peekLocalUsername() {
	if (typeof window === "undefined") return "YOU";
	try {
		const v = window.localStorage.getItem(USERNAME_KEY);
		if (v && v.length >= 2) return v;
	} catch {}
	return "YOU";
}
function loadLocalName() {
	if (typeof window === "undefined") return "PLAYER";
	try {
		const v = window.localStorage.getItem(USERNAME_KEY);
		if (v && v.length >= 2) return v;
		const n = randomUsername();
		window.localStorage.setItem(USERNAME_KEY, n);
		return n;
	} catch {
		return "PLAYER";
	}
}
function saveLocalName(name) {
	try {
		window.localStorage.setItem(USERNAME_KEY, name);
	} catch {}
}
var setUsername = createServerFn({ method: "POST" }).validator(object({
	playerId: playerIdSchema,
	username: string()
})).handler(createSsrRpc("0504f9fad1f137b625bf5fb1d320a5fef2f0cab413e491a97be13b73ac04b766"));
var submitScore = createServerFn({ method: "POST" }).validator(object({
	playerId: playerIdSchema,
	username: string(),
	score: number().int().min(0).max(9999)
})).handler(createSsrRpc("4a7dba7782a7f37b2020d8a73be0dc1d1c096dcbc0403d9f11356dfe355e6e56"));
var getLeaderboard = createServerFn({ method: "GET" }).validator(object({
	period: _enum(["daily", "all"]),
	playerId: playerIdSchema.optional(),
	username: string().optional()
})).handler(createSsrRpc("7a000c470b38d07563bebf40f091edd1c8d8025155cbf05858f22a8d112c7874"));
var scoreShadow = "[text-shadow:3px_3px_0_var(--color-ink),-2px_-2px_0_var(--color-ink),2px_-2px_0_var(--color-ink),-2px_2px_0_var(--color-ink)]";
function HudUsername() {
	const [name, setName] = (0, import_react.useState)("PLAYER");
	const [editing, setEditing] = (0, import_react.useState)(false);
	const [draft, setDraft] = (0, import_react.useState)("PLAYER");
	(0, import_react.useEffect)(() => {
		setName(loadLocalName());
		const id = getPlayerId();
		const local = loadLocalName();
		if (!id || local.length < 2) return;
		setUsername({ data: {
			playerId: id,
			username: local
		} }).catch(() => void 0);
	}, []);
	function openEdit() {
		setDraft(name);
		setEditing(true);
	}
	async function save() {
		const next = sanitizeUsername(draft);
		if (next.length < 2) return;
		setName(next);
		setEditing(false);
		saveLocalName(next);
		const id = getPlayerId();
		if (id) try {
			await setUsername({ data: {
				playerId: id,
				username: next
			} });
		} catch {}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"data-no-flap": true,
		onPointerDown: (e) => e.stopPropagation(),
		onClick: openEdit,
		className: "absolute top-[max(10px,env(safe-area-inset-top))] left-[max(10px,env(safe-area-inset-left))] z-20 flex max-w-[50%] min-h-11 items-center gap-2 px-1 text-left",
		"aria-label": "Edit username",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `truncate font-display text-[10px] leading-none text-panel ${scoreShadow}`,
			children: name
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {
			className: "size-4 shrink-0 text-panel drop-shadow",
			strokeWidth: 2.6
		})]
	}), editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-no-flap": true,
		className: "absolute inset-0 z-40 grid place-items-center bg-overlay px-4",
		onPointerDown: (e) => e.stopPropagation(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "w-full max-w-xs rounded-[20px] border-4 border-ink bg-panel p-4 shadow-md",
			onSubmit: (e) => {
				e.preventDefault();
				save();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-[10px] text-ink",
					children: "USERNAME"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					autoFocus: true,
					maxLength: 16,
					value: draft,
					onChange: (e) => setDraft(sanitizeUsername(e.target.value)),
					className: "mt-3 min-h-11 w-full select-text rounded-[12px] border-2 border-ink bg-panel-dark/40 px-3 font-display text-xs text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
					"aria-label": "Username"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 font-display text-[8px] leading-relaxed text-muted",
					children: "Letters, numbers, underscore. 2–16 chars."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setEditing(false),
						className: "min-h-11 rounded-[12px] border-2 border-ink bg-panel-dark font-display text-[10px] text-ink active:scale-[0.98]",
						children: "CANCEL"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "min-h-11 rounded-[12px] border-4 border-ink bg-play font-display text-[10px] text-ink active:scale-[0.98]",
						children: "SAVE"
					})]
				})
			]
		})
	}) : null] });
}
function HudScore({ score, best }) {
	const [bump, setBump] = (0, import_react.useState)(false);
	const prev = (0, import_react.useRef)(score);
	(0, import_react.useEffect)(() => {
		if (score === prev.current) return;
		prev.current = score;
		if (score <= 0) return;
		setBump(true);
		const id = window.setTimeout(() => setBump(false), 220);
		return () => window.clearTimeout(id);
	}, [score]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `pointer-events-none absolute top-[max(10px,env(safe-area-inset-top))] right-[max(10px,env(safe-area-inset-right))] z-20 text-right text-panel ${scoreShadow}`,
		"aria-live": "polite",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `font-display text-3xl leading-none tabular-nums transition-transform duration-150 ease-out ${bump ? "scale-125" : "scale-100"}`,
				children: score
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-display text-[8px] leading-none tracking-wide",
				children: "HIGH SCORE"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 font-display text-lg leading-none tabular-nums",
				children: best
			})
		]
	});
}
function formatReset(iso) {
	const ms = Math.max(0, new Date(iso).getTime() - Date.now());
	const s = Math.floor(ms / 1e3);
	const h = Math.floor(s / 3600);
	const m = Math.floor(s % 3600 / 60);
	const sec = s % 60;
	const pad = (n) => String(n).padStart(2, "0");
	return `${pad(h)}H ${pad(m)}M ${pad(sec)}S`;
}
function medalClass(rank) {
	if (rank === 1) return "bg-medal-gold text-ink";
	if (rank === 2) return "bg-medal-silver text-ink";
	if (rank === 3) return "bg-medal-bronze text-panel";
	return "bg-panel-dark text-ink";
}
function Row({ rank, username, score, highlight }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `flex items-center gap-2 rounded-[10px] px-2 py-1.5 ${highlight ? "bg-you text-panel" : ""}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `grid size-7 shrink-0 place-items-center rounded-full font-display text-[9px] ${highlight ? "bg-ink/30 text-panel" : medalClass(Number(rank) || 99)}`,
				children: rank
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 flex-1 truncate font-display text-[9px] leading-none",
				children: username
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `min-w-14 rounded-[8px] px-2 py-1 text-right font-display text-[10px] tabular-nums ${highlight ? "bg-ink/25" : "bg-panel-dark"}`,
				children: score
			})
		]
	});
}
function GameOverBoard({ score, onPlay }) {
	const [period, setPeriod] = (0, import_react.useState)("daily");
	const [board, setBoard] = (0, import_react.useState)(null);
	const [tick, setTick] = (0, import_react.useState)(0);
	const [posted, setPosted] = (0, import_react.useState)(false);
	const [playerId, setPlayerId] = (0, import_react.useState)("");
	const [username, setUsername] = (0, import_react.useState)("PLAYER");
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => setTick((n) => n + 1), 1e3);
		return () => window.clearInterval(id);
	}, []);
	(0, import_react.useEffect)(() => {
		setPlayerId(getPlayerId());
		setUsername(peekLocalUsername());
	}, []);
	(0, import_react.useEffect)(() => {
		if (!playerId || username.length < 2) return;
		let live = true;
		(async () => {
			if (playerId && username.length >= 2) try {
				await submitScore({ data: {
					playerId,
					username,
					score
				} });
			} catch {}
			if (live) setPosted(true);
		})();
		return () => {
			live = false;
		};
	}, [
		playerId,
		username,
		score
	]);
	(0, import_react.useEffect)(() => {
		if (!posted) return;
		let live = true;
		getLeaderboard({ data: {
			period,
			playerId: playerId || void 0,
			username
		} }).then((b) => {
			if (live) setBoard(b);
		}).catch(() => {
			if (live) setBoard(null);
		});
		return () => {
			live = false;
		};
	}, [
		period,
		playerId,
		username,
		posted,
		score
	]);
	const resetLabel = (0, import_react.useMemo)(() => board ? formatReset(board.resetsAt) : "", [board, tick]);
	const rows = board?.rows ?? [];
	const youName = board?.you.username || username || "YOU";
	const youScore = board?.you.score || score;
	const youRank = board?.you.rank ?? "-";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-no-flap": true,
		className: "absolute inset-0 z-30 flex flex-col items-center overflow-y-auto bg-ink/50 px-3 pb-[max(16px,env(safe-area-inset-bottom))] pt-[max(12px,env(safe-area-inset-top))] touch-pan-y",
		onPointerDown: (e) => e.stopPropagation(),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 font-display text-[18px] leading-none text-over [text-shadow:3px_3px_0_var(--color-ink)]",
				children: "GAME OVER"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 w-full max-w-sm rounded-[20px] border-4 border-ink bg-panel p-3 shadow-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 rounded-[14px] bg-tab p-1",
						children: ["daily", "all"].map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setPeriod(p),
							className: `min-h-10 rounded-[10px] font-display text-[9px] ${period === p ? "bg-panel text-ink" : "text-panel"}`,
							children: p === "daily" ? "DAILY" : "ALL TIME"
						}, p))
					}),
					period === "daily" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-center font-display text-[8px] tracking-wide text-ink/70",
						children: ["RESETS IN ", resetLabel || "—"]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-center font-display text-[8px] tracking-wide text-ink/70",
						children: "BEST RUNS"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex min-h-40 flex-col gap-1",
						children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "grid flex-1 place-items-center py-6 text-center font-display text-[9px] leading-relaxed text-ink/60",
							children: [
								"No scores yet.",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"Be first."
							]
						}) : rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							rank: r.rank,
							username: r.username,
							score: r.score,
							highlight: r.playerId === playerId
						}, r.playerId))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 rounded-[12px] bg-you px-1 py-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							rank: youRank,
							username: youName,
							score: youScore,
							highlight: true
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onPlay,
				className: "mt-4 min-h-14 w-full max-w-sm rounded-[14px] border-4 border-ink bg-play font-display text-sm text-ink shadow-sm active:scale-[0.98]",
				children: "PLAY"
			})
		]
	});
}
function FlappyGame() {
	const canvasRef = (0, import_react.useRef)(null);
	const engineRef = (0, import_react.useRef)(null);
	const [muted, setMuted] = (0, import_react.useState)(false);
	const [booted, setBooted] = (0, import_react.useState)(false);
	const [overScore, setOverScore] = (0, import_react.useState)(null);
	const [hudScore, setHudScore] = (0, import_react.useState)(0);
	const [hudBest, setHudBest] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const engine = new FlappyEngine(canvas);
		engineRef.current = engine;
		engine.setMutedHandler(setMuted);
		engine.setHudHandler((score, best) => {
			setHudScore(score);
			setHudBest(best);
		});
		engine.setOverHandler((score) => setOverScore(score));
		engine.start().then(() => setBooted(true));
		return () => {
			engine.destroy();
			engineRef.current = null;
		};
	}, []);
	function toggleMute() {
		const eng = engineRef.current;
		if (!eng) return;
		eng.setMuted(!eng.muted);
	}
	function playAgain() {
		engineRef.current?.restart();
		setOverScore(null);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "fixed inset-0 cursor-pointer overflow-hidden bg-sky touch-none select-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				width: 288,
				height: 512,
				className: "absolute inset-0 block h-full w-full touch-none",
				"aria-label": "Tappy Tom"
			}),
			overScore == null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudUsername, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudScore, {
					score: hudScore,
					best: hudBest
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"data-no-flap": true,
					onPointerDown: (e) => e.stopPropagation(),
					onClick: toggleMute,
					"aria-label": muted ? "Unmute" : "Mute",
					className: "absolute top-[max(48px,calc(env(safe-area-inset-top)+38px))] left-[max(8px,env(safe-area-inset-left))] z-10 flex size-11 cursor-pointer items-center justify-center text-panel [filter:drop-shadow(2px_2px_0_var(--color-ink))] transition-transform duration-150 ease-out active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-panel",
					children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, {
						className: "size-7",
						strokeWidth: 2.4
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, {
						className: "size-7",
						strokeWidth: 2.4
					})
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameOverBoard, {
				score: overScore,
				onPlay: playAgain
			}),
			!booted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-sky" }) : null
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlappyGame, {});
}
//#endregion
export { Home as component };
