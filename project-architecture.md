# StickyMind — AI Sticky Notes Canvas
### Project Spec for Codegen (Next.js 16 + Antigravity IDE / GitHub Copilot)
House of Edtech — Fullstack Developer Assignment, Sep 2026

---

## 1. Concept

A sticky-notes app where notes live on a free-form draggable canvas instead of a list. Each
logged-in user has **one private canvas**. Notes can be dragged anywhere, restacked, resized,
recolored — the arrangement is purely spatial/personal (doesn't have to "mean" anything) but
must persist exactly as left.

The differentiator: a **read-only AI assistant** (Gemini) that can see the user's current notes
and answer questions about them — summarize, find related notes, answer "what did I write
about X", surface patterns — without ever mutating data itself. This keeps the AI feature safe
(no accidental deletes via prompt injection) while still being a genuine value-add, not a bolt-on
chat widget.

**Not building:** multi-canvas/boards, real-time multi-user collaboration, AI-driven note
creation/editing, automated tests (explicitly descoped given the timeline).

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL (hosted on Neon) |
| ORM | Prisma |
| Auth | Custom email/password + JWT (stored in `localStorage`, sent as `Authorization: Bearer` header) |
| Password hashing | bcrypt |
| AI | Google Gemini API (`@google/generative-ai` or `ai-sdk` with Google provider) |
| Canvas | `react-dnd` or plain pointer-event drag (no heavy canvas lib needed — it's absolutely-positioned divs, not `<canvas>`) |
| Deployment | Render (web service, `next start`) |
| Database hosting | Render Postgres (managed) — local Postgres only for local dev, see §8 |

---

## 3. Data Model (Prisma schema)

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url = env("DATABASE_URL")
}

model User {
  id String @id @default(cuid())
  email String @unique
  passwordHash String
  createdAt DateTime @default(now())
  notes Note[]
}

model Note {
  id String @id @default(cuid())
  userId String
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  title String?
  content String
  category String? // free-text tag, e.g. "work", "idea", "personal"

  // canvas state — persisted exactly as the user leaves it
  posX Float @default(100)
  posY Float @default(100)
  zIndex Int @default(1) // set once at creation, never reordered
  color String @default("#FEF08A") // hex — one of 5 presets, see §7

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}
```

---

## 4. Auth Flow

- **Signup**: `POST /api/auth/signup` — email + password → bcrypt hash → create `User` → issue JWT.
- **Login**: `POST /api/auth/login` — verify bcrypt hash → issue JWT.
- **JWT payload**: `{ userId, email, iat, exp }`, signed with `JWT_SECRET`, 7-day expiry is reasonable.
- **Client storage**: `localStorage.setItem('token', jwt)` on login/signup success. Attach as
  `Authorization: Bearer <token>` on every notes/chat API call.
- **Server-side guard**: a small `verifyAuth(req)` helper in `lib/auth.ts` that reads the header,
  verifies the JWT, and returns `userId` or throws 401. Call it at the top of every protected
  route handler — don't build full middleware for this, given the timeline; per-route checks are
  faster to ship and just as correct.
- Note for your write-up: localStorage JWT is vulnerable to XSS (no httpOnly protection). Fine
  for a take-home under time pressure — but mention in your README that an httpOnly cookie
  would be the production-grade choice, since "real-world considerations" is literally a grading
  criterion.

---

## 5. API Routes (Next.js Route Handlers)

```
/api/auth/signup POST
/api/auth/login POST

/api/notes GET (list all notes for the authed user)
/api/notes POST (create note — default position/color if not given)
/api/notes/[id] PATCH (update — content, category, position, zIndex, rotation, size, color)
/api/notes/[id] DELETE

/api/chat POST (body: { message } → assistant reads the user's current notes
                                server-side, passes them as context to Gemini, returns answer.
                                No tool-calling / mutation ability here — read-only by design.)
```

**Validation**: use `zod` on every route to validate/sanitize body input before hitting Prisma —
this is one of the explicit grading criteria ("robust data validation and sanitization").

**Position updates**: debounce drag-end writes on the client (don't fire a PATCH on every
pixel of movement) — write on drag-end / resize-end only.

---

## 6. Chatbot Design (Gemini, read-only) — TRIMMED SCOPE

Single input box → single response, each message independent. No stored chat history, no
threading, no streaming UI. Keep it to one `Textarea` + one `Button` + a response area.

`/api/chat` handler:
1. Verify JWT → get `userId`.
2. Fetch all of that user's notes from Postgres (`content`, `title`, `category`, `updatedAt`).
3. Build a system prompt: "You are a helpful assistant with read access to the user's sticky
   notes. Answer questions about them, summarize, find connections. You cannot create, edit,
   or delete notes — if asked, say so and suggest they do it on the canvas."
4. Send notes-as-context + user message to Gemini (`gemini-1.5-flash` or `gemini-2.0-flash` —
   check current model names when you get your key, they change).
5. Return the text response. No function-calling/tools wired up — this is intentionally a
   context-stuffing RAG-lite pattern, not an agent, so there's no path for it to touch the DB.

This is a legitimate, defensible design choice for the write-up: "the assistant is scoped
read-only by architecture, not by prompt instruction, so it can't be jailbroken into mutating
data" is a real security point you can make in your README.

---

## 7. Canvas UI Notes — TRIMMED SCOPE (low sleep, hard deadline — keep this simple)

- Container: a large relatively-positioned `<div>` (bigger than viewport, scrollable) holding
  absolutely-positioned note cards at `{posX, posY}`, fixed size (e.g. `220px × 220px` via CSS,
  not a DB field), `backgroundColor: color`.
- Drag: pointer-events (`onPointerDown/Move/Up`) updating local state live, PATCH `{posX, posY}`
  on release only. That's it — no rotation, no resize, no reordering.
- `zIndex` is set once at creation (`max existing + 1`) and never touched again after that —
  don't build click-to-bring-to-front, it's not worth the time.
- New note button: creates at a default/slightly-offset position so new notes don't stack exactly
  on top of old ones.
- Color: 5 preset swatch buttons (pastel yellow/pink/blue/green/purple) — clicking one sets
  `color` on the note. No color picker component.
- Use shadcn/ui `Textarea`, `Button`, `Select` (for category).
- Accessibility: keyboard-focusable notes, visible focus ring, sufficient color contrast on note
  text against pastel backgrounds, `aria-label`s on drag handles/buttons.

---

## 8. Database Setup Guide

**Local dev**: point `DATABASE_URL` at your local Postgres instance
(`postgresql://user:password@localhost:5432/stickymind`) and run:
```bash
npx prisma generate
npx prisma db push
```
`db push` is fine here instead of migrations — faster for a one-shot deadline project.

**Production (required for the live deployment link)**: your local DB isn't reachable from
Render's servers, so production needs a hosted Postgres. Since you're already deploying on
Render, use Render's own managed Postgres instead of a separate provider:

1. In the Render dashboard → "New" → "PostgreSQL".
2. Name it (e.g. `stickymind-db`), pick a region, free/starter tier is enough.
3. Once created, copy the **Internal Database URL** (if your web service is also on Render, use
   the internal URL — faster, no external network hop) or the **External Database URL** (if
   connecting from elsewhere, e.g. running `prisma db push` from your laptop against it).
4. Set that as `DATABASE_URL` in your Render **web service's** environment variables (Section 9).
5. Run `npx prisma db push` once against the External URL (from your machine) to create the
   schema in the production DB before your first deploy.

---

## 9. Environment Variables

```
DATABASE_URL= # local Postgres in dev, Render Postgres URL in production
JWT_SECRET= # any long random string
GEMINI_API_KEY= # from Google AI Studio — you're generating this yourself
```

Add all three to your Render **web service's** Environment Variables before deploying, not just
your local `.env`.

---

## 10. Deployment (Render)

1. Push repo to GitHub.
2. Render dashboard → "New" → "Web Service" → connect the GitHub repo.
3. Build command: `npm install && npx prisma generate && npm run build`
   Start command: `npm start` (i.e. `next start`)
4. Add the env vars from Section 9 (use the Render Postgres **Internal** URL for `DATABASE_URL`
   since the DB and web service are both on Render).
5. Deploy. Render auto-redeploys on every push to `main` by default — satisfies the "configure
   CI/CD" requirement with zero extra config.
6. Note: Render's free tier web services spin down after inactivity and take ~30-60s to wake
   on the next request — if your evaluator hits a cold start, mention this in your README so
   it doesn't read as a bug.

---

## 11. Footer (submission requirement — don't skip this one)

The assignment PDF requires your **name, GitHub profile, and LinkedIn profile** in the app
footer — it's under "Submission Guidelines," which reads as a hard requirement, not optional
styling. Ship the footer component with placeholders now so you don't forget under time
pressure:

```tsx
// components/Footer.tsx
export function Footer() {
  return (
    <footer className="text-center text-sm text-muted-foreground py-4">
      © {new Date().getFullYear()} Sankalp ·{" "}
      <a href="https://github.com/YOUR_USERNAME" target="_blank">GitHub</a> ·{" "}
      <a href="https://linkedin.com/in/YOUR_USERNAME" target="_blank">LinkedIn</a>
    </footer>
  );
}
```
Swap in your real URLs before you submit — that's the only manual step left in this file.

---

## 12. Suggested Build Order — trimmed, ~3.5–4.5 hrs total

1. `create-next-app` (TS, App Router, Tailwind) → install Prisma, shadcn, bcrypt, jsonwebtoken, zod. *(30–45 min)*
2. Prisma schema → Render Postgres → `db push`. *(15–20 min)*
3. Auth routes + `lib/auth.ts` JWT helper → signup/login pages. *(45–60 min)*
4. Notes CRUD API routes + zod validation. *(30–40 min)*
5. Canvas UI: drag + save `{posX, posY}`, 5 color swatches, fixed size, no resize/rotate/reorder. *(45–60 min)*
6. Chat route + minimal single-input chat UI. *(30–45 min)*
7. Footer (fill in your GitHub/LinkedIn), brief README (mention localStorage/httpOnly tradeoff,
   read-only chatbot design, Render cold-start note). *(15–20 min)*
8. Deploy to Render, smoke-test the live URL, push final commit. *(30–45 min)*

If step 5 or 6 overruns, cut further before cutting step 8 — a live, working, uglier app beats a
polished one that never deployed.

---

## 13. Explicitly Out of Scope (per your call)

- Automated tests (unit/integration/e2e) — skipped given the timeline.
- httpOnly cookie JWT — using localStorage for speed; noted as a known tradeoff in README.
- Multi-canvas / shared canvases / real-time collaboration.
- AI-driven note mutation (create/edit/delete via chat) — chatbot is read-only by design.
- Note rotation, resize, and click-to-bring-to-front z-index reordering — cut for time; notes
  are fixed-size, dragged for position only, z-index set once at creation.
- Chat history/threading — single-turn Q&A only, no persistence, no streaming.
- Full color picker — 5 preset swatches instead.