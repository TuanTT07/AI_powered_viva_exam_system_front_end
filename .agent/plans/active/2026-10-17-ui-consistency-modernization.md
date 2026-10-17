# UI Consistency & Modernization Plan

## 1. Goal
Improve the overall UI consistency and aesthetics across the AIVES frontend to make it modern, clean, fresh/youthful, and easy to use, while strictly preserving all existing functional groups, APIs, role guards, state machines, and contracts.

## 2. Context
While recent feature screens (e.g. `QuestionBankView`, `StudentPortalView`, `CandidateListView`, `KnowledgeBaseView`, `UserManagementPage`) follow the modern AIVES prototype layout (slate canvas `#f8fafc`, pure white rounded-xl cards, royal blue `#2563eb` primary actions, Inter sans typography, and subtle borders), several key screens and shared stylesheets still inherit legacy or retro styling:
- Monospace uppercase headers and table headings (`font: .68rem var(--mono)`).
- Blocky 2px/4px border radii, sharp inputs, and flat divider strips (`border-block: 1px solid var(--border)`).
- Outdated styles in `exam-list.css`, `exam-editor.css`, `exam-scheduling.css`, `exam-question-config.css` (e.g. jarring dark black save bar), `exam-student-roster.css`, `exam-monitoring.css`, `ai-question-generation.css`, `course-materials.css`.
- Conflicting `:root` tokens and outdated button/input/dialog definitions in `src/index.css`.
- Missing smooth transitions, modern micro-interactions, pill badges, and elevated card hover states.

## 3. Scope
- **Design Tokens & Global Primitives**:
  - Unify `:root` tokens in `src/index.css` (cool slate background `#f8fafc`, clean white cards `#ffffff`, slate borders `#e2e8f0`, ink `#0f172a`, primary blue `#2563eb`, primary hover `#1d4ed8`, soft surfaces `#eff6ff`, danger `#ef4444`, warning `#f59e0b`, success `#10b981`, AI accent `#6366f1`).
  - Upgrade primitive components in `src/components/ui/primitives.tsx` (`Button`, `Input`, `Badge`, `Alert`, `Dialog`, `Progress`, `Skeleton`, `Spinner`) with modern rounded corners, subtle shadows, smooth transitions, focus rings, and accessible states.
  - Upgrade `src/components/common/states.tsx` (`EmptyState`, `ErrorState`, `LoadingPage`, `PermissionDenied`, `StatusBadge`).
- **Application Shell**:
  - Refine `src/app/layouts/layouts.css` and `layouts.tsx` with backdrop-filter glass header, modern role pill with status indicator, sleek navigation hover/active highlights, and polished mobile drawer.
- **Feature Screen Modernization**:
  - `src/features/exams/exam-list.css` & `exam-list-page.tsx`: Modernize summary KPI cards, filter controls, table layout, exam cards, and pagination.
  - `src/features/exams/exam-editor.css` & `exam-editor.tsx`: Modernize form sections, date/time inputs, error feedback, and action footer.
  - `src/features/exams/exam-scheduling.css` & `exam-scheduling-page.tsx`: Replace flat divider strips with modern KPI metric cards, clean slot table, and intuitive controls.
  - `src/features/exams/exam-question-config.css` & `exam-question-config-page.tsx`: Modernize summary cards, filters, question selection table, and turn the dark black `.eq-savebar` into a modern sticky floating glass bar with bright blue accents.
  - `src/features/exams/exam-student-roster.css` & `exam-student-roster-page.tsx`: Modernize dropzone (smooth dashed border, cloud icon, hover state), filters, and preview table.
  - `src/features/exams/exam-monitoring.css` & `exam-monitoring-page.tsx`: Modernize 6-status summary cards, real-time indicator, and table.
  - `src/features/ai-question-generation/ai-question-generation.css` & `ai-question-generation-page.tsx`: Modernize generation options, Bloom pill selectors, document picker cards, and generated question review cards.
  - `src/features/learning-materials/course-materials.css`: Modernize upload dropzone, status badges, and table.
  - `src/features/rubrics/rubric.css`: Polish global rubric list and editor to match course-scoped rubric views.
  - `src/features/subjects/lecturer-subjects.css`: Polish metric cards, course cards, and course overview layout.
- **Shared Compatibility Layer**:
  - Update `src/styles/source-feature-compat.css` and `src/styles/prototype.css` so that all screens inherit the modern aesthetic seamlessly.

## 4. Non-goals
- NO changes to endpoints, repositories, data sources, hooks, or API contracts.
- NO changes to feature workflows, permissions, role guards, or state machine transitions.
- NO removal of existing mock data or test coverage.
- NO new external dependencies.

## 5. Relevant Sources
- `AGENTS.md`
- `docs/design/DESIGN_SYSTEM.md`, `COMPONENTS.md`, `UI_RULES.md`, `STATES.md`
- Prototype references in `src/styles/prototype.css` and `src/components/common/source-page.tsx`
- Existing feature screens: `QuestionBankView.tsx`, `CandidateListView.tsx`, `KnowledgeBaseView.tsx`, `StudentPortalView.tsx`, `UserManagementPage.tsx`

## 6. Current Behavior
- Mix of modern Tailwind views and retro CSS views.
- Some screens look like legacy forms with dark black bars, flat 1px grid lines, sharp 2-4px corners, and harsh monospace fonts.
- Inconsistent spacing, badge styles, button elevations, and hover states.

## 7. Target Behavior
- Unified, fresh, clean, and youthful aesthetic across ALL screens.
- Modern rounded corners (rounded-xl 12px for cards/panels, rounded-lg 8px for controls, rounded-full for badges/pills).
- Consistent color palette: Slate canvas `#f8fafc`, pure white `#ffffff`, slate borders `#e2e8f0`, primary blue `#2563eb`, emerald success, amber warning, rose danger, indigo AI.
- Smooth interactive transitions (hover states, focus rings, active scales).
- 100% feature and test compatibility (all 54 test suites, 198 tests passing, 0 TypeScript errors).

## 8. Architecture Constraints
- Preserve component props and test selectors (`aria-label`, IDs, role attributes).
- Keep domain logic in `src/features/`, generic UI in `src/components/ui/`, layouts in `src/app/layouts/`.
- Do not add new NPM packages.

## 9. Milestones
- [x] **M1: Core Design System & Primitives Modernization**: Refactored `src/index.css`, `src/styles/prototype.css`, `src/components/ui/primitives.tsx`, and `src/components/common/states.tsx`.
- [x] **M2: App Shell & Navigation Polish**: Refactored `src/app/layouts/layouts.css` (header, sidebar, footer, responsive drawer).
- [x] **M3: Exam Module Styling Modernization**: Overhauled `exam-list.css`, `exam-editor.css`, `exam-scheduling.css`, `exam-question-config.css`, `exam-student-roster.css`, `exam-monitoring.css`, `exam-detail.css`.
- [x] **M4: AI Generation, Materials, Rubrics & Subjects Modernization**: Overhauled `ai-question-generation.css`, `course-materials.css`, `rubric.css`, `lecturer-subjects.css`, `grading-workspace.css`, `question-import.css`.
- [x] **M5: Testing, Validation & Verification**: Ran `typecheck`, `test`, and `build` — 100% pass (54/54 test files, 198/198 tests, 0 errors).

## 10. Risks & Mitigations
- CSS selector changes breaking visual regression or test selectors:
  - *Mitigated*: Kept all existing CSS class names, attributes, and element hierarchies intact while upgrading their styling properties.
- Table overflow or responsive distortion:
  - *Mitigated*: Preserved `overflow-x: auto` on all table wrappers and verified responsive layouts.
- Focus accessibility:
  - *Mitigated*: Enforced `:focus-visible` outline rings with `rgba(37, 99, 235, 0.25)` and 2px offset.

## 11. Validation Results
- `npm run typecheck`: Passed (code 0).
- `npm test`: Passed (54 test files passed, 198 tests passed, code 0).
- `npm run build`: Passed (code 0, bundle generated cleanly in 348ms).

## 12. Definition of Done
- All role views (Lecturer, Student, Admin) display a cohesive modern, fresh, clean, and youthful design.
- No legacy jarring black bars or flat newspaper-like grids remain.
- All 198 unit tests pass without errors.
- Typecheck and build pass cleanly.

## 13. Progress Log
- 2026-10-17: Plan created based on user request for consistent, modern, clean, fresh/youthful UI without altering functional groups or APIs.
- 2026-10-17: Completed M1 (Design tokens in index.css, states.tsx, primitives).
- 2026-10-17: Completed M2 (App shell, glass header, role badges, active nav highlights in layouts.css).
- 2026-10-17: Completed M3 (Exam list, editor, scheduling, question config, roster, monitoring, detail stylesheets).
- 2026-10-17: Completed M4 (AI question generation, learning materials, rubrics, lecturer subjects, grading workspace, question import).
- 2026-10-17: Completed M5 (Full validation with TypeScript typecheck, Vitest unit test suite, and Vite production build).
- 2026-10-17: Completed M6 (LecturerDashboardPage, LecturerSubjectOverviewPage, and ExamListPage visual and layout modernization with hero banners, KPI tiles, search icons, table actions, and pagination).
- 2026-10-17: Refined ExamListPage action column based on user feedback: replaced cluttered 2-row wrapped buttons with clean primary "Chi tiết" button + MoreHorizontal (•••) action dropdown menu.
- 2026-10-17: Completed ExamListPage layout restructuring into a Unified Data Surface (4 interactive KPI quick-filter cards, seamless toolbar header with integrated search and select filters, full-bleed table, and pagination footer).
- 2026-10-17: Completed ExamDetailPage modernization (/lecturer/exams/:examId): redesigned Hero Header Card with badge pills and quick action buttons, 4 vibrant Key Fact KPI cards with custom Lucide icon badges and hover accents, high-end Readiness Progress dashboard card with animated progress bar and status pills, sleek Status action controls, and modern 4-step workflow section cards with Lucide icons, step number badges, and interactive action buttons.
- 2026-10-17: Completed Rubrics page modernization (/lecturer/rubrics): Hero Header Card with tagline and primary action button, 4 KPI insight metric cards (Total Rubrics, Total Criteria, Average Score, ABET Compliance), search toolbar with clear button and counter, modern 3-column rubric cards with criteria preview chips and action buttons.
- 2026-10-17: Completed Lecturer Subject List page modernization (/lecturer/subjects): Hero Header Card with subject count pill, 4 KPI summary cards (Total subjects, Active, Question Bank, Rubrics), seamless filter toolbar with search, status select with Filter icon, reset button, and modern subject rows with code badges, department info, metric chips, and interactive action buttons.
- 2026-10-17: Completed M7 (Student Views Modernization): Redesigned StudentPortalView with hero header, 4 quick KPI tiles, UUID lookup card, steps guide, and exam cards; redesigned StudentResultListPage with metric cards and emerald score pills; modernized StudentExamResultPage, StudentExamSlotPage, StudentPreExamView, EquipmentCheckPage, and ExamSuccessPage with high-tech cards, status badges, and audio/video monitoring visualizers.
- 2026-10-17: Completed M8 (Admin Views Modernization): Overhauled AdminDashboardPage (hero header, 4 KPI tiles, user & course preview lists), UserManagementPage (hero header, 3 KPI cards, search/role filter bar, borderless table with avatars & role pills, pagination, and modern modals), AdminUserDetailPage (user info card, course enrollment, reset password), SubjectManagementPage (hero header, 3 KPI cards, course table, course modal), AdminCourseDetailPage (assigned lecturers list, assign lecturer card, deletion dialog), and SettingsPage (hero header, 4 categorized modern setting cards with icons and status badges).
- 2026-10-17: Completed M9 (Shared Profile Page Modernization): Redesigned ProfilePage with single `<h1>` hero header banner, accessible tab navigation pills, responsive tab panels for Overview (with avatar, diagnostic link to /device-check), Security (password change validation), and Preferences (demo toggles).
- 2026-10-17: Verification complete: TypeScript (`tsc -b`), Vitest (54 test files, 198/198 tests), and Vite production build all 100% pass without errors.
