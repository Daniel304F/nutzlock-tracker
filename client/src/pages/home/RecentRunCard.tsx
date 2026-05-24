import type { RunResponse } from "@api/runs";
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
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-zinc-950">{run.name}</h3>
          <p className="mt-1 text-sm text-zinc-600">
            {run.game_version_ref} - updated {formatUpdatedAt(run.updated_at)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <RunBadge tone={run.challenge_mode === "soullink" ? "sky" : "emerald"}>
            {run.challenge_mode}
          </RunBadge>
          {run.is_randomizer ? <RunBadge tone="violet">RNG</RunBadge> : null}
        </div>
      </div>
    </article>
  );
}
