import { useApiHealth } from "@hooks/useApiHealth";
import { AppShell } from "@layout/AppShell";

const setupCards = [
  {
    title: "Runs",
    description: "Solo- und Soullink-Runs werden als zentrale Aggregate geplant.",
    accent: "border-emerald-500",
  },
  {
    title: "Raeume",
    description: "UUID, Join-Code und spaetere Realtime-Synchronisation leben im Backend.",
    accent: "border-sky-500",
  },
  {
    title: "Regeln",
    description: "Clauses und Warnungen bleiben von der Darstellung getrennt.",
    accent: "border-amber-500",
  },
  {
    title: "Friedhof",
    description: "Tode werden historisiert und bei Soullink serverseitig propagiert.",
    accent: "border-rose-500",
  },
] as const;

const initializedAreas = [
  ["Frontend", "React 19"],
  ["Styling", "Tailwind 3"],
  ["Backend", "FastAPI"],
  ["Datenbank", "SQLite"],
] as const;

export function HomePage() {
  const apiState = useApiHealth();
  const apiLabel =
    apiState.status === "online"
      ? `API online: ${apiState.health.service}`
      : apiState.status === "loading"
        ? "API wird geprueft"
        : apiState.message;

  return (
    <AppShell apiLabel={apiLabel} apiStatus={apiState.status}>
      <section className="grid flex-1 gap-5 py-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold">Initialisierte Bereiche</h2>
          <dl className="mt-4 space-y-3 text-sm">
            {initializedAreas.map(([label, value]) => (
              <div className="flex items-center justify-between gap-4" key={label}>
                <dt className="text-zinc-600">{label}</dt>
                <dd className="font-medium text-zinc-950">{value}</dd>
              </div>
            ))}
          </dl>
        </aside>

        <div className="grid gap-4 sm:grid-cols-2">
          {setupCards.map((card) => (
            <article
              className={`rounded-lg border border-l-4 bg-white p-4 shadow-sm ${card.accent}`}
              key={card.title}
            >
              <h2 className="text-base font-semibold">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{card.description}</p>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

