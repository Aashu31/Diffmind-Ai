"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { formatRelativeTime, formatDate, getAssessmentColor, getSeverityColor, getCategoryColor } from "@/lib/utils";
import { Github, LogOut, User, LayoutDashboard, FolderGit2, History, Settings, Loader2, ExternalLink, GitPullRequest, AlertTriangle, CheckCircle2, XCircle, FileText, Code, ChevronDown, ChevronUp } from "lucide-react";
import { Background } from "@/components/ui/background";
import { FindingCard, Panel, CodeLine } from "@/components/review/panels";
import { AgentProgress } from "@/components/review/agent-activity";

interface ReviewDetail {
  id: string;
  summary: string;
  assessment: string;
  model: string;
  agentSteps: number;
  githubReviewId: number | null;
  createdAt: string;
  pr: {
    id: string;
    number: number;
    title: string;
    body: string | null;
    authorLogin: string;
    authorAvatarUrl: string | null;
    sourceBranch: string;
    targetBranch: string;
    headSha: string;
    additions: number;
    deletions: number;
    changedFiles: number;
  };
  repository: { id: string; name: string; fullName: string };
  findings: Array<{
    id: string;
    file: string;
    line: number | null;
    side: string | null;
    severity: string;
    category: string;
    title: string;
    description: string;
    recommendation: string | null;
    confidence: number;
    githubCommentId: number | null;
  }>;
  job: { id: string; status: string; agentSteps: number; errorMessage: string | null };
}

export default function ReviewDetailPage() {
  const params = useParams();
  const reviewId = params.id as string;
  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [user, setUser] = useState<{ id: string; login: string; name: string | null; email: string | null; avatarUrl: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "findings" | "files">("overview");
  const handleTabChange = (value: string) => {
    setActiveTab(value as "overview" | "findings" | "files");
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [userRes, reviewRes] = await Promise.all([api.auth.me(), api.reviews.get(reviewId)]);
        setUser(userRes.user);
        setReview(reviewRes.review);
      } catch {
        window.location.href = "/auth/github";
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [reviewId]);

  if (loading) {
    return (
      <>
        <Background intensity="subtle" />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-3 border-dm-accent-amber/30 border-t-dm-accent-amber rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!user || !review) {
    return null;
  }

  const severityCounts = review.findings.reduce(
    (acc, f) => {
      acc[f.severity] = (acc[f.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const categoryCounts = review.findings.reduce(
    (acc, f) => {
      acc[f.category] = (acc[f.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const filesWithFindings = [...new Set(review.findings.map((f) => f.file))];

  type StepStatus = "completed" | "active" | "pending" | "failed";

const agentSteps: { label: string; status: StepStatus; description: string }[] = [
    { label: "PR data collected", status: "completed", description: "GitHub webhook received and verified" },
    { label: "Changed files analysed", status: "completed", description: `${review.pr.changedFiles} files, ${review.pr.additions} additions, ${review.pr.deletions} deletions` },
    { label: "Additional context retrieved", status: review.agentSteps >= 2 ? "completed" : "pending", description: "Fetched referenced files and context" },
    { label: "AI analysis completed", status: review.agentSteps >= 3 ? "completed" : "pending", description: "Nemotron 3 Ultra reasoning completed" },
    { label: "Findings validated", status: review.job.status === "COMPLETED" ? "completed" : "pending", description: "Location checks, confidence filtering, deduplication" },
    { label: "GitHub review published", status: !!review.githubReviewId ? "completed" : "pending", description: "Inline comments and summary posted to GitHub" },
  ];

  return (
    <>
      <Background intensity="subtle" />
      <div className="relative z-10 min-h-screen">
        <header className="border-b border-dm-bg-border/50 backdrop-blur-sm bg-dm-bg-deep/80 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/reviews" className="text-dm-text-muted hover:text-dm-text-primary transition-colors">
                <History className="w-5 h-5" />
              </Link>
              <Separator orientation="vertical" className="h-5 mx-2" />
              <span className="text-lg font-bold text-dm-text-primary">DiffMind AI</span>
              <Separator orientation="vertical" className="h-5 mx-2" />
              <Link href={`/repositories/${review.repository.id}`} className="text-dm-text-muted hover:text-dm-text-primary transition-colors text-sm font-mono">
                {review.repository.fullName}
              </Link>
              <span className="text-dm-text-muted">/</span>
              <Link href={`/reviews/${review.id}`} className="font-mono text-sm text-dm-text-muted">
                #{review.pr.number}
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 h-9 px-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl} alt={user.login} />
                      <AvatarFallback className="text-xs">{user.login[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium">{user.login}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-2 border-b border-dm-bg-border">
                    <p className="font-medium text-sm text-dm-text-primary">{user.name || user.login}</p>
                    <p className="text-xs text-dm-text-muted truncate">{user.email}</p>
                  </div>
                  <DropdownMenuItem asChild className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-dm-text-secondary hover:bg-dm-bg-raised hover:text-dm-text-primary transition-colors">
                    <Link href="/dashboard">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-dm-text-secondary hover:bg-dm-bg-raised hover:text-dm-text-primary transition-colors">
                    <Link href="/repositories">
                      <FolderGit2 className="w-4 h-4" />
                      Repositories
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-dm-text-secondary hover:bg-dm-bg-raised hover:text-dm-text-primary transition-colors">
                    <Link href="/reviews">
                      <History className="w-4 h-4" />
                      Reviews
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-dm-text-secondary hover:bg-dm-bg-raised hover:text-dm-text-primary transition-colors">
                    <Link href="/settings">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => api.auth.logout().then(() => window.location.reload())} className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-dm-critical hover:bg-dm-critical/10 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <GitPullRequest className="w-6 h-6 text-dm-accent-amber" />
              <h1 className="text-xl md:text-2xl font-bold text-dm-text-primary">{review.pr.title}</h1>
              <Badge variant={review.assessment === "PASS" ? "success" : "warning"} className={getAssessmentColor(review.assessment)} size="sm">
                {review.assessment === "PASS" ? "Pass" : "Needs Attention"}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-dm-text-secondary">
              <span className="font-mono">#{review.pr.number}</span>
              <span className="font-mono">{review.pr.sourceBranch} → {review.pr.targetBranch}</span>
              <span className="font-mono text-dm-success">+{review.pr.additions}</span>
              <span className="font-mono text-dm-critical">-{review.pr.deletions}</span>
              <span>{review.pr.changedFiles} files</span>
              <span className="font-mono text-dm-text-dim">{review.pr.headSha.slice(0, 8)}</span>
              <span>{formatRelativeTime(review.createdAt)}</span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            <div className="lg:col-span-3 space-y-6">
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-3 bg-dm-bg-raised p-1 rounded-lg border border-dm-bg-border">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-dm-bg-elevated data-[state=active]:text-dm-text-primary data-[state=active]:shadow-sm">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="findings" className="data-[state=active]:bg-dm-bg-elevated data-[state=active]:text-dm-text-primary data-[state=active]:shadow-sm">
                    Findings ({review.findings.length})
                  </TabsTrigger>
                  <TabsTrigger value="files" className="data-[state=active]:bg-dm-bg-elevated data-[state=active]:text-dm-text-primary data-[state=active]:shadow-sm">
                    Files ({filesWithFindings.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 animate-fade-in">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none text-dm-text-secondary whitespace-pre-wrap">{review.summary}</div>
                    </CardContent>
                  </Card>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Review Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-medium text-dm-text-muted uppercase tracking-wider mb-1">Model</p>
                            <p className="font-mono text-sm text-dm-text-primary">{review.model}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-dm-text-muted uppercase tracking-wider mb-1">Agent Steps</p>
                            <p className="font-mono text-sm text-dm-text-primary">{review.agentSteps}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-dm-text-muted uppercase tracking-wider mb-1">GitHub Review</p>
                            <p className="font-mono text-sm text-dm-text-primary">{review.githubReviewId ? `#${review.githubReviewId}` : "Not published"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-dm-text-muted uppercase tracking-wider mb-1">Job Status</p>
                            <Badge variant={review.job.status === "COMPLETED" ? "success" : review.job.status === "FAILED" ? "critical" : "amber"} size="sm">
                              {review.job.status}
                            </Badge>
                          </div>
                        </div>
                        {review.job.errorMessage && (
                          <div className="p-3 bg-dm-critical/10 border border-dm-critical/30 rounded text-sm text-dm-critical">
                            Error: {review.job.errorMessage}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Severity Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
                            <Badge key={sev} variant="outline" className={getSeverityColor(sev)}>
                              {sev}: {severityCounts[sev] || 0}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Category Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {["BUG", "SECURITY", "PERFORMANCE", "RELIABILITY", "MAINTAINABILITY"].map((cat) => (
                            <Badge key={cat} variant="outline" className={getCategoryColor(cat)}>
                              {cat}: {categoryCounts[cat] || 0}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {review.pr.body && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">PR Description</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-sm max-w-none text-dm-text-secondary whitespace-pre-wrap bg-dm-bg-surface p-4 rounded border border-dm-bg-border">{review.pr.body}</div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="findings" className="space-y-4 animate-fade-in">
                  {review.findings.length === 0 ? (
                    <Card>
                      <CardContent className="pt-10 pb-10 text-center">
                        <CheckCircle2 className="w-12 h-12 text-dm-success mx-auto mb-4" />
                        <h3 className="font-semibold text-dm-text-primary mb-1">No findings</h3>
                        <p className="text-dm-text-secondary">DiffMind didn't identify any issues in this Pull Request.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {review.findings.map((finding) => (
                        <FindingCard
                          key={finding.id}
                          severity={finding.severity as any}
                          category={finding.category as any}
                          title={finding.title}
                          description={finding.description}
                          file={finding.file}
                          line={finding.line ?? undefined}
                          recommendation={finding.recommendation ?? undefined}
                          confidence={finding.confidence}
                          onView={() => finding.githubCommentId && window.open(`https://github.com/${review.repository.fullName}/pull/${review.pr.number}#discussion_r${finding.githubCommentId}`, "_blank")}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="files" className="space-y-4 animate-fade-in">
                  {filesWithFindings.length === 0 ? (
                    <Card>
                      <CardContent className="pt-10 pb-10 text-center">
                        <Code className="w-12 h-12 text-dm-text-muted mx-auto mb-4" />
                        <h3 className="font-semibold text-dm-text-primary mb-1">No files with findings</h3>
                        <p className="text-dm-text-secondary">All files passed the review.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {filesWithFindings.map((file) => {
                        const fileFindings = review.findings.filter((f) => f.file === file);
                        return (
                          <Card key={file}>
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-dm-text-muted" />
                                  <span className="font-mono text-sm text-dm-text-primary">{file}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {fileFindings.map((f) => (
                                    <Badge key={f.id} variant="outline" className={getSeverityColor(f.severity)} size="xs">
                                      {f.severity[0]}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {fileFindings.map((finding) => (
                                <Panel padding="sm" accent={finding.severity === "CRITICAL" ? "critical" : finding.severity === "HIGH" ? "critical" : finding.severity === "MEDIUM" ? "amber" : "none"} key={finding.id}>
                                  <div className="flex items-start gap-3">
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                      <Badge variant="outline" className={getSeverityColor(finding.severity)} size="xs">{finding.severity}</Badge>
                                      <Badge variant="outline" className={getCategoryColor(finding.category)} size="xs">{finding.category}</Badge>
                                      {finding.line && <Badge variant="outline" size="xs">Line {finding.line}</Badge>}
                                    </div>
                                    <div className="flex-1">
                                      <h5 className="font-medium text-dm-text-primary mb-1">{finding.title}</h5>
                                      <p className="text-sm text-dm-text-secondary">{finding.description}</p>
                                    </div>
                                  </div>
                                </Panel>
                              ))}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">PR Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-dm-text-muted uppercase tracking-wider mb-1">Repository</p>
                    <Link href={`/repositories/${review.repository.id}`} className="font-medium text-dm-text-primary hover:text-dm-accent-amber transition-colors">
                      {review.repository.fullName}
                    </Link>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-dm-text-muted uppercase tracking-wider mb-1">Author</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={review.pr.authorAvatarUrl ?? undefined} alt={review.pr.authorLogin} />
                        <AvatarFallback className="text-xs">{review.pr.authorLogin[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-dm-text-primary">@{review.pr.authorLogin}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-dm-text-muted uppercase tracking-wider mb-1">Branches</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-mono text-dm-text-primary">{review.pr.sourceBranch}</span>
                      <span className="text-dm-text-muted">→</span>
                      <span className="font-mono text-dm-text-primary">{review.pr.targetBranch}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-dm-text-muted uppercase tracking-wider mb-1">Head SHA</p>
                    <p className="font-mono text-sm text-dm-text-primary">{review.pr.headSha}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-dm-text-muted uppercase tracking-wider mb-1">Statistics</p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-dm-success font-mono">+{review.pr.additions}</span>
                      <span className="text-dm-critical font-mono">-{review.pr.deletions}</span>
                      <span>{review.pr.changedFiles} files</span>
                    </div>
                  </div>
                  {review.githubReviewId && (
                    <Button asChild className="w-full">
                      <Link href={`https://github.com/${review.repository.fullName}/pull/${review.pr.number}#pullrequestreview-${review.githubReviewId}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                        <Github className="w-4 h-4" />
                        View on GitHub
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Agent Progress</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <AgentProgress steps={agentSteps} />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}