import type { RunResponse } from "@api/runs";
import {
  Card,
  CardAction,
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
    <Card className="gap-3 rounded-lg py-4">
      <CardHeader className="px-4">
        <CardTitle className="truncate text-base font-semibold text-foreground">
          {run.name}
        </CardTitle>
        <CardDescription>
          {run.game_version_ref} - updated {formatUpdatedAt(run.updated_at)}
        </CardDescription>
        <CardAction className="flex flex-wrap gap-2">
          <RunBadge tone={run.challenge_mode === "soullink" ? "sky" : "emerald"}>
            {run.challenge_mode}
          </RunBadge>
          {run.is_randomizer ? <RunBadge tone="violet">RNG</RunBadge> : null}
        </CardAction>
      </CardHeader>
    </Card>
  );
}
