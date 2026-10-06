export type RubricCriterion = {
  id: string
  name: string
  maximumScore: string
  description: string
}

export type Rubric = {
  id: string
  subjectId: string
  name: string
  criteria: RubricCriterion[]
}

export type RubricDraft = Omit<Rubric, 'id'>
