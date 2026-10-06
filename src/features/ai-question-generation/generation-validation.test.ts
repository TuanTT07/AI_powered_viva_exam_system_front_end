import { describe, expect, it } from 'vitest'
import { validateGeneratedQuestions, validateGenerationRequest } from './generation-validation'
import type { CourseMaterial } from '../learning-materials/material-types'
import type { Rubric } from '../rubrics/rubric-types'

const materials: CourseMaterial[] = [{ id: 'ready', subjectId: 'java', filename: 'java.pdf', extension: 'PDF', size: 1, status: 'READY', uploadedAt: '', updatedAt: '' }, { id: 'processing', subjectId: 'java', filename: 'pending.pdf', extension: 'PDF', size: 1, status: 'PROCESSING', uploadedAt: '', updatedAt: '' }]
const rubrics: Rubric[] = [{ id: 'r1', subjectId: 'java', name: 'Core', criteria: [] }]
const request = { subjectId: 'java', materialIds: ['ready'], topic: 'Collections', bloom: 'HIỂU' as const, count: 5, language: 'vi' as const }

describe('AI generation validation', () => {
  it('requires ready current-subject material and valid request bounds', () => {
    expect(validateGenerationRequest({ ...request, materialIds: ['processing'] }, materials, ['Collections'], rubrics).materials).toBeTruthy()
    expect(validateGenerationRequest({ ...request, count: 11 }, materials, ['Collections'], rubrics).count).toBeTruthy()
    expect(validateGenerationRequest(request, materials, ['Collections'], rubrics)).toEqual({})
  })
  it('marks later normalized duplicates and empty edits invalid', () => {
    const batch = [{ id: '1', content: 'Same', topic: 'Collections', bloom: 'HIỂU' as const, selected: true, issues: [], sourceMaterialIds: ['ready'], sourceMaterialNames: ['java.pdf'] }, { id: '2', content: ' same ', topic: 'Collections', bloom: 'HIỂU' as const, selected: true, issues: [], sourceMaterialIds: ['ready'], sourceMaterialNames: ['java.pdf'] }, { id: '3', content: '', topic: 'Collections', bloom: 'HIỂU' as const, selected: true, issues: [], sourceMaterialIds: ['ready'], sourceMaterialNames: ['java.pdf'] }]
    expect(validateGeneratedQuestions(batch).map((item) => item.issues.length)).toEqual([0, 1, 1])
  })
})
