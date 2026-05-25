import {
  ArrowRight,
  BarChart3,
  Cloud,
  Gamepad2,
  Link2,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import nutzlockLogo from "@assets/nutzlock_logo.png";
import landingPageImage from "@/landingpage.png";
import { cn } from "@/lib/utils";

type LandingPageProps = {
  workspaceHref: string;
};

const featureCards = [
  {
    accentClass: "text-neon",
    description:
      "Behalte Fangregeln, Verluste und Hausregeln während des Runs klar im Blick.",
    icon: ShieldCheck,
    title: "Regeln sicher im Blick",
  },
  {
    accentClass: "text-hibiscus",
    description:
      "Verbinde Teams, dokumentiere Partner und teile wichtige Zustände mit deiner Gruppe.",
    icon: Link2,
    title: "Soullink ohne Chaos",
  },
  {
    accentClass: "text-sky-300",
    description:
      "Tracke Orden, Level Caps, Tode und Ereignisse ohne den Spielfluss zu verlieren.",
    icon: BarChart3,
    title: "Fortschritt auf einen Blick",
  },
  {
    accentClass: "text-indigo-200",
    description:
      "Die App ist auf gemeinsame Räume und serverseitig verlässliche Soullink-Effekte ausgelegt.",
    icon: Cloud,
    title: "Gemeinsame Räume",
  },
] as const;

export function LandingPage({ workspaceHref }: LandingPageProps) {
  return (
    <main className="min-h-screen bg-nocturne text-white">
      <section className="relative isolate overflow-hidden bg-[#070811]">
        <h1 className="sr-only">Nutzlocke &amp; Soullink Tracker App</h1>

        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#050811_0%,#101325_48%,#070811_100%)]"
        />

        <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center px-4 py-4 sm:px-6 lg:px-8">
          <a
            className="inline-flex min-h-11 items-center gap-3 rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur-xl transition-colors hover:bg-white/12 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white/40"
            href="/"
          >
            <img
              alt=""
              className="size-8 rounded-md bg-white object-contain p-1"
              height={32}
              src={nutzlockLogo}
              width={32}
            />
            Nutzlock Tracker
          </a>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-76px)] w-full max-w-7xl flex-col items-center justify-center px-4 pb-12 pt-4 text-center sm:px-6 lg:px-8">
          <figure className="w-full max-w-5xl">
            <img
              alt="Nutzlocke und Soullink Tracker App"
              className="mx-auto max-h-[62svh] w-full rounded-lg border border-white/12 object-contain shadow-[0_28px_90px_rgba(0,0,0,0.46)]"
              decoding="async"
              fetchPriority="high"
              src={landingPageImage}
            />
          </figure>

          <Button
            asChild
            className="mt-7 min-h-16 w-full max-w-xs rounded-lg border border-white/25 bg-indigo px-6 text-base font-semibold text-white shadow-[0_0_42px_rgba(88,72,179,0.68)] hover:bg-hibiscus focus-visible:ring-white/65 sm:min-h-20 sm:max-w-sm sm:text-lg"
            size="lg"
          >
            <a href={workspaceHref}>
              <Gamepad2 aria-hidden="true" className="size-5 sm:size-6" />
              Tracker starten
              <ArrowRight aria-hidden="true" className="size-5 sm:size-6" />
            </a>
          </Button>
        </div>
      </section>

      <section
        className="border-t border-white/10 bg-[#070811] px-4 pb-16 pt-10 sm:px-6 lg:px-8"
        id="features"
      >
        <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase text-neon">
              Für deine Spielrunde
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Alles für deine Challenge.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/66 sm:text-base">
              Ein schneller Einstieg für deine Runs: klar genug fürs Handy neben
              dem Bildschirm, stark genug für Nuzlocke, Soullink und
              Randomizer-Abende.
            </p>

            <dl className="mt-6 grid max-w-xl grid-cols-3 gap-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.05] p-3">
                <dt className="text-xs text-white/56">Regeln</dt>
                <dd className="mt-1 text-sm font-semibold text-white">
                  sichtbar
                </dd>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.05] p-3">
                <dt className="text-xs text-white/56">Links</dt>
                <dd className="mt-1 text-sm font-semibold text-white">
                  verbunden
                </dd>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.05] p-3">
                <dt className="text-xs text-white/56">Tode</dt>
                <dd className="mt-1 text-sm font-semibold text-white">
                  protokolliert
                </dd>
              </div>
            </dl>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {featureCards.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-sm backdrop-blur-md transition-colors hover:bg-white/[0.09]"
                  id={
                    item.title === "Soullink ohne Chaos"
                      ? "soullink"
                      : undefined
                  }
                  key={item.title}
                >
                  <div className="flex items-start gap-3">
                    <Icon
                      aria-hidden="true"
                      className={cn("mt-0.5 size-6", item.accentClass)}
                    />
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-white">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-white/64">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
