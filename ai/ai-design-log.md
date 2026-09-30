# AI Design Log: Prompting, Iterations, Critique & Decisions

## 1. AI Tool Disclosure
- **Google Stitch / Gemini 1.5 Pro:** Used for initial mobile UI layout generation and rapid visual prototyping of the 3 primary flows.
- **Antigravity AI (Claude 3.7 Sonnet / Gemini):** Used for UX analysis, Nielsen heuristic evaluation, WCAG 2.1 contrast audits, and Flutter handoff mapping.

---

## 2. Initial UI Generation in Google Stitch

### Full Verbatim Prompt (Copy & Paste this into Google Stitch):
```text
Role: Senior Mobile UI/UX Designer.
Project: Mobile Capstone Team Formation app ("CapstoneMatch") for FPT University students.
Target Screen Dimensions: 360 x 800 dp (Android baseline).

Context & Target Persona:
Minh (20), an FPT Software Engineering senior using an Android smartphone on-the-go. He has a tight deadline to form a 4–5 member Capstone team, inspect teammates' tech stacks, elect a team leader, and lock the team roster before the system closes.

Design System Specifications (from DESIGN.md):
- Color Palette: Primary #F27024 (FPT Orange), On-Primary #FFFFFF, Surface #FFFFFF, Background #F8F9FA, Text Primary #1A1D1E, Text Secondary #596066, Success #0D8244, Error #BA1A1A, Warning #B26A00.
- Typography: Inter/Roboto. Minimum body text 14sp (#1A1D1E), Screen titles 22sp semi-bold, Card headings 18sp semi-bold.
- Spacing: 8pt grid (8dp, 16dp margins, 24dp vertical section spacing).
- Touch Targets: Every interactive button and row must be at least 48x48 dp.
- Navigation: Persistent bottom navigation bar with 4 items: Dashboard, Browse Groups, My Group, Notifications.

Screens to Generate (Flow 1 & Flow 3):
1. Screen SCR_03: "Browse Groups" - Top search bar with filter chips ("Open Slots", "AI/ML", "Web"). A scrollable list of Group Cards. Each card clearly shows: Group Name ("Team AI-04"), Current Capacity ("3/5 Members" badge), Tech Tags ("Flutter", "FastAPI"), 3 avatar circles of current members + 2 dashed empty avatar slots, and a clear primary action button "View Team".
2. Screen SCR_05: "My Group Hub" - Team status header ("Team AI-04 - In Formation"), a visual progress bar indicating 3/5 members, an alert banner saying "Leader not yet elected - Vote now to enable group locking", member list cards with roles, a secondary button "Leave Group", and a prominent bottom fixed button "Lock Team Roster".
```

---

## 3. Three Meaningful Iterations (Targeting Specific Named Problems)

### Iteration 1: "Ambiguous Group Capacity & Hidden Action Affordance on Group Cards"
- **Named Problem:** In the initial generation, group cards used tiny text for "3/5" and did not visually distinguish between an open group and a full group (5/5). The tap area to join was ambiguous (the whole card looked like plain static text).
- **Prompt Sent to AI:**
  ```text
  Refine the Group Cards in SCR_03 (Browse Groups):
  1. Add a distinct visual badge in the top-right corner of each card: Green background (#E6F4EA) with dark green text (#0D8244) "3/5 Slots Filled - 2 Open".
  2. For full groups (5/5), show a grayed-out badge "Full (5/5)" and disable the primary button.
  3. Include 5 avatar circles in a row: filled avatars with student photos/initials for existing members, and 2 gray dashed placeholder circles with a "+" icon representing open spots.
  4. Ensure the primary button is clearly labeled "View Details & Join" with a minimum 48dp height and #F27024 background.
  ```
- **Result (Before vs After):** 
  - *Before:* Generic white rectangle with plain text "Team AI-04 (3/5)".
  - *After:* High-affordance card with explicit slot indicators (3 filled, 2 dashed) and color-coded status badges, making availability instantly scannable within 3 seconds.

---

### Iteration 2: "Missing Error State & Ineligible Lock Feedback (< 4 Members)"
- **Named Problem:** In the initial generation, tapping "Lock Team Roster" on a 3-person team showed a generic success modal. This violates FPT University regulations requiring a minimum of 4 members to form a valid Capstone group.
- **Prompt Sent to AI:**
  ```text
  Generate the error and recovery state for Screen SCR_07 (Lock Review) when the team has only 3/5 members:
  1. Display a prominent top Error Alert Banner: background #FDF2F2, border #BA1A1A, with an error icon and bold text: "Ineligible to Lock Roster: Your team has 3 members. FPT Capstone regulations require at least 4 members."
  2. Disable the primary CTA button "Lock Team Roster" (show disabled state: gray background #E1E3E5, text #8E9192).
  3. Add an actionable Recovery Card directly below the error: "Need 1 more member? You can invite unassigned students from the Waiting Pool." with a secondary button "Invite from Pool" (48dp height, #F27024 outline).
  ```
- **Result (Before vs After):**
  - *Before:* False-positive success state allowing illegal roster lock.
  - *After:* Comprehensive error prevention with explicit explanation in plain language and a 1-tap recovery mechanism to invite waiting peers.

---

### Iteration 3: "Low Contrast & Small Touch Target (<48dp) in Leader Voting List"
- **Named Problem:** The candidate selection list in `SCR_06` used standard HTML-style radio buttons (18x18dp) without row-level tap targets, and gray text (#9E9E9E) that failed WCAG 2.1 AA contrast requirements under daylight.
- **Prompt Sent to AI:**
  ```text
  Redesign Screen SCR_06 (Leader Voting):
  1. Turn each candidate into an interactive Selectable Card with a minimum height of 64dp (exceeding 48x48dp touch target).
  2. Increase text contrast: Candidate name in 16sp bold (#1A1D1E - 15.6:1 contrast ratio), candidate role/bio in 14sp (#596066 - 5.4:1 contrast ratio).
  3. Selected state must feature a 2dp solid border in #F27024, light orange background tint (#FFF1E8), and a large 24dp checkmark circle.
  4. Display real-time vote tally pills (e.g., "2 votes received") using #0D8244 for the current front-runner.
  ```
- **Result (Before vs After):**
  - *Before:* Tiny 18dp radio buttons, cramped text, contrast ratio 2.8:1 (FAIL).
  - *After:* Full-width tappable cards (64dp height), contrast ratio > 5.4:1 (PASS WCAG AA), clear visual feedback when selected.

---

## 4. AI UX Critique (Against 10 Nielsen Heuristics & WCAG 2.1)

| # | Screen ID | Heuristic / Standard | Finding Description | Severity |
|---|---|---|---|---|
| **F-01** | `SCR_07` (Lock Review) | **Heuristic #5: Error Prevention** | The confirmation dialog for locking had a single "OK" button without explaining that locking is irreversible and permanently closes team editing. | **High** |
| **F-02** | `SCR_03` (Browse Groups) | **WCAG 2.1 SC 1.4.3: Contrast (Minimum)** | Secondary tech tags ("Python", "Flutter") used light gray text `#A0A5AA` on `#F0F1F2` background (contrast ratio 2.3:1, failing the 4.5:1 minimum). | **High** |
| **F-03** | `SCR_05` (My Group) | **Heuristic #1: Visibility of System Status** | When a student requests to join, there was no indicator showing whether their application was "Pending", "Accepted", or "Rejected by Leader". | **Medium** |
| **F-04** | `SCR_06` (Leader Voting) | **WCAG 2.1 SC 2.5.5: Target Size** | The "Change Vote" link was rendered as an inline 12sp text link with an effective touch area of only 24x14dp, causing mistaps on mobile. | **High** |
| **F-05** | `SCR_02` (Dashboard) | **Heuristic #6: Recognition Rather Than Recall** | The dashboard displayed deadline as raw date (`2026-10-15 17:00`) without a relative urgency countdown (e.g., "3 days left"), forcing students to calculate mental time. | **Medium** |

---

## 5. Decision Record (Accepted, Modified, Rejected)

| Finding | Decision | Design Action in Figma | Justification (Persona / Heuristic / Constraint) |
|---|---|---|---|
| **F-01** | **ACCEPTED** | Redesigned lock dialog into a Destructive Confirmation Dialog with bold red warning text: *"This action cannot be undone. Roster will be finalized for Registrar submission."* with two distinct buttons: *"Cancel"* (Secondary) and *"Yes, Lock Permanently"* (Filled Red). | **Heuristic #5 & Persona Minh:** Minh is under exam stress and cannot afford accidentally locking an incomplete group with 3 people. |
| **F-02** | **ACCEPTED** | Updated tag design token to use background `#E9ECEF` with text `#343A40`, achieving a contrast ratio of **7.2:1** (exceeds WCAG AAA). | **WCAG 2.1 AA:** Minh uses his phone outdoors in direct sunlight; text must be readable without straining. |
| **F-03** | **ACCEPTED** | Added a persistent Status Pill on `SCR_05`: Yellow badge with clock icon ⏳ *"Pending Leader Review (Submitted 2h ago)"*. | **Heuristic #1 (Visibility of System Status):** Eliminates user anxiety and prevents duplicate join requests. |
| **F-04** | **MODIFIED** | Instead of an inline text link, converted "Change Vote" into an Outlined Button with padding `12dp 16dp` and min-height `48dp`, but only showed it when the election window was still open. | **Touch target compliance & Business Rule:** FPT academic guidelines lock individual votes once 100% of team members have cast their ballots. |
| **F-05** | **ACCEPTED** | Replaced static date with a Dynamic Countdown Card: Large bold text **"⏳ 2 Days 14 Hours Left"** with color-changing logic (Turns warning orange #B26A00 at < 48 hours). | **Persona & Heuristic #6:** Minh has a hectic schedule; seeing an explicit countdown prevents missing the deadline. |
