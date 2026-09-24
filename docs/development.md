# Development Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- pnpm or npm
- GitHub account for App creation

## Quick start

```bash
# Clone and install
git clone https://github.com/diffmind-ai/diffmind-ai.git
cd diffmind-ai
npm install

# Environment
cp .env.example .env
# Edit .env with your values

# Database
# Option 1: Local PostgreSQL
createdb diffmind
# Option 2: Docker
docker run -d --name diffmind-db \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=diffmind \
  postgres:16

# Prisma
cd backend
npx prisma generate
npx prisma migrate dev

# Start dev servers (from root)
npm run dev
```

## Project structure

```
diffmind-ai/
├── package.json           # Workspace root
├── .env.example           # Environment template
├── README.md
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── index.ts       # Fastify server entry
│   │   ├── config/        # Zod-validated env
│   │   ├── db/            # Prisma client
│   │   ├── types/         # Shared TypeScript types
│   │   ├── ai/            # Nemotron provider + agent
│   │   ├── github/        # Octokit, webhooks, auth
│   │   └── review/        # Pipeline, parser, validation, publisher
│   ├── tests/             # Vitest unit/integration tests
│   └── vitest.config.ts
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components (UI + feature)
│   │   ├── lib/           # API client, utilities
│   │   └── hooks/         # Custom React hooks
│   └── vitest.config.ts
├── scripts/
│   └── test-nemotron.ts   # Manual Nemotron connectivity test
└── docs/                  # Architecture, setup, agent docs
```

## Running commands

### From workspace root

```bash
npm run dev           # Start backend + frontend (concurrently)
npm run build         # Build both packages
npm run test          # Run all tests
npm run lint          # Lint both packages
npm run typecheck     # TypeScript check both packages
npm run db:generate   # Prisma generate
npm run db:push       # Prisma db push
npm run db:migrate    # Prisma migrate dev
npm run db:studio     # Prisma Studio
```

### Backend only

```bash
cd backend
npm run dev           # tsx watch src/index.ts
npm run build         # tsc
npm run start         # node dist/index.js
npm run test          # vitest run
npm run test:watch    # vitest
npm run lint          # eslint src --ext .ts
npm run typecheck     # tsc --noEmit
```

### Frontend only

```bash
cd frontend
npm run dev           # next dev -p 3000
npm run build         # next build
npm run start         # next start
npm run test          # vitest run
npm run test:watch    # vitest
npm run lint          # next lint
npm run typecheck     # tsc --noEmit
```

## Database workflow

### Development

```bash
cd backend

# After schema changes
npx prisma migrate dev --name descriptive_name

# Reset database (dev only)
npx prisma migrate reset

# View database
npx prisma studio
```

### Production

```bash
cd backend
npx prisma migrate deploy
```

## Git workflow

### Branching

- `main` — production-ready
- `feature/*` — new features
- `fix/*` — bug fixes
- `docs/*` — documentation updates

### Commits

Conventional commits:
```
feat: add finding deduplication
fix: handle binary file diffs
docs: update architecture diagram
refactor: simplify agent loop
test: add diff parser unit tests
```

### PR process

1. Create feature branch from `main`
2. Implement changes with tests
3. Run `npm run lint && npm run typecheck && npm run test`
4. Open PR with description
5. CI must pass
6. Squash merge to `main`

## Testing strategy

### Unit tests (backend)

Location: `backend/tests/`
- Diff parser
- File filter
- Finding validation
- Environment config

```bash
cd backend
npm run test
```

### Integration tests (backend)

Location: `backend/tests/integration.test.ts`
- Agent loop with mocked provider
- Prompt injection scenarios
- Error handling paths

### Component tests (frontend)

Location: `frontend/src/**/*.test.tsx`
- Utility functions
- Component rendering

```bash
cd frontend
npm run test
```

### Manual testing

```bash
# Test Nemotron connection
npx tsx scripts/test-nemotron.ts

# Test webhook locally
ngrok http 4000
# Update GitHub App webhook URL
# Open a test PR
```

## Debugging

### Backend logs

Structured JSON logs with `pino`. In development, pretty-printed via `pino-pretty`.

Key log fields:
```json
{
  "reviewId": "uuid",
  "jobId": "uuid",
  "repositoryId": "uuid",
  "pullRequestNumber": 42,
  "headSha": "abc123",
  "agentStep": 1,
  "toolName": "get_file_content",
  "duration": 245,
  "status": "success"
}
```

### Frontend debugging

- React DevTools
- Next.js dev overlay
- Network tab for API calls
- Console for React Query cache

### Common issues

| Issue | Solution |
|-------|----------|
| Prisma client not generated | Run `npx prisma generate` |
| Database connection refused | Check PostgreSQL is running, `DATABASE_URL` correct |
| Webhook not received | Check ngrok, GitHub App webhook URL |
| "Invalid signature" | `GITHUB_WEBHOOK_SECRET` mismatch |
| NVIDIA 401 | Invalid/expired `NVIDIA_API_KEY` |
| Session lost | Check `SESSION_SECRET`, cookie settings |
| Frontend API 401 | Ensure backend running, cookies enabled |

## Code style

### TypeScript

- Strict mode enabled
- No `any` (use `unknown` or proper types)
- Zod for runtime validation
- Explicit return types for public APIs

### React

- Functional components with hooks
- Server Components by default, `'use client'` when needed
- Tailwind for styling
- shadcn/ui for base components

### Backend

- Fastify plugins for encapsulation
- Dependency injection via constructor
- Async/await throughout
- Early returns, avoid nesting

## Adding a new tool

1. Add tool schema to `ai/prompts/review-system-prompt.ts`
2. Add executor case in `DiffMindReviewAgent.executeTool()`
3. Add GitHub API method in `github/services/github.ts` if needed
4. Test with `scripts/test-nemotron.ts` or unit test

## Adding a new finding category/severity

1. Update Prisma enum in `prisma/schema.prisma`
2. Update Zod schema in `review/validation/findings.ts`
3. Update TypeScript types in `types/index.ts`
4. Update UI colors in `frontend/src/lib/utils.ts`
5. Run `npx prisma migrate dev`

## Environment variables

All validated at startup via Zod in `backend/src/config/index.ts`.

Required:
- `DATABASE_URL`
- `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_WEBHOOK_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- `APP_URL`, `API_URL`, `SESSION_SECRET`
- `NVIDIA_API_KEY`

Optional (with defaults):
- `NVIDIA_BASE_URL`, `NVIDIA_MODEL`
- `NVIDIA_TEMPERATURE`, `NVIDIA_TOP_P`, `NVIDIA_MAX_TOKENS`
- `NVIDIA_TIMEOUT_MS`, `NVIDIA_REASONING_EFFORT`, `NVIDIA_REASONING_BUDGET`
- `DIFFMIND_MAX_AGENT_STEPS`, `DIFFMIND_MIN_CONFIDENCE`, `DIFFMIND_MAX_FINDINGS`
- `LOG_LEVEL`

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):

```yaml
- Install dependencies
- Generate Prisma client
- Run lint
- Run typecheck
- Run tests
- Build backend
- Build frontend
```

## Useful scripts

```bash
# Reset everything
rm -rf node_modules backend/node_modules frontend/node_modules
npm install

# Fresh database
cd backend && npx prisma migrate reset --force

# Check for outdated packages
npm outdated

# Generate Prisma client after schema change
cd backend && npx prisma generate
```

## VS Code setup

Recommended extensions:
- TypeScript Hero
- Prisma
- Tailwind CSS IntelliSense
- ESLint
- GitHub Actions

Settings (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```