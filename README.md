# CapstoneMatch (EXE Team Formation App)
**PRM323 — Lab 2: AI-Assisted UI/UX Design (Google Stitch → Figma)**

- **Team:** Tran Duy Dat (SE190622) · _add the other members' names and IDs_
- **Figma file (view access for anyone with the link):** https://www.figma.com/design/5lGWF5KCg40dbetHK1AtGu
- **Clickable prototype:** https://www.figma.com/proto/5lGWF5KCg40dbetHK1AtGu?page-id=1%3A6&starting-point-node-id=1%3A24789 (Flow 1; the flow menu switches between Flow 1, Flow 2, Flow 3 and Flow 3b)
- **Stitch project:** https://stitch.withgoogle.com/projects/3478201953325536957

---

## 1. Project Overview & One-Line Persona
- **Topic:** A mobile team formation and leadership locking application for FPT University Capstone students to form 4–5 member teams, elect leaders, and lock rosters prior to semester deadlines.
- **One-Line Persona:** Minh (20), an FPT Software Engineering senior juggling classes and part-time work, who urgently needs to find a compatible 4–5 member Capstone team with clear skill visibility and lock their roster before the strict deadline.
- **AI Tools Used:** 
  - **Google Stitch / Gemini 1.5 Pro:** Initial screen generation and iterative UI layout refinement.
  - **Antigravity AI (Claude/Gemini):** UX analysis, heuristic critique (Nielsen's 10 heuristics), accessibility audits, and Flutter handoff mapping.
  - **Claude Code (Anthropic, Claude Opus 5.5):** wrote the Figma plugin in `tools/figma-plugin/` that builds the six Figma pages from the tokens. Also measured contrast and touch targets in Figma, ran critique round 2, and brought the specs in line with the Figma file. Full disclosure in `ai/ai-design-log.md`.

---

## 2. Deliverables Navigation Map

| Deliverable | Location in Repository | Description |
|---|---|---|
| **Persona & Problem Statement** | [`ux/persona.md`](./ux/persona.md) | Primary persona, goals, pain points, one-sentence problem, measurable success metric. |
| **IA & User Flows** | [`ux/user-flow.md`](./ux/user-flow.md) | Screen inventory, hierarchical IA, 3 Mermaid diagrams (including error/recovery). |
| **Design Brief** | [`design/DESIGN.md`](./design/DESIGN.md) | Design tokens, color palette, typography scale, spacing rules, and component rules given to Stitch. |
| **Screen Specifications** | [`design/screen-spec.md`](./design/screen-spec.md) | Functional intent, displayed content, and flow association for all 9 screens. |
| **Design Decisions & A11y** | [`design/design-decisions.md`](./design/design-decisions.md) | Top 10 design decisions with rationale, plus completed WCAG 2.1 & responsive checklist. |
| **AI Design Log** | [`ai/ai-design-log.md`](./ai/ai-design-log.md) | Verbatim Stitch prompts, 3 named iterations, 5+ heuristic critique findings, decision matrix. |
| **Flutter Handoff** | [`handoff/flutter-handoff.md`](./handoff/flutter-handoff.md) | 6-item handoff specification per screen, Tokens-to-Flutter table, Components-to-Widgets table. |
| **Generated Assets** | `assets/stitch/` & `assets/figma/` | Exported raw generations from Stitch and exported final 360x800dp frames from Figma. |
| **Figma builder** | [`tools/figma-plugin/`](./tools/figma-plugin/README.md) | Plugin that creates the Variables, components, screens, wireframes, flows and prototype; run instructions inside. |
| **Stitch session script** | [`tools/stitch-session.md`](./tools/stitch-session.md) | The Stitch prompts for the three named iterations and the screenshot file names. |

### Figma file, page by page
| Page | Content |
|---|---|
| 01 User Flow | Flows 1–3 with alternative and error paths; every screen step links to its frame; flow → screen map |
| 02 Wireframe | Greyscale low-fidelity layout of SCR_01–SCR_09 |
| 03 Final UI | SCR_01–SCR_09 at 360 × 800 with every state variant next to its screen, plus a 412 dp width check |
| 04 Design System | Variables (Color · Light, Spacing, Radius, Size, Typography, Elevation), text styles, effect styles, contrast table |
| 05 Components | Button, Text Field, Card, Bottom Nav, App Bar, Dialog, Loading, Empty State, Error State (+ Badge, Banner, Chip, Progress, Tabs, Snackbar, Avatar, Icon Button, Icons), all Auto Layout with variants |
| 06 Prototype | Flow 1, Flow 2, Flow 3 and Flow 3b (error and recovery), each with a starting point; overlay dialogs; loading-to-result transitions; Back actions |
