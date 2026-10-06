import type { Rubric, RubricDraft } from './rubric-types'
import { runtimeConfig } from '../../services/api/runtime-config'
import { selectRepository } from '../../services/api/repository-selection'
import { apiRubricRepository } from './api-rubric-repository'

export type RubricRepository = {
  list(subjectId: string): Promise<Rubric[]>
  get(subjectId: string, rubricId: string): Promise<Rubric | null>
  save(rubric: RubricDraft & { id?: string }): Promise<Rubric>
}

const rubricStore: Rubric[] = [{
  id: 'rubric-java-core', subjectId: 'java', name: 'Rubric Java Core',
  criteria: [
    { id: 'criterion-knowledge', name: 'Kiến thức cốt lõi', maximumScore: '4', description: 'Nêu đúng bản chất cú pháp và đặc tính.' },
    { id: 'criterion-analysis', name: 'Khả năng phản biện & Đào sâu', maximumScore: '3', description: 'So sánh đúng các khác biệt cốt lõi.' },
    { id: 'criterion-example', name: 'Ví dụ thực tế', maximumScore: '3', description: 'Đưa ví dụ phù hợp ngữ cảnh.' },
  ],
}]

const clone = <T,>(value: T): T => structuredClone(value)

export const mockRubricRepository: RubricRepository = {
  async list(subjectId) { return clone(rubricStore.filter((rubric) => rubric.subjectId === subjectId)) },
  async get(subjectId, rubricId) { return clone(rubricStore.find((rubric) => rubric.subjectId === subjectId && rubric.id === rubricId) ?? null) },
  async save(draft) {
    const id = draft.id ?? `rubric-${crypto.randomUUID()}`
    const rubric = { ...clone(draft), id }
    const index = rubricStore.findIndex((item) => item.id === id && item.subjectId === rubric.subjectId)
    if (index >= 0) rubricStore[index] = rubric
    else rubricStore.push(rubric)
    return clone(rubric)
  },
}

export const rubricRepository: RubricRepository = selectRepository(runtimeConfig.dataSource, { mock: mockRubricRepository, api: apiRubricRepository })
