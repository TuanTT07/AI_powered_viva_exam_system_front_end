import { describe, expect, it } from 'vitest'
import { MAX_MATERIAL_FILE_SIZE, validateMaterialFiles } from './material-validation'
import type { CourseMaterial } from './material-types'

const existing: CourseMaterial[] = [{ id: 'one', subjectId: 'java', filename: 'notes.pdf', extension: 'PDF', size: 20, status: 'READY', uploadedAt: '', updatedAt: '' }]
const file = (name: string, size = 20) => new File([new Uint8Array(size)], name, { type: 'application/pdf' })

describe('material file validation', () => {
  it('accepts supported files and retains valid files in a mixed selection', () => {
    const result = validateMaterialFiles([file('good.pdf'), file('bad.exe')], existing)
    expect(result.accepted.map((item) => item.name)).toEqual(['good.pdf'])
    expect(result.rejected[0]?.message).toMatch(/Chỉ hỗ trợ/)
  })
  it('rejects empty, oversized, duplicate and eleventh files', () => {
    expect(validateMaterialFiles([new File([], 'empty.txt')], existing).rejected[0]?.message).toMatch(/trống/)
    expect(validateMaterialFiles([file('big.pdf', MAX_MATERIAL_FILE_SIZE + 1)], existing).rejected[0]?.message).toMatch(/25 MB/)
    expect(validateMaterialFiles([file(' NOTES.PDF ', 20)], existing).rejected[0]?.message).toMatch(/trùng/)
    expect(validateMaterialFiles(Array.from({ length: 11 }, (_, index) => file(`${index}.pdf`)), existing).accepted).toHaveLength(10)
  })
})
