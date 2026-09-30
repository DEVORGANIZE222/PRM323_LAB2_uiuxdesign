# Screen Specifications (Functional Intent & Content Inventory)

Purpose, displayed content, flow and state variants for the nine screens of **CapstoneMatch**. All screens are 360 × 800 dp. The state variants listed here are the frames placed next to each screen on Figma page **03 Final UI**.

Sample data used everywhere: Team **AI-04** ("AI Healthcare Diagnostic Assistant"). Members are Tran Thu Ha (elected leader), Nguyen Van Minh (the persona), Le Quoc Bao and Pham Gia Huy.

---

### `SCR_01` Sign In (FPT Google SSO)
- **Purpose:** authenticate with an institutional `@fpt.edu.vn` Google account.
- **Content:** logo, app name, one-line explanation of the registration period, a primary "Continue with Google" button, and a domain note.
- **Flow:** entry point (Flow 1).
- **States:** Default · Signing in (button loading) · Error · wrong domain (inline error with the chosen address and "Use Another Google Account").

### `SCR_02` Dashboard / Home
- **Purpose:** show the deadline, the student's team status and the next step.
- **Content:** a Warning banner with a relative countdown, a "My team" block (empty card or team header with a capacity bar), the primary action, and a 3-step checklist.
- **Flow:** start of Flow 1; after the deadline it leads into Flow 3's SCR_08 path.
- **States:** Not in a team · In a team · Registration closed (Error banner and "View Matching Status") · Loading (skeleton).

### `SCR_03` Browse Groups
- **Purpose:** find teams that still have open slots.
- **Content:**
  - A search field.
  - Filter chips (Open slots, AI / ML, Mobile, Web); they wrap onto a second line (critique C-02).
  - Group cards, each with name, topic, an "N open slots" or "Full" badge, 5 visual slots, tech tags and "View Details".
- **Flow:** Flow 1.
- **States:** Populated · Loading · Empty ("No teams match…" and "Reset Filters") · Team just filled (snackbar; that card becomes Full 5/5 with a disabled button).

### `SCR_04` Group Detail
- **Purpose:** inspect the topic and roster, then join.
- **Content:** topic card with tags, a roster count (3/5), member cards, open-slot cards saying what the team is looking for, and a pinned "Request to Join Team".
- **Flow:** Flow 1.
- **States:** Default · Join dialog (confirmation) · Joining (blocking overlay) · Team full (Error banner, disabled button, "Back to Browse").

### `SCR_05` My Group Hub
- **Purpose:** the team workspace: capacity, leader status, members and the next action.
- **Content:**
  - A team header with a status badge, capacity bar and "4 of 5 members · FPT rule: 4–5".
  - A status banner and the member list with "You", "Leader" or "Confirmed" badges.
  - A primary action and "Leave Group".
- **Flow:** end of Flow 1, start and end of Flows 2 and 3.
- **States:**
  - Joined · no leader yet (Minh's phone, snackbar "You joined Team AI-04", primary "Vote for Leader").
  - Leader elected (leader view: **Tran Thu Ha's phone**, since only the leader sees "Proceed to Lock Team").
  - Leave dialog (destructive confirmation, critique C-05).
  - Locked (read-only, with the confirmation code).
  - Loading.

### `SCR_06` Leader Voting
- **Purpose:** a transparent election of the one member who may lock the roster.
- **Content:** an explanation, a banner with the voting deadline and votes cast, selectable candidate cards (avatar, name, role, radio). Tallies appear only after you have voted (critique C-01), and a pinned Submit button with a hint.
- **Flow:** Flow 2.
- **States:**
  - Default (nothing selected, Submit disabled with a hint) · Selected · Submitting.
  - Submitted (Success banner, "Change Vote" as an outlined 48 dp button) · Change vote dialog.
  - Loading · Error (no internet, "your vote has not been sent", Try Again).

### `SCR_07` Lock Review & Error Recovery
- **Purpose:** validate the 4–5 member rule before the irreversible lock.
- **Content:** a validation banner, the "Locking is permanent" note or a recovery card, and the final roster (Leader and Confirmed badges, open slots). Above the Lock button a hint names every member being locked (critique C-06).
- **Flow:** Flow 3.
- **States:**
  - Ready (4 of 5) · Confirm dialog (destructive) · Locking (overlay) · Locked (code CM-AI04-7F3K).
  - **Error · 3 of 5** (Lock disabled, with the reason). The recovery card "Invite from Waiting Pool" sits directly under the error.
  - Recovery · invites sent.

### `SCR_08` Random Pool Status
- **Purpose:** reassure a student left without a team after the deadline.
- **Content:** a "Matching in progress" illustration, an expected-result badge, and queue details (ID, preferred roles, skills, last checked, auto-check every 30 s). Actions are "Refresh Status" and "Email Academic Office".
- **Flow:** Flow 3, after-deadline path.
- **States:** In progress · Refreshing (button loading) · Matched dialog ("You've been placed in a team") · Error (server timeout; "your place in the queue is safe").

### `SCR_09` Notifications & Invites
- **Purpose:** invites, election results and roster events in one list.
- **Content:** segmented tabs (All, Invites, System) and notification cards (icon by type, "New" badge, time, Accept/Decline on invites). The app bar has "Mark all read" and "More".
- **Flow:** Flow 1 (join through an invite), Flow 3 (recovery: a pool student accepts).
- **States:** All · Invites tab · Accept dialog · Declined · undo (snackbar with Undo) · Empty ("You're all caught up") · Loading · Error.
