# Exam Scheduling and Time Slots

Route: `/lecturer/exams/:examId/schedule` (INF-12), explicitly approved as a standalone lecturer exam-management page. It uses STITCH-08 as the nearest visual reference because no dedicated Stitch Scheduling frame exists; this is an inferred screen, not an exact Stitch match.

The page reads the shared Exam and Student Roster repositories. It displays the exam start timestamp and duration, configures a 0–30 minute whole-number break, and generates one chronological slot per current roster student. Slot `n+1` starts after slot `n` ends plus the configured break. `ROSTER_ORDER` assigns stable roster order; `UNASSIGNED` leaves every slot available for manual assignment.

Assignments are scoped to the current exam, one student can occupy at most one slot, and unassigned slots are allowed for drafts. Saving validates exam ownership, timestamps, order, duration, overlap, roster membership, and duplicate assignments. Roster additions appear unassigned; removed students are no longer valid assignments and require schedule review without automatic regeneration.

`DRAFT` and `SCHEDULED` schedules are editable. `IN_PROGRESS`, `COMPLETED`, and `CANCELLED` schedules are read-only. Generation creates a local draft; Save persists it through the shared mock repository. Regeneration confirms before replacing existing slots/assignments, and unsaved navigation is guarded.

Persistence is frontend mock-only: no calendar integration, notifications, student delivery, backend concurrency protection, question assignment, or runtime session is implemented. TanStack Query keys include `examId`; successful saves update the schedule query and invalidate the affected exam detail only.

Remaining Group 2 work includes monitoring, question configuration, grading, and reports; backend scheduling persistence and authorization remain dependencies.
