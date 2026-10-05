# Prompt Pattern — Refactor

Refactor `<AREA>` without changing approved user-visible behavior unless explicitly requested.

Before coding:
1. explain the current architecture,
2. identify the specific problem,
3. show which files will change,
4. identify regression risks,
5. create an ExecPlan if cross-feature.

Constraints:
- do not mix refactor with unrelated feature work,
- do not introduce new libraries without justification,
- preserve contracts,
- preserve role and grading rules,
- add/update tests where behavior could regress.

After implementation, summarize:
- what became simpler,
- what stayed behaviorally identical,
- any migrations still required.
