# InsightDesk

InsightDesk is a full-stack pharmacy inventory demo focused on one core idea:

turning repeated support friction into actionable product and bug insights.

The project combines:

- an inventory operations dashboard
- an AI support assistant
- an internal bug insights dashboard

Not every failed support answer becomes a bug insight. Tickets are triaged first, and only repeated issues or clear product gaps are promoted to the insights backlog.

## Quick Start

Install dependencies:

```powershell
npm.cmd install
```

Start the server:

```powershell
npm.cmd run dev:server:ps
```

Start the client in a second terminal:

```powershell
npm.cmd run dev:client:ps
```

Local URLs:

- client: `http://localhost:3000`
- server: `http://localhost:3002`
- health check: `http://localhost:3002/api/health`
- support assistant: `http://localhost:3000/chat`
- bug insights: `http://localhost:3000/insights`

## Environment Setup

Server values live in `server/.env`.

Example:

```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="sk-..."
PORT=3002
CLIENT_URL="http://localhost:3000"
```

Client values can live in `client/.env.local`.

Example:

```env
NEXT_PUBLIC_API_URL="http://localhost:3002"
```

OpenAI is optional for local development. If `OPENAI_API_KEY` is missing, the app still works with local knowledge fallback.

If you want to verify the OpenAI key:

```powershell
npm.cmd --workspace server run openai:check
```

## Database Setup

Because this workspace uses a Windows path with Hebrew characters, Prisma works more reliably through the included helper:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\Use-InsightDeskDevPath.ps1
```

Then run:

```powershell
Set-Location "$env:TEMP\insight-desk-root\server"
npm.cmd run prisma:migrate -- --name init_ticket
npm.cmd run prisma:seed
```

## Bug Fix Mode

Use this trigger phrase when you want the agent to run the standard bug-fixing flow:

```text
Start bug fix mode
```

The intended flow is:

1. Run `npm.cmd run bug:refresh:ps`
2. Read `BUG_REPORTS.md`
3. Start from the first open routed bug
4. Fix it
5. Mark it as fixed only if the fix was actually completed
6. Ask whether to continue to the next bug

Useful commands:

```powershell
npm.cmd run bug:refresh:ps
npm.cmd run bug:fix:ps -- BUG-ABC123
```

Guardrails:

- significant architecture, database, or workflow changes require approval first
- bugs should be handled incrementally, one open routed item at a time
- a bug should not be marked as fixed unless the implementation was actually completed

## What This Project Shows

- full-stack client and server separation
- database-backed workflows
- practical OpenAI and RAG-style support behavior
- ticket triage that separates support follow-up from real product issues
- product thinking around support-driven bug discovery
- deployment readiness for Railway

Core loop:

`inventory workflow -> support question -> unresolved issue -> triaged ticket -> repeated friction or product gap -> product improvement`

## Stack

- `client`: Next.js, TypeScript, Tailwind CSS
- `server`: Express, TypeScript, Prisma
- `database`: SQLite locally, PostgreSQL for Railway
- `AI`: OpenAI with local knowledge fallback

## Deployment Notes

Railway is expected to host:

- one `client` service
- one `server` service
- one PostgreSQL service

Deployment details are in `RAILWAY_DEPLOYMENT.md`.

## Publish Checklist

Before pushing this project to GitHub:

- make sure `server/.env` is not committed
- keep `client/.next`, `server/dist`, and `node_modules` out of the repository
- run `npm.cmd run build` to confirm both apps still compile
- run `npm.cmd run bug:refresh:ps` if you want `BUG_REPORTS.md` to reflect the latest routed backlog
- verify that `README.md`, `DESIGN_OVERVIEW.md`, and `RAILWAY_DEPLOYMENT.md` match the current behavior

## Project Notes

- `AGENTS.md` defines the repository workflow for agent-driven bug fixing
- `DESIGN_OVERVIEW.md` describes the product framing and system decisions
- `BUG_REPORTS.md` is the generated routed engineering backlog

## Intentional Scope

This project intentionally does not focus on:

- authentication and authorization
- role management
- advanced analytics
- enterprise admin tooling

That tradeoff keeps the demo focused on the support-to-insight workflow rather than platform overhead.
