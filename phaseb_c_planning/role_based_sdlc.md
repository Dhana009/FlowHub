# **FlowHub — Role-Based SDLC**

**Purpose:** Define roles and execution sequence for SDLC.

---

## **ROLES**

| Role | When | What They Do | Deliverable |
|------|------|-------------|-------------|
| **Product Manager** | Step 0.1, 0.3 | Write PRD, answer questions | PRD Document |
| **Tester/SDET** | Step 0.2 | Find ambiguities, ask questions | Ambiguity List |
| **Business Analyst** | Step 2.1 | Write functional spec | FS Document |
| **Software Architect** | Step 1.1, 3.1-3.4 | Design system, choose tech | Architecture Docs |
| **Senior Developer** | Step 4.1-4.4 | Write detailed specs | Spec Documents |
| **SDET Lead** | Step 4.5 | Design test strategy | Test Strategy |
| **Development Team** | Step 5.1 | Build application | Working App |

---

## **EXECUTION SEQUENCE**

**Phase 0: Requirements**
- 0.1: Product Manager → PRD
- 0.2: Tester → Ambiguity Analysis
- 0.3: Product Manager → Clarifications

**Phase 1: Tech Decisions**
- 1.1: Architect → Technology Stack

**Phase 2: Functional Spec**
- 2.1: Business Analyst → FS

**Phase 3: Architecture**
- 3.1: Architect → Database Schema
- 3.2: Architect → API Contract
- 3.3: Architect → Backend Architecture
- 3.4: Architect → Frontend Architecture

**Phase 4: Detailed Specs**
- 4.1: Developer → Validation Specs
- 4.2: Developer → Business Logic Specs
- 4.3: Developer → UI/UX Specs
- 4.4: Developer → Error Handling Specs
- 4.5: SDET Lead → Test Strategy

**Phase 5: Development**
- 5.1: Development Team → Build

---

## **RULES**

1. One role at a time
2. Complete deliverable before switching
3. Each role builds on previous work

---

## **NEXT STEP**

**Role:** Product Manager  
**Task:** Create PRD  
**Deliverable:** PRD Document

