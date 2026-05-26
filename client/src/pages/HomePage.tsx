import type { RunCreateInput, RunResponse } from "@api/runs";
import type { RoomJoinInput } from "@api/rooms";
import { useToastService } from "@components/toast/ToastProvider";
import { useApiHealth } from "@hooks/useApiHealth";
import { useJoinRoom } from "@hooks/useJoinRoom";
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
    return "API wird geprüft";
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
    label: "Spielerplätze",
  },
] as const;

function WorkspaceHero({ stats }: { stats: WorkspaceStats }) {
  return (
    <section className="relative overflow-hidden rounded-lg border border-border/80 bg-card text-card-foreground shadow-sm">
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] lg:p-7">
        <div className="min-w-0">
          <p className="inline-flex rounded-md border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase text-primary">
            Run Command Center
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            Spielzentrale
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Erstelle neue Runs, behalte aktive Soullinks im Blick und springe
            direkt in die wichtigsten Aktionen, ohne den Spielfluss zu bremsen.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-md border border-border/70 bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              Mobile-first
            </span>
            <span className="rounded-md border border-border/70 bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              Soft Validation
            </span>
            <span className="rounded-md border border-border/70 bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              Soullink-ready
            </span>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
          {heroStats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                className="rounded-lg border border-border/80 bg-background/70 p-3 text-left transition-colors hover:border-primary/40"
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
  const joinRoomState = useJoinRoom();
  const runsState = useRuns();
  const workspaceStats = getWorkspaceStats(runsState.runs);

  async function handleCreateRun(input: RunCreateInput): Promise<RunResponse> {
    try {
      const run = await runsState.createRun(input);
      toast.success("Run erstellt", {
        description: run.room_id ? `${run.name} ist mit Raum bereit.` : `${run.name} ist bereit.`,
      });
      return run;
    } catch (error: unknown) {
      toast.error("Run konnte nicht erstellt werden", {
        description: getErrorMessage(error, "Bitte erneut versuchen."),
      });
      throw error;
    }
  }

  async function handleJoinRoom(input: RoomJoinInput): Promise<void> {
    try {
      const joined = await joinRoomState.joinRoom(input);
      toast.success("Raum beigetreten", {
        description: `${joined.member.display_name} ist im Raum ${joined.room.join_code}.`,
      });
    } catch (error: unknown) {
      toast.error("Raum konnte nicht beigetreten werden", {
        description: getErrorMessage(error, "Bitte Code prüfen und erneut versuchen."),
      });
      throw error;
    }
  }

  return (
    <AppShell apiLabel={getApiLabel(apiState)} apiStatus={apiState.status}>
      <section className="grid flex-1 gap-5 py-5 xl:grid-cols-[440px_minmax(0,1fr)] 2xl:grid-cols-[460px_minmax(0,1fr)] 2xl:gap-6">
        <aside className="order-2 min-w-0 xl:sticky xl:top-24 xl:order-1 xl:self-start">
          <NewRunForm onCreateRun={handleCreateRun} />
        </aside>

        <div className="order-1 min-w-0 space-y-5 xl:order-2">
          <WorkspaceHero stats={workspaceStats} />

          <EntryActionCards joinRoomState={joinRoomState} onJoinRoom={handleJoinRoom} />

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
