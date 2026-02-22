# 📋 GitHub Issues - Sprint 1 Code Review

**Export these issues to GitHub Project Board**  
**Date Created:** February 21, 2026  
**Target Sprint:** Sprint 1  
**Priority:** CRITICAL/HIGH/MEDIUM

---

## 🔴 CRITICAL ISSUES (Must Fix Before Merge)

### [CRITICAL #1] File Size Validation Missing in Upload Endpoint
**Assignee:** Wohking  
**Labels:** bug, security, backend  
**Points:** 2  
**Milestone:** Sprint 1  
**Due:** Friday 23 Feb 6 PM  

#### Description
The `POST /api/upload` endpoint doesn't validate file size before processing. This allows:
- DoS attacks with massive files
- Storage quota exhaustion
- Memory overflow

#### Acceptance Criteria
- [ ] Max file size enforced (50MB)
- [ ] File size check before processing
- [ ] Returns 413 Payload Too Large on violation
- [ ] Unit test added
- [ ] Tested with oversized files

#### Implementation Notes
See CODE_REVIEW_SPRINT1.md Issue #1 for code example

---

### [CRITICAL #2] Supabase Storage RLS Policies Not Configured
**Assignee:** Wohking  
**Labels:** bug, security, database  
**Points:** 3  
**Milestone:** Sprint 1  
**Due:** Friday 23 Feb 6 PM  

#### Description
The `verification-docs` bucket has no Row-Level Security (RLS) policies. This means:
- Users can access other users' files
- No admin separation
- Data leakage vulnerability

#### Acceptance Criteria
- [ ] RLS policies created for bucket
- [ ] Users can only access own files
- [ ] Admins can access all files
- [ ] No one but admins can delete
- [ ] Tested with multiple users

#### Implementation Notes
SQL provided in database_migrations.sql  
See CODE_REVIEW_SPRINT1.md Issue #3

---

### [CRITICAL #3] Verification Submissions Table Missing
**Assignee:** Wohking  
**Labels:** bug, database, backend  
**Points:** 3  
**Milestone:** Sprint 1  
**Due:** Friday 23 Feb 6 PM  

#### Description
The `verification_submissions` table is referenced in code but doesn't exist. This breaks:
- Form submission storage
- Status tracking
- Admin review queue

#### Acceptance Criteria
- [ ] Table created with proper schema
- [ ] Indexes added for performance
- [ ] RLS policies configured
- [ ] Migration tested on staging

#### Implementation Notes
Full SQL in database_migrations.sql  
See CODE_REVIEW_SPRINT1.md Issue #4

---

### [CRITICAL #4] Profile Table Missing role & verification_status Columns
**Assignee:** Ngam  
**Labels:** bug, database, auth  
**Points:** 3  
**Milestone:** Sprint 1  
**Due:** Friday 23 Feb 6 PM  

#### Description
Sprint requirements specify adding `role` and `verification_status` to profiles table. These columns don't exist, breaking:
- Role-based access control
- Verification status tracking
- State machine enforcement

#### Acceptance Criteria
- [ ] `role` column added (enum: viewer, creator, admin)
- [ ] `verification_status` column added (enum: unverified, pending, approved, rejected, changes_requested)
- [ ] State machine trigger created
- [ ] Tested on staging database

#### Implementation Notes
SQL provided in database_migrations.sql  
See CODE_REVIEW_SPRINT1.md Issue #11

---

### [CRITICAL #5] OTP Not Actually Sent - Just Logged
**Assignee:** Ngam  
**Labels:** bug, auth, critical  
**Points:** 5  
**Milestone:** Sprint 1  
**Due:** Friday 23 Feb 6 PM  

#### Description
The OTP send endpoint only logs to console. Users never receive emails, making OTP verification impossible. Current code:
```typescript
await redis.set(`otp:${email}`, otp, { ex: 300})
console.log(`sending otp to ${email} with code ${otp}`) // ❌ Not actually sending
return NextResponse.json({ message: "OTP sent successfully" })
```

#### Acceptance Criteria
- [ ] SendGrid integration implemented
- [ ] OTP sent via email successfully
- [ ] Email template formatted nicely
- [ ] OTP code in email (not exposed in console)
- [ ] E2E tested (signup → OTP sent → verified)

#### Implementation Notes
Use SendGrid for email.  
Code example in CODE_REVIEW_SPRINT1.md Issue #13  
Free tier supports 100 emails/day

#### Blockers
- SendGrid API key needed (register at sendgrid.com)

---

### [CRITICAL #6] OTP Verification Missing Rate Limiting
**Assignee:** Ngam  
**Labels:** bug, security, auth  
**Points:** 2  
**Milestone:** Sprint 1  
**Due:** Friday 23 Feb 6 PM  

#### Description
The `/api/otp/verify` endpoint has no rate limiting. Attackers can brute force 1,000,000 attempts to guess a 6-digit code.

#### Acceptance Criteria
- [ ] Rate limiting added (10 attempts per hour)
- [ ] Returns 429 Too Many Requests
- [ ] Testing with rate limit bypass attempts
- [ ] Prevents brute force

#### Implementation Notes
Update `lib/redis.ts` with separate limiter.  
See CODE_REVIEW_SPRINT1.md Issue #14

---

### [CRITICAL #7] Middleware Not Checking User Role
**Assignee:** Ngam  
**Labels:** bug, security, middleware  
**Points:** 4  
**Milestone:** Sprint 1  
**Due:** Friday 23 Feb 6 PM  

#### Description
The middleware only checks `is_verified` boolean but not `role`. This breaks:
- Creator-only routes accessible to viewers
- Admin routes not protected
- Access control not enforced

#### Acceptance Criteria
- [ ] Middleware checks `role` column
- [ ] Creator routes (e.g., `/creator/*`) only accessible if role='creator'
- [ ] Admin routes (e.g., `/admin/*`) only accessible if role='admin'
- [ ] Verification status enforced
- [ ] E2E tested with different roles

#### Implementation Notes
See CODE_REVIEW_SPRINT1.md Issue #15 for full middleware code

---

## 🟠 HIGH PRIORITY ISSUES (Before Production)

### [HIGH #8] Rate Limiting on File Upload Endpoint
**Assignee:** Wohking  
**Labels:** feature, security, backend  
**Points:** 2  
**Milestone:** Sprint 1  
**Due:** Friday 23 Feb 6 PM  

#### Description
File uploads have no rate limiting. Users can upload unlimited files causing:
- Storage exhaustion
- Billing spikes
- Resource abuse

#### Acceptance Criteria
- [ ] Rate limiter added (10 uploads/hour per user)
- [ ] Returns 429 Too Many Requests
- [ ] Respects user quotas
- [ ] Tested with rapid uploads

#### Implementation Notes
See CODE_REVIEW_SPRINT1.md Issue #2

---

### [HIGH #9] Virus Scanning for Uploaded Files
**Assignee:** Wohking  
**Labels:** feature, security, backend  
**Points:** 5  
**Milestone:** Sprint 1  
**Due:** Sprint 2 (deferred if needed)  

#### Description
Uploaded files are not scanned for malware. Risk of:
- Malicious code execution
- Virus distribution
- Compliance violations

#### Acceptance Criteria
- [ ] ClamAV or VirusTotal integration
- [ ] Files scanned before storage
- [ ] Infected files rejected with 400 error
- [ ] Scan results logged
- [ ] Unit tests added

#### Implementation Notes
See CODE_REVIEW_SPRINT1.md Issue #6  
ClamAV Docker setup or VirusTotal API

**Priority:** Can defer to Sprint 2 if needed for Tuesday demo

---

### [HIGH #10] Audit Trail for Admin Actions
**Assignee:** Both (Ngam focuses on DB, Wohking integrates API)  
**Labels:** feature, audit, database  
**Points:** 4  
**Milestone:** Sprint 1  
**Due:** Friday 23 Feb EOD  

#### Description
No logging of admin approval/rejection actions. Makes it impossible to:
- Track who did what
- Debug issues
- Detect abuse

#### Acceptance Criteria
- [ ] `admin_actions` table created
- [ ] Admin approval logs action taken
- [ ] Admin rejection logs reason
- [ ] Audit table queryable
- [ ] RLS policies protect audit logs

#### Implementation Notes
SQL in database_migrations.sql  
See CODE_REVIEW_SPRINT1.md Issue #10

---

### [HIGH #11] State Machine Enforcement for Verification Status
**Assignee:** Ngam  
**Labels:** feature, database, validation  
**Points:** 3  
**Milestone:** Sprint 1  
**Due:** Friday 23 Feb EOD  

#### Description
Verification status can transition to invalid states. Database should enforce:
- unverified → pending (user submits)
- pending → approved/rejected (admin reviews)
- approved/rejected → pending (user resubmits)

#### Acceptance Criteria
- [ ] State machine trigger created
- [ ] Invalid transitions rejected
- [ ] Tested with all transitions
- [ ] Error messages clear

#### Implementation Notes
Implemented via trigger in database_migrations.sql  
Function: `verify_status_transition()`

---

### [HIGH #12] Middleware Rate Limiting Tuning
**Assignee:** Ngam  
**Labels:** tuning, auth, backend  
**Points:** 2  
**Milestone:** Sprint 1  
**Due:** Friday 23 Feb EOD  

#### Description
Current OTP rate limit too restrictive (3 per hour). Users locked out for 57 minutes on typo.

#### Acceptance Criteria
- [ ] OTP send limit changed to 5 per 15 min
- [ ] OTP verify limit is 10 per hour
- [ ] Error messages updated
- [ ] UX improved

#### Implementation Notes
See CODE_REVIEW_SPRINT1.md Issue #12  
Update lib/redis.ts

---

## 🟡 MEDIUM PRIORITY ISSUES (Nice to Have)

### [MEDIUM #13] File Integrity Checks (SHA256 Checksums)
**Assignee:** Wohking  
**Labels:** feature, security, backend  
**Points:** 3  
**Milestone:** Sprint 2  

#### Description
No way to verify files aren't corrupted during upload/storage.

#### Acceptance Criteria
- [ ] SHA256 hash computed on upload
- [ ] Hash stored in metadata
- [ ] Hash verified on download
- [ ] Mismatch alerts admin

#### Implementation Notes
See CODE_REVIEW_SPRINT1.md Issue #7

---

### [MEDIUM #14] Session Invalidation After Admin Approval
**Assignee:** Ngam  
**Labels:** feature, ux, backend  
**Points:** 3  
**Milestone:** Sprint 2  

#### Description
When admin approves creator, user doesn't know until page refresh.

#### Acceptance Criteria
- [ ] Realtime notification sent to user
- [ ] Dashboard auto-refreshes
- [ ] Status updates without reload

#### Implementation Notes
See CODE_REVIEW_SPRINT1.md Issue #18

---

### [MEDIUM #15] Remove Console Logs from Production
**Assignee:** Both  
**Labels:** cleanup, security, backend  
**Points:** 2  
**Milestone:** Sprint 1  
**Due:** Before merge  

#### Description
Sensitive console logs in file upload and OTP routes. Expose OTP codes and file paths.

#### Acceptance Criteria
- [ ] Console logs removed/sanitized
- [ ] Only errors logged in production
- [ ] Test logging utility
- [ ] Updated in all files

#### Implementation Notes
See CODE_REVIEW_SPRINT1.md Issue #20  
Create safeLog() utility

---

### [MEDIUM #16] Integration Test Suite
**Assignee:** Both (Test Specialist if available)  
**Labels:** testing, qa, backend  
**Points:** 5  
**Milestone:** Sprint 2  

#### Description
No end-to-end tests for verification flow. Manual testing only.

#### Acceptance Criteria
- [ ] Test setup → OTP → verify → upload → submit → approve
- [ ] All success paths green
- [ ] Error paths handled
- [ ] CI/CD integration

#### Implementation Notes
See CODE_REVIEW_SPRINT1.md Issue #21

---

### [MEDIUM #17] Admin Role Assignment Documentation
**Assignee:** Ngam  
**Labels:** documentation, backend  
**Points:** 1  
**Milestone:** Sprint 1  

#### Description
No documented process for assigning admin role to first admin.

#### Acceptance Criteria
- [ ] Admin onboarding guide in docs/
- [ ] One-time SQL command documented
- [ ] Security considerations noted

#### Implementation Notes
First admin setup:
```sql
UPDATE public.profiles 
SET role = 'admin', verification_status = 'approved'
WHERE email = 'admin@sawaflix.com'
LIMIT 1;
```

---

### [MEDIUM #18] Database Migration Testing Script
**Assignee:** Both  
**Labels:** ops, testing, database  
**Points:** 2  
**Milestone:** Sprint 1  

#### Description
Database migrations should be tested before running on production.

#### Acceptance Criteria
- [ ] Test script created
- [ ] Validates all tables exist
- [ ] Validates all policies work
- [ ] Runs automatically in CI/CD

#### Implementation Notes
Script should test at end of database_migrations.sql

---

## 📊 Summary Statistics

| Priority | Count | Est. Hours | Owner |
|----------|-------|-----------|-------|
| 🔴 CRITICAL | 7 | 12 | Both |
| 🟠 HIGH | 6 | 8 | Both |
| 🟡 MEDIUM | 5 | 6 | Both |
| **TOTAL** | **18** | **26** | **Both** |

### By Developer
- **Wohking (Upload & Storage):** Issues #1, #2, #3, #8, #9, #13, #15
- **Ngam (Auth & OTP):** Issues #4, #5, #6, #7, #10, #11, #12, #14, #15
- **Shared:** Issues #10, #15, #16, #17, #18

---

## ⏱️ Priority Timeline

### **MUST DO BY FRIDAY 6 PM (8 hours)**
- [x] #1 - File size validation
- [x] #2 - Upload rate limiting
- [x] #3 - Database schema
- [x] #4 - Profile columns
- [x] #5 - OTP email sending
- [x] #6 - OTP verify rate limit
- [x] #7 - Middleware role check

### **SHOULD DO FRIDAY EVENING (2-3 hours)**
- [x] #8 - Audit trail logging
- [x] #12 - Rate limit tuning
- [x] #15 - Remove console logs

### **CAN DEFER TO SPRINT 2**
- [ ] #9 - Virus scanning
- [ ] #13 - File checksums
- [ ] #14 - Real-time session refresh
- [ ] #16 - Integration tests
- [ ] #17 - Admin documentation
- [ ] #18 - Migration testing script

---

## 🚀 How to Use This Document

1. **Copy/Paste into GitHub:**
   - Create new issue for each section
   - Use labels, assignee, points, milestone
   - Link to CODE_REVIEW_SPRINT1.md for details

2. **Track Progress:**
   - Mark checkboxes as complete
   - Update issue status in project board
   - Daily standup reviews

3. **Reference During Meeting:**
   - Show this list on Tuesday
   - Explain why each is critical
   - Get stakeholder sign-off

---

**Questions?** See CODE_REVIEW_SPRINT1.md for detailed explanations.

