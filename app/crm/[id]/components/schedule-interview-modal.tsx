"use client";

import { useState, useEffect, useTransition } from "react";
import type { Job } from "@/lib/types";

interface ScheduleInterviewModalProps {
  job: Job | null;
  open: boolean;
  onClose: () => void;
  onSave: (jobId: string, interviewDate: string, updatedNotes: string) => void;
}

const inputClass =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-zinc-700 dark:bg-zinc-800 dark:placeholder:text-zinc-500 dark:focus:border-violet-400 dark:focus:ring-violet-400/10";

export function ScheduleInterviewModal({ job, open, onClose, onSave }: ScheduleInterviewModalProps) {
  const [interviewDate, setInterviewDate] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open && job) {
      setInterviewDate("");
      setNewNotes("");
    }
  }, [open, job]);

  if (!open || !job) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!interviewDate || !job) return;

    // We format notes by appending them elegantly
    let combinedNotes = job.notes || "";
    if (newNotes.trim()) {
      const divider = combinedNotes ? "\n\n--- Interview Prep ---\n" : "--- Interview Prep ---\n";
      combinedNotes = combinedNotes + divider + newNotes.trim();
    }

    startTransition(() => {
      onSave(job.id, new Date(interviewDate).toISOString(), combinedNotes);
      setInterviewDate("");
      setNewNotes("");
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl sm:p-6 dark:border-zinc-700 dark:bg-zinc-900 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-zinc-50">
          Schedule Interview
        </h2>
        <p className="mb-6 text-sm text-gray-500 dark:text-zinc-400">
          You've moved <strong className="font-medium text-gray-700 dark:text-zinc-300">{job.company_name}</strong> to the interview stage. Set a date and time.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="si-date" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Date & Time
            </label>
            <input
              id="si-date"
              type="datetime-local"
              required
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="si-notes" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Preparation Notes (Optional)
            </label>
            <textarea
              id="si-notes"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              rows={3}
              placeholder="Questions to ask, topics to review..."
              className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-zinc-700 dark:bg-zinc-800 dark:placeholder:text-zinc-500"
            />
            <p className="mt-1 text-[11px] text-gray-400 dark:text-zinc-500">These notes will be appended to your existing job notes.</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !interviewDate}
              className="cursor-pointer rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-violet-700 disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
