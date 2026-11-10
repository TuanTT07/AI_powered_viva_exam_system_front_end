type Turn = { turnType?: 'MAIN_QUESTION' | 'FOLLOW_UP' | 'ANSWER' }

// Use backend turn types, never infer question type from its wording.
export function transcriptLabels(turns: readonly Turn[]): string[] {
  let followUp = 0
  let parent: string | undefined
  return turns.map(turn => {
    if (turn.turnType === 'MAIN_QUESTION') {
      followUp = 0
      parent = 'câu hỏi chính'
      return 'Câu hỏi chính'
    }
    if (turn.turnType === 'FOLLOW_UP') {
      parent = `câu hỏi phụ ${++followUp}`
      return `Câu hỏi phụ ${followUp}`
    }
    if (turn.turnType === 'ANSWER') return parent ? `Trả lời ${parent}` : 'Câu trả lời'
    parent = undefined
    return ''
  })
}
