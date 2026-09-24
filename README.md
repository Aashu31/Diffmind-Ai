# DiffMind AI

### AI-powered code review for GitHub Pull Requests.

DiffMind uses NVIDIA Nemotron 3 Ultra 550B A55B to analyse code changes, reason about potential issues, and publish actionable review feedback directly on GitHub.

[![Build](https://github.com/diffmind-ai/diffmind-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/diffmind-ai/diffmind-ai/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang/)

---

## Why DiffMind?

Code review is important, but it can also become repetitive, time-consuming, and inconsistent.

DiffMind is being built to handle the first layer of review: looking at the changed code, checking for common engineering problems, and pointing out the things worth a second look.

The idea is simple — instead of making developers manually go through every changed line, DiffMind uses Nemotron to find the issues that actually need attention.

---

## How it works

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub
    participant Webhook as Webhook
    participant Agent as DiffMind Agent
    participant Nemotron as Nemotron 3 Ultra
    participant PR as PR Review

    Dev->>GH: Opens Pull Request
    GH->>Webhook: POST /api/webhooks/github
    Webhook->>Agent: Create review job
    Agent->>GH: Fetch PR + diff
    Agent->>Nemotron: Analyse with tools
    Nemotron-->>Agent: Structured findings
    Agent->>Agent: Validate findings
    Agent->>PR: Post inline comments + summary
    Agent->>DB: Persist review
```

---

## What V0 can do

| Feature | Status |
|---------|--------|
| GitHub Pull Request integration | ✅ |
| Automatic review trigger (open/sync/reopen) | ✅ |
| NVIDIA Nemotron 3 Ultra reasoning | ✅ |
| Read-only repository inspection tools | ✅ |
| Structured findings with severity/category | ✅ |
| Confidence scoring & filtering | ✅ |
| Inline GitHub comments | ✅ |
| Review summary on GitHub | ✅ |
| Review history dashboard | ✅ |
| Repository management | ✅ |
| Secure GitHub App authentication | ✅ |
| Webhook signature verification | ✅ |

---

## Tech stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | Fastify, TypeScript, Prisma, PostgreSQL |
| **GitHub** | Octokit, GitHub App, Webhooks |
| **AI** | NVIDIA Nemotron 3 Ultra 550B A55B (via OpenAI-compatible SDK) |
| **Database** | PostgreSQL with Prisma ORM |
| **Auth** | GitHub OAuth, HttpOnly cookies |

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   GitHub    │────▶│   Webhook    │────▶│  Review Job     │
│  (PR Event) │     │  (Fastify)   │     │  (Queue/DB)     │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                   │
                                                   ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   GitHub    │◀────│  Publisher   │◀────│  Review Engine  │
│  (Review)   │     │  (Octokit)   │     │  (Pipeline)     │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                   │
                    ┌──────────────────────────────┼──────────────────────────────┐
                    ▼                              ▼                              ▼
            ┌───────────────┐              ┌───────────────┐              ┌───────────────┐
            │  Diff Parser  │              │  Nemotron     │              │  Validation   │
            │  (Files/Hunks)│              │  3 Ultra      │              │  (Zod + Logic)│
            └───────────────┘              └───────────────┘              └───────────────┘
```

### Core components

| Component | Responsibility |
|-----------|----------------|
| `NemotronProvider` | OpenAI SDK wrapper, streaming, reasoning/content separation |
| `DiffMindReviewAgent` | Review reasoning, tool selection, workflow orchestration |
| `AgentLoop` | Safe tool-calling loop with step limit |
| `DiffParser` | Unified diff → structured files/hunks/lines |
| `FileFilter` | Excludes generated/binary/irrelevant files |
| `ContextBuilder` | Builds typed review context for the agent |
| `ReviewEngine` | End-to-end pipeline orchestration |
| `GitHubReviewPublisher` | Creates reviews + inline comments on GitHub |
| `FindingValidation` | Schema, location, confidence, deduplication |

---

## Nemotron integration

Nemotron is the reasoning engine behind DiffMind.

The application does not simply send the PR diff to a model and copy the answer back. V0 has a controlled review agent around the model, with read-only tools for fetching additional repository context when needed.

### Model configuration

```env
NVIDIA_API_KEY=your_key_here
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=nvidia/nemotron-3-ultra-550b-a55b

NVIDIA_TEMPERATURE=1
NVIDIA_TOP_P=0.95
NVIDIA_MAX_TOKENS=16384
NVIDIA_TIMEOUT_MS=180000

NVIDIA_REASONING_EFFORT=high
NVIDIA_REASONING_BUDGET=12000
```

### Agent tools (read-only)

| Tool | Purpose |
|------|---------|
| `get_pull_request` | PR metadata (title, body, author, branches) |
| `get_changed_files` | List all changed files with stats |
| `get_file_content` | Full file content at base or head SHA |
| `get_diff` | Diff/patch for a specific file |
| `get_repository_metadata` | Repository info (languages, default branch) |

**Hard limit:** `DIFFMIND_MAX_AGENT_STEPS=6` — prevents infinite tool loops.

### Output schema

```json
{
  "summary": "The Pull Request introduces one security issue and two reliability concerns.",
  "overall_assessment": "needs_attention",
  "findings": [
    {
      "file": "src/auth.ts",
      "line": 42,
      "side": "RIGHT",
      "severity": "high",
      "category": "security",
      "title": "Authorization check occurs too late",
      "description": "The resource is accessed before authorization is verified.",
      "recommendation": "Perform the authorization check before accessing the resource.",
      "confidence": 0.94
    }
  ]
}
```

Validated with Zod. Only findings with `confidence ≥ 0.75` become inline comments.

---

## GitHub setup

### 1. Create a GitHub App

1. Go to **Settings → Developer settings → GitHub Apps → New GitHub App**
2. **App name:** `DiffMind AI` (or your preferred name)
3. **Homepage URL:** `https://your-domain.com`
4. **Webhook URL:** `https://your-domain.com/api/webhooks/github`
5. **Webhook secret:** Generate a strong secret (save for `.env`)
6. **Permissions:**
   - **Repository permissions:**
     - Contents: Read
     - Pull requests: Read & Write
     - Metadata: Read
   - **Organization permissions:** None required
   - **Subscribe to events:**
     - Pull request (opened, synchronize, reopened)
7. **Where can this GitHub App be installed?** Any account (or your org)
8. Create the app, then generate a **Private Key** (save for `.env`)

### 2. Configure environment variables

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/diffmind?schema=public"

# GitHub App
GITHUB_APP_ID="123456"
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET="your_webhook_secret_here"
GITHUB_CLIENT_ID="your_oauth_client_id"
GITHUB_CLIENT_SECRET="your_oauth_client_secret"

# Application
APP_URL="http://localhost:3000"
API_URL="http://localhost:4000"
SESSION_SECRET="your_32_char_min_session_secret"

# NVIDIA Nemotron
NVIDIA_API_KEY="your_nvidia_api_key"
NVIDIA_BASE_URL="https://integrate.api.nvidia.com/v1"
NVIDIA_MODEL="nvidia/nemotron-3-ultra-550b-a55b"
NVIDIA_TEMPERATURE=1
NVIDIA_TOP_P=0.95
NVIDIA_MAX_TOKENS=16384
NVIDIA_TIMEOUT_MS=180000
NVIDIA_REASONING_EFFORT="high"
NVIDIA_REASONING_BUDGET=12000

# DiffMind Agent
DIFFMIND_MAX_AGENT_STEPS=6
DIFFMIND_MIN_CONFIDENCE=0.75
DIFFMIND_MAX_FINDINGS=15

# Logging
LOG_LEVEL="info"
```

### 3. Install the App

1. Go to your GitHub App's page → **Install App**
2. Select your account/org and repositories
3. Save installation

### 4. Start the backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

Backend runs on `http://localhost:4000`.

### 5. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

### 6. Test with a Pull Request

1. Open a PR in a repository where the App is installed
2. DiffMind will automatically trigger a review
3. Check the PR on GitHub — you'll see a review from DiffMind AI
4. View the review in the dashboard at `http://localhost:3000/dashboard`

---

## Local setup

```bash
# Clone the repo
git clone https://github.com/diffmind-ai/diffmind-ai.git
cd diffmind-ai

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Start PostgreSQL (if not running)
# docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=diffmind postgres:16

# Database setup
cd backend
npx prisma generate
npx prisma migrate dev

# Start development servers (from root)
npm run dev
```

This starts both backend (`:4000`) and frontend (`:3000`) concurrently.

---

## Testing

```bash
# Backend tests
cd backend
npm run test          # Unit + integration tests
npm run test:watch    # Watch mode

# Frontend tests
cd frontend
npm run test          # Component tests
npm run test:watch    # Watch mode

# All tests
npm run test          # From root (runs both)
```

### Test Nemotron connection

```bash
npx tsx scripts/test-nemotron.ts
```

This verifies:
- NVIDIA API key validity
- Streaming chat completions
- Reasoning/content separation
- Tool calling capability

---

## Project structure

```
diffmind-ai/
├── backend/
│   ├── src/
│   │   ├── ai/
│   │   │   ├── providers/NemotronProvider.ts
│   │   │   ├── agent/DiffMindReviewAgent.ts
│   │   │   ├── agent/AgentLoop.ts
│   │   │   └── prompts/review-system-prompt.ts
│   │   ├── github/
│   │   │   ├── webhooks/handler.ts
│   │   │   ├── services/github.ts
│   │   │   └── auth/
│   │   ├── review/
│   │   │   ├── engine/ReviewEngine.ts
│   │   │   ├── parser/diff.ts
│   │   │   ├── parser/file-filter.ts
│   │   │   ├── context/builder.ts
│   │   │   ├── validation/findings.ts
│   │   │   └── publisher/github.ts
│   │   ├── db/client.ts
│   │   ├── config/index.ts
│   │   ├── types/index.ts
│   │   └── index.ts (Fastify server)
│   ├── prisma/schema.prisma
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx (landing)
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── repositories/
│   │   │   ├── reviews/
│   │   │   ├── settings/page.tsx
│   │   │   ├── auth/
│   │   │   └── api/
│   │   ├── components/
│   │   │   ├── ui/ (shadcn/ui components)
│   │   │   ├── review/
│   │   │   └── dashboard/
│   │   ├── lib/api.ts, utils.ts
│   │   └── hooks/
│   └── public/
├── scripts/test-nemotron.ts
├── docs/
│   ├── architecture.md
│   ├── github-app-setup.md
│   ├── ai-agent.md
│   └── development.md
└── package.json (workspace root)
```

---

## Current V0 limitations

V0 is intentionally limited.

- It does not generate fixes, create commits, modify repositories, or act as an autonomous coding agent yet.
- Reviews are triggered only on PR open/sync/reopen — no manual trigger from dashboard yet.
- No repository-wide analysis or cross-PR context.
- No team/organization-level settings — only global defaults.
- Nemotron reasoning content is not exposed to users (by design).

---

## Roadmap

| Version | Focus |
|---------|-------|
| **V0** | Foundation + working PR reviewer |
| **V1** | Better review workflow (manual trigger, review threads, dismiss) |
| **V2** | Advanced code intelligence (call graphs, type-aware analysis) |
| **V3** | Repository intelligence (patterns, hotspots, ownership) |
| **V4** | Team/enterprise platform (RBAC, policies, audit logs) |
| **V5** | Autonomous remediation (fix generation, auto-PR) |

---

## Contributing

This is a V0 project — the codebase is still stabilising. If you're interested in contributing, feel free to open an issue or PR.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

*DiffMind AI*