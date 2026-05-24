import { Plus, Shuffle, User, Users } from "lucide-react";
import { useState, type FormEvent } from "react";

import type { ChallengeMode, RunCreateInput, RunResponse } from "@api/runs";

type NewRunFormProps = {
  onCreateRun: (input: RunCreateInput) => Promise<RunResponse>;
};

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

export function NewRunForm({ onCreateRun }: NewRunFormProps) {
  const [challengeMode, setChallengeMode] = useState<ChallengeMode>("nuzlocke");
  const [isRandomizer, setIsRandomizer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = buildRunInput(new FormData(form), challengeMode, isRandomizer);

    setIsSubmitting(true);

    try {
      await onCreateRun(input);
      form.reset();
      setChallengeMode("nuzlocke");
      setIsRandomizer(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm" onSubmit={handleSubmit}>
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
  );
}
