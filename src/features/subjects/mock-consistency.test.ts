import { expect, it } from 'vitest'
import { createMockSubjectRepository } from './subject-repository'
import { questionRepository } from '../question-bank/question-repository'
import { studentResultsDemo } from '../exams/mocks/student-results-demo'
import { examSeed } from '../exams/exam-repository'
import { mockUserRepository } from '../administration/user-repository'
import { mockCourseRepository } from '../administration/course-repository'
it('derives summary counts and AI topic options from the same question data', async () => {
  const subjects = await createMockSubjectRepository().list()
  for (const subject of subjects) {
    const questions = await questionRepository.list(subject.id)
    expect(subject.questionCount).toBe(questions.length)
    expect(subject.approvedQuestionCount).toBe(questions.filter(question => question.status === 'ĐÃ DUYỆT').length)
    expect(await questionRepository.topics(subject.id)).toEqual(expect.arrayContaining([...new Set(questions.map(question => question.topic))]))
  }
})
it('uses consistent dates for student mock results and exam sessions', () => {
  for (const result of studentResultsDemo) expect(result.date).toBe(examSeed.find(exam => exam.id === result.id)?.scheduledAt)
})
it('links assigned mock courses to real course records', async () => {
  const courses = await mockUserRepository.getCourses('1')
  expect(courses.length).toBeGreaterThan(0)
  for (const course of courses) expect(await mockCourseRepository.getById(course.id)).toMatchObject({ id: course.id, code: course.code })
})
