import { describe, expect, it } from 'vitest'
import { examDefaults, validateExamForm, type ExamFormValues } from './exam-validation'

const subjects = [{ id: 'oop-java', code: 'INT2204', name: 'Lập trình Java' }]
const future = new Date('2027-01-01T00:00:00+07:00')
const valid: ExamFormValues = { ...examDefaults, title: 'Kỳ thi Java', subjectId: 'oop-java', startDate: '2027-02-01', startTime: '09:00' }

describe('exam editor validation', () => {
  it('uses approved defaults', () => expect(examDefaults).toMatchObject({ durationMinutes: '15', mainQuestionCount: '3', maxFollowUpCount: '2' }))
  it('requires title, subject and start date/time', () => {
    const errors = validateExamForm(examDefaults, subjects, { mode: 'create', now: future })
    expect(errors.title).toContain('tên')
    expect(errors.subjectId).toContain('học phần')
    expect(errors.startDate).toContain('ngày')
  })
  it('enforces title length and subject membership', () => {
    expect(validateExamForm({ ...valid, title: 'ab', subjectId: 'other' }, subjects, { mode: 'create', now: future })).toMatchObject({ title: expect.any(String), subjectId: expect.any(String) })
    expect(validateExamForm({ ...valid, title: 'x'.repeat(121) }, subjects, { mode: 'create', now: future }).title).toContain('120')
  })
  it('rejects past, invalid and out-of-range numeric values', () => {
    const errors = validateExamForm({ ...valid, startDate: '2020-99-99', durationMinutes: '4', mainQuestionCount: '21', maxFollowUpCount: '-1' }, subjects, { mode: 'create', now: future })
    expect(errors.startDate).toBeTruthy()
    expect(errors.durationMinutes).toBeTruthy()
    expect(errors.mainQuestionCount).toBeTruthy()
    expect(errors.maxFollowUpCount).toBeTruthy()
  })
  it('allows an existing edit with a historical unchanged start time', () => {
    const initial = '2020-01-01T02:00:00.000Z'
    const values = { ...valid, startDate: '2020-01-01', startTime: '09:00' }
    expect(validateExamForm(values, subjects, { mode: 'edit', initialScheduledAt: initial, now: future }).startDate).toBeUndefined()
  })
})
