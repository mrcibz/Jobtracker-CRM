<a href="https://github.com/tu-usuario/jobtracker-crm">
    <img width="1500" height="400" alt="JobTracker CRM Cover" src="/app/opengraph-image.jpg.png" />
</a>

<br/>
<br/>

<div align="center">
    <strong>The zero-friction, Kahoot-style personal CRM for job hunting. No sign-ups. No stress.</strong>
    <br />
    <br />
</div>

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=classic&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=classic&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Deploy-000000?style=classic&logo=vercel&logoColor=white)](https://vercel.com/)

</div>
<br/>

# 🏖️ JobTracker CRM

Job hunting is exhausting enough. You don't need another account, another password, or another complex tool to manage it. 

**JobTracker CRM** is an ultra-lightweight, self-hosted Kanban board that works like a Kahoot game: you either generate a secure session ID with one click, or you enter your existing ID to pick up where you left off. 

## The "Zero-Friction" Flow

We completely removed the traditional landing page and authentication flow. 

### 1. The Gateway (`/`)
When you open the app, you see a clean screen with only two massive buttons:
* **Create a New CRM:** Instantly generates a secure, unique UUID (e.g., `abc-123-xyz`) and drops you into a fresh board. Save the link, and it's yours forever.
* **Enter CRM ID:** Already have a board? Just paste your ID (like a Kahoot PIN) and hit enter.

### 2. The Kanban Board (`/crm/[id]`)
Your job search, visualized. A horizontal, swipable Kanban board featuring four primary stages. To prevent visual clutter and reduce stress, **cards only display the absolute minimum information needed for that specific stage**. You can click on any card to see the full details.

1. **Watchlist:** Jobs you've found but haven't applied to yet.
   * *Card UI shows:* Company Name, Role, and a quick-link icon to jump straight to the job post.
2. **Applied:** CV sent. The waiting game begins.
   * *Card UI shows:* Company Name, Role, Days since applied, and **Outcome Badge** (Pending / Rejected). 
   * *Logic:* If the outcome is updated to **Accepted**, the card automatically migrates to the **Interview** column.
   * *Card UI shows:* Company Name, Role, and "Days since applied" so you know when to follow up.
3. **Interview:** You got a call! (HR screening, tech test, etc.)
   * *Card UI shows:* Company Name, Role, and a highlighted badge with the **Next Interview Date**.
4. **Offer Received:** The finish line.
   * *Card UI shows:* Company Name, Role, and the **Salary Range** (if known) to easily compare offers at a glance.

### 3. The "Quick-Add"
Adding a job takes 5 seconds. Click the floating "➕ Add Job" button and drop in the **Role**, the **Company**, and the **URL**. By default, it lands in your Watchlist. 

### 4. The Magic Detail View
Click on any card to open the detail drawer (slides up on mobile, side panel on desktop). This is your private workspace for that specific opportunity where the minimum information is expanded:
* **Status Dropdown:** Move the card without dragging.
* **Full Contact Info:** HR email and phone number for easy access.
* **Location & Salary:** Remote/Hybrid status and compensation details.
* **The "Brain Dump":** A large text area for notes. Write down recruiter names, tech stacks, or interview prep thoughts.

### 5. Drag & Drop &  supbase client
We will use this toolkit called dnd-kit  for drag & drop interfaces. docs(react) --> https://dndkit.com/react/quickstart/
Supabase client to avoid calling supobase API from server  --> docs: https://supabase.com/docs/reference/javascript/typescript-support
## 1-Click Deploy

Deploy your own private instance in seconds. You own the code, the database, and the data.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tu-usuario/jobtracker-crm)

## Database Architecture

Because we removed user accounts, the database is incredibly simple and fast. Access relies on secure, unguessable UUIDs.

| Table | Purpose | Core Columns |
|------|-------------|-----------------|
| `boards` | Represents a unique CRM instance | `id` (UUID), `created_at` |
| `jobs` | The individual job applications | `id`, `board_id` (FK), `company_name`, `job_title`, `company_url`, `status`, `salary_range`, `next_action_date`, `contact_email`, `contact_phone`, `location`, `notes` |

Cambios en la Lógica de Negocio
Nuevo Campo: Añadiremos application_outcome a la tabla jobs.

Valores: pending (por defecto), accepted, rejected.

Transición Automática: En la interfaz, si el usuario marca una tarjeta como accepted, el sistema actualizará automáticamente el status principal a interview.

### Getting Started (Local Development)

1. Clone this repository: `git clone https://github.com/tu-usuario/jobtracker-crm.git`
2. Install dependencies: `npm install`
3. Copy the `.env.example` file to `.env.local` and add your Supabase credentials.
4. Run the database migrations in your Supabase project to create the `boards` and `jobs` tables.
5. Start the development server: `npm run dev`

## License

MIT License - see [LICENSE](LICENSE)

This project is Open Source. Clone it, tweak it, and use it to land your dream job without the stress.