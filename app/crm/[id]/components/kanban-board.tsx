"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { DragDropProvider } from "@dnd-kit/react";
import type { Job, JobStatus } from "@/lib/types";
import { KANBAN_COLUMNS } from "@/lib/types";
import { KanbanColumn } from "./kanban-column";
import { AddOfferModal } from "./add-offer-modal";
import { createJob, updateJobStatus, updateJob } from "../actions";
import { JobDetailDrawer } from "./job-detail-drawer";

const VALID_STATUSES: JobStatus[] = ["watchlist", "applied", "interview", "offer"];

interface KanbanBoardProps {
  boardId: string;
  initialJobs: Job[];
}

export function KanbanBoard({ boardId, initialJobs }: KanbanBoardProps) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | JobStatus>("all");
  const [search, setSearch] = useState("");
  const pendingDrags = useRef<Set<string>>(new Set());

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    if (activeFilter !== "all" && job.status !== activeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        job.company_name.toLowerCase().includes(q) ||
        job.job_title.toLowerCase().includes(q) ||
        job.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Group by status
  const jobsByStatus: Record<JobStatus, Job[]> = {
    watchlist: [],
    applied: [],
    interview: [],
    offer: [],
  };
  for (const job of filteredJobs) {
    jobsByStatus[job.status].push(job);
  }

  const handleCardClick = useCallback((job: Job) => {
    setSelectedJob(job);
  }, []);

  const handleAdd = useCallback(
    async (formData: FormData) => {
      const tagsRaw = formData.get("tags") as string;
      const tags = tagsRaw ? JSON.parse(tagsRaw) : [];
      const status = (formData.get("status") as JobStatus) || "watchlist";

      const tempJob: Job = {
        id: crypto.randomUUID(),
        board_id: boardId,
        company_name: formData.get("company_name") as string,
        job_title: formData.get("job_title") as string,
        company_url: null,
        contact_email: null,
        contact_phone: null,
        location: null,
        status,
        application_outcome: "pending",
        notes: null,
        salary_range: (formData.get("salary_range") as string) || null,
        next_action_date: null,
        tags,
        is_remote: formData.get("is_remote") === "true",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setJobs((prev) => [...prev, tempJob]);
      await createJob(boardId, formData);
    },
    [boardId]
  );

  const openAddModal = useCallback((status?: JobStatus) => {
    setAddModalOpen(true);
  }, []);

  return (
    <>
      {/* ─── Navbar ─── */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white">
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                <rect x="3" y="4" width="3" height="12" rx="1" />
                <rect x="8.5" y="4" width="3" height="8" rx="1" />
                <rect x="14" y="4" width="3" height="5" rx="1" />
              </svg>
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-zinc-50">Job Tracker</span>
          </Link>
          <span className="text-gray-300 dark:text-zinc-600">/</span>
          <span className="text-sm text-gray-600 dark:text-zinc-400">My Job Search</span>
          <span className="text-xs text-gray-400 dark:text-zinc-500">{jobs.length} offers</span>
        </div>

        {/* Search */}
        <div className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 sm:flex dark:border-zinc-700 dark:bg-zinc-800">
          <svg viewBox="0 0 20 20" className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="9" r="6" />
            <path d="M14 14l4 4" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, role, skill..."
            className="w-56 bg-transparent text-sm outline-none placeholder:text-gray-400 dark:placeholder:text-zinc-500"
          />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-violet-700"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M8 3v10M3 8h10" />
            </svg>
            Add Offer
          </button>
        </div>
      </header>

      {/* ─── Filter tabs ─── */}
      <div className="border-b border-gray-200 bg-white px-5 py-2 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-1">
          {(["all", ...VALID_STATUSES] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-all ${
                activeFilter === filter
                  ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Kanban columns ─── */}
      <DragDropProvider
        onDragEnd={(event) => {
          if (event.canceled) return;
          const { source, target } = event.operation;
          if (!source || !target) return;

          let newStatus: JobStatus | null = null;
          const targetId = String(target.id);

          if (VALID_STATUSES.includes(targetId as JobStatus)) {
            newStatus = targetId as JobStatus;
          } else {
            const targetJob = jobs.find((j) => j.id === targetId);
            if (targetJob) newStatus = targetJob.status;
          }

          if (!newStatus) return;
          const jobId = String(source.id);
          const job = jobs.find((j) => j.id === jobId);
          if (!job || job.status === newStatus) return;

          pendingDrags.current.add(jobId);
          setJobs((prev) =>
            prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
          );
          updateJobStatus(jobId, boardId, newStatus).finally(() => {
            pendingDrags.current.delete(jobId);
          });
        }}
      >
        <div className="flex gap-1 overflow-x-auto overflow-y-auto px-2" style={{ maxHeight: "calc(100vh - 110px)" }}>
          {KANBAN_COLUMNS.map(({ status, label, dot }) => (
            <KanbanColumn
              key={status}
              status={status}
              label={label}
              dotColor={dot}
              jobs={jobsByStatus[status]}
              onCardClick={handleCardClick}
              onAddClick={() => openAddModal(status)}
            />
          ))}
        </div>
      </DragDropProvider>

      <AddOfferModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAdd}
      />

      {/* ─── Detail drawer ─── */}
      {selectedJob && (
        <JobDetailDrawer
          job={selectedJob}
          boardId={boardId}
          onClose={() => setSelectedJob(null)}
          onUpdated={(updated) => {
            setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
            setSelectedJob(updated);
          }}
        />
      )}
    </>
  );
}
