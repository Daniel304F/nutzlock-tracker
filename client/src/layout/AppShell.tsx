import type { ReactNode } from "react";
import { Activity, Compass, Link2, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@components/theme/ThemeToggle";
import { cn } from "@/lib/utils";

type AppShellProps = {
  apiLabel: string;
  apiStatus: "loading" | "offline" | "online";
  children: ReactNode;
};

const apiStatusColor = {
  loading: "bg-neon",
  offline: "bg-ruby",
  online: "bg-hibiscus",
} as const;

const navItems = [
  { icon: Compass, label: "Runs" },
  { icon: Link2, label: "Rooms" },
  { icon: ShieldCheck, label: "Rules" },
] as const;

const footerTags = ["React", "FastAPI", "shadcn/ui"] as const;

export function AppShell({ apiLabel, apiStatus, children }: AppShellProps) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <div aria-hidden="true" className="grid h-1.5 grid-cols-5">
        <span className="bg-hibiscus" />
        <span className="bg-ruby" />
        <span className="bg-aura" />
        <span className="bg-indigo" />
        <span className="bg-neon" />
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-0.375rem)] w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-30 -mx-4 border-b border-border/70 bg-background/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div
                aria-hidden="true"
                className="grid size-11 shrink-0 grid-cols-2 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
              >
                <span className="bg-hibiscus" />
                <span className="bg-ruby" />
                <span className="bg-aura" />
                <span className="bg-indigo" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Nuzlocke & Soullink
                </p>
                <h1 className="truncate text-xl font-semibold sm:text-2xl">
                  Tracker Workspace
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <nav
                aria-label="Workspace sections"
                className="hidden items-center gap-1 rounded-lg border border-border/70 bg-card/70 p-1 shadow-sm md:flex"
              >
                {navItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <span
                      className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground"
                      key={item.label}
                    >
                      <Icon aria-hidden="true" className="size-4" />
                      {item.label}
                    </span>
                  );
                })}
              </nav>

              <div
                className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border/70 bg-card/80 px-3 py-2 text-sm text-muted-foreground shadow-sm"
                role="status"
              >
                <span
                  aria-hidden="true"
                  className={cn("size-2.5 rounded-full", apiStatusColor[apiStatus])}
                />
                <Activity aria-hidden="true" className="size-4" />
                <span className="max-w-[14rem] truncate">{apiLabel}</span>
              </div>

              <ThemeToggle />
            </div>
          </div>
        </header>

        <Separator className="sr-only" />

        {children}

        <footer
          className="mt-auto border-t border-border/70 py-6 text-sm text-muted-foreground"
          role="contentinfo"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div
                aria-hidden="true"
                className="grid size-9 shrink-0 grid-cols-2 overflow-hidden rounded-md border border-border bg-card"
              >
                <span className="bg-hibiscus" />
                <span className="bg-ruby" />
                <span className="bg-aura" />
                <span className="bg-indigo" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground">Nutzlock Tracker</p>
                <p className="truncate">Private fan tool for challenge runs.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {footerTags.map((tag) => (
                <Badge className="rounded-md px-2.5 py-1" key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
