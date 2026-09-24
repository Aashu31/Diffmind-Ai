import { GitHubService } from "../../github/services/github";
import { Finding, ReviewContext } from "../../types";
import { ValidatedFinding } from "../../review/validation/findings";
import { env } from "../../config";

export interface ReviewPublisherResult {
  reviewId: number;
  reviewUrl: string;
  publishedFindings: Array<{ finding: ValidatedFinding; commentId: number }>;
  failedFindings: Array<{ finding: ValidatedFinding; error: string }>;
}

export class GitHubReviewPublisher {
  private github: GitHubService;
  private owner: string;
  private repo: string;
  private pullNumber: number;
  private headSha: string;

  constructor(github: GitHubService, owner: string, repo: string, pullNumber: number, headSha: string) {
    this.github = github;
    this.owner = owner;
    this.repo = repo;
    this.pullNumber = pullNumber;
    this.headSha = headSha;
  }

  async publish(summary: string, assessment: "PASS" | "NEEDS_ATTENTION", findings: ValidatedFinding[]): Promise<ReviewPublisherResult> {
    const severityCounts = findings.reduce(
      (acc, f) => {
        acc[f.severity] = (acc[f.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const reviewBody = this.formatReviewBody(summary, assessment, severityCounts, findings.length);

    const inlineComments = findings
      .filter((f) => f.line !== undefined)
      .map((f) => ({
        path: f.file,
        line: f.line!,
        side: f.side ?? "RIGHT",
        body: this.formatFindingComment(f),
      }));

    const { id: reviewId, html_url: reviewUrl } = await this.github.createReview(this.owner, this.repo, this.pullNumber, {
      body: reviewBody,
      event: assessment === "PASS" ? "APPROVE" : "COMMENT",
      comments: inlineComments,
    });

    const publishedFindings: ReviewPublisherResult["publishedFindings"] = [];
    const failedFindings: ReviewPublisherResult["failedFindings"] = [];

    for (const finding of findings.filter((f) => f.line !== undefined)) {
      try {
        const { id: commentId } = await this.github.createReviewComment(this.owner, this.repo, this.pullNumber, {
          body: this.formatFindingComment(finding),
          commit_id: this.headSha,
          path: finding.file,
          line: finding.line!,
          side: finding.side ?? "RIGHT",
        });
        publishedFindings.push({ finding, commentId });
      } catch (error) {
        failedFindings.push({
          finding,
          error: error instanceof Error ? error.message : "Failed to publish comment",
        });
      }
    }

    return { reviewId, reviewUrl, publishedFindings, failedFindings };
  }

  private formatReviewBody(
    summary: string,
    assessment: "PASS" | "NEEDS_ATTENTION",
    severityCounts: Record<string, number>,
    totalFindings: number
  ): string {
    const assessmentLabel = assessment === "PASS" ? "Pass" : "Needs Attention";

    const parts = [
      "## DiffMind AI Review",
      "",
      `### Assessment: ${assessmentLabel}`,
      "",
      "### Findings",
      `Critical: ${severityCounts.CRITICAL || 0}`,
      `High: ${severityCounts.HIGH || 0}`,
      `Medium: ${severityCounts.MEDIUM || 0}`,
      `Low: ${severityCounts.LOW || 0}`,
      "",
      `**Total:** ${totalFindings}`,
      "",
      "### Summary",
      summary,
      "",
      "---",
      `*DiffMind AI • Nemotron 3 Ultra 550B A55B*`,
    ];

    return parts.join("\n");
  }

  private formatFindingComment(finding: ValidatedFinding): string {
    const severityEmoji = {
      CRITICAL: "🔴",
      HIGH: "🟠",
      MEDIUM: "🟡",
      LOW: "🔵",
    };

    const categoryEmoji = {
      BUG: "🐛",
      SECURITY: "🔒",
      PERFORMANCE: "⚡",
      RELIABILITY: "🛡️",
      MAINTAINABILITY: "🔧",
    };

    const parts = [
      `${severityEmoji[finding.severity]} **${finding.severity}** ${categoryEmoji[finding.category]} **${finding.category}**`,
      "",
      `**${finding.title}**`,
      "",
      finding.description,
    ];

    if (finding.recommendation) {
      parts.push("", "**Recommendation:**", finding.recommendation);
    }

    parts.push("", `*Confidence: ${Math.round(finding.confidence * 100)}%*`, "---", "*DiffMind AI*");

    return parts.join("\n");
  }
}

export async function publishReview(
  github: GitHubService,
  context: ReviewContext,
  summary: string,
  assessment: "PASS" | "NEEDS_ATTENTION",
  findings: ValidatedFinding[]
): Promise<ReviewPublisherResult> {
  const publisher = new GitHubReviewPublisher(
    github,
    context.repository.ownerLogin,
    context.repository.name,
    context.pullRequest.number,
    context.pullRequest.headSha
  );

  return publisher.publish(summary, assessment, findings);
}