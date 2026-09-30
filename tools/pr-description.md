Title: Full Figma file (6 pages), critique round 2, corrected specs and PNG exports

## Summary
- **Figma builder** (`tools/figma-plugin/`) now creates all six pages: 01 User Flow, 02 Wireframe, 03 Final UI (SCR_01–SCR_09, 44 states + 412 dp check), 04 Design System, 05 Components, 06 Prototype (Flows 1, 2, 3 and 3b with starting points, overlays, loading-to-result timeouts and Back).
- **Figma file:** https://www.figma.com/design/5lGWF5KCg40dbetHK1AtGu (anyone with the link can view). It has two named versions: "Before critique round 2" and "Critique round 2 applied".
- **Critique round 2** (Claude, on the Figma UI): 7 findings. 3 accepted, 3 modified and 1 rejected, each with a reason in `ai/ai-design-log.md` §7–8. The changes are applied in Figma.
- **Docs aligned with Figma:**
  - `user-flow.md`: every screen now belongs to a flow.
  - `DESIGN.md` §4: corrected palette with measured contrast.
  - `design-decisions.md`: 10 decisions and a checklist measured in Figma.
  - `screen-spec.md` and `flutter-handoff.md`: all states, component and variant names, tokens → Flutter, ≥ 600 dp layouts.
- **`assets/figma/`:** PNGs of all 44 final frames at 360 × 800.

## Still to do by the team
- [ ] Run the Stitch prompts in `tools/stitch-session.md` and add the before/after screenshots to `assets/stitch/`. Then fill in the table in `ai/ai-design-log.md` §6.
- [ ] Add the other members' names and student IDs to `README.md`.
- [ ] Earlier iteration entries in `ai-design-log.md` §3 (SCR_03, SCR_07, SCR_06) have no screenshots yet. Add before/after images, or replace them with the §6 session.

## Test plan
- [x] Plugin run end to end in Figma web on a fresh file: 0 warnings for all 6 steps.
- [x] Flow 1 clicked through with the mouse in presentation mode (overlay dialog, 1.5 s loading → My Group).
- [x] Automated check on the 52 frames of page 03: 269 interactive instances, all ≥ 48 dp; only 12 sp timestamps below 14 sp; every badge has text.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
