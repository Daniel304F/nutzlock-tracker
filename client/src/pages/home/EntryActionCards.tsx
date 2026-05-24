import { FileUp, Link2 } from "lucide-react";

export function EntryActionCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        className="flex min-h-20 items-center gap-3 rounded-lg border border-dashed border-sky-300 bg-white px-4 py-3 text-left text-sm text-zinc-500"
        disabled
        type="button"
      >
        <Link2 aria-hidden="true" className="h-5 w-5 text-sky-700" />
        <span>
          <span className="block font-semibold text-zinc-700">Join room</span>
          <span className="block">Room membership lands after runs.</span>
        </span>
      </button>
      <button
        className="flex min-h-20 items-center gap-3 rounded-lg border border-dashed border-zinc-300 bg-white px-4 py-3 text-left text-sm text-zinc-500"
        disabled
        type="button"
      >
        <FileUp aria-hidden="true" className="h-5 w-5 text-zinc-700" />
        <span>
          <span className="block font-semibold text-zinc-700">Import JSON</span>
          <span className="block">Backup restore comes with export shape.</span>
        </span>
      </button>
    </div>
  );
}
