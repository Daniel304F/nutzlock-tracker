import { FileUp, Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type EntryActionProps = {
  description: string;
  icon: typeof Link2;
  iconClassName?: string;
  title: string;
};

function EntryAction({ description, icon: Icon, iconClassName, title }: EntryActionProps) {
  return (
    <Button
      className="h-auto min-h-20 w-full justify-start gap-3 border-dashed px-4 py-3 text-left whitespace-normal"
      disabled
      type="button"
      variant="outline"
    >
      <Icon aria-hidden="true" className={iconClassName ?? "size-5 text-foreground"} />
      <span className="flex flex-col items-start gap-0.5">
        <span className="font-semibold text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
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
        iconClassName="size-5 text-sky-700"
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
