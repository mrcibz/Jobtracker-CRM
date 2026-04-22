"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import type { JobStatus } from "@/lib/types";
import { KANBAN_COLUMNS } from "@/lib/types";

interface AddOfferModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (formData: FormData) => void;
}

const inputClass =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-zinc-700 dark:bg-zinc-800 dark:placeholder:text-zinc-500 dark:focus:border-violet-400 dark:focus:ring-violet-400/10";

export function AddOfferModal({ open, onClose, onAdd }: AddOfferModalProps) {
  const [isPending, startTransition] = useTransition();
  const [stage, setStage] = useState<JobStatus>("wishlist");
  const [isRemote, setIsRemote] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [offerNotes, setOfferNotes] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      firstInputRef.current?.focus();
      setStage("wishlist");
      setIsRemote(false);
      setTagInput("");
      setTags([]);
      setShowMore(false);
      setContactPerson("");
      setContactPhone("");
      setContactEmail("");
      setOfferNotes("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);
    formData.set("status", stage);
    formData.set("is_remote", String(isRemote));
    formData.set("tags", JSON.stringify(tags));
    if (contactEmail) formData.set("contact_email", contactEmail);
    if (contactPhone) formData.set("contact_phone", contactPhone);
    if (offerNotes) formData.set("notes", offerNotes);

    startTransition(() => {
      onAdd(formData);
      form.reset();
      setTags([]);
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
            Add New Offer
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Stage selector */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Stage
            </label>
            <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-zinc-700 dark:bg-zinc-800">
              {KANBAN_COLUMNS.map(({ status, label }) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStage(status)}
                  className={`flex-1 cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    stage === status
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <label htmlFor="ao-company" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Company
            </label>
            <input
              ref={firstInputRef}
              id="ao-company"
              name="company_name"
              required
              placeholder="e.g. Stripe"
              className={inputClass}
            />
          </div>

          {/* Job Title */}
          <div>
            <label htmlFor="ao-title" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Job Title
            </label>
            <input
              id="ao-title"
              name="job_title"
              required
              placeholder="e.g. Senior Frontend Engineer"
              className={inputClass}
            />
          </div>

          {/* Salary + Remote */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="ao-salary" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                Salary Range
              </label>
              <input
                id="ao-salary"
                name="salary_range"
                placeholder="$100k-$130k"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                Remote
              </label>
              <button
                type="button"
                onClick={() => setIsRemote(!isRemote)}
                className={`flex h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-all ${
                  isRemote
                    ? "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-500/40 dark:bg-violet-500/15 dark:text-violet-300"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="6" r="4" />
                  <path d="M1.5 14c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" strokeLinecap="round" />
                </svg>
                {isRemote ? "Yes" : "No"}
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="ao-tags" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Skills / Tags
            </label>
            <div className="flex gap-2">
              <input
                id="ao-tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Type and press Enter"
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={addTag}
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:text-zinc-300"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M8 3v10M3 8h10" />
                </svg>
              </button>
            </div>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                    >
                      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor">
                        <path d="M3.47 3.47a.67.67 0 01.94 0L6 5.06l1.59-1.59a.67.67 0 01.94.94L6.94 6l1.59 1.59a.67.67 0 01-.94.94L6 6.94 4.41 8.53a.67.67 0 01-.94-.94L5.06 6 3.47 4.41a.67.67 0 010-.94z" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* More details collapsible */}
          <div>
            <button
              type="button"
              onClick={() => setShowMore(!showMore)}
              className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              <svg
                viewBox="0 0 16 16"
                className={`h-3.5 w-3.5 transition-transform ${showMore ? "rotate-90" : ""}`}
                fill="currentColor"
              >
                <path d="M6 3l5 5-5 5V3z" />
              </svg>
              More details
            </button>

            {showMore && (
              <div className="mt-3 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
                {/* Contact Person */}
                <div>
                  <label htmlFor="ao-contact-person" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                    Contact Person
                  </label>
                  <input
                    id="ao-contact-person"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Jane Smith, HR Manager"
                    className={inputClass}
                  />
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="ao-email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                      Email
                    </label>
                    <input
                      id="ao-email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="hr@company.com"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="ao-phone" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                      Phone
                    </label>
                    <input
                      id="ao-phone"
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+34 600..."
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="ao-notes" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                    Notes
                  </label>
                  <textarea
                    id="ao-notes"
                    value={offerNotes}
                    onChange={(e) => setOfferNotes(e.target.value)}
                    rows={3}
                    placeholder="Interview prep, tech stack, recruiter notes..."
                    className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-zinc-700 dark:bg-zinc-800 dark:placeholder:text-zinc-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
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
              className="cursor-pointer rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-violet-700 disabled:opacity-60"
            >
              {isPending ? "Adding..." : "Add Offer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
