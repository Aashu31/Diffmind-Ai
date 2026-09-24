"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { formatRelativeTime, getAssessmentColor, getSeverityColor } from "@/lib/utils";
import { Github, LogOut, User, LayoutDashboard, FolderGit2, History, Settings, Loader2, AlertTriangle, CheckCircle2, XCircle, Search, Filter, ChevronDown } from "lucide-react";
import { Background } from "@/components/ui/background";

interface ReviewListItem {
  id: string;
  summary: string;
  assessment: string;
  model: string;
  agentSteps: number;
  githubReviewId: number | null;
  createdAt: string;
  pr: { id: string; number: number; title: string; authorLogin: string; authorAvatarUrl: string | null; sourceBranch: string; targetBranch: string; headSha: string };
  repository: { id: string; name: string; fullName: string };
  findings: Array<{ id: string; file: string; line: number | null; severity: string; category: string; title: string; confidence: number }>;
  job: { id: string; status: string; agentSteps: number };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewListItem[]>([]);
  const [user, setUser] = useState<{ id: string; login: string; name: string | null; email: string | null; avatarUrl: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "needs_attention" | "pass">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [userRes, reviewsRes] = await Promise.all([api.auth.me(), api.reviews.list()]);
        setUser(userRes.user);
        setReviews(reviewsRes.reviews);
      } catch {
        window.location.href = "/auth/github";
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredReviews = reviews.filter((review) => {
    if (filter === "needs_attention" && review.assessment !== "NEEDS_ATTENTION") return false;
    if (filter === "pass" && review.assessment !== "PASS") return false;
    if (search && !review.pr.title.toLowerCase().includes(search.toLowerCase()) && !review.repository.fullName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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

  if (!user) {
    return null;
  }

  return (
    <>
      <Background intensity="subtle" />
      <div className="relative z-10 min-h-screen">
        <header className="border-b border-dm-bg-border/50 backdrop-blur-sm bg-dm-bg-deep/80 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="text-dm-text-muted hover:text-dm-text-primary transition-colors">
                <LayoutDashboard className="w-5 h-5" />
              </Link>
              <Separator orientation="vertical" className="h-5 mx-2" />
              <History className="w-7 h-7 text-dm-accent-amber" />
              <span className="text-lg font-bold text-dm-text-primary">Reviews</span>
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

        <main className="container mx-auto px-4 py-6 md:py-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-dm-text-primary mb-2">Reviews</h1>
            <p className="text-dm-text-secondary">All code reviews across your repositories</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dm-text-muted" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dm-bg-raised border border-dm-bg-border rounded-md text-sm text-dm-text-primary placeholder-dm-text-muted focus:outline-none focus:ring-2 focus:ring-dm-focus focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-dm-text-muted" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as "all" | "needs_attention" | "pass")}
                className="px-3 py-2 bg-dm-bg-raised border border-dm-bg-border rounded-md text-sm text-dm-text-primary focus:outline-none focus:ring-2 focus:ring-dm-focus focus:border-transparent transition-all appearance-none bg-no-repeat bg-right pr-8"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2374756D' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: "right 8px center" }}
              >
                <option value="all">All</option>
                <option value="needs_attention">Needs Attention</option>
                <option value="pass">Pass</option>
              </select>
            </div>
          </div>

          {filteredReviews.length === 0 ? (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-10 pb-10 text-center">
                <History className="w-12 h-12 text-dm-text-muted mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-dm-text-primary mb-2">No reviews found</h2>
                <p className="text-dm-text-secondary mb-6">
                  {reviews.length === 0
                    ? "Connect a GitHub repository and open a Pull Request to start your first DiffMind review."
                    : "Try adjusting your filters or search terms."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredReviews.map((review) => (
                <Card key={review.id} className="group hover:border-dm-bg-border-strong transition-colors">
                  <CardContent className="pt-4 pb-4">
                    <Link href={`/reviews/${review.id}`} className="block">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={review.pr.authorAvatarUrl} alt={review.pr.authorLogin} />
                            <AvatarFallback className="text-xs">{review.pr.authorLogin[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <Link href={`/repositories/${review.repository.id}`} className="font-medium text-dm-text-primary hover:text-dm-accent-amber transition-colors">
                                {review.repository.fullName}
                              </Link>
                              <span className="font-mono text-xs text-dm-text-muted">#{review.pr.number}</span>
                              <Badge variant={review.assessment === "PASS" ? "success" : "warning"} className={getAssessmentColor(review.assessment)} size="sm">
                                {review.assessment === "PASS" ? "Pass" : "Needs Attention"}
                              </Badge>
                            </div>
                            <p className="font-medium text-dm-text-primary truncate">{review.pr.title}</p>
                            <p className="text-xs text-dm-text-muted">
                              by @{review.pr.authorLogin} • {review.pr.sourceBranch} → {review.pr.targetBranch} • {formatRelativeTime(review.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 sm:ml-auto flex-shrink-0">
                          <div className="flex items-center gap-1 hidden sm:flex">
                            {review.findings.slice(0, 4).map((f) => (
                              <Badge key={f.id} variant="outline" className={getSeverityColor(f.severity)} size="xs">
                                {f.severity[0]}
                              </Badge>
                            ))}
                            {review.findings.length > 4 && (
                              <Badge variant="outline" size="xs">+{review.findings.length - 4}</Badge>
                            )}
                          </div>
                          {review.githubReviewId && (
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                              <Link href={`https://github.com/${review.repository.fullName}/pull/${review.pr.number}#pullrequestreview-${review.githubReviewId}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                                <Github className="w-4 h-4" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}