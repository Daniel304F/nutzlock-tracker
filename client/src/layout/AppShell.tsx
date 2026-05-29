import type { ReactNode } from "react";
import { Code2, Compass, ExternalLink, Link2, ShieldCheck } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@components/theme/ThemeToggle";
import nutzlockLogo from "@assets/nutzlock_logo.png";

type AppShellProps = {
  children: ReactNode;
};

const navItems = [
  { icon: Compass, label: "Runs" },
  { icon: Link2, label: "Rooms" },
  { icon: ShieldCheck, label: "Rules" },
] as const;

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="flex min-h-screen w-full max-w-full flex-col overflow-x-clip bg-background text-foreground">
      <div aria-hidden="true" className="h-1.5 bg-primary" />

      <div className="mx-auto flex w-full max-w-[104rem] min-w-0 flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-30 max-w-full border-b border-border/70 bg-background/90 py-3 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <img
                alt="Nutzlocke and Soullink logo"
                className="size-14 shrink-0 rounded-lg border border-border bg-white object-contain p-1 shadow-sm"
                height={56}
                src={nutzlockLogo}
                width={56}
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Nuzlocke & Soullink
                </p>
                <h1 className="truncate text-xl font-semibold sm:text-2xl">
                  Tracker Workspace
                </h1>
              </div>
            </div>

            <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
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

              <ThemeToggle />
            </div>
          </div>
        </header>

        <Separator className="sr-only" />

        {children}
      </div>

      <footer
        className="w-full border-t border-border/70 bg-card/45 text-sm text-muted-foreground"
        role="contentinfo"
      >
        <div className="mx-auto flex w-full max-w-[104rem] min-w-0 flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <img
              alt="Nutzlocke and Soullink logo"
              className="size-12 shrink-0 rounded-md border border-border bg-white object-contain p-1"
              height={48}
              src={nutzlockLogo}
              width={48}
            />
            <div className="min-w-0">
              <p className="font-semibold text-foreground">Nutzlock Tracker</p>
              <p className="truncate">Private fan tool for challenge runs.</p>
            </div>
          </div>

          <a
            className="inline-flex min-h-9 max-w-full items-center gap-2 rounded-md border border-border bg-background px-3 py-2 font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            href="https://github.com/Daniel304F/nutzlock-tracker"
            rel="noreferrer"
            target="_blank"
          >
            <Code2 aria-hidden="true" className="size-4" />
            <span className="min-w-0 truncate">Daniel304F/nutzlock-tracker</span>
            <ExternalLink aria-hidden="true" className="size-3.5 text-muted-foreground" />
          </a>
        </div>
      </footer>
    </main>
  );
}
