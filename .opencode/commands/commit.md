---
description: Review changes, stage files, and commit with CI/CD rules
agent: general
---

Stage all working-tree changes, review with code-reviewer, then commit.

### Rules
- `git add .` — ALWAYS. Never selective staging.
- Exclude from commit:
  - `.env`, `.env.local`, `*.pem`, `*.key` (secrets)
  - `node_modules/`, build output (`.next/`, `dist/`, `out/`)
  - `.opencode/tasks/` and `.opencode/docs/*.md` — UNLESS this is a documentation update (then include them)
- Run a code review first using the code-reviewer subagent. If any Critical issue found, stop and report them. Otherwise proceed.
- Commit message format: `type(scope): short description`
  - Type: `feat` / `fix` / `refactor` / `chore` / `docs`
  - Scope: the module or area changed
  - Body only when the "why" isn't obvious from the subject
  - Max subject length: 50 chars
- Never commit: secrets, credentials, sensitive data, build artifacts.
- After commit, verify working tree is clean (only excluded files remain untracked).
