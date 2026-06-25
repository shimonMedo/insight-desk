# InsightDesk Design Overview

## Purpose

InsightDesk is a full-stack pharmacy inventory demo with built-in support intelligence.

Its main value is not only answering support questions, but learning from unresolved ones and turning repeated friction into product insight.

Core loop:

`inventory workflow -> support question -> unresolved issue -> triaged ticket -> repeated friction or product gap -> product improvement`

## Product Framing

InsightDesk is positioned as an inventory operations platform for pharmacy teams.

The product combines:

- inventory workflows
- AI-assisted support
- structured issue escalation
- an internal bug insights view

This framing keeps the demo grounded in a realistic business workflow while highlighting practical AI and product-thinking capabilities.

## Current Scope

### Inventory Dashboard

The main dashboard provides a lightweight inventory operations view.

Current capabilities:

- view medication records
- remove stock
- add stock
- mark reorder placement for low-stock items

### Support Assistant

The support assistant is available at `/chat`.

Current capabilities:

- answer inventory and workflow questions
- use local knowledge retrieval
- use OpenAI when `OPENAI_API_KEY` is configured
- escalate unresolved issues for follow-up
- keep simple support follow-up separate from product-facing insights

### Bug Insights Dashboard

The internal dashboard is available at `/insights`.

Current capabilities:

- review routed product and workflow issues
- inspect the user question and assistant answer
- view failure analysis and suggested fixes
- update issue status

## System Flow

1. A user works in the inventory dashboard.
2. If help is needed, they open the support assistant.
3. The system answers using local knowledge and OpenAI when available.
4. If the answer does not resolve the task, the issue is escalated.
5. The interaction is stored as a structured ticket and triaged.
6. Only repeated friction or clear product gaps are routed to the bug insights dashboard.
7. The team uses those routed issues to identify product, workflow, and UI improvements.

## Architecture

InsightDesk is organized as a simple client/server monorepo.

### Client

The `client` app uses:

- Next.js
- TypeScript
- Tailwind CSS

Current routes:

- `/`
- `/chat`
- `/insights`

### Server

The `server` app uses:

- Express
- TypeScript
- Prisma

Current responsibilities:

- inventory APIs
- chat APIs
- ticket APIs
- local knowledge retrieval
- OpenAI integration
- ticket analysis

## Data Model

### Medication

- `id`
- `name`
- `sku`
- `category`
- `quantity`
- `reorderThreshold`
- `reorderStatus`
- `createdAt`
- `updatedAt`

### Ticket

- `id`
- `userQuestion`
- `aiAnswer`
- `wasHelpful`
- `failureReason`
- `suggestedFix`
- `fixType`
- `triage`
- `topicKey`
- `repeatCount`
- `routeToInsights`
- `surfaceReason`
- `status`
- `createdAt`
- `updatedAt`

## AI Strategy

The support assistant uses a practical hybrid approach:

- local markdown knowledge files for retrieval context
- OpenAI for enhanced answers and ticket analysis when available
- local fallback behavior when OpenAI is unavailable
- triage logic to separate normal support follow-up from routed product insights

The knowledge base lives under:

```text
server/data/knowledge/
```

This keeps the system simple while still demonstrating a RAG-style workflow.

## Deployment Direction

Local development uses SQLite for speed and simplicity.

Production deployment is prepared for Railway with:

- a separate client service
- a separate server service
- a PostgreSQL instance

PostgreSQL deployment uses:

- `server/prisma/schema.postgres.prisma`
- `npm run prisma:generate:postgres`
- `npm run prisma:push:postgres`

## Intentional Tradeoffs

This project intentionally does not focus on:

- authentication and authorization
- role management
- complex analytics
- enterprise admin tooling
- external business system integrations

That tradeoff keeps the project focused on the most important engineering and product loop:

turning failed support interactions into actionable improvements.
