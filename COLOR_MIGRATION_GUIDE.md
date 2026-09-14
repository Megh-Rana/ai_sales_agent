# Color Migration Guide - Old to New Pastel Scheme

## CSS Variable Changes Applied

### Dark Mode
```css
/* PRIMARY - Changed from Blue to Thistle */
--primary: #CDB4DB (was #2563EB)
--primary-hover: #D8C0E3 (was #3B82F6)
--primary-foreground: #0B0E14 (was #FFFFFF)

/* WARNING - Changed from Amber to Baby Pink */
--warning: #FFAFCC (was #F59E0B)
--warning-foreground: #0B0E14 (was #FFFFFF)

/* DANGER - Changed from Red to Pastel Petal */
--danger: #FFC8DD (was #EF4444)

/* INFO - Changed from Blue to Sky Blue */
--info: #A2D2FF (was #3B82F6)

/* ACCENT - Changed to Icy Blue */
--accent: #BDE0FE (was #0D9488)

/* BORDERS - Now use pastel colors */
--border-hover: #A2D2FF (was #3B82F6 blue)
--border-accent: #CDB4DB (was #2563EB blue)
```

### Light Mode  
```css
/* PRIMARY - Thistle (darker for light mode) */
--primary: #9B7EAD (was #1D4ED8 blue)
--primary-hover: #B094C4
--primary-muted: #F3EFF5

/* WARNING - Baby Pink variant */
--warning: #E689AC (was #D97706 amber)

/* DANGER - Pastel Petal variant */
--danger: #E6A4B8 (was #DC2626 red)

/* INFO - Sky Blue variant */
--info: #87B3E6 (was #2563EB blue)

/* ACCENT - Sky Blue */
--accent: #87CEEB (was #0F766E teal)
```

## Component-Specific Hardcoded Colors to Replace

### High Priority (Immediately Visible)
These need manual updates in JSX as they use hardcoded Tailwind classes:

1. **Amber badges and alerts** → Replace with `babyPink` or `warning`
   - `bg-amber-500` → `bg-babyPink` or `bg-warning`
   - `text-amber-400` → `text-babyPink` or `text-warning`
   - `border-amber-500` → `border-babyPink` or `border-warning`

2. **Blue primary buttons** → Replace with `thistle` or `primary`
   - `bg-blue-500` → `bg-thistle` or `bg-primary`
   - `text-blue-400` → `text-thistle` or `text-primary`

3. **Intent/Signal colors** → Map to pastel scheme
   - High Intent: `amber` → `babyPink` or `pastelPetal`
   - Info/Discovery: `blue` → `icyBlue` or `skyBlue`
   - Success: Keep `emerald` (functional color)

### Medium Priority (Context-Specific)
Replace based on component context:

```tsx
// Intent Score Badges
// OLD: bg-amber-500/10 text-amber-400
// NEW: bg-babyPink/10 text-babyPink

// Signal Indicators
// OLD: text-amber-400
// NEW: text-pastelPetal or text-babyPink

// Info Sections
// OLD: bg-blue-500/10 text-blue-400
// NEW: bg-icyBlue/10 text-icyBlue

// Discovery/Search
// OLD: text-blue-400
// NEW: text-skyBlue

// Analytics Highlights
// OLD: text-amber-400 (high performing)
// NEW: text-babyPink or text-pastelPetal
```

## Automatic Updates via CSS Variables

These will update automatically since they use CSS variables:

✅ `bg-primary` → Now thistle
✅ `text-primary` → Now thistle  
✅ `border-primary` → Now thistle
✅ `bg-warning` → Now baby pink
✅ `text-warning` → Now baby pink
✅ `bg-danger` → Now pastel petal
✅ `bg-info` → Now sky blue
✅ `hover:border-primary` → Now thistle

## Quick Find & Replace Patterns

Run these in your code editor for quick migration:

### Pattern 1: Intent Score Badges
```
Find: bg-amber-500/10 text-amber-400
Replace: bg-babyPink/10 text-babyPink
```

### Pattern 2: Warning/High Priority Badges
```
Find: bg-amber-500/20 text-amber-300
Replace: bg-pastelPetal/20 text-pastelPetal
```

### Pattern 3: Info/Discovery Icons
```
Find: text-blue-400
Replace: text-skyBlue (or text-icyBlue depending on context)
```

### Pattern 4: Buttons and CTAs
```
Find: bg-amber-400 hover:bg-amber-300
Replace: bg-thistle hover:bg-thistle/90
```

## Component Checklist

### Already Updated ✅
- [x] LandingPage header badge
- [x] LandingPage CTA buttons
- [x] FollowUpQueueCard (pastelPetal theme)
- [x] NextBestActionCard (thistle/icyBlue theme)
- [x] CopilotHeader Why Now box (skyBlue)
- [x] PreCallView Why Contact Now (icyBlue)
- [x] ConversationBriefCard (pastel colors)
- [x] CSS variables (primary, warning, danger, info)

### Need Manual Update 🔄
These files have hardcoded amber/blue colors:

- [ ] `FollowUpCard.tsx` (MEDIUM priority badges)
- [ ] `FollowUpHeader.tsx` (Clock icon)
- [ ] `AnalyticsInsightCard.tsx` ("Why It Matters")
- [ ] `IntentDistributionCard.tsx` (Very High intent)
- [ ] `SalesFunnelCard.tsx` (Funnel stages)
- [ ] `SourcePerformanceCard.tsx` (High intent leads)
- [ ] `IndustryPerformanceCard.tsx` (High intent count)
- [ ] `ExecutiveMetricsGrid.tsx` (High intent icon)
- [ ] `ConversionPerformanceCard.tsx` (Below average indicator)
- [ ] `CallHeader.tsx` (Paused state indicator)
- [ ] `CallFailureView.tsx` (No answer icon)
- [ ] `NextBestActionSection.tsx` (Delayed status)
- [ ] `UserMenu.tsx` (Theme toggle icons)
- [ ] `NoResultsIntelligence.tsx` (Recommendation sparkle)

## Testing Checklist

After applying changes:

1. **Visual Review**
   - [ ] Landing page looks pastel (not blue/amber)
   - [ ] Buttons use thistle (purple) theme
   - [ ] Badges use baby pink/pastel petal
   - [ ] Info sections use icy/sky blue
   - [ ] Borders have soft pastel tones

2. **Dark Mode**
   - [ ] Pastel colors are visible (not too dark)
   - [ ] Text contrast is adequate
   - [ ] Hover states work properly

3. **Light Mode**
   - [ ] Darker pastel variants show correctly
   - [ ] Background stays light/neutral
   - [ ] No jarring bright colors

4. **Interactive Elements**
   - [ ] Buttons have proper hover states
   - [ ] Focus rings visible
   - [ ] Active states clear

## Color Usage Guidelines

### When to use each color:

**Thistle (#CDB4DB)** - Primary actions, brand identity
- Main CTA buttons
- Primary navigation
- Active states
- Brand logo accents

**Pastel Petal (#FFC8DD)** - High priority, urgent items
- High priority badges
- Urgent notifications
- Important warnings (non-destructive)

**Baby Pink (#FFAFCC)** - Medium priority, warm accents
- Medium priority items
- Intent scores
- Warm highlights

**Icy Blue (#BDE0FE)** - Information, discovery
- Info boxes
- "Why Now" sections
- Discovery features
- Help/guidance

**Sky Blue (#A2D2FF)** - Intelligence, analytics
- Analytics sections
- Intelligence features
- Borders on focus
- Secondary info

**Emerald Green** - Keep for success (functional)
- Success messages
- Completed statuses
- Positive metrics

## Complete Color Reference

```typescript
// Pastel Palette
const colors = {
  thistle: '#CDB4DB',      // Primary
  pastelPetal: '#FFC8DD',  // High Priority/Danger
  babyPink: '#FFAFCC',     // Medium Priority/Warning
  icyBlue: '#BDE0FE',      // Info/Discovery
  skyBlue: '#A2D2FF',      // Intelligence/Secondary
};

// Functional Colors (Keep)
const functional = {
  success: '#10B981',      // Emerald - Success
  error: '#EF4444',        // Red - Errors (only for critical errors)
  neutral: '#64748B',      // Slate - Disabled/Muted
};
```

## Migration Strategy

1. **Phase 1: CSS Variables** ✅ DONE
   - Updated global theme colors
   - This affects ~70% of the UI automatically

2. **Phase 2: Component Badge Updates** 🔄 IN PROGRESS
   - Replace hardcoded amber badges
   - Replace hardcoded blue icons

3. **Phase 3: Analytics Colors** 📋 TODO
   - Update chart colors
   - Update metric indicators
   - Update distribution visualizations

4. **Phase 4: Edge Cases** 📋 TODO
   - Theme toggle icons
   - Status indicators
   - Special state colors

## Quick Wins

For immediate visual impact, update these 5 files:

1. `IntentDistributionCard.tsx` - Most visible analytics card
2. `AnalyticsInsightCard.tsx` - Appears on multiple pages
3. `SalesFunnelCard.tsx` - Large visual funnel
4. `FollowUpCard.tsx` - Many instances in UI
5. `UserMenu.tsx` - Always visible (theme toggle)

---

**Note**: Most changes are already applied via CSS variables. The remaining updates are for components that bypass the design system with hardcoded Tailwind colors.
