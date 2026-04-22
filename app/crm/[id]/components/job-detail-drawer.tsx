"use client";

import { useState, useTransition } from "react";
import type { Job, JobStatus, ApplicationOutcome } from "@/lib/types";
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

  function handleOutcomeChange(newOutcome: ApplicationOutcome) {
    startTransition(async () => {
      await updateJob(job.id, boardId, { application_outcome: newOutcome });
      // If accepted, the DB trigger will promote it to 'interview'. Let's reflect it locally.
      const newStatus = newOutcome === "accepted" && job.status !== "interview" ? "interview" : job.status;
      onUpdated({ ...job, application_outcome: newOutcome, status: newStatus });
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
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputClass} placeholder="hr@company.com" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-zinc-400">Phone</label>
                <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={inputClass} placeholder="+34 600..." />
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
          <div className="space-y-6 text-sm">
            {/* Badges & Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700 capitalize dark:bg-violet-500/20 dark:text-violet-300">
                {job.status}
              </span>
              
              {job.status === "applied" ? (
                <div className="flex items-center gap-1 rounded-md bg-gray-100 p-0.5 dark:bg-zinc-800">
                  <button
                    onClick={() => handleOutcomeChange("pending")}
                    className={`rounded-sm px-2 py-0.5 text-xs font-medium transition-colors ${
                      job.application_outcome === "pending"
                        ? "bg-white text-gray-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                        : "text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => handleOutcomeChange("accepted")}
                    className={`rounded-sm px-2 py-0.5 text-xs font-medium transition-colors ${
                      job.application_outcome === "accepted"
                        ? "bg-emerald-100 text-emerald-800 shadow-sm dark:bg-emerald-500/20 dark:text-emerald-300"
                        : "text-gray-500 hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-400"
                    }`}
                  >
                    Accepted
                  </button>
                  <button
                    onClick={() => handleOutcomeChange("rejected")}
                    className={`rounded-sm px-2 py-0.5 text-xs font-medium transition-colors ${
                      job.application_outcome === "rejected"
                        ? "bg-red-100 text-red-800 shadow-sm dark:bg-red-500/20 dark:text-red-300"
                        : "text-gray-500 hover:text-red-700 dark:text-zinc-400 dark:hover:text-red-400"
                    }`}
                  >
                    Rejected
                  </button>
                </div>
              ) : (
                <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 capitalize dark:bg-zinc-800 dark:text-zinc-300">
                  Outcome: {job.application_outcome}
                </span>
              )}

              {job.is_remote ? (
                <span className="flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="8" cy="6" r="4" />
                    <path d="M1.5 14c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" strokeLinecap="round" />
                  </svg>
                  Remote
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-md bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </svg>
                  On-site
                </span>
              )}
              {job.salary_range ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                  $ {job.salary_range}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 italic dark:bg-zinc-800 dark:text-zinc-400">
                  Salary not specified
                </span>
              )}
            </div>

            {job.tags && job.tags.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {job.tags.map((tag) => (
                    <span key={tag} className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Left Column: Job & Company */}
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">Company & Location</h4>
                  <div className="space-y-2 text-gray-700 dark:text-zinc-300">
                    {job.company_url && (
                      <a href={job.company_url.startsWith('http') ? job.company_url : `https://${job.company_url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 truncate text-violet-600 hover:underline dark:text-violet-400">
                        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                        </svg>
                        <span className="truncate">{job.company_url}</span>
                      </a>
                    )}
                    {job.location ? (
                      <div className="flex items-center gap-2">
                        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <span className="truncate">{job.location}</span>
                      </div>
                    ) : (
                      <div className="text-gray-400 italic">No location specified</div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">Contact Info</h4>
                  <div className="space-y-2 text-gray-700 dark:text-zinc-300">
                    {job.contact_email ? (
                      <div className="flex items-center gap-2">
                        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        <a href={`mailto:${job.contact_email}`} className="truncate hover:underline">{job.contact_email}</a>
                      </div>
                    ) : (
                      <div className="text-gray-400 italic">No email</div>
                    )}
                    {job.contact_phone ? (
                      <div className="flex items-center gap-2">
                        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.54-4.24-7.136-7.136l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        <a href={`tel:${job.contact_phone}`} className="truncate hover:underline">{job.contact_phone}</a>
                      </div>
                    ) : (
                      <div className="text-gray-400 italic">No phone</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Dates & Actions */}
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">Timeline</h4>
                  <div className="space-y-2 text-xs text-gray-700 dark:text-zinc-300">
                    <div className="flex justify-between border-b border-gray-100 pb-1 dark:border-zinc-800">
                      <span className="text-gray-500">Created:</span>
                      <span>{new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1 dark:border-zinc-800">
                      <span className="text-gray-500">Last updated:</span>
                      <span>{new Date(job.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Next action:</span>
                      <span className={job.next_action_date ? "font-medium text-violet-600 dark:text-violet-400" : "italic text-gray-400"}>
                        {job.next_action_date ? new Date(job.next_action_date).toLocaleDateString() : "Not scheduled"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="mt-4 border-t border-gray-100 pt-4 dark:border-zinc-800">
              <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">Notes</h4>
              {job.notes ? (
                <div className="prose prose-sm max-w-none rounded-xl bg-gray-50 p-4 text-gray-700 dark:prose-invert dark:bg-zinc-800/50 dark:text-zinc-300 max-h-48 overflow-y-auto overflow-x-hidden">
                  <p className="m-0 whitespace-pre-wrap break-words">{job.notes}</p>
                </div>
              ) : (
                <p className="italic text-gray-400">No notes added yet. Click edit to add some.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
