import { useMemo, useState, type FormEvent } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CircleDot,
  MapPin,
  RefreshCw,
  Save,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import type {
  EncounterStatus,
  EncounterWithPokemonResponse,
  LocationSlotResponse,
} from "@api/tracker";
import type { RoomMemberResponse } from "@api/rooms";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

// One column of the entry grid: an encounter draft for a single player.
type PlayerColumn = {
  key: string;
  name: string;
  role: string;
  memberId?: string;
};

type PlayerDraft = {
  species: string;
  status: EncounterStatus;
  isShiny: boolean;
};

const EMPTY_DRAFT: PlayerDraft = { isShiny: false, species: "", status: "caught" };

function roleLabel(role: string): string {
  return role === "owner" ? "Owner" : "Partner";
}

type EncounterEntryFormProps = {
  memberOptions?: RoomMemberResponse[];
  onRecord: (input: NewEncounterInput) => Promise<void>;
};

function EncounterEntryForm({ memberOptions = [], onRecord }: EncounterEntryFormProps) {
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [drafts, setDrafts] = useState<Record<string, PlayerDraft>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // One column per writable member; for solo runs fall back to a single column.
  const columns = useMemo<PlayerColumn[]>(() => {
    const writable = memberOptions.filter((member) => member.role !== "viewer");
    if (writable.length === 0) {
      return [{ key: "solo", memberId: undefined, name: "Spieler 1", role: "owner" }];
    }
    return writable.map((member) => ({
      key: member.id,
      memberId: member.id,
      name: member.display_name,
      role: member.role,
    }));
  }, [memberOptions]);

  function draftFor(key: string): PlayerDraft {
    return drafts[key] ?? EMPTY_DRAFT;
  }

  function updateDraft(key: string, patch: Partial<PlayerDraft>) {
    setDrafts((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? EMPTY_DRAFT), ...patch },
    }));
  }

  const hasSpecies = columns.some((column) => draftFor(column.key).species.trim() !== "");
  const isDisabled = isSubmitting || location.trim() === "" || !hasSpecies;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const toSave = columns
      .map((column) => ({ column, draft: draftFor(column.key) }))
      .filter(({ draft }) => draft.species.trim() !== "");

    if (toSave.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      for (const { column, draft } of toSave) {
        await onRecord({
          encounter_status: draft.status,
          is_shiny: draft.isShiny,
          location_name: location.trim(),
          member_id: column.memberId,
          notes: notes.trim() || undefined,
          species_ref: draft.species.trim() || undefined,
        });
      }
      setLocation("");
      setNotes("");
      setDrafts({});
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
              Gebiet einmal festlegen und den Fund für jeden Spieler in seiner Spalte
              erfassen. Gefangene Encounter landen automatisch in der Box.
            </p>
          </div>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="space-y-1.5">
            <Label htmlFor="encounter-location">Gebiet</Label>
            <Input
              className="min-h-11 bg-background/70"
              disabled={isSubmitting}
              id="encounter-location"
              name="location_name"
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Route 101"
              required
              type="text"
              value={location}
            />
          </div>

          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
          >
            {columns.map((column) => {
              const draft = draftFor(column.key);

              return (
                <div
                  aria-label={column.name}
                  className="flex flex-col gap-4 rounded-md border border-border/80 bg-background/40 p-4"
                  key={column.key}
                  role="group"
                >
                  <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
                    <span
                      aria-hidden="true"
                      className="size-2.5 shrink-0 rounded-full bg-primary"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold leading-5 text-foreground">
                        {column.name}
                      </span>
                      <span className="block text-xs leading-4 text-muted-foreground">
                        {roleLabel(column.role)}
                      </span>
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`species-${column.key}`}>Spezies</Label>
                    <Input
                      className="min-h-11 bg-background/70"
                      disabled={isSubmitting}
                      id={`species-${column.key}`}
                      onChange={(event) =>
                        updateDraft(column.key, { species: event.target.value })
                      }
                      placeholder="zigzagoon"
                      type="text"
                      value={draft.species}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-sm font-medium text-foreground">Status</span>
                    <div className="grid grid-cols-2 gap-1.5 rounded-md border border-border/80 bg-background/60 p-1">
                      {encounterStatusOptions.map((option) => {
                        const isSelected = draft.status === option.value;

                        return (
                          <button
                            className={cn(
                              "rounded-sm px-2 py-2 text-sm font-semibold transition-colors",
                              isSelected
                                ? "bg-primary/15 text-foreground ring-1 ring-primary/30"
                                : "text-muted-foreground hover:bg-secondary/80",
                            )}
                            disabled={isSubmitting}
                            key={option.value}
                            onClick={() => updateDraft(column.key, { status: option.value })}
                            type="button"
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Label
                    className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold leading-5"
                    htmlFor={`shiny-${column.key}`}
                  >
                    <input
                      checked={draft.isShiny}
                      className="size-4 rounded border-border accent-primary"
                      disabled={isSubmitting}
                      id={`shiny-${column.key}`}
                      onChange={(event) =>
                        updateDraft(column.key, { isShiny: event.target.checked })
                      }
                      type="checkbox"
                    />
                    <Sparkles aria-hidden="true" className="size-4 text-hibiscus" />
                    Shiny
                  </Label>
                </div>
              );
            })}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="encounter-notes">Notizen</Label>
            <Textarea
              className="min-h-20 bg-background/70"
              disabled={isSubmitting}
              id="encounter-notes"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Fundumstände, Route-Sonderfall, Hausregel"
              value={notes}
            />
          </div>
        </div>

        <div className="border-t border-border/70 bg-background/35 px-5 py-4">
          <Button className="min-h-11 w-full shadow-sm" disabled={isDisabled} type="submit">
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
            {encounter.is_shiny ? (
              <Badge className="rounded-md" variant="violet">
                <Sparkles aria-hidden="true" />
                Shiny
              </Badge>
            ) : null}
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
      <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 py-5">
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

        <EncounterEntryForm
          memberOptions={tracker?.room?.members}
          onRecord={handleRecordEncounter}
        />
        {tracker?.run.challenge_mode === "soullink" && !tracker.room ? (
          <Alert className="border-neon/40 bg-neon/10">
            <ShieldAlert aria-hidden="true" />
            <AlertDescription>
              Room-Mitglieder konnten nicht geladen werden. Encounter werden für die
              Spieler erst korrekt zugeordnet, sobald der Room verfügbar ist.
            </AlertDescription>
          </Alert>
        ) : null}

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
      </section>
    </AppShell>
  );
}
