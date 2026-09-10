export const WORLD_W = 288;
export const WORLD_H_BASE = 512;
export let WORLD_H = WORLD_H_BASE;
export const GROUND_H = 112;
export let GROUND_Y = WORLD_H - GROUND_H;

export function setViewHeight(h: number) {
  WORLD_H = Math.max(WORLD_H_BASE, h);
  GROUND_Y = WORLD_H - GROUND_H;
}

export const BIRD_X = 72;
export const BIRD_DRAW_W = 46;
export const BIRD_DRAW_H = 62;
/** Collision box — a bit inside the photo so a slight graze can slip by. */
export const HIT_W = 36;
export const HIT_H = 48;

export const GRAVITY = 1380;
export const FLAP_V = -420;
export const MAX_FALL = 520;
export const ROT_UP = -28 * (Math.PI / 180);
export const ROT_DOWN_SPEED = 2.8;
export const MAX_ROT = 90 * (Math.PI / 180);

export const PIPE_W = 52;
export const PIPE_CAP_H = 26;
export const PIPE_CAP_EXTRA = 3;
export const PIPE_GAP = 166;
export const PIPE_GAP_MIN = 142;
export const PIPE_SPACING = 176;
export const PIPE_SPEED = 118;
export const PIPE_SPEED_MAX = 168;
export const FIRST_PIPE_X = 340;

export const FLASH_TIME = 0.18;
export const HITSTOP = 0.09;
export const DIE_FALL_DELAY = 0.05;
export const OVER_DELAY = 0.55;
export const RESTART_LOCK = 0.5;

export const STORAGE_KEY = "tappy-tom-v3";

export const COLORS = {
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
  medalPlat: "#D8F0F4",
} as const;
