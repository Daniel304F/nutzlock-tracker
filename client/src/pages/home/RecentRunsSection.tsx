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
    <section aria-labelledby="recent-runs-heading">
      <div className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground" id="recent-runs-heading">
            Recent runs
          </h2>
          <p className="text-sm text-muted-foreground">
            {runs.length} active workspace entries
          </p>
        </div>
        <Button
          className="w-fit"
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

      <div className="mt-4 space-y-3">
        {status === "loading" ? (
          <Alert>
            <AlertDescription>Loading runs</AlertDescription>
          </Alert>
        ) : null}

        {status === "error" ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}

        {status === "ready" && runs.length === 0 ? (
          <Alert>
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
