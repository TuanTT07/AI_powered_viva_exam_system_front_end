# Exam Question Configuration

Route: `/lecturer/exams/:examId/questions` (INF-13), standalone and distinct from the subject Question Bank route. No dedicated Stitch frame exists; STITCH-08 is the nearest visual reference and the implementation is explicitly inferred.

The page resolves approved (`ĐÃ DUYỆT`) questions from the shared Question Bank for the exam subject. It supports URL-backed search/topic/Bloom filters, read-only preview, `MANUAL` exact-count selection, and `RANDOM_POOL` selection with at least the configured main-question count. The maximum follow-up count is displayed only; no follow-up selection or runtime allocation occurs.

The repository persists only question IDs, validates subject/status/duplicates/counts/editability, and keeps other exams isolated. Saved missing or newly ineligible references are shown and block Save until replaced. Draft selection is local, guarded by unsaved navigation confirmation, and saved through TanStack Query invalidation of the current configuration and exam detail.

This is frontend mock persistence only: no Question Bank content is copied, no per-student allocation or random runtime selection occurs, no adaptive follow-up is generated, and no backend persistence is present.
