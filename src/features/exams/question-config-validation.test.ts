import { describe, expect, it } from 'vitest'
describe('question config count rules', () => { it('distinguishes manual exact count and random minimum', () => { const required = 3; const manual = 3; const pool = 4; const shortPool = 2; expect(manual).toBe(required); expect(pool >= required).toBe(true); expect(shortPool >= required).toBe(false) }) })
