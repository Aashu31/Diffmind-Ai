# Architecture

## Overview

DiffMind AI follows a clean architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Fastify Server                           │
├─────────────────────────────────────────────────────────────────┤
│  /api/webhooks/github  │  /api/* (REST)  │  /auth/* (OAuth)    │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  GitHub       │    │  Review       │    │  Auth         │
│  Integration  │    │  Engine       │    │  Service      │
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │
        ▼                     ▼
┌───────────────┐    ┌───────────────┐
│  Octokit      │    │  AI Agent     │
│  (REST API)   │    │  (Nemotron)   │
└───────────────┘    └───────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │  Validation &     │
                    │  Persistence      │
                    └───────────────────┘
```

## Module boundaries

### `github/` — GitHub integration
- `services/github.ts` — Octokit wrapper, typed API calls
- `webhooks/handler.ts` — Webhook verification, event routing
- `auth/` — GitHub OAuth, installation management

### `ai/` — AI provider & agent
- `providers/NemotronProvider.ts` — OpenAI SDK wrapper, streaming
- `agent/DiffMindReviewAgent.ts` — Review workflow, tool definitions
- `agent/AgentLoop.ts` — Safe tool-calling loop
- `prompts/review-system-prompt.ts` — System prompt, tool schemas

### `review/` — Review pipeline
- `engine/ReviewEngine.ts` — End-to-end orchestration
- `parser/diff.ts` — Unified diff parsing
- `parser/file-filter.ts` — Exclusion/truncation logic
- `context/builder.ts` — Context construction for agent
- `validation/findings.ts` — Zod schema + location/confidence checks
- `publisher/github.ts` — GitHub review/comment creation

### `db/` — Database
- `client.ts` — Prisma singleton

### `config/` — Environment
- `index.ts` — Zod-validated config

## Data flow

```
Webhook (PR opened)
    │
    ▼
Verify signature → Parse payload
    │
    ▼
Upsert Installation → Repository → PullRequest
    │
    ▼
Create ReviewJob (deduped by installation+repo+pr+headSha)
    │
    ▼
ReviewEngine.execute(job)
    │
    ├─▶ GitHub: fetch PR, files, diff
    │
    ├─▶ DiffParser.parse(rawDiff)
    │
    ├─▶ FileFilter.filter(parsed)
    │
    ├─▶ ContextBuilder.build({ repo, pr, diff })
    │
    ├─▶ DiffMindReviewAgent.review(context)
    │       │
    │       ├─▶ NemotronProvider.chat() × N
    │       │       │
    │       │       └─▶ Tool calls → GitHub API (read-only)
    │       │
    │       └─▶ Structured JSON output
    │
    ├─▶ FindingValidation.validate(findings, diff)
    │
    ├─▶ GitHubReviewPublisher.publish(summary, findings)
    │
    └─▶ Prisma: persist Review + Findings
```

## Security boundaries

| Boundary | Protection |
|----------|------------|
| Webhook → Backend | HMAC-SHA256 signature verification |
| Backend → GitHub | GitHub App installation tokens (short-lived) |
| Backend → NVIDIA | API key in env, never exposed to frontend |
| Frontend → Backend | HttpOnly cookies, CSRF-protected |
| Agent → Repository | Read-only tools, no shell/exec/network |
| Model → Output | Reasoning stripped, structured JSON only |

## Concurrency model

- Webhook handler returns `202 Accepted` immediately
- Review job runs asynchronously (fire-and-forget)
- Duplicate webhooks for same PR+SHA are deduplicated at DB level
- Multiple jobs for different PRs run in parallel
- Prisma connection pool handles DB concurrency

## Error handling strategy

| Error type | Handling |
|------------|----------|
| GitHub API 401/403 | Mark job FAILED, log, don't retry |
| GitHub rate limit | Exponential backoff, max 3 retries |
| NVIDIA 401/403 | Mark job FAILED, alert |
| NVIDIA rate limit | Backoff, max 3 retries |
| NVIDIA timeout | Mark job FAILED |
| Stream interruption | Treat as failure, mark job FAILED |
| Malformed AI output | Validation catches, fallback to empty findings |
| DB failure | Mark job FAILED, retry on next webhook |
| Invalid finding location | Move to summary, don't create fake inline |

## Deployment considerations

- **Stateless backend** — can run multiple replicas
- **PostgreSQL** — single primary, read replicas optional
- **Webhook URL** — must be accessible from GitHub (use ngrok for local dev)
- **Session secret** — 32+ chars, rotate periodically
- **NVIDIA API key** — rotate per NVIDIA policy
- **GitHub App private key** — store securely, never commit

## Observability

Structured logs with:
- `reviewId`, `jobId`, `repositoryId`, `pullRequestNumber`, `headSha`
- `agentStep`, `toolName`, `duration`, `status`
- Events: `webhook.received`, `review.job.created`, `agent.started`, `nemotron.request.completed`, `findings.validated`, `github.review.published`, `review.completed/failed`

No secrets in logs.