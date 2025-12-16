# FlowHub Core (SDET Edition)

A clean, testable application built for SDET portfolio and automation learning.

## Project Overview

FlowHub Core is a minimal but feature-rich item management application designed to:
1. **Demonstrate SDLC understanding** - Complete PRD, FS, Architecture documentation
2. **Serve as System Under Test (SUT)** - For comprehensive UI + API automation in Phase C
3. **Showcase automation skills** - Rich validation, error handling, dynamic UI behaviors

## Project Structure

```
flowhub-core/
├── docs/
│   ├── phase-b-guide.md          # Phase B execution guide
│   ├── requirements-locked.md    # Project scope & 6 flows
│   └── flows/
│       └── flow-1-auth/
│           ├── prd.md            # Product Requirements Document
│           ├── functional-spec.md # Functional Specification
│           └── architecture.md   # Architecture Design
├── src/                           # Code will go here (to be created)
│   ├── frontend/
│   ├── backend/
│   └── database/
└── README.md
```

## The 6 Core Flows

1. **Flow 1: Auth Flow** - Login, Sign-up, Password Reset, Logout
2. **Flow 2: Item Creation** - Form with validation, file upload, conditional fields
3. **Flow 3: Item List** - Pagination, sorting, filtering, search
4. **Flow 4: Item Details** - Modal popup, async loading
5. **Flow 5: Item Edit** - Pre-populated form, state-based rules
6. **Flow 6: Item Delete** - Confirmation modal, soft delete

## Current Status

✅ **Phase B Planning Complete:**
- Phase B guide created
- Requirements locked
- Flow 1 (Auth) - PRD, FS, Architecture complete

⏳ **Next Steps:**
- Flow 1 implementation (Step B4 - Coding Sequence Plan)
- Flows 2-6 planning (PRD, FS, Architecture)
- Code implementation

## Key Principles

- **Small in size, rich in behavior** - 6 flows with deep validation and error handling
- **Testability first** - Built for automation with semantic locators
- **SDLC complete** - Full documentation following real-world practices
- **Production-quality** - Clean code, proper architecture, comprehensive error handling

## Documentation

- [Phase B Guide](./docs/phase-b-guide.md) - Complete execution guide for Phase B
- [Requirements Locked](./docs/requirements-locked.md) - Project scope and 6 flows
- [Flow 1 PRD](./docs/flows/flow-1-auth/prd.md) - Authentication flow requirements

---

**Status:** Phase B - Planning Complete, Ready for Implementation  
**Last Updated:** December 2024

