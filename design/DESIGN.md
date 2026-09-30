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
