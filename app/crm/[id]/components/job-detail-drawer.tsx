"use client";

import { useState, useTransition } from "react";
import type { Job, JobStatus } from "@/lib/types";
import { KANBAN_COLUMNS } from "@/lib/types";
import { updateJob } from "../actions";

const inputClass =
  "h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-zinc-700 dark:bg-zinc-800 dark:placeholder:text-zinc-500 dark:focus:border-violet-400 dark:focus:ring-violet-400/10";

interface JobDetailDrawerProps {
  job: Job;
  boardId: string;
  onClose: () => void;
  onUpdated: (job: Job) => void;
}

export function JobDetailDrawer({ job, boardId, onClose, onUpdated }: JobDetailDrawerProps) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Edit form state
  const [status, setStatus] = useState<JobStatus>(job.status);
  const [companyName, setCompanyName] = useState(job.company_name);
  const [jobTitle, setJobTitle] = useState(job.job_title);
  const [salaryRange, setSalaryRange] = useState(job.salary_range ?? "");
  const [isRemote, setIsRemote] = useState(job.is_remote);
  const [contactEmail, setContactEmail] = useState(job.contact_email ?? "");
  const [contactPhone, setContactPhone] = useState(job.contact_phone ?? "");
  const [notes, setNotes] = useState(job.notes ?? "");
  const [location, setLocation] = useState(job.location ?? "");

  function handleSave() {
    startTransition(async () => {
      const fields = {
        status,
        company_name: companyName,
        job_title: jobTitle,
        salary_range: salaryRange || null,
        is_remote: isRemote,
        contact_email: contactEmail || null,
        contact_phone: contactPhone || null,
        notes: notes || null,
        location: location || null,
      };
      await updateJob(job.id, boardId, fields);
      onUpdated({ ...job, ...fields });
      setEditing(false);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-gray-200 bg-white p-6 shadow-2xl sm:rounded-2xl dark:border-zinc-700 dark:bg-zinc-900">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="space-y-2">
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} placeholder="Company" />
                <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className={inputClass} placeholder="Job title" />
              </div>
            ) : (
              <>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{job.company_name}</p>
                <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-zinc-50">{job.job_title}</h2>
              </>
            )}
          </div>
          <div className="ml-3 flex items-center gap-1">
            {/* Pencil edit button */}
            <button
              onClick={() => setEditing(!editing)}
              className={`rounded-lg p-1.5 transition-colors ${
                editing
                  ? "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400"
                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              }`}
              title={editing ? "Cancel editing" : "Edit"}
            >
              <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2.5a2.12 2.12 0 013 3L6 17l-4 1 1-4L14.5 2.5z" />
              </svg>
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800">
              <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="currentColor">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        </div>

        {editing ? (
          /* ─── Edit mode ─── */
          <div className="space-y-4 text-sm">
            {/* Status */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-zinc-400">Status</label>
              <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-zinc-700 dark:bg-zinc-800">
                {KANBAN_COLUMNS.map(({ status: s, label }) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`flex-1 cursor-pointer rounded-md px-2 py-1 text-xs font-medium transition-all ${
                      status === s
                        ? "bg-violet-600 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:text-zinc-400"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Salary + Remote */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-zinc-400">Salary Range</label>
                <input value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} className={inputClass} placeholder="$100k-$130k" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-zinc-400">Remote</label>
                <button
                  type="button"
                  onClick={() => setIsRemote(!isRemote)}
                  className={`flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all ${
                    isRemote
                      ? "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-500/40 dark:bg-violet-500/15 dark:text-violet-300"
                      : "border-gray-200 bg-white text-gray-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {isRemote ? "Yes" : "No"}
                </button>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-zinc-400">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} placeholder="New York, NY" />
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-zinc-400">Email</label>
                <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputClass} placeholder="hr@company.com" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-zinc-400">Phone</label>
                <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={inputClass} placeholder="+34 600..." />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-zinc-400">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Interview prep, tech stack..."
                className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-zinc-700 dark:bg-zinc-800 dark:placeholder:text-zinc-500"
              />
            </div>

            {/* Save */}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="cursor-pointer rounded-lg px-4 py-2 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="cursor-pointer rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-violet-700 disabled:opacity-60"
              >
                {isPending ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        ) : (
          /* ─── View mode ─── */
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-zinc-800 dark:text-zinc-400">{job.status}</span>
              {job.is_remote && (
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-zinc-800 dark:text-zinc-400">Remote</span>
              )}
            </div>
            {job.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {job.tags.map((tag) => (
                  <span key={tag} className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">{tag}</span>
                ))}
              </div>
            )}
            {job.salary_range && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                $ {job.salary_range}
              </span>
            )}
            {job.company_url && (
              <a href={job.company_url} target="_blank" rel="noopener noreferrer" className="block truncate text-violet-600 hover:underline dark:text-violet-400">{job.company_url}</a>
            )}
            {job.contact_email && <p><span className="font-medium text-gray-700 dark:text-zinc-300">Email:</span> {job.contact_email}</p>}
            {job.contact_phone && <p><span className="font-medium text-gray-700 dark:text-zinc-300">Phone:</span> {job.contact_phone}</p>}
            {job.location && <p><span className="font-medium text-gray-700 dark:text-zinc-300">Location:</span> {job.location}</p>}
            {job.notes && (
              <div>
                <p className="font-medium text-gray-700 dark:text-zinc-300">Notes</p>
                <p className="mt-1 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-gray-600 dark:bg-zinc-800/50 dark:text-zinc-400">{job.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
