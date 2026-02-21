# SawaFlix Sprint 1: GitHub Project Board Tasks

Copy and paste these tasks directly into your GitHub Project Board.

---

### [Frontend] Asime: Extended Signup & Routing
**Title:** Implement Extended Signup with Phone & Role Routing
**Assignee:** Asime
**Description:**
- Add a required **Phone Number** field to the signup form.
- Implement a **Role Selection** (Viewer vs Creator).
- For Creators, add a step to select **Creator Category**.
- Redirect Creators to the **Verification Portal** immediately after signup.
- **Reference File:** [(auth)/actions.js](file:///c:/Users/THE%20EYE%20INFORMATIQUE/OneDrive/Desktop/All/sawa/sawaflix/app/(auth)/actions.js)

---

### [Frontend] Beleh: 5-Step Verification Wizard
**Title:** Build Multi-Step Creator Verification Wizard
**Assignee:** Beleh
**Description:**
- Build a progress-tracked wizard with 5 steps:
  1. Identity (Name, Ethnic Group)
  2. Professional (Bio, Languages)
  3. Portfolio (Links/Videos)
  4. Documents (ID/Endorsements)
  5. Summary & Submit
- Use **Zod** for validation and handle "Save as Draft" functionality.
- **Components Folder:** [components/](file:///c:/Users/THE%20EYE%20INFORMATIQUE/OneDrive/Desktop/All/sawa/sawaflix/components/)

---

### [Frontend] Boyema: Admin Review Dashboard
**Title:** Create Admin Interface for Verification Review
**Assignee:** Boyema
**Description:**
- Create a list view for all `PENDING` verification submissions.
- Build a "Submission Detail" view showing all data from the 5 wizard steps.
- Add action buttons: **Approve**, **Reject** (with reason), and **Request Info**.

---

### [Backend] Ngam: Auth Security & Roles
**Title:** Extend Auth Roles & Implement OTP Security
**Assignee:** Ngam
**Description:**
- Add `role` and `verification_status` to the Supabase `profiles` table.
- Use **Redis** for OTP storage (5-min expiration) and rate-limiting.
- Create middleware to protect routes based on verification status.
- **DB Setup Folder:** [supabase-mcp/](file:///c:/Users/THE%20EYE%20INFORMATIQUE/OneDrive/Desktop/All/sawa/sawaflix/supabase-mcp/)

---

### [Backend] Wohking: Verification API & Storage
**Title:** Build Verification API & Supabase Storage
**Assignee:** Wohking
**Description:**
- Create `POST /api/verification/submit` and `PUT /api/verification/draft`.
- Configure Supabase **Storage Buckets** for private document uploads.
- Ensure file types and sizes are validated on the server.
- **API Folder:** [app/api/](file:///c:/Users/THE%20EYE%20INFORMATIQUE/OneDrive/Desktop/All/sawa/sawaflix/app/api/)

---

### [Design] Kingsley: Figma UI/UX System
**Title:** Design High-Fidelity UI for Role Selection & Verification
**Assignee:** Kingsley
**Description:**
- Create Figma mockups for the Role Selection (Viewer/Creator) screen.
- Design the mobile-first verification wizard (all 5 steps).
- Provide a component library for buttons, inputs, and progress bars.
- Perform a "Final UX Pass" on Friday to find and fix UI bugs.
