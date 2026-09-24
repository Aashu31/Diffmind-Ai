import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../db/client";
import { createGitHubService, verifyWebhookSignature, GitHubService } from "../../github/services/github";
import { createReviewJob } from "../../review/engine/ReviewEngine";
import { ReviewEngine } from "../../review/engine/ReviewEngine";
import { JobStatus } from "@prisma/client";
import { env } from "../../config";

interface WebhookPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: string;
  head: { sha: string; ref: string; repo: { full_name: string; default_branch: string } };
  base: { sha: string; ref: string };
  user: { login: string; avatar_url: string };
  additions: number;
  deletions: number;
  changed_files: number;
}

interface WebhookRepository {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string; avatar_url: string };
  private: boolean;
  default_branch: string;
}

interface WebhookInstallation {
  id: number;
}

interface WebhookPayload {
  action: string;
  pull_request: WebhookPullRequest;
  repository: WebhookRepository;
  installation: WebhookInstallation;
  sender: { login: string };
}

function parseWebhookPayload(payload: any): WebhookPayload {
  return {
    action: payload.action,
    pull_request: payload.pull_request,
    repository: payload.repository,
    installation: payload.installation,
    sender: payload.sender,
  };
}

export async function handleGitHubWebhook(request: FastifyRequest, reply: FastifyReply) {
  const signature = request.headers["x-hub-signature-256"] as string;
  const payload = request.body as string;
  const event = request.headers["x-github-event"] as string;
  const deliveryId = request.headers["x-github-delivery"] as string;

  if (!verifyWebhookSignature(payload, signature, env.GITHUB_WEBHOOK_SECRET)) {
    request.log.warn({ deliveryId }, "Invalid webhook signature");
    return reply.code(401).send({ error: "Invalid signature" });
  }

  if (event !== "pull_request") {
    return reply.code(200).send({ ok: true, ignored: true });
  }

  const webhookPayload = parseWebhookPayload(JSON.parse(payload));
  const { action, pull_request, repository, installation } = webhookPayload;

  if (!["opened", "synchronize", "reopened"].includes(action)) {
    return reply.code(200).send({ ok: true, ignored: true });
  }

  if (pull_request.state !== "open") {
    return reply.code(200).send({ ok: true, ignored: true });
  }

  request.log.info(
    { deliveryId, action, pr: pull_request.number, repo: repository.full_name, installation: installation.id },
    "Webhook received"
  );

  try {
    await processPullRequestEvent(installation.id, repository, pull_request);
    return reply.code(202).send({ ok: true, queued: true });
  } catch (error) {
    request.log.error({ deliveryId, error }, "Failed to process webhook");
    return reply.code(500).send({ error: "Internal error" });
  }
}

async function processPullRequestEvent(
  installationId: number,
  repository: WebhookRepository,
  pullRequest: WebhookPullRequest
): Promise<void> {
  let dbInstallation = await prisma.gitHubInstallation.findUnique({
    where: { installationId },
  });

  if (!dbInstallation) {
    dbInstallation = await prisma.gitHubInstallation.create({
      data: {
        installationId,
        accountLogin: repository.owner.login,
        accountType: "User",
        accountAvatarUrl: repository.owner.avatar_url,
        targetType: "Repository",
        permissions: {},
      },
    });
  }

  let dbRepository = await prisma.repository.findUnique({
    where: { githubId: repository.id },
  });

  if (!dbRepository) {
    dbRepository = await prisma.repository.create({
      data: {
        githubId: repository.id,
        name: repository.name,
        fullName: repository.full_name,
        ownerLogin: repository.owner.login,
        ownerAvatarUrl: repository.owner.avatar_url,
        private: repository.private,
        defaultBranch: repository.default_branch,
        installationId: dbInstallation.id,
      },
    });
  } else {
    await prisma.repository.update({
      where: { id: dbRepository.id },
      data: {
        name: repository.name,
        fullName: repository.full_name,
        ownerLogin: repository.owner.login,
        ownerAvatarUrl: repository.owner.avatar_url,
        private: repository.private,
        defaultBranch: repository.default_branch,
        installationId: dbInstallation.id,
      },
    });
  }

  let dbPullRequest = await prisma.pullRequest.findUnique({
    where: { githubId: pullRequest.id },
  });

  if (!dbPullRequest) {
    dbPullRequest = await prisma.pullRequest.create({
      data: {
        githubId: pullRequest.id,
        number: pullRequest.number,
        title: pullRequest.title,
        body: pullRequest.body,
        state: pullRequest.state,
        authorLogin: pullRequest.user.login,
        authorAvatarUrl: pullRequest.user.avatar_url,
        sourceBranch: pullRequest.head.ref,
        targetBranch: pullRequest.base.ref,
        baseSha: pullRequest.base.sha,
        headSha: pullRequest.head.sha,
        additions: pullRequest.additions,
        deletions: pullRequest.deletions,
        changedFiles: pullRequest.changed_files,
        repositoryId: dbRepository.id,
      },
    });
  } else {
    await prisma.pullRequest.update({
      where: { id: dbPullRequest.id },
      data: {
        title: pullRequest.title,
        body: pullRequest.body,
        state: pullRequest.state,
        authorLogin: pullRequest.user.login,
        authorAvatarUrl: pullRequest.user.avatar_url,
        sourceBranch: pullRequest.head.ref,
        targetBranch: pullRequest.base.ref,
        baseSha: pullRequest.base.sha,
        headSha: pullRequest.head.sha,
        additions: pullRequest.additions,
        deletions: pullRequest.deletions,
        changedFiles: pullRequest.changed_files,
      },
    });
  }

  const jobId = await createReviewJob(dbInstallation.id, dbRepository.id, dbPullRequest.id, pullRequest.head.sha);

  if (!jobId) {
    return;
  }

  const github = createGitHubService(installationId);
  const engine = new ReviewEngine(github, jobId);

  engine.execute({
    id: jobId,
    prId: dbPullRequest.id,
    repositoryId: dbRepository.id,
    headSha: pullRequest.head.sha,
  }).catch((error) => {
    console.error("Review engine error:", error);
  });
}