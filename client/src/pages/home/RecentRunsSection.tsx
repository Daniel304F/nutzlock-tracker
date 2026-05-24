import { AlertCircle, RefreshCw } from "lucide-react";

import type { RunResponse } from "@api/runs";
import type { UseRunsResult } from "@hooks/useRuns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RecentRunCard } from "@pages/home/RecentRunCard";

type RecentRunsSectionProps = {
  message: string | null;
  onRefresh: () => Promise<void> | void;
  runs: RunResponse[];
  status: UseRunsResult["status"];
};

export function RecentRunsSection({ message, onRefresh, runs, status }: RecentRunsSectionProps) {
  return (
    <section
      aria-labelledby="recent-runs-heading"
      className="rounded-lg border border-border/80 bg-card/70 p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-col gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground" id="recent-runs-heading">
            Recent runs
          </h2>
          <p className="text-sm text-muted-foreground">
            {runs.length} active workspace {runs.length === 1 ? "entry" : "entries"}
          </p>
        </div>
        <Button
          className="w-full sm:w-fit"
          disabled={status === "loading"}
          size="sm"
          type="button"
          variant="outline"
          onClick={() => void onRefresh()}
        >
          <RefreshCw aria-hidden="true" />
          Refresh
        </Button>
      </div>

      <div className="mt-4 grid gap-3">
        {status === "loading" ? (
          <Alert className="border-border/80 bg-background/60">
            <AlertDescription>Loading runs</AlertDescription>
          </Alert>
        ) : null}

        {status === "error" ? (
          <Alert className="border-destructive/30 bg-destructive/10" variant="destructive">
            <AlertCircle />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}

        {status === "ready" && runs.length === 0 ? (
          <Alert className="border-border/80 bg-background/60">
            <AlertDescription>No runs yet</AlertDescription>
          </Alert>
        ) : null}

        {runs.map((run) => (
          <RecentRunCard key={run.id} run={run} />
        ))}
      </div>
    </section>
  );
}
