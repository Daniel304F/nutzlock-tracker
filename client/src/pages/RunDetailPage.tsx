import { useId, useState, type FormEvent } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CircleDot,
  MapPin,
  RefreshCw,
  Save,
  ShieldAlert,
} from "lucide-react";

import type {
  EncounterStatus,
  EncounterWithPokemonResponse,
  LocationSlotResponse,
} from "@api/tracker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToastService } from "@components/toast/ToastProvider";
import { useApiHealth } from "@hooks/useApiHealth";
import { useRunTracker, type NewEncounterInput } from "@hooks/useRunTracker";
import { AppShell } from "@layout/AppShell";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@utils/getErrorMessage";

type RunDetailPageProps = {
  runId: string;
};

const encounterStatusOptions = [
  { description: "Pokemon wird verwaltet", label: "Gefangen", value: "caught" },
  { description: "Nicht gefangen", label: "Fehlgeschlagen", value: "failed" },
  { description: "Geflohen", label: "Geflohen", value: "fled" },
  { description: "Vor Fang besiegt", label: "Getötet", value: "killed_before_catch" },
  { description: "Kein Eintrag", label: "Verpasst", value: "missed" },
  { description: "Zaehlt nicht", label: "Dupe", value: "dupe_skipped" },
] as const satisfies ReadonlyArray<{
  description: string;
  label: string;
  value: EncounterStatus;
}>;

const encounterStatusLabels: Record<EncounterStatus, string> = {
  caught: "Gefangen",
  dupe_skipped: "Dupe",
  failed: "Fehlgeschlagen",
  fled: "Geflohen",
  killed_before_catch: "Getötet",
  missed: "Verpasst",
};

const rosterStatusLabels = {
  box: "Box",
  graveyard: "Friedhof",
  team: "Team",
} as const;

function getApiLabel(apiState: ReturnType<typeof useApiHealth>) {
  if (apiState.status === "online") {
    return `API online: ${apiState.health.service}`;
  }

  if (apiState.status === "loading") {
    return "API wird geprüft";
  }

  return apiState.message;
}

function getFormText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalNumber(formData: FormData, key: string): number | undefined {
  const value = getFormText(formData, key);

  if (!value) {
    return undefined;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function getOptionalText(formData: FormData, key: string): string | undefined {
  const value = getFormText(formData, key);
  return value || undefined;
}

type EncounterEntryFormProps = {
  disabled?: boolean;
  onRecord: (input: NewEncounterInput) => Promise<void>;
};

function EncounterEntryForm({ disabled = false, onRecord }: EncounterEntryFormProps) {
  const [encounterStatus, setEncounterStatus] = useState<EncounterStatus>("caught");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const locationId = useId();
  const speciesId = useId();
  const nicknameId = useId();
  const levelId = useId();
  const notesId = useId();
  const statusId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const input: NewEncounterInput = {
      encounter_status: encounterStatus,
      level: getOptionalNumber(formData, "level"),
      location_name: getFormText(formData, "location_name"),
      member_id: undefined,
      nickname: getOptionalText(formData, "nickname"),
      notes: getOptionalText(formData, "notes"),
      species_ref: getOptionalText(formData, "species_ref"),
    };

    setIsSubmitting(true);

    try {
      await onRecord(input);
      form.reset();
      setEncounterStatus("caught");
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
            <CircleDot aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground">Encounter eintragen</h2>
            <p className="text-sm leading-5 text-muted-foreground">
              Gebiet und Ergebnis in einem Schritt erfassen. Gefangene Encounter
              landen automatisch in der Box.
            </p>
          </div>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={locationId}>Gebiet</Label>
              <Input
                className="min-h-11 bg-background/70"
                disabled={disabled || isSubmitting}
                id={locationId}
                name="location_name"
                placeholder="Route 101"
                required
                type="text"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={speciesId}>Spezies</Label>
              <Input
                className="min-h-11 bg-background/70"
                disabled={disabled || isSubmitting}
                id={speciesId}
                name="species_ref"
                placeholder="zigzagoon"
                required={encounterStatus === "caught"}
                type="text"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={nicknameId}>Spitzname</Label>
              <Input
                className="min-h-11 bg-background/70"
                disabled={disabled || isSubmitting}
                id={nicknameId}
                name="nickname"
                placeholder="Zip"
                type="text"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={levelId}>Level</Label>
              <Input
                className="min-h-11 bg-background/70"
                disabled={disabled || isSubmitting}
                id={levelId}
                inputMode="numeric"
                max={100}
                min={1}
                name="level"
                type="number"
              />
            </div>
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-foreground">Status</legend>
            <RadioGroup
              aria-label="Encounter-Status"
              className="mt-2 grid gap-2 sm:grid-cols-2"
              disabled={disabled || isSubmitting}
              name="encounter_status"
              value={encounterStatus}
              onValueChange={(next) => setEncounterStatus(next as EncounterStatus)}
            >
              {encounterStatusOptions.map((option) => {
                const itemId = `${statusId}-${option.value}`;
                const isSelected = encounterStatus === option.value;

                return (
                  <Label
                    className={cn(
                      "grid min-h-14 cursor-pointer grid-cols-[1.75rem_minmax(0,1fr)] items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors",
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/20"
                        : "border-border/80 bg-background/60 hover:border-primary/40 hover:bg-secondary/80",
                    )}
                    htmlFor={itemId}
                    key={option.value}
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
                        "size-3 rounded-full border border-border bg-background",
                        isSelected && "border-primary bg-primary",
                      )}
                    />
                    <span className="min-w-0">
                      <span className="block font-semibold leading-5">{option.label}</span>
                      <span className="block text-xs leading-4 text-muted-foreground">
                        {option.description}
                      </span>
                    </span>
                  </Label>
                );
              })}
            </RadioGroup>
          </fieldset>

          <div className="space-y-1.5">
            <Label htmlFor={notesId}>Notizen</Label>
            <Textarea
              className="min-h-20 bg-background/70"
              disabled={disabled || isSubmitting}
              id={notesId}
              name="notes"
              placeholder="Fundumstände, Route-Sonderfall, Hausregel"
            />
          </div>
        </div>

        <div className="border-t border-border/70 bg-background/35 px-5 py-4">
          <Button
            className="min-h-11 w-full shadow-sm"
            disabled={disabled || isSubmitting}
            type="submit"
          >
            <Save aria-hidden="true" />
            Encounter speichern
          </Button>
        </div>
      </form>
    </Card>
  );
}

function EncounterRow({ encounter }: { encounter: EncounterWithPokemonResponse }) {
  const pokemon = encounter.pokemon;

  return (
    <li className="rounded-md border border-border/70 bg-background/65 px-3 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-md" variant={encounter.encounter_status === "caught" ? "emerald" : "amber"}>
              {encounterStatusLabels[encounter.encounter_status]}
            </Badge>
            {pokemon ? (
              <Badge className="rounded-md" variant="violet">
                {rosterStatusLabels[pokemon.roster_status]}
              </Badge>
            ) : null}
          </div>
          <p className="mt-2 break-words text-sm font-semibold text-foreground">
            {encounter.species_ref || "Unbekannte Spezies"}
          </p>
          {encounter.nickname ? (
            <p className="text-sm text-muted-foreground">{encounter.nickname}</p>
          ) : null}
        </div>

        {encounter.level ? (
          <div className="w-fit rounded-md border border-border/70 bg-card px-3 py-2 text-sm font-semibold tabular-nums text-foreground">
            Lv. {encounter.level}
          </div>
        ) : null}
      </div>
    </li>
  );
}

function LocationList({ locations }: { locations: LocationSlotResponse[] }) {
  if (locations.length === 0) {
    return (
      <Alert className="border-border/80 bg-background/60">
        <AlertDescription>Noch keine Encounter. Starte mit dem ersten Gebiet.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-3">
      {locations.map((location) => (
        <article
          className="rounded-lg border border-border/80 bg-card/80 p-4 shadow-sm"
          key={location.id}
        >
          <div className="flex flex-col gap-3 border-b border-border/70 pb-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Gebiet #{location.sort_order}
              </p>
              <h2 className="mt-1 flex min-w-0 items-center gap-2 text-base font-semibold text-foreground">
                <MapPin aria-hidden="true" className="size-4 shrink-0 text-primary" />
                <span className="truncate">{location.name}</span>
              </h2>
            </div>
            <Badge className="rounded-md" variant="outline">
              {location.encounters.length} Encounter
            </Badge>
          </div>

          <ul className="mt-3 grid gap-2">
            {location.encounters.map((encounter) => (
              <EncounterRow encounter={encounter} key={encounter.id} />
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

export function RunDetailPage({ runId }: RunDetailPageProps) {
  const apiState = useApiHealth();
  const toast = useToastService();
  const trackerState = useRunTracker(runId);
  const tracker = trackerState.tracker;

  async function handleRecordEncounter(input: NewEncounterInput) {
    try {
      const result = await trackerState.recordEncounter(input);
      toast.success("Encounter gespeichert", {
        description: `${input.species_ref || input.location_name} wurde eingetragen.`,
      });

      if (result.warnings.length > 0) {
        toast.warning("Regelwarnung", {
          description: result.warnings[0]?.message,
        });
      }
    } catch (error: unknown) {
      toast.error("Encounter konnte nicht gespeichert werden", {
        description: getErrorMessage(error, "Bitte Eingaben prüfen und erneut versuchen."),
      });
      throw error;
    }
  }

  return (
    <AppShell apiLabel={getApiLabel(apiState)} apiStatus={apiState.status}>
      <section className="grid flex-1 gap-5 py-5 xl:grid-cols-[440px_minmax(0,1fr)] 2xl:grid-cols-[460px_minmax(0,1fr)] 2xl:gap-6">
        <aside className="order-2 min-w-0 xl:sticky xl:top-24 xl:order-1 xl:self-start">
          <EncounterEntryForm
            disabled={tracker?.run.challenge_mode === "soullink"}
            onRecord={handleRecordEncounter}
          />
          {tracker?.run.challenge_mode === "soullink" ? (
            <Alert className="mt-3 border-neon/40 bg-neon/10">
              <ShieldAlert aria-hidden="true" />
              <AlertDescription>
                Soullink-Encounter brauchen als nächste Scheibe die
                Mitgliederauswahl. Solo-Runs können hier bereits speichern.
              </AlertDescription>
            </Alert>
          ) : null}
        </aside>

        <div className="order-1 min-w-0 space-y-5 xl:order-2">
          <section className="rounded-lg border border-border/80 bg-card/85 p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <Button asChild className="mb-4 w-fit" size="sm" variant="outline">
                  <a href="/workspace">
                    <ArrowLeft aria-hidden="true" />
                    Zurück zu Runs
                  </a>
                </Button>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Tracker-Run
                </p>
                <h1 className="mt-1 break-words text-3xl font-semibold text-foreground sm:text-4xl">
                  {tracker?.run.name ?? "Run wird geladen"}
                </h1>
                {tracker ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {tracker.run.game_version_ref} · {tracker.run.player_count} Spieler
                  </p>
                ) : null}
              </div>

              <Button
                className="w-full sm:w-fit"
                disabled={trackerState.status === "loading"}
                size="sm"
                type="button"
                variant="outline"
                onClick={() => void trackerState.refresh()}
              >
                <RefreshCw aria-hidden="true" />
                Aktualisieren
              </Button>
            </div>
          </section>

          {trackerState.status === "loading" ? (
            <Alert className="border-border/80 bg-background/60">
              <AlertDescription>Tracker wird geladen</AlertDescription>
            </Alert>
          ) : null}

          {trackerState.status === "error" ? (
            <Alert className="border-destructive/30 bg-destructive/10" variant="destructive">
              <AlertCircle aria-hidden="true" />
              <AlertDescription>{trackerState.message}</AlertDescription>
            </Alert>
          ) : null}

          {trackerState.status === "ready" && tracker ? (
            <section aria-labelledby="locations-heading" className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground" id="locations-heading">
                    Encounter-Liste
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {tracker.locations.length} Gebiete im Run
                  </p>
                </div>
              </div>
              <LocationList locations={tracker.locations} />
            </section>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}
