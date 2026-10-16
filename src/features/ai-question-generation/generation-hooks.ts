import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiQuestionKeys, questionKeys, useImportQuestions } from '../question-bank/question-hooks'
import { mockGenerationAdapter } from './mock-generation'
import { apiGenerationRepository, type GenerateQuestionsRequestDto } from './api-generation-repository'
import type { GenerationRequest, GeneratedQuestion } from './generation-types'

export function useGenerateQuestions() {
  return useMutation({
    mutationFn: ({ request, materialNames }: { request: GenerationRequest; materialNames: string[] }) =>
      mockGenerationAdapter.generate(request, materialNames),
  })
}

export function useApiGenerateQuestions() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ courseId, request }: { courseId: string; request: GenerateQuestionsRequestDto }) =>
      apiGenerationRepository.generate(courseId, request),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: apiQuestionKeys.all })
    },
  })
}

export function useSaveGeneratedQuestions() {
  const importQuestions = useImportQuestions()
  const client = useQueryClient()
  return {
    ...importQuestions,
    mutateGenerated: (
      subjectId: string,
      questions: GeneratedQuestion[],
      options?: { onSuccess?: () => void; onError?: (error: Error) => void }
    ) =>
      importQuestions.mutate(
        {
          subjectId,
          drafts: questions
            .filter((question) => question.selected && !question.issues.length)
            .map(({ content, topic, bloom, suggestedAnswer, rubricId }) => ({
              content,
              topic,
              bloom,
              suggestedAnswer,
              rubricId,
            })),
        },
        {
          onSuccess: () => {
            client.invalidateQueries({ queryKey: questionKeys.list(subjectId) })
            options?.onSuccess?.()
          },
          onError: (error) => options?.onError?.(error as Error),
        }
      ),
  }
}
