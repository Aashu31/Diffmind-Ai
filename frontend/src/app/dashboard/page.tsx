"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { formatRelativeTime, getAssessmentColor, getSeverityColor } from "@/lib/utils";
import { Github, LogOut, User, LayoutDashboard, FolderGit2, History, Settings, Loader2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface DashboardStats {
  totalRepos: number;
  totalReviews: number;
  recentReviews: Array<{
    id: string;
    summary: string;
    assessment: string;
    createdAt: string;
    pr: { number: number; title: string; authorLogin: string };
    repository: { name: string; fullName: string };
    findings: Array<{ severity: string }>;
  }>;
  openFindings: number;
}

interface User {
  id: string;
  login: string;
  name: string | null;
  email: string | null;
  avatarUrl: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [userRes, statsRes] = await Promise.all([api.auth.me(), api.dashboard.stats()]);
        setUser(userRes.user);
        setStats(statsRes);
      } catch {
        router.push("/auth/github");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !stats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
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
                <DropdownMenuItem onClick={() => api.auth.logout().then(() => router.refresh())} className="text-destructive flex items-center gap-2">
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
          <h1 className="text-3xl font-bold">Welcome back, {user.name || user.login}</h1>
          <p className="text-muted-foreground">Here's what's happening with your code reviews.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Repositories</CardTitle>
              <FolderGit2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRepos}</div>
              <p className="text-xs text-muted-foreground">Connected repositories</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReviews}</div>
              <p className="text-xs text-muted-foreground">Reviews completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Findings</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.openFindings}</div>
              <p className="text-xs text-muted-foreground">Issues needing attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Reviews</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentReviews.length}</div>
              <p className="text-xs text-muted-foreground">Last 5 reviews</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="md:col-span-4 lg:col-span-4">
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentReviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No reviews yet.</p>
                  <p className="text-sm mt-1">Connect a GitHub repository and open a Pull Request to start your first DiffMind review.</p>
                  <Button asChild className="mt-4" variant="outline">
                    <Link href="/repositories">View Repositories</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentReviews.map((review) => (
                    <Link key={review.id} href={`/reviews/${review.id}`} className="block">
                      <div className="flex items-start justify-between gap-4 p-4 hover:bg-accent rounded-lg transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm text-muted-foreground">{review.repository.fullName}#{review.pr.number}</span>
                            <Badge variant={review.assessment === "PASS" ? "default" : "destructive"} className={getAssessmentColor(review.assessment)}>
                              {review.assessment === "PASS" ? "Pass" : "Needs Attention"}
                            </Badge>
                          </div>
                          <p className="font-medium truncate">{review.pr.title}</p>
                          <p className="text-sm text-muted-foreground">by @{review.pr.authorLogin} • {formatRelativeTime(review.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {review.findings.slice(0, 3).map((f) => (
                            <Badge key={f.severity} variant="outline" className={getSeverityColor(f.severity)}>
                              {f.severity[0]}
                            </Badge>
                          ))}
                          {review.findings.length > 3 && (
                            <Badge variant="outline">+{review.findings.length - 3}</Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start gap-3" variant="outline">
                <Link href="/repositories">
                  <FolderGit2 className="h-4 w-4" />
                  <span>Manage Repositories</span>
                </Link>
              </Button>
              <Button asChild className="w-full justify-start gap-3" variant="outline">
                <Link href="/reviews">
                  <History className="h-4 w-4" />
                  <span>View All Reviews</span>
                </Link>
              </Button>
              <Button asChild className="w-full justify-start gap-3" variant="outline">
                <Link href="/settings">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}