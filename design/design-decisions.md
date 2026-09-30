# Design Decisions & Accessibility Checklist

## 1. The 10 most important decisions

| # | Decision | Alternative considered | Reason (persona / heuristic / constraint) | Where in Figma |
|---|---|---|---|---|
| **D1** | **Corrected palette:** primary `#AD4A0A` instead of FPT orange `#F27024` for anything that carries text or is a control. `#F27024` is kept only as decorative `brand-orange`. | Keep `#F27024` because it is the FPT brand color. | **WCAG 1.4.3.** White on `#F27024` measures 2.95:1, not the 4.8:1 the brief claimed. **Persona:** Minh has mild astigmatism and uses the phone in campus sunlight. Brand recognition survives in the orange hue. | Page 04 · Color, and "Contrast fixes" table |
| **D2** | **Five visual slots** on every group card (filled avatars plus dashed "+" slots) together with an "N open slots" badge. | A plain "3/5" text label. | **Heuristic 1 (visibility of system status)** and **H6 (recognition over recall).** Minh sees whether a team still has room without reading numbers. | SCR_03, Card `Type=Group` |
| **D3** | **Destructive confirmation** before locking. The red "Yes, Lock Permanently" button sits above "Cancel", and the body says it cannot be undone. | A single-tap lock followed by a toast. | **H5 (error prevention).** Locking is irreversible under university policy. The persona is under deadline stress and could tap by mistake. | SCR_07 Confirm dialog, Dialog `Type=Destructive` |
| **D4** | **Recovery card inside the error state.** When a team has fewer than 4 members, the Lock button is disabled and the screen offers "Invite from Waiting Pool" right under the error banner. | Show a disabled button and a toast only. | **H9 (help users recover from errors).** A disabled button with no next step is a dead end. The card was moved above the roster so it is visible at 360 × 800 without scrolling. | SCR_07 Error · 3 of 5, Recovery states |
| **D5** | **Full-width selectable cards** for voting (min height 72) instead of 18 dp radio buttons. The selected card shows a radio icon, a 2 dp border and a tint. | Standard radio list. | **WCAG 2.5.5 target size** and the persona's one-handed use on the bus. Selection is shown by shape and border, not by color alone. | SCR_06, Card `Type=Selectable` |
| **D6** | **Relative countdown** ("2 days 14 hours left") in a Warning banner. | The raw date "15 Oct 17:00". | **H6 (recognition over recall).** Students misjudge time left from a raw date. | SCR_02 |
| **D7** | **4-tab bottom navigation:** Home, Browse, My Group, Alerts. Nested screens use a Back arrow instead. | A hamburger drawer. | **H7 (flexibility) and mobile reachability.** The core flows need one-tap switching. The selected tab has an indicator pill and a darker label, so it does not rely on color alone. | Bottom Nav component, all top-level screens |
| **D8** | **Icon + text on every status badge** (Confirmed, Leader, Locked, Full, New). | Colored dots only. | **WCAG 1.4.1 use of color.** The badges also work for color-blind users and in glare. | Badge component, 6 tones |
| **D9** | **Dialog buttons stacked at full width**, primary on top. | Side-by-side buttons. | **Constraint:** at 360 dp, labels like "Yes, Lock Permanently" would be cut off side by side. Full-width buttons are also easier to reach with a thumb. | Dialog component |
| **D10** | **Blocking loading overlay** during Join and Lock, then an automatic transition to the result. | An inline spinner that leaves the screen interactive. | **H5 (error prevention).** It stops double submission of an irreversible action, and **H1** shows that the system is working. | SCR_04 Joining, SCR_07 Locking, prototype timeouts |

---

## 2. Accessibility & responsive checklist (results)

All numbers were measured in the Figma file with the WCAG 2.1 formula and the Plugin API, not estimated.

### 2.1 Text contrast ≥ 4.5:1 (body) and ≥ 3:1 (large text and UI controls): **PASS**

| Pair (foreground on background) | Ratio | Result |
|---|---|---|
| `on-surface` `#1A1D1E` on `surface` `#FFFFFF` | 16.96:1 | AAA |
| `on-surface-variant` `#596066` on `surface` | 6.38:1 | AA |
| `on-primary` `#FFFFFF` on `primary` `#AD4A0A` (buttons) | 5.58:1 | AA |
| `on-primary` on `primary-pressed` `#8A3C08` | 7.69:1 | AAA |
| `primary` on `primary-container` `#FFF1E8` (selected card, outlined button) | 5.05:1 | AA |
| `success` `#0A6E38` on `success-container` `#E6F4EA` | 5.60:1 | AA |
| `warning` `#8F5400` on `warning-container` `#FFF4E0` | 5.61:1 | AA |
| `error` `#BA1A1A` on `error-container` `#FDF2F2` | 5.89:1 | AA |
| `info` `#1F5FA8` on `info-container` `#E8F1FB` | 5.65:1 | AA |
| `on-tag` `#343A40` on `tag-container` `#E9ECEF` | 9.70:1 | AAA |
| `inverse-primary` `#FFB68A` on `inverse-surface` `#1A1D1E` (snackbar action) | 9.94:1 | AAA |
| `outline` `#737980` on white (text-field and radio boundary) | 4.40:1 | ≥ 3:1 UI |
| `on-disabled` `#5E6469` on `disabled-container` `#E1E3E5` | 4.66:1 | AA (not required, but kept readable) |

The one pair that fails, `brand-orange` on white (2.95:1), is used only for decoration and never for text or controls.

### 2.2 Touch targets ≥ 48 × 48 dp: **PASS**
- Automated check across the **52 frames** on page 03: **269** Button, Icon Button, Nav Item, Chip and Segmented Tabs instances, **0** under 48 dp.
- Icon buttons are 48 × 48 around a 24 dp glyph. Chips show a 32 dp pill inside a 48 dp touch area. Selectable cards are at least 72 dp tall.

### 2.3 Body text ≥ 14 sp, and no information by color alone: **PASS**
- The only text under 14 sp is the **12 sp timestamp** (15 instances of the `Time` layer, style `Caption`), which the brief allows for non-critical metadata.
- Every status badge carries text and an icon: **0** badges without a label. Errors combine an icon, a red border and a written cause. The selected tab and selected chip add an indicator pill or check icon on top of the color.

### 2.4 Layout uses constraints and Auto Layout, checked at 360 dp and 412 dp: **PASS**
- Every screen, component and card is Auto Layout. Content uses *Fill container*, while avatars, icons and touch targets are fixed.
- Page 03 has a row **"Width check · 412 dp"** with the default state of all nine screens at 412 × 915. Cards and buttons stretch, nothing clips, and the 360 × 800 versions sit above it.
- Behavior at 600 dp and wider is specified in `handoff/flutter-handoff.md` §3.
