# SawaFlix: Backend Developer Guide (Sprint 1)

Welcome to the SawaFlix Backend Team! This document will guide you through the core infrastructure, security, and data handling required for Sprint 1.

---

## 📚 Beginner's Learning Roadmap
Backend development is about logic, security, and data. Start with these concepts:

### Phase 1: Database & Supabase
- **Supabase Crash Course**: [Supabase Docs](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) (Learn how to use Supabase with Next.js).
- **Relational Databases (Postgres)**: [Postgres Tutorial](https://www.postgresql.org/docs/current/tutorial-sql.html) (Understand Tables, IDs, and Foreign Keys).
- **RLS (Row Level Security)**: [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security) (Crucial! Learn how to lock down data so users only see their own files).

### Phase 2: Security & Logic
- **Redis for Beginners**: [Redis Introduction](https://redis.io/docs/latest/develop/get-started/) (Learn why we use it for temporary storage like OTPs).
- **Next.js API Routes**: [Official Guide](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) (How to create the endpoints the frontend calls).

---

## 🚀 Step-by-Step Task Breakdown

### 1. Auth & State Machine (Ngam)
**Goal:** Manage user roles and verification statuses.
1.  **Database Update**: Add `role` (enum: 'viewer', 'creator', 'admin') and `verification_status` (enum: 'unverified', 'pending', 'approved', 'rejected') to the `profiles` table.
2.  **State Machine Logic**: Create a helper function that ensures users can only move from `unverified -> pending` or `pending -> approved`. 
3.  **Redis Integration**: Set up Redis to store temporary OTP codes. Use a 5-minute expiration (`EXPIRE` command) to keep things secure.
4.  **Middleware Guard**: Update `middleware.js` to block creators from accessing the full dashboard if their status isn't `approved`.

### 2. Submission API & Storage (Wohking)
**Goal:** Handle creator data and file uploads.
1.  **Verification Table**: Create a `verification_submissions` table with a `jsonb` column called `form_data` (to store the flexible wizard fields).
2.  **Submit Endpoint**: Build `POST /api/verification/submit`. It should take the form data, save it, and flip the user's status to `pending`.
3.  **Draft Endpoint**: Build `PUT /api/verification/draft`. This saves partial data without changing the status.
4.  **Supabase Storage**: Create a bucket called `verification-docs`. 
5.  **Security Policies**: Write an RLS policy: `CREATE` allowed for all users, `SELECT` allowed ONLY for the owner and admins.

---

## 💡 Pro Tips for Success
- **Safety First**: Never trust the frontend. Always validate the user's input on the server using [Zod](https://zod.dev/).
- **Error Messages**: If something fails, return a clear error message (e.g., `401 Unauthorized` or `400 Missing Fields`) so the frontend developers know what happened.
- **Log Everything**: Use `console.log` on the server to see what data is arriving at your endpoints.

---
**Build Securely. Protect the Data.**
