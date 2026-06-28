---
name: bug_auth_session_useeffect_ordering
description: AuthContext useEffect ordering destroys localStorage session on every page refresh — authToken is wiped before the load-from-storage effect runs
metadata:
  type: project
---

In `src/context/AuthContext.jsx`, two `useEffect` hooks run after the first render in declaration order:

1. **Effect 1** (`[]` dep): reads `jobPortalUser` + `authToken` from localStorage, calls `setUser(parsedUser)`
2. **Effect 2** (`[user]` dep): when `user === null`, removes both `jobPortalUser` and `authToken`

On initial mount, `user` is `null`. React runs Effect 1 then Effect 2 in order after the same render. Effect 1's `setUser` is enqueued but has not yet re-rendered when Effect 2 fires — so Effect 2 sees `user === null` and clears localStorage, including `authToken`. On the next page load, `authToken` is gone and the `if (savedUser && savedToken)` guard in Effect 1 fails, so the session is lost.

**Why:** Classic React effect ordering pitfall — the `[user]` effect fires on the initial render with the initial `null` state before the load effect's `setState` produces a re-render with the restored user.

**Fix applied:** Added `isInitialized` ref (initialized to `false`). Effect 1 sets `isInitialized.current = true` when done. Effect 2 returns early if `!isInitialized.current`, preventing it from wiping localStorage before the hydration effect completes.

**How to apply:** Whenever a `[someState]` effect has a null-guard that deletes localStorage data, check whether that effect could fire on the initial render before a companion mount effect has set the state. Always use a ref to gate the save/clear effect until initialization is confirmed.

Related: [[bug_auth_login_operator]]
