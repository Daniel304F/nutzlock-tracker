import type { ReactNode } from "react";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type AppShellProps = {
  apiLabel: string;
  apiStatus: "loading" | "offline" | "online";
  children: ReactNode;
};

const apiStatusColor = {
  loading: "bg-amber-500",
  offline: "bg-rose-500",
  online: "bg-emerald-500",
} as const;

export function AppShell({ apiLabel, apiStatus, children }: AppShellProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">Nuzlocke & Soullink</p>
            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Tracker Workspace</h1>
          </div>
          <div
            className="inline-flex w-fit items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm"
            role="status"
          >
            <span
              aria-hidden="true"
              className={cn("h-2.5 w-2.5 rounded-full", apiStatusColor[apiStatus])}
            />
            {apiLabel}
          </div>
        </header>

        <Separator />

        {children}
      </div>
    </main>
  );
}
