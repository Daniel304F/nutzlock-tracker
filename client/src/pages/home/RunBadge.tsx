type RunBadgeProps = {
  children: string;
  tone: "emerald" | "sky" | "violet";
};

const toneClass = {
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
  sky: "border-sky-200 bg-sky-50 text-sky-800",
  violet: "border-violet-200 bg-violet-50 text-violet-800",
} satisfies Record<RunBadgeProps["tone"], string>;

export function RunBadge({ children, tone }: RunBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold ${toneClass[tone]}`}
    >
      {children}
    </span>
  );
}
