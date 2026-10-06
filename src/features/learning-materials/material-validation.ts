import type { CourseMaterial, MaterialFileIssue } from './material-types'

export const MAX_MATERIAL_FILE_SIZE = 25 * 1024 * 1024
export const MAX_MATERIAL_SELECTION = 10
export const materialExtensions = ['pdf', 'docx', 'pptx', 'txt'] as const

const normalizedName = (name: string) => name.trim().toLocaleLowerCase()
const extensionOf = (name: string) => normalizedName(name).split('.').pop() ?? ''

export function validateMaterialFiles(files: File[], existing: CourseMaterial[]) {
  const accepted: File[] = []
  const rejected: MaterialFileIssue[] = []
  const known = new Set(existing.map((item) => `${normalizedName(item.filename)}:${item.size}`))
  const selected = new Set<string>()
  for (const file of files) {
    const key = `${normalizedName(file.name)}:${file.size}`
    const extension = extensionOf(file.name)
    let message: string | undefined
    if (!materialExtensions.includes(extension as (typeof materialExtensions)[number])) message = 'Chỉ hỗ trợ tệp PDF, DOCX, PPTX hoặc TXT.'
    else if (file.size === 0) message = 'Tệp không được để trống.'
    else if (file.size > MAX_MATERIAL_FILE_SIZE) message = 'Mỗi tệp không được vượt quá 25 MB.'
    else if (known.has(key) || selected.has(key)) message = 'Tệp trùng tên và dung lượng với học liệu đã có hoặc đã chọn.'
    else if (accepted.length >= MAX_MATERIAL_SELECTION) message = 'Mỗi lần chỉ được chọn tối đa 10 tệp.'
    if (message) rejected.push({ filename: file.name, message })
    else { accepted.push(file); selected.add(key) }
  }
  return { accepted, rejected }
}

export function materialExtension(filename: string): CourseMaterial['extension'] {
  return extensionOf(filename).toUpperCase() as CourseMaterial['extension']
}

export const formatFileSize = (size: number) => size < 1024 * 1024 ? `${Math.max(1, Math.ceil(size / 1024))} KB` : `${(size / (1024 * 1024)).toFixed(1)} MB`
