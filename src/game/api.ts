import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";

export type BoardRow = {
  rank: number;
  playerId: string;
  username: string;
  score: number;
};

export type Standing = {
  rank: number | null;
  username: string;
  score: number;
};

export type BoardPayload = {
  period: "daily" | "all";
  rows: BoardRow[];
  you: Standing;
  resetsAt: string;
};

const USERNAME_KEY = "tappy-tom-username";
const PLAYER_KEY = "tappy-tom-player-id";

const nameSchema = z
  .string()
  .trim()
  .min(2)
  .max(16)
  .regex(/^[A-Za-z0-9_]+$/);

const playerIdSchema = z
  .string()
  .trim()
  .min(8)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/);

export function sanitizeUsername(raw: string) {
  return raw.replace(/[^A-Za-z0-9_]/g, "").slice(0, 16);
}

export function randomUsername() {
  return `Tom${Math.floor(1000 + Math.random() * 9000)}`;
}

export function getPlayerId() {
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

export function peekLocalUsername() {
  if (typeof window === "undefined") return "YOU";
  try {
    const v = window.localStorage.getItem(USERNAME_KEY);
    if (v && v.length >= 2) return v;
  } catch {
    /* ignore */
  }
  return "YOU";
}

export function loadLocalName() {
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

export function saveLocalName(name: string) {
  try {
    window.localStorage.setItem(USERNAME_KEY, name);
  } catch {
    /* ignore */
  }
}

function nextUtcMidnight() {
  const next = new Date();
  next.setUTCHours(24, 0, 0, 0);
  return next.toISOString();
}

export const setUsername = createServerFn({ method: "POST" })
  .validator(z.object({ playerId: playerIdSchema, username: z.string() }))
  .handler(async ({ data }) => {
    const username = nameSchema.parse(sanitizeUsername(data.username));
    const sql = await getSql();
    await sql`
      insert into profiles (user_id, username, updated_at)
      values (${data.playerId}, ${username}, now())
      on conflict (user_id) do update set username = ${username}, updated_at = now()
    `;
    return { username };
  });

export const submitScore = createServerFn({ method: "POST" })
  .validator(
    z.object({
      playerId: playerIdSchema,
      username: z.string(),
      score: z.number().int().min(0).max(9999),
    }),
  )
  .handler(async ({ data }) => {
    const username = nameSchema.parse(sanitizeUsername(data.username));
    const sql = await getSql();
    await sql`
      insert into profiles (user_id, username, updated_at)
      values (${data.playerId}, ${username}, now())
      on conflict (user_id) do update set username = ${username}, updated_at = now()
    `;
    await sql`
      insert into scores (user_id, username, score)
      values (${data.playerId}, ${username}, ${data.score})
    `;
    return { ok: true as const, username };
  });

export const getLeaderboard = createServerFn({ method: "GET" })
  .validator(
    z.object({
      period: z.enum(["daily", "all"]),
      playerId: playerIdSchema.optional(),
      username: z.string().optional(),
    }),
  )
  .handler(async ({ data }): Promise<BoardPayload> => {
    const sql = await getSql();
    const daily = data.period === "daily";
    const best = daily
      ? await sql<{ user_id: string; username: string; score: number }>`
          select s.user_id,
                 coalesce(max(p.username), max(s.username)) as username,
                 max(s.score)::int as score
          from scores s
          left join profiles p on p.user_id = s.user_id
          where s.created_at >= date_trunc('day', timezone('utc', now()))
          group by s.user_id
          order by score desc, username asc
          limit 5
        `
      : await sql<{ user_id: string; username: string; score: number }>`
          select s.user_id,
                 coalesce(max(p.username), max(s.username)) as username,
                 max(s.score)::int as score
          from scores s
          left join profiles p on p.user_id = s.user_id
          group by s.user_id
          order by score desc, username asc
          limit 5
        `;

    const rows: BoardRow[] = best.map((r, i) => ({
      rank: i + 1,
      playerId: r.user_id,
      username: r.username,
      score: Number(r.score),
    }));

    const youName = sanitizeUsername(data.username ?? "") || "YOU";
    let you: Standing = { rank: null, username: youName, score: 0 };

    if (data.playerId) {
      const mine = rows.find((r) => r.playerId === data.playerId);
      if (mine) {
        you = { rank: mine.rank, username: mine.username, score: mine.score };
      } else {
        const own = daily
          ? await sql<{ username: string; score: number; played: number }>`
              select coalesce(
                       (select username from profiles where user_id = ${data.playerId} limit 1),
                       ${youName}
                     ) as username,
                     coalesce(max(score), 0)::int as score,
                     count(*)::int as played
              from scores
              where user_id = ${data.playerId}
                and created_at >= date_trunc('day', timezone('utc', now()))
            `
          : await sql<{ username: string; score: number; played: number }>`
              select coalesce(
                       (select username from profiles where user_id = ${data.playerId} limit 1),
                       ${youName}
                     ) as username,
                     coalesce(max(score), 0)::int as score,
                     count(*)::int as played
              from scores
              where user_id = ${data.playerId}
            `;
        const played = Number(own[0]?.played ?? 0);
        const score = Number(own[0]?.score ?? 0);
        const username = own[0]?.username || youName;
        if (played > 0) {
          const higher = daily
            ? await sql<{ n: number }>`
                select count(*)::int as n from (
                  select s.user_id
                  from scores s
                  where s.created_at >= date_trunc('day', timezone('utc', now()))
                  group by s.user_id
                  having max(s.score) > ${score}
                ) t
              `
            : await sql<{ n: number }>`
                select count(*)::int as n from (
                  select s.user_id
                  from scores s
                  group by s.user_id
                  having max(s.score) > ${score}
                ) t
              `;
          you = { rank: Number(higher[0]?.n ?? 0) + 1, username, score };
        } else {
          you = { rank: null, username, score };
        }
      }
    }

    return { period: data.period, rows, you, resetsAt: nextUtcMidnight() };
  });
