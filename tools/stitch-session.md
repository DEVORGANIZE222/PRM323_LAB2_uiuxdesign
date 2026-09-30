# Stitch session: prompts to run and screenshots to save

Run these prompts in your own Stitch project (Remix of CapstoneMatch UI Design, `stitch.withgoogle.com/projects/3478201953325536957`). Save every screenshot into `assets/stitch/` with the file name shown. Then paste the prompt exactly as you sent it into `ai/ai-design-log.md` §6 and describe what Stitch actually returned.

Take a screenshot by selecting the screen in Stitch → **Export → PNG**, or with a full-screen capture (Win + Shift + S).

---

## Step 0: the initial output (already in the project)

Screenshot the two screens that the initial prompt produced (Browse Groups and My Group Hub) and the design-system card:
- `assets/stitch/00-initial-design-system.png`
- `assets/stitch/00-initial-browse-groups.png`
- `assets/stitch/00-initial-my-group-hub.png`

## Step 1: generate the screens for Flows 2 and 3

```text
Using this project's design system, add two new Android screens at 360 x 800 dp for CapstoneMatch.
Persona: Minh, 20, FPT Software Engineering student, uses the phone one-handed on the bus and outdoors in sunlight.
1. SCR_06 "Elect Team Leader": app bar with a back arrow, one-line explanation that only the elected leader can lock the roster, an info banner "Voting closes in 1 day 6 hours · 2 of 4 members have voted", four candidate rows (Nguyen Van Minh – Backend, Tran Thu Ha – Mobile, Le Quoc Bao – AI/ML, Pham Gia Huy – DevOps) and a pinned primary button "Submit My Vote".
2. SCR_07 "Lock Team Roster": green banner "Ready to lock: 4 of 5 members", a note that locking is permanent, the final roster with a Leader badge on Tran Thu Ha, and a pinned primary button "Lock Team Roster".
Every tappable element must be at least 48 x 48 dp; body text at least 14 sp.
```
Save: `assets/stitch/01-generated-scr06.png`, `assets/stitch/01-generated-scr07.png`.

## Iteration 1: low contrast on primary buttons

**Named problem:** white labels on `#F27024` measure 2.95:1, below the 4.5:1 that WCAG 1.4.3 requires.
- Before: `assets/stitch/it1-before-browse.png` (Browse Groups before the change).

```text
Problem: the primary button labels are white on #F27024, which is only 2.95:1 contrast and fails WCAG AA for 14 sp text. Change every filled primary button, the selected chip and the active bottom-navigation indicator to primary #AD4A0A with white labels (5.58:1). Keep #F27024 only for decorative elements. Do not change the layout.
```
- After: `assets/stitch/it1-after-browse.png`.

## Iteration 2: missing error and recovery state on SCR_07

**Named problem:** there is no state for a team with fewer than 4 members, so the Lock button looks usable when it must not be.
- Before: `assets/stitch/it2-before-scr07.png`.

```text
Problem: SCR_07 has no error state. Add a variant of "Lock Team Roster" for a team with only 3 of 5 members:
1. A red error banner at the top: "Can't lock yet: 3 of 5 members. FPT Capstone rules require at least 4 members."
2. Directly under it, a recovery card "Need 1 more member? Invite unassigned students from the Waiting Pool" with an outlined button "Invite from Waiting Pool" (48 dp high).
3. The roster shows 3 members plus 2 dashed "Open slot" placeholders.
4. The pinned "Lock Team Roster" button is disabled (grey) with the hint "Available when your team has 4 members".
```
- After: `assets/stitch/it2-after-scr07.png`.

## Iteration 3: small targets and a biased tally on SCR_06

**Named problem:** candidates are small radio rows, and vote tallies are visible before you vote, which nudges people toward the front-runner.
- Before: `assets/stitch/it3-before-scr06.png`.

```text
Problem: on SCR_06 the candidates are small radio rows and the vote counts are visible before I have voted. Redesign each candidate as a full-width selectable card at least 72 dp high (avatar with initials, name 16 sp semibold, role 14 sp, radio on the right). Selected card: 2 dp border in #AD4A0A, background #FFF1E8, filled radio. Hide all vote counts until the user has submitted a vote. Keep the pinned "Submit My Vote" button disabled until a card is selected.
```
- After: `assets/stitch/it3-after-scr06.png`.

---

After the session, fill §6 of `ai/ai-design-log.md`:
- Paste each prompt exactly as sent. If you edited one, paste the version you actually sent.
- Describe what changed, in one or two lines per iteration.
- List the screenshot files.
