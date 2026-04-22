"use client";

import { memo } from "react";
import { useDroppable } from "@dnd-kit/react";
import type { Job, JobStatus } from "@/lib/types";
import { JobCard } from "./job-card";

// Per-column empty state icons
const EMPTY_ICONS: Record<JobStatus, React.ReactNode> = {
  wishlist: (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-gray-300 dark:text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  applied: (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-gray-300 dark:text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  interview: (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-gray-300 dark:text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
    </svg>
  ),
  offer: (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-gray-300 dark:text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M12 15a7 7 0 100-14 7 7 0 000 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

interface KanbanColumnProps {
  status: JobStatus;
  label: string;
  dotColor: string;
  jobs: Job[];
  onCardClick: (job: Job) => void;
  onAddClick: () => void;
}

export const KanbanColumn = memo(function KanbanColumn({
  status,
  label,
  dotColor,
  jobs,
  onCardClick,
  onAddClick,
}: KanbanColumnProps) {
  const { ref, isDropTarget } = useDroppable({ id: status });

  return (
    <div
      className={`min-w-[280px] flex-1 ${
        isDropTarget ? "bg-violet-50/50 dark:bg-violet-500/5" : ""
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-zinc-50">
            {label}
          </h2>
          <span className="text-xs text-gray-400 dark:text-zinc-500">
            {jobs.length}
          </span>
        </div>
        <button
          onClick={onAddClick}
          className="cursor-pointer rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M8 3v10M3 8h10" />
          </svg>
        </button>
      </div>

      {/* Cards */}
      <div
        ref={ref}
        className="mx-3 mb-4 flex flex-col gap-2.5 rounded-xl bg-gray-100/70 p-3 dark:bg-zinc-800/40"
        style={{ minHeight: 80 }}
      >
        {jobs.map((job, index) => (
          <JobCard
            key={job.id}
            job={job}
            index={index}
            group={status}
            onCardClick={onCardClick}
          />
        ))}

        {jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-10">
            {EMPTY_ICONS[status]}
            <p className="text-xs text-gray-400 dark:text-zinc-500">
              Drop cards here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.label !== nextProps.label) return false;
  if (prevProps.dotColor !== nextProps.dotColor) return false;
  if (prevProps.jobs.length !== nextProps.jobs.length) return false;
  for (let i = 0; i < prevProps.jobs.length; i++) {
    if (prevProps.jobs[i] !== nextProps.jobs[i]) return false;
  }
  return true;
});
