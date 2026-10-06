import { describe, expect, it } from 'vitest'
import { createExamRepository } from './exam-repository'

describe('exam roster repository', () => {
  it('scopes mutations and synchronizes only the selected exam count', async () => { const repo = createExamRepository(); const beforeOther = (await repo.get('EXAM-2025-DB-01'))!.studentCount; const added = await repo.addRosterStudent('EXAM-2024-COL-02', { studentCode: 'SV900', fullName: 'Nguyễn Văn B', email: 'sv900@example.com' }); expect((await repo.listRoster('EXAM-2024-COL-02')).map((item) => item.studentCode)).toContain('SV900'); expect((await repo.listRoster('EXAM-2025-DB-01')).map((item) => item.studentCode)).not.toContain('SV900'); expect((await repo.get('EXAM-2024-COL-02'))!.studentCount).toBe(39); expect((await repo.get('EXAM-2025-DB-01'))!.studentCount).toBe(beforeOther); await repo.removeRosterStudent('EXAM-2024-COL-02', added.id); expect((await repo.get('EXAM-2024-COL-02'))!.studentCount).toBe(38) })
  it('rejects mutation for read-only exams', async () => { await expect(repoFor().addRosterStudent('EXAM-2024-OOP-01', { studentCode: 'SV900', fullName: 'Nguyễn Văn B', email: 'sv900@example.com' })).rejects.toThrow('not editable') })
})
const repoFor = createExamRepository
