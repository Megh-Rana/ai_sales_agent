# DESIGN CONSTITUTION: VIDUR AI SALES OPERATING SYSTEM

> **Version:** 1.0.0  
> **Status:** Approved Foundation  
> **Target Platform:** B2B Enterprise AI Sales Intelligence & Autonomous Sales Agent OS  
> **Design Philosophy:** *"Find the right prospect at the right moment and help sales teams act immediately."*

---

## 1. PRODUCT VISION & CORE PHILOSOPHY

Vidur is not a CRM wrapper, a lead database dashboard, or an AI novelty project.  
It is a high-velocity **AI Sales Operating System** engineered for B2B sales teams, BDRs, founders, and sales managers.

### The Core Sales Loop
Every view, feature, component, and micro-interaction directly moves an opportunity through this continuous 10-step backbone:

```
[ DISCOVER ] ➔ [ DETECT INTENT ] ➔ [ UNDERSTAND ] ➔ [ ENRICH ] ➔ [ GENERATE PITCH ]
                                                                        │
[ CONVERSION ] ◄─ [ MEETING ] ◄─ [ FOLLOW UP ] ◄─ [ QUALIFY ] ◄─ [ CONTACT ]
```

### Core User Questions
Every screen in Vidur must answer these six questions within **3 seconds** of visual scan:
1. **What opportunities exist right now?**
2. **Which prospects are highest priority?**
3. **Why should I contact them at this exact moment?**
4. **What exact pitch/approach should I use?**
5. **What happened during/after the last touchpoint?**
6. **What is the exact Next Best Action?**

---

## 2. VISUAL PRINCIPLES & ANTI-PATTERNS

### Human Design Principles
* **Intentional Asymmetry:** Avoid rigid cookie-cutter layouts across screens. Different workflows demand distinct visual compositions:
  * *Dashboard:* High-signal focus split — priority queue + real-time pipeline status + live sales agent activity.
  * *Lead Discovery:* Query workbench + dense tabular/card results with intent badges + direct drill-down drawer.
  * *Lead Details:* Dense multi-column breakdown — company intel + intent breakdown + generated pitch brief + direct action panel.
  * *AI Calling / Agent:* Immersive voice & transcript session view with live sentiment graph, real-time qualification triggers, and call controls.
  * *Call Result & Summary:* Executive summary + qualification scorecards + objection log + one-click follow-up dispatch.
  * *Campaigns:* Workflow builder + live cadence performance metrics.
* **Information Density over Wasted Whitespace:** High-performing sales professionals demand immediate access to actionable metrics. We use compact padding, crisp typography hierarchy, and dense metadata groupings without clutter.
* **Single Primary CTA per Key View:** Eliminate decision paralysis. Every view has exactly one dominant call-to-action (e.g., "AI Call", "Launch Campaign", "View Opportunity", "Schedule Follow-up").

### Mandatory Anti-AI-Generated UI Rules (FORBIDDEN)
To ensure Vidur feels like an authentic, top-tier B2B commercial product, the following AI clichés are **STRICTLY PROHIBITED**:
* ❌ NO excessive glassmorphism, hyper-blur, or frosted acrylic backgrounds over full pages.
* ❌ NO neon purple/blue gradient backgrounds or rainbow highlights.
* ❌ NO giant floating glowing blobs, ambient lights, or decorative 3D objects.
* ❌ NO repetitive 3-column card grids applied mindlessly across every page.
* ❌ NO arbitrary rounded cards where every single UI element is boxed inside a rounded rectangle.
* ❌ NO generic "AI sparkle" icons ($\text{✨}$) sprinkled randomly across static buttons or headers.
* ❌ NO decorative charts that present meaningless wavy trendlines with no sales context.
* ❌ NO giant hero headings taking up half the viewport on operational dashboards.
* ❌ NO fake, unbelievable statistics or sci-fi sci-tech UI chrome.

---

## 3. COLOR SYSTEM & TOKENS

Vidur uses a restrained, high-contrast dark enterprise palette. Colors represent **state, urgency, and signal intent** — never generic decoration.

```scss
// Backgrounds & Base Surfaces
--bg-app:          #0B0E14; // Ultra-deep neutral charcoal
--bg-surface-0:    #12161F; // Primary panel background
--bg-surface-1:    #1A202C; // Elevate cards / containers
--bg-surface-2:    #242C3D; // Interactive element default / subtle hover
--bg-surface-3:    #2D374D; // Active state / elevated overlay

// Borders & Structure
--border-subtle:   #1E2638; // Structural grid lines
--border-default:  #2B354C; // Standard component borders
--border-focus:    #3B82F6; // Active input focus ring
--border-accent:   rgba(59, 130, 246, 0.4);

// Text & Hierarchy
--text-primary:    #F8FAFC; // 100% legibility off-white
--text-secondary:  #94A3B8; // Slate muted body & metadata
--text-tertiary:   #64748B; // De-emphasized labels & hints
--text-inverse:    #090D16; // Text on high-light backgrounds

// Enterprise Primary Brand Accent (Single Dominant Accent)
--accent-primary:  #2563EB; // Cobalt / Royal Blue
--accent-hover:    #3B82F6;
--accent-subtle:   rgba(37, 99, 235, 0.12);

// Intent & Sales Signal State Colors
--signal-high:     #F59E0B; // Amber / Orange (High Buying Intent Signal)
--signal-high-subtle: rgba(245, 158, 11, 0.12);

--signal-qualified:#10B981; // Emerald Green (Qualified / High Conversion)
--signal-qualified-subtle: rgba(16, 185, 129, 0.12);

--signal-urgent:   #EF4444; // Crimson Red (Hot Opportunity / Immediate Action)
--signal-urgent-subtle: rgba(239, 68, 68, 0.12);

--signal-neutral:  #64748B; // Low intent / cold prospect
```

---

## 4. TYPOGRAPHY HIERARCHY

System Sans-Serif font stack with crisp rendering optimizations (`Inter`, `system-ui`, `-apple-system`, sans-serif).

| Role | Font Size | Line Height | Weight | Letter Spacing | Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | 32px – 36px | 1.2 | 700 (Bold) | -0.02em | Key opportunity value highlights, major metrics |
| **Page Title** | 22px – 24px | 1.3 | 600 (SemiBold) | -0.01em | Top-level navigation headers, drawer titles |
| **Section Title** | 16px – 18px | 1.4 | 600 (SemiBold) | -0.005em | Card headers, table section titles, panel headings |
| **Body Primary** | 14px – 15px | 1.5 | 400 (Regular) | 0 | Lead bios, call briefs, activity notes |
| **Body Medium** | 14px – 15px | 1.5 | 500 (Medium) | 0 | Interactive labels, tab titles, table cells |
| **Metadata / Micro** | 12px – 13px | 1.4 | 500 (Medium) | +0.01em | Intent breakdown bullet points, timestamps, badges |

---

## 5. BORDER RADIUS & ELEVATION

Vidur maintains a crisp, modern B2B structural aesthetic.

* **Buttons & Inputs:** `8px` (`rounded-lg`)
* **Badges & Tags:** `6px` (`rounded-md`)
* **Standard Cards & Panels:** `10px – 12px` (`rounded-xl`)
* **Modals & Drawers:** `14px – 16px` (`rounded-2xl`)
* **Dense Data Tables:** `6px` or square borders with subtle row dividers (`border-subtle`).

### Depth & Shadows
* **Flat Borders First:** Rely on `--border-subtle` and subtle background step-ups for layout structure.
* **Overlay Drop Shadow:** `shadow-xl` (`0 20px 25px -5px rgba(0, 0, 0, 0.5)`) reserved strictly for floating drawers, dropdown menus, and popover modals.

---

## 6. TERMINOLOGY DICTIONARY (SALES-FIRST LANGUAGE)

Generic AI buzzwords are replaced with authoritative B2B sales intelligence terminology:

| ❌ Forbidden Generic AI Term | ✅ Required Vidur Sales Term | Context / Definition |
| :--- | :--- | :--- |
| *AI Score* | **Intent Score** | Quantitative metric (0-100) indicating active buying signals |
| *AI Insights* | **Sales Intelligence** | Real-time market data, trigger events, and buyer context |
| *AI Recommendation* | **Next Best Action** | Clear execution recommendation for sales reps |
| *AI Summary* | **Call Brief** | Post-call executive breakdown and outcome briefing |
| *AI Response* | **Recommended Pitch** | Contextually tailored outbound script / opening hook |
| *Lead* | **Opportunity** | Qualified entity with demonstrated intent or fit |
| *AI Generator* | **Cadence Studio / Pitch Builder** | Workflow for generating personalized sales approaches |

---

## 7. AI VISUAL LANGUAGE & STATES

AI is depicted through **dynamic system activity and real-time state transitions**, never static decorative illustrations.

### Active AI States
1. **`DISCOVERING`** – Scanning web sources, job boards, funding feeds for buying signals.
2. **`ANALYZING`** – Processing prospect tech stacks, executive changes, and requirements.
3. **`ENRICHING`** – Pulling verified contact details, LinkedIn activity, and corporate data.
4. **`GENERATING`** – Crafting tailored value propositions and objection handbooks.
5. **`CALLING`** – Voice agent engaged in active dialogue with live sentiment tracking.
6. **`QUALIFYING`** – Evaluating BANT criteria (Budget, Authority, Need, Timeline) post-touchpoint.

### Visual Indicators
* **State Pill:** Muted background with a 6px pulsating status indicator light:
  * Amber pulse $\rightarrow$ Active Intent Analysis
  * Emerald solid $\rightarrow$ Signal Qualified & Ready for Action
  * Blue pulse $\rightarrow$ Autonomous AI Agent Active / Dialing

---

## 8. INTENT-FIRST EXPLANATION MODEL

Intent scores must be **fully explainable**. Never present a raw number without transparent provenance and reasoning.

### Intent Score Card Standard Structure
* **Header:** Score display (e.g. `94 / 100`) + Intent Velocity indicator (`High Intent - 24h`).
* **Why Now? (Buying Signal Breakdown):**
  * `+ Recent hiring post for Head of Sales Ops (48h ago)`
  * `+ Tech stack update: Migrated off legacy CRM`
  * `+ Series-B Funding round announced ($18M)`
  * `+ High category match: Looking for outbound automation`
* **Source Provenance Link:** Clickable badge linking to exact signal source (e.g. public job posting, press release, LinkedIn event).

---

## 9. MOTION & INTERACTION PHILOSOPHY (FRAMER MOTION)

Animations are utilitarian, responsive, and state-aware.

### Timing Guidelines
* **Micro-interactions (Hover, Click, Toggle):** `150ms – 200ms` (`easeOut`)
* **Card Expansion / Drawer Slide:** `250ms – 300ms` (`cubic-bezier(0.16, 1, 0.3, 1)`)
* **Page Transitions:** `200ms – 250ms` opacity cross-fade
* **Data Visualization & Counter Updates:** `400ms – 600ms`
* **AI Signal Processing Signature:** Dynamic multi-stage pulse transition

### Signature Product Animation: "Intent Detection Sequence"
When discovering or scanning opportunities:
1. **Stage 1 (Pulse Scan):** Subtle horizontal scan line across the opportunity row (`1.5s` linear loop).
2. **Stage 2 (Signal Match):** Intent score pill animates count from `0` to `Target Score` with an amber glow border burst.
3. **Stage 3 (Action Unlock):** "AI Call" / "Contact Now" primary button transitions from muted disabled state to vibrant blue accent.

---

## 10. COMPONENT SYSTEM ARCHITECTURE

The application will be constructed with modular, strictly typed React + TypeScript components using Tailwind CSS:

```
src/
├── components/
│   ├── ui/                    # Base Primitives
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Drawer.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── Tabs.tsx
│   │   ├── ScoreIndicator.tsx
│   │   ├── StatusIndicator.tsx
│   │   └── Tooltip.tsx
│   ├── sales/                 # Domain Sales Components
│   │   ├── IntentScoreCard.tsx
│   │   ├── OpportunityCard.tsx
│   │   ├── NextBestActionBanner.tsx
│   │   ├── SalesBriefPanel.tsx
│   │   ├── CallTranscriptViewer.tsx
│   │   ├── LiveDialerModal.tsx
│   │   ├── QualificationMatrix.tsx
│   │   └── SignalSourceBadge.tsx
│   ├── layout/                # Global Structure
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── CommandPalette.tsx
│   │   └── PageContainer.tsx
├── pages/                     # Full Workflow Views
│   ├── Dashboard.tsx          # Priority queue + pipeline overview
│   ├── LeadDiscovery.tsx      # Signal discovery & prospect finder
│   ├── LeadDetails.tsx        # Prospect 360 intelligence & pitch builder
│   ├── AICalling.tsx          # Real-time voice agent interaction hub
│   ├── CallResults.tsx        # Call summary & auto follow-up dispatcher
│   ├── Campaigns.tsx          # Autonomous outreach cadence manager
│   └── Analytics.tsx          # Pipeline velocity & conversion metrics
├── services/                  # Clean Mock Data & API Contracts
│   ├── mockData.ts            # Realistic B2B sales data layer
│   └── api.ts                 # Service facade for backend integration
├── types/                     # TypeScript interfaces
│   └── sales.ts               # Core domain types
└── styles/
    └── globals.css            # Tailwind directives & token variables
```

---

## 11. ACCESSIBILITY & PERFORMANCE REQUIREMENTS

* **Keyboard Navigation:** Full focus trap inside drawers and live dialer modals. Navigation accessible via `Tab`, `Shift+Tab`, `Esc`.
* **Focus States:** High contrast `2px` focus ring (`--border-focus`) on all interactive controls.
* **Reduced Motion Support:** Respect `prefers-reduced-motion: reduce` by disabling non-essential transitions.
* **Semantic HTML:** Strict adherence to `<main>`, `<nav>`, `<aside>`, `<header>`, `<article>`, `<section>`, `<table>`.

---

## 12. ARCHITECTURAL AUDIT & PRESERVATION REPORT

### 1. Existing Workspace Audit
* **Workspace Directory:** `c:\Users\NEEL\Desktop\Vidur`
* **Current Status:** Clean, newly initialized empty workspace directory.
* **Preservation Plan:** As no legacy spaghetti code exists, we are establishing a clean, standard Vite + React + TypeScript + Tailwind CSS foundation from the ground up, guaranteeing optimal performance and zero legacy technical debt.

### 2. Proposed Tech Stack Specifications
* **Core Framework:** Vite + React 18 + TypeScript (Strict mode enabled)
* **Styling Engine:** Tailwind CSS + Vanilla CSS Custom Tokens
* **Icons & Visual Assets:** Lucide React (`lucide-react`)
* **Motion & Animation:** Framer Motion (`framer-motion`)
* **Charts & Visual Data:** Recharts (`recharts`)
* **Toast & Notifications:** Sonner (`sonner`)
* **Class Utilities:** `clsx` + `tailwind-merge`

---

*This document serves as the binding Design Constitution for Vidur AI Sales Operating System.*
