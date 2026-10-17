import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
export function RouteViewport() {
  const { pathname } = useLocation()
  useEffect(() => { document.querySelector<HTMLElement>('#main')?.focus({ preventScroll: true }) }, [pathname])
  return <><Outlet /><ScrollRestoration getKey={location => location.pathname} /></>
}
