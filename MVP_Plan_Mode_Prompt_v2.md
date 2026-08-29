# Plan Mode Prompt v2 — Interactive Design Catalogue MVP

> Paste this into Claude Code with **plan mode on** (`Shift+Tab` or `/plan`). Claude Code will return a build plan first. Review it, then let it implement in phases.

---

## Prompt

I'm building an MVP for an **Interactive Design Catalogue** for Vantage Circle (employee recognition platform). It replaces the static PDF catalogue we currently send prospective clients. The app has **two surfaces** that share one codebase and one database:

- **Client surface** — what prospective clients use to explore the catalogue in their own brand
- **Admin surface** — what our internal design team uses to upload templates and review submissions

Produce a detailed implementation plan before writing any code. Build it as a **single Next.js app** with two route groups: `/client/*` and `/admin/*`. Both gated by separate shared passwords (no SSO, no user accounts).

---

### Tech stack — use these unless you have a strong reason not to

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand for client-side state (brand inputs, selections, navigation between steps)
- **Database & Storage:** Supabase (Postgres + Storage + a single `submissions` bucket and `templates` bucket). If you have a strong reason to pick Cloudflare D1 + R2 instead, surface it in the plan.
- **Auth:** Two shared passwords stored as env vars (`CLIENT_PASSWORD`, `ADMIN_PASSWORD`). Checked in middleware. HTTP-only session cookie per surface.
- **Color extraction:** `node-vibrant` or `color-thief` on the server, after logo upload
- **Contrast / readability:** `chroma-js` for luminance checks and darkening primary
- **PDF download:** `@react-pdf/renderer` or Puppeteer — pick one in your plan
- **Hosting:** Vercel
- **Animations on intro page:** Framer Motion + Lottie (Lottie is great for the "fun graphics" requirement)

---

## CLIENT SURFACE — flow and screens

The client opens a shared link, enters the client password, and walks through this flow in order. Each screen is a route under `/client/*`. Progress is preserved in Zustand and persisted to localStorage so a refresh doesn't lose state.

### 1. Introduction screen (`/client/intro`)

- **Purpose:** Brief, friendly explanation of what the catalogue is.
- **Layout:** Hero with playful Lottie or animated SVG graphics. Very short text — **no paragraphs**, just a headline + 3–4 short feature highlights as icon-tile rows (one line each).
- Single CTA button: "Get started" → routes to `/client/brand`.

### 2. Brand setup (`/client/brand`)

- **Logo upload** — drag-and-drop or click-to-upload. PNG, SVG, JPG. Store in Supabase Storage. Trigger color extraction on upload.
- **Auto color extraction** — once the logo is uploaded, run server-side extraction and **automatically set** primary + secondary brand colors. **No color picker tool exposed.** Show the two extracted swatches as info, not as editable controls. (If extraction fails, fall back to safe defaults.)
- **Program name input** — required text field. This is the name of the client's recognition program (e.g., "Stellar Awards 2026"). **Do not auto-generate or pre-fill this** — it comes from the input only.
- **Live brand preview card** — small preview tile showing the logo + program name + extracted color palette, updating live as the client types. Does **not** preview any badge yet.
- CTA: "Continue" → `/client/style`.

### 3. Style guide selection (`/client/style`)

- **Three style options shown as large visual cards:** Premium, Minimal, Fun.
- Each card shows a representative style sample (placeholder image — admin will upload real samples later).
- Client picks one. **No customization text or extra inputs on this screen.**
- CTA: "Continue" → `/client/bundle`.

### 4. Asset bundle selection (`/client/bundle`)

- Client picks which asset types they want from the catalogue: Monetary Badge, Non-Monetary Badge, LSA Badge, Award Certificate, Feed Banner, Login Banner.
- Multi-select.
- CTA: "Continue" → `/client/select`.

### 5. Asset selection & live preview (`/client/select`)

- For each asset type the client picked in step 4, show the badges/templates available in the **chosen style** (from step 3), pulled from Supabase. These are placeholders until admin uploads real ones.
- **Multi-select** — client can choose multiple badge variants per asset type.
- For each selected badge, show an inline **input asking for "Badge Name"** (e.g., "Top Performer", "Innovation Champion"). The name is rendered live onto the badge preview.
- **Important rules for the badge rendering:**
  - **Do NOT show points** anywhere on the badge.
  - **Do NOT show the company name** anywhere on the badge.
  - The only dynamic text is the badge name from the input.
  - The client's primary brand color is applied to the badge background or accent (depends on template).
  - **Smart text color logic:** when the badge name sits on a light background, the text color should be a **darker shade of the primary color** (use chroma-js `.darken()` until WCAG AA contrast is met). On a dark background, use white or a light shade of primary. This logic runs once per badge render — encapsulate it in a `getReadableTextColor(bgColor, primaryColor)` helper.
- **Platform mockup preview** — beside each badge, show a "preview in platform" view: the badge embedded inside a screenshot of the Vantage Circle feed. **The user will provide the platform mockup image**; reference it as `/public/mockups/platform-feed.png` and overlay the badge on it via CSS positioning.
- CTA: "Continue to review" → `/client/review`.

### 6. Review & comment (`/client/review`)

- Show every selected asset with its badge name and the client's brand applied.
- Let the client **go back and modify** — add more badges, change names, change style, change bundle. Use a clear "Edit" affordance per section.
- Below the review, a free-text input: **"Any suggestions or leave a comment to help us understand?"** — optional, but captured on submission.
- Two final CTAs at the bottom:
  - **"Download as PDF"** — generates a downloadable PDF of all their selections with brand applied. Does NOT mark the session as submitted.
  - **"Submit"** — saves the session to the database, marks it as submitted, sends a notification (email or webhook to the admin), routes to `/client/thank-you`.

### 7. Thank you screen (`/client/thank-you`)

- Confirmation message. Recap of what was submitted. Option to download the PDF if they didn't already.

---

## ADMIN SURFACE — what the design team needs

Routes live under `/admin/*`, gated by `ADMIN_PASSWORD`.

### 1. Admin login (`/admin/login`)

- Single password input.

### 2. Template manager (`/admin/templates`)

- Upload new badge/banner/certificate templates.
- Each template has metadata:
  - **Asset type:** Monetary Badge / Non-Monetary Badge / LSA Badge / Certificate / Feed Banner / Login Banner
  - **Style:** Premium / Minimal / Fun
  - **Template file:** SVG (preferred) or PNG
  - **Color slot definition:** which part of the SVG receives the primary color (use `data-slot="primary"` attributes inside the SVG)
  - **Text slot:** where the badge name renders (`data-slot="badge-name"`)
- List view of all uploaded templates with filters by style and asset type.
- Edit + delete.

### 3. Submissions dashboard (`/admin/submissions`)

- List of all client submissions with: program name, submitted date, number of assets, comment preview.
- Click into a submission to see full detail:
  - Logo (downloadable)
  - Extracted brand colors with hex codes (copyable)
  - Program name
  - Every selected asset with its badge name, rendered preview, and template ID
  - Client's comment/suggestion text
  - Submission timestamp
- Mark as "In Progress" / "Completed" (simple status field).

---

## Data model — Supabase tables

Suggested schema (refine in the plan):

- **`sessions`** — `id`, `created_at`, `logo_url`, `primary_color`, `secondary_color`, `program_name`, `style_choice`, `bundle_choice` (array), `comment`, `status` (in_progress / submitted / completed), `submitted_at`
- **`asset_selections`** — `id`, `session_id` (FK), `template_id` (FK), `badge_name`, `created_at`
- **`templates`** — `id`, `asset_type`, `style`, `file_url`, `name`, `created_at`
- **Storage buckets:** `logos` (private, signed URLs), `templates` (public read), `submissions-pdf` (private)

---

## Smart text color logic — pseudocode

```ts
function getReadableTextColor(bgHex: string, primaryHex: string): string {
  const bgLuminance = chroma(bgHex).luminance();
  if (bgLuminance > 0.5) {
    // Light background → darken primary until contrast passes WCAG AA
    let darkened = chroma(primaryHex);
    while (chroma.contrast(darkened, bgHex) < 4.5 && darkened.luminance() > 0.05) {
      darkened = darkened.darken(0.5);
    }
    return darkened.hex();
  } else {
    // Dark background → use white or lightened primary
    return '#FFFFFF';
  }
}
```

Use this helper in the badge rendering component. Surface in the plan if you'd shape it differently.

---

## Scope — IN and OUT for MVP

**IN:**
- Both surfaces (client + admin) in one Next.js app
- Shared-password gates for each surface
- Intro screen with animated graphics + minimal text
- Brand setup with auto color extraction (no picker)
- Program name as an input
- Style selection (Premium / Minimal / Fun) with placeholder samples
- Bundle selection (which asset types)
- Asset selection with badge name input + smart text color + platform-mockup preview
- Review screen with edit-back and comment field
- PDF download
- Submit → DB + admin notification
- Admin template upload + submissions dashboard

**OUT (defer to v2):**
- SSO with Vantage Circle's platform
- User accounts / saved brand profiles
- Revision/approval loop after delivery
- Status tracking visible to client
- Figma sync
- Internal analytics
- Email templates beyond a simple notification

---

## Decisions I want surfaced in the plan

1. **Supabase vs Cloudflare D1+R2** — pick one with reasoning.
2. **PDF rendering approach** — `@react-pdf/renderer` (in-browser, simpler) vs Puppeteer (server-side, more flexible). Pick one.
3. **How badge templates are stored and rendered** — SVG with slot attributes (recommended) vs PNG with text overlay. Pick one and describe the slot convention.
4. **Where logos are stored** — Supabase Storage bucket access pattern (signed URL vs public read).
5. **How color extraction runs** — on upload via server route, or client-side after upload completes. Trade-off in the plan.
6. **State persistence between steps** — Zustand + localStorage vs writing partial state to Supabase as the client progresses. Pick one.
7. **Smart text color edge cases** — what happens when the primary color is already near-white or near-black? Describe the fallback.
8. **Admin notification on submit** — email via Resend, Slack webhook, or just in-app dashboard? Pick the simplest one.

---

## What the plan must include

- **Repo structure** with folders and key files
- **Supabase schema** with table definitions and relationships
- **Route map** for both `/client/*` and `/admin/*`
- **Build phases in order** — what to ship first, what depends on what. Suggested: (1) auth + scaffolding, (2) admin template upload, (3) client brand + intro, (4) client style + bundle + select, (5) review + PDF + submit, (6) admin submissions dashboard.
- **Component breakdown** — major React components per route
- **One concrete SVG template example** with slot markup, plus the rendering function that fills it
- **Open questions** you'd want me to clarify before code starts
- **Rough effort range per phase**

Note: I haven't provided the platform mockup image yet. Reference it as `/public/mockups/platform-feed.png` in your plan; I'll drop it in before the asset selection screen gets built.

Please produce the plan now. No code yet — I want to review and push back first.

---

## How to use this prompt

1. Open Claude Code in an empty directory (or your project root).
2. Turn plan mode on (`Shift+Tab` until "plan mode on" appears, or run `/plan`).
3. Paste the prompt above.
4. Read the plan, push back on anything unclear, then exit plan mode to let it build phase by phase.

### Suggested follow-ups after the plan lands

- "Build phase 1 only — auth, route scaffolding, both password gates. I'll review before phase 2."
- "Show me the SVG template example with slot markup and the renderer function before scaffolding more templates."
- "Before building the smart-text-color logic, write a small test page where I can paste a hex and see the chosen text color in real time."
