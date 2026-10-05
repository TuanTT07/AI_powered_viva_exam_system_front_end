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
