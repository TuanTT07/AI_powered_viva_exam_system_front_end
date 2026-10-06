import { materialExtension } from './material-validation'
import type { CourseMaterial } from './material-types'

export type MaterialRepository = {
  list(subjectId: string): Promise<CourseMaterial[]>
  upload(subjectId: string, files: File[]): Promise<CourseMaterial[]>
  retry(subjectId: string, materialId: string): Promise<CourseMaterial>
  remove(subjectId: string, materialId: string): Promise<void>
}

const clone = <T,>(value: T) => structuredClone(value)
const now = () => new Date().toISOString()
const seed = (): CourseMaterial[] => [
  { id: 'material-java-core', subjectId: 'java', filename: 'Giao_trinh_Java_Core_OOP_2024.pdf', extension: 'PDF', size: 12.4 * 1024 * 1024, status: 'READY', uploadedAt: '2026-09-18T03:00:00.000Z', updatedAt: '2026-09-18T03:02:00.000Z' },
  { id: 'material-java-processing', subjectId: 'java', filename: 'De_cuong_chi_tiet_mon_hoc_INT2204.pdf', extension: 'PDF', size: 2 * 1024 * 1024, status: 'PROCESSING', uploadedAt: '2026-10-05T03:00:00.000Z', updatedAt: '2026-10-05T03:00:00.000Z' },
  { id: 'material-java-failed', subjectId: 'java', filename: 'Ghi_chu_thao_luan_tuan_08_scan.pdf', extension: 'PDF', size: 18 * 1024 * 1024, status: 'FAILED', uploadedAt: '2026-10-04T03:00:00.000Z', updatedAt: '2026-10-04T03:01:00.000Z', failureMessage: 'Không thể hoàn tất xử lý tài liệu. Hãy thử lại.' },
  { id: 'material-other', subjectId: 'other-subject', filename: 'other-subject.txt', extension: 'TXT', size: 1024, status: 'READY', uploadedAt: '2026-10-01T03:00:00.000Z', updatedAt: '2026-10-01T03:00:00.000Z' },
]

export function createMaterialRepository(initial = seed()): MaterialRepository {
  const materials = clone(initial)
  return {
    async list(subjectId) { return clone(materials.filter((item) => item.subjectId === subjectId)) },
    async upload(subjectId, files) {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 250))
      const timestamp = now()
      const created = files.map((file): CourseMaterial => ({ id: crypto.randomUUID(), subjectId, filename: file.name, extension: materialExtension(file.name), size: file.size, status: 'READY', uploadedAt: timestamp, updatedAt: timestamp }))
      materials.unshift(...created)
      return clone(created)
    },
    async retry(subjectId, materialId) {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 120))
      const index = materials.findIndex((item) => item.subjectId === subjectId && item.id === materialId)
      if (index < 0) throw new Error('Không tìm thấy học liệu cần thử lại.')
      if (materials[index].status !== 'FAILED') throw new Error('Chỉ có thể thử lại học liệu xử lý thất bại.')
      materials[index] = { ...materials[index], status: 'READY', failureMessage: undefined, updatedAt: now() }
      return clone(materials[index])
    },
    async remove(subjectId, materialId) {
      const index = materials.findIndex((item) => item.subjectId === subjectId && item.id === materialId)
      if (index < 0) throw new Error('Không tìm thấy học liệu cần xóa.')
      materials.splice(index, 1)
    },
  }
}

export const materialRepository = createMaterialRepository()
