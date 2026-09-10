export type Mode = "ready" | "playing" | "dying" | "over";

export type Pipe = {
  x: number;
  gapY: number;
  gapH: number;
  scored: boolean;
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  rot: number;
  vr: number;
  color: string;
};

export type Bird = {
  x: number;
  y: number;
  vy: number;
  rot: number;
  squash: number;
};
