import { describe, expect, it } from 'vitest'
import { workspaceNavigation, workspaceNavActive } from './workspace-navigation'

describe('resource-based workspace navigation', () => {
  it('keeps the global lecturer menu focused on resource lists', () => {
    const items = workspaceNavigation('lecturer').flatMap(g => g.items)
    expect(items.map(item => item.to)).toEqual(['/lecturer', '/lecturer/subjects', '/lecturer/rubrics', '/lecturer/exams'])
    expect(items.some(item => /attempts|monitor|report|materials/.test(item.to))).toBe(false)
  })
  it('keeps the containing resource active on deep feature routes', () => {
    const items = workspaceNavigation('lecturer').flatMap(g => g.items)
    expect(items.filter(item => workspaceNavActive(item, '/lecturer/exams/e1/attempts/a1')).map(i => i.label)).toEqual(['Kỳ thi vấn đáp'])
    expect(items.filter(item => workspaceNavActive(item, '/lecturer/subjects/s1/materials')).map(i => i.label)).toEqual(['Môn học & Học liệu'])
    expect(items.filter(item => workspaceNavActive(item, '/lecturer/exams-other'))).toHaveLength(0)
  })
  it('keeps role menus isolated', () => {
    for (const role of ['student', 'admin'] as const) expect(workspaceNavigation(role).flatMap(g => g.items).every(i => !i.to.startsWith('/lecturer'))).toBe(true)
  })
})
