---
name: bug_auth_login_operator
description: AuthContext login() used !== instead of === for password comparison, causing every valid credential to be rejected with "Invalid email or password"
metadata:
  type: project
---

In `src/context/AuthContext.jsx`, the `login()` function's `Array.find()` predicate used `u.password !== password` (inverted operator) instead of `u.password === password`. This caused `foundUser` to be the first user whose password did NOT match the submitted one, meaning valid credentials always returned `null`/the wrong user, and the intended match was always treated as a miss.

**Why:** Likely a typo during authoring — `!==` instead of `===` in a multi-condition predicate is easy to miss because the email condition (`u.email === email`) is correct, making the line look superficially valid.

**How to apply:** When debugging any "invalid credentials" complaint in this app, check `src/context/AuthContext.jsx` line ~180 (`searchPool.find(...)`) first — verify both the email AND password comparison operators are `===`, not `!==`.

Related: [[dummy_users_credentials]]
