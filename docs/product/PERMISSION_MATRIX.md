# Permission Matrix

> Backend authorization remains authoritative.

| Capability | Admin | Lecturer | Student |
|---|---:|---:|---:|
| Manage users | Yes | No | No |
| Manage subjects globally | Yes | Limited/No | No |
| Manage learning materials | No/Policy | Yes (assigned subjects) | No |
| Manage question bank | No/Policy | Yes | No |
| Generate AI draft questions | No/Policy | Yes | No |
| Manage rubrics | No/Policy | Yes | No |
| Create exams | No/Policy | Yes | No |
| Assign students | No/Policy | Yes | No |
| Take Viva exam | No | No | Yes |
| View own released result | No | No | Yes |
| Review transcript for grading | Policy | Yes | Own result only if released/policy |
| View AI score suggestion | Policy | Yes | Only if release policy allows |
| Confirm final grade | No/Policy | Yes | No |
| View cohort reports | Policy | Yes | No |
| System configuration | Yes | No | No |

## Rule

When exact policy is not confirmed, mark behavior as TBD rather than broadening access.
