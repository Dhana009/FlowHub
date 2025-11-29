# **FlowHub — Core Decisions (Locked)**

**Purpose:** Define core decisions that won't change throughout the project.

---

## **TECHNOLOGY STACK**

| Layer | Technology | Status |
|-------|-----------|--------|
| **Frontend** | React | ✅ Locked |
| **Backend** | Node.js | ✅ Locked |
| **Database** | MongoDB | ✅ Locked |
| **CSS Framework** | Tailwind CSS | ✅ Locked |

---

## **FRONTEND REQUIREMENTS**

**Semantic HTML & ARIA (Core Perspective):**
- ✅ Use semantic HTML elements (roles, labels, ARIA attributes)
- ✅ Add data-testid attributes for automation
- ✅ Focus on semantic meaning (not DOM structure)
- ✅ XPath/CSS selectors = last resort only

**Semantic Representation Requirements:**
Every UI element must have:
1. **Name** - What is it? (label, aria-label)
2. **Role** - What does it do? (button, textbox, checkbox, etc.)
3. **Properties** - What are its characteristics? (aria-required, aria-invalid, etc.)
4. **States** - What is its current state? (aria-disabled, aria-checked, aria-expanded, etc.)

**Why:**
- UI can change, but semantic meaning stays
- Automation remains stable when UI changes
- Proves value of semantic locators
- Easy to automate with Playwright (getByRole, getByLabel)
- Maintainable (semantic meaning doesn't change)

---

## **FOUR-DIMENSIONAL PURPOSE**

1. **SDLC Learning** - Understand full SDLC process
2. **UI Automation Showcase** - Semantic locators (not XPath/CSS)
3. **API Automation Showcase** - Comprehensive API testing
4. **Semantic Representation Proof** - UI changes don't break automation

---

## **ARCHITECTURE APPROACH**

- ✅ Monolithic backend (Node.js)
- ✅ React frontend (with semantic HTML/ARIA)
- ✅ MongoDB database
- ✅ Production-quality (not simple/toy)

---

**Status:** ✅ Core Decisions Locked  
**Flows:** 6 Core Flows (Flow 7 - Dashboard - deferred)  
**Next:** Start PRD Creation for 6 flows

