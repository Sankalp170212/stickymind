# StickyMind — AI Sticky Notes Canvas

**Live Demo & Take-home Submission** | House of Edtech Fullstack Developer Assignment  
Author: **Sankalp** · [GitHub](https://github.com/YOUR_USERNAME) · [LinkedIn](https://linkedin.com/in/YOUR_USERNAME)

---

## 1. Overview & Concept

**StickyMind** is a spatial sticky-notes web application where notes live on a free-form draggable canvas rather than a rigid list. Each authenticated user gets one private canvas. Notes can be placed anywhere, restacked, categorized, and recolored across 5 pastel presets—with spatial positions and z-index ordering preserved exactly as left.

### Key Differentiator: Read-Only AI Canvas Assistant
Unlike generic bolt-on chat widgets, StickyMind includes a **read-only AI assistant** powered by Google Gemini. The assistant ingests all notes currently on the user's canvas and answers questions, synthesizes themes, extracts action items, and connects ideas.

---

## 2. Tech Stack

| Layer | Choice | Details |
|---|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack, TypeScript) | Strict typed React 19 architecture |
| **Styling** | Tailwind CSS v4 | Modern glassmorphism, responsive tactile canvas |
| **Database** | PostgreSQL | Hosted on Render / Neon (or local Postgres) |
| **ORM** | Prisma 6 | Type-safe schema migrations and client |
| **Auth** | Custom JWT + bcryptjs | Stored in `localStorage`, transmitted via `Authorization: Bearer` |
| **Validation** | Zod | Strict schema validation on every API endpoint |
| **AI** | Google Gemini API (`@google/generative-ai`) | Read-only context injection (Gemini 1.5/2.0 Flash) |
| **Icons** | Lucide React | Clean, modern iconography |

---

## 3. Architecture & Security Design Decisions

### A. Architecturally Read-Only AI (Jailbreak-Proof)
A critical security decision in StickyMind is scoping the AI assistant **read-only by architecture, not merely by prompt instructions**:
- The `/api/chat` route queries the user's notes and supplies them as plain text context into the Gemini prompt.
- **No tool-calling or mutation functions** are attached to the model.
- Because the route contains no database mutation calls (`prisma.note.create`, `update`, `delete`), it is **impossible for prompt injection attacks or jailbreaks to alter or delete canvas data**.

### B. Authentication Trade-offs (`localStorage` vs `httpOnly` Cookies)
- **Current Implementation**: JWT stored in `localStorage` and passed as `Authorization: Bearer <token>`.
- **Trade-off Analysis**: For a rapid assignment under tight timelines, `localStorage` provides swift implementation without cross-domain cookie and CORS configuration hurdles.
- **Production Recommendation**: In high-security production environments, storing tokens in `httpOnly`, `Secure`, `SameSite=Strict` cookies is strongly recommended to protect against Cross-Site Scripting (XSS) token extraction.

### C. Debounced Spatial Persistence
- Note positions are updated locally on pointer drag events for instantaneous 60fps responsiveness.
- Position `PATCH` requests are sent only on pointer release (`onPointerUp` / drag end) to eliminate redundant network traffic and database writes.

---

## 4. API Endpoints

All endpoints validate inputs via **Zod** and verify authentication using JWT:

```
POST   /api/auth/signup      Create user account & issue JWT
POST   /api/auth/login       Verify credentials & issue JWT
GET    /api/auth/me          Validate current JWT session
GET    /api/notes            Retrieve all notes for authenticated user
POST   /api/notes            Create a new sticky note (with automatic zIndex increment)
PATCH  /api/notes/[id]       Update note content, title, category, color, or coordinates
DELETE /api/notes/[id]       Delete a specific note (with ownership check)
POST   /api/chat             Query Gemini AI with user's notes as read-only context
```

---

## 5. Environment Variables

Create a `.env` file in the root directory (refer to `.env.example`):

```bash
# Database connection URL (PostgreSQL - Neon / Render Postgres / Local)
DATABASE_URL="postgresql://user:password@localhost:5432/stickymind"

# JWT Secret for signing auth tokens
JWT_SECRET="stickymind_super_secret_jwt_key_2026_change_in_production"

# Google Gemini API Key for AI note assistant (from Google AI Studio)
GEMINI_API_KEY="your_gemini_api_key_here"
```

---

## 6. Local Setup & Running

### Prerequisites
- Node.js 20+
- PostgreSQL database (Local, Neon, or Render Postgres)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database & Prisma
Once your `DATABASE_URL` is set in `.env`:
```bash
npx prisma generate
npx prisma db push
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view StickyMind.

---

## 7. Deployment (Render)

1. Push your repository to GitHub.
2. In the Render Dashboard, create a **PostgreSQL** instance (`stickymind-db`).
3. Create a new **Web Service** connected to your repository:
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
4. In the Web Service's **Environment Variables**, add:
   - `DATABASE_URL` (Use Render Postgres Internal URL if co-hosted)
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
5. Push the schema to your production DB:
   ```bash
   npx prisma db push
   ```
   *(Run against the External Database URL once from your local CLI)*.

> [!NOTE]
> **Render Cold Starts**: Render's free tier spins down web services after 15 minutes of inactivity. The initial request after sleep may take ~30–60 seconds to respond as the instance wakes up.

---

## 8. Author & Submission

Developed for the **House of Edtech Fullstack Developer Assignment** by **Sankalp**.
- **GitHub**: [github.com/YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- **LinkedIn**: [linkedin.com/in/YOUR_USERNAME](https://linkedin.com/in/YOUR_USERNAME)
