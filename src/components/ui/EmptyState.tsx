interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="app-surface rounded-xl p-8 text-center sm:p-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-xl text-cyan-100">
        ○
      </div>
      <h2 className="mt-4 text-xl font-extrabold text-white">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
