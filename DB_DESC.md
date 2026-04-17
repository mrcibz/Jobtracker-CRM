# Database Schema: JobTracker CRM

## Table: boards
This table stores the unique sessions for each user. Access is granted via the UUID.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique identifier for the CRM session. |
| `created_at` | Timestamp | When the board was generated. |

---

## Table: jobs
This table stores every job opportunity added to a specific board.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique identifier for the job entry. |
| `board_id` | UUID (FK) | Reference to the parent board. |
| `company_name` | String | Name of the company. |
| `company_url` | String (URL) | Website or LinkedIn profile of the company. |
| `contact_email` | String (Email) | Direct contact for HR or hiring manager. |
| `contact_phone` | String | Phone number for follow-ups. |
| `job_title` | String | Role/Position title (e.g., Frontend Developer). |
| `location` | String | Physical location or "Remote". |
| `status` | Enum | Current stage: `watchlist`, `applied`, `interview`, `offer`. |
| `notes` | Text | Detailed comments and interview brain-dumps. |
| `salary_range` | String | Expected or offered salary (e.g., "30k-40k"). |
| `next_action_date` | Date | Scheduled date for the next interview or follow-up. |
| `created_at` | Timestamp | When the entry was added. |
| `updated_at` | Timestamp | Last time the entry was modified. |

Cambios en la Lógica de Negocio
Nuevo Campo: Añadiremos application_outcome a la tabla jobs.

Valores: pending (por defecto), accepted, rejected.

Transición Automática: En la interfaz, si el usuario marca una tarjeta como accepted, el sistema actualizará automáticamente el status principal a interview.