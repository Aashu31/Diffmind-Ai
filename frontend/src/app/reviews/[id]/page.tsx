"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { formatRelativeTime, formatDate, getAssessmentColor, getSeverityColor, getCategoryColor } from "@/lib/utils";
import { Github, LogOut, User, LayoutDashboard, FolderGit2, History, Settings, Loader2, ExternalLink, GitPullRequest, AlertTriangle, CheckCircle2, XCircle, FileText, Code, ChevronDown, ChevronUp } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/reviews" className="text-muted-foreground hover:text-foreground">
              <History className="h-5 w-5" />
            </Link>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <span className="text-xl font-bold">DiffMind AI</span>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <Link href={`/repositories/${review.repository.id}`} className="text-muted-foreground hover:text-foreground">
              {review.repository.fullName}
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href={`/reviews/${review.id}`} className="font-mono text-sm">
              #{review.pr.number}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 h-9 px-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl} alt={user.login} />
                    <AvatarFallback>{user.login[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block">{user.login}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1">
                  <p className="font-medium">{user.name || user.login}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Separator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex w-full items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/repositories" className="flex w-full items-center gap-2">
                    <FolderGit2 className="h-4 w-4" />
                    Repositories
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/reviews" className="flex w-full items-center gap-2">
                    <History className="h-4 w-4" />
                    Reviews
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex w-full items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem onClick={() => api.auth.logout().then(() => window.location.reload())} className="text-destructive flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <GitPullRequest className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{review.pr.title}</h1>
            <Badge variant={review.assessment === "PASS" ? "default" : "destructive"} className={getAssessmentColor(review.assessment)}>
              {review.assessment === "PASS" ? "Pass" : "Needs Attention"}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>#{review.pr.number} in {review.repository.fullName}</span>
            <span>by @{review.pr.authorLogin}</span>
            <span>{review.pr.sourceBranch} → {review.pr.targetBranch}</span>
            <span>+{review.pr.additions} -{review.pr.deletions}</span>
            <span>{review.pr.changedFiles} files</span>
            <span>{formatDate(review.createdAt)}</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="findings">Findings ({review.findings.length})</TabsTrigger>
                <TabsTrigger value="files">Files ({filesWithFindings.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">{review.summary}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Review Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Model</p>
                        <p className="font-mono text-sm">{review.model}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Agent Steps</p>
                        <p className="font-mono text-sm">{review.agentSteps}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">GitHub Review</p>
                        <p className="font-mono text-sm">{review.githubReviewId ? `#${review.githubReviewId}` : "Not published"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Job Status</p>
                        <Badge variant="outline" className={review.job.status === "COMPLETED" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {review.job.status}
                        </Badge>
                      </div>
                    </div>
                    {review.job.errorMessage && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                        Error: {review.job.errorMessage}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Severity Breakdown</CardTitle>
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
                    <CardTitle>Category Breakdown</CardTitle>
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

                {review.pr.body && (
                  <Card>
                    <CardHeader>
                      <CardTitle>PR Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none whitespace-pre-wrap">{review.pr.body}</div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="findings" className="space-y-4">
                {review.findings.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 pb-6 text-center">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="font-semibold mb-1">No findings</h3>
                      <p className="text-muted-foreground">DiffMind didn't identify any issues in this Pull Request.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {review.findings.map((finding) => (
                      <Card key={finding.id}>
                        <CardContent className="pt-4 pb-4">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className={getSeverityColor(finding.severity)}>
                                {finding.severity}
                              </Badge>
                              <Badge variant="outline" className={getCategoryColor(finding.category)}>
                                {finding.category}
                              </Badge>
                              <Badge variant="outline">
                                {Math.round(finding.confidence * 100)}% confidence
                              </Badge>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="font-mono text-sm">{finding.file}</span>
                                {finding.line && (
                                  <>
                                    <span className="text-muted-foreground">:</span>
                                    <span className="font-mono text-sm">{finding.line}</span>
                                    {finding.side && <span className="text-xs text-muted-foreground">({finding.side})</span>}
                                  </>
                                )}
                              </div>
                              <h4 className="font-semibold mb-1">{finding.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">{finding.description}</p>
                              {finding.recommendation && (
                                <div className="p-3 bg-muted rounded-md text-sm">
                                  <strong>Recommendation:</strong> {finding.recommendation}
                                </div>
                              )}
                              {finding.githubCommentId && (
                                <Button asChild variant="ghost" size="sm" className="mt-2">
                                  <Link href={`https://github.com/${review.repository.fullName}/pull/${review.pr.number}#discussion_r${finding.githubCommentId}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                    <Github className="h-3 w-3" />
                                    View on GitHub
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="files" className="space-y-4">
                {filesWithFindings.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 pb-6 text-center">
                      <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-1">No files with findings</h3>
                      <p className="text-muted-foreground">All files passed the review.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filesWithFindings.map((file) => {
                      const fileFindings = review.findings.filter((f) => f.file === file);
                      return (
                        <Card key={file}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <span className="font-mono">{file}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {fileFindings.map((f) => (
                                  <Badge key={f.id} variant="outline" className={getSeverityColor(f.severity)}>
                                    {f.severity[0]}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {fileFindings.map((finding) => (
                                <div key={finding.id} className="p-3 border rounded-md bg-muted/50">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className={getSeverityColor(finding.severity)}>
                                      {finding.severity}
                                    </Badge>
                                    <Badge variant="outline" className={getCategoryColor(finding.category)}>
                                      {finding.category}
                                    </Badge>
                                    {finding.line && (
                                      <span className="text-xs text-muted-foreground font-mono">
                                        Line {finding.line} ({finding.side})
                                      </span>
                                    )}
                                  </div>
                                  <h5 className="font-medium mb-1">{finding.title}</h5>
                                  <p className="text-sm text-muted-foreground">{finding.description}</p>
                                </div>
                              ))}
                            </div>
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
                <CardTitle>PR Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Repository</p>
                  <Link href={`/repositories/${review.repository.id}`} className="font-medium hover:text-primary">
                    {review.repository.fullName}
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Author</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={review.pr.authorAvatarUrl ?? undefined} alt={review.pr.authorLogin} />
                      <AvatarFallback>{review.pr.authorLogin[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>@{review.pr.authorLogin}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Branches</p>
                  <p className="font-mono text-sm">{review.pr.sourceBranch} → {review.pr.targetBranch}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Head SHA</p>
                  <p className="font-mono text-sm">{review.pr.headSha}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stats</p>
                  <p className="text-sm">+{review.pr.additions} -{review.pr.deletions} • {review.pr.changedFiles} files</p>
                </div>
                {review.githubReviewId && (
                  <Button asChild className="w-full">
                    <Link href={`https://github.com/${review.repository.fullName}/pull/${review.pr.number}#pullrequestreview-${review.githubReviewId}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                      <Github className="h-4 w-4" />
                      View on GitHub
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agent Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "PR loaded", done: true },
                    { label: "Changed files analysed", done: true },
                    { label: "Additional context retrieved", done: review.agentSteps >= 2 },
                    { label: "AI analysis completed", done: review.agentSteps >= 3 },
                    { label: "Findings validated", done: review.job.status === "COMPLETED" },
                    { label: "GitHub review published", done: !!review.githubReviewId },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {step.done ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      <span className="text-sm">{step.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}