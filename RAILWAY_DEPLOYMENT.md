# Railway Deployment Guide

## Deployment Model

Deploy this repository as two Railway services:

- `client` service for the Next.js frontend
- `server` service for the Express API

Also add one Railway PostgreSQL service for the server database.

## Before You Deploy

Complete these checks first:

1. Confirm the project builds locally with `npm run build`
2. Confirm the server works with the PostgreSQL-ready Prisma schema
3. Make sure `NEXT_PUBLIC_API_URL` points to the Railway server URL
4. Make sure `CLIENT_URL` points to the Railway client URL
5. Add `OPENAI_API_KEY` only if you want OpenAI answers in production

## Server Service

Set the Railway root directory to:

```text
server
```

Recommended commands:

- Build command:

```text
npm install --workspaces=false
npm run prisma:generate:postgres
npm run build
```

- Start command:

```text
npm run start
```

Required environment variables:

- `DATABASE_URL`
- `OPENAI_API_KEY`
- `CLIENT_URL`
- `PORT`

Notes:

- `OPENAI_API_KEY` is optional if you want the server to rely only on local knowledge fallback
- `CLIENT_URL` must exactly match the deployed frontend origin for CORS

## Client Service

Set the Railway root directory to:

```text
client
```

Recommended commands:

- Build command:

```text
npm install --workspaces=false
npm run build
```

- Start command:

```text
npm run start
```

Required environment variables:

- `NEXT_PUBLIC_API_URL`
- `PORT`

Note:

- `NEXT_PUBLIC_API_URL` must point to the deployed Express server, not the client service

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

## Client / Server Linking

Use these values:

- On the client service:
  `NEXT_PUBLIC_API_URL=https://your-server-service.up.railway.app`
- On the server service:
  `CLIENT_URL=https://your-client-service.up.railway.app`

## Health Check

The server exposes:

```text
/api/health
```

Use it to confirm the deployed backend is healthy.

## Important Note

The PostgreSQL schema is prepared for deployment, but local development still uses the SQLite schema for simplicity and faster iteration.
