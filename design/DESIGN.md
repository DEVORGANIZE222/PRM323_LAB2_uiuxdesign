# Design Brief: CapstoneMatch Mobile App

## 1. Brand Identity & Visual Tone
- **App Name:** CapstoneMatch (FPT University Capstone Team Formation)
- **Visual Tone:** Professional, Academic, Modern, Trustworthy, and High-Affordance.
- **Platform Target:** Android & iOS (Baseline viewport: `360 × 800 dp` @1x mdpi).

---

## 2. Design Tokens

### Color Palette (WCAG 2.1 AA Compliant)
| Token Name | Hex Value | Role & Usage | Contrast Ratio on Light Bg |
|---|---|---|---|
| `color-primary` | `#F27024` | FPT Orange — Primary CTA, active bottom navigation icon, selected tags | 3.2:1 (large text / icons) |
| `color-primary-container` | `#FFF1E8` | Light orange tint for active card highlights | N/A (background) |
| `color-on-primary` | `#FFFFFF` | Text/icons placed on top of `color-primary` | 4.8:1 (Pass AA) |
| `color-surface` | `#FFFFFF` | Card backgrounds, elevated sheets | Base |
| `color-background` | `#F8F9FA` | Screen background (soft cool off-white) | Base |
| `color-text-primary` | `#1A1D1E` | High-emphasis body, titles, headings | 15.6:1 (Pass AAA) |
| `color-text-secondary` | `#596066` | Medium-emphasis labels, timestamps, metadata | 5.4:1 (Pass AA) |
| `color-success` | `#0D8244` | Team locked, member confirmed, slot filled badge | 5.1:1 (Pass AA) |
| `color-error` | `#BA1A1A` | Validation error, team member underflow (< 4 members) | 6.2:1 (Pass AA) |
| `color-warning` | `#B26A00` | Deadline urgency countdown (< 24 hours left) | 4.9:1 (Pass AA) |
| `color-border` | `#E1E3E5` | Structural dividers, outline button borders | UI Control |

### Typography Scale (Material Design 3 / Inter or Roboto)
- Minimum body text size: `14sp` (Strict requirement: no text below 14sp except 12sp for secondary captions).
- Scale:
  - **Display / Large Title:** `28sp` / Bold (`700`), Line Height `34sp`
  - **Headline / Screen Title:** `22sp` / Semi-bold (`600`), Line Height `28sp`
  - **Title / Card Heading:** `18sp` / Semi-bold (`600`), Line Height `24sp`
  - **Body Text:** `14sp` / Regular (`400`), Line Height `20sp`
  - **Label / Button Text:** `14sp` / Medium (`500`), Line Height `20sp`
  - **Caption / Meta:** `12sp` / Regular (`400`), Line Height `16sp`

### Spacing System (8-Point Grid)
- `spacing-4`: 4dp (Micro padding, badge vertical padding)
- `spacing-8`: 8dp (Spacing between icon & text, chip margins)
- `spacing-12`: 12dp (Internal card padding on compact layouts)
- `spacing-16`: 16dp (Standard screen margin, card inner padding)
- `spacing-24`: 24dp (Section vertical rhythm)
- `spacing-32`: 32dp (Hero content margins, top spacing)

### Corner Radius Tokens
- `radius-sm`: 8dp (Buttons, chips, text input fields)
- `radius-md`: 12dp (Cards, bottom sheets)
- `radius-lg`: 16dp (Dialogs, modal containers)
- `radius-full`: 999dp (Pills, avatar circles)

---

## 3. Component Design Rules
1. **Touch Targets:** All interactive elements (buttons, chips, list items, checkboxes, bottom nav items) must have a touch target of at least **`48 × 48 dp`**.
2. **One Primary Action per Screen:** Each screen has exactly one prominent Filled Button (`#F27024`). Secondary actions must use Outlined or Text Buttons.
3. **No Color-Only Meaning:** Badges and alerts must combine an icon with text (e.g., Warning icon ⚠️ + "Only 3/5 members").
4. **State Affordance:** Buttons, cards, and input fields must visually reflect Default, Hover/Pressed, Disabled, and Loading states.

---

## 4. Revision after the contrast audit (tokens used in Figma)

Sections 1–3 are the brief exactly as it was given to Stitch. The contrast column in §2 contains the brief's *claims*. Several claims were wrong when measured with the WCAG 2.1 relative-luminance formula, so the Figma Variables use the corrected values below. Decision D1 in `design-decisions.md` records the reason.

| Token | Brief value | Measured | Figma value | Measured | Why it changed |
|---|---|---|---|---|---|
| `primary` (button fill) | `#F27024` | white text **2.95:1** (fail) | `#AD4A0A` | white text **5.58:1** | Body-size button labels need 4.5:1. `#F27024` stays as `brand-orange`, used for decoration only. |
| `primary-pressed` | — | — | `#8A3C08` | white 7.69:1 | The pressed state needs its own token. |
| `warning` | `#B26A00` | on white **4.24:1** (fail) | `#8F5400` | 6.11:1 | Countdown text is 14 sp. |
| `success` | `#0D8244` | on `#E6F4EA` **4.31:1** (fail) | `#0A6E38` | 5.60:1 | Badge labels sit on the tinted fill. |
| `outline` (field border) | `#E1E3E5` | on white **1.29:1** (fail) | `#737980` | 4.40:1 | UI component boundaries need 3:1 (SC 1.4.11). `#E1E3E5` stays as `outline-variant` for dividers. |
| disabled label | `#8E9192` | on `#E1E3E5` 2.47:1 | `#5E6469` | 4.66:1 | The label must still be readable outdoors. |

New tokens added while building the components: `info` `#1F5FA8` / `info-container` `#E8F1FB` (5.65:1), `error-container` `#FDF2F2`, `tag-container` `#E9ECEF` / `on-tag` `#343A40` (9.70:1), `inverse-surface` `#1A1D1E` with `inverse-primary` `#FFB68A` for the snackbar (9.94:1), `scrim` (50 %), `shadow` (16 %).

Also added: a `Subtitle` text style (16/22 Semi Bold) for card names, as asked for in Stitch iteration 3; size tokens (`size-touch` 48, `size-button` 48, `size-app-bar` 64, `size-nav-bar` 80, `size-chip` 32 inside a 48 touch area…); and elevation levels 1–3 as effect styles. The full token list is on Figma page **04 Design System** and in `handoff/flutter-handoff.md`.
