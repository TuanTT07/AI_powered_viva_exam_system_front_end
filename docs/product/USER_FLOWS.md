# User Flows

## Lecturer — Prepare Question Bank

```text
Login
→ Subject
→ Learning Materials
→ Upload Material
→ Wait for Processing
→ Generate Questions with AI
→ Review Draft Questions
→ Edit / Approve / Reject
→ Add Approved Questions to Question Bank
→ Attach / Confirm Rubric
```

### Failure branches

```text
Document processing failed
→ show reason
→ retry or replace document

AI generation failed
→ preserve user configuration
→ retry

Generated question is poor
→ edit or reject
```

---

## Lecturer — Create Exam

```text
Lecturer Dashboard
→ Exams
→ Create Exam
→ Select Subject
→ Configure Basic Information
→ Add Students
→ Configure Schedule
→ Configure Main Question Count
→ Configure Maximum Follow-ups
→ Select Question Strategy
→ Review
→ Publish
```

### Publish validation

Exam cannot publish unless required fields are valid.

Exact backend requirements: TBD.

---

## Lecturer — Review and Finalize Grade

```text
Exam
→ Student Attempt
→ Review Transcript
→ Review Question + Rubric
→ Review AI Suggested Score
→ Review AI Feedback
→ Adjust if Needed
→ Add Lecturer Comment if Needed
→ Confirm Final Score
→ Save
```

Important:
AI score is never automatically presented as the official final grade.

---

## Student — Take Viva Exam

```text
Login
→ Upcoming Exams
→ Exam Detail
→ Instructions
→ Device Check
    ├ microphone
    ├ speaker
    ├ network
    └ camera if required
→ Ready
→ Start Exam
→ AI Speaks Main Question
→ Student Answers
→ STT Produces Transcript
→ AI Analyzes Answer
    ├ sufficient
    │   → next main question
    └ unclear / incomplete / contradictory
        → AI Follow-up
        → Student Answers
        → analyze again
→ Repeat Within Configured Limits
→ Complete Exam
→ Submission Confirmation
→ Result Pending
→ Released Result
```

---

## Student — Reconnect During Exam

```text
Connection Lost
→ Freeze unsafe actions
→ Show reconnect state
→ Attempt reconnect
    ├ success
    │   → fetch authoritative session state
    │   → resume from backend-confirmed state
    └ failure beyond allowed policy
        → show escalation/failure instructions
```

Never infer that an answer was saved unless backend confirms it.

---

## Admin — Manage User

```text
Admin Dashboard
→ Users
→ Search / Filter
→ View User
→ Assign/Change Allowed Role or Status
→ Save
→ Confirmation
```

Exact allowed role transitions are backend policy: TBD.

---

## M0 Stitch Coverage Audit

### Lecturer — End-to-End Lifecycle

```text
Login
→ Lecturer Dashboard
→ Subject
→ Learning Materials
→ Upload / Wait for Processing
→ AI Question Generation
→ Review Draft Questions and Sources
→ Question Bank
→ Create/Edit Questions and Rubrics
→ Create Exam
→ Assign Students
→ Configure Schedule / Questions / Follow-up Limits
→ Review and Publish
→ Monitor
→ Attempt Queue
→ Review Recording and Transcript
→ Review AI Suggested Score
→ Enter and Confirm Lecturer Final Score
→ Publish According to Policy
→ Reports / Export
```

Confirmed Stitch coverage:

- learning materials,
- generated-question review and citation evidence,
- question bank and batch import,
- question/rubric editor,
- exam list and combined exam configuration/assignment,
- attempt queue,
- per-question and final grading states,
- report/grade ledger.

Missing or incomplete:

- login is only a live-only unconfirmed node,
- lecturer dashboard, subject list/detail and rubric list/editor lack dedicated frames,
- create-exam, exam overview and publish validation lack dedicated frames,
- live monitoring has no frame,
- error/empty/permission/conflict states are not designed,
- finalization versus publication semantics require backend confirmation.

### Student — End-to-End Lifecycle

```text
Login
→ Student Dashboard
→ Upcoming / Eligible Exams
→ Exam Detail and Instructions
→ Device Check
→ Ready
→ Start Viva
→ AI Speaks Official Question
→ Wait for Answer
→ Record Answer
→ Resolve Final Transcript
→ AI Processing
→ Backend-Confirmed Follow-up OR Next Main Question
→ Complete
→ Backend-Confirmed Submission Receipt
→ Result Pending / Unreleased
→ Released Result
```

Confirmed Stitch coverage:

- combined device check/instructions/ready reference,
- one active Viva variant showing recording, partial transcript and follow-up,
- combined student results hub/detail with released and pending examples.

Missing or incomplete:

- dashboard, exam list and exam detail,
- AI speaking, waiting, AI processing, next-question and completing phases,
- all reconnect and error paths,
- submission receipt is only a live-only unconfirmed node,
- released-result policy and feedback visibility remain TBD.

### Admin — End-to-End Lifecycle

```text
Login
→ Admin Dashboard
→ User Management
→ Search / Filter
→ Open Account Editor
→ Assign Allowed Role / Subject Scope / Status
→ Save and Confirm
→ Subject Management
→ System Configuration Exposed by Backend
```

Confirmed Stitch coverage:

- populated user table and account editor overlay.

Missing or incomplete:

- admin dashboard,
- subject/lecturer assignment,
- loading/empty/error/forbidden states,
- role transition and lock policies,
- system configuration frame; the live AI voice configuration node is unconfirmed and cannot define provider architecture.

## Cross-Flow Rules

1. Stitch navigation labels do not create routes by themselves; the normalized route map is in `docs/ROUTES.md`.
2. AI-generated questions remain drafts until lecturer approval.
3. AI scores remain suggestions; only a lecturer-confirmed score is official.
4. Student result visibility is controlled by backend release policy.
5. Reconnect restores a backend-authoritative Viva snapshot before actions resume.
6. Any screen that contains sensitive evidence must handle forbidden and unavailable states without leaking data.
