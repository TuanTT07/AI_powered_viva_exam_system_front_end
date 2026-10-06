# Exam Monitoring API Integration

`/lecturer/exams/:examId/monitor` reads `GET /api/v1/exams/{examId}/monitor` and supports backend-confirmed reset and absent actions. Actions are confirmation-protected, pending-aware and invalidate monitoring, schedule and detail caches. No WebSocket or fabricated audit evidence is used.

The page is inferred because no dedicated Stitch Monitoring frame exists. It uses the existing lecturer design system and clearly reports empty, error, forbidden and API capability states.
