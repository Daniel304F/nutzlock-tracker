import type { RunResponse } from "@api/runs";
import { Clock3, Gamepad2, UsersRound } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RunBadge } from "@pages/home/RunBadge";

type RecentRunCardProps = {
  run: RunResponse;
};

function formatUpdatedAt(updatedAt: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(updatedAt));
}

export function RecentRunCard({ run }: RecentRunCardProps) {
  return (
    <Card className="group relative gap-3 overflow-hidden rounded-lg border-border/80 bg-background/60 py-4 shadow-none transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-card hover:shadow-sm">
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 bg-primary"
      />
      <CardHeader className="px-4 pl-5">
        <CardTitle className="flex min-w-0 items-center gap-2 text-base font-semibold text-foreground">
          <Gamepad2 aria-hidden="true" className="size-4 shrink-0 text-primary" />
          <span className="truncate">{run.name}</span>
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 aria-hidden="true" className="size-3.5" />
            updated {formatUpdatedAt(run.updated_at)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <UsersRound aria-hidden="true" className="size-3.5" />
            {run.player_count} {run.player_count === 1 ? "player" : "players"}
          </span>
        </CardDescription>
        <CardAction className="flex flex-wrap gap-2">
          <RunBadge tone={run.challenge_mode === "soullink" ? "sky" : "emerald"}>
            {run.challenge_mode}
          </RunBadge>
          {run.is_randomizer ? <RunBadge tone="violet">RNG</RunBadge> : null}
        </CardAction>
      </CardHeader>
      <CardContent className="px-4 pl-5">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          {run.game_version_ref}
        </p>
      </CardContent>
    </Card>
  );
}
