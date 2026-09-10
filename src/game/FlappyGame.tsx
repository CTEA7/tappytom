import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { FlappyEngine } from "./engine";
import { HudScore, HudUsername } from "./Hud";
import { GameOverBoard } from "./GameOverBoard";

export function FlappyGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FlappyEngine | null>(null);
  const [muted, setMuted] = useState(false);
  const [booted, setBooted] = useState(false);
  const [overScore, setOverScore] = useState<number | null>(null);
  const [hudScore, setHudScore] = useState(0);
  const [hudBest, setHudBest] = useState(0);

  useEffect(() => {
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
    void engine.start().then(
      () => setBooted(true),
      () => setBooted(true),
    );
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

  return (
    <main className="fixed inset-0 cursor-pointer overflow-hidden bg-sky touch-none select-none">
      <canvas
        ref={canvasRef}
        width={288}
        height={512}
        className="absolute inset-0 block h-full w-full touch-none"
        aria-label="Tappy Tom"
      />
      {overScore == null ? (
        <>
          <HudUsername />
          <HudScore score={hudScore} best={hudBest} />
          <button
            type="button"
            data-no-flap
            onPointerDown={(e) => e.stopPropagation()}
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            className="absolute top-[max(48px,calc(env(safe-area-inset-top)+38px))] left-[max(8px,env(safe-area-inset-left))] z-10 flex size-11 cursor-pointer items-center justify-center text-panel [filter:drop-shadow(2px_2px_0_var(--color-ink))] transition-transform duration-150 ease-out active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-panel"
          >
            {muted ? (
              <VolumeX className="size-7" strokeWidth={2.4} />
            ) : (
              <Volume2 className="size-7" strokeWidth={2.4} />
            )}
          </button>
        </>
      ) : (
        <GameOverBoard score={overScore} onPlay={playAgain} />
      )}
      {!booted ? <div className="pointer-events-none absolute inset-0 bg-sky" /> : null}
    </main>
  );
}
