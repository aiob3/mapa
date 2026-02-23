# MAPA Narrative Ecosystem - System Guidelines & Design Rules

> **System Guidelines**
> This file provides the AI and Figma Agents with the absolute rules and guidelines for generating and componentizing the MAPA UI.
> This is the ultimate Source of Truth. Any conflicting legacy instructions must be overridden by this document.

---

## 1. GENERAL & LANGUAGE GUIDELINES (CRITICAL)

**[CRITICAL LANGUAGE INSTRUCTION]:** ALL UI CONTENT, TEXT, LABELS, AND DATA MUST BE GENERATED AND MAINTAINED IN PORTUGUESE (PT-BR). Do not translate the interface content to English, even though these system instructions are in English. This includes placeholder text, empty states, and technical error messages (e.g., use "Nenhum dado encontrado" instead of "No data found").

* **Layout Architecture & Boundaries:** Only use absolute positioning when absolutely necessary (e.g., floating tooltips, specific decorative glass orbs). Opt for responsive, robust, and fluid layouts. **CRITICAL:** Maintain a unified layout structure across ALL pages. Use a centralized container with a maximum width (e.g., `max-w-7xl mx-auto` or `max-w-screen-xl`) to keep the content aligned. Prevent cards and grids from breaking these boundaries to avoid a "patchwork quilt" (colcha de retalhos) look. The centralized Dashboard layout is the definitive standard for the ecosystem's alignment.
* **Whitespace as a Premium Asset:** "Breathing room is luxury". The MAPA ecosystem must feel premium, unhurried, and deliberate. Always use generous margins and paddings (e.g., Tailwind's `p-8`, `gap-12`). Avoid dense, cluttered layouts typical of legacy CRMs. Let the typography and the glass surfaces breathe.

---

## 2. PRODUCT OVERVIEW & DESIGN DIRECTION

* **The Pitch:** An immersive, high-fidelity operating system for sales consultancy. It actively transforms dry, overwhelming CRM data spreadsheets into a compelling, readable narrative of growth and strategy. It bridges the gap between tactical execution and C-level governance.
* **Target Audience:** High-performance Revenue Operations (RevOps) teams, VP of Sales, and C-Suite executives. They suffer from "dashboard fatigue" and need strategic storytelling, not just raw data dumps.
* **Design Direction:** Liquid Narrative. This is a strict rejection of the rigid, boxy SaaS grid.
* **Visual Style:** Light, ethereal backgrounds meet frosted glass surfaces (glassmorphism).
* **Typography:** Typography is the hero element, creating an editorial feel. The interface must feel less like a conventional software tool and more like a dynamic, interactive high-end financial magazine spread (inspired by Monocle Magazine or Bloomberg Businessweek).
* **Motion:** Fluid, liquid transitions. No harsh snapping. Elements should glide, fade, and blur into existence.
* **Device & Viewport:** Desktop-first (Optimized for 1440px+ and Ultrawide Presentation displays). Mobile responsiveness is not the primary focus for the core dashboard views, but graceful degradation on standard laptops (13") is required (e.g., collapsing sidebars, stacking narrative columns).

---

## 3. STRICT DESIGN SYSTEM GUIDELINES (NORMALIZED)

**[OVERRIDE WARNING]:** Do NOT use solid white cards (`#FFFFFF`) with standard drop shadows under any circumstances. All functional surfaces must follow the Glassmorphism rules detailed below to maintain the "Liquid" aesthetic.

### 3.1 Design Tokens (Variables & Palette)
Configure local variables strictly using these values. Do not introduce unauthorized shades of gray.

* **color/primary:** `#1A1A1A` (Deep Charcoal) - Used for all main editorial text, primary headings, and high-contrast icons.
* **color/background:** `#F5F5F7` (Soft Aluminum) - Application base background. **Mandatory:** Add a full-viewport absolute fill layer with a fine "Noise" texture at 2% to 3% opacity to prevent color banding and add physical texture.
* **color/surface-glass:** `rgba(255, 255, 255, 0.65)` - Used for all readable cards, sidebars, and navigation panels.
* **color/accent-human:** `#C64928` (Burnt Sienna) - The strategic accent. Use sparingly for Primary CTAs, critical alerts, "Human" touchpoints (like subjective AI recommendations), and selected states.
* **color/success-growth:** `#2E4C3B` (Deep Forest Green) - Used exclusively to denote positive progress, OKR completion, and positive ROI trajectories.
* **color/border-glass:** `rgba(255, 255, 255, 0.4)` - The edge highlight. Apply as an inner stroke (1px) on all glass cards/panels to catch the light and separate the glass from the background.

### 3.2 Typography Rules (Strict Hierarchy)
Typography replaces traditional borders and dividers to establish hierarchy.

* **Heading/H1 - Editorial:** Playfair Display, SemiBold (600), Auto Line-Height. MUST be used for all main page titles, major metric labels, and the C-Level Narrative text. Use sentence case or Title Case for elegance.
* **UI/Body:** Satoshi (or Inter/Geist as fallback), Medium (500), Line-Height 150%. Used for supporting text, data table headers, and general UI labels.
* **UI/Button:** Satoshi, SemiBold (600), UPPERCASE, Letter Spacing: 4% to 6%. Gives interactive elements a confident, grounded feel.
* **Data/Numbers:** Space Mono, Regular (400). MUST be used for all financial figures, percentages, KPIs, and data readouts. Ensure `tabular-nums` CSS property is active so numbers align perfectly in vertical columns without shifting.

### 3.3 Structure, Radii & Effects (The Physics of MAPA)

* **radius/card:** `24px` - Aggressive rounding for all major structural panels, data cards, and the main layout shell.
* **radius/pill-button:** `100px` - Fully rounded pill shapes. Used for all primary/secondary buttons, status tags, and floating action elements.
* **effect/glass-blur:** `backdrop-filter: blur(24px) saturate(150%)`. The slight saturation boost ensures the background colors pop softly through the frosted glass.
* **effect/shadow-soft:** `box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.08)`. This soft, highly diffused shadow anchors the floating glass panels without adding harsh, dirty lines.

---

## 4. COMPONENTS & EXECUTION GUIDELINES

### 4.1 Buttons & Inputs
* **Primary Buttons:** Must use the 100px border-radius, UPPERCASE text, and the specific UI/Button typography. Background is `color/accent-human` (`#C64928`), text is white.
    * **Hover State:** Slightly dim the background and lift the shadow (`translate-y-[-2px]`).
* **Secondary Buttons:** Pill-shaped, transparent background, text and 1px border in `color/primary` (`#1A1A1A`).
* **Inputs & Forms:** Minimalist aesthetic. Underlined style only (no bounding boxes or heavy fills). Use `border-bottom: 1px solid rgba(255,255,255,0.4)` on the default state.
    * **Focus State:** The border color transitions smoothly to `color/accent-human`, and the placeholder text/label floats upwards elegantly.

### 4.2 Global Navigation (Consolidating the Patchwork)
**[UNIFIED ECOSYSTEM CRITICAL RULE]:** The application must not feel like a decentralized set of pages. The main global navigation component (whether executed as a Sidebar or Top Nav) MUST contain ALL 6 primary system modules to ensure seamless transitions. The required items are: 1. MAPA Syn (Dashboard), 2. War Room, 3. The Bridge (Dual Core), 4. Team Hub, 5. Synapse, 6. The Vault.

Create a single Master Component for Menu Items consisting of an Icon + Label.
* **Default State:** Transparent background, `color/primary` text at 70% opacity.
* **Hover State:** Text opacity 100%, background shifts to a very subtle `rgba(255,255,255,0.2)`.
* **Active State:** The item must use the "Liquid Glass" background (`color/surface-glass`), 100% text opacity, and use `color/accent-human` for the active indicator/icon. Include a subtle scale-up effect (`scale: 1.02`).

### 4.3 Card Alignment & Sizing Constraints
* **Standardization:** Cards must respect strict size limits and grid alignments. You must fix the discrepancy where some pages have centrally aligned, constrained cards while others expand infinitely to the screen edges. All informational cards and layout modules must follow the central alignment and proportional max-width sizing established in the main Dashboard layout.

### 4.4 Specific Screen Elements & Widgets
* **Deal Orbs (War Room Canvas):** 64px circular nodes representing clients/deals. Frosted glass fill, `#C64928` solid border for "High Probability" deals.
    * **Interaction:** Hovering expands the orb slightly and reveals a Space Mono $Value tooltip. Dragging them leaves a faint motion trail.
* **Narrative Column (Syn Dashboard):** A scrollable text area on the left using the Playfair Display Serif font. It reads like a generated newspaper article ("Neste trimestre, a eficiência da equipe subiu..."). Emphasized words should be bolded or highlighted in the Accent color.
* **ROI Visualizer (Hero Chart):** Large area chart. Gradient fill from `color/success-growth` (`#2E4C3B`) to transparent. Absolutely NO grid lines. Minimal X/Y axes.
    * **Interaction:** Hovering over the chart line displays a floating glass tooltip with the exact Date/Value, while simultaneously highlighting the corresponding sentence in the Narrative Column.
* **Resource Vault Cards:** Masonry layout cards. 4:3 aspect ratio. A large editorial typography preview of the document title dominates the card. Use floating pill tags ("Preço", "Concorrência") inside the card to denote categories.

---

## 5. BUILD GUIDE & STACK

* **Stack:** HTML5, Tailwind CSS v3 (or v4), React (functional components + hooks), Framer Motion.
* **Animation Rules (Framer Motion):** Avoid linear tweens. Use spring animations for organic, liquid movement. Standard physics: `transition={{ type: "spring", stiffness: 300, damping: 30 }}`.
* **Tailwind Config Nuances (Extend your theme):**
    * `backdrop-blur-xl`: Ensure this maps to exactly 24px blur.
    * `shadow-glass`: Map this custom shadow configuration for depth (`box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08)`).
    * `font-serif`: Set to `'Playfair Display', serif`.
    * `font-sans`: Set to `'Satoshi', sans-serif`.
    * `font-mono`: Set to `'Space Mono', monospace`.
    * `colors.accent`: Map to `#C64928` (Burnt Sienna).
    * `colors.success`: Map to `#2E4C3B` (Deep Forest Green).
    * `colors.aluminum`: Map to `#F5F5F7`.
* **Accessibility (A11y):** Despite the high-end aesthetic, contrast ratios must be respected. Ensure the `color/primary` text has sufficient contrast against the glass panels. All inputs must have associated `<label>` tags (even if visually floating) and buttons must have `aria-label` tags if relying heavily on iconography.
