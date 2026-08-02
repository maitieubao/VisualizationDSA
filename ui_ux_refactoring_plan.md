# VisualizationDSA — UI/UX Refactoring Plan

> **Source of truth:** `design-system/visualizationdsa/MASTER.md` (Quizlet-dark, token-driven, glass+glow+spring).
> **Hard contract:** Every refactor consumes `var(--*)` tokens — zero hardcoded Tailwind colors. Tailwind utilities are for layout/spacing/radius/transition only.
> **A confirmed finding from the initial scan:** across `views/`, `features/`, `components/`, and `shared/`, **zero files use raw Tailwind color utilities**. The token law is already respected. So this overhaul is *compositional polish* — spacing/rhythm/hierarchy/depth/interaction feedback — not a color-law remediation. That keeps per-file scope small.
> **Date:** 2026-07-30 · **Stack:** Vue 3 + Tailwind v4 · **Icon system:** custom `SvgIcon.vue` + `components/icons/` (no Lucide/Heroicons — we extend what you have, MASTER.md is overridden on this point).

---

## How each task will be executed

Per component, the 4-step routine documented in `MASTER.md`:

1. **Contextual analysis** — identify module, pull the matching module-bias row from MASTER.md (recipe + accent discipline).
2. **Plastic eradication** — call out specific cheap-looking elements in the current markup (cramped spacing, flat borders, Tailwind light-tuned `shadow-*`, raw `ease-out`, placeholder-as-label, missing focus rings, emoji-as-icon, unused `.spring-hover`/`.glass-panel`, weak hierarchy, default-looking typography weights).
3. **Premium refactor of `<template>` only** — token-compliant Tailwind v4 markup, reusable cinematic classes where natural, accessible focus + `aria-label`, responsive at 375/768/1024/1440.
4. **Delivery** — full `.vue` returned with `<script setup>` and reactive logic untouched, plus a short "what changed & why" callout map so you can grep the diff.

**Verification per phase:** before sign-off I'll run the visualizer view and screenshot mocked states for the items in that phase when a browser session is feasible. Where a component depends on heavy runtime state (e.g., a canvas player), I refactor only the chrome/controls, never the canvas rendering math.

---

## Surface scanned

- **`src/views/`** — 38 route shells, sizes ranging from 19-line stubs that route into a `features/*/components/*Workspace.vue` up to mega-shells at 2212 lines (`TeacherPanelView`), 2198 (`AdminPanelView`), 951 (`LessonStudyView`), 940 (`ProfileView`).
- **`src/features/**/components/`** — ~150 feature components, the real visualizer/quiz/(etc.) work happens here.
- **`src/App.vue`** — 1101 lines. Houses the entire app shell: header, terminal-dots logo, nav, scroll-area. The single highest-leverage foundation piece.
- **`src/router/routes.ts`** — full route tiering confirmed (Landing → authed learner → teacher/admin → sandboxes → gamification/auth).
- **`src/components/`** — `ConceptScenarioPicker.vue`, `SkeletonCard.vue`, `SkeletonLoader.vue`, `ToastContainer.vue`, `VcrControls.vue`, `VcrExplanationBanner.vue`, `icons/SvgIcon.vue`, `common/HeartDisplay.vue`.
- **`src/shared/components/`** — `BaseIcon`, `TheoryAccordionItem`, `TheoryCollapsiblePanel`, `TheorySummaryView`.
- **Violations surface:** 0 raw-color files. The work is composition, not cleanup.

---

## Phase Sequence

### Phase 1 — Global Shell & Foundational Components  *(foundation; do first)*

Why first: every subsequent view inherits chrome from these. Fixing spacing/depth/interaction discipline here sets the reference every feature component mirrors. Highest leverage, lowest risk.

| # | File | Type | Why it's here | Indicative scope |
|---|---|---|---|---|
| 1.1 | `src/App.vue` | App shell (1101 lines) | The header, terminal-dots logo, nav state, scrollbar pinning — the visual frame for *every* route | Refactor header/nav markup + `.app-header` chrome in `<style>`; split the sidebar/nav into a new `AppSidebar.vue` / `AppHeader.vue` inside `components/` if it reduces noise (only if you authorize the file additions) | large |
| 1.2 | `src/components/icons/SvgIcon.vue` | Icon renderer | The shared icon surface. Confirm sizing/stroke semantics so PR-wide icon usage is consistent | small |
| 1.3 | `src/shared/components/BaseIcon.vue` | Icon wrapper | Same role as SvgIcon — confirm they're not duplicating effort; consolidate to one entry point if beneficial | small |
| 1.4 | `src/components/ConceptScenarioPicker.vue` | Picker pattern | Re-used across visualization views; codifies the selector pattern other views copy | medium |
| 1.5 | `src/components/SkeletonCard.vue` + `SkeletonLoader.vue` | Loading states | Empty-state polish determines perceived perf; ride `stagger-enter` for list skeletons | small |
| 1.6 | `src/components/ToastContainer.vue` + `VcrControls.vue` + `VcrExplanationBanner.vue` | Floating overlays | Define overlay/glass-panel recipe used by all popovers/modals | medium |
| 1.7 | `src/components/common/HeartDisplay.vue` | Gamification staple (hearts/lives) | Authenticated chrome seen on every screen | small |
| 1.8 | `src/shared/components/TheoryAccordionItem.vue` + `TheoryCollapsiblePanel.vue` + `TheorySummaryView.vue` | Page-level content patterns | Reused in lesson/cheatsheet paths — defines the "academic content" look | medium |

**Phase 1 exit criteria:** every page's chrome is premium, the icon/overlay/skeleton patterns are codified, and refactors downstream simply *reference* the recipes.

---

### Phase 2 — Core User Views  *(Landing, Dashboard, Profile, Learning, Classrooms, Courses)*

The authenticated learner journey — what users see 90% of the time.

| # | File | Module | Bias | Scope |
|---|---|---|---|---|
| 2.1 | `src/views/LandingView.vue` | Public landing | Hero `.vcr-frame-enter`, single gold CTA, glass sections, staggered feature cards | medium (313 lines) |
| 2.2 | `src/views/DashboardView.vue` | Learner dashboard | Standard rhythm; progress with indigo baseline + gold current-milestone dots | medium (532 lines) |
| 2.3 | `src/views/ProfileView.vue` | Learner profile | Calm single-column, dedicated XP/radar surfaces coming from `features/user-progress/components/SkillRadarChart.vue` | large (940 lines) |
| 2.4 | `src/views/CoursesListView.vue` + `CourseDetailView.vue` | Learning path | Course cards with `.spring-hover`; path visualization gold milestone accents | medium |
| 2.5 | `src/views/LessonStudyView.vue` | Lesson study | Distraction-free editor-block; pair with `shared/components/Theory*` patterns; quiet chrome | large (951 lines) |
| 2.6 | `src/views/LessonDiscussionPanel.vue` | Lesson discussion | Chat-style threaded panel; tight rows, restrained accents | medium |
| 2.7 | `src/views/ClassroomDashboard.vue` + `ClassroomDetailView.vue` | Classrooms | Teacher-as-cohort dashboard; data grid emphasis | medium |
| 2.8 | `src/views/NotFoundView.vue` | 404 | Single centered hero, terminal motif — small delight moment | small (339 lines) |

**Phase 2 exit criteria:** the learner journey Landing → Dashboard → Course → Lesson reads as one continuous, premium product; module-bias accents are consistent.

---

### Phase 3 — Gamification, Rewards & Engagement

The only phase where purple is allowed and gold glows freely — celebration moments get all the depth budget.

| # | File | Module | Bias | Scope |
|---|---|---|---|---|
| 3.1 | `src/views/GemsShopView.vue` | Gems shop | Featured reward cards: `.spring-hover` + `--glow-gold`, single gold CTA per pack | medium (242 lines) |
| 3.2 | `src/views/GamificationEngineView.vue` + `features/gamification-engine/components/GamificationWorkspace.vue` | Engine surface | Restrained indigo shell; featured/earning surfaces use gold+purple glows | medium |
| 3.3 | `features/gamification-engine/components/BadgesCabinet.vue` | Badges | Cabinet grid; each badge card can use `--glow-purple` for earned state | medium |
| 3.4 | `features/gamification-engine/components/StreakFire.vue` + `WeeklyLeaderboard.vue` | Streak & leaderboard | Streak flame accent + leaderboard rank pills (gold/silver/bronze via alpha-dim themes) | medium |
| 3.5 | `features/gamification/components/XPProgressSection.vue` + `EarnedBadgesSection.vue` + `GamificationPanel.vue` | Old in-line gamification | Consolidate visual language with the engine components above; same purple/gold discipline | medium |
| 3.6 | `features/gamification/components/OutOfHeartsModal.vue` + `SessionResumePrompt.vue` | Modals | Use shipped `vcr-banner-fade-*` transition; glass overlay + amber "Continue" CTA | small |
| 3.7 | `features/gamification-engine/components/CanvasConfettiOverlay.vue` | Celebration overlay | Confetti composition only — leave physics alone, polished the trigger affordances | small |

**Phase 3 exit criteria:** the gamification module sings without leaking purple/gold carnival into the rest of the app.

---

### Phase 4 — Complex DSA Visualizers  *(the heart of the product)*

These are where the visualization canvas lives. **Refactor chrome only** — canvas rendering math, layout engines, and stepping state stay untouched. Each vis module keeps cyan strictly inside the canvas; controls are indigo, with one gold primary action per view when applicable.

| # | Module | Primary files (in `features/<module>/components/`) | Co-pulled view | Bias / scope |
|---|---|---|---|---|
| 4.1 | Sorting | `SortingAlgorithmControls.vue`, `SortingDetailPanel.vue`, `SortingHudOverlay.vue`, `SortingProgressBar.vue`, `ArrayBarVisualizer.vue` + the per-sort visualizers (`Bubble/Quick/Merge/Heap/Radix/Bucket/Counting`) | `views/SortingView.vue` | `.glass-panel--light` canvas, indigo control rail, single gold primary action ("Run"/"Step") | large |
| 4.2 | Graph | `GraphPlayground.vue`, `GraphPlaygroundHud.vue`, `EdgeBuilderForm.vue`, `AlgorithmCanvas.vue` | `views/GraphView.vue` | Compact `--space-3` hud, cyan only on canvas | large |
| 4.3 | OOP | `OOPConceptsVisualizerWorkspace.vue`, `UMLClassCard.vue`, `AccessModifierPadlock.vue` | `views/OOPVisualizationView.vue` | Card grid with `.spring-hover` UML cards, access-modifier chips via accent discipline | medium |
| 4.4 | SOLID | `SOLIDVisualizerWorkspace.vue`, `SOLIDVcrFrameVisualizer.vue`, the lesson panels (`SRP/OCP/LSP/ISP/DIP`), `ThermalClassCard.vue`, `NeonFlowingPath.vue`, `LaserFractureOverlay.vue` | `views/SOLIDVisualizationView.vue` | VCR-frame motif; restrained chrome, neon path is the canvas (cyan-allowed) | large |
| 4.5 | System Design | `SystemDesignWorkspace.vue`, `SystemNodeCard.vue`, `NetworkLinkSVG.vue`, `ReplicationLagPanel.vue`, `NeonPacketDot.vue`, `FailureSmokeOverlay.vue` | `views/SystemDesignVizView.vue` | Larger-node card grid, row of stat panels, indigo primary controls | large |
| 4.6 | DI / Sandbox | `di-sandbox/components/*` (`DISandbox`, `DIResolutionDemo`, `DIDependencyGraph`, `DIServiceList`) | `views/DIView.vue` | Dependency graph + service list rail | medium |
| 4.7 | Patterns | `design-patterns/components/DesignPatternsCanvas.vue`, `DesignPatternsWorkspace.vue` | `views/PatternsView.vue` | Pattern picker → canvas rhythm reusing Phase 1's `ConceptScenarioPicker` | medium |
| 4.8 | DSA Modules (catalog/player) | `dsa-modules/components/DSAHeader`, `DSAPlayer`, `AlgorithmDashboard`, `AlgorithmVisualizer`, `DSAInputForm`, `LanguageBadge`, `LanguageSelectorModal`, `PseudocodeViewer` | `views/DSAModulesView.vue` | Catalog of algorithms — cards inherit Phase 1's recipe; language badges via chip recipe | large |
| 4.9 | Interactive Playground | `interactive-playground/components/*` (`InteractivePlayground`, `FloatingToolbar`, `PlaygroundCanvas`, `PlaygroundJsonPanel`, `PlaygroundStatusBar`, `PlaygroundToast`) | `views/PlaygroundView.vue` | Floating glass toolbar + canvas + JSON rail | medium |
| 4.10 | Animation Engine / VCR player | `animation-engine/components/*` and `vcr-player/components/*` (`VisualizationPlayer`, `AnimationVcrControls`, `VcrButtonsRow`, `AnimControlPanel`, `AnimPseudoCodePanel`, `AnimTimelineSlider`, `Anim*Progress*`, `VcrArrayInput`, `VcrControlPanel`) | `views/AnimationView.vue` | VCR controls — the cinematic DNA of the product; polish existing VCR classes | medium |
| 4.11 | Code-to-Visualization | `code-to-visualization/components/*` (`CodeWorkspace`, `MonacoEditorPanel`, `CompilerConsole`, `ArrayInputBar`) | `views/CodeIDEView.vue` and `views/CompareView.vue` | Monaco editor splitter + compiler console readout | medium |
| 4.12 | Custom Input | `custom-input/components/CustomInputForm.vue` + `algorithm-sandbox/components/CustomInputPanel.vue` + `vcr-player/components/VcrArrayInput.vue` | — | Three sibling input components — consolidate consistent input chip patterns | small |
| 4.13 | Pseudocode sync | `pseudocode-sync/components/*` (`MultilingualCodePanel`, `VariableWatchPanel`) | — | Code panel + watch panel; terminal-block tokens | medium |
| 4.14 | Code Editor (Monaco hosting) | `code-editor/components/*` (`CodeEditor`, `PseudocodePanel`, `PseudocodeViewer`, `VariablesHud`, `CodeEditorApiHints`, `CodeEditorPresetTabs`) | — | Editor hosting chrome | medium |

---

### Phase 5 — Knowledge & Assessment Surfaces

Supporting but high-traffic — quiz, cheatsheet, AI assistant, e-lecture, embedded widget, export/share.

| # | Module | Primary files | Co-pulled view | Bias / scope |
|---|---|---|---|---|
| 5.1 | Quiz (smart) | `smart-quiz/components/*` (`SmartQuizWorkspace`, `QuizSessionDashboard`, `InteractiveQuizOverlay`, `ExplanationHSLCard`, `SVGQuizCanvas`) | `views/BackendQuizView.vue` | Quiz card overlay; correct/wrong green/red chip discipline | large |
| 5.2 | Quiz (legacy + lecture) | `quiz/components/*` (`ExcelQuizImporter`, `InteractiveLectureSlides`, `InteractiveQuizSection`, `LectureSlidesSection`) + `quiz-system/components/*` (`BackendQuizWorkspace`, `QuizCardOverlay`, `QuizOptionsList`, `QuizSummary*`) | — | Consolidate with 5.1 visual language; legacy kept consistent | large |
| 5.3 | Cheat Sheet | …view only | `views/CheatSheetView.vue` (182 lines) | Theory accordion pattern → inherits from Phase 1 `TheoryAccordionItem` | small |
| 5.4 | E-Lecture | `e-lecture/components/LectureNavigation.vue`, `LectureOverlay.vue`, `NotificationBell.vue` | lesson views | Side rail `LectureNavigation` + overlay `LectureOverlay` | medium |
| 5.5 | Embed Widget | `embed-widget/components/*` (`EmbedWidgetWorkspace`, `EmbedConfiguratorSidebar`, `LiveWidgetPreview`, `EmbedCodeSnippet`) | `views/EmbedWidgetView.vue` | Sidebar + preview + code snippet; conservative chrome | medium |
| 5.6 | Export/Share | `export-share/components/*` (`ExportShareWorkspace`, `ExportFormatSelector`, `ExportProgressBar`, `QRCodeDisplay`, `ShareExportModal`) | `views/ExportShareView.vue` | Export modal alone uses overlay/glass stack from Phase 1 | medium |
| 5.7 | AI Assistant | …view only (+ dependent components) | `views/AIAssistantView.vue` (210 lines) | Chat surface; indigo primary send, glass messages | medium |
| 5.8 | Auth | `auth/components/LoginModal.vue` | login flow | Centered `max-w-md` glass panel; single gold submit; quiet & trustworthy | small |
| 5.9 | Payment / Premium | `payment/components/*` (`PremiumMarketingCard`, `PremiumGate`, `CheckoutIdleScreen`, `CheckoutSuccessScreen`, `QrPaymentPanel`) | `views/PremiumCheckoutView.vue` | Premium = single gold moment; QR/QR-code surfaces quiet | medium |
| 5.10 | Guided Tour | `guided-tour/components/*` (`GuidedTourOverlay`, `HelpButton`, `VirtualMascot`, `VirtualPointer`) | app-wide overlay | Coach-mark glass + mascot | small |

---

### Phase 6 — Admin & Teacher Tooling  *(dense, data-first; do last)*

Dense grids and authoring surfaces — least user-facing polish value but highest density sneeze potential. Phase 1 recipes set the table; here they get applied to tall shells.

| # | File | Bias | Scope |
|---|---|---|---|
| 6.1 | `views/TeacherPanelView.vue` (2212 lines) | Dense data grid, quiet surfaces, indigo-only actions; one gold CTA (Publish) | very large — likely refactored in sections, never in one pass |
| 6.2 | `views/AdminPanelView.vue` (2198 lines) | Same discipline + admin-only red destructive accents | very large — same sectioned approach |
| 6.3 | `views/TeacherStudioView.vue` + `TeacherStudioRoadmapEditor.vue` (408 lines) | Authoring canvas; distraction-free; quiet chrome | medium |
| 6.4 | `views/CheatSheetView.vue` (if not finished in 5.3) | Theory accordion | small |

> **Note on the very long shells (`TeacherPanelView`, `AdminPanelView`):** I'll refactor *Section by Section* and not attempt a full rewrite in one delivery. After each section I'll pause for your review.

---

## Suggested execution order **within** each phase

For most phases, the natural order is *top-down by user attention*: (a) the route view shell first, (b) its primary workspace/dashboard component, (c) any control rail, (d) overlay/modal sub-components.

Phase 4 specifically I recommend in this order because of dependency chains:
1. **Custom Input + Pseudocode sync + Code Editor chrome** (Phase 4.12–4.14) — sub-controls reused by every visualizer. Polish these first so the visualizers can drop them in unchanged.
2. **Animation Engine / VCR player** (4.10) — the cinematic DNA shared by all *VcrFrame* visualizers (SOLID especially).
3. The visualizer workspaces in order of rough user traffic: **4.1 Sorting → 4.8 DSA Modules catalog → 4.2 Graph → 4.3 OOP → 4.4 SOLID → 4.5 System Design → 4.6 DI → 4.7 Patterns → 4.9 Playground → 4.11 Code-to-Visualization**.

---

## What I will NOT do (so you know the guardrails)

- **No hardcoded colors** — every refactor routes through `var(--*)`. The token law is honored; alternate themes (`cyberpunk`, future `light`) keep working.
- **No `<script setup>` changes** — reactive logic, props, emits, watchers, stores untouched.
- **No icon library swap** — we extend your `SvgIcon` system rather than pulling in Lucide/Heroicons mid-overhaul. (MASTER.md's icon-lib recommendation is overridden here.)
- **No canvas-rendering / vis-engine edits** in Phase 4 — I refactor chrome, controls, panels, HUDs; the underlying algorithm stepping, layout math, and SVG/canvas drawing stay intact.
- **No route table edits**.
- **No new dependencies** unless you explicitly approve one.
- **No deletions** of `features/archived/**` — out of scope.

---

## Risks & how they're mitigated

| Risk | Mitigation |
|---|---|
| `App.vue` at 1101 lines is brittle to a big single edit | Phase 1.1 done carefully, optionally splitting sidebar into `AppSidebar.vue` *only* if you authorize the new file. Else, refactor inline. |
| `TeacherPanelView` / `AdminPanelView` (~2200 lines each) | Sectioned refactor across multiple sessions with pauses for your review — never in one delivery. |
| Phase 4 visualizers carry runtime state (`yjs`, `@microsoft/signalr`, `canvas-confetti`, `mermaid`, `chart.js`) | Each refactor scopes to chrome/control panels; verifiable via screenshot, never altering state machines. |
| Tailwind v4 strict-mode + PostCSS pipeline quirks | All refactors verified by running the existing Vite dev server / build at phase sign-off when feasible. |
| A "small" component turns out tighter; a "large" one turns out mostly wrapper | Each task begins with the 4-step audit; scope adjustments surfaced to you before refactor. |

---

## Ready to start

Once you approve this plan (or approve-with-edits), I'll proceed Phase-by-Phase. After **every** task I'll pause for your sign-off so the look stays locked to your taste, not mine.
