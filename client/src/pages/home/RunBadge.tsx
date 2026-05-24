import { Badge } from "@/components/ui/badge";

type RunBadgeTone = "emerald" | "sky" | "violet";

type RunBadgeProps = {
  children: string;
  tone: RunBadgeTone;
};

export function RunBadge({ children, tone }: RunBadgeProps) {
  return (
    <Badge className="rounded-md px-2 py-1 text-xs font-semibold" variant={tone}>
      {children}
    </Badge>
  );
}
