export const materialStatuses = ['UPLOADING', 'PROCESSING', 'READY', 'FAILED'] as const
export type MaterialStatus = (typeof materialStatuses)[number]

export type CourseMaterial = {
  id: string
  subjectId: string
  filename: string
  extension: 'PDF' | 'DOCX' | 'PPTX' | 'TXT'
  size: number
  status: MaterialStatus
  uploadedAt: string
  updatedAt: string
  failureMessage?: string
}

export type MaterialFileIssue = { filename: string; message: string }
