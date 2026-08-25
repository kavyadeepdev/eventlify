# Eventlify - Frontend Design System & UI Specification (`design.md`)

This document outlines the visual design language, color palette, typography, micro-animations, component library, and layout patterns established in the **Eventlify** frontend.

---

## 1. Design Language & Aesthetic Theme

The design language is **"Campus Poster"** — inspired by high-contrast physical campus flyers, brutalist zine prints, and vibrant modern web design.

### Core Visual Attributes:
- **Saturated Color Blocks:** Bold, distinct brand accents (limepop, punch, grape, zest, flame, aqua).
- **Thick Ink Outlines:** Solid 2px ink borders (`#111116`) framing all cards, badges, buttons, and input fields.
- **Hard Offset Shadows:** Sharp 4px offset box shadows (`box-shadow: 4px 4px 0 #111116` or `shadow-[4px_4px_0_var(--color-ink)]`) without soft blur filters, producing a physical tactile feel.
- **Micro-Animations & Polish:** 3D card tilt effects, letter-rise text reveals, infinite marquee rails, pop-in toasts, and spring count-up counters.
- **Light-First with Dark Support:** Built with a light-first paper backdrop (`#f7f5ef`), with full `.dark` variant utility support.

---

## 2. Color Palette & Design Tokens (`app/globals.css`)

All color tokens are defined under `@theme` in `app/globals.css`:

```css
@theme {
  /* Surface & Base Tokens */
  --color-ink: #111116;       /* Hard outlines, headers, primary text */
  --color-paper: #f7f5ef;     /* Warm campus paper canvas background */

  /* Brand Accents */
  --color-grape: #7548f5;     /* Deep purple accent */
  --color-punch: #ff3e91;     /* Vibrant hot pink accent */
  --color-zest: #ffd522;      /* Bright golden yellow accent */
  --color-limepop: #d7ff38;   /* Electric lime green highlight */
  --color-flame: #ff5c35;     /* Warm orange accent */
  --color-aqua: #62e9e1;      /* Electric turquoise/cyan accent */
  --color-coral: #ff5438;     /* Coral red accent */
  --color-mint: #ccf4dc;      /* Soft mint green accent */
}
```

---

## 3. Typography System

Eventlify pairs a high-impact display poster font with a clean, readable grotesque body sans-serif:

| Role | Font Variable | Fallbacks | Usage |
| :--- | :--- | :--- | :--- |
| **Display Header** | `--font-display` | Anton, Arial Black, Helvetica Neue, sans-serif | Hero titles, section headings, display numbers, stickers. |
| **Body / UI Sans** | `--font-sans` | Space Grotesk, system-ui, sans-serif | Body prose, form fields, badges, navigation links, buttons. |

---

## 4. Animation & Physics System

Defined in `@theme` with custom keyframes and bezier easing curves:

| Token / Keyframe | Curve / Timing | Description |
| :--- | :--- | :--- |
| `--animate-marquee` | `linear 32s infinite` | Endless horizontal sliding ticker. |
| `--animate-marquee-reverse` | `linear 26s infinite` | Reverse sliding horizontal ticker. |
| `--animate-pop-in` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Overshooting spring entrance pop for modals and toasts. |
| `--animate-wiggle` | `ease-in-out 2.4s infinite` | Subtle rotational tilt for attention badges. |
| `--animate-float` / `-slow` | `ease-in-out 6s / 9s infinite` | Floating ambient hero elements. |
| `--animate-tick` | `cubic-bezier(0.34, 1.6, 0.64, 1)` | Numerical step ticker animation. |
| `--animate-shimmer` | `linear 2.2s infinite` | Skeleton loading shine effect. |

---

## 5. Component Library Breakdown

The component library is structured cleanly under `components/`:

### 5.1 Base UI Primitives (`components/ui/`)
- `Button` (`button.tsx`): Hard offset ink shadow button with variant colors (`zest`, `punch`, `grape`, `limepop`, `outline`), active click press shift (`translate-x-[2px] translate-y-[2px] shadow-none`).
- `Input` (`input.tsx`): Thick 2px ink border text input with focus ring and hard offset shadow.
- `Label` (`label.tsx`): Uppercase tracking-wider font label.
- `Field` (`field.tsx`): Form field wrapper handling labels, helper descriptions, error messages, and Zod validation states.
- `Badge` (`badge.tsx`): Hard-bordered pill badge for roles, event categories, and status indicators.
- `Card` (`card.tsx`): Brutalist card container with ink border, rounded corners, and offset box shadow.
- `Separator` (`separator.tsx`): Solid 2px ink divider line.

### 5.2 Shared Kinetic & Interactive Components (`components/shared/`)
- `KineticHero` & `HeroBackdrop` (`kinetic-hero.tsx`, `hero-backdrop.tsx`): Interactive hero section featuring dynamic gradient glow, floating badges, and marquee highlights.
- `KineticTextGrid` & `SplitText` (`kinetic-text-grid.tsx`, `split-text.tsx`): Staggered letter-rise entrance animation for page titles.
- `MomentumRail` & `Marquee` (`momentum-rail.tsx`, `marquee.tsx`): Touch/scroll momentum ticker rails for event and club banners.
- `Tilt` (`tilt.tsx`): 3D perspective card tilt component following mouse hover coordinates.
- `Reveal` (`reveal.tsx`): Intersection-Observer scroll reveal wrapper with spring displacement.
- `CountUp` (`count-up.tsx`): Animated number counter for registration metrics and turnout percentages.
- `WaveEdge` (`wave-edge.tsx`): SVG decorative wave divider linking dark sections to light sections seamlessly.
- `EmptyState` (`empty-state.tsx`): Structured empty state graphic card with title, description, icon, and action CTA button.
- `GhostType` (`ghost-type.tsx`): Typewriter effect component for hero subheadings.
- `Confetti` (`confetti.tsx`): Celebratory particle explosion upon successful event registration.
- `NavigationLoader` & `RouteLoader` (`navigation-loader.tsx`, `route-loader.tsx`): Top bar loading indicator triggered during Next.js route transitions.
- `DebouncedSearch` (`debounced-search.tsx`): Search input with debounced query execution for instant filtering.
- `FormMessage` (`form-message.tsx`): Status message banner for Server Action validation feedback.
- `Avatar` (`avatar.tsx`): Fallback user profile avatar with initial initials and color fill.

### 5.3 Brand Components (`components/brand/`)
- `AfterClassMark` (`afterclass-mark.tsx`): Official brand logo SVG mark with bold ink stroke styling.

### 5.4 Layout Components (`components/layout/`)
- `Header` (`header.tsx`): Sticky top navigation header with logo, navigation links, and auth action trigger.
- `MobileNav` (`mobile-nav.tsx`): Slide-out drawer menu for mobile viewports.
- `NavLinks` (`nav-links.tsx`): Active route highlighting link group.
- `UserMenu` (`user-menu.tsx`): Authenticated user dropdown menu (Profile, Ticket Wallet, Admin links, Sign Out).
- `Footer` (`footer.tsx`): Campus footer with quick links, copyright, and social shortcuts.

---

## 6. Standard Layout & Card Patterns

### 6.1 Brutalist Poster Card Pattern
```html
<div class="shine brutal rounded-2xl border-2 border-ink bg-paper p-6 shadow-[4px_4px_0_var(--color-ink)] transition-transform hover:-translate-y-1">
  <span class="sticker bg-limepop px-3 py-1 text-xs font-bold uppercase text-ink">
    Category
  </span>
  <h3 class="display mt-3 text-2xl">Card Title</h3>
  <p class="mt-2 text-sm text-ink/80">Card description text...</p>
</div>
```

### 6.2 Sticker Pill Pattern
Stickers use saturated background fills, 2px borders, uppercase display text, and tracking-widest spacing:
```html
<span class="sticker inline-block bg-zest px-3 py-1 text-xs font-bold uppercase tracking-widest text-ink border-2 border-ink">
  Organiser Tool
</span>
```
