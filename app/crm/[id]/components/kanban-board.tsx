"use client";

import { useState, useCallback, useRef, useMemo, useEffect, startTransition } from "react";
import Link from "next/link";
import { DragDropProvider } from "@dnd-kit/react";
import type { Job, JobStatus, ApplicationOutcome } from "@/lib/types";
import { KANBAN_COLUMNS } from "@/lib/types";
import { KanbanColumn } from "./kanban-column";
import { AddOfferModal } from "./add-offer-modal";
import { ScheduleInterviewModal } from "./schedule-interview-modal";
import { OfferModal } from "./offer-modal";
import { createJob, updateJobStatus, updateJob } from "../actions";
import { JobDetailDrawer } from "./job-detail-drawer";

const VALID_STATUSES: JobStatus[] = ["wishlist", "applied", "interview", "offer"];

interface KanbanBoardProps {
  boardId: string;
  initialJobs: Job[];
}

export function KanbanBoard({ boardId, initialJobs }: KanbanBoardProps) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [interviewModalJob, setInterviewModalJob] = useState<Job | null>(null);
  const [offerModalJob, setOfferModalJob] = useState<Job | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | JobStatus>("all");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const pendingDrags = useRef<Set<string>>(new Set());
  const originalJobRef = useRef<Map<string, Job>>(new Map());

  // On mobile, "All" is hidden. If current filter is "all" on small screens, default to wishlist.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (activeFilter === "all" && window.innerWidth < 768) {
      setActiveFilter("wishlist");
    }
  }, []);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
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
  }, [jobs, activeFilter, search]);

  // Group by status
  const jobsByStatus = useMemo(() => {
    const grouped: Record<JobStatus, Job[]> = {
      wishlist: [],
      applied: [],
      interview: [],
      offer: [],
    };
    for (const job of filteredJobs) {
      grouped[job.status].push(job);
    }
    return grouped;
  }, [filteredJobs]);

  const handleCardClick = useCallback((job: Job) => {
    setSelectedJob(job);
  }, []);

  const handleCopyBoardId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(boardId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback for clipboard blocked
      const ta = document.createElement("textarea");
      ta.value = boardId;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [boardId]);

  const handleAdd = useCallback(
    async (formData: FormData) => {
      const tagsRaw = formData.get("tags") as string;
      const tags = tagsRaw ? JSON.parse(tagsRaw) : [];
      const status = (formData.get("status") as JobStatus) || "wishlist";

      const tempJob: Job = {
        id: crypto.randomUUID(),
        board_id: boardId,
        company_name: formData.get("company_name") as string,
        job_title: formData.get("job_title") as string,
        company_url: (formData.get("company_url") as string) || null,
        contact_email: (formData.get("contact_email") as string) || null,
        contact_phone: (formData.get("contact_phone") as string) || null,
        location: null,
        status,
        application_outcome: "pending",
        notes: (formData.get("notes") as string) || null,
        salary_range: (formData.get("salary_range") as string) || null,
        offer_salary: null,
        next_action_date: null,
        interview_date: null,
        offer_deadline: null,
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

  const moveJob = useCallback((jobId: string, newStatus: JobStatus) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job || job.status === newStatus) return;

    pendingDrags.current.add(jobId);

    const leavingInterview = job.status === "interview" && newStatus !== "interview";
    const leavingOffer = job.status === "offer" && newStatus !== "offer";
    const enteringInterview = newStatus === "interview";
    const enteringOffer = newStatus === "offer";

    const cleanNotes = (leavingInterview || leavingOffer)
      ? (job.notes
          ? job.notes.replace(/\n?\n?--- (Interview Prep|Offer Details) ---\n[\s\S]*$/, "").trim() || null
          : null)
      : job.notes;

    const cleanedJob: Job = {
      ...job,
      status: newStatus,
      ...(leavingInterview ? { interview_date: null } : {}),
      ...(leavingOffer ? { offer_salary: null, offer_deadline: null } : {}),
      notes: cleanNotes,
    };

    setJobs((prev) => prev.map((j) => (j.id === jobId ? cleanedJob : j)));

    if (enteringInterview || enteringOffer) {
      originalJobRef.current.set(jobId, job);
      if (enteringInterview) setInterviewModalJob(cleanedJob);
      else setOfferModalJob(cleanedJob);
      return;
    }

    if (leavingInterview || leavingOffer) {
      startTransition(() => {
        updateJob(jobId, boardId, {
          status: newStatus,
          ...(leavingInterview ? { interview_date: null } : {}),
          ...(leavingOffer ? { offer_salary: null, offer_deadline: null } : {}),
          notes: cleanNotes,
        }).finally(() => {
          pendingDrags.current.delete(jobId);
        });
      });
      return;
    }

    startTransition(() => {
      updateJobStatus(jobId, boardId, newStatus).finally(() => {
        pendingDrags.current.delete(jobId);
      });
    });
  }, [jobs, boardId]);

  return (
    <>
      {/* ─── Navbar ─── */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-3 py-3 sm:px-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white">
              <img src="../favicon.ico" alt="favicon" />
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-zinc-50">Job Tracker</span>
          </Link>
          <span className="hidden text-gray-300 sm:inline dark:text-zinc-600">/</span>
          <span className="hidden text-sm text-gray-600 sm:inline dark:text-zinc-400">My Job Search</span>
          <span className="text-xs text-gray-400 dark:text-zinc-500">{jobs.length} offers</span>
          <button
            onClick={handleCopyBoardId}
            title="Copy board ID to clipboard"
            className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-all ${
              copied
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300"
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {copied ? (
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 10l3 3 7-7" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="7" y="7" width="10" height="10" rx="2" />
                <path d="M13 7V5a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2" />
              </svg>
            )}
            <span className="hidden sm:inline">{copied ? "Copied!" : "Copy board ID"}</span>
            <span className="sm:hidden">{copied ? "Copied" : "ID"}</span>
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
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

          <button
            onClick={() => setAddModalOpen(true)}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-violet-700 sm:px-4"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M8 3v10M3 8h10" />
            </svg>
            <span className="hidden sm:inline">Add Job</span>
          </button>
        </div>
      </header>

      {/* ─── Filter tabs ─── */}
      <div className="border-b border-gray-200 bg-white px-3 py-2 sm:px-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-1 overflow-x-auto">
          {(["all", ...VALID_STATUSES] as const).map((filter) => {
            const count = filter === "all" ? jobs.length : jobs.filter((j) => j.status === filter).length;
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  filter === "all" ? "hidden md:inline-flex" : "inline-flex"
                } ${
                  isActive
                    ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                <span className="text-[10px] font-semibold opacity-60">{count}</span>
              </button>
            );
          })}
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
          requestAnimationFrame(() => moveJob(jobId, newStatus!));
        }}
      >
        <div className="flex flex-col gap-1 overflow-y-auto px-2 md:flex-row md:overflow-x-auto" style={{ maxHeight: "calc(100vh - 110px)" }}>
          {KANBAN_COLUMNS.map(({ status, label, dot }) => {
            // Mobile: show only active column. Desktop: always show (grid).
            const mobileVisible = activeFilter === status;
            return (
              <div
                key={status}
                className={`${mobileVisible ? "flex" : "hidden"} w-full flex-col md:flex md:w-auto md:flex-1`}
              >
                <KanbanColumn
                  status={status}
                  label={label}
                  dotColor={dot}
                  jobs={jobsByStatus[status]}
                  onCardClick={handleCardClick}
                  onAddClick={() => openAddModal(status)}
                />
              </div>
            );
          })}
        </div>
      </DragDropProvider>

      <AddOfferModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAdd}
      />

      <ScheduleInterviewModal
        open={!!interviewModalJob}
        job={interviewModalJob}
        onClose={() => {
          if (!interviewModalJob) return;
          // Cancel: restore full original job (status + any cleared fields)
          const original = originalJobRef.current.get(interviewModalJob.id);
          if (original) {
            setJobs((prev) => prev.map((j) => (j.id === interviewModalJob.id ? original : j)));
            originalJobRef.current.delete(interviewModalJob.id);
          }
          pendingDrags.current.delete(interviewModalJob.id);
          setInterviewModalJob(null);
        }}
        onSave={(jobId, interviewDate, updatedNotes) => {
          // If promoted from applied, auto-accept the outcome
          const original = originalJobRef.current.get(jobId);
          const autoAccept = original?.status === "applied";
          const outcomePatch = autoAccept ? { application_outcome: "accepted" as ApplicationOutcome } : {};

          updateJob(jobId, boardId, {
            status: "interview",
            interview_date: interviewDate,
            notes: updatedNotes,
            ...outcomePatch,
          }).finally(() => {
            pendingDrags.current.delete(jobId);
          });
          setJobs((prev) =>
            prev.map((j) => (j.id === jobId ? { ...j, interview_date: interviewDate, notes: updatedNotes, status: "interview", ...outcomePatch } : j))
          );
          originalJobRef.current.delete(jobId);
          setInterviewModalJob(null);
        }}
      />

      <OfferModal
        open={!!offerModalJob}
        job={offerModalJob}
        onClose={() => {
          if (!offerModalJob) return;
          // Cancel: restore full original job (status + any cleared fields)
          const original = originalJobRef.current.get(offerModalJob.id);
          if (original) {
            setJobs((prev) => prev.map((j) => (j.id === offerModalJob.id ? original : j)));
            originalJobRef.current.delete(offerModalJob.id);
          }
          pendingDrags.current.delete(offerModalJob.id);
          setOfferModalJob(null);
        }}
        onSave={(jobId, offerSalary, offerDeadline, updatedNotes) => {
          // Save: apply DB update and update local UI
          updateJob(jobId, boardId, { status: "offer", offer_salary: offerSalary, offer_deadline: offerDeadline, notes: updatedNotes }).finally(() => {
            pendingDrags.current.delete(jobId);
          });
          setJobs((prev) =>
            prev.map((j) => (j.id === jobId ? { ...j, offer_salary: offerSalary, offer_deadline: offerDeadline, notes: updatedNotes, status: "offer" } : j))
          );
          originalJobRef.current.delete(jobId);
          setOfferModalJob(null);
        }}
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
          onDeleted={(deletedId) => {
            setJobs((prev) => prev.filter((j) => j.id !== deletedId));
            setSelectedJob(null);
          }}
          onMove={(jobId, newStatus) => {
            moveJob(jobId, newStatus);
            setSelectedJob(null);
          }}
        />
      )}
    </>
  );
}
