import { prisma } from "../../db/client";
import { createGitHubService, GitHubService } from "../../github/services/github";
import { parseDiff } from "../../review/parser/diff";
import { buildReviewContext } from "../../review/context/builder";
import { DiffMindReviewAgent } from "../../ai/agent/DiffMindReviewAgent";
import { validateAndProcessFindings } from "../../review/validation/findings";
import { publishReview } from "../../review/publisher/github";
import { ReviewContext, ParsedDiff, Finding } from "../../types";
import { env } from "../../config";
import { JobStatus, Assessment, Severity, Category } from "@prisma/client";

export interface ReviewJobData {
  id: string;
  prId: string;
  repositoryId: string;
  headSha: string;
}

export class ReviewEngine {
  private github: GitHubService;
  private jobId: string;

  constructor(github: GitHubService, jobId: string) {
    this.github = github;
    this.jobId = jobId;
  }

  async execute(jobData: ReviewJobData): Promise<void> {
    await this.updateJobStatus(JobStatus.PROCESSING);

    try {
      const prData = await this.getPullRequestData(jobData);
      const { pr: githubPR, repo, owner, name } = prData;
      const rawDiff = await this.github.getDiff(owner, name, githubPR.number);
      const parsedDiff = parseDiff(rawDiff);

      const context = buildReviewContext({
        repository: {
          id: repo.id,
          name: repo.name,
          fullName: repo.fullName,
          ownerLogin: repo.ownerLogin,
          defaultBranch: repo.defaultBranch,
          private: repo.private,
        },
        pullRequest: {
          id: String(githubPR.id),
          number: githubPR.number,
          title: githubPR.title,
          body: githubPR.body,
          authorLogin: githubPR.user.login,
          authorAvatarUrl: githubPR.user.avatarUrl,
          sourceBranch: githubPR.head.ref,
          targetBranch: githubPR.base.ref,
          baseSha: githubPR.base.sha,
          headSha: githubPR.head.sha,
          additions: githubPR.additions,
          deletions: githubPR.deletions,
          changedFiles: githubPR.changedFiles,
        },
        rawDiff,
      });

      const deps = this.createAgentDependencies(owner, name, githubPR.number, githubPR.base.sha, githubPR.head.sha);
      const agent = new DiffMindReviewAgent(context, deps);

      const { findings, summary, overallAssessment, steps } = await agent.review();

      const validationResult = validateAndProcessFindings(findings, parsedDiff);

      await this.persistReview(jobData, context, summary, overallAssessment, validationResult.valid, steps);

      const publishResult = await publishReview(this.github, context, summary, overallAssessment, validationResult.valid);

      await this.updateReviewWithGitHubData(jobData.id, publishResult);

      await this.updateJobStatus(JobStatus.COMPLETED);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      await this.updateJobStatus(JobStatus.FAILED, message);
      throw error;
    }
  }

  private async getPullRequestData(jobData: ReviewJobData) {
    const [pr, repo] = await Promise.all([
      prisma.pullRequest.findUniqueOrThrow({ where: { id: jobData.prId } }),
      prisma.repository.findUniqueOrThrow({ where: { id: jobData.repositoryId } }),
    ]);

    const [owner, name] = repo.fullName.split("/");

    const githubPR = await this.github.getPullRequest(owner, name, pr.number);

    return { pr: githubPR, repo, owner, name };
  }

  private createAgentDependencies(
    owner: string,
    repoName: string,
    pullNumber: number,
    baseSha: string,
    headSha: string
  ) {
    return {
      getPullRequest: async () => {
        const pr = await this.github.getPullRequest(owner, repoName, pullNumber);
        return {
          id: String(pr.id),
          number: pr.number,
          title: pr.title,
          body: pr.body,
          authorLogin: pr.user.login,
          authorAvatarUrl: pr.user.avatarUrl,
          sourceBranch: pr.head.ref,
          targetBranch: pr.base.ref,
          baseSha: pr.base.sha,
          headSha: pr.head.sha,
          additions: pr.additions,
          deletions: pr.deletions,
          changedFiles: pr.changedFiles,
        };
      },
      getChangedFiles: async () => {
        const files = await this.github.getPullRequestFiles(owner, repoName, pullNumber);
        return files.map((f) => ({
          file: f.filename,
          status: f.status,
          additions: f.additions,
          deletions: f.deletions,
        }));
      },
      getFileContent: async (file: string, ref: string) => {
        return this.github.getFileContent(owner, repoName, file, ref);
      },
      getDiff: async (file: string) => {
        const files = await this.github.getPullRequestFiles(owner, repoName, pullNumber);
        const f = files.find((ff) => ff.filename === file);
        return f?.patch ?? "";
      },
      getRepositoryMetadata: async () => {
        const repoData = await this.github.getRepository(owner, repoName);
        return {
          id: String(repoData.id),
          name: repoData.name,
          fullName: repoData.full_name,
          ownerLogin: repoData.owner.login,
          defaultBranch: repoData.default_branch,
          private: repoData.private,
        };
      },
    };
  }

  private async persistReview(
    jobData: ReviewJobData,
    context: ReviewContext,
    summary: string,
    overallAssessment: "PASS" | "NEEDS_ATTENTION",
    findings: Finding[],
    agentSteps: number
  ): Promise<void> {
    await prisma.review.create({
      data: {
        jobId: jobData.id,
        prId: jobData.prId,
        repositoryId: jobData.repositoryId,
        summary,
        assessment: overallAssessment === "PASS" ? Assessment.PASS : Assessment.NEEDS_ATTENTION,
        model: env.NVIDIA_MODEL,
        modelConfig: {
          temperature: env.NVIDIA_TEMPERATURE,
          topP: env.NVIDIA_TOP_P,
          maxTokens: env.NVIDIA_MAX_TOKENS,
          reasoningEffort: env.NVIDIA_REASONING_EFFORT,
          reasoningBudget: env.NVIDIA_REASONING_BUDGET,
        },
        agentSteps,
        findings: {
          create: findings.map((f) => ({
            file: f.file,
            line: f.line,
            side: f.side,
            severity: f.severity as Severity,
            category: f.category as Category,
            title: f.title,
            description: f.description,
            recommendation: f.recommendation,
            confidence: f.confidence,
          })),
        },
      },
    });
  }

  private async updateReviewWithGitHubData(reviewJobId: string, result: { reviewId: number; reviewUrl: string; publishedFindings: Array<{ finding: Finding; commentId: number }> }): Promise<void> {
    const review = await prisma.review.findUnique({ where: { jobId: reviewJobId } });
    if (!review) return;

    await prisma.review.update({
      where: { id: review.id },
      data: { githubReviewId: result.reviewId },
    });

    for (const { finding, commentId } of result.publishedFindings) {
      await prisma.finding.updateMany({
        where: {
          reviewId: review.id,
          file: finding.file,
          line: finding.line,
          title: finding.title,
        },
        data: { githubCommentId: commentId },
      });
    }
  }

  private async updateJobStatus(status: JobStatus, errorMessage?: string): Promise<void> {
    await prisma.reviewJob.update({
      where: { id: this.jobId },
      data: {
        status,
        errorMessage,
        startedAt: status === JobStatus.PROCESSING ? new Date() : undefined,
        completedAt: status === JobStatus.COMPLETED || status === JobStatus.FAILED ? new Date() : undefined,
      },
    });
  }
}

export async function createReviewJob(
  installationId: string,
  repositoryId: string,
  prId: string,
  headSha: string
): Promise<string | null> {
  const existing = await prisma.reviewJob.findFirst({
    where: {
      prId,
      headSha,
      status: { in: [JobStatus.PENDING, JobStatus.PROCESSING] },
    },
  });

  if (existing) {
    return existing.id;
  }

  const job = await prisma.reviewJob.create({
    data: {
      prId,
      repositoryId,
      headSha,
      status: JobStatus.PENDING,
    },
  });

  return job.id;
}