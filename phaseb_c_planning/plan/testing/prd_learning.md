# ⭐ PRD & Requirement Analysis — Master Reference

**Quick Navigation:**
- [1. Two Perspectives](#1-two-perspectives)
- [2. 4-Step Analysis Process](#2-4-step-requirement-analysis-process)
- [3. 7 Universal QA Patterns](#3-7-universal-qa-patterns)
- [4. Test Case Derivation](#4-how-test-cases-are-derived)
- [5. Ambiguity Detection](#5-ambiguity-detection)
- [6. Master Formula](#6-master-formula)
- [7. Practical Workflow](#7-practical-workflow)

---

## 1. Two Perspectives

### A. Product/Business Perspective — WHY we build

**What PRD explains:**
- Problem the feature solves
- Target users
- Why it matters
- Business goal it supports

**Example:**
```
PRD says: "Users struggle to find their saved projects. 
We need a search feature to improve user retention by 20%."

Business perspective: Retention problem → Search solution → 20% goal
```

**SDET takeaway:** This gives context, not test behavior.

---

### B. QA/SDET Perspective — WHAT to test

**What QA extracts:**
- Core flows (user journeys)
- Success criteria (expected behavior)
- Constraints (limits, assumptions)
- Gaps/ambiguities (what's missing)

**Example:**
```
PRD says: "Users can search projects by name, date, or status."

QA extracts:
- Core flows: Search by name, Search by date, Search by status
- Success criteria: Results match query, Results sorted by relevance
- Constraints: Search limited to user's own projects
- Ambiguity: What if no results? What if special characters?
```

**SDET takeaway:** This gives testability, coverage, and clarity.

---

## 2. 4-Step Requirement Analysis Process

### Step 1 — Identify Core Flows

**What:** Major user journeys (Login, Create, Edit, Delete, etc.)

**Example:**
```
PRD: "User Management Feature"

Core flows identified:
1. Create User
2. Edit User
3. Delete User
4. View User List
5. Search Users
```

**Output:** Functional backbone for all tests

---

### Step 2 — Extract Success Criteria

**What:** What "correct" behavior looks like

**Example:**
```
PRD: "When user creates an account, they receive a confirmation email."

Success criteria extracted:
✓ Email sent within 5 seconds
✓ Email contains user's name
✓ Email contains activation link
✓ User status = "pending_activation"
✓ User can't login until activated
```

**Output:** Validation & expected behavior test cases

---

### Step 3 — Identify Ambiguities

**What:** Requirements that are not clear, complete, or testable

**Example:**
```
PRD: "Users can upload profile pictures."

Ambiguities identified:
❓ Max file size? (Missing info)
❓ Allowed formats? (Missing info)
❓ What happens if upload fails? (Unspecified edge behavior)
❓ Can user delete/replace picture? (Unclear expected behavior)
❓ Storage limit per user? (Missing constraint)
```

**Output:** Negative tests, edge tests, questions for product team

---

### Step 4 — Convert to Test Scenarios

**What:** Transform everything into executable test cases

**Example:**
```
From PRD + Ambiguities → Test Scenarios:

Positive Tests:
- User uploads valid JPG image (2MB) → Success
- User uploads valid PNG image (1MB) → Success

Validation Tests:
- User uploads 10MB file → Error: "File too large"
- User uploads .exe file → Error: "Invalid format"
- User uploads without selecting file → Error: "Please select file"

Negative Tests:
- User uploads during network failure → Error handling
- User uploads same file twice → Behavior check
- User uploads while logged out → Permission check

Edge Tests:
- User uploads 0-byte file → Boundary check
- User uploads exactly 5MB (limit) → Boundary check
- User uploads file with special characters in name → Edge case
```

**Output:** Complete test coverage matrix

---

## 3. 7 Universal QA Patterns

**These patterns reveal 80% of test scenarios, even with incomplete PRDs.**

### Pattern 1: Happy Path
**Question:** What's the ideal user journey?

**Example:**
```
Feature: Password Reset

Happy Path:
1. User clicks "Forgot Password"
2. Enters email
3. Receives reset link
4. Clicks link
5. Enters new password
6. Confirms new password
7. Successfully logs in with new password
```

---

### Pattern 2: Validation Pattern
**Question:** What rules must be enforced?

**Example:**
```
Feature: User Registration

Validations:
- Email format must be valid
- Password: 8+ chars, 1 uppercase, 1 number
- Username: 3-20 chars, alphanumeric only
- Age: 18+ required
- Terms checkbox: Must be checked
```

---

### Pattern 3: Error-Handling Pattern
**Question:** What happens when things go wrong?

**Example:**
```
Feature: Payment Processing

Error scenarios:
- Invalid card number → Show error
- Expired card → Show error
- Insufficient funds → Show error
- Network timeout → Retry mechanism
- Server error → Graceful degradation
```

---

### Pattern 4: Permission Pattern
**Question:** Who can do what?

**Example:**
```
Feature: Document Management

Permissions:
- Admin: Create, Edit, Delete, View all
- Editor: Create, Edit own, View all
- Viewer: View only
- Guest: No access

Test: Editor tries to delete admin's document → Denied
```

---

### Pattern 5: State-Change Pattern (Before → After)
**Question:** How does system state change?

**Example:**
```
Feature: Order Status

State transitions:
Draft → Submitted → Processing → Shipped → Delivered

Before: Order.status = "Draft"
Action: User submits order
After: Order.status = "Submitted", Order.submitted_at = timestamp

Test: Verify state change + timestamp + audit log
```

---

### Pattern 6: UI–Backend Consistency Pattern
**Question:** Does UI match backend state?

**Example:**
```
Feature: Shopping Cart

UI shows: 3 items, $150 total
Backend API: GET /cart returns 3 items, $150 total

Test:
1. Add item via UI → Verify API reflects change
2. Remove item via API → Verify UI updates
3. Price change in backend → Verify UI updates
```

---

### Pattern 7: Edge/Boundary Pattern
**Question:** What happens at limits?

**Example:**
```
Feature: Character Limit

Boundaries:
- Max length: 1000 characters
- Test: 999 chars → Success
- Test: 1000 chars → Success
- Test: 1001 chars → Error
- Test: 0 chars (empty) → Validation check
- Test: Special chars, emojis, unicode → Edge cases
```

---

## 4. How Test Cases Are Derived

### Positive Tests → From PRD Happy Path

**Source:**
- Happy path in PRD
- Defined flow steps
- Success criteria

**Example:**
```
PRD: "User can create a task with title and due date."

Positive test:
- User creates task with valid title and future date → Task created successfully
```

---

### Validation Tests → From Success Criteria & Rules

**Source:**
- Success criteria
- Constraints
- Explicit rules in PRD

**Example:**
```
PRD: "Task title must be 1-100 characters."

Validation tests:
- Title = 1 char → Valid
- Title = 100 chars → Valid
- Title = 0 chars → Invalid
- Title = 101 chars → Invalid
- Title = null → Invalid
```

---

### Negative & Edge Tests → From Ambiguities & Expertise

**Source:**
- Ambiguities
- Missing information
- Unspecified failures
- Permissions + errors + boundaries
- What PRD does NOT describe

**Example:**
```
PRD: "User can delete their own tasks."

PRD doesn't mention:
- What if task is in use by another user?
- What if user deletes while offline?
- What if task has subtasks?
- Soft delete or hard delete?
- Undo functionality?

These become negative/edge tests (80% of test coverage)
```

---

## 5. Ambiguity Detection

### The 3-Question Test

A requirement is ambiguous if you answer "NO" to any:

1. **Is it complete?** (All necessary info present?)
2. **Is it clear?** (No multiple interpretations?)
3. **Is it testable?** (Can I write a test for this?)

---

### Types of Ambiguities with Examples

#### 1. Missing Info
```
PRD: "Users can upload files."

Missing:
- File size limit?
- Allowed formats?
- Storage location?
- Upload timeout?
```

#### 2. Contradiction
```
PRD says:
- "Users can delete their account" (Section 3.1)
- "Deleted accounts are permanently removed" (Section 3.2)
- "Users can recover deleted accounts within 30 days" (Section 5.4)

Contradiction: Permanent vs. 30-day recovery
```

#### 3. Unclear Expected Behavior
```
PRD: "System should handle errors gracefully."

Unclear:
- What does "gracefully" mean?
- Show error message? Log error? Retry? Fallback?
- User-facing message or technical error?
```

#### 4. Unspecified Edge Behavior
```
PRD: "Users can schedule meetings."

Unspecified:
- What if two meetings overlap?
- What if meeting time is in the past?
- What if timezone changes?
- What if user deletes calendar?
```

#### 5. Assumption-Based Parts
```
PRD: "Feature works with existing authentication."

Assumption:
- Which auth system? OAuth? JWT? Session?
- Does it support SSO?
- What about 2FA?
```

---

## 6. Master Formula

**One-liner to remember:**

> **PRD gives the happy path and success rules.  
> QA fills the gaps by identifying ambiguities and using universal patterns to create positive, negative, and edge test cases.**

**Visual breakdown:**
```
PRD Content (20%)
├── Happy Path → Positive Tests
└── Success Criteria → Validation Tests

QA Expertise (80%)
├── Ambiguities → Negative Tests
├── 7 Patterns → Edge Tests
└── Missing Info → Questions + Test Scenarios
```

---

## 7. Practical Workflow

### The 7-Step Process (Use for Every Feature)

```
Step 1: Read PRD once
  → Identify core flows
  → Output: List of major user journeys

Step 2: Read PRD again
  → Extract success criteria
  → Output: Validation rules & expected behaviors

Step 3: Apply 7 QA patterns
  → Happy Path, Validation, Error, Permission, State, Consistency, Edge
  → Output: Pattern-based test scenarios

Step 4: Identify ambiguities
  → Ask: Clear? Complete? Testable?
  → Output: List of questions + assumptions

Step 5: Convert to test scenarios
  → Positive tests (from PRD)
  → Validation tests (from criteria)
  → Negative tests (from ambiguities)
  → Edge tests (from patterns)
  → Output: Complete test matrix

Step 6: Clarify ambiguities
  → Discuss with product team
  → Update test scenarios
  → Output: Finalized requirements

Step 7: Finalize + Automate
  → Prioritize test scenarios
  → Plan automation strategy
  → Output: Test plan + automation roadmap
```

---

## Quick Reference Cheat Sheet

### When Reading a PRD, Always Ask:

**Core Flows:**
- [ ] What are the main user journeys?
- [ ] What actions can users perform?

**Success Criteria:**
- [ ] What defines "success"?
- [ ] What validations exist?
- [ ] What are the business rules?

**Ambiguities:**
- [ ] Is it complete? (All info present?)
- [ ] Is it clear? (No multiple meanings?)
- [ ] Is it testable? (Can I write a test?)

**Patterns:**
- [ ] Happy path?
- [ ] Validations?
- [ ] Error handling?
- [ ] Permissions?
- [ ] State changes?
- [ ] UI-backend consistency?
- [ ] Boundaries/edges?

### Test Case Mapping:

```
PRD Happy Path        → Positive Tests
Success Criteria      → Validation Tests
Ambiguities           → Negative Tests
7 Patterns            → Edge Tests
Missing Info          → Questions + Tests
```

---

## Real-World Example: Complete Analysis

### PRD Excerpt:
> "Users can create and share project boards. Each board has a name, description, and can contain multiple tasks. Users can invite team members via email. Boards are private by default."

### Step 1: Core Flows
1. Create Board
2. Edit Board
3. Delete Board
4. Share Board (Invite members)
5. View Board

### Step 2: Success Criteria
- Board name required
- Board description optional
- Board is private by default
- Invitation sent via email
- User can add tasks to board

### Step 3: Apply Patterns

**Happy Path:**
- User creates board → Board created with default settings

**Validation:**
- Board name: Required, max 100 chars
- Email format: Must be valid for invitations

**Error Handling:**
- Invalid email → Show error
- Duplicate board name → Behavior?

**Permission:**
- Who can edit board? (Owner only? Team members?)
- Who can delete board?

**State Change:**
- Before: Board.visibility = "private"
- Action: User shares board
- After: Board.visibility = "shared", Board.members = [email1, email2]

**Consistency:**
- UI shows 5 tasks → API returns 5 tasks

**Edge:**
- Board name = 100 chars (max) → Valid?
- Board name = 101 chars → Error?
- Invite same email twice → Behavior?

### Step 4: Ambiguities Identified
1. ❓ Can user change board visibility after creation?
2. ❓ What if invited email doesn't exist?
3. ❓ Can user delete board with active tasks?
4. ❓ Max number of team members per board?
5. ❓ Can user remove team members?
6. ❓ What if user deletes account with shared boards?

### Step 5: Test Scenarios Generated

**Positive:**
- Create board with valid name → Success
- Create board with name + description → Success
- Invite valid email → Invitation sent

**Validation:**
- Create board without name → Error
- Board name > 100 chars → Error
- Invite invalid email format → Error

**Negative:**
- Invite non-existent email → Behavior check
- Delete board with tasks → Behavior check
- Invite same email twice → Behavior check

**Edge:**
- Board name = exactly 100 chars → Valid
- Board name = empty string → Invalid
- Invite 100 team members → Limit check

---

## Interview Talking Points

**When asked: "How do you analyze requirements?"**

1. **Two perspectives:** Business (why) + QA (what to test)
2. **4-step process:** Flows → Criteria → Ambiguities → Scenarios
3. **7 patterns:** Universal patterns that reveal 80% of test cases
4. **80/20 rule:** PRD gives 20% (happy path), QA expertise gives 80% (negative/edge)
5. **Ambiguity detection:** Clear? Complete? Testable?

**Example response:**
> "I read PRDs from two angles: business context and testability. I extract core flows and success criteria first, then apply 7 universal QA patterns to reveal missing scenarios. The PRD typically covers 20%—the happy path. My job is to identify the 80%—ambiguities, edge cases, and negative scenarios—using patterns like error handling, permissions, state changes, and boundaries. I always validate: Is it clear? Complete? Testable? This systematic approach ensures comprehensive coverage."

---

**Save this reference. Use it for every PRD you analyze.**