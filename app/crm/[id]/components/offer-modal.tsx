"use client";

import { useState, useEffect, useTransition } from "react";
import type { Job } from "@/lib/types";

interface OfferModalProps {
  job: Job | null;
  open: boolean;
  onClose: () => void;
  onSave: (jobId: string, offerSalary: string, offerDeadline: string, updatedNotes: string) => void;
}

const inputClass =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-zinc-700 dark:bg-zinc-800 dark:placeholder:text-zinc-500 dark:focus:border-violet-400 dark:focus:ring-violet-400/10";

export function OfferModal({ job, open, onClose, onSave }: OfferModalProps) {
  const [offerSalary, setOfferSalary] = useState("");
  const [offerDeadline, setOfferDeadline] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open && job) {
      setOfferSalary(job.offer_salary || "");
      setOfferDeadline(job.offer_deadline ? new Date(job.offer_deadline).toISOString().split('T')[0] : "");
      setNewNotes("");
    }
  }, [open, job]);

  if (!open || !job) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!job) return;

    // Format notes by appending them elegantly
    let combinedNotes = job.notes || "";
    if (newNotes.trim()) {
      const divider = combinedNotes ? "\n\n--- Offer Details ---\n" : "--- Offer Details ---\n";
      combinedNotes = combinedNotes + divider + newNotes.trim();
    }

    startTransition(() => {
      onSave(job.id, offerSalary, offerDeadline ? new Date(offerDeadline).toISOString() : "", combinedNotes);
      setOfferSalary("");
      setOfferDeadline("");
      setNewNotes("");
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl sm:p-6 dark:border-zinc-700 dark:bg-zinc-900 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-zinc-50">
          Congratulations on the Offer! 🎉
        </h2>
        <p className="mb-6 text-sm text-gray-500 dark:text-zinc-400">
          You've moved <strong className="font-medium text-gray-700 dark:text-zinc-300">{job.company_name}</strong> to the offer stage. Let's record the details.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="om-salary" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                Offered Salary
              </label>
              <input
                id="om-salary"
                type="text"
                placeholder="e.g. $140k + equity"
                value={offerSalary}
                onChange={(e) => setOfferSalary(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="om-deadline" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                Decision Deadline
              </label>
              <input
                id="om-deadline"
                type="date"
                value={offerDeadline}
                onChange={(e) => setOfferDeadline(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="om-notes" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Offer Notes & Benefits (Optional)
            </label>
            <textarea
              id="om-notes"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              rows={3}
              placeholder="Health insurance, signing bonus, PTO..."
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
              disabled={isPending}
              className="cursor-pointer rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save Offer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
