# VIDUR DESIGN SYSTEM SPECIFICATION

> **Version:** 1.0.0  
> **Status:** Production Ready  
> **Target Platform:** B2B AI Sales Intelligence & Autonomous Sales OS

---

## 1. DESIGN CONSTITUTION ALIGNMENT

Vidur is built on an enterprise dark foundation engineered for readability, high data density, and explainable AI intelligence.

### Core Philosophy
*"Find the right prospect at the right moment and help sales teams act immediately."*

### Anti-Pattern Checklist
- ❌ NO neon purple/blue gradient backgrounds
- ❌ NO excessive glassmorphism or hyper-blur
- ❌ NO giant floating glowing blobs
- ❌ NO generic AI sparkle icons ($\text{✨}$) on static buttons
- ❌ NO meaningless decorative wavy charts

---

## 2. COLOR TOKENS

```scss
// Backgrounds & Base Surfaces
$bg-app:                #0B0E14; // Near-black charcoal base
$surface-default:       #12161F; // Primary panel background
$surface-hover:         #1A202C; // Container hover & table rows
$surface-elevated:      #242C3D; // Cards & dropdown overlays
$surface-highlight:     #2D374D; // Active item highlight

// Structural Borders
$border-subtle:         #1E2638; // Row dividers & soft edges
$border-default:        #2B354C; // Standard component borders
$border-hover:          #3B82F6; // Active input focus ring

// Typography
$text-primary:          #F8FAFC; // 100% legibility off-white
$text-secondary:        #94A3B8; // Slate muted body & metadata
$text-tertiary:         #64748B; // De-emphasized labels & hints

// Brand & Semantic Accents
$primary-accent:        #2563EB; // Cobalt / Royal Blue
$signal-high:           #F59E0B; // Amber (High Buying Signal)
$signal-qualified:      #10B981; // Emerald (BANT Qualified)
$signal-urgent:         #EF4444; // Crimson (Hot Deal / Immediate Action)
```

---

## 3. TYPOGRAPHY SCALE

| Role | Font Size | Weight | Class Utility |
| :--- | :--- | :--- | :--- |
| **Display** | 36px (2.25rem) | 700 (Bold) | `.text-display` |
| **Header 1** | 24px (1.5rem) | 600 (SemiBold) | `.text-h1` |
| **Header 2** | 20px (1.25rem) | 600 (SemiBold) | `.text-h2` |
| **Header 3** | 18px (1.125rem) | 600 (SemiBold) | `.text-h3` |
| **Header 4** | 16px (1rem) | 600 (SemiBold) | `.text-h4` |
| **Body Primary** | 14px (0.875rem) | 400 (Regular) | `.text-body` |
| **Body Medium** | 14px (0.875rem) | 500 (Medium) | `.text-body-medium` |
| **Small / Badge** | 12px (0.75rem) | 500 (Medium) | `.text-small` |
| **Caption** | 12px (0.75rem) | 400 (Regular) | `.text-caption` |
| **Metric** | 28px (1.75rem) | 700 (Bold Monospace) | `.text-metric` |

---

## 4. SPACING & LAYOUT SCALE

4px grid system:
* `1` = 4px
* `2` = 8px
* `3` = 12px
* `4` = 16px
* `6` = 24px
* `8` = 32px
* `12` = 48px
* `16` = 64px

---

## 5. BORDER RADIUS & SHADOW SYSTEM

* **Small Controls (`sm`):** `6px` (`rounded-md` - Inputs, Badges)
* **Medium Controls (`md`):** `8px` (`rounded-md` - Buttons)
* **Cards & Containers (`card`):** `12px` (`rounded-xl`)
* **Modals & Drawers:** `16px` (`rounded-2xl`)

Shadows are soft and functional:
* `shadow-sm`: Subtle separation
* `shadow-xl`: Modal / Drawer elevation
* `shadow-glow-amber`: Accent highlight on high-intent scores
* `shadow-glow-blue`: Active opportunity card selection

---

## 6. COMPONENT LIBRARY SUMMARY

### Base Primitives (`src/components/ui/`)
* `Button`: Primary, Secondary, Ghost, Danger, Success, Icon with Framer Motion micro-interactions.
* `Input` & `SearchInput`: High contrast focus rings, error messages, shortcut indicators (`⌘K`).
* `Select` & `Textarea`: Form controls.
* `Badge`: Semantic badges (`high-intent`, `qualified`, `urgent`, `calling`, `follow-up`).
* `Tooltip`: Hover popovers.
* `Modal` & `Drawer`: Sliding drawer panels and confirmation modals with backdrop blur.
* `Tabs`: Spring-animated active tab indicators.
* `Avatar`: User, Company, and software agent `AIAvatar`.

### Sales Domain Components (`src/components/sales/`)
* `IntentScore`: 0–100 score, intent level, and expandable "Why now?" provenance rationale.
* `SalesStatus`: Real-time deal status pills.
* `OpportunityCard`: High-density prospect card with CTA.
* `NextBestAction`: Visually prominent execution recommendation banner.
* `QualificationMatrix`: BANT qualification scorecard.
* `SignalSourceBadge`: Direct link & origin tracking for public buying signals.

### AI Intelligence Components (`src/components/ai/`)
* `AIStatus`: State-driven activity indicator (`Discovering`, `Analyzing`, `Enriching`, `Calling`).
* `AISalesBrief`: Structured pitch brief with objective, trigger context, opening script, and objection handbook.
* `AIProcessing`: Dynamic system activity progress card.
* `IntentDetectionAnimation`: 5-stage signature animation flow for intent discovery.

### Data & Feedback Components (`src/components/data/`, `src/components/feedback/`)
* `Metric`: Sales KPI metric cards.
* `DataTable`: B2B tabular data grid with sorting, pagination, and empty/loading states.
* `ActivityTimeline`: Touchpoint & AI log timeline.
* `EmptyState`, `Skeleton`, `ErrorState`: Useful feedback indicators.

---

## 7. MOTION & ACCESSIBILITY RULES

* **Framer Motion Durations:** Micro (180ms), Interaction (250ms), Page (300ms), Data (500ms).
* **Keyboard Nav:** Focus trap on modals/drawers, `Esc` dismiss handlers, high-contrast focus rings.
