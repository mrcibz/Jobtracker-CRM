import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { Job } from "@/lib/types";
import { KanbanBoard } from "./components/kanban-board";

export default async function CrmPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabaseServer();

  const { data: board, error: boardError } = await supabase
    .from("boards")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (boardError) throw new Error(`Failed to load board: ${boardError.message}`);
  if (!board) notFound();

  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("*")
    .eq("board_id", id)
    .order("created_at", { ascending: true });

  if (jobsError) throw new Error(`Failed to load jobs: ${jobsError.message}`);

  return (
    <div className="flex h-screen flex-col bg-gray-50 font-sans text-gray-900 dark:bg-zinc-950 dark:text-zinc-100">
      <KanbanBoard boardId={id} initialJobs={(jobs as Job[]) ?? []} />
    </div>
  );
}
