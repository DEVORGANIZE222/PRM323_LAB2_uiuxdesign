# Flutter Handoff Specification: CapstoneMatch

A developer should be able to build any screen from this document and use Figma only to look at the visuals. Component and variant names are the names in Figma **05 Components**. Token names are the Figma **Variables** on page **04 Design System**.

---

## 1. Global mapping tables

### Table A — Tokens → Flutter

**Colors** (`ThemeData.colorScheme` + a `ThemeExtension<AppColors>` for the non-M3 roles)

| Token | Value | Flutter |
|---|---|---|
| `primary` | `#AD4A0A` | `ColorScheme.primary` |
| `on-primary` | `#FFFFFF` | `ColorScheme.onPrimary` |
| `primary-pressed` | `#8A3C08` | `AppColors.primaryPressed` (button `overlayColor` / pressed `backgroundColor`) |
| `primary-container` | `#FFF1E8` | `ColorScheme.primaryContainer` |
| `on-primary-container` | `#5C2204` | `ColorScheme.onPrimaryContainer` |
| `brand-orange` | `#F27024` | `AppColors.brandOrange` — decoration only, never text or controls |
| `background` | `#F8F9FA` | `ColorScheme.surface` (= `scaffoldBackgroundColor`) |
| `surface` | `#FFFFFF` | `ColorScheme.surfaceContainerLowest` (cards, app bar, dialogs) |
| `surface-variant` | `#F1F3F4` | `ColorScheme.surfaceContainerHigh` (pressed card, disabled field) |
| `on-surface` | `#1A1D1E` | `ColorScheme.onSurface` |
| `on-surface-variant` | `#596066` | `ColorScheme.onSurfaceVariant` |
| `outline` | `#737980` | `ColorScheme.outline` (field border, radio, outlined button) |
| `outline-variant` | `#E1E3E5` | `ColorScheme.outlineVariant` (dividers, card border) |
| `disabled-container` / `on-disabled` | `#E1E3E5` / `#5E6469` | `AppColors.disabledContainer` / `AppColors.onDisabled` |
| `success` / `success-container` | `#0A6E38` / `#E6F4EA` | `AppColors.success` / `AppColors.successContainer` |
| `warning` / `warning-container` | `#8F5400` / `#FFF4E0` | `AppColors.warning` / `AppColors.warningContainer` |
| `error` / `on-error` / `error-container` | `#BA1A1A` / `#FFFFFF` / `#FDF2F2` | `ColorScheme.error` / `onError` / `errorContainer` |
| `error-pressed` | `#93000A` | `AppColors.errorPressed` |
| `info` / `info-container` | `#1F5FA8` / `#E8F1FB` | `AppColors.info` / `AppColors.infoContainer` |
| `tag-container` / `on-tag` | `#E9ECEF` / `#343A40` | `AppColors.tagContainer` / `AppColors.onTag` |
| `inverse-surface` / `inverse-on-surface` / `inverse-primary` | `#1A1D1E` / `#FFFFFF` / `#FFB68A` | `ColorScheme.inverseSurface` / `onInverseSurface` / `inversePrimary` |
| `skeleton` | `#E9ECEF` | `AppColors.skeleton` |
| `scrim` | `#1A1D1E` @ 50 % | `ColorScheme.scrim` (`barrierColor` of dialogs) |
| `shadow` | `#000000` @ 16 % | `ColorScheme.shadow` |

**Typography** (Inter; `ThemeData.textTheme`)

| Figma text style | Size / line / weight | Flutter |
|---|---|---|
| `CapstoneMatch/Display` | 28 / 34 / Bold | `textTheme.headlineMedium` |
| `CapstoneMatch/Headline` | 22 / 28 / Semi Bold | `textTheme.titleLarge` (app bar, dialog title) |
| `CapstoneMatch/Title` | 18 / 24 / Semi Bold | `textTheme.titleMedium` |
| `CapstoneMatch/Subtitle` | 16 / 22 / Semi Bold | `textTheme.titleSmall` with `fontSize: 16` |
| `CapstoneMatch/Body` | 14 / 20 / Regular | `textTheme.bodyMedium` |
| `CapstoneMatch/Label` | 14 / 20 / Medium | `textTheme.labelLarge` (buttons, badges, chips) |
| `CapstoneMatch/Caption` | 12 / 16 / Regular | `textTheme.bodySmall` (timestamps only) |

**Spacing, radius, size, elevation** (`abstract final class AppSpacing` / `AppRadius` / `AppSize`)

| Token | Value | Flutter constant |
|---|---|---|
| `space-4` · `space-8` · `space-12` · `space-16` · `space-24` · `space-32` | 4 · 8 · 12 · 16 · 24 · 32 | `AppSpacing.xs` · `sm` · `md` · `lg` · `xl` · `xxl` |
| `radius-sm` · `radius-md` · `radius-lg` · `radius-full` | 8 · 12 · 16 · 999 | `AppRadius.sm` (buttons, fields, banners) · `md` (cards) · `lg` (dialogs) · `StadiumBorder()` / `CircleBorder()` |
| `size-touch` · `size-button` · `size-field` | 48 | `kMinInteractiveDimension`; `minimumSize: Size.fromHeight(48)` |
| `size-app-bar` · `size-nav-bar` | 64 · 80 | `AppBar(toolbarHeight: 64)`, `NavigationBar(height: 80)` |
| `size-icon` · `size-icon-sm` · `size-icon-lg` | 24 · 16 · 48 | `IconThemeData(size: …)` |
| `size-avatar` · `size-illustration` · `size-logo` | 40 · 96 · 80 | `CircleAvatar(radius: 20)`, empty/error circle, sign-in logo |
| `size-chip` · `size-progress` | 32 · 8 | chip height inside a 48 touch area, `LinearProgressIndicator(minHeight: 8)` |
| `size-dialog` | 312 | `AlertDialog` `insetPadding: EdgeInsets.symmetric(horizontal: 24)` at 360 dp |
| `Elevation/1` · `/2` · `/3` | y 1 blur 3 · y 2 blur 8 · y 6 blur 16, shadow 16 % | `Card(elevation: 1)` pressed · bottom action bar / snackbar `elevation: 3` · dialog `elevation: 6` |

### Table B — Components → Widgets

| Figma component | Variants / properties | Flutter widget |
|---|---|---|
| **Button** | `Type`: Primary · Secondary · Destructive · Text; `State`: Default · Pressed · Disabled · Loading; `Label`, `Show icon`, `Icon` | `FilledButton` · `OutlinedButton` · `FilledButton` with `backgroundColor: error` · `TextButton` (`.icon` constructors when an icon is shown). Loading = `onPressed: null` + 20 dp `CircularProgressIndicator(strokeWidth: 2)` before the label. Disabled = `onPressed: null`. |
| **Icon Button** | `State`: Default · Pressed; `Icon` | `IconButton` (48 × 48) |
| **Text Field** | `State`: Default · Focused · Filled · Error · Disabled; `Label`, `Show leading icon`, `Leading icon` | `TextFormField` + `InputDecoration(labelText, helperText, errorText, prefixIcon, border: OutlineInputBorder(radius 8))`; focused border 2 dp `primary`, error border 2 dp `error` + `suffixIcon: Icon(Icons.error)` |
| **Card** | `Type`: Selectable · Member · Open slot · Notification · Info · Group; `State`: Default · Pressed · Selected · Unread | `Card` + `InkWell`; Selectable = `RadioListTile`-like custom widget (`selected` → 2 dp `primary` border + `primaryContainer`); Open slot = `DottedBorder`; Notification = `ListTile` in a `Card` with action `Row` |
| **Badge** | `Tone`: Neutral · Primary · Success · Warning · Error · Info; `Label`, `Show icon` | Custom `StatusBadge` (`Container` + `Row(Icon 16, Text labelLarge)`), stadium shape |
| **Banner** | `Tone`: Info · Success · Warning · Error; `Title`, `Body` | Custom `InlineBanner` (`Container` with 1 dp tone border, radius 8) |
| **Bottom Nav** (+ **Nav Item**) | `Selected`: Home · Browse · My Group · Alerts | `NavigationBar` + 4 `NavigationDestination`, `indicatorColor: primaryContainer`, `height: 80` |
| **App Bar** | `Type`: Default · Back · Actions; `Title` | `AppBar(toolbarHeight: 64, centerTitle: false)`; Back = default `BackButton`; Actions = two `IconButton`s |
| **Dialog** | `Type`: Confirmation · Destructive; `Title`, `Body` | `AlertDialog(icon, title, content, actions: [FilledButton(full width), OutlinedButton(full width)])` with `actionsOverflowDirection: VerticalDirection.down`, actions stacked in a `Column` |
| **Loading** | `Type`: Skeleton · Spinner · Overlay; `Message` | Skeleton = 3 placeholder cards with a shimmer; Spinner = `CircularProgressIndicator` + text; Overlay = `ModalBarrier` + centered `Card` with spinner |
| **Empty State** | `Layout`: Screen · Compact; `Title`, `Message`, `Show action`, `Icon` | `Column(CircleAvatar(96) + Icon 48, Text titleMedium, Text bodyMedium, FilledButton)` |
| **Error State** | `Layout`: Screen · Inline; `Title`, `Cause` | Screen = like Empty with `errorContainer` circle + `FilledButton.icon(Icons.refresh, 'Try Again')`; Inline = banner with a `TextButton('Retry')` |
| **Segmented Tabs** | `Selected`: All · Invites · System | `SegmentedButton<NotificationFilter>` (height 48, `showSelectedIcon: true`) |
| **Chip** | `State`: Selected · Unselected; `Label` | `FilterChip` (`materialTapTargetSize: padded`) |
| **Progress** | `Tone`: Warning · Success | `LinearProgressIndicator(value, minHeight: 8, color: warning/success, backgroundColor: skeleton)` + text label |
| **Snackbar** | `Type`: Default · With action; `Message`, `Action` | `SnackBar(behavior: floating, action: SnackBarAction('Undo'))` |
| **Avatar** | `Type`: Initials · Open slot; `Initials` | `CircleAvatar(radius: 20)` / dashed circle with `Icons.add` |

---

## 2. Screen specifications (6 items per screen)

Common rules:
- Every screen is a `Scaffold` with `backgroundColor: surface token (#F8F9FA)`.
- Horizontal padding is 16 (`AppSpacing.lg`), and vertical rhythm between blocks is 16.
- "Pinned action bar" means `bottomNavigationBar:` a `Container(color: surface, padding: 16, elevation 2)` holding a `Column` of full-width buttons with a gap of 8, inside a `SafeArea`.
- Only the body scrolls.

### `SCR_01` Sign In
1. **Layout:** `Scaffold` → `SafeArea` → `Column`:
   - `Expanded(Center(Column))`: logo 80 × 80 (radius 16, `primary`, text "CM" Display `onPrimary`), gap 16, "CapstoneMatch" Display, gap 16, subtitle Body `onSurfaceVariant` centered, max width 328.
   - Pinned action bar: Primary button with a mail icon, then a Body note "Only @fpt.edu.vn accounts can sign in." centered.
   - Nothing scrolls.
2. **Components:** Button `Primary/Default` · `Primary/Loading`; Error State `Inline`.
3. **States:**
   - Default.
   - Signing in: button `Loading`, label "Signing in…", screen not interactive.
   - Error · wrong domain: Error State Inline under the subtitle, with the address that was chosen; the button label becomes "Use Another Google Account".
4. **Interactions:**
   - Tap the button to start Google Sign-In with `hostedDomain: 'fpt.edu.vn'`.
   - If the returned email does not end in `@fpt.edu.vn`, sign out of Google and show the error. Tapping "Retry" or the button restarts sign-in.
5. **Navigation:** app entry. On success, `Navigator.pushReplacementNamed('/home')` (SCR_02). System Back exits the app.
6. **Constraints:** button ≥ 48 dp. The subtitle wraps and never truncates. The error text shows the full email and wraps.

### `SCR_02` Dashboard
1. **Layout:** `Scaffold` → `AppBar` (`App Bar/Default`, title "Home", no actions: the Alerts tab is the only way into notifications, critique C-03) → `SingleChildScrollView(padding 16)` → `Column(gap 16)`, in this order:
   - Countdown banner.
   - "My team" section title (Title style).
   - An Empty State Compact **or** the team header card.
   - Primary button.
   - "Checklist" title and an Info card.
   - `bottomNavigationBar: NavigationBar(selectedIndex: 0)`.
2. **Components:** App Bar `Default`, Banner `Warning` / `Error`, Empty State `Compact` (action hidden), Card `Info`, Badge, Progress `Success`, Button `Primary` with icon, Bottom Nav `Selected=Home`, Loading `Skeleton`.
3. **States:**
   - Not in a team: primary "Browse Available Teams".
   - In a team: header with a "Leader not elected" badge, bar at 4/5, primary "Manage My Team".
   - Registration closed: Error banner, an Info card "Automatic matching", primary "View Matching Status".
   - Loading: skeleton.
4. **Interactions:**
   - Primary button → switch to the Browse tab (Not in a team) or the My Group tab (In a team).
   - "View Matching Status" → push SCR_08.
   - Pull to refresh reloads the status.
   - The countdown recomputes every minute. Below 48 h it stays Warning; after the deadline the screen switches to "Registration closed".
5. **Navigation:** tab 0. Back asks "Exit CapstoneMatch?" before closing.
6. **Constraints:**
   - The countdown shows days and hours only, never seconds.
   - The team name is truncated with an ellipsis after one line.
   - At 412 dp the cards stretch. At ≥ 600 dp the body is limited to 560 wide (see §3).

### `SCR_03` Browse Groups
1. **Layout:** `Scaffold` → `AppBar` (`Default`, "Browse Teams") → `CustomScrollView`, in this order:
   - Search `TextFormField` (label "Search teams", prefix search icon, helper with the result count).
   - Chip row: `Wrap(spacing: 8, runSpacing: 8)` of `FilterChip`s, each with a 48 dp touch area. The chips wrap and are never cut off (critique C-02).
   - `SliverList` of Group cards, gap 16.
   - `NavigationBar(selectedIndex: 1)`.
2. **Components:** Text Field `Default` / `Filled` with leading icon, Chip `Selected` / `Unselected`, Card `Group`, Badge `Success` / `Neutral`, Avatar `Initials` / `Open slot`, Button `Secondary`, Empty State `Screen`, Loading `Skeleton`, Snackbar `Default`, Bottom Nav `Selected=Browse`.
3. **States:**
   - Populated.
   - Loading: 3 skeleton cards.
   - Empty: "No teams match "…"" with "Reset Filters".
   - Team just filled: snackbar, and that card turns into Badge Neutral "Full · 5/5" (lock icon) with its button Disabled "Team is full".
4. **Interactions:**
   - Search filters by name, topic or tag after a 300 ms debounce.
   - Chips toggle. "Open slots" is on by default.
   - Tapping a card or "View Details" pushes SCR_04 with the team id.
   - "Reset Filters" clears the query and turns every chip off except "Open slots".
5. **Navigation:** tab 1 → SCR_04 (`push`). Back from SCR_04 returns here and keeps the scroll position and filters.
6. **Constraints:**
   - Card width fills the screen; the topic wraps to at most 2 lines with an ellipsis.
   - Always show exactly 5 slot avatars.
   - Up to 3 tags; extra tags collapse into "+N".
   - The search field stays visible above the list. The keyboard uses `TextInputAction.search`.

### `SCR_04` Group Detail
1. **Layout:** `Scaffold` → `AppBar` (`Back`, title "Team AI-04") → `SingleChildScrollView(padding 16)` → `Column(gap 16)`: [optional Error banner], topic card (Title, Body, tags), "Roster  3/5" row, member and open-slot cards (gap 12). Pinned action bar at the bottom.
2. **Components:** App Bar `Back`, Card `Member` / `Open slot`, Badge, Button `Primary` (icon person-add) / `Primary Disabled` / `Text`, Dialog `Confirmation`, Loading `Overlay`, Banner `Error`.
3. **States:**
   - Default.
   - Join dialog.
   - Joining: modal overlay "Joining Team AI-04…", not dismissible.
   - Team full: Error banner, button Disabled "Team is full", Text button "Back to Browse".
4. **Interactions:**
   - "Request to Join Team" → `showDialog` (Confirmation: "Confirm Join" / "Cancel").
   - Confirm → call the API with the overlay shown.
   - On 200: `Navigator.popUntil(first)`, switch to the My Group tab and show the snackbar "You joined Team AI-04."
   - On 409 (full): rebuild in the Team full state.
   - Cancel closes the dialog.
5. **Navigation:** from SCR_03. Back → SCR_03. A successful join → SCR_05 tab.
6. **Constraints:**
   - The pinned button stays above the gesture bar (`SafeArea`).
   - The dialog cannot be dismissed while the request is running.
   - The member subtitle "ID · role" is truncated with an ellipsis after one line.

### `SCR_05` My Group Hub
1. **Layout:** `Scaffold` → `AppBar` (`Default`, "My Group") → `SingleChildScrollView(padding 16)` → `Column(gap 16)`, in this order:
   - Team header card: name (Title) with a status Badge; topic; `LinearProgressIndicator` 8 dp; "4 of 5 members · FPT rule: 4–5".
   - Status Banner.
   - "Members  4" row.
   - Member cards (gap 12).
   - Pinned action bar (Primary + Text "Leave Group"), then `NavigationBar(selectedIndex: 2)`.
2. **Components:** Badge (`Warning` Leader not elected / `Success` Ready to lock · Locked / `Primary` Leader · You · Leader / `Info` You), Progress, Banner, Card `Member`, Button `Primary` / `Text`, Snackbar, Bottom Nav `Selected=My Group`, Loading `Skeleton`.
3. **States:**
   - Joined · no leader yet: primary "Vote for Leader"; the snackbar appears after joining.
   - Leave dialog: destructive confirmation for Leave Group.
   - Leader elected (leader view, only on the leader's phone): primary "Proceed to Lock Team".
   - Locked: no action bar; Success banner with the code.
   - Loading.
4. **Interactions:**
   - "Vote for Leader" → push SCR_06.
   - "Proceed to Lock Team" → push SCR_07. This action is only rendered when `currentUser.id == team.leaderId`.
   - "Leave Group" → Destructive dialog "Leave Team AI-04?" with "Leave Team" / "Stay in Team" (critique C-05; state "Leave dialog" in Figma). Hidden when Locked.
5. **Navigation:** tab 2. SCR_06 and SCR_07 are pushed on top; Back from them returns here.
6. **Constraints:** progress color is `warning` below 4 members and `success` at 4–5, always with the text count. The member list shows at most 5.

### `SCR_06` Leader Voting
1. **Layout:** `Scaffold` → `AppBar` (`Back`, "Elect Team Leader") → `ListView(padding 16)`: intro Body, voting Banner, "Candidates  4 members" row, 4 selectable cards (gap 12). Pinned action bar: hint Body + one button.
2. **Components:** App Bar `Back`, Banner `Info` / `Success`, Card `Selectable` (Default / Selected), Button `Primary` (Default / Disabled / Loading) / `Secondary`, Dialog `Confirmation`, Loading `Skeleton`, Error State `Screen`.
3. **States:**
   - Default: no selection, Submit disabled, hint "Select one candidate to continue." Tallies are hidden (`showTally = hasVoted`) until the user has voted (critique C-01).
   - Selected.
   - Submitting.
   - Submitted: Success banner; tallies updated; button becomes Secondary "Change Vote".
   - Change vote dialog.
   - Loading.
   - Error: no internet, Try Again.
4. **Interactions:**
   - Tapping a card selects it and deselects the others.
   - Submit → POST the vote → Submitted.
   - "Change Vote" becomes available after a new card is tapped, and opens the dialog ("Change Vote" / "Keep Current Vote").
   - Voting locks when all 4 members have voted; "Change Vote" is then hidden.
5. **Navigation:** from SCR_05. Back → SCR_05 (a vote is kept only once it has been submitted).
6. **Constraints:**
   - Cards are at least 72 dp tall, and the whole card is the touch target.
   - The name is truncated to one line.
   - The tally is text ("2 votes"); it is never shown by color alone.

### `SCR_07` Lock Review & Error Recovery
1. **Layout:** `Scaffold` → `AppBar` (`Back`, "Lock Team Roster") → `SingleChildScrollView(padding 16)` → `Column(gap 16)`: validation Banner, then either the "Locking is permanent" Info card **or** the recovery Info card, then the "Final roster" row and member / open-slot cards. Pinned action bar (hint + Lock button).
2. **Components:** Banner `Success` / `Error` / `Info`, Card `Info` (with Action `Secondary`) / `Member` / `Open slot`, Badge `Primary` Leader / `Success` Confirmed · Locked, Button `Primary` with lock icon (Default / Disabled), Dialog `Destructive`, Loading `Overlay`.
3. **States:**
   - Ready (4 of 5): the hint above the button lists every member, e.g. "Locking: Ha (leader), Minh, Bao, Huy" (critique C-06).
   - Confirm dialog.
   - Locking.
   - Locked.
   - **Error · 3 of 5:** Lock disabled with the hint "Available when your team has 4 members."
   - Recovery · invites sent.
4. **Interactions:**
   - Lock → destructive `showDialog`. "Yes, Lock Permanently" → overlay → POST → Locked.
   - "Invite from Waiting Pool" → POST invites → Recovery state.
   - When a push "invite accepted" arrives, refresh; the count becomes 4 and the button is enabled.
5. **Navigation:** from SCR_05 (leader only). "Back to My Group" and Back → SCR_05. After locking, Back also lands on SCR_05 (the review is not kept in the stack).
6. **Constraints:**
   - The confirm button uses `colorScheme.error`. The dialog is not dismissible by tapping outside while locking.
   - At 360 × 800 the recovery card must stay above the fold, so it is placed before the roster.

### `SCR_08` Random Pool Status
1. **Layout:** `Scaffold` → `AppBar` (`Back`, "Matching Status") → `SingleChildScrollView(padding 16)` → hero `Column` (96 dp hourglass circle, Headline, Body centered, Warning badge "Result by 17 Oct, 17:00") → queue details card (5 label/value rows). Pinned action bar: Primary "Refresh Status" (refresh icon) + Secondary "Email Academic Office" (mail icon).
2. **Components:** App Bar `Back`, Badge `Warning`, Button `Primary` (Default / Loading) / `Secondary`, Dialog `Confirmation`, Error State `Screen`.
3. **States:**
   - In progress.
   - Refreshing: button Loading; "Last checked: Checking now…".
   - Matched dialog: "View My Team" / "Later".
   - Error: timeout, Try Again.
4. **Interactions:**
   - Refresh → GET status.
   - The screen polls every 30 s while it is visible (stop in `dispose`).
   - Email opens `mailto:` through `url_launcher`.
   - Matched → dialog → "View My Team" switches to the My Group tab.
5. **Navigation:** from SCR_02 "View Matching Status". Back → SCR_02.
6. **Constraints:** values in the detail rows are right-aligned and wrap onto 2 lines. Polling must not stack requests: skip a poll while one is in flight.

### `SCR_09` Notifications & Invites
1. **Layout:** `Scaffold` → `AppBar` (`Actions`, "Notifications", "Mark all read" + "More") → `Column`, in this order:
   - `SegmentedButton` (padding 16).
   - `Expanded(ListView)` with sections "Today" and "Earlier", notification cards (gap 16).
   - `NavigationBar(selectedIndex: 3)`.
2. **Components:** App Bar `Actions`, Segmented Tabs, Card `Notification` (Default / Unread, icon by type, actions with Button `Secondary` Decline / `Primary` Accept), Badge `Primary` "New", Dialog `Confirmation`, Snackbar `With action`, Empty State `Screen`, Loading `Skeleton`, Error State `Screen`, Bottom Nav `Selected=Alerts`.
3. **States:** All · Invites tab · Accept dialog · Declined · undo · Empty ("You're all caught up" + "Browse Teams") · Loading · Error.
4. **Interactions:**
   - The tabs filter the list.
   - Accept → dialog "Join Team WEB-11?" → join → My Group tab.
   - Decline removes the card and shows a snackbar with "Undo" for 5 s; the request is sent after the snackbar closes.
   - Tapping a card marks it read.
   - "Mark all read" clears every "New" badge.
5. **Navigation:** tab 3, also opened from the Dashboard bell and from push notifications (deep link to the item).
6. **Constraints:** "Mark all read" is an `IconButton(tooltip: 'Mark all as read')`, which also gives screen readers its name (critique C-04). The title wraps to at most 2 lines. Decline and Accept are each at least 48 dp tall and share the row equally. Undo stays reachable above the bottom nav.

---

## 3. Wider screens (600 dp and above)

These are described but not designed.

| Width | Change |
|---|---|
| < 600 dp (360–599) | As designed: one column, bottom `NavigationBar`, full-width cards and pinned buttons. 412 dp is checked on Figma page 03. |
| 600–839 dp (tablet portrait, foldables) | Replace the bottom bar with a `NavigationRail` (4 destinations, labels visible). Body content is limited to `maxWidth: 560` and centered. SCR_03 group cards become a 2-column grid (`SliverGrid`, `crossAxisCount: 2`, gap 16). Pinned action bars keep a width of 560. Dialogs stay 312–400 wide. |
| ≥ 840 dp (tablet landscape) | `NavigationRail` extended. List–detail layouts: SCR_03 list on the left (360) and SCR_04 detail on the right; SCR_09 list on the left and the selected item on the right. SCR_05 and SCR_07 show the roster and the actions side by side. |

Use `LayoutBuilder` / `MediaQuery.sizeOf(context).width` with the breakpoints 600 and 840. Text scales with `MediaQuery.textScaler`; layouts must work at 200 % text size (cards grow in height, and nothing uses a fixed text height).
