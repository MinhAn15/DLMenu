<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:session-workflows -->
# Session Workflows

## `/end-session` — Save session context to PROGRESS.md

**Trigger:** User writes `/end-session` or asks to end/save the session.

**Workflow:**
1. Read `PROGRESS.md` to understand the current log structure.
2. Compile a new session entry with these sections:
   - **Summary** — 1-2 sentences describing what was accomplished.
   - **Completed** — Table of done features with details and status.
   - **In Progress** — What is partially done or being worked on.
   - **Pending** — What remains, with priority and reference links.
   - **Files Created** — List of new files (with brief descriptions).
   - **Files Modified** — List of changed files (with what changed).
   - **Key Decisions** — Technical decisions made and their rationale.
   - **Gotchas Discovered** — Reusable mistakes, bugs, or integration lessons found.
   - **Git State** — Branch name, recent commits, any uncommitted changes.
   - **Environment** — Versions of key dependencies (Next.js, Node, etc.).
   - **Next Steps** — Numbered list of immediate next actions.

3. Prepend the new entry to `PROGRESS.md` (newest sessions first).
4. Add discoveries from this session to `docs/gotchas_knowledge_base.md` if they are reusable lessons.
5. Commit `PROGRESS.md` with message: `chore: update session progress log`.
6. Tell user: "Session saved to PROGRESS.md. Git state, decisions, and next steps recorded."
7. Show the user: the commit hash, number of files tracked, and top 3 next steps.

**IMPORTANT:** Do NOT modify AGENTS.md itself. Only update PROGRESS.md and gotchas_knowledge_base.md.

---

## `/resume-session` — Restore session context from PROGRESS.md

**Trigger:** User writes `/resume-session` or asks to resume/continue/load previous work.

**Workflow:**
1. Read `PROGRESS.md` completely.
2. Read `docs/gotchas_knowledge_base.md` to load reusable knowledge.
3. Read AGENTS.md for project-level instructions.
4. Present a structured summary to the user:
   - **Current project state** (from the latest session entry).
   - **In Progress** — What was being worked on when last session ended.
   - **Pending tasks** — Sorted by priority.
   - **Recent gotchas** — Key warnings to avoid repeating mistakes.
   - **Next steps** — From the last session entry.
5. Ask user: "Continue from where we left off, or start something new?"

**IMPORTANT:** After presenting the summary, if user says "continue", automatically pick up the highest-priority In Progress or Pending task and begin working. Do NOT ask permission again.

---

## `/progress` — Quick progress check (no save)

**Trigger:** User writes `/progress` or asks for status overview.

**Workflow:**
1. Read `PROGRESS.md`.
2. Read `git log --oneline -5`.
3. Run `git status --short`.
4. Present a compact table with: Completed (✅), In Progress (🔄), Pending (📋), and the most recent commit, including any uncommitted changes.
5. Do NOT modify any files.
<!-- END:session-workflows -->
