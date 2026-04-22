# Plan: CRM Interface Implementation

## Current State
- Homepage (`/`) done — gateway with Create/Open buttons
- DB schema done — `boards` + `jobs` tables with migrations in Supabase
- `@dnd-kit/react@0.4.0` installed
- `supabase` CLI installed, but **no `@supabase/supabase-js` client** — needs install
- No routes exist beyond `/`
- Next.js 16.2.3 — `params` is `Promise<>`, must `await`

---

## Phase 1: Supabase Client Setup

### 1.1 Install `@supabase/supabase-js`
```bash
pnpm add @supabase/supabase-js
```

### 1.2 Create Supabase client utility
- `lib/supabase/client.ts` — browser client (uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` + `SUPABASE_URL`)
- `lib/supabase/server.ts` — server client (uses `SUPABASE_ANON_KEY` or service role for server actions)

### 1.3 Type definitions
- `lib/types.ts` — TypeScript types matching DB schema (`Board`, `Job`, `JobStatus`, `ApplicationOutcome`)

---

## Phase 2: Dynamic Route `/crm/[id]`

### 2.1 Route structure
```
app/
  crm/
    [id]/
      page.tsx      ← Server Component: validates UUID, fetches board + jobs
      loading.tsx   ← Skeleton while board loads
      not-found.tsx ← Invalid/missing board UUID
```

### 2.2 Server-side flow
1. `await params` to get `id`
2. Query Supabase: fetch board by UUID → 404 if not found
3. Fetch all jobs for `board_id = id`
4. Pass data to client Kanban component

### 2.3 Wire homepage buttons
- **Create board**: Server Action → insert new row in `boards` → `redirect(/crm/${newId})`
- **Open existing**: Client-side `router.push(/crm/${inputValue})`

---

## Phase 3: Kanban Board UI

### 3.1 Component architecture
```
KanbanBoard (client component — dnd-kit provider)
├── KanbanColumn × 4 (watchlist | applied | interview | offer)
│   ├── Column header (title + job count)
│   └── JobCard × N (draggable)
├── QuickAddButton (floating FAB)
└── JobDetailDrawer (slide-up mobile / side panel desktop)
```

### 3.2 Card content per column (minimal info per stage)
| Column     | Card shows                                          |
|------------|-----------------------------------------------------|
| Watchlist  | Company, Role, link icon to `company_url`           |
| Applied    | Company, Role, days since `created_at`, outcome badge (pending/rejected) |
| Interview  | Company, Role, `next_action_date` badge             |
| Offer      | Company, Role, `salary_range`                        |

### 3.3 dnd-kit integration
- `DragDropProvider` wrapping board
- Each column = droppable zone (status value as ID)
- Each card = draggable (job UUID as ID)
- On drop: update `status` field in Supabase
- Business rule: if `application_outcome` set to `accepted` → auto-move to interview (DB trigger handles, but UI should reflect immediately)

### 3.4 Quick-Add flow
- Floating "+" button
- Modal/popover with 3 fields: **Role**, **Company**, **URL**
- Inserts into Supabase with `status: 'watchlist'`
- Optimistic UI: card appears immediately

### 3.5 Detail Drawer
- Click card → drawer opens
- Mobile: slides up from bottom
- Desktop: side panel from right
- Editable fields: status dropdown, contact email/phone, location, salary, notes, next action date
- Save on blur or explicit save button

---

## Phase 4: Data Mutations (Server Actions)

### 4.1 Actions needed
| Action            | Input                        | Effect                              |
|-------------------|------------------------------|-------------------------------------|
| `createBoard`     | (none)                       | Insert board → return UUID          |
| `createJob`       | board_id, company, role, url | Insert job (watchlist default)      |
| `updateJobStatus` | job_id, new status           | Update status column                |
| `updateJob`       | job_id, partial fields       | Update any job fields               |
| `deleteJob`       | job_id                       | Delete job row                      |

### 4.2 File location
- `app/crm/[id]/actions.ts` — all server actions scoped to CRM route

---

## Execution Order
1. **Phase 1** → Supabase client + types
2. **Phase 2** → Dynamic route + homepage wiring (testable: create board → see empty board page)
3. **Phase 4** → Server actions (needed before UI)
4. **Phase 3** → Kanban UI + dnd-kit + Quick-Add + Detail Drawer

---

## Decisions to discuss before implementation
- [ ] RLS policies: currently enabled but no policies defined — public access by UUID? Or add anon SELECT/INSERT/UPDATE policies filtered by `board_id`?
- [ ] Realtime: do we want Supabase Realtime subscriptions for multi-tab sync?
- [ ] Delete jobs: include delete functionality? (not mentioned in PROJECT_DESC)
- [ ] Board expiry: should boards auto-delete after X days of inactivity?
