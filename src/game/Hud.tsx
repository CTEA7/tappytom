import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import {
  getPlayerId,
  loadLocalName,
  saveLocalName,
  sanitizeUsername,
  setUsername,
} from "./api";

const scoreShadow =
  "[text-shadow:3px_3px_0_var(--color-ink),-2px_-2px_0_var(--color-ink),2px_-2px_0_var(--color-ink),-2px_2px_0_var(--color-ink)]";

const VIEWPORT_LOCK =
  "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, interactive-widget=overlays-content";

function lockPageZoom() {
  const meta = document.querySelector('meta[name="viewport"]');
  meta?.setAttribute("content", VIEWPORT_LOCK);
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export function HudUsername() {
  const [name, setName] = useState("PLAYER");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("PLAYER");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(loadLocalName());
    const id = getPlayerId();
    const local = loadLocalName();
    if (!id || local.length < 2) return;
    void setUsername({ data: { playerId: id, username: local } }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!editing) return;
    lockPageZoom();
    const onScroll = () => lockPageZoom();
    const vv = window.visualViewport;
    vv?.addEventListener("resize", onScroll);
    vv?.addEventListener("scroll", onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      vv?.removeEventListener("resize", onScroll);
      vv?.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
      inputRef.current?.blur();
      lockPageZoom();
    };
  }, [editing]);

  function closeEditor() {
    inputRef.current?.blur();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    lockPageZoom();
    setEditing(false);
    window.setTimeout(lockPageZoom, 50);
    window.setTimeout(lockPageZoom, 300);
  }

  function openEdit() {
    setDraft(name);
    setEditing(true);
  }

  function cancel() {
    closeEditor();
  }

  async function save() {
    const next = sanitizeUsername(draft);
    if (next.length < 2) return;
    setName(next);
    saveLocalName(next);
    closeEditor();
    const id = getPlayerId();
    if (id) {
      try {
        await setUsername({ data: { playerId: id, username: next } });
      } catch {
        /* still keep local */
      }
    }
  }

  return (
    <>
      <button
        type="button"
        data-no-flap
        onPointerDown={(e) => e.stopPropagation()}
        onClick={openEdit}
        className="absolute top-[max(10px,env(safe-area-inset-top))] left-[max(10px,env(safe-area-inset-left))] z-20 flex max-w-[50%] min-h-11 items-center gap-2 px-1 text-left"
        aria-label="Edit username"
      >
        <span className={`truncate font-display text-[10px] leading-none text-panel ${scoreShadow}`}>
          {name}
        </span>
        <Pencil className="size-4 shrink-0 text-panel drop-shadow" strokeWidth={2.6} />
      </button>

      {editing ? (
        <div
          data-no-flap
          className="absolute inset-0 z-40 flex items-start justify-center bg-overlay px-4 pt-[max(20px,env(safe-area-inset-top))]"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <form
            className="mt-6 w-full max-w-xs rounded-[20px] border-4 border-ink bg-panel p-4 shadow-md"
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <p className="font-display text-[10px] text-ink">USERNAME</p>
            <input
              ref={inputRef}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              enterKeyHint="done"
              inputMode="text"
              maxLength={16}
              value={draft}
              onChange={(e) => setDraft(sanitizeUsername(e.target.value))}
              onFocus={lockPageZoom}
              onBlur={() => window.setTimeout(lockPageZoom, 50)}
              className="mt-3 min-h-12 w-full select-text rounded-[12px] border-2 border-ink bg-panel-dark/40 px-3 font-ui text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              style={{ fontSize: 16 }}
              aria-label="Username"
            />
            <p className="mt-2 font-display text-[8px] leading-relaxed text-muted">
              Letters, numbers, underscore. 2–16 chars.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={cancel}
                className="min-h-11 rounded-[12px] border-2 border-ink bg-panel-dark font-display text-[10px] text-ink active:scale-[0.98]"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="min-h-11 rounded-[12px] border-4 border-ink bg-play font-display text-[10px] text-ink active:scale-[0.98]"
              >
                SAVE
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

export function HudScore({ score, best }: { score: number; best: number }) {
  const [bump, setBump] = useState(false);
  const prev = useRef(score);

  useEffect(() => {
    if (score === prev.current) return;
    prev.current = score;
    if (score <= 0) return;
    setBump(true);
    const id = window.setTimeout(() => setBump(false), 220);
    return () => window.clearTimeout(id);
  }, [score]);

  return (
    <div
      className={`pointer-events-none absolute top-[max(10px,env(safe-area-inset-top))] right-[max(10px,env(safe-area-inset-right))] z-20 text-right text-panel ${scoreShadow}`}
      aria-live="polite"
    >
      <p
        className={`font-display text-3xl leading-none tabular-nums transition-transform duration-150 ease-out ${
          bump ? "scale-125" : "scale-100"
        }`}
      >
        {score}
      </p>
      <p className="mt-2 font-display text-[8px] leading-none tracking-wide">HIGH SCORE</p>
      <p className="mt-1.5 font-display text-lg leading-none tabular-nums">{best}</p>
    </div>
  );
}
