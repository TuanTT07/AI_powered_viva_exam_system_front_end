export type AppealCategory =
  | 'stt_accuracy'
  | 'rubric_evaluation'
  | 'technical_issue'
  | 'general_evaluation'

export const APPEAL_CATEGORIES: Record<AppealCategory, { label: string; description: string }> = {
  stt_accuracy: {
    label: 'Nhận diện giọng nói (STT) chưa chính xác',
    description: 'Hệ thống chuyển đổi giọng nói sang văn bản bị sai lệch hoặc thiếu thuật ngữ chuyên ngành.'
  },
  rubric_evaluation: {
    label: 'Đánh giá tiêu chí Rubric chưa thỏa đáng',
    description: 'Câu trả lời đã đáp ứng tiêu chí nhưng điểm chấm gợi ý hoặc giảng viên ghi nhận chưa đúng mức.'
  },
  technical_issue: {
    label: 'Sự cố kỹ thuật / Gián đoạn đường truyền',
    description: 'Bị mất kết nối mạng, giật lag âm thanh hoặc micro bị ngắt quãng trong quá trình trả lời.'
  },
  general_evaluation: {
    label: 'Đề nghị phúc khảo toàn diện bài thi',
    description: 'Đề nghị hội đồng khảo thí và giảng viên nghe lại toàn bộ bản ghi âm để đánh giá lại.'
  }
}

export interface GradeAppeal {
  id: string
  examId: string
  currentScore: number
  category: AppealCategory
  reason: string
  contactEmail: string
  createdAt: string
  status: 'pending' | 'reviewing' | 'resolved' | 'rejected'
  reviewerNotes?: string
}

const STORAGE_PREFIX = 'aives.grade_appeal.v1.'
const inMemoryStore = new Map<string, GradeAppeal>()

export function getGradeAppeal(examId: string): GradeAppeal | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${examId}`)
      if (raw) return JSON.parse(raw) as GradeAppeal
    } catch {
      // Fallback to inMemoryStore
    }
  }
  return inMemoryStore.get(examId) ?? null
}

export function saveGradeAppeal(params: {
  examId: string
  currentScore: number
  category: AppealCategory
  reason: string
  contactEmail: string
}): GradeAppeal {
  const code = Math.floor(1000 + Math.random() * 9000)
  const appeal: GradeAppeal = {
    id: `PK-${params.examId.replace(/[^A-Za-z0-9]/g, '')}-${code}`,
    examId: params.examId,
    currentScore: params.currentScore,
    category: params.category,
    reason: params.reason.trim(),
    contactEmail: params.contactEmail.trim(),
    createdAt: new Date().toISOString(),
    status: 'pending'
  }

  inMemoryStore.set(params.examId, appeal)
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${params.examId}`, JSON.stringify(appeal))
    } catch {
      // Ignore localStorage write error
    }
  }
  return appeal
}

export function cancelGradeAppeal(examId: string): void {
  inMemoryStore.delete(examId)
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${examId}`)
    } catch {
      // Ignore localStorage error
    }
  }
}
