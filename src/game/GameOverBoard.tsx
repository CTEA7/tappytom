import { useEffect, useMemo, useState } from "react";
import {
  getLeaderboard,
  getPlayerId,
  peekLocalUsername,
  submitScore,
  type BoardPayload,
  type BoardRow,
} from "./api";

function formatReset(iso: string) {
  const ms = Math.max(0, new Date(iso).getTime() - Date.now());
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}H ${pad(m)}M ${pad(sec)}S`;
}

function medalClass(rank: number) {
  if (rank === 1) return "bg-medal-gold text-ink";
  if (rank === 2) return "bg-medal-silver text-ink";
  if (rank === 3) return "bg-medal-bronze text-panel";
  return "bg-panel-dark text-ink";
}

function Row({
  rank,
  username,
  score,
  highlight,
}: {
  rank: number | string;
  username: string;
  score: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-[10px] px-2 py-1.5 ${highlight ? "bg-you text-panel" : ""}`}
    >
      <span
        className={`grid size-7 shrink-0 place-items-center rounded-full font-display text-[9px] ${
          highlight ? "bg-ink/30 text-panel" : medalClass(Number(rank) || 99)
        }`}
      >
        {rank}
      </span>
      <span className="min-w-0 flex-1 truncate font-display text-[9px] leading-none">
        {username}
      </span>
      <span
        className={`min-w-14 rounded-[8px] px-2 py-1 text-right font-display text-[10px] tabular-nums ${
          highlight ? "bg-ink/25" : "bg-panel-dark"
        }`}
      >
        {score}
      </span>
    </div>
  );
}

export function GameOverBoard({
  score,
  onPlay,
}: {
  score: number;
  onPlay: () => void;
}) {
  const [period, setPeriod] = useState<"daily" | "all">("daily");
  const [board, setBoard] = useState<BoardPayload | null>(null);
  const [tick, setTick] = useState(0);
  const [posted, setPosted] = useState(false);
  const [playerId, setPlayerId] = useState("");
  const [username, setUsername] = useState("PLAYER");

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setPlayerId(getPlayerId());
    setUsername(peekLocalUsername());
  }, []);

  useEffect(() => {
    if (!playerId || username.length < 2) return;
    let live = true;
    (async () => {
      if (playerId && username.length >= 2 && score > 0) {
        try {
          await submitScore({ data: { playerId, username, score } });
        } catch {
          /* board still loads */
        }
      }
      if (live) setPosted(true);
    })();
    return () => {
      live = false;
    };
  }, [playerId, username, score]);

  useEffect(() => {
    if (!posted) return;
    let live = true;
    void getLeaderboard({
      data: { period, playerId: playerId || undefined, username },
    })
      .then((b) => {
        if (live) setBoard(b);
      })
      .catch(() => {
        if (live) setBoard(null);
      });
    return () => {
      live = false;
    };
  }, [period, playerId, username, posted, score]);

  const resetLabel = useMemo(
    () => (board ? formatReset(board.resetsAt) : ""),
    // tick is the 1s countdown driver
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [board, tick],
  );

  const rows: BoardRow[] = board?.rows ?? [];
  const youName = board?.you.username || username || "YOU";
  const youScore = board?.you.score || score;
  const youRank = board?.you.rank ?? "-";

  return (
    <div
      data-no-flap
      className="absolute inset-0 z-30 flex flex-col items-center overflow-y-auto bg-ink/50 px-3 pb-[max(16px,env(safe-area-inset-bottom))] pt-[max(12px,env(safe-area-inset-top))] touch-pan-y"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <h2 className="mt-2 font-display text-[18px] leading-none text-over [text-shadow:3px_3px_0_var(--color-ink)]">
        GAME OVER
      </h2>

      <div className="mt-4 w-full max-w-sm rounded-[20px] border-4 border-ink bg-panel p-3 shadow-md">
        <div className="grid grid-cols-2 rounded-[14px] bg-tab p-1">
          {(["daily", "all"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`min-h-10 rounded-[10px] font-display text-[9px] ${
                period === p ? "bg-panel text-ink" : "text-panel"
              }`}
            >
              {p === "daily" ? "DAILY" : "ALL TIME"}
            </button>
          ))}
        </div>

        {period === "daily" ? (
          <p className="mt-3 text-center font-display text-[8px] tracking-wide text-ink/70">
            RESETS IN {resetLabel || "—"}
          </p>
        ) : (
          <p className="mt-3 text-center font-display text-[8px] tracking-wide text-ink/70">
            BEST RUNS
          </p>
        )}

        <div className="mt-2 flex min-h-40 flex-col gap-1">
          {rows.length === 0 ? (
            <p className="grid flex-1 place-items-center py-6 text-center font-display text-[9px] leading-relaxed text-ink/60">
              No scores yet.
              <br />
              Be first.
            </p>
          ) : (
            rows.map((r) => (
              <Row
                key={r.playerId}
                rank={r.rank}
                username={r.username}
                score={r.score}
                highlight={r.playerId === playerId}
              />
            ))
          )}
        </div>

        <div className="mt-3 rounded-[12px] bg-you px-1 py-1">
          <Row rank={youRank} username={youName} score={youScore} highlight />
        </div>
      </div>

      <button
        type="button"
        onClick={onPlay}
        className="mt-4 min-h-14 w-full max-w-sm rounded-[14px] border-4 border-ink bg-play font-display text-sm text-ink shadow-sm active:scale-[0.98]"
      >
        PLAY
      </button>
    </div>
  );
}
