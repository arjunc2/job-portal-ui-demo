# Bug Investigator Memory Index

- [Auth login comparison operator inversion](bug_auth_login_operator.md) — `!==` used instead of `===` in password check; always verify the comparison operator in `login()` first
- [Auth session wiped on page refresh](bug_auth_session_useeffect_ordering.md) — useEffect ordering destroys authToken on every mount; fixed with isInitialized ref guard in AuthContext
