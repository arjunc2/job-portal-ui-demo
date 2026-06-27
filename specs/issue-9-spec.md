# Technical Specification — Issue #9

## 1. Issue Overview

| Field       | Value                                                                          |
|-------------|--------------------------------------------------------------------------------|
| Title       | Inside the footer, when user hovers on "Contact Us" no text being displayed    |
| Description | The "Contact Us" footer link had no hover tooltip, unlike the other three footer links (Privacy Policy, Terms of Service, Cookie Policy) which all showed descriptive popups on hover. |
| Labels      | None                                                                           |
| State       | Closed (fixed)                                                                 |
| Priority    | Low                                                                            |

## 2. Problem Analysis

**Root cause (verified):** `src/components/Footer.jsx` implements a tooltip pattern for footer links using CSS-only `group-hover` visibility toggling. The three static links — Privacy Policy, Terms of Service, and Cookie Policy — each had the full tooltip `<div>` inside their `<a>` wrappers. The "Contact Us" `<Link>` element was rendered using the same wrapper class but was missing the inner tooltip `<div>`, so hovering over it produced no popup text.

No JavaScript state, event handlers, or third-party tooltip library was involved — the entire mechanic relies on Tailwind's `group` / `group-hover:opacity-100` pattern already established in the file.

## 3. Proposed Solution

Add the missing tooltip `<div>` inside the existing `<Link to="/contact">` wrapper, matching the structure and styling of the three sibling footer links. No new components, hooks, or patterns are required.

**Trade-offs:** None significant. The fix is a pure HTML/Tailwind additive change with zero risk of regression.

## 4. Step-by-Step Implementation

1. **Locate the Contact Us `<Link>` block** — `src/components/Footer.jsx` around line 168; it already has the `group relative hover:text-white` wrapper and the `<span>` label but lacks the tooltip `<div>`.
2. **Add the tooltip `<div>`** — Insert immediately after the `<span>` label, using the same `absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 ...` classes used by the sibling links. Give it a heading of "Contact Us" and a descriptive body message.
3. **Verify visual consistency** — Confirm tooltip appears above the link on hover, centered, matching the style of Privacy Policy / Terms of Service / Cookie Policy tooltips.

## 5. Verification Strategy

### Manual Checks

- Hover "Contact Us" in the footer → tooltip popup appears above the link with descriptive text.
- Hover "Privacy Policy", "Terms of Service", "Cookie Policy" → tooltips still appear correctly (no regression).
- On mobile viewports the tooltip renders without overflow clipping (visual check at `sm` breakpoint).
- Dark mode (via ThemeContext toggle) → tooltip background and text remain readable.

### Unit / Integration Tests

No automated tests are applicable here — the behaviour is purely CSS-driven (Tailwind `group-hover` opacity toggle). Visual regression testing (e.g., Playwright screenshot diff) would be the appropriate automated coverage if the project adopts it in future.

## 6. Files to Modify

| File Path                    | Nature of Change                                              |
|------------------------------|---------------------------------------------------------------|
| `src/components/Footer.jsx`  | Add tooltip `<div>` inside the existing `<Link to="/contact">` block (additive, ~8 lines) |

## 7. New Files to Create

None.

## 8. Existing Utilities to Leverage

| Utility / Pattern                         | Benefit                                                        |
|-------------------------------------------|----------------------------------------------------------------|
| Tailwind `group` / `group-hover:opacity-100` | Already used by sibling links; no new CSS needed              |
| Existing tooltip `<div>` markup in Footer | Copy-paste-and-customise — keeps styling 100 % consistent      |

## 9. Acceptance Criteria

- Hovering "Contact Us" in the footer displays a descriptive tooltip popup.
- Tooltip wording clearly communicates that users can reach the support/admin team via the Contact page.
- Visual style (position, size, colours, animation) matches the Privacy Policy, Terms of Service, and Cookie Policy tooltips exactly.
- No regressions in the other three footer link tooltips.
- ESLint passes (`npm run lint`).

## 10. Out of Scope

- Adding a real contact-form backend or email service.
- Changing the routing destination of the "Contact Us" link.
- Refactoring the tooltip pattern into a shared React component (useful if more links are added, but not required for this fix).
- Automated visual regression tests (no such suite exists in the project currently).
