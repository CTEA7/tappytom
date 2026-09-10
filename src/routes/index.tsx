import { createFileRoute } from "@tanstack/react-router";
import { FlappyGame } from "@/game/FlappyGame";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <FlappyGame />;
}
