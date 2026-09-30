# Flutter Handoff Specification: CapstoneMatch

This document provides complete implementation specifications for Flutter developers. A developer should be able to implement any screen from this specification without ambiguity.

---

## 1. Global Mapping Tables

### Table A: Design Tokens to Flutter Theme Mappings
| Token Name | Token Value | Flutter ThemeData / Constant Name | Usage in Code |
|---|---|---|---|
| `color-primary` | `#F27024` | `Theme.of(context).colorScheme.primary` | Primary action buttons, active icons |
| `color-primary-container` | `#FFF1E8` | `Theme.of(context).colorScheme.primaryContainer` | Selected card tint, subtle chips |
| `color-on-primary` | `#FFFFFF` | `Theme.of(context).colorScheme.onPrimary` | Text & icons on primary button |
| `color-surface` | `#FFFFFF` | `Theme.of(context).colorScheme.surface` | Cards, dialog background, sheets |
| `color-background` | `#F8F9FA` | `Theme.of(context).colorScheme.background` | Screen background scaffold |
| `color-text-primary` | `#1A1D1E` | `Theme.of(context).colorScheme.onBackground` | Headlines, titles, primary text |
| `color-text-secondary` | `#596066` | `Theme.of(context).colorScheme.onSurfaceVariant` | Subtitles, metadata, timestamps |
| `color-success` | `#0D8244` | `CustomColors.success` (`Color(0xFF0D8244)`) | Locked badge, slot filled indicator |
| `color-error` | `#BA1A1A` | `Theme.of(context).colorScheme.error` | Error banner, destructive CTA |
| `color-warning` | `#B26A00` | `CustomColors.warning` (`Color(0xFFB26A00)`) | Deadline urgent countdown |
| `color-border` | `#E1E3E5` | `Theme.of(context).colorScheme.outlineVariant` | Card outline, input borders |
| `type-display` | `28sp / Bold` | `Theme.of(context).textTheme.headlineMedium` | Screen hero titles |
| `type-headline` | `22sp / Semi-bold` | `Theme.of(context).textTheme.titleLarge` | App bar titles, section titles |
| `type-title` | `18sp / Semi-bold` | `Theme.of(context).textTheme.titleMedium` | Card headlines |
| `type-body` | `14sp / Regular` | `Theme.of(context).textTheme.bodyMedium` | All general body text |
| `type-label` | `14sp / Medium` | `Theme.of(context).textTheme.labelLarge` | Button text, interactive chips |
| `type-caption` | `12sp / Regular` | `Theme.of(context).textTheme.bodySmall` | Secondary captions, timestamps |
| `spacing-4` | `4.0` | `AppSpacing.xs` | Micro vertical padding |
| `spacing-8` | `8.0` | `AppSpacing.sm` | Icon-to-text spacing, chip gap |
| `spacing-12` | `12.0` | `AppSpacing.md` | Compact card internal padding |
| `spacing-16` | `16.0` | `AppSpacing.lg` | Standard horizontal screen margin |
| `spacing-24` | `24.0` | `AppSpacing.xl` | Section vertical rhythm |
| `spacing-32` | `32.0` | `AppSpacing.xxl` | Top hero padding |
| `radius-sm` | `8.0` | `BorderRadius.circular(8)` | Buttons, Text inputs, Chips |
| `radius-md` | `12.0` | `BorderRadius.circular(12)` | Cards, Bottom sheets |
| `radius-lg` | `16.0` | `BorderRadius.circular(16)` | Modal dialogs |

---

### Table B: UI Components to Flutter Widgets Mappings
| UI Component | Variant Used | Flutter Widget | Properties / Styling |
|---|---|---|---|
| **Button** | Primary Filled | `FilledButton` | `backgroundColor: primary`, minHeight: 48, radius: 8 |
| **Button** | Secondary Outline | `OutlinedButton` | `side: BorderSide(color: border)`, minHeight: 48 |
| **Button** | Destructive | `FilledButton` | `backgroundColor: error`, minHeight: 48 |
| **Text Field** | Default / Focused | `TextFormField` | `decoration: InputDecoration(border: OutlineInputBorder())` |
| **Card** | Default Card | `Card` / `Container` | `color: surface`, elevation: 1, radius: 12 |
| **Card** | Selectable Card | `InkWell` + `Container` | `border: isSelected ? Border.all(color: primary, width: 2) : ...` |
| **Navigation** | Bottom Bar | `NavigationBar` | M3 NavigationBar with 4 `NavigationDestination` items |
| **App Bar** | Default with Back | `AppBar` | `centerTitle: false`, `elevation: 0`, standard 56dp height |
| **Dialog** | Confirmation | `AlertDialog` | M3 AlertDialog with Title, Content, and 2 action buttons |
| **Loading State** | List Skeleton | `Shimmer` / Skeleton | Animated placeholder cards with rounded corners |
| **Empty State** | Illustration + Action | `Column` | Icon (64dp), Title, Subtitle, and primary retry/action button |
| **Error State** | Screen-level Error | `Card` + `Row` | Error icon, high-contrast message, and recovery action button |

---

## 2. Screen Specifications (All 6 Items per Screen)

### Screen 1: `SCR_01` — Sign In (FPT SSO)
1. **Layout:** `Scaffold` $\rightarrow$ SafeArea $\rightarrow$ centered `Padding(spacing-24)` $\rightarrow$ `Column` (App logo 80dp $\rightarrow$ SizedBox(spacing-24) $\rightarrow$ Title $\rightarrow$ Subtitle $\rightarrow$ Spacer $\rightarrow$ Google SSO Button $\rightarrow$ SizedBox(spacing-16) $\rightarrow$ Terms disclaimer). Non-scrollable.
2. **Components:** `Button` (Variant: Primary with Google icon), `Typography` (Display & Body).
3. **States:** Default, Loading (OAuth in progress spinner inside button), Error (Domain mismatch toast).
4. **Interactions:** Tap "Continue with Google" $\rightarrow$ opens Google OAuth sheet. Rejects non-`@fpt.edu.vn` accounts.
5. **Navigation:** Entry point. Successful auth navigates via `Navigator.pushReplacementNamed(context, '/dashboard')`.
6. **Constraints:** Button width: full screen (fill container), min height 48dp.

---

### Screen 2: `SCR_02` — Dashboard / Home
1. **Layout:** `Scaffold` $\rightarrow$ `AppBar` (FPT Capstone Logo + Notification bell icon) $\rightarrow$ `SingleChildScrollView` $\rightarrow$ `Padding(spacing-16)` $\rightarrow$ `Column` (Deadline Countdown Card $\rightarrow$ spacing-16 $\rightarrow$ My Team Status Card $\rightarrow$ spacing-24 $\rightarrow$ Section Header "Quick Actions" $\rightarrow$ 2 Action Cards $\rightarrow$ spacing-24 $\rightarrow$ Checklist Card). Bottom navigation persistent.
2. **Components:** `Card` (Countdown variant, Status variant), `Button` (Primary Filled), `AppBar`, `NavigationBar`.
3. **States:** Default (Populated).
4. **Interactions:** Tap "Browse Available Teams" $\rightarrow$ switches tab to index 1 (`SCR_03`). Tap "My Team" $\rightarrow$ switches to index 2 (`SCR_05`).
5. **Navigation:** Bottom nav destination 0. Back button exits app (with Android double-back confirmation).
6. **Constraints:** Text must not truncate on 360dp width; countdown card uses Auto Layout vertical wrap if needed.

---

### Screen 3: `SCR_03` — Browse Groups
1. **Layout:** `Scaffold` $\rightarrow$ `AppBar` (Title: "Browse Teams") $\rightarrow$ `Column` (Search Bar `Padding(spacing-16)` $\rightarrow$ Horizontal Filter Chip list `SizedBox(height: 48)` $\rightarrow$ Expanded `ListView.separated(separator: spacing-12)` of Group Cards). Bottom navigation persistent.
2. **Components:** `TextField` (Search input with leading search icon), `Card` (GroupCard variant), `Chip`, `Button` (Small CTA).
3. **States:** Populated, Loading (3 Skeleton cards), Empty ("No teams found matching criteria" + "Reset Filters" button).
4. **Interactions:** Type in search bar (debounced 300ms query filter). Tap Filter chip (toggles selection). Tap "View Details & Join" on any card $\rightarrow$ opens `SCR_04`.
5. **Navigation:** From bottom nav index 1. Tapping card navigates to `SCR_04` via `Navigator.pushNamed('/group-detail')`.
6. **Constraints:** Cards must maintain min-height 120dp. Touch target of card action is full width on mobile.

---

### Screen 4: `SCR_04` — Group Detail
1. **Layout:** `Scaffold` $\rightarrow$ `AppBar` (Back arrow + Title: "Team AI-04") $\rightarrow$ `SingleChildScrollView` $\rightarrow$ `Padding(spacing-16)` $\rightarrow$ `Column` (Topic summary Card $\rightarrow$ spacing-16 $\rightarrow$ Section Title "Roster (3/5 Members)" $\rightarrow$ 3 Member Cards $\rightarrow$ 2 Open Slot Placeholders) $\rightarrow$ Bottom pinned container with `FilledButton("Request to Join Team")`.
2. **Components:** `AppBar`, `Card` (Member tile), `Button` (Primary 48dp), `Dialog` (Confirmation).
3. **States:** Default, Loading (Join request in-flight), Disabled ("Group is Full 5/5").
4. **Interactions:** Tap "Request to Join" $\rightarrow$ opens Confirmation Modal overlay. Tap "Confirm" in modal $\rightarrow$ shows spinner $\rightarrow$ navigates to `SCR_05`.
5. **Navigation:** Back arrow navigates to `SCR_03` via `Navigator.pop()`. Successful join navigates to `SCR_05`.
6. **Constraints:** Fixed bottom CTA has elevation 8 and safe-area padding at bottom.

---

### Screen 5: `SCR_05` — My Group Hub
1. **Layout:** `Scaffold` $\rightarrow$ `AppBar` (Title: "My Group") $\rightarrow$ `SingleChildScrollView` $\rightarrow$ `Padding(spacing-16)` $\rightarrow$ `Column` (Team Status & Progress Bar `3/5` $\rightarrow$ spacing-16 $\rightarrow$ Alert Banner "Leader Election Pending" $\rightarrow$ spacing-16 $\rightarrow$ Member List with roles $\rightarrow$ spacing-24 $\rightarrow$ Bottom Actions: Outlined "Leave Group" + Filled "Proceed to Lock Team").
2. **Components:** `AppBar`, `Card`, `LinearProgressIndicator`, `Button` (Primary & Outlined variants), `NavigationBar`.
3. **States:** In Formation (3/5), Ready to Lock (4/5 or 5/5), Locked (Read-only state).
4. **Interactions:** Tap "Vote for Leader" banner $\rightarrow$ opens `SCR_06`. Tap "Proceed to Lock Team" $\rightarrow$ opens `SCR_07`.
5. **Navigation:** Bottom nav index 2. Back button returns to Dashboard.
6. **Constraints:** Progress bar colored `warning` if <4, and `success` if >=4 members.

---

### Screen 6: `SCR_06` — Leader Voting
1. **Layout:** `Scaffold` $\rightarrow$ `AppBar` (Back arrow + Title: "Elect Team Leader") $\rightarrow$ `Padding(spacing-16)` $\rightarrow$ `Column` (Instructional Header $\rightarrow$ spacing-16 $\rightarrow$ Expanded `ListView` of Candidate Selection Cards $\rightarrow$ Fixed bottom container with `FilledButton("Submit My Vote")`).
2. **Components:** `AppBar`, `Card` (Selectable variant with 2dp border when active), `Button` (Primary Filled).
3. **States:** Default, Selected (Candidate active), Submitted (Vote recorded, shows vote tallies).
4. **Interactions:** Tap Candidate Card $\rightarrow$ updates selected candidate state. Tap "Submit Vote" $\rightarrow$ records vote $\rightarrow$ shows success toast $\rightarrow$ pops back to `SCR_05`.
5. **Navigation:** Accessible from `SCR_05`. Back arrow returns to `SCR_05` without voting.
6. **Constraints:** Each selectable card has min-height 64dp to guarantee thumb accessibility.

---

### Screen 7: `SCR_07` — Group Lock Review & Error Recovery
1. **Layout:** `Scaffold` $\rightarrow$ `AppBar` (Back arrow + Title: "Lock Team Roster") $\rightarrow$ `SingleChildScrollView` $\rightarrow$ `Padding(spacing-16)` $\rightarrow$ `Column` (Validation Status Banner $\rightarrow$ spacing-16 $\rightarrow$ Final Member Summary $\rightarrow$ spacing-16 $\rightarrow$ Recovery Card [shown if <4 members] $\rightarrow$ spacing-24 $\rightarrow$ Fixed bottom "Lock Team Roster" Button).
2. **Components:** `AppBar`, `Card`, `Error State` (Banner variant), `Dialog` (Destructive Confirmation), `Button` (Primary & Disabled variants).
3. **States:** Valid State (4 or 5 members $\rightarrow$ Lock CTA active), Error State (<4 members $\rightarrow$ Error banner visible, Lock CTA disabled, Recovery action enabled).
4. **Interactions:** In Error State: Tap "Invite from Waiting Pool" $\rightarrow$ opens peer selection modal. In Valid State: Tap "Lock Team Roster" $\rightarrow$ shows Destructive Confirmation Dialog.
5. **Navigation:** Accessible from `SCR_05`. Confirmation navigates back to `SCR_05` with locked badge.
6. **Constraints:** Destructive modal confirmation button must be styled with `colorScheme.error` (`#BA1A1A`).

---

### Screen 8: `SCR_08` — Random Pool Status
1. **Layout:** `Scaffold` $\rightarrow$ `AppBar` (Title: "Matching Status") $\rightarrow$ `Center` $\rightarrow$ `Padding(spacing-24)` $\rightarrow$ `Column` (Animated Pulse Radar Icon 72dp $\rightarrow$ Title "Algorithm Matching in Progress" $\rightarrow$ Subtitle $\rightarrow$ Queue Info Card $\rightarrow$ Support Contact Button).
2. **Components:** `AppBar`, `Card`, `Button` (Outlined variant), `Loading State` (Radar animation).
3. **States:** Matching in progress, Matched result dialog.
4. **Interactions:** Tap "Refresh Status" $\rightarrow$ polls API. Tap "Contact Registrar" $\rightarrow$ opens email intent.
5. **Navigation:** Accessed from Dashboard banner if student is unassigned post-deadline.
6. **Constraints:** Non-blocking background polling every 30 seconds.

---

### Screen 9: `SCR_09` — Notifications & Invites
1. **Layout:** `Scaffold` $\rightarrow$ `AppBar` (Title: "Notifications") $\rightarrow$ `Column` (Segmented Button Tab: All, Invites, System $\rightarrow$ Expanded `ListView.separated` of Notification Tiles).
2. **Components:** `AppBar`, `SegmentedButton`, `ListTile` (Custom notification variant), `Button` (Accept/Decline micro-buttons), `NavigationBar`.
3. **States:** Populated, Empty State ("You are all caught up!").
4. **Interactions:** Tap "Accept" on invitation $\rightarrow$ adds user to group and navigates to `SCR_05`. Tap "Decline" $\rightarrow$ removes item with undo snackbar.
5. **Navigation:** Bottom nav index 3.
6. **Constraints:** Tap targets on "Accept" and "Decline" must be padded to at least 48x48dp.
