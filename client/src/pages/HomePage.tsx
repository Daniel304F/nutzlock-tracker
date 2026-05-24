import type { RunCreateInput, RunResponse } from "@api/runs";
import { useToastService } from "@components/toast/ToastProvider";
import { useApiHealth } from "@hooks/useApiHealth";
import { useRuns } from "@hooks/useRuns";
import { AppShell } from "@layout/AppShell";
import { EntryActionCards } from "@pages/home/EntryActionCards";
import { NewRunForm } from "@pages/home/NewRunForm";
import { RecentRunsSection } from "@pages/home/RecentRunsSection";
import { getErrorMessage } from "@utils/getErrorMessage";

function getApiLabel(apiState: ReturnType<typeof useApiHealth>) {
  if (apiState.status === "online") {
    return `API online: ${apiState.health.service}`;
  }

  if (apiState.status === "loading") {
    return "API wird geprueft";
  }

  return apiState.message;
}

export function HomePage() {
  const apiState = useApiHealth();
  const toast = useToastService();
  const runsState = useRuns();

  async function handleCreateRun(input: RunCreateInput): Promise<RunResponse> {
    try {
      const run = await runsState.createRun(input);
      toast.success("Run created", {
        description: `${run.name} is ready.`,
      });
      return run;
    } catch (error: unknown) {
      toast.error("Run could not be created", {
        description: getErrorMessage(error, "Please try again."),
      });
      throw error;
    }
  }

  return (
    <AppShell apiLabel={getApiLabel(apiState)} apiStatus={apiState.status}>
      <section className="grid flex-1 gap-5 py-6 lg:grid-cols-[360px_1fr]">
        <NewRunForm onCreateRun={handleCreateRun} />

        <div className="space-y-5">
          <EntryActionCards />
          <RecentRunsSection
            message={runsState.message}
            runs={runsState.runs}
            status={runsState.status}
            onRefresh={runsState.refresh}
          />
        </div>
      </section>
    </AppShell>
  );
}
