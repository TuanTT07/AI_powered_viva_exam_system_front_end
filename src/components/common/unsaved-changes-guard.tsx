import { useContext, useEffect } from 'react'
import { UNSAFE_DataRouterContext, useBlocker, type Location } from 'react-router-dom'
import { Button, Dialog } from '../ui/primitives'

/** MemoryRouter previews have no navigation blocker; full app uses a data router. */
export function UnsavedChangesGuard({ when, allow }: { when: boolean; allow?: (next: Location) => boolean }) {
  const router = useContext(UNSAFE_DataRouterContext)
  useEffect(() => {
    if (!when) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [when])
  return router ? <RouteGuard when={when} allow={allow} /> : null
}
function RouteGuard({ when, allow }: { when: boolean; allow?: (next: Location) => boolean }) {
  const blocker = useBlocker(({ currentLocation, nextLocation }) => when && currentLocation.pathname !== nextLocation.pathname && !allow?.(nextLocation))
  return <Dialog open={blocker.state === 'blocked'} title="Rời trang có thay đổi chưa lưu?" onClose={() => blocker.reset?.()}><p>Nội dung chưa lưu sẽ bị mất nếu bạn rời trang.</p><div className="dialog-actions"><Button variant="outline" onClick={() => blocker.reset?.()}>Ở lại chỉnh sửa</Button><Button variant="danger" onClick={() => blocker.proceed?.()}>Bỏ thay đổi và rời trang</Button></div></Dialog>
}
