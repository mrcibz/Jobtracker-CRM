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

  const { data: board } = await supabase
    .from("boards")
    .select("id")
    .eq("id", id)
    .single();

  if (!board) notFound();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("board_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="flex h-screen flex-col bg-gray-50 font-sans text-gray-900 dark:bg-zinc-950 dark:text-zinc-100">
      <KanbanBoard boardId={id} initialJobs={(jobs as Job[]) ?? []} />
    </div>
  );
}
