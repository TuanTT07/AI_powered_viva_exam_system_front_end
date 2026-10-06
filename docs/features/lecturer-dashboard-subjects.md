# Lecturer Dashboard and Subject Navigation

## Routes

- `/lecturer` — dashboard
- `/lecturer/subjects` — assigned/demo subject list
- `/lecturer/subjects/:subjectId` — subject overview and feature navigation

These routes are protected by the existing Lecturer role guard and reuse the existing Question, Rubric, Materials, AI and Exam routes.

## Data-source behavior

The backend currently does not expose a verified Lecturer Courses endpoint (`GET /api/lecturer/courses` or `GET /api/auth/me/courses`). Subject assignment and dashboard subject metrics therefore use the existing mock repository in both modes and are labelled `Dữ liệu demo` in API mode. This is a capability-level decision, not fallback after an API error.

The Scheduling API remains real API-backed when its route receives a backend UUID. `VITE_DEMO_COURSE_ID` may replace the designated first demo subject ID; mock-only IDs are blocked from API-backed feature links. `VITE_DEMO_EXAM_ID` is used only for an explicitly configured safe exam link.

The preferred future backend contract should derive the Lecturer from the bearer token and return only assigned courses. A detail endpoint should verify assignment again:

```text
GET /api/lecturer/courses
GET /api/lecturer/courses/{courseId}
```

These endpoints are not claimed as available until they appear in Swagger.

## Visual reference

No dedicated Stitch Dashboard, Subject List or Subject Overview frame is currently registered. The pages are inferred from the existing AIVES lecturer layout, typography, cards, borders and status primitives; they are not an exact Stitch match.
