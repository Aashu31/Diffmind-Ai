import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";
import { env } from "../../config";
import { GitHubPullRequest, GitHubPRFile, WebhookPayload } from "../../types";

export interface GitHubService {
  getPullRequest(owner: string, repo: string, pullNumber: number): Promise<GitHubPullRequest>;
  getPullRequestFiles(owner: string, repo: string, pullNumber: number): Promise<GitHubPRFile[]>;
  getFileContent(owner: string, repo: string, path: string, ref: string): Promise<string>;
  getRepository(owner: string, repo: string): Promise<{ id: number; name: string; full_name: string; owner: { login: string; avatar_url: string }; private: boolean; default_branch: string }>;
  getDiff(owner: string, repo: string, pullNumber: number): Promise<string>;
  createReview(owner: string, repo: string, pullNumber: number, review: { body: string; event: "COMMENT" | "APPROVE" | "REQUEST_CHANGES"; comments: Array<{ path: string; line: number; side: "LEFT" | "RIGHT"; body: string }> }): Promise<{ id: number; html_url: string }>;
  createReviewComment(owner: string, repo: string, pullNumber: number, comment: { body: string; commit_id: string; path: string; line: number; side: "LEFT" | "RIGHT" }): Promise<{ id: number }>;
}

export function createGitHubService(installationId: number): GitHubService {
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: parseInt(env.GITHUB_APP_ID, 10),
      privateKey: env.GITHUB_APP_PRIVATE_KEY,
      installationId,
    },
  });

  return {
    async getPullRequest(owner, repo, pullNumber) {
      const { data } = await octokit.pulls.get({ owner, repo, pull_number: pullNumber });
      return {
        id: data.id,
        number: data.number,
        title: data.title,
        body: data.body,
        state: data.state as "open" | "closed" | "merged",
        head: {
          sha: data.head.sha,
          ref: data.head.ref,
          repo: { fullName: data.head.repo?.full_name ?? "", defaultBranch: data.head.repo?.default_branch ?? "" },
        },
        base: {
          sha: data.base.sha,
          ref: data.base.ref,
          repo: { fullName: data.base.repo?.full_name ?? "", defaultBranch: data.base.repo?.default_branch ?? "" },
        },
        user: { login: data.user?.login ?? "", avatarUrl: data.user?.avatar_url ?? "" },
        additions: data.additions,
        deletions: data.deletions,
        changedFiles: data.changed_files,
      };
    },

    async getPullRequestFiles(owner, repo, pullNumber) {
      const { data } = await octokit.pulls.listFiles({ owner, repo, pull_number: pullNumber, per_page: 100 });
      return data.map((f) => ({
        filename: f.filename,
        status: f.status as GitHubPRFile["status"],
        additions: f.additions,
        deletions: f.deletions,
        changes: f.changes,
        blobUrl: f.blob_url,
        rawUrl: f.raw_url,
        contentsUrl: f.contents_url,
        patch: f.patch,
        previousFilename: f.previous_filename,
      }));
    },

    async getFileContent(owner, repo, path, ref) {
      const { data } = await octokit.repos.getContent({ owner, repo, path, ref });
      if ("content" in data && data.content) {
        return Buffer.from(data.content, "base64").toString("utf-8");
      }
      throw new Error("File not found or is a directory");
    },

    async getRepository(owner, repo) {
      const { data } = await octokit.repos.get({ owner, repo });
      return {
        id: data.id,
        name: data.name,
        full_name: data.full_name,
        owner: { login: data.owner.login, avatar_url: data.owner.avatar_url },
        private: data.private,
        default_branch: data.default_branch,
      };
    },

    async getDiff(owner, repo, pullNumber) {
      const { data } = await octokit.pulls.get({ owner, repo, pull_number: pullNumber, mediaType: { format: "diff" } });
      return data as unknown as string;
    },

    async createReview(owner, repo, pullNumber, review) {
      const { data } = await octokit.pulls.createReview({ owner, repo, pull_number: pullNumber, ...review });
      return { id: data.id, html_url: data.html_url };
    },

    async createReviewComment(owner, repo, pullNumber, comment) {
      const { data } = await octokit.pulls.createReviewComment({ owner, repo, pull_number: pullNumber, ...comment });
      return { id: data.id };
    },
  };
}

export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const crypto = require("crypto");
  const expected = `sha256=${crypto.createHmac("sha256", secret).update(payload).digest("hex")}`;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function parseWebhookPayload(payload: any): WebhookPayload {
  return {
    action: payload.action,
    pull_request: payload.pull_request,
    repository: payload.repository,
    installation: payload.installation,
    sender: payload.sender,
  };
}