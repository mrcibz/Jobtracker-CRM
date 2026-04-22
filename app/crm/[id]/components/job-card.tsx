"use client";

import { memo } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import type { Job, JobStatus } from "@/lib/types";

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

interface JobCardProps {
  job: Job;
  index: number;
  group: JobStatus;
  onCardClick: (job: Job) => void;
}

export const JobCard = memo(function JobCard({ job, index, group, onCardClick }: JobCardProps) {
  const { ref, isDragging } = useSortable({
    id: job.id,
    index,
    group,
    data: { job },
  });

  return (
    <div
      ref={ref}
      onClick={() => onCardClick(job)}
      className={`cursor-pointer rounded-xl border border-gray-100 bg-white p-4 hover:shadow-md dark:border-zinc-700/50 dark:bg-zinc-800/90 dark:hover:bg-zinc-800/100 ${
        isDragging
          ? "z-50 rotate-1 scale-[1.02] shadow-xl ring-2 ring-emerald-400/40"
          : "shadow-sm transition-all"
      }`}
    >
      {/* Top row: company + remote/on-site badge */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-2 overflow-hidden mr-2">
          <p className="truncate text-[11px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {job.company_name}
          </p>
          {job.status === "applied" && (
            <span className={`shrink-0 rounded-[4px] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
              job.application_outcome === "accepted"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                : job.application_outcome === "rejected"
                ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                : "bg-gray-100 text-gray-600 dark:bg-zinc-700 dark:text-zinc-300"
            }`}>
              {job.application_outcome}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {job.is_remote ? (
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-500 dark:text-emerald-400">
              <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="6" r="4" />
                <path d="M1.5 14c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" strokeLinecap="round" />
              </svg>
              Remote
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-zinc-500">
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
              On-site
            </span>
          )}
        </div>
      </div>

      {/* Job title */}
      <h3 className="mt-1.5 text-sm font-semibold leading-snug text-gray-900 dark:text-zinc-50">
        {job.job_title}
      </h3>

      {/* Tags */}
      {job.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-gray-100/80 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-zinc-700/50 dark:text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom: salary + time ago */}
      <div className="mt-3 flex items-center justify-between">
        {job.salary_range ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
            $ {job.salary_range}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-0.5 text-[11px] italic text-gray-500 dark:bg-zinc-800/50 dark:text-zinc-400">
            Salary not specified
          </span>
        )}
        <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-zinc-500">
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="6" />
            <path d="M8 5v3l2 2" strokeLinecap="round" />
          </svg>
          {timeAgo(job.created_at)}
        </span>
      </div>
    </div>
  );
});
