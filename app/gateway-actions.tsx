"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createBoard } from "@/app/crm/[id]/actions";

export function CreateBoardButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => createBoard())}
      className="group flex h-40 cursor-pointer flex-col items-start justify-between rounded-2xl border border-zinc-900 bg-zinc-900 p-6 text-left text-white shadow-sm ring-0 ring-emerald-500/0 transition-all hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-lg hover:shadow-emerald-500/10 hover:ring-4 hover:ring-emerald-500/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/40 disabled:opacity-60 dark:border-zinc-200 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white dark:hover:shadow-emerald-400/15 dark:hover:ring-emerald-400/30 dark:focus-visible:ring-emerald-400/50"
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xl dark:bg-zinc-900/10">
        {isPending ? (
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
        )}
      </span>
      <div className="flex w-full items-end justify-between">
        <div>
          <p className="text-lg font-semibold">
            {isPending ? "Creating..." : "Create a board"}
          </p>
          <p className="text-sm text-white/70 dark:text-zinc-900/60">
            Generate a unique ID and start now
          </p>
        </div>
        <span className="opacity-0 transition-opacity group-hover:opacity-100" aria-hidden>→</span>
      </div>
    </button>
  );
}

export function OpenBoardForm() {
  const router = useRouter();
  const [boardId, setBoardId] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = boardId.trim();
    if (trimmed) router.push(`/crm/${trimmed}`);
  }

  return (
    <div className="flex h-40 cursor-default flex-col items-start justify-between rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm ring-0 ring-sky-500/0 transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-500/10 hover:ring-4 hover:ring-sky-500/15 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-sky-400/30 dark:hover:shadow-sky-400/10 dark:hover:ring-sky-400/20">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 9h16" />
            <path d="M4 15h16" />
            <path d="M10 3 8 21" />
            <path d="M16 3l-2 18" />
          </svg>
        </span>
        <div>
          <p className="text-lg font-semibold leading-tight">Open existing board</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Paste your board ID to resume
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex w-full items-stretch gap-2.5">
        <label className="sr-only" htmlFor="board-id">Board ID</label>
        <input
          id="board-id"
          type="text"
          value={boardId}
          onChange={(e) => setBoardId(e.target.value)}
          placeholder="Enter your ID"
          autoComplete="off"
          spellCheck={false}
          className="h-11 min-w-0 flex-1 rounded-full border border-zinc-200 bg-white px-4 font-mono text-sm tracking-tight outline-none transition-all placeholder:text-zinc-400 hover:border-zinc-300 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-950 dark:placeholder:text-zinc-500 dark:hover:border-zinc-600 dark:focus:border-zinc-50 dark:focus:ring-zinc-50/10"
        />
        <button
          type="submit"
          className="group/btn inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-zinc-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zinc-900/30 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:ring-zinc-50/30"
        >
          Enter
          <span aria-hidden className="transition-transform group-hover/btn:translate-x-0.5">→</span>
        </button>
      </form>
    </div>
  );
}
