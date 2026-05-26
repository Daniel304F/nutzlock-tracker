import { FileUp, Link2, LogIn, UsersRound } from "lucide-react";
import { useId, type FormEvent } from "react";

import type { RoomJoinInput } from "@api/rooms";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UseJoinRoomResult } from "@hooks/useJoinRoom";

type EntryActionProps = {
  description: string;
  icon: typeof Link2;
  title: string;
};

function EntryAction({ description, icon: Icon, title }: EntryActionProps) {
  return (
    <article
      aria-disabled="true"
      className="rounded-lg border border-border/80 bg-card/85 p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-card"
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-primary/35 bg-primary/10 text-primary"
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            <Badge className="rounded-md" variant="outline">
              Demnächst
            </Badge>
          </div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
      </div>
    </article>
  );
}

type JoinRoomState = Pick<UseJoinRoomResult, "joinedRoom" | "message" | "status">;

type EntryActionCardsProps = {
  joinRoomState: JoinRoomState;
  onJoinRoom: (input: RoomJoinInput) => Promise<void>;
};

function getFormText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function JoinRoomAction({ joinRoomState, onJoinRoom }: EntryActionCardsProps) {
  const codeId = useId();
  const nameId = useId();
  const isJoining = joinRoomState.status === "joining";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await onJoinRoom({
        display_name: getFormText(formData, "display_name"),
        join_code: getFormText(formData, "join_code"),
      });
      form.reset();
    } catch {
      // The hook and page toast surface the failure; keep the form values for correction.
    }
  }

  return (
    <article className="rounded-lg border border-border/80 bg-card/85 p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-card">
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-indigo/30 bg-indigo/10 text-indigo dark:border-primary/35 dark:bg-primary/10 dark:text-primary"
        >
          <Link2 className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">Raum beitreten</h2>
            <Badge className="rounded-md" variant="sky">
              Soullink
            </Badge>
          </div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Mit Code einsteigen und als Partner im gemeinsamen Run erscheinen.
          </p>
        </div>
      </div>

      <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor={codeId}>Beitrittscode</Label>
          <Input
            autoCapitalize="characters"
            className="min-h-11 bg-background/70 font-mono uppercase tracking-normal"
            id={codeId}
            maxLength={24}
            name="join_code"
            required
            type="text"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={nameId}>Dein Name</Label>
          <Input
            className="min-h-11 bg-background/70"
            id={nameId}
            maxLength={80}
            name="display_name"
            required
            type="text"
          />
        </div>
        <Button
          className="min-h-11 self-end"
          disabled={isJoining}
          type="submit"
          variant="secondary"
        >
          <LogIn aria-hidden="true" />
          {isJoining ? "Beitreten" : "Raum beitreten"}
        </Button>
      </form>

      {joinRoomState.status === "error" ? (
        <Alert className="mt-3 border-destructive/30 bg-destructive/10" variant="destructive">
          <AlertDescription>{joinRoomState.message}</AlertDescription>
        </Alert>
      ) : null}

      {joinRoomState.status === "joined" && joinRoomState.joinedRoom ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-indigo/25 bg-indigo/10 px-3 py-2 text-xs text-muted-foreground dark:border-primary/30 dark:bg-primary/10">
          <UsersRound aria-hidden="true" className="size-3.5 text-indigo dark:text-primary" />
          <span className="font-medium text-foreground">
            Raum {joinRoomState.joinedRoom.join_code}
          </span>
          <span>{joinRoomState.joinedRoom.members.length} Mitglieder</span>
        </div>
      ) : null}
    </article>
  );
}

export function EntryActionCards({ joinRoomState, onJoinRoom }: EntryActionCardsProps) {
  return (
    <section aria-label="Nächste Funktionen" className="grid gap-3 sm:grid-cols-2">
      <JoinRoomAction joinRoomState={joinRoomState} onJoinRoom={onJoinRoom} />
      <EntryAction
        description="Backups und Transfers folgen mit dem versionierten Exportformat."
        icon={FileUp}
        title="JSON importieren"
      />
    </section>
  );
}
