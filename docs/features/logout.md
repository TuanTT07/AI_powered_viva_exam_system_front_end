# Frontend logout

Logout is a shared authenticated-workspace action available in Lecturer, Student and Admin layouts. It uses the existing `AuthAdapter`/`SessionProvider` boundary through `signOut(): Promise<void>`; no backend endpoint is fabricated because the current API contract has no auth or logout operation.

On explicit logout, the provider attempts the adapter operation, clears the entire TanStack Query cache, removes the authenticated user (`unauthenticated`/`null`), and the layout navigates with replace to `/login`. Cleanup runs even if a future remote sign-out fails, and repeated clicks are disabled while pending. Protected route guards therefore cannot restore the previous screen, while a later login creates a usable fresh session and cache.

The development and unavailable adapters currently resolve sign-out as deterministic local no-ops. A future backend adapter may perform server-side revocation before the same local cleanup boundary.
