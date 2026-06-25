# AGENTS.md

## Purpose

This file defines the working rules for agents operating inside the InsightDesk repository.

InsightDesk is a pharmacy inventory demo focused on this product loop:

`inventory workflow -> support question -> unresolved issue -> triaged ticket -> repeated friction or product gap -> product improvement`

Agents should preserve that focus and avoid unnecessary scope expansion.

## Core Priorities

When working in this repository:

1. keep the system runnable locally
2. preserve the inventory, support, and bug insights story
3. prefer simple, explainable changes
4. avoid unnecessary feature sprawl

## Bug Fix Mode

If the user says:

```text
Start bug fix mode
```

the agent should follow this flow:

1. Run `npm.cmd run bug:refresh:ps`
2. Read `BUG_REPORTS.md`
3. Find the first routed bug that is still open
4. Fix that bug
5. Verify the affected behavior locally when possible
6. Mark the ticket as fixed only if the issue was actually resolved
7. Stop and ask whether to continue to the next bug

Use this command to mark a resolved bug:

```powershell
npm.cmd run bug:fix:ps -- BUG-ABC123
```

Rules:

- do not silently work through the entire backlog unless the user explicitly asks for that
- do not mark a ticket as `fixed` unless the implementation was actually completed
- if the fix requires a significant product, architecture, database, or workflow change, ask for approval first

## Stability Rules

Do not add these unless explicitly requested:

- authentication
- authorization
- role systems
- email notifications
- advanced analytics
- complex charting
- unrelated infrastructure
- external integrations unrelated to the current task

Do not break or remove these core areas without approval:

- inventory dashboard
- support assistant
- bug insights dashboard
- local knowledge retrieval
- OpenAI fallback behavior
- ticket triage and repeat-detection flow

## Database Rules

- treat the database as the source of truth for tickets
- treat `BUG_REPORTS.md` as a generated routed backlog, not the source of truth
- prefer additive and minimal schema changes
- do not delete useful seed data unless the task requires it

## UI Rules

- keep the product framed as an inventory system
- keep support and bug insights visible as the main differentiators
- prefer clear product wording over technical demo wording

## Documentation Rules

When behavior changes materially, update the relevant file:

- `README.md` for setup or workflow changes
- `DESIGN_OVERVIEW.md` for architecture or product framing changes
- `RAILWAY_DEPLOYMENT.md` for deployment changes

## Local Commands

```powershell
npm.cmd run dev:server:ps
npm.cmd run dev:client:ps
npm.cmd run bug:refresh:ps
npm.cmd run bug:fix:ps -- BUG-ABC123
```

## Done Criteria

A bug-fix task is complete only when:

1. the requested bug was fixed
2. the relevant area still runs or builds
3. documentation was updated if needed
4. the related ticket was marked `fixed` when appropriate
