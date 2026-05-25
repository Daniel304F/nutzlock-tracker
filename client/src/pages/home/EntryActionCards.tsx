import { FileUp, Link2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";

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

export function EntryActionCards() {
  return (
    <section aria-label="Nächste Funktionen" className="grid gap-3 sm:grid-cols-2">
      <EntryAction
        description="Gemeinsame Räume werden der nächste Einstieg für Soullink-Runs."
        icon={Link2}
        title="Raum beitreten"
      />
      <EntryAction
        description="Backups und Transfers folgen mit dem versionierten Exportformat."
        icon={FileUp}
        title="JSON importieren"
      />
    </section>
  );
}
