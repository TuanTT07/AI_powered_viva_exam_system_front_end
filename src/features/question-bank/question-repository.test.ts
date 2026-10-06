import { describe, expect, it } from 'vitest'
import { questionRepository } from './question-repository'

describe('questionRepository import', () => {
  it('persists imported questions only in the current subject as drafts', async () => {
    const beforeOther = await questionRepository.list('other-subject')
    const result = await questionRepository.import('java', [{ content: 'Câu hỏi repository test', topic: 'Collections', bloom: 'VẬN DỤNG' }])
    expect(result).toEqual({ imported: 1, failed: 0 })
    await expect(questionRepository.list('java')).resolves.toEqual(expect.arrayContaining([expect.objectContaining({ content: 'Câu hỏi repository test', source: 'Import', status: 'BẢN NHÁP' })]))
    await expect(questionRepository.list('other-subject')).resolves.toEqual(beforeOther)
  })
})
