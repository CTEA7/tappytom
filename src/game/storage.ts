import { STORAGE_KEY } from "./constants";

export type SaveData = {
  version: 1;
  best: number;
  games: number;
};

const EMPTY: SaveData = { version: 1, best: 0, games: 0 };

export function loadSave(): SaveData {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      version: 1,
      best: typeof parsed.best === "number" && parsed.best >= 0 ? parsed.best : 0,
      games: typeof parsed.games === "number" && parsed.games >= 0 ? parsed.games : 0,
    };
  } catch {
    return { ...EMPTY };
  }
}

export function writeSave(data: SaveData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota / private mode */
  }
}
