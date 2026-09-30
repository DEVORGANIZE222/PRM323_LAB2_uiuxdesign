# Information Architecture & User Flows

## 1. Information Architecture

### Screen inventory

| ID | Screen | Level | Reached from | Used by flow |
|---|---|---|---|---|
| `SCR_01` | Sign In (FPT Google SSO) | Entry | App launch | Flow 1 |
| `SCR_02` | Dashboard / Home | Top-level tab 1 | Sign-in, bottom nav | Flow 1 (start), Flow 3 (after deadline) |
| `SCR_03` | Browse Groups | Top-level tab 2 | Dashboard CTA, bottom nav | Flow 1 |
| `SCR_04` | Group Detail | Nested under SCR_03 | Tap a group card | Flow 1 |
| `SCR_05` | My Group Hub | Top-level tab 3 | Bottom nav, after joining | Flow 1 (end), Flow 2 (start/end), Flow 3 (start/end) |
| `SCR_06` | Leader Voting | Nested under SCR_05 | "Vote for Leader" | Flow 2 |
| `SCR_07` | Lock Review & Error Recovery | Nested under SCR_05 | "Proceed to Lock Team" (leader only) | Flow 3 |
| `SCR_08` | Random Pool Status | Nested under SCR_02 | Dashboard after the deadline | Flow 3 (after-deadline path) |
| `SCR_09` | Notifications & Invites | Top-level tab 4 | Bottom nav, app-bar bell | Flow 1 (invite entry), Flow 3 (recovery) |

Every screen is used by at least one flow.

### Navigation structure

```
[SCR_01 Sign In]
       │
       ▼
┌───────────────────────── Bottom navigation (4 tabs) ─────────────────────────┐
│  SCR_02 Home        SCR_03 Browse        SCR_05 My Group        SCR_09 Alerts │
└──────┬─────────────────────┬────────────────────┬──────────────────────┬─────┘
       │                     │                    ├─► SCR_06 Leader Voting
       ▼                     ▼                    └─► SCR_07 Lock Review & Recovery
 SCR_08 Random Pool    SCR_04 Group Detail
 (after the deadline)
```

- Top-level tabs keep the bottom navigation; nested screens replace it with a Back arrow in the app bar.
- System Back on a nested screen returns to its parent tab. Back on a top-level tab goes to Home. Back on Home asks before leaving the app.
- Only the elected leader sees "Proceed to Lock Team" on SCR_05, so SCR_07 is reachable only from the leader's phone.

---

## 2. User Flows

The same flows are drawn on Figma page **01 User Flow** (each step links to its screen). They are clickable on page **06 Prototype**, which has one starting point per flow.

### Flow 1: Discover and join an open Capstone team
- **Start:** `SCR_02` Dashboard, student not in a team
- **Goal:** join a compatible team that still has an open slot
- **End:** `SCR_05` My Group Hub showing "You joined Team AI-04"

```mermaid
graph TD
    S1([SCR_01 Sign in with @fpt.edu.vn]) -->|wrong domain| E0[SCR_01 error: not an FPT account]
    E0 -->|Use another Google account| S1
    S1 --> Start([Start: SCR_02 Dashboard, not in a team])
    Start -->|Browse Available Teams| B[SCR_03 Browse Groups]
    B -->|Filter Open slots, tap Team AI-04| D[SCR_04 Group Detail]
    B -->|search finds nothing| Empty[SCR_03 Empty: Reset Filters]
    Empty --> B
    D -->|Request to Join Team| Dlg{Dialog: Join Team AI-04?}
    Dlg -->|Cancel| D
    Dlg -->|Confirm Join| L[SCR_04 Joining… loading overlay]
    L -->|slot still free| End([End: SCR_05 My Group Hub, joined])
    L -->|slot taken meanwhile| Full[SCR_04 Team is full 5/5]
    Full -->|Back to Browse, list refreshed| B
    Inv[SCR_09 Accept an invite] -->|alternative entry| End
```

### Flow 2: Vote for a team leader
- **Start:** `SCR_05` My Group Hub, "No leader yet" banner
- **Goal:** elect the member who is allowed to lock the roster
- **End:** `SCR_05` with a Leader badge (Tran Thu Ha, 3 of 4 votes)

```mermaid
graph TD
    Start([Start: SCR_05, no leader yet]) -->|Vote for Leader| V[SCR_06 Leader Voting]
    V -->|no internet| Err[SCR_06 Error: Couldn't load candidates]
    Err -->|Try Again| V
    V -->|tap a candidate card| Sel[SCR_06 Selected: Submit enabled]
    Sel -->|Submit My Vote| Sub[SCR_06 Submitting… loading]
    Sub --> Done[SCR_06 Vote recorded]
    Done -->|Change Vote| CV{Dialog: Change your vote?}
    CV -->|Keep Current Vote| Done
    CV -->|Change Vote| Sub
    Done -->|Back| End([End: SCR_05, leader elected at 3 votes])
```

### Flow 3: Lock the team roster (with error and recovery path)
- **Start:** `SCR_05` My Group Hub on the leader's phone
- **Goal:** submit a valid 4–5 member roster to the Academic Office
- **End:** `SCR_05` showing Locked and a confirmation code

```mermaid
graph TD
    Start([Start: SCR_05, leader view]) -->|Proceed to Lock Team| R{SCR_07 Validate: 4 to 5 members?}
    R -->|4 of 5| OK[SCR_07 Ready: Lock enabled]
    OK -->|Lock Team Roster| DD{Destructive dialog: Lock permanently?}
    DD -->|Cancel| OK
    DD -->|Yes, Lock Permanently| LK[SCR_07 Locking… overlay]
    LK --> Locked[SCR_07 Locked + code CM-AI04-7F3K]
    Locked -->|Back to My Group| End([End: SCR_05 Locked])

    R -->|3 of 5| ERR[SCR_07 Error: Can't lock yet, Lock disabled]
    ERR -->|Invite from Waiting Pool| INV[SCR_07 Invites sent]
    INV -->|a student accepts, SCR_09 notification| OK

    Late([Deadline passed, still no team]) --> DC[SCR_02 Registration closed]
    DC -->|View Matching Status| RP[SCR_08 Random Pool Status]
    RP -->|Refresh| RP
    RP -->|placed in a team| End
```

---

## 3. Flow-to-Screen Mapping

| Flow | Start | Screens used | End | Alternative / error path |
|---|---|---|---|---|
| **1 · Join a team** | `SCR_02` | SCR_01, 02, 03, 04, 05, 09 | `SCR_05` | Wrong sign-in domain → retry. Empty search → Reset Filters. Team filled before confirming → "Team is full", back to a refreshed SCR_03. Join from an invite in SCR_09. |
| **2 · Vote leader** | `SCR_05` | SCR_05, 06 | `SCR_05` | Change Vote dialog. Load error → Try Again (vote not sent). |
| **3 · Lock roster** | `SCR_05` | SCR_05, 07, 09, 02, 08 | `SCR_05` | **Error:** fewer than 4 members, so Lock is disabled with the reason. **Recovery:** Invite from Waiting Pool; lock is enabled when someone accepts. After the deadline: SCR_02 → SCR_08 matching status. |
