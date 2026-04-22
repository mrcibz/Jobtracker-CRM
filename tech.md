# Technical Documentation: Job Tracker CRM

This document provides a deep dive into the technical architecture, data flows, and engineering decisions behind the Job Tracker CRM.

## 1. Database Architecture & Flow

The project leverages **Supabase (PostgreSQL)** as its core data engine. The schema is designed for relational integrity and low-latency access.

### Data Model
- **`boards`**: The top-level container for a job search process.
- **`jobs`**: Individual opportunities. Each job belongs to a board via a `board_id` foreign key.
- **Enums**: We use Postgres enums (`job_status`, `application_outcome`) to ensure data consistency at the database level, preventing invalid states from being persisted.

### Server-Side Logic (Triggers)
We offload some business logic to the database to ensure it runs regardless of which client (Web, Mobile, or direct API) modifies the data:
- **`jobs_set_updated_at`**: Automatically keeps the `updated_at` timestamp in sync.
- **`jobs_promote_on_accepted`**: A specialized trigger that monitors the `application_outcome`. If a job is marked as `accepted` (e.g., the application was accepted by the company), it automatically moves the status to `interview`. This ensures the Kanban board reflects the reality of the process without extra client-side code.

### Security (RLS)
We use **Row Level Security (RLS)** to ensure users can only access their own boards. Every query is scoped by `board_id`, and the database enforces these policies at the engine level.

---

## 2. Job Filtering Logic (Under the Hood)

The filtering system is implemented entirely on the **client-side** for maximum responsiveness.

### How it works:
1. **Source of Truth**: The `jobs` state in `KanbanBoard.tsx` contains the full list of offers for the current board.
2. **Filtering Pipeline**: On every render, a `filteredJobs` array is computed:
   - **Status Filter**: Checks if the job's `status` matches the `activeFilter` tab.
   - **Search Filter**: Performs a case-insensitive search across three fields: `company_name`, `job_title`, and the `tags` array.
3. **Grouping**: Once filtered, the jobs are grouped by their `status` into a `jobsByStatus` dictionary. This dictionary is then mapped to the four Kanban columns.

---

## 3. Technical Decisions & Rationale

### Next.js App Router & Server Components
We chose the **App Router** to benefit from Server Components. The initial data fetch happens on the server (`app/crm/[id]/page.tsx`), reducing the "Initial Script Value" and avoiding loading spinners on first entry.

### Server Actions
Instead of traditional API routes, we use **Server Actions** (`actions.ts`). 
- **Pros**: Type-safety across client/server, automatic CSRF protection, and simplified code structure.
- **Flow**: When you update a job, the client calls the action, the server updates the DB, and then calls `revalidatePath`.

### @dnd-kit/react
For the Kanban experience, we use `@dnd-kit`. Unlike older libraries, it's modular, supports touch/keyboard accessibility, and doesn't require a specific DOM structure, allowing us to keep our Tailwind layouts clean.

---

## 4. Performance Investigation: The "Lag" Issue

You noticed a "lag" or "freeze" during drag-and-drop. From a programmer's perspective, here is what's happening:

### The Root Causes:
1. **The `revalidatePath` Cycle (Main Culprit)**:
   When a card is dropped, we call `updateJobStatus` (a Server Action). Inside that action, we call `revalidatePath`. This tells Next.js to **re-render the entire page on the server** and send the new data back to the client. Even though we update the UI optimistically, the browser has to handle a heavy "Flight" response from the server, causing a momentary freeze as React reconciles the entire board structure.

2. **Re-rendering Bottleneck**:
   The `KanbanBoard` component does not use `useMemo` for `filteredJobs` or `jobsByStatus`. This means on every single update (even unrelated ones), the filtering and grouping logic runs again. 
   Furthermore, the `JobCard` components are not memoized. If you have 50 cards and move one, React re-evaluates all 50 cards to check for changes.

3. **Time Calculations**:
   The `timeAgo` function is called inside every `JobCard` on every render. While fast, generating hundreds of `Date` objects and performing string manipulations during a high-frequency event like a drag operation contributes to the "jank."

### Recommendation for Fluidity:
- Use `useMemo` for filtering and grouping logic.
- Wrap `JobCard` in `React.memo()`.
- Consider removing `revalidatePath` from the DND action if the client state is already in sync, or move to a more granular update strategy.

---

## 5. Summary of Technical Flow
1. **Initial Load**: Server fetches `jobs` -> Hydrates `KanbanBoard`.
2. **Interaction**: User types in search or clicks a tab -> `filteredJobs` re-computes -> UI updates.
3. **Mutation (DND)**: 
   - `onDragEnd` triggers.
   - Local state `jobs` updates immediately (Optimistic UI).
   - Server Action `updateJobStatus` is called.
   - Database is updated.
   - Server signals a revalidation -> Browser receives new data sync -> Final reconciliation.

---

## 6. Solución Definitiva: Congelación y Error de React 19 (`useInsertionEffect`)

Para eliminar la congelación y solucionar el error *`useInsertionEffect must not schedule updates`* (especialmente visible al mover cartas rápidamente), se implementaron las siguientes optimizaciones profundas:

### 1. Eliminación del Conflicto CSS-JS (Causa principal de la congelación al arrastrar)
*   **Problema**: `@dnd-kit/react` (en beta) actualiza las transformaciones del DOM (`transform`) constantemente durante el drag mediante JavaScript. Sin embargo, en `JobCard` se estaba aplicando la clase `transition-all` de Tailwind permanentemente. Esto provocaba que el navegador intentara aplicar una transición CSS *encima* de cada actualización instantánea de JavaScript, lo que creaba una lucha de cálculos que hundía los FPS (un efecto "goma" o congelación).
*   **Solución**: Se modificó `JobCard.tsx` para que la clase `transition-all` **solo se aplique cuando la tarjeta NO se está arrastrando**. Durante el drag, se desactiva la transición CSS, permitiendo que el JavaScript mueva la tarjeta de forma instantánea a 60 FPS sin resistencia.

### 2. Desacople del Ciclo de Vida de Eventos (Fix para `useInsertionEffect`)
*   **Problema**: En React 19, el hook `useInsertionEffect` (usado internamente por librerías como dnd-kit para inyectar estilos) es muy estricto y prohíbe las actualizaciones de estado (como `setJobs`) dentro de su ciclo de ejecución. Si se arrastran muchas tarjetas rápido, el evento `onDragEnd` colisionaba con los ciclos de limpieza internos de la librería, lanzando el error `useInsertionEffect must not schedule updates`.
*   **Solución**: En lugar de llamar a `setJobs` síncronamente o dentro de un `setTimeout`, lo envolvimos en `requestAnimationFrame(() => { ... })`. Esto saca la actualización de estado fuera del ciclo de inserción/limpieza de React y la programa de manera segura justo antes de que el navegador pinte el siguiente frame, logrando la máxima fluidez.

### 3. Memoización Estricta (Custom Equality Check)
*   **Problema**: Aunque habíamos usado `React.memo` en `KanbanColumn`, cada vez que se movía una carta, el componente padre `KanbanBoard` generaba **nuevos arrays** para cada columna, por lo que React siempre veía "nuevas referencias" de props (`prevProps.jobs !== nextProps.jobs`) y forzaba el renderizado de todas las columnas de igual modo.
*   **Solución**: Se implementó una **función de comparación personalizada** profunda dentro del `React.memo` de `KanbanColumn`. Esta función compara las referencias de las tarjetas una por una (shallow compare). Así, si las tarjetas de una columna no han cambiado, React ignora esa columna por completo durante el Drag & Drop.

### 4. Transiciones No Bloqueantes (`startTransition`)
*   **Problema**: Llamar a una *Server Action* (`updateJobStatus`) que a su vez llama a `revalidatePath` provocaba un recálculo masivo en el cliente cuando el servidor devolvía el nuevo estado RSC (React Server Component) de la página.
*   **Solución**: Se envolvió la llamada de servidor dentro de un `startTransition()`. Esto le indica a React que la reconciliación del DOM resultante de la actualización del servidor es de **baja prioridad**, asegurando que el hilo principal (UI Thread) no se bloquee ni congele, manteniendo la interactividad fluida.
