# Technical Specification — Issue #8

## 1. Issue Overview

| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Title       | Add claude GitHub actions 1782465440197                               |
| Description | Add two Claude-powered GitHub Actions workflows to the repository: a PR/issue assistant triggered by `@claude` mentions, and an automated code review that runs on every pull request. |
| Labels      | None                                                                  |
| State       | Merged (commit `a721a69`, merged Fri 26 Jun 2026)                    |
| Priority    | Medium                                                                |

## 2. Problem Analysis

**Context (verified via `git show a721a69 --stat` and workflow file reads):**

Before this PR the repository had no CI/CD automation. Developers had to manually review PRs and manually invoke Claude for any assistance. Two gaps were identified:

1. **No on-demand AI assistance** — no way to ask Claude to act on an issue or PR from within GitHub itself.
2. **No automated code review** — PRs were merged without a consistent automated quality gate.

Both gaps are addressed by adding `anthropics/claude-code-action@v1` in two separate workflow files.

## 3. Proposed Solution

Add two GitHub Actions workflow files under `.github/workflows/`:

| Workflow file                        | Purpose                                                     |
|--------------------------------------|-------------------------------------------------------------|
| `claude.yml` (Claude Code)           | Trigger Claude on `@claude` mentions in issues / PR comments / reviews |
| `claude-code-review.yml`             | Auto-run a structured code review on every PR open/update  |

Both workflows authenticate via `CLAUDE_CODE_OAUTH_TOKEN` stored as a repository secret.

**Trade-offs:**
- Requires the `CLAUDE_CODE_OAUTH_TOKEN` secret to be configured in repository settings; workflows silently do nothing if the secret is absent.
- `claude-code-review.yml` runs on every PR synchronize event — high-frequency repos may see increased Actions minutes usage.
- `fetch-depth: 1` (shallow clone) is used in both workflows, which is sufficient for the current use cases but would need changing if git history analysis is ever required.

## 4. Step-by-Step Implementation

1. **Create `.github/workflows/claude.yml`** — Configure the `Claude Code` workflow to listen for `issue_comment`, `pull_request_review_comment`, `pull_request_review`, and `issues` events. Add an `if` condition so the job only runs when the event payload contains `@claude`. Use `anthropics/claude-code-action@v1` with `claude_code_oauth_token` and grant `actions: read` for CI result access.

2. **Create `.github/workflows/claude-code-review.yml`** — Configure the `Claude Code Review` workflow to trigger on `pull_request` events (`opened`, `synchronize`, `ready_for_review`, `reopened`). Use `anthropics/claude-code-action@v1` with `track_progress: true`, the `code-review` plugin from `anthropics/claude-code.git`, and a prompt of `/code-review:code-review {repo}/pull/{pr_number}`.

3. **Add repository secret** — Store the Claude OAuth token as `CLAUDE_CODE_OAUTH_TOKEN` in GitHub repository settings → Secrets and variables → Actions.

4. **Verify trigger conditions** — Open a test issue with `@claude` in the body and confirm the `Claude Code` workflow fires. Open a draft PR and mark it ready-for-review to confirm `Claude Code Review` fires.

## 5. Verification Strategy

### Manual Checks

- Create a new issue containing `@claude - do something` → `Claude Code` workflow run appears in the Actions tab and Claude posts a response.
- Open a PR → `Claude Code Review` workflow triggers automatically and Claude posts a review comment on the PR.
- Open a PR **without** `@claude` in any comment → `Claude Code` workflow does NOT trigger (if-condition guard verified).
- Comment `@claude` on a PR review → `Claude Code` workflow fires correctly from `pull_request_review` event.

### Integration Tests

- Confirm `CLAUDE_CODE_OAUTH_TOKEN` secret is present; remove it temporarily → workflow runs but fails gracefully with an authentication error (not a silent pass).
- Confirm `fetch-depth: 1` is sufficient for the code-review plugin (no git history traversal needed).

### Unit Tests

Not applicable — both workflows are GitHub Actions YAML configurations with no testable logic units.

## 6. Files to Modify

None — this PR is purely additive.

## 7. New Files to Create

| File Path                                  | Purpose                                                              |
|--------------------------------------------|----------------------------------------------------------------------|
| `.github/workflows/claude.yml`             | Claude PR/issue assistant; triggers on `@claude` mentions            |
| `.github/workflows/claude-code-review.yml` | Automated code review on every PR open/update via Claude code-review plugin |

## 8. Existing Utilities to Leverage

| Utility / Resource                              | Benefit                                                          |
|-------------------------------------------------|------------------------------------------------------------------|
| `anthropics/claude-code-action@v1`              | Official action — handles auth, Claude invocation, and progress tracking out of the box |
| `actions/checkout@v4`                           | Standard checkout step already in ecosystem; `fetch-depth: 1` keeps CI fast |
| `CLAUDE_CODE_OAUTH_TOKEN` repository secret     | Single secret reused by both workflows                           |
| `code-review` plugin from `anthropics/claude-code.git` | Pre-built review logic; no custom prompt engineering needed |

## 9. Acceptance Criteria

- `@claude` mention in an issue, issue comment, PR review, or PR review comment triggers the `Claude Code` workflow and Claude responds.
- Every PR open/update triggers the `Claude Code Review` workflow and Claude posts an automated review.
- Both workflows use `anthropics/claude-code-action@v1` and authenticate via the `CLAUDE_CODE_OAUTH_TOKEN` secret.
- No existing workflows are broken or duplicated.
- Both workflow files pass GitHub Actions YAML validation (no syntax errors).

## 10. Out of Scope

- Setting up the `CLAUDE_CODE_OAUTH_TOKEN` secret itself (repository admin task, not a code change).
- Restricting the code review workflow to specific file paths (commented-out `paths:` filter exists in the file for future use).
- Filtering `claude-code-review.yml` by PR author or contributor association (commented-out `if:` block exists for future use).
- Adding branch protection rules to require the Claude review to pass before merging.
- Any changes to application source code (`src/`).
