import { Dice5, Plus, Shuffle, User, Users, UsersRound, type LucideIcon } from "lucide-react";
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

type PlayerKind = "solo" | "duo" | "multi";
type RunMode = "nuzlocke" | "randomizer";

const DEFAULT_MULTI_PLAYER_COUNT = 3;
const MAX_PLAYER_COUNT = 32;

type RadioOption<T extends string> = {
  description: string;
  icon: LucideIcon;
  label: string;
  value: T;
};

const playerKinds = [
  {
    description: "Solo-Lauf",
    icon: User,
    label: "Einzelspieler",
    value: "solo",
  },
  {
    description: "Zwei Spieler",
    icon: Users,
    label: "Duo",
    value: "duo",
  },
  {
    description: "Drei oder mehr",
    icon: UsersRound,
    label: "Mehrspieler",
    value: "multi",
  },
] as const satisfies ReadonlyArray<RadioOption<PlayerKind>>;

const runModes = [
  {
    description: "Standard-Regeln",
    icon: Dice5,
    label: "Nuzlocke",
    value: "nuzlocke",
  },
  {
    description: "Zufällige Begegnungen",
    icon: Shuffle,
    label: "Randomizer",
    value: "randomizer",
  },
] as const satisfies ReadonlyArray<RadioOption<RunMode>>;

function getFormText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function toChallengeMode(playerKind: PlayerKind): ChallengeMode {
  return playerKind === "solo" ? "nuzlocke" : "soullink";
}

function resolvePlayerCount(playerKind: PlayerKind, multiCount: number): number {
  if (playerKind === "solo") return 1;
  if (playerKind === "duo") return 2;
  return multiCount;
}

function buildRunInput(
  formData: FormData,
  playerKind: PlayerKind,
  runMode: RunMode,
  multiCount: number,
): RunCreateInput {
  const notes = getFormText(formData, "notes");

  return {
    challenge_mode: toChallengeMode(playerKind),
    game_version_ref: getFormText(formData, "game_version_ref"),
    is_randomizer: runMode === "randomizer",
    name: getFormText(formData, "name"),
    notes: notes || null,
    player_count: resolvePlayerCount(playerKind, multiCount),
  };
}

type RadioCardGroupProps<T extends string> = {
  ariaLabel: string;
  baseId: string;
  className?: string;
  name: string;
  onChange: (value: T) => void;
  options: ReadonlyArray<RadioOption<T>>;
  value: T;
};

function RadioCardGroup<T extends string>({
  ariaLabel,
  baseId,
  className,
  name,
  onChange,
  options,
  value,
}: RadioCardGroupProps<T>) {
  return (
    <RadioGroup
      aria-label={ariaLabel}
      className={cn("mt-2 grid items-stretch gap-2", className)}
      name={name}
      value={value}
      onValueChange={(next) => onChange(next as T)}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.value;
        const itemId = `${baseId}-${option.value}`;

        return (
          <Label
            htmlFor={itemId}
            key={option.value}
            className={cn(
              "grid min-h-14 cursor-pointer grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-3 rounded-md border px-3 py-2 text-sm transition-all hover:-translate-y-0.5",
              isSelected
                ? "border-primary bg-primary/10 text-foreground shadow-sm ring-1 ring-primary/20"
                : "border-border/80 bg-background/60 text-foreground hover:border-primary/40 hover:bg-secondary/80",
            )}
          >
            <RadioGroupItem
              aria-label={option.label}
              className="sr-only"
              id={itemId}
              value={option.value}
            />
            <span
              aria-hidden="true"
              className={cn(
                "inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border/70 bg-card text-muted-foreground",
                isSelected && "border-primary/30 bg-primary text-primary-foreground",
              )}
            >
              <Icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block break-words font-semibold leading-5">
                {option.label}
              </span>
              <span className="block break-words text-xs leading-4 text-muted-foreground">
                {option.description}
              </span>
            </span>
          </Label>
        );
      })}
    </RadioGroup>
  );
}

export function NewRunForm({ onCreateRun }: NewRunFormProps) {
  const [playerKind, setPlayerKind] = useState<PlayerKind>("solo");
  const [runMode, setRunMode] = useState<RunMode>("nuzlocke");
  const [multiPlayerCount, setMultiPlayerCount] = useState<number>(DEFAULT_MULTI_PLAYER_COUNT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameId = useId();
  const editionId = useId();
  const notesId = useId();
  const playerKindId = useId();
  const runModeId = useId();
  const multiCountId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = buildRunInput(
      new FormData(form),
      playerKind,
      runMode,
      multiPlayerCount,
    );

    setIsSubmitting(true);

    try {
      await onCreateRun(input);
      form.reset();
      setPlayerKind("solo");
      setRunMode("nuzlocke");
      setMultiPlayerCount(DEFAULT_MULTI_PLAYER_COUNT);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="overflow-hidden rounded-lg border-border/80 bg-card/95 p-0 shadow-sm">
      <div aria-hidden="true" className="h-1 bg-primary" />

      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-3 border-b border-border/70 px-5 py-5">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <Plus aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground">Run anlegen</h2>
            <p className="text-sm leading-5 text-muted-foreground">
              Lege den Kern deines Runs an. Räume, Regeln und Wiederherstellung
              hängen später sauber an diesem Datensatz.
            </p>
          </div>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="space-y-1.5">
            <Label htmlFor={nameId}>Run-Name</Label>
            <Input
              className="min-h-11 bg-background/70"
              id={nameId}
              name="name"
              placeholder="HeartGold mit Sam"
              required
              type="text"
            />
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-foreground">Spielertyp</legend>
            <RadioCardGroup
              ariaLabel="Spielertyp"
              baseId={playerKindId}
              name="player_kind"
              onChange={setPlayerKind}
              options={playerKinds}
              value={playerKind}
            />
            {playerKind === "multi" ? (
              <div className="mt-3 space-y-1.5">
                <Label htmlFor={multiCountId}>Anzahl Spieler</Label>
                <Input
                  className="min-h-11 bg-background/70"
                  id={multiCountId}
                  inputMode="numeric"
                  max={MAX_PLAYER_COUNT}
                  min={3}
                  name="player_count_input"
                  required
                  type="number"
                  value={multiPlayerCount}
                  onChange={(event) => {
                    const next = Number(event.currentTarget.value);
                    setMultiPlayerCount(Number.isFinite(next) ? next : DEFAULT_MULTI_PLAYER_COUNT);
                  }}
                />
              </div>
            ) : null}
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-foreground">Modus</legend>
            <RadioCardGroup
              ariaLabel="Modus"
              baseId={runModeId}
              className="sm:grid-cols-2"
              name="run_mode"
              onChange={setRunMode}
              options={runModes}
              value={runMode}
            />
          </fieldset>

          <div className="space-y-1.5">
            <Label htmlFor={editionId}>Edition</Label>
            <Input
              className="min-h-11 bg-background/70"
              defaultValue="emerald"
              id={editionId}
              name="game_version_ref"
              required
              type="text"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={notesId}>Notizen</Label>
            <Textarea
              className="min-h-20 bg-background/70"
              id={notesId}
              name="notes"
              placeholder="Seed, Partner, Routenplan"
            />
          </div>
        </div>

        <div className="border-t border-border/70 bg-background/35 px-5 py-4">
          <Button className="min-h-11 w-full shadow-sm" disabled={isSubmitting} type="submit">
            <Plus aria-hidden="true" />
            Run erstellen
          </Button>
        </div>
      </form>
    </Card>
  );
}
