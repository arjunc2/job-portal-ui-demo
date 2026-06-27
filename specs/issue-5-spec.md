# Technical Specification — Issue #5

## 1. Issue Overview

| Field       | Value                                                                              |
|-------------|------------------------------------------------------------------------------------|
| Title       | Inside the footer, when hover onto the "Terms of Service" nothing being displayed  |
| Description | Hovering "Terms of Service" in the footer produced no tooltip popup, unlike the adjacent "Cookie Policy" link which already had one. |
| Labels      | None                                                                               |
| State       | Closed (fixed via PR #6, commit `920c19d`)                                         |
| Priority    | Low                                                                                |

## 2. Problem Analysis

**Root cause (verified via `git show 920c19d`):**

`src/components/Footer.jsx` uses a CSS-only tooltip pattern: an `<a>` wrapper with the Tailwind `group` class contains two child `<div>` elements:

1. A hover-highlight background overlay (`group-hover:opacity-100`).
2. A tooltip popup (`absolute bottom-full ... opacity-0 group-hover:opacity-100`).

At the time of the issue, the "Terms of Service" `<a>` block had the wrapper class and the background overlay `<div>` (item 1) but was **missing the tooltip popup `<div>`** (item 2). Because there was no tooltip element to reveal, hovering produced no visible text.

The other footer links were in varying states of completeness:
- Cookie Policy — tooltip already present (`98b2307`).
- Privacy Policy — tooltip added shortly after (`95472d0`).
- Contact Us — tooltip added last (`5bbbf14`).

No JavaScript state, event handlers, or third-party libraries were involved.

## 3. Proposed Solution

Add the missing tooltip `<div>` inside the existing `<a class="group ...">` wrapper for "Terms of Service", matching the structure and Tailwind classes used by the sibling footer links.

**Minimal change:** 4 lines of JSX inserted at `src/components/Footer.jsx` after the background overlay `<div>`.

**Trade-offs:** None. The fix is purely additive and isolated to a single block in one file.

## 4. Step-by-Step Implementation

1. **Locate the Terms of Service `<a>` block** — `src/components/Footer.jsx` ~line 152. It has the `group relative hover:text-white` wrapper and the `<span>` label but is missing the tooltip `<div>`.
2. **Insert the tooltip `<div>`** — Add immediately after the background overlay `<div>`, using the same classes: `absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-4 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 text-left shadow-xl`.
3. **Add tooltip content** — A bold heading (`<p class="font-semibold text-white mb-2">Terms of Service</p>`) and a descriptive paragraph explaining the usage agreement.
4. **Verify** — Confirm the tooltip appears above the link on hover, centered, and visually consistent with the Privacy Policy and Cookie Policy tooltips.

## 5. Verification Strategy

### Manual Checks

- Hover "Terms of Service" in the footer → tooltip popup appears above the link with descriptive text.
- Hover "Privacy Policy" and "Cookie Policy" → tooltips still render correctly (no regression).
- Resize to mobile viewport (`sm` breakpoint) → tooltip does not overflow or clip.
- Toggle dark mode via ThemeContext → tooltip background (`bg-gray-900`) and text remain readable.

### Unit / Integration Tests

Not applicable — the behaviour is entirely CSS-driven (Tailwind `group-hover` opacity toggle). No logic branch to unit-test. Visual regression tests (e.g., Playwright screenshot diff) would be the appropriate automated coverage if adopted in future.

## 6. Files to Modify

| File Path                   | Nature of Change                                                                 |
|-----------------------------|----------------------------------------------------------------------------------|
| `src/components/Footer.jsx` | Insert 4-line tooltip `<div>` inside the "Terms of Service" `<a>` block (~line 155) |

## 7. New Files to Create

None.

## 8. Existing Utilities to Leverage

| Utility / Pattern                              | Benefit                                                      |
|------------------------------------------------|--------------------------------------------------------------|
| Tailwind `group` / `group-hover:opacity-100`   | Already established by sibling links; no new CSS required    |
| Existing tooltip markup in sibling `<a>` blocks | Direct template — copy, adjust heading and body text only    |

## 9. Acceptance Criteria

- Hovering "Terms of Service" in the footer displays a descriptive tooltip popup.
- Tooltip wording summarises the platform usage agreement (job postings, applications, account responsibilities, right to update terms).
- Visual style (position, width, colours, animation timing) is identical to the Privacy Policy and Cookie Policy tooltips.
- No regressions in the other three footer link tooltips.
- ESLint passes (`npm run lint`).

## 10. Out of Scope

- Linking "Terms of Service" to a dedicated `/terms` page.
- Extracting the tooltip pattern into a shared React component.
- Legalese-accurate Terms of Service copy (mock text is sufficient for this UI demo).
- Automated visual regression tests (no such suite exists in the project currently).
