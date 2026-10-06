import { describe, expect, it } from 'vitest'
import { parseExamSearchParams } from './exam-url'

describe('exam list URL contract', () => {
  it('reads supported filters and page', () => {
    const parsed = parseExamSearchParams(new URLSearchParams('q=java&subject=oop-java&status=SCHEDULED&page=2'))
    expect(parsed).toEqual({ q: 'java', subject: 'oop-java', status: 'SCHEDULED', page: 2 })
  })
  it('recovers safely from invalid status and page values', () => {
    expect(parseExamSearchParams(new URLSearchParams('status=publish&page=-4'))).toEqual({ q: '', subject: '', status: '', page: 1 })
    expect(parseExamSearchParams(new URLSearchParams('page=not-a-number'))).toEqual({ q: '', subject: '', status: '', page: 1 })
  })
})
