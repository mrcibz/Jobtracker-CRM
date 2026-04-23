"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { JobStatus, ApplicationOutcome, WorkMode } from "@/lib/types";

// ── Create a new board and redirect to it ─────────────────────
export async function createBoard() {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("boards")
    .insert({})
    .select("id")
    .single();

  if (error || !data) {
    console.error("createBoard error:", error);
    throw new Error(`Failed to create board: ${error?.message ?? "no data returned"}`);
  }

  redirect(`/crm/${data.id}`);
}

// ── Quick-add a job (lands in Wishlist by default) ───────────
export async function createJob(
  boardId: string,
  formData: FormData
) {
  const supabase = getSupabaseServer();

  const companyName = formData.get("company_name") as string;
  const jobTitle = formData.get("job_title") as string;
  const companyUrl = (formData.get("company_url") as string) || null;
  const contactEmail = (formData.get("contact_email") as string) || null;
  const contactPhone = (formData.get("contact_phone") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const salaryRange = (formData.get("salary_range") as string) || null;
  const status = (formData.get("status") as JobStatus) || "wishlist";
  const rawWorkMode = formData.get("work_mode") as string | null;
  const workMode: WorkMode =
    rawWorkMode === "remote" || rawWorkMode === "hybrid" ? rawWorkMode : "onsite";
  const tagsRaw = formData.get("tags") as string;
  const tags: string[] = tagsRaw ? JSON.parse(tagsRaw) : [];

  const { error } = await supabase.from("jobs").insert({
    board_id: boardId,
    company_name: companyName,
    job_title: jobTitle,
    company_url: companyUrl,
    contact_email: contactEmail,
    contact_phone: contactPhone,
    notes,
    salary_range: salaryRange,
    status,
    work_mode: workMode,
    tags,
  });

  if (error) throw new Error("Failed to create job");

  revalidatePath(`/crm/${boardId}`);
}

// ── Move a card to a different column (drag & drop) ───────────
export async function updateJobStatus(
  jobId: string,
  boardId: string,
  newStatus: JobStatus
) {
  const supabase = getSupabaseServer();

  const { error } = await supabase
    .from("jobs")
    .update({ status: newStatus })
    .eq("id", jobId);

  if (error) throw new Error("Failed to update job status");

  revalidatePath(`/crm/${boardId}`);
}

// ── Update any job fields (detail drawer save) ────────────────
export async function updateJob(
  jobId: string,
  boardId: string,
  fields: {
    company_name?: string;
    company_url?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    job_title?: string;
    location?: string | null;
    status?: JobStatus;
    application_outcome?: ApplicationOutcome;
    notes?: string | null;
    salary_range?: string | null;
    offer_salary?: string | null;
    next_action_date?: string | null;
    interview_date?: string | null;
    offer_deadline?: string | null;
    work_mode?: WorkMode;
  }
) {
  const supabase = getSupabaseServer();

  const { error } = await supabase
    .from("jobs")
    .update(fields)
    .eq("id", jobId);

  if (error) throw new Error("Failed to update job");

  revalidatePath(`/crm/${boardId}`);
}

// ── Delete a job card ─────────────────────────────────────────
export async function deleteJob(jobId: string, boardId: string) {
  const supabase = getSupabaseServer();

  const { error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", jobId);

  if (error) throw new Error("Failed to delete job");

  revalidatePath(`/crm/${boardId}`);
}
