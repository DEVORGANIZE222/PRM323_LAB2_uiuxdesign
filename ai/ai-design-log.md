# AI Design Log: Prompting, Iterations, Critique & Decisions

## 1. AI Tool Disclosure
- **Google Stitch / Gemini 1.5 Pro:** Used for initial mobile UI layout generation and rapid visual prototyping of the 3 primary flows.
- **Antigravity AI (Claude 3.7 Sonnet / Gemini):** Used for UX analysis, Nielsen heuristic evaluation, WCAG 2.1 contrast audits, and Flutter handoff mapping.
- **Claude Code (Anthropic, Claude Opus 5.5):** wrote the Figma plugin in `tools/figma-plugin/`, which builds the Variables, components, final screens, wireframes, flows and prototype. It also measured WCAG contrast and target sizes in the Figma file, ran critique round 2 (§7), and rewrote `user-flow.md`, `screen-spec.md`, `design-decisions.md` and `flutter-handoff.md` to match the Figma file. Every decision in §8 was reviewed by the team.

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

---

## 6. Stitch session in our own project (evidence)

Project: *Remix of CapstoneMatch UI Design* (`stitch.withgoogle.com/projects/3478201953325536957`). The prompts to run are in `tools/stitch-session.md`. Screenshots go into `assets/stitch/`.

| Step | Named problem | Prompt (verbatim, as sent) | What Stitch returned | Screenshots |
|---|---|---|---|---|
| 0 · Initial | — | §2 above | _to fill_ | `00-initial-*.png` |
| 1 · Generate SCR_06, SCR_07 | Screens for Flows 2 and 3 were missing | _paste_ | _to fill_ | `01-generated-*.png` |
| Iteration 1 | Primary button contrast 2.95:1 | _paste_ | _to fill_ | `it1-before-browse.png`, `it1-after-browse.png` |
| Iteration 2 | No error or recovery state for fewer than 4 members | _paste_ | _to fill_ | `it2-before-scr07.png`, `it2-after-scr07.png` |
| Iteration 3 | Small radio targets; tallies bias the vote | _paste_ | _to fill_ | `it3-before-scr06.png`, `it3-after-scr06.png` |

---

## 7. AI critique, round 2 (Claude, on the Figma final UI)

Tool: Claude Code (Claude Opus 5.5). Input: Figma page 03 (all nine screens and their states) as rendered PNG exports.

### Prompt (verbatim)

```text
You are a senior mobile UX reviewer. Review the CapstoneMatch final UI in Figma (page 03, nine screens SCR_01–SCR_09 at 360 × 800 dp, all state variants) against:
1. Nielsen's 10 usability heuristics,
2. WCAG 2.1 AA basics (contrast, target size, use of color),
3. the persona: Minh, 20, FPT SE student, Android phone, one-handed use on the bus and in campus sunlight, mild astigmatism, under deadline pressure.
Give at least 5 findings. For each finding name the screen and state, the heuristic or criterion, what you observed, why it matters for Minh, a severity (High/Medium/Low) and one concrete recommendation. Do not report things that already work; mention strengths only at the end in one line.
```

### Answer (verbatim)

| # | Screen / state | Heuristic / criterion | Observation | Why it matters for Minh | Severity | Recommendation |
|---|---|---|---|---|---|---|
| C-01 | SCR_06 Default, Selected | H2 Match with the real world, persona (fair election) | Vote tallies ("1 vote", "0 votes") are visible **before** Minh has voted. | Seeing who is ahead before voting nudges him toward the front-runner (bandwagon effect). The persona goal is a transparent, fair election. | Medium | Hide tallies until the user has submitted a vote; show "2 of 4 members have voted" only. |
| C-02 | SCR_03 Populated | H1 Visibility of system status, H6 Recognition rather than recall | The filter chip row is cut off at the right edge ("Web" is half visible) with no sign that it scrolls. | With one hand on a moving bus Minh will not discover the hidden chips, so he may miss the "Web" filter. | Medium | Let the chips wrap onto a second line (there are only 4), or add an edge fade and a "More filters" chip. |
| C-03 | SCR_02 all states | H8 Aesthetic and minimalist design, H4 Consistency | The app bar has a bell icon that duplicates the Alerts tab in the bottom navigation, and a profile icon that leads nowhere in the flows. | Two routes to the same place plus a dead icon add noise to the most-visited screen; the profile icon is a dead end. | Low | Remove both app-bar actions on Home; keep the Alerts tab as the single entry point. |
| C-04 | SCR_09 all states | H6 Recognition rather than recall, WCAG 1.1.1 / 4.1.2 (name of control) | "Mark all as read" is an icon-only double-check glyph without a label. | The double-check glyph is ambiguous (read? done? synced?). A screen reader user gets no name. | Low | Add a tooltip and an accessible label ("Mark all as read"), or use a text button. |
| C-05 | SCR_05 Joined · no leader yet | H5 Error prevention | "Leave Group" is a text button directly under the primary "Vote for Leader" in the thumb zone. | A slip of the thumb on a destructive action; leaving a team two days before the deadline is costly. | Medium | Move Leave Group to an overflow menu, or at least require a destructive confirmation dialog. |
| C-06 | SCR_07 Ready (4 of 5) | H1 Visibility of system status | At 360 × 800 the 4th member is below the fold, so the leader locks an irreversible roster without seeing every name. | Minh (or Ha) might lock without noticing a wrong member. | Medium | Show a compact roster (names only) or a summary line "4 members: Ha, Minh, Bao, Huy" above the button. |
| C-07 | SCR_08 In progress | H8 Minimalism | A manual "Refresh Status" button is primary although the screen auto-checks every 30 s. | Two ways to refresh compete for attention; the primary slot could hold the more useful action. | Low | Make Refresh secondary (or remove it) and rely on auto-check. |

Strengths: one clear primary action per screen, pinned in the thumb zone; error states explain the cause in plain language and always offer a way forward; every status badge pairs an icon with text.

---

## 8. Decision record, round 2

| Finding | Decision | What changed in Figma | Reason (persona / heuristic / constraint) |
|---|---|---|---|
| **C-01** Tallies visible before voting | **ACCEPTED** | SCR_06 Default / Selected / Submitting show no tallies; they appear only in Submitted. | **Persona goal "transparent, fair election"** and H2: seeing the front-runner before voting biases the choice. |
| **C-02** Chip row cut off | **ACCEPTED** | SCR_03 chips wrap onto a second line; "Web" is fully visible. | **H1 / H6:** with only 4 filters, wrapping costs one line and removes a hidden-scroll affordance that Minh would miss one-handed. |
| **C-03** Duplicate bell, dead profile icon on Home | **ACCEPTED** | SCR_02 uses App Bar `Default` (no actions). | **H8 minimalism and H4 consistency:** the Alerts tab is the one entry point; the profile icon led nowhere (a dead end). |
| **C-04** Icon-only "Mark all read" | **MODIFIED** | Icon kept; the handoff requires `tooltip: 'Mark all as read'` (also the accessible name). | **Constraint:** at 360 dp the title "Notifications" plus a text button would truncate the title. A tooltip and semantic label fix the naming problem (WCAG 4.1.2) without the layout cost. |
| **C-05** Leave Group next to the primary action | **MODIFIED** | Leave Group stays visible but opens a Destructive dialog "Leave Team AI-04?" (new SCR_05 state "Leave dialog"). | **H5 error prevention** is met by the confirmation. Hiding the action in an overflow menu would hurt **H6** for a student who really needs to leave before the deadline. |
| **C-06** 4th member below the fold before locking | **MODIFIED** | SCR_07 Ready: the hint above Lock reads "Locking: Ha (leader), Minh, Bao, Huy". | **H1:** the leader sees every name next to the irreversible button. Making the cards smaller instead would break the 72 dp card and readability rules (persona: astigmatism). |
| **C-07** Manual Refresh competes with auto-check | **REJECTED** | No change. | **H3 user control and freedom and the persona's deadline anxiety:** the auto-check is invisible, and a visible "check now" reassures Minh. It is the only action on the screen that moves him forward. |

Figma version history shows this round as two named versions, *"Before critique round 2"* and *"Critique round 2 applied"*.
