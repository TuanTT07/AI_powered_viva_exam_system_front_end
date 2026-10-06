import { describe, expect, it } from 'vitest'
import { generateScheduleSlots } from './schedule-generator'
import type { RosterStudent } from './roster-types'
const roster: RosterStudent[] = [{ id: 'r1', examId: 'e1', studentCode: 'SV1', fullName: 'Một', email: 'one@example.com' }, { id: 'r2', examId: 'e1', studentCode: 'SV2', fullName: 'Hai', email: 'two@example.com' }]
describe('schedule generation', () => { it('creates sequential slots with duration and break', () => { const slots = generateScheduleSlots('e1', '2027-01-01T01:00:00.000Z', 15, 5, roster, 'ROSTER_ORDER'); expect(slots).toHaveLength(2); expect(slots[0].rosterStudentId).toBe('r1'); expect(slots[0].endAt).toBe('2027-01-01T01:15:00.000Z'); expect(slots[1].startAt).toBe('2027-01-01T01:20:00.000Z') }); it('leaves assignments empty for UNASSIGNED', () => { expect(generateScheduleSlots('e1', '2027-01-01T01:00:00.000Z', 15, 0, roster, 'UNASSIGNED').every((slot) => !slot.rosterStudentId)).toBe(true) }) })
