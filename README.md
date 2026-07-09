# SammTech Task Management API

A RESTful backend for a Kanban-style task management system, built for the SammTech Backend Internship take-home assignment.

**Stack:** NestJS · TypeScript · PostgreSQL · Prisma · JWT

---

## Setup & Run Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (running locally or accessible via connection string)
- npm

### 1. Clone and install
```bash
git clone <YOUR_REPO_URL>
cd sammtech-backend-assignment
npm install
```

### 2. Configure environment variables
Copy the example file and fill in real values:
```bash
cp .env.example .env
```
See [Environment Variables](#environment-variables) below for what each value means.

### 3. Set up the database
Create a PostgreSQL database and user (adjust names/passwords as you like):
```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE sammtech;
CREATE USER sammtech_user WITH PASSWORD 'devpassword';
GRANT ALL PRIVILEGES ON DATABASE sammtech TO sammtech_user;
```

### 4. Run migrations
```bash
npx prisma generate
npx prisma migrate dev
```
This creates all tables (`users`, `boards`, `columns`, `tasks`, `task_labels`, `refresh_tokens`, `task_activities`) and generates the Prisma Client.

### 5. Start the server
```bash
npm run start:dev
```
API runs at `http://localhost:3000` by default.

### 6. Explore the API
Interactive Swagger docs: `http://localhost:3000/api/docs`

---

## Environment Variables

| Variable | Example | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://sammtech_user:devpassword@localhost:5432/sammtech?schema=public` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | (32+ char random hex string) | Signing secret for access tokens |
| `JWT_REFRESH_SECRET` | (different 32+ char random hex string) | Signing secret for refresh tokens |
| `JWT_ACCESS_EXPIRY` | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRY` | `7d` | Refresh token lifetime |
| `PORT` | `3000` | Server port |
| `CORS_ORIGIN` | `http://localhost:5173` | Comma-separated list of allowed origins |

Generate strong secrets with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## API Documentation

- **Swagger UI:** `http://localhost:3000/api/docs` (or `<LIVE_API_URL>/api/docs` once deployed)
- **Postman collection:** `<https://bitenow-4006.postman.co/workspace/BiteNow-Workspace~09fe6fcb-5f39-4357-8af9-d08686d48f20/collection/46761222-6e7290e5-68f8-4abc-b1c3-c4a87538908a?action=share&source=copy-link&creator=46761222>`

All protected routes require a Bearer token. In Swagger, click **Authorize** and paste your access token (obtained from `POST /auth/login`) to test protected endpoints directly from the docs UI.

---

## Key Technical Decisions

- **UUIDs instead of auto-increment IDs** across all models — avoids exposing sequential, enumerable IDs in URLs.
- **Refresh tokens hashed with SHA-256, not bcrypt.** Initially used bcrypt (matching the pattern used for passwords), but discovered bcrypt silently truncates input at 72 bytes — since our JWT payload structure (`{ sub, email }`) put the differentiating claims (`iat`, `exp`) past that boundary for same-user tokens, different tokens hashed to values that falsely matched each other. Passwords are short and stay on bcrypt (the correct tool for low-entropy secrets); refresh tokens are already high-entropy and use a fast, fixed-length SHA-256 hash instead. See "Challenges Faced" below for the full story.
- **Refresh token rotation.** Every refresh call revokes the token it consumed and issues a new one. Reduces the blast radius if a refresh token is ever leaked — a stolen, already-used token is permanently dead.
- **Task position/reorder uses integer shifting inside a DB transaction**, not fractional positioning. Simpler to reason about and matches the schema's `position Int` field directly. Tradeoff: shifts touch more rows per move than a fractional approach would, but for realistic Kanban column sizes this is a non-issue. All shifts (same-column reorder and cross-column move) run inside a single `$transaction` so a crash mid-move can't leave positions corrupted.
- **Soft delete scope.** Boards and tasks use `deletedAt` timestamps rather than hard deletes. Soft delete is **not cascaded** from board → columns/tasks automatically — deleting a board hides it (and its nested tasks, via the board detail query's filtering) from normal views, but doesn't stamp `deletedAt` on every descendant row. A production system would likely cascade this via a scheduled job; out of scope here given the assignment's focus on core structure over exhaustive edge-case handling.
- **Ownership enforcement via relation traversal, not duplicated ownerId fields.** Columns and tasks don't store their own owner — ownership is always checked by walking up to the parent board (`task.column.board.ownerId`). Single source of truth for "who owns this," avoids sync bugs between a cached owner field and the actual board owner.
- **403 vs 404 for access-denied resources.** When a resource exists but belongs to another user, the API returns `403 Forbidden` rather than `404 Not Found`. This is a deliberate choice to be transparent about "this exists, you can't touch it" — an alternative, equally valid design would return `404` to avoid confirming a resource's existence to unauthorized callers.
- **Global exception filter with sanitized 500 responses.** Known errors (`NotFoundException`, `ForbiddenException`, validation errors, etc.) pass their real message through in a consistent response shape. Unexpected errors (bugs, DB failures) are logged in full server-side but return only a generic "Internal server error" to the client, to avoid leaking stack traces or internal details.
- **Rate limiting tuned per-route, not just globally.** Login/register are capped at 5/minute (per the assignment's suggestion) since they're the classic brute-force targets. Refresh is capped higher (10/minute) since legitimate clients refresh more frequently during normal use, and a blanket 5/minute would risk locking out real users.

---

## Challenges Faced

**Refresh token false-positive matching (the big one).** Early testing showed a single refresh token could be "used" successfully more than once, which should be impossible with rotation in place. Traced it down through several dead ends (suspected duplicate server processes, stale Postman test data, race conditions) before finding the actual root cause: bcrypt only hashes the first 72 bytes of its input, and my JWT payload's structural layout meant two different tokens for the same user shared an identical 72-byte prefix. `bcrypt.compare()` was reporting `true` for tokens that weren't actually the same. Fixed by switching refresh token hashing to SHA-256, which has no such truncation and is the more appropriate tool for hashing already-high-entropy values anyway. This was a genuinely valuable debugging exercise in not trusting an assumption ("bcrypt is just always safe for hashing anything") without verifying it.

**Prisma major version mismatch.** Started the project on Prisma 7 (the latest version at install time), which turned out to require driver adapters and, per Prisma's own migration guide, effectively a full ESM conversion of the NestJS project to work cleanly. Rather than take on that scope creep this early, downgraded to Prisma 6, which works with the standard `PrismaClient` + `datasource.url` pattern used throughout this README and matches virtually all current NestJS+Prisma documentation and tooling.

**Task position/reorder logic.** The trickiest piece structurally — needed to handle four distinct cases correctly (moving earlier within a column, moving later within a column, moving to a different column, and no-op/same-position requests) without leaving gaps or duplicate position values. Solved by wrapping all shifts in a single Prisma transaction and handling same-column vs cross-column moves as two clearly separate code paths rather than trying to force one unified formula.

---

## What I'd Improve With More Time

- **Cascading soft delete** from boards down through columns and tasks, likely via a Prisma middleware or a scheduled cleanup job, so a deleted board's descendants are also explicitly marked rather than just filtered out at query time.
- **Concurrency safety on task moves.** The current position-shift transaction is safe against crashes but not against truly simultaneous concurrent move requests on the same column (a rare edge case for a single-user drag-and-drop UI, but worth hardening with `SERIALIZABLE` isolation or optimistic locking for a multi-user production system).
- **Refresh token cleanup job.** Expired/revoked refresh token rows currently accumulate indefinitely. A scheduled job to purge old rows would keep the table from growing unbounded.
- **File upload for task attachments** (Multer + Cloudinary) — listed as a bonus differentiator, not implemented due to time constraints.
- **More granular RBAC** beyond "board owner can do everything" — e.g. shared boards with collaborator roles (viewer/editor) rather than single-owner-only access.
- **Automated test suite** (unit tests for services, e2e tests for controllers) — manual endpoint testing was used throughout development given the timeline; a real test suite would be the next priority for a longer-lived project.

---

## Deployment

- **Live API base URL:** `<FILL_IN_AFTER_DEPLOYING>`
- **Platform:** `<Railway / Render / Fly.io>`
- **Swagger docs (deployed):** `<LIVE_URL>/api/docs`

---

## Project Structure

```
src/
├── auth/           # register, login, refresh, JWT strategy/guard
├── users/          # protected profile endpoint
├── boards/         # board CRUD + ownership
├── columns/        # column CRUD + ownership (via parent board)
├── tasks/          # task CRUD, position/reorder, search/filter, activity log
├── common/
│   ├── decorators/ # @CurrentUser()
│   ├── filters/    # global HTTP exception filter
│   └── exceptions/ # domain-specific exception subclasses
└── prisma/         # PrismaService/PrismaModule
prisma/
├── schema.prisma
└── migrations/
```
