"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { formatRelativeTime, getAssessmentColor, getSeverityColor } from "@/lib/utils";
import { Github, LogOut, User, LayoutDashboard, FolderGit2, History, Settings, Loader2, AlertTriangle, CheckCircle2, XCircle, TrendingUp, Minus, Shield, Zap } from "lucide-react";
import { KPIMetric, StatBlock, MetricRow } from "@/components/dashboard/metrics";
import { AgentStep, ActivityItem, AgentProgress } from "@/components/review/agent-activity";
import { Background } from "@/components/ui/background";

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
  const [activeTab, setActiveTab] = useState<"overview" | "activity">("overview");

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
      <>
        <Background intensity="subtle" />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-3 border-dm-accent-amber/30 border-t-dm-accent-amber rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!user || !stats) {
    return null;
  }

  const recentActivity = [
    { time: "2 min ago", message: "Review completed for auth-service#234", type: "success" as const },
    { time: "15 min ago", message: "New PR detected in api-gateway#567", type: "info" as const },
    { time: "1 hour ago", message: "Security finding in payment-service#123", type: "warning" as const },
    { time: "3 hours ago", message: "Review published for user-service#89", type: "success" as const },
    { time: "5 hours ago", message: "Performance issue detected in notification-service#45", type: "info" as const },
  ];

  const agentSteps = [
    { label: "PR data collected", status: "completed" as const, description: "GitHub webhook received and verified" },
    { label: "Changed files analysed", status: "completed" as const, description: "12 files, 240 additions, 85 deletions" },
    { label: "Additional context retrieved", status: "completed" as const, description: "Fetched 3 referenced files" },
    { label: "AI analysis in progress", status: "active" as const, description: "Nemotron reviewing authentication flow" },
    { label: "Validating findings", status: "pending" as const, description: "Checking line locations and confidence" },
    { label: "Publishing review", status: "pending" as const, description: "Creating GitHub review with inline comments" },
  ];

  return (
    <>
      <Background intensity="subtle" />
      <div className="relative z-10 min-h-screen">
        <header className="border-b border-dm-bg-border/50 backdrop-blur-sm bg-dm-bg-deep/80 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-7 h-7 text-dm-accent-amber" />
              <span className="text-lg font-bold text-dm-text-primary">DiffMind AI</span>
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
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
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
                  <DropdownMenuItem onClick={() => api.auth.logout().then(() => router.refresh())} className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-dm-critical hover:bg-dm-critical/10 transition-colors">
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
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-dm-text-primary">Welcome back, {user.name || user.login}</h1>
              <Badge variant="amber" className="text-xs">LIVE</Badge>
            </div>
            <p className="text-dm-text-secondary">Here's what's happening with your code reviews.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <KPIMetric
              label="Total Repositories"
              value={stats.totalRepos}
              change={12}
              changeLabel="vs last month"
              trend="up"
              icon={<FolderGit2 className="w-8 h-8" />}
              accent="amber"
            />
            <KPIMetric
              label="Total Reviews"
              value={stats.totalReviews}
              change={8}
              changeLabel="vs last month"
              trend="up"
              icon={<History className="w-8 h-8" />}
              accent="amber"
            />
            <KPIMetric
              label="Open Findings"
              value={stats.openFindings}
              change={-5}
              changeLabel="resolved this week"
              trend="down"
              icon={<AlertTriangle className="w-8 h-8" />}
              accent="critical"
            />
            <KPIMetric
              label="Avg. Review Time"
              value="1.3m"
              change={-15}
              changeLabel="faster than avg"
              trend="down"
              icon={<Zap className="w-8 h-8" />}
              accent="success"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-dm-text-primary">Recent Reviews</h2>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/reviews">View all</Link>
                </Button>
              </div>
              {stats.recentReviews.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 pb-10 text-center">
                    <History className="w-12 h-12 text-dm-text-muted mx-auto mb-4" />
                    <h3 className="font-semibold text-dm-text-primary mb-2">No reviews yet</h3>
                    <p className="text-sm text-dm-text-secondary mb-6">
                      Connect a GitHub repository and open a Pull Request to start your first DiffMind review.
                    </p>
                    <Button asChild variant="amber">
                      <Link href="/repositories">Browse Repositories</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {stats.recentReviews.slice(0, 5).map((review) => (
                    <Card key={review.id} className="group hover:border-dm-bg-border-strong transition-colors">
                      <Link href={`/reviews/${review.id}`} className="block p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span className="font-mono text-xs text-dm-text-muted">{review.repository.fullName}#{review.pr.number}</span>
                              <Badge variant={review.assessment === "PASS" ? "success" : "warning"} className={getAssessmentColor(review.assessment)}>
                                {review.assessment === "PASS" ? "Pass" : "Needs Attention"}
                              </Badge>
                            </div>
                            <p className="font-medium text-dm-text-primary truncate group-hover:text-dm-accent-amber transition-colors">{review.pr.title}</p>
                            <p className="text-xs text-dm-text-muted">by @{review.pr.authorLogin} • {formatRelativeTime(review.createdAt)}</p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {review.findings.slice(0, 3).map((f) => (
                              <Badge key={f.severity} variant="outline" className={getSeverityColor(f.severity)} size="xs">
                                {f.severity[0]}
                              </Badge>
                            ))}
                            {review.findings.length > 3 && (
                              <Badge variant="outline" size="xs">+{review.findings.length - 3}</Badge>
                            )}
                          </div>
                        </div>
                      </Link>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader className="flex items-center justify-between pb-3">
                  <CardTitle className="text-base">Agent Activity</CardTitle>
                  <Badge variant="amber" size="xs" className="animate-pulse">Active</Badge>
                </CardHeader>
                <CardContent className="pt-0">
                  <AgentProgress steps={agentSteps} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex items-center justify-between pb-3">
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                  <Button asChild variant="ghost" size="xs">
                    <Link href="/reviews">View all</Link>
                  </Button>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {recentActivity.map((activity, index) => (
                    <ActivityItem key={index} {...activity} />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <Button asChild variant="outline" className="w-full justify-start gap-3">
                    <Link href="/repositories">
                      <FolderGit2 className="w-4 h-4" />
                      <span>Manage Repositories</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start gap-3">
                    <Link href="/reviews">
                      <History className="w-4 h-4" />
                      <span>View All Reviews</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start gap-3">
                    <Link href="/settings">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}