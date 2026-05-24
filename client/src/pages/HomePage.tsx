import type { RunCreateInput, RunResponse } from "@api/runs";
import { useToastService } from "@components/toast/ToastProvider";
import { useApiHealth } from "@hooks/useApiHealth";
import { useRuns } from "@hooks/useRuns";
import { AppShell } from "@layout/AppShell";
import { EntryActionCards } from "@pages/home/EntryActionCards";
import { NewRunForm } from "@pages/home/NewRunForm";
import { RecentRunsSection } from "@pages/home/RecentRunsSection";
import { getErrorMessage } from "@utils/getErrorMessage";
import { Dices, Link2, Sparkles, UsersRound } from "lucide-react";

function getApiLabel(apiState: ReturnType<typeof useApiHealth>) {
  if (apiState.status === "online") {
    return `API online: ${apiState.health.service}`;
  }

  if (apiState.status === "loading") {
    return "API wird geprueft";
  }

  return apiState.message;
}

type WorkspaceStats = {
  playerSlots: number;
  randomizedRuns: number;
  runCount: number;
  soullinkRuns: number;
};

function getWorkspaceStats(runs: RunResponse[]): WorkspaceStats {
  return runs.reduce<WorkspaceStats>(
    (stats, run) => ({
      playerSlots: stats.playerSlots + run.player_count,
      randomizedRuns: stats.randomizedRuns + (run.is_randomizer ? 1 : 0),
      runCount: stats.runCount + 1,
      soullinkRuns: stats.soullinkRuns + (run.challenge_mode === "soullink" ? 1 : 0),
    }),
    {
      playerSlots: 0,
      randomizedRuns: 0,
      runCount: 0,
      soullinkRuns: 0,
    },
  );
}

const heroStats = [
  {
    getValue: (stats: WorkspaceStats) => stats.runCount,
    icon: Dices,
    label: "Runs",
  },
  {
    getValue: (stats: WorkspaceStats) => stats.soullinkRuns,
    icon: Link2,
    label: "Soullinks",
  },
  {
    getValue: (stats: WorkspaceStats) => stats.randomizedRuns,
    icon: Sparkles,
    label: "Randomizer",
  },
  {
    getValue: (stats: WorkspaceStats) => stats.playerSlots,
    icon: UsersRound,
    label: "Player slots",
  },
] as const;

function WorkspaceHero({ stats }: { stats: WorkspaceStats }) {
  return (
    <section className="relative overflow-hidden rounded-lg border border-border/80 bg-card text-card-foreground shadow-sm">
      <div aria-hidden="true" className="grid h-1.5 grid-cols-4">
        <span className="bg-hibiscus" />
        <span className="bg-ruby" />
        <span className="bg-aura" />
        <span className="bg-indigo" />
      </div>

      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(240px,320px)] lg:p-7">
        <div className="min-w-0">
          <h2 className="max-w-2xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            Track encounters, links, rooms, and losses without slowing the run.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            A responsive play-session workspace for quick setup now and deeper
            Soullink state later. The form keeps the same run data shape while
            the surface gets sharper, brighter, and dark-mode ready.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
          {heroStats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                className="rounded-lg border border-border/80 bg-background/60 p-3 text-left"
                key={item.label}
              >
                <Icon aria-hidden="true" className="mb-3 size-4 text-primary" />
                <dt className="text-xs font-medium uppercase text-muted-foreground">
                  {item.label}
                </dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                  {item.getValue(stats)}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}

export function HomePage() {
  const apiState = useApiHealth();
  const toast = useToastService();
  const runsState = useRuns();
  const workspaceStats = getWorkspaceStats(runsState.runs);

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
      <section className="grid flex-1 gap-5 py-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0 space-y-5">
          <WorkspaceHero stats={workspaceStats} />

          <EntryActionCards />

          <RecentRunsSection
            message={runsState.message}
            runs={runsState.runs}
            status={runsState.status}
            onRefresh={runsState.refresh}
          />
        </div>

        <aside className="min-w-0 xl:sticky xl:top-24 xl:self-start">
          <NewRunForm onCreateRun={handleCreateRun} />
        </aside>
      </section>
    </AppShell>
  );
}
