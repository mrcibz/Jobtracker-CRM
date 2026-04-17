function Logo({ className = "" }: { className?: string }) {

  

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect x="3" y="3" width="26" height="26" rx="7" className="fill-zinc-900 dark:fill-zinc-50" />
      <rect x="8" y="9" width="4" height="14" rx="1.2" className="fill-emerald-400" />
      <rect x="14" y="9" width="4" height="9" rx="1.2" className="fill-sky-400" />
      <rect x="20" y="9" width="4" height="5" rx="1.2" className="fill-amber-400" />
    </svg>
  );
}

function Wordmark() {
  return (
    <span className="flex items-baseline text-[15px] font-semibold tracking-tight">
      <span className="text-zinc-900 dark:text-zinc-50">job</span>
      <span className="text-zinc-400 dark:text-zinc-500">/</span>
      <span className="text-zinc-900 dark:text-zinc-50">tracker</span>
      <span className="ml-1 rounded-sm bg-zinc-100 px-1 py-0.5 text-[9px] font-medium uppercase tracking-wider text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        crm
      </span>
    </span>
  );
}

function GithubMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_50%_at_50%_0%,theme(colors.emerald.200/.55),transparent_70%),radial-gradient(50%_40%_at_100%_100%,theme(colors.sky.200/.45),transparent_70%)] dark:[background:radial-gradient(60%_50%_at_50%_0%,theme(colors.emerald.500/.15),transparent_70%),radial-gradient(50%_40%_at_100%_100%,theme(colors.sky.500/.12),transparent_70%)]"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:px-10">
        <div className="flex items-center gap-2.5">
          <Logo className="h-7 w-7" />
          <Wordmark />
        </div>
        <a
          href="https://github.com/mrcibz/Jobtracker-CRM"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-zinc-700 backdrop-blur transition-colors hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:text-zinc-50"
        >
          <GithubMark className="h-3.5 w-3.5" />
          <span>GitHub</span>
          <span aria-hidden className="text-zinc-400 dark:text-zinc-500">↗</span>
        </a>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-10 px-6 py-12 text-center sm:px-10">
        <div className="flex flex-col items-center gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-600 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Zero-friction · No sign-ups
          </span>
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Your job-hunt CRM.
            <br />
            <span className="text-zinc-500 dark:text-zinc-400">One link. No accounts.</span>
          </h1>
          <p className="max-w-xl text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg">
            Spin up a new board instantly or jump back into yours with an ID.
            Like Kahoot, but for your job applications.
          </p>
        </div>

        <div className="grid w-full gap-4 sm:grid-cols-2">
          <button
            type="button"
            className="group flex h-40 flex-col items-start justify-between rounded-2xl border border-zinc-900 bg-zinc-900 p-6 text-left text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xl dark:bg-zinc-900/10">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            <div className="flex w-full items-end justify-between">
              <div>
                <p className="text-lg font-semibold">Create a board</p>
                <p className="text-sm text-white/70 dark:text-zinc-900/60">
                  Generate a unique ID and start now
                </p>
              </div>
              <span className="opacity-0 transition-opacity group-hover:opacity-100" aria-hidden>→</span>
            </div>
          </button>

          <div className="flex h-40 flex-col items-start justify-between rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M15 3h4a2 2 0 0 1 2 2v4" />
                <path d="M21 15v4a2 2 0 0 1-2 2h-4" />
                <path d="M9 21H5a2 2 0 0 1-2-2v-4" />
                <path d="M3 9V5a2 2 0 0 1 2-2h4" />
                <path d="M8 12h8" />
              </svg>
            </span>
            <div className="flex w-full items-stretch gap-2">
              <label className="sr-only" htmlFor="board-id">Board ID</label>
              <input
                id="board-id"
                type="text"
                placeholder="Enter your ID"
                autoComplete="off"
                spellCheck={false}
                className="h-11 flex-1 rounded-full border border-zinc-200 bg-white px-4 font-mono text-sm tracking-tight outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:placeholder:text-zinc-500 dark:focus:border-zinc-50"
              />
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Enter
              </button>
            </div>
          </div>
        </div>

        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-500 dark:text-zinc-500">
          <li className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-emerald-500" /> No passwords
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-sky-500" /> Save the link, it&apos;s yours
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-amber-500" /> Minimal Kanban
          </li>
        </ul>
      </main>

      <footer className="relative z-10 border-t border-zinc-200/60 dark:border-zinc-800/60">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 text-xs text-zinc-500 sm:px-10 dark:text-zinc-500">
          <span>Open Source</span>
          <span>© 2026 JobTracker CRM</span>
        </div>
      </footer>
    </div>
  );
}
