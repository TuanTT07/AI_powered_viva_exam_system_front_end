import type { GenerationRequest, GeneratedQuestion } from './generation-types'
import { validateGeneratedQuestions } from './generation-validation'

export type GenerationAdapter = { generate(request: GenerationRequest, materialNames: string[]): Promise<GeneratedQuestion[]> }
const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

export const mockGenerationAdapter: GenerationAdapter = {
  async generate(request, materialNames) {
    await wait(300)
    if (request.topic === 'MOCK_FAILURE') throw new Error('Mock generation failure')
    return validateGeneratedQuestions(Array.from({ length: request.count }, (_, index) => {
      const language = request.language === 'en' ? `Explain ${request.topic} in a practical ${request.bloom} discussion.` : `Hãy trình bày ${request.topic} trong một tình huống vấn đáp ở mức ${request.bloom}.`
      return { id: `generated-${request.subjectId}-${index + 1}`, content: `${language} (Câu ${index + 1})`, suggestedAnswer: request.language === 'en' ? `Mention the core concept, evidence and a concise example for ${request.topic}.` : `Nêu bản chất, dẫn chứng và một ví dụ ngắn cho ${request.topic}.`, topic: request.topic, bloom: request.bloom, rubricId: request.rubricId, sourceMaterialIds: request.materialIds, sourceMaterialNames: materialNames, selected: true, issues: [] }
    }))
  },
}
