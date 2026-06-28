---
name: dummy_users_credentials
description: Valid demo credentials for all three roles, defined in DUMMY_USERS inside AuthContext.jsx (not in mockData.js)
metadata:
  type: project
---

Demo credentials are defined in the `DUMMY_USERS` constant inside `src/context/AuthContext.jsx` (NOT in `src/data/mockData.js`). mockData.js contains only job/company seed data with no user login records.

| Role            | Email                  | Password      |
| --------------- | ---------------------- | ------------- |
| ROLE_EMPLOYER   | employer@company.com   | employer123   |
| ROLE_EMPLOYER   | hr@startup.com         | hr123         |
| ROLE_JOB_SEEKER | jobseeker@email.com    | jobseeker123  |
| ROLE_JOB_SEEKER | candidate@email.com    | candidate123  |
| ROLE_ADMIN      | admin@portal.com       | admin123      |

Additionally, users registered at runtime are stored under the `registeredUsers` localStorage key and are included in the login search pool.

**Why:** Knowing where credentials live prevents wasted time searching mockData.js when auth issues arise.

**How to apply:** When a user asks "what credentials work?" or "where are users stored?", go directly to `DUMMY_USERS` in `AuthContext.jsx` and the `registeredUsers` localStorage key.

Related: [[bug_auth_login_operator]]
