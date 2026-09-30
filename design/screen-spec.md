# Screen Specifications (Functional Intent & Content Inventory)

This document specifies the purpose, displayed content, user actions, and flow association for all 9 screens of the **CapstoneMatch** mobile application.

---

### `SCR_01`: Sign In (FPT University SSO)
- **Primary Purpose:** Authenticate students using institutional credentials (@fpt.edu.vn) and initialize their role and semester registration status.
- **Displayed Content:** 
  - FPT CapstoneMatch logo and university branding.
  - Informational subtitle: *"Spring 2026 Capstone & Graduation Project Registration"*.
  - Google SSO authentication button (`Continue with Google @fpt.edu.vn`).
  - Institutional domain restriction note.
- **Associated Flows:** Entry point for all flows.
- **State Variants:** Default, Loading (OAuth redirect spinner), Error (Domain validation rejected toast).

---

### `SCR_02`: Dashboard / Home
- **Primary Purpose:** High-level summary of registration deadlines, team formation status, and rapid discovery access.
- **Displayed Content:**
  - Dynamic deadline countdown banner (*"⏳ 2 Days 14 Hours Left"*).
  - Current team status card: Shows "Not in a Team" or "Team AI-04 (3/5 Members - In Progress)".
  - Quick action CTA: *"Browse Available Teams"* or *"Manage My Team"*.
  - Recent announcements and registration rules checklist.
- **Associated Flows:** Start point for Flow 1 (Discover & Join).

---

### `SCR_03`: Browse Groups
- **Primary Purpose:** Discover and filter active Capstone groups seeking members.
- **Displayed Content:**
  - Search bar (Filter by Group Name, Topic keyword, or Tech Stack).
  - Horizontal filter chips: *"Open Slots Only"*, *"AI/ML"*, *"Mobile App"*, *"Web/Cloud"*.
  - Scrollable feed of Group Cards.
  - Each card shows: Team Name, Capacity badge (e.g., "3/5"), filled vs unfilled avatar slots, technology tags, and "View Details" button.
- **Associated Flows:** Flow 1 (Discover & Join).
- **State Variants:** Populated, Empty state (No teams match search query), Loading (Skeleton cards).

---

### `SCR_04`: Group Detail
- **Primary Purpose:** Deep inspection of a specific group's members, desired skill gaps, and submission of join request.
- **Displayed Content:**
  - Team title, target topic domain (e.g., "AI Healthcare Diagnostic Assistant").
  - Member breakdown (4–5 slots): Name, Avatar, Skills, GitHub/Portfolio link.
  - Empty slot placeholders displaying *"Looking for: Backend / DevOps"*.
  - Fixed bottom bar with primary CTA: *"Request to Join Team"*.
- **Associated Flows:** Flow 1 (Discover & Join).

---

### `SCR_05`: My Group Hub
- **Primary Purpose:** Core team workspace to monitor roster progress, elect leadership, and lock the team.
- **Displayed Content:**
  - Team status badge: `In Formation (3/5)`, `Ready to Lock (4/5)`, or `Locked`.
  - Leader assignment alert: *"Leader not elected yet. Vote now to unlock group locking."*
  - Team roster list with Leader crown icon and member contact info.
  - Secondary action: *"Leave Group"*.
  - Primary bottom CTA: *"Vote for Leader"* (if not elected) or *"Proceed to Lock Team"* (if Leader).
- **Associated Flows:** Flow 1 (End), Flow 2 (Start/End), Flow 3 (Start/End).

---

### `SCR_06`: Leader Voting
- **Primary Purpose:** Democratic, transparent election of the Team Leader.
- **Displayed Content:**
  - Screen title: *"Elect Team Leader"*.
  - Explanatory subtitle: *"The elected leader is granted the sole authority to lock the team roster."*
  - Selectable candidate cards with avatar, name, and vote tally count.
  - Primary CTA button: *"Submit My Vote"* (turns into *"Change Vote"* if already submitted).
- **Associated Flows:** Flow 2 (Team Leader Voting).

---

### `SCR_07`: Group Lock Review & Error Recovery
- **Primary Purpose:** Validation checklist before permanent group locking, with error recovery if under 4 members.
- **Displayed Content:**
  - Final roster checklist (Avatar, Name, Student ID, Role).
  - **Happy State (4–5 members):** Green validation checkmark *"Team fulfills FPT Capstone 4–5 member regulation"*. Active button: *"Lock Team Roster"*.
  - **Error State (< 4 members):** Red error banner *"Ineligible: Only 3/5 members present"*. Disabled lock button.
  - **Recovery Action:** Secondary card *"Invite from Waiting Pool"* or *"Open Team to Public"*.
- **Associated Flows:** Flow 3 (Group Roster Lock with Error & Recovery).

---

### `SCR_08`: Random Pool Status
- **Primary Purpose:** Reassure unassigned students after deadline that automatic matching algorithm is processing them.
- **Displayed Content:**
  - Status banner: *"Registration Closed — Algorithm Running"*.
  - Student matching queue ID, selected preferences (Backend/Mobile).
  - Estimated notification timestamp and admin support contact.
- **Associated Flows:** Post-deadline edge case.

---

### `SCR_09`: Notifications & Invites
- **Primary Purpose:** Transactional alerts regarding group invitations, leader election results, and lock confirmations.
- **Displayed Content:**
  - Filter tabs: *"All"*, *"Invites"*, *"System"*.
  - Notification items with time, icon, and direct deep-link actions (*"Accept"*, *"Decline"*, *"View Group"*).
- **Associated Flows:** Cross-flow feedback.
- **State Variants:** Populated, Empty state (*"No new notifications"*).
