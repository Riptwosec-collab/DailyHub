import { Input } from "@/components/ui/Input";
import type { ScheduledTaskStatus, ScheduledTaskType } from "@/types/scheduled-task";

interface TaskFilterBarProps {
  search: string;
  selectedType: "All" | ScheduledTaskType;
  selectedStatus: "All" | ScheduledTaskStatus;
  taskTypes: ScheduledTaskType[];
  onSearchChange: (value: string) => void;
  onTypeChange: (value: "All" | ScheduledTaskType) => void;
  onStatusChange: (value: "All" | ScheduledTaskStatus) => void;
}

const statuses: Array<"All" | ScheduledTaskStatus> = ["All", "Active", "Running", "Paused", "Failed"];

export function TaskFilterBar({
  search,
  selectedType,
  selectedStatus,
  taskTypes,
  onSearchChange,
  onTypeChange,
  onStatusChange,
}: TaskFilterBarProps) {
  return (
    <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl md:grid-cols-[1fr_220px_180px]">
      <Input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search task name, source, GPT action..."
      />

      <select
        className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 text-sm font-semibold text-white shadow-inner shadow-black/20 outline-none transition focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-300/10"
        value={selectedType}
        onChange={(event) => onTypeChange(event.target.value as "All" | ScheduledTaskType)}
      >
        <option value="All">All task types</option>
        {taskTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      <select
        className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 text-sm font-semibold text-white shadow-inner shadow-black/20 outline-none transition focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-300/10"
        value={selectedStatus}
        onChange={(event) => onStatusChange(event.target.value as "All" | ScheduledTaskStatus)}
      >
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status === "All" ? "All status" : status}
          </option>
        ))}
      </select>
    </div>
  );
}
