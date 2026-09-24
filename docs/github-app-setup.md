# GitHub App Setup Guide

This guide walks you through creating and configuring a GitHub App for DiffMind AI.

## Prerequisites

- GitHub account with admin access to target repositories/organizations
- A domain or ngrok tunnel for webhook delivery (for local development)

## Step 1: Create the GitHub App

1. Navigate to **Settings → Developer settings → GitHub Apps**
   - For personal account: `https://github.com/settings/apps`
   - For organization: `https://github.com/organizations/{org}/settings/apps`

2. Click **New GitHub App**

3. **General settings:**
   ```
   GitHub App name: DiffMind AI (or your preferred name)
   Homepage URL: https://your-domain.com
   Description: AI-powered code review for GitHub Pull Requests
   ```

4. **Webhook:**
   ```
   Webhook URL: https://your-domain.com/api/webhooks/github
   Webhook secret: [Generate a strong random string, save for .env]
   Active: ✓
   ```

5. **Repository permissions:**
   | Permission | Access |
   |------------|--------|
   | Contents | Read-only |
   | Pull requests | Read & Write |
   | Metadata | Read-only |

6. **Organization permissions:** None required

7. **Subscribe to events:**
   - ✓ Pull request (select: opened, synchronize, reopened)

8. **Where can this GitHub App be installed?**
   - Any account (recommended for testing)
   - Or: Only on this account (for org-only)

9. Click **Create GitHub App**

## Step 2: Generate credentials

After creation, you'll see the App details page.

1. **App ID** — Copy this (numeric, e.g., `1234567`)

2. **Generate a Private Key:**
   - Scroll to "Private keys" section
   - Click **Generate a private key**
   - Save the downloaded `.pem` file securely
   - Copy the entire content (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`)

3. **OAuth credentials (for user login):**
   - Note the **Client ID**
   - Click **Generate a new client secret**
   - Save the **Client secret** immediately (shown only once)

## Step 3: Configure environment variables

Add to your `.env`:

```env
# GitHub App
GITHUB_APP_ID="1234567"
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA...
-----END RSA PRIVATE KEY-----
"
GITHUB_WEBHOOK_SECRET="your_webhook_secret_here"
GITHUB_CLIENT_ID="Iv1.xxxxxxxxxxxxxxxx"
GITHUB_CLIENT_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Application URLs (adjust for your setup)
APP_URL="http://localhost:3000"
API_URL="http://localhost:4000"
```

**Important:** The private key must preserve newlines. In `.env`, you can either:
- Use actual newlines (most shells support this)
- Or escape newlines as `\n` in a single line

## Step 4: Install the App

1. Go to your GitHub App page: `https://github.com/apps/{your-app-slug}`
2. Click **Install** (or **Configure** if already installed)
3. Select:
   - **Account:** Your user or organization
   - **Repositories:** All repositories (or select specific ones)
4. Click **Install**

## Step 5: Verify webhook delivery (local development)

For local development, use ngrok:

```bash
# Install ngrok
# https://ngrok.com/download

# Start tunnel to your backend
ngrok http 4000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`) and update:
- GitHub App → **Webhook URL**: `https://abc123.ngrok.io/api/webhooks/github`
- `.env` → `APP_URL=https://abc123.ngrok.io`, `API_URL=https://abc123.ngrok.io`

## Step 6: Test the integration

1. Start the backend: `cd backend && npm run dev`
2. Open a PR in an installed repository
3. Check backend logs for:
   ```
   webhook.received
   webhook.verified
   review.job.created
   github.pr.fetched
   diff.parsed
   agent.started
   ...
   review.completed
   ```
4. Check the PR on GitHub — you should see a review from "DiffMind AI"
5. Visit `http://localhost:3000/dashboard` to see the review in the UI

## Troubleshooting

### Webhook not received
- Check ngrok is running and URL is correct
- Verify webhook secret matches `.env`
- Check backend logs for `webhook.received`

### "Invalid signature" errors
- Ensure `GITHUB_WEBHOOK_SECRET` exactly matches GitHub App setting
- No extra whitespace or newlines

### "Bad credentials" / 401 from GitHub API
- Verify `GITHUB_APP_ID` is numeric
- Verify `GITHUB_APP_PRIVATE_KEY` includes full PEM header/footer
- Check App is installed on the target repository

### Review not appearing on PR
- Check backend logs for `github.review.published` or errors
- Verify PR is in a repository where App is installed
- Check PR state is "open" (not draft, closed, or merged)

### Frontend shows "Unauthorized"
- Ensure `SESSION_SECRET` is set (32+ chars)
- Check cookies are not blocked (same-site, secure in production)
- Verify `APP_URL` and `API_URL` match your frontend/backend URLs

## Production checklist

- [ ] Use a real domain with HTTPS (not ngrok)
- [ ] Set `SESSION_SECRET` to a strong random string
- [ ] Store `GITHUB_APP_PRIVATE_KEY` in secret manager (not `.env`)
- [ ] Set `NODE_ENV=production`
- [ ] Configure PostgreSQL with connection pooling
- [ ] Set up log aggregation
- [ ] Configure health checks (`/api/health`)
- [ ] Set up monitoring/alerting for failed reviews

## Minimum required permissions rationale

| Permission | Why needed |
|------------|------------|
| Contents: Read | Fetch file content, diffs, repository metadata |
| Pull requests: Read & Write | Read PR details, create reviews, post inline comments |
| Metadata: Read | Basic repo info (default branch, etc.) |
| Pull request events | Trigger reviews on open/sync/reopen |

No write access to: code, branches, commits, issues, deployments, or settings.