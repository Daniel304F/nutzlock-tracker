import { Plus, Shuffle, User, Users, type LucideIcon } from "lucide-react";
import { useId, useState, type FormEvent } from "react";

import type { ChallengeMode, RunCreateInput, RunResponse } from "@api/runs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type NewRunFormProps = {
  onCreateRun: (input: RunCreateInput) => Promise<RunResponse>;
};

type RunSetupMode = ChallengeMode | "randomizer";

const runSetupModes = [
  {
    description: "Solo tracker",
    icon: User,
    label: "Nuzlocke",
    value: "nuzlocke",
  },
  {
    description: "Solo RNG",
    icon: Shuffle,
    label: "Randomizer",
    value: "randomizer",
  },
  {
    description: "Shared room",
    icon: Users,
    label: "Soullink",
    value: "soullink",
  },
] as const satisfies ReadonlyArray<{
  description: string;
  icon: LucideIcon;
  label: string;
  value: RunSetupMode;
}>;

function getFormText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function toChallengeMode(setupMode: RunSetupMode): ChallengeMode {
  return setupMode === "soullink" ? "soullink" : "nuzlocke";
}

function buildRunInput(formData: FormData, setupMode: RunSetupMode) {
  const notes = getFormText(formData, "notes");

  return {
    challenge_mode: toChallengeMode(setupMode),
    game_version_ref: getFormText(formData, "game_version_ref"),
    is_randomizer: setupMode === "randomizer",
    name: getFormText(formData, "name"),
    notes: notes || null,
  } satisfies RunCreateInput;
}

export function NewRunForm({ onCreateRun }: NewRunFormProps) {
  const [setupMode, setSetupMode] = useState<RunSetupMode>("nuzlocke");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameId = useId();
  const editionId = useId();
  const notesId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = buildRunInput(new FormData(form), setupMode);

    setIsSubmitting(true);

    try {
      await onCreateRun(input);
      form.reset();
      setSetupMode("nuzlocke");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="gap-5 rounded-lg p-5">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
            <Plus aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-foreground">New run</h2>
            <p className="text-sm text-muted-foreground">
              Basics first, rooms and rules next.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor={nameId}>Run name</Label>
            <Input
              className="min-h-11 bg-secondary"
              id={nameId}
              name="name"
              placeholder="Heartgold w/ Sam"
              required
              type="text"
            />
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-foreground">Mode</legend>
            <RadioGroup
              className="mt-2 grid gap-2 sm:grid-cols-3"
              name="run_setup_mode"
              value={setupMode}
              onValueChange={(value) => setSetupMode(value as RunSetupMode)}
            >
              {runSetupModes.map((mode) => {
                const Icon = mode.icon;
                const isSelected = setupMode === mode.value;
                const itemId = `${nameId}-mode-${mode.value}`;

                return (
                  <Label
                    htmlFor={itemId}
                    key={mode.value}
                    className={cn(
                      "flex min-h-16 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors",
                      isSelected
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                        : "border-border bg-card text-foreground hover:bg-secondary",
                    )}
                  >
                    <RadioGroupItem
                      aria-label={mode.label}
                      className="sr-only"
                      id={itemId}
                      value={mode.value}
                    />
                    <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                    <span>
                      <span className="block font-semibold">{mode.label}</span>
                      <span className="block text-xs text-muted-foreground">
                        {mode.description}
                      </span>
                    </span>
                  </Label>
                );
              })}
            </RadioGroup>
          </fieldset>

          <div className="space-y-1.5">
            <Label htmlFor={editionId}>Edition key</Label>
            <Input
              className="min-h-11 bg-secondary"
              defaultValue="emerald"
              id={editionId}
              name="game_version_ref"
              required
              type="text"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={notesId}>Notes</Label>
            <Textarea
              className="min-h-20 bg-secondary"
              id={notesId}
              name="notes"
              placeholder="Seed, partner, route plan"
            />
          </div>
        </div>

        <Button className="min-h-11 w-full" disabled={isSubmitting} type="submit">
          <Plus aria-hidden="true" />
          Create run
        </Button>
      </form>
    </Card>
  );
}
