# Railway Deployment Guide

## Deployment Model

Deploy this repository as one Railway application service plus one Railway PostgreSQL service:

- `app` service for the Express API and exported frontend together
- `postgres` service for the production database

## Before You Deploy

Complete these checks first:

1. Confirm the project builds locally with `npm run build`
2. Confirm the server works with the PostgreSQL-ready Prisma schema
3. Decide whether you want to set `NEXT_PUBLIC_API_URL`
4. Make sure `CLIENT_URL` points to the Railway app URL
5. Add `OPENAI_API_KEY` only if you want OpenAI answers in production

## App Service

Set the Railway root directory to:

```text
.
```

Recommended commands:

- Build command:

```text
npm install
npm run build:railway
```

- Start command:

```text
npm run start:railway
```

- Pre-deploy command:

```text
npm run railway:migrate
```

Required environment variables:

- `DATABASE_URL`
- `OPENAI_API_KEY`
- `CLIENT_URL`
- `PORT`

Notes:

- `OPENAI_API_KEY` is optional if you want the server to rely only on local knowledge fallback
- `CLIENT_URL` should be the same Railway domain served by this app
- `DATABASE_URL` should be added as a Railway reference variable from the PostgreSQL service
- `NEXT_PUBLIC_API_URL` is optional in a single-service deployment because the frontend can call the same origin
- if you set `NEXT_PUBLIC_API_URL`, point it to the same app domain

## PostgreSQL Migration Strategy

Local development uses SQLite.

For Railway, use the PostgreSQL Prisma schema:

- `server/prisma/schema.postgres.prisma`

Before the first production release:

1. Set `DATABASE_URL` from Railway PostgreSQL.
2. Run Prisma generate using the PostgreSQL schema.
3. Run Prisma db push using the PostgreSQL schema.

Recommended commands:

```text
npm run prisma:generate:postgres
npm run prisma:push:postgres
```

For this project, `db push` is the fastest first-deploy path on a fresh Railway PostgreSQL database.

Important:

- do not run `npm run prisma:seed` automatically on each deploy
- the current seed script clears existing tickets and medications before re-inserting demo data
- use the seed script only once on a fresh demo database, or when you intentionally want to reset production demo data

## Frontend / API Linking

Use these values:

- On the app service:
  `CLIENT_URL=https://your-app-service.up.railway.app`
- Optional on the same app service:
  `NEXT_PUBLIC_API_URL=https://your-app-service.up.railway.app`

In this deployment model the frontend and API share the same Railway domain.

## Health Check

The server exposes:

```text
/api/health
```

Use it to confirm the deployed backend is healthy.

Recommended Railway healthcheck:

- app service: `/api/health`

## Important Note

The PostgreSQL schema is prepared for deployment, but local development still uses the SQLite schema for simplicity and faster iteration.
