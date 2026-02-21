# SawaFlix: Frontend Developer Guide (Sprint 1)

Welcome to the SawaFlix Frontend Team! This document is designed to take you from a beginner to a contributor. We are using modern tools, and this guide will show you exactly what to learn and how to build your first tasks.

---

## 📚 Beginner's Learning Roadmap
If you are new to Next.js or React, start here. Don't try to learn everything—just learn what we need for this project.

### Phase 1: The Basics (Read/Watch first)
- **React Components & Props**: [Official Tutorial](https://react.dev/learn/your-first-component) (Learn how to break a UI into small pieces).
- **React Hooks (useState)**: [Official Tutorial](https://react.dev/learn/state-a-components-memory) (Crucial for the 5-Step Wizard!).
- **Tailwind CSS Basics**: [Utility-First Fundamentals](https://tailwindcss.com/docs/utility-first) (Learn how to style using class names like `flex`, `bg-blue-500`, `p-4`).

### Phase 2: Next.js & App Router
- **Pages & Layouts**: [Next.js Docs](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) (Understand how folders in `/app` become URLs).
- **Server Actions**: [Next.js Docs](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) (How we send form data to the database).

---

## 🛠 Project Structure Deep Dive
- `app/(auth)/sign-up/page.jsx`: This is where users create accounts.
- `app/(dashboard)/layout.jsx`: This wraps the dashboard and controls the sidebar/navigation.
- `components/`: Put your reusable parts here (e.g., `Button.tsx`, `ProgressBar.tsx`).
- `middleware.js`: The "Security Guard." It checks if a user is logged in before letting them see the dashboard.

---

## 🚀 Step-by-Step Task Breakdown

### 1. The Extended Signup (Asime)
**Goal:** Collect Phone Numbers and Roles.
1.  **Open** `app/(auth)/sign-up/page.jsx`.
2.  **Add Input**: Find the form and add a new `<label>` and `<input>` for the phone number. Ensure its `name` attribute is `"phone"`.
3.  **Role Toggle**: Create two "Cards" (Buttons). One says "I want to watch (Viewer)" and the other "I want to create (Creator)". 
4.  **Category Step**: If they click "Creator," show a `<select>` dropdown with: Traditional Storyteller, Food Creator, Actor, Comedian, Music Artist.
5.  **Submit**: In `(auth)/actions.js`, make sure `signUpWithPassword` reads the new `phone` and `role` from `formData`.

### 2. The Verification Wizard (Beleh)
**Goal:** A 5-step form that feels smooth.
1.  **Create State**: Use `const [step, setStep] = useState(1);`.
2.  **Step Logic**: 
    - `step === 1`: Show Identity fields.
    - `step === 2`: Show Professional bio.
    - ... and so on.
3.  **Buttons**: Create "Back" and "Next" buttons. "Next" increments `step`, but only if the current fields are valid.
4.  **Zod Validation**: Learn how to use [Zod](https://zod.dev/) to check if fields are empty. Show red error text if they missed something.
5.  **Drafting**: On every "Next" click, call `updateVerificationDraft(formData)` so they don't lose progress if they close the browser.

### 3. Admin Review Interface (Boyema)
**Goal:** Let admins see and judge submissions.
1.  **List Page**: Create a page at `/admin` that fetches all `pending` users from the database.
2.  **Card Component**: Design a card that shows the user's name and category.
3.  **Detail View**: When an admin clicks a card, show *everything* they submitted in a clean, readable layout.
4.  **Actions**: Add three beautiful buttons:
    - `Approve`: Green.
    - `Reject`: Red (opens a pop-up asking "Why?").
    - `Request Info`: Blue (lets them send a message to the creator).

---

## 💡 Pro Tips for Success
- **Copy & Paste**: Don't reinvent the wheel. Look at how the existing login form is built and copy those patterns!
- **Refresh & Test**: After every small change, refresh your browser. If it breaks, you'll know exactly which line did it.
- **Ask for Help**: If you spend more than 30 minutes stuck on a single error, reach out to Ngam (Backend) or Kingsley (Designer).

---
**Build with Excellence. Respect the Culture.**
