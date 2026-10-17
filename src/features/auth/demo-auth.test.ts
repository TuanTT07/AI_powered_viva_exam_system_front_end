import { beforeEach, expect, it } from 'vitest'
import { developmentAuthAdapter } from './auth-adapter'
beforeEach(() => sessionStorage.clear())
it('restores only a known demo identity across page reloads and clears it on logout', async () => {
  expect(await developmentAuthAdapter.getSession()).toBeNull()
  const user = await developmentAuthAdapter.signIn({ email: 'student@academia.edu.vn', password: 'AivesDemo!2026' })
  expect(await developmentAuthAdapter.getSession()).toEqual(user)
  expect(sessionStorage.getItem('aives.demo.session.v1')).toBe('student@academia.edu.vn')
  expect(JSON.stringify(sessionStorage)).not.toContain('AivesDemo!2026')
  await developmentAuthAdapter.signOut()
  expect(await developmentAuthAdapter.getSession()).toBeNull()
})
it('ignores unknown or malformed demo session identities', async () => {
  sessionStorage.setItem('aives.demo.session.v1', 'unknown')
  expect(await developmentAuthAdapter.getSession()).toBeNull()
  await expect(developmentAuthAdapter.signIn({ email: 'student@academia.edu.vn', password: 'incorrect' })).rejects.toThrow()
  expect(await developmentAuthAdapter.getSession()).toBeNull()
})
