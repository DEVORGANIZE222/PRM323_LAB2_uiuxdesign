# Information Architecture & User Flows

## 1. Information Architecture (Screen Inventory & Hierarchy)

### Hierarchy Overview
- **Top-Level Screens (Persistent Bottom Navigation):**
  - `SCR_02` Dashboard / Home
  - `SCR_03` Browse Groups
  - `SCR_05` My Group Hub
  - `SCR_09` Notifications
- **Auth / Onboarding:**
  - `SCR_01` Sign In (FPT SSO)
- **Nested / Modal Screens:**
  - `SCR_04` Group Detail (Nested under `SCR_03` Browse Groups)
  - `SCR_06` Leader Voting (Nested under `SCR_05` My Group Hub)
  - `SCR_07` Group Lock Review & Error Recovery (Nested under `SCR_05` My Group Hub)
  - `SCR_08` Random Pool Status (Accessed from `SCR_02` Dashboard if unassigned post-deadline)

```
[SCR_01: Sign In]
       │
       ▼
┌────────────────────────────────────────────────────────┐
│               Main App (Bottom Navigation)             │
├──────────────┬──────────────┬──────────────┬───────────┤
│    SCR_02    │    SCR_03    │    SCR_05    │   SCR_09  │
│  Dashboard   │ Browse Groups│ My Group Hub │  Notifs   │
└──────┬───────┴──────┬───────┴──────┬───────┴───────────┘
       │              │              │
       ▼              ▼              ├─► [SCR_06: Leader Voting]
 [SCR_08: Random] [SCR_04: Detail]   └─► [SCR_07: Lock Review & Recovery]
```

---

## 2. User Flows (Mermaid Diagrams)

### Flow 1: Discover & Join an Open Capstone Group
- **Start:** `SCR_02` (Dashboard)
- **Goal:** Student successfully finds and joins a compatible team with open slots (4–5 quota).
- **End:** Group roster updated in `SCR_05` (My Group Hub) or redirected back to browse.

```mermaid
graph TD
    Start([Start: SCR_02 Dashboard]) --> TapBrowse[Tap 'Browse Groups' in Bottom Nav]
    TapBrowse --> SCR_03[SCR_03: Browse Groups List]
    SCR_03 --> Filter[Apply Filter: 'Open Slots Only' + Tag 'AI/Python']
    Filter --> SelectGroup[Select a Team Card]
    SelectGroup --> SCR_04[SCR_04: Group Detail Screen]
    SCR_04 --> ReviewMembers{Review Member Skills & Roster}
    ReviewMembers -->|Compatible| TapJoin[Tap 'Request to Join Group']
    ReviewMembers -->|Not a fit| SCR_03
    
    TapJoin --> CheckSlots{Check Real-Time Capacity}
    CheckSlots -->|Capacity < 5: Happy Path| ShowConfirm[Show Confirmation Modal]
    ShowConfirm --> ConfirmTap[User Taps 'Confirm Join']
    ConfirmTap --> Loading[Show Spinner Overlay]
    Loading --> JoinedSuccess[Toast: 'Successfully joined Team AI-04!']
    JoinedSuccess --> SCR_05([End: SCR_05 My Group Hub])

    CheckSlots -->|Slot Taken / 5/5: Alternative Path| ErrorFull[Toast: 'Team just filled up! 5/5 members.']
    ErrorFull --> RefreshList[Refresh Group Availability]
    RefreshList --> SCR_03
```

---

### Flow 2: Team Leader Voting
- **Start:** `SCR_05` (My Group Hub)
- **Goal:** Democratic election of a Team Leader so that administrative actions (Locking) can be enabled.
- **End:** Leader designated with badge in `SCR_05`.

```mermaid
graph TD
    Start([Start: SCR_05 My Group Hub]) --> CheckLeader{Is Leader Elected?}
    CheckLeader -->|No / Voting Open: Happy Path| TapVote[Tap 'Vote for Leader' Banner Button]
    TapVote --> SCR_06[SCR_06: Leader Voting Screen]
    SCR_06 --> SelectCandidate[Select Radio Option on Member Card]
    SelectCandidate --> SubmitVote[Tap 'Submit My Vote']
    SubmitVote --> Loading[Loading Indicator]
    Loading --> UpdatedResults[Show Tally & Success Dialog]
    UpdatedResults --> CheckMajority{Candidate >= 3 Votes?}
    CheckMajority -->|Yes| ElectLeader[Elected: Minh is Team Leader]
    CheckMajority -->|No| PendingVotes[Status: 2/4 Votes Cast]
    ElectLeader --> SCR_05([End: SCR_05 My Group Hub with Leader Badge])
    PendingVotes --> SCR_05

    CheckLeader -->|Already Voted: Alternative Path| TapChangeVote[Tap 'Change Vote' Link]
    TapChangeVote --> SCR_06
    SCR_06 --> PickNew[Select Different Member]
    PickNew --> ConfirmOverride[Dialog: 'Overwrite previous vote?']
    ConfirmOverride --> SubmitVote
```

---

### Flow 3: Group Roster Lock (With Error & Recovery Path)
- **Start:** `SCR_05` (My Group Hub, as elected Leader)
- **Goal:** Lock the team roster to officially submit team composition to university academic registrar.
- **End:** Group status is permanently LOCKED, or team unlocked with public recruiting enabled.

```mermaid
graph TD
    Start([Start: SCR_05 My Group Hub - Leader Role]) --> TapLock[Tap 'Proceed to Lock Team']
    TapLock --> SCR_07[SCR_07: Group Lock Review Screen]
    SCR_07 --> CheckValidation{Validate Member Count: 4 to 5 Members?}

    %% Happy Path
    CheckValidation -->|Valid: 4 or 5 Members| EnableButton[Primary Button: 'Lock Team Roster' Active]
    EnableButton --> TapConfirmLock[Tap 'Lock Team Roster']
    TapConfirmLock --> DestructiveModal[Show Destructive Action Dialog: 'Cannot undo once locked!']
    DestructiveModal --> ConfirmYes[Tap 'Yes, Lock Permanently']
    ConfirmYes --> LoadingResult[Loading to Success Transition]
    LoadingResult --> SuccessState[Show Locked Badge & Confirmation Code]
    SuccessState --> SCR_05([End: Team Status is LOCKED])

    %% Error and Recovery Path
    CheckValidation -->|Invalid: 3 or fewer members| ErrorPath[Show Error Banner: 'Team has only 3/5 members!']
    ErrorPath --> DisableButton[Button 'Lock Team Roster' Disabled]
    DisableButton --> SuggestRecovery[Display Recovery Card: 'Min. 4 required by Capstone regulation']
    SuggestRecovery --> TapRecovery[Tap 'Open Group to Public / Invite from Pool']
    TapRecovery --> BroadcastRecruitment[System broadcasts open slot to Random Pool]
    BroadcastRecruitment --> WaitCandidate[Peer student accepts invitation]
    WaitCandidate --> UpdateCount[Member Count updates to 4/5]
    UpdateCount --> EnableButton
```

---

## 3. Flow-to-Screen Mapping Table

| Flow Name | Start Screen | Intermediary Screens | End Screen | Error / Alternative Paths |
|---|---|---|---|---|
| **Flow 1: Join Group** | `SCR_02` Dashboard | `SCR_03` Browse Groups, `SCR_04` Group Detail | `SCR_05` My Group Hub | Alternative: Group reaches 5/5 slots before confirmation; toasts error and returns to `SCR_03`. |
| **Flow 2: Vote Leader** | `SCR_05` My Group Hub | `SCR_06` Leader Voting | `SCR_05` My Group Hub | Alternative: Member wants to revise vote prior to voting cutoff; uses "Change Vote" dialog. |
| **Flow 3: Lock Group** | `SCR_05` My Group Hub | `SCR_07` Lock Review | `SCR_05` My Group Hub | **Error Path:** Team has < 4 members. "Lock" is disabled with error explanation; **Recovery:** Action button triggers public recruitment to fill the 4th slot. |
