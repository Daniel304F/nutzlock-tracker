import { AlertCircle, FileUp, Link2, Plus, RefreshCw, Shuffle, User, Users } from "lucide-react";
import { useState, type FormEvent } from "react";

import type { ChallengeMode, RunCreateInput, RunResponse } from "@api/runs";
import { useToastService } from "@components/toast/ToastProvider";
import { useApiHealth } from "@hooks/useApiHealth";
import { useRuns } from "@hooks/useRuns";
import { AppShell } from "@layout/AppShell";
import { getErrorMessage } from "@utils/getErrorMessage";

const challengeModes = [
  {
    description: "Solo tracker",
    icon: User,
    label: "Nuzlocke",
    value: "nuzlocke",
  },
  {
    description: "Shared room",
    icon: Users,
    label: "Soullink",
    value: "soullink",
  },
] as const satisfies ReadonlyArray<{
  description: string;
  icon: typeof User;
  label: string;
  value: ChallengeMode;
}>;

function getFormText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function buildRunInput(formData: FormData, challengeMode: ChallengeMode, isRandomizer: boolean) {
  const notes = getFormText(formData, "notes");

  return {
    challenge_mode: challengeMode,
    game_version_ref: getFormText(formData, "game_version_ref"),
    is_randomizer: isRandomizer,
    name: getFormText(formData, "name"),
    notes: notes || null,
  } satisfies RunCreateInput;
}

function getApiLabel(apiState: ReturnType<typeof useApiHealth>) {
  if (apiState.status === "online") {
    return `API online: ${apiState.health.service}`;
  }

  if (apiState.status === "loading") {
    return "API wird geprueft";
  }

  return apiState.message;
}

function formatUpdatedAt(updatedAt: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(updatedAt));
}

function RunBadge({ children, tone }: { children: string; tone: "emerald" | "sky" | "violet" }) {
  const toneClass = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    sky: "border-sky-200 bg-sky-50 text-sky-800",
    violet: "border-violet-200 bg-violet-50 text-violet-800",
  }[tone];

  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold ${toneClass}`}>
      {children}
    </span>
  );
}

function RecentRun({ run }: { run: RunResponse }) {
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

export function HomePage() {
  const apiState = useApiHealth();
  const toast = useToastService();
  const runsState = useRuns();
  const [challengeMode, setChallengeMode] = useState<ChallengeMode>("nuzlocke");
  const [isRandomizer, setIsRandomizer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreateRun(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = buildRunInput(new FormData(form), challengeMode, isRandomizer);

    setIsSubmitting(true);

    try {
      const run = await runsState.createRun(input);
      toast.success("Run created", {
        description: `${run.name} is ready.`,
      });
      form.reset();
      setChallengeMode("nuzlocke");
      setIsRandomizer(false);
    } catch (error: unknown) {
      toast.error("Run could not be created", {
        description: getErrorMessage(error, "Please try again."),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell apiLabel={getApiLabel(apiState)} apiStatus={apiState.status}>
      <section className="grid flex-1 gap-5 py-6 lg:grid-cols-[360px_1fr]">
        <form
          className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
          onSubmit={handleCreateRun}
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
              <Plus aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-zinc-950">New run</h2>
              <p className="text-sm text-zinc-600">Basics first, rooms and rules next.</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-zinc-800">Run name</span>
              <input
                className="mt-1 min-h-11 w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-950 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                name="name"
                placeholder="Heartgold w/ Sam"
                required
                type="text"
              />
            </label>

            <fieldset>
              <legend className="text-sm font-medium text-zinc-800">Mode</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {challengeModes.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = challengeMode === mode.value;

                  return (
                    <label
                      className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                      }`}
                      key={mode.value}
                    >
                      <input
                        checked={isSelected}
                        className="sr-only"
                        name="challenge_mode"
                        type="radio"
                        value={mode.value}
                        onChange={() => setChallengeMode(mode.value)}
                      />
                      <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                      <span>
                        <span className="block font-semibold">{mode.label}</span>
                        <span className="block text-xs text-zinc-600">{mode.description}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <label className="block">
              <span className="text-sm font-medium text-zinc-800">Edition key</span>
              <input
                className="mt-1 min-h-11 w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-950 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                defaultValue="emerald"
                name="game_version_ref"
                required
                type="text"
              />
            </label>

            <label className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm">
              <span className="inline-flex items-center gap-2 font-medium text-zinc-800">
                <Shuffle aria-hidden="true" className="h-4 w-4 text-violet-700" />
                Randomizer
              </span>
              <input
                checked={isRandomizer}
                className="h-5 w-5 accent-emerald-700"
                name="is_randomizer"
                type="checkbox"
                onChange={(event) => setIsRandomizer(event.currentTarget.checked)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-zinc-800">Notes</span>
              <textarea
                className="mt-1 min-h-20 w-full resize-y rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-950 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                name="notes"
                placeholder="Seed, partner, route plan"
              />
            </label>
          </div>

          <button
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-emerald-700 bg-emerald-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Create run
          </button>
        </form>

        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              className="flex min-h-20 items-center gap-3 rounded-lg border border-dashed border-sky-300 bg-white px-4 py-3 text-left text-sm text-zinc-500"
              disabled
              type="button"
            >
              <Link2 aria-hidden="true" className="h-5 w-5 text-sky-700" />
              <span>
                <span className="block font-semibold text-zinc-700">Join room</span>
                <span className="block">Room membership lands after runs.</span>
              </span>
            </button>
            <button
              className="flex min-h-20 items-center gap-3 rounded-lg border border-dashed border-zinc-300 bg-white px-4 py-3 text-left text-sm text-zinc-500"
              disabled
              type="button"
            >
              <FileUp aria-hidden="true" className="h-5 w-5 text-zinc-700" />
              <span>
                <span className="block font-semibold text-zinc-700">Import JSON</span>
                <span className="block">Backup restore comes with export shape.</span>
              </span>
            </button>
          </div>

          <section aria-labelledby="recent-runs-heading">
            <div className="flex flex-col gap-3 border-b border-zinc-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-zinc-950" id="recent-runs-heading">
                  Recent runs
                </h2>
                <p className="text-sm text-zinc-600">{runsState.runs.length} active workspace entries</p>
              </div>
              <button
                className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={runsState.status === "loading"}
                type="button"
                onClick={() => void runsState.refresh()}
              >
                <RefreshCw aria-hidden="true" className="h-4 w-4" />
                Refresh
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {runsState.status === "loading" ? (
                <p className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600 shadow-sm">
                  Loading runs
                </p>
              ) : null}

              {runsState.status === "error" ? (
                <p className="flex items-center gap-2 rounded-lg border border-rose-200 bg-white p-4 text-sm text-rose-700 shadow-sm">
                  <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0" />
                  {runsState.message}
                </p>
              ) : null}

              {runsState.status === "ready" && runsState.runs.length === 0 ? (
                <p className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600 shadow-sm">
                  No runs yet
                </p>
              ) : null}

              {runsState.runs.map((run) => (
                <RecentRun key={run.id} run={run} />
              ))}
            </div>
          </section>
        </div>
      </section>
    </AppShell>
  );
}
