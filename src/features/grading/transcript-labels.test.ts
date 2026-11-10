import { describe, expect, it } from 'vitest'
import { transcriptLabels } from './transcript-labels'

describe('transcript question hierarchy', () => {
  it('numbers follow-ups under each main question and associates answers', () => {
    expect(transcriptLabels([
      { turnType: 'MAIN_QUESTION' }, { turnType: 'ANSWER' },
      { turnType: 'FOLLOW_UP' }, { turnType: 'ANSWER' },
      { turnType: 'FOLLOW_UP' }, { turnType: 'ANSWER' },
      { turnType: 'MAIN_QUESTION' }, { turnType: 'FOLLOW_UP' },
    ])).toEqual([
      'Câu hỏi chính', 'Trả lời câu hỏi chính',
      'Câu hỏi phụ 1', 'Trả lời câu hỏi phụ 1',
      'Câu hỏi phụ 2', 'Trả lời câu hỏi phụ 2',
      'Câu hỏi chính', 'Câu hỏi phụ 1',
    ])
  })
  it('does not invent types or parents when metadata is missing', () => {
    expect(transcriptLabels([{}, { turnType: 'ANSWER' }])).toEqual(['', 'Câu trả lời'])
  })
})
