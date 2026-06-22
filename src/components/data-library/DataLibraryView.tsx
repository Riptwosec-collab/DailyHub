"use client";

export function DataLibraryView({ initialRunId = "" }: { initialRunId?: string }) {
  return (
    <div className="space-y-4 text-white">
      <p className="text-sm text-cyan-200">Data Library</p>
      <h1 className="text-3xl font-black">Nimbus Daily Data Library</h1>
      <p className="max-w-2xl text-sm text-slate-300">Telegram sends a compact summary. Full data will be stored here by category.</p>
      {initialRunId ? <p className="text-xs text-slate-400">Selected run: {initialRunId}</p> : null}
    </div>
  );
}
