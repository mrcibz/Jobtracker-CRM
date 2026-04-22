// Mirror of DB enums and table shapes.
// Keep in sync with supabase/migrations/.

export type JobStatus = "wishlist" | "applied" | "interview" | "offer";

export type ApplicationOutcome = "pending" | "accepted" | "rejected";

export interface Board {
  id: string;
  created_at: string;
}

export interface Job {
  id: string;
  board_id: string;
  company_name: string;
  company_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  job_title: string;
  location: string | null;
  status: JobStatus;
  application_outcome: ApplicationOutcome;
  notes: string | null;
  salary_range: string | null;
  next_action_date: string | null;
  tags: string[];
  is_remote: boolean;
  created_at: string;
  updated_at: string;
}

// Columns in kanban order
export const KANBAN_COLUMNS: {
  status: JobStatus;
  label: string;
  dot: string;
}[] = [
  { status: "wishlist", label: "Wishlist", dot: "bg-violet-500" },
  { status: "applied", label: "Applied", dot: "bg-orange-400" },
  { status: "interview", label: "Interview", dot: "bg-emerald-500" },
  { status: "offer", label: "Offer", dot: "bg-blue-500" },
];
