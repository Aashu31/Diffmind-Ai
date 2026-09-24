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
import { Github, LogOut, User, LayoutDashboard, FolderGit2, History, Settings, Loader2, AlertTriangle, CheckCircle2, XCircle, Search, Filter } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">DiffMind AI</span>
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

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Reviews</h1>
          <p className="text-muted-foreground">All code reviews across your repositories</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as "all" | "needs_attention" | "pass")}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All</option>
              <option value="needs_attention">Needs Attention</option>
              <option value="pass">Pass</option>
            </select>
          </div>
        </div>

        {filteredReviews.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 pb-6 text-center">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No reviews found</h2>
              <p className="text-muted-foreground mb-6">
                {reviews.length === 0
                  ? "Connect a GitHub repository and open a Pull Request to start your first DiffMind review."
                  : "Try adjusting your filters or search terms."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-4 pb-4">
                  <Link href={`/reviews/${review.id}`} className="block">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.pr.authorAvatarUrl ?? undefined} alt={review.pr.authorLogin} />
                          <AvatarFallback>{review.pr.authorLogin[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link href={`/repositories/${review.repository.id}`} className="font-medium hover:text-primary transition-colors">
                              {review.repository.fullName}
                            </Link>
                            <span className="font-mono text-sm text-muted-foreground">#{review.pr.number}</span>
                            <Badge variant={review.assessment === "PASS" ? "default" : "destructive"} className={getAssessmentColor(review.assessment)}>
                              {review.assessment === "PASS" ? "Pass" : "Needs Attention"}
                            </Badge>
                          </div>
                          <p className="font-medium truncate">{review.pr.title}</p>
                          <p className="text-sm text-muted-foreground">
                            by @{review.pr.authorLogin} • {review.pr.sourceBranch} → {review.pr.targetBranch} • {formatRelativeTime(review.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:ml-auto">
                        <div className="flex items-center gap-1 hidden sm:flex">
                          {review.findings.slice(0, 4).map((f) => (
                            <Badge key={f.id} variant="outline" className={getSeverityColor(f.severity)}>
                              {f.severity[0]}
                            </Badge>
                          ))}
                          {review.findings.length > 4 && (
                            <Badge variant="outline" className="text-xs">+{review.findings.length - 4}</Badge>
                          )}
                        </div>
                        {review.githubReviewId && (
                          <Button asChild variant="ghost" size="icon">
                            <Link href={`https://github.com/${review.repository.fullName}/pull/${review.pr.number}#pullrequestreview-${review.githubReviewId}`} target="_blank" rel="noopener noreferrer">
                              <Github className="h-4 w-4" />
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
  );
}