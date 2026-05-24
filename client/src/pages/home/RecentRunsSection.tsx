import { AlertCircle, RefreshCw } from "lucide-react";

import type { RunResponse } from "@api/runs";
import type { UseRunsResult } from "@hooks/useRuns";
import { RecentRunCard } from "@pages/home/RecentRunCard";

type RecentRunsSectionProps = {
  message: string | null;
  onRefresh: () => Promise<void> | void;
  runs: RunResponse[];
  status: UseRunsResult["status"];
};

export function RecentRunsSection({ message, onRefresh, runs, status }: RecentRunsSectionProps) {
  return (
    <section aria-labelledby="recent-runs-heading">
      <div className="flex flex-col gap-3 border-b border-zinc-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-950" id="recent-runs-heading">
            Recent runs
          </h2>
          <p className="text-sm text-zinc-600">{runs.length} active workspace entries</p>
        </div>
        <button
          className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={status === "loading"}
          type="button"
          onClick={() => void onRefresh()}
        >
          <RefreshCw aria-hidden="true" className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {status === "loading" ? (
          <p className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600 shadow-sm">
            Loading runs
          </p>
        ) : null}

        {status === "error" ? (
          <p className="flex items-center gap-2 rounded-lg border border-rose-200 bg-white p-4 text-sm text-rose-700 shadow-sm">
            <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0" />
            {message}
          </p>
        ) : null}

        {status === "ready" && runs.length === 0 ? (
          <p className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600 shadow-sm">
            No runs yet
          </p>
        ) : null}

        {runs.map((run) => (
          <RecentRunCard key={run.id} run={run} />
        ))}
      </div>
    </section>
  );
}
