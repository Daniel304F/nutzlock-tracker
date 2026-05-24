import { FileUp, Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type EntryActionProps = {
  description: string;
  icon: typeof Link2;
  title: string;
};

function EntryAction({ description, icon: Icon, title }: EntryActionProps) {
  return (
    <Button
      className="h-auto min-h-24 w-full justify-start gap-4 border-border/80 bg-card/90 px-4 py-4 text-left whitespace-normal shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50"
      disabled
      type="button"
      variant="outline"
    >
      <span
        aria-hidden="true"
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-primary/35 bg-primary/10 text-primary"
      >
        <Icon className="size-5" />
      </span>
      <span className="flex flex-col items-start gap-0.5">
        <span className="font-semibold text-foreground">{title}</span>
        <span className="text-xs leading-5 text-muted-foreground">{description}</span>
      </span>
    </Button>
  );
}

export function EntryActionCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <EntryAction
        description="Room membership lands after runs."
        icon={Link2}
        title="Join room"
      />
      <EntryAction
        description="Backup restore comes with export shape."
        icon={FileUp}
        title="Import JSON"
      />
    </div>
  );
}
