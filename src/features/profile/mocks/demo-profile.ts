export type DemoProfile = { phone: string; department: string; emailReminder: boolean; resultReminder: boolean }
export const defaultDemoProfile: DemoProfile = { phone: '', department: '', emailReminder: true, resultReminder: true }
const key = (userId: string) => `aives.demo.profile.v1.${userId}`
export function readDemoProfile(userId: string): DemoProfile {
  try {
    const data = JSON.parse(localStorage.getItem(key(userId)) ?? 'null')
    return data && typeof data.phone === 'string' && typeof data.department === 'string' && typeof data.emailReminder === 'boolean' && typeof data.resultReminder === 'boolean' ? data : { ...defaultDemoProfile }
  } catch { return { ...defaultDemoProfile } }
}
export function saveDemoProfile(userId: string, profile: DemoProfile) { localStorage.setItem(key(userId), JSON.stringify(profile)) }
