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
