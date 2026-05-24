import { FileUp, Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EntryActionProps = {
  accent: "hibiscus" | "indigo";
  description: string;
  icon: typeof Link2;
  title: string;
};

const accentClasses = {
  hibiscus: "border-hibiscus/35 text-hibiscus",
  indigo: "border-indigo/35 text-indigo dark:text-neon",
} as const;

function EntryAction({ accent, description, icon: Icon, title }: EntryActionProps) {
  return (
    <Button
      className="h-auto min-h-24 w-full justify-start gap-4 border-border/80 bg-card/90 px-4 py-4 text-left whitespace-normal shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50"
      disabled
      type="button"
      variant="outline"
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex size-10 shrink-0 items-center justify-center rounded-md border bg-background/60",
          accentClasses[accent],
        )}
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
        accent="indigo"
        description="Room membership lands after runs."
        icon={Link2}
        title="Join room"
      />
      <EntryAction
        accent="hibiscus"
        description="Backup restore comes with export shape."
        icon={FileUp}
        title="Import JSON"
      />
    </div>
  );
}
