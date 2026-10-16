import type { Rubric, RubricDraft } from './rubric-types'
import { runtimeConfig } from '../../services/api/runtime-config'
import { selectRepository } from '../../services/api/repository-selection'
import { apiRubricRepository } from './api-rubric-repository'

export type RubricRepository = {
  list(subjectId: string): Promise<Rubric[]>
  get(subjectId: string, rubricId: string): Promise<Rubric | null>
  save(rubric: RubricDraft & { id?: string }): Promise<Rubric>
  delete(rubricId: string): Promise<void>
}

const rubricStore: Rubric[] = [{
  id: 'rubric-java-core', subjectId: 'java', name: 'Rubric Java Core',
  criteria: [
    { id: 'criterion-knowledge', name: 'Kiến thức cốt lõi', maximumScore: '4', description: 'Nêu đúng bản chất cú pháp và đặc tính.' },
    { id: 'criterion-analysis', name: 'Khả năng phản biện & Đào sâu', maximumScore: '3', description: 'So sánh đúng các khác biệt cốt lõi.' },
    { id: 'criterion-example', name: 'Ví dụ thực tế', maximumScore: '3', description: 'Đưa ví dụ phù hợp ngữ cảnh.' },
  ],
}]

for (const [subjectId, subjectName, count] of [['oop-java', 'Lập trình Java', 4], ['java-core', 'Java Core', 3], ['database', 'Cơ sở dữ liệu', 5], ['operating-systems', 'Hệ điều hành', 2]] as const) {
  for (let index = 0; index < count; index++) rubricStore.push({
    id: `rubric-${subjectId}-${index + 1}`, subjectId,
    name: `${subjectName} · ${['Kiến thức nền tảng', 'Phân tích tình huống', 'Ứng dụng thực tế', 'Lập luận & phản biện', 'Tổng hợp kiến thức'][index]}`,
    criteria: structuredClone(rubricStore[0].criteria).map(criterion => ({ ...criterion, id: `${subjectId}-${index + 1}-${criterion.id}` })),
  })
}

const clone = <T,>(value: T): T => structuredClone(value)

export const mockRubricRepository: RubricRepository = {
  async list(subjectId) { return clone(subjectId ? rubricStore.filter((rubric) => rubric.subjectId === subjectId) : rubricStore) },
  async get(subjectId, rubricId) { return clone(rubricStore.find((rubric) => rubric.id === rubricId && (!subjectId || rubric.subjectId === subjectId)) ?? null) },
  async save(draft) {
    const id = draft.id ?? `rubric-${crypto.randomUUID()}`
    const rubric = { ...clone(draft), id }
    const index = rubricStore.findIndex((item) => item.id === id && item.subjectId === rubric.subjectId)
    if (index >= 0) rubricStore[index] = rubric
    else rubricStore.push(rubric)
    return clone(rubric)
  },
  async delete(rubricId) {
    const index = rubricStore.findIndex((rubric) => rubric.id === rubricId)
    if (index >= 0) rubricStore.splice(index, 1)
  },
}

export function createRubricRepository(config: Pick<typeof runtimeConfig, 'dataSource'> = runtimeConfig): RubricRepository {
  return selectRepository(config.dataSource, { mock: mockRubricRepository, api: apiRubricRepository })
}

export const rubricRepository: RubricRepository = createRubricRepository()
