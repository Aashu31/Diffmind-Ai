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
import { api } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import { Github, LogOut, User, LayoutDashboard, FolderGit2, History, Settings, Loader2, ExternalLink, GitPullRequest, TrendingUp, Shield, Code2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Background } from "@/components/ui/background";
import { StatBlock, MetricRow } from "@/components/dashboard/metrics";

interface RepositoryDetail {
  id: string;
  name: string;
  fullName: string;
  ownerLogin: string;
  ownerAvatarUrl: string | null;
  private: boolean;
  defaultBranch: string;
  installation: { id: string; accountLogin: string };
  pullRequests: Array<{ id: string; number: number; title: string; state: string; authorLogin: string; updatedAt: string }>;
}

export default function RepositoryDetailPage() {
  const params = useParams();
  const repoId = params.id as string;
  const [repository, setRepository] = useState<RepositoryDetail | null>(null);
  const [user, setUser] = useState<{ id: string; login: string; name: string | null; email: string | null; avatarUrl: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [userRes, repoRes] = await Promise.all([api.auth.me(), api.repositories.get(repoId)]);
        setUser(userRes.user);
        setRepository(repoRes.repository);
      } catch {
        window.location.href = "/auth/github";
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [repoId]);

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

  if (!user || !repository) {
    return null;
  }

  const openPRs = repository.pullRequests.filter((pr) => pr.state === "open");

  return (
    <>
      <Background intensity="subtle" />
      <div className="relative z-10 min-h-screen">
        <header className="border-b border-dm-bg-border/50 backdrop-blur-sm bg-dm-bg-deep/80 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/repositories" className="text-dm-text-muted hover:text-dm-text-primary transition-colors">
                <FolderGit2 className="w-5 h-5" />
              </Link>
              <Separator orientation="vertical" className="h-5 mx-2" />
              <span className="text-lg font-bold text-dm-text-primary">{repository.fullName}</span>
              <Badge variant={repository.private ? "secondary" : "outline"} size="sm">{repository.private ? "Private" : "Public"}</Badge>
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
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-dm-text-primary">{repository.name}</h1>
                <Badge variant={repository.private ? "secondary" : "outline"}>{repository.private ? "Private" : "Public"}</Badge>
              </div>
              <p className="text-dm-text-secondary">@{repository.ownerLogin} • Default branch: {repository.defaultBranch}</p>
            </div>
            <Button asChild variant="outline">
              <Link href={`https://github.com/${repository.fullName}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                View on GitHub
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <StatBlock
              label="Total Pull Requests"
              value={repository.pullRequests.length}
              subtitle={`+${openPRs.length} open`}
              icon={<GitPullRequest className="w-6 h-6" />}
            />
            <StatBlock
              label="Open PRs"
              value={openPRs.length}
              icon={<GitPullRequest className="w-6 h-6" />}
            />
            <StatBlock
              label="Installed via"
              value={repository.installation.accountLogin}
              icon={<Shield className="w-6 h-6" />}
            />
            <StatBlock
              label="Default Branch"
              value={repository.defaultBranch}
              icon={<Code2 className="w-6 h-6" />}
            />
          </div>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Pull Requests</CardTitle>
              <Badge variant="outline">{openPRs.length} open</Badge>
            </CardHeader>
            <CardContent className="pt-2">
              {repository.pullRequests.length === 0 ? (
                <div className="text-center py-12">
                  <GitPullRequest className="w-12 h-12 text-dm-text-muted mx-auto mb-4" />
                  <p className="text-dm-text-secondary">No pull requests yet</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {repository.pullRequests.map((pr) => (
                    <Link key={pr.id} href={`/reviews/${pr.id}`} className="block">
                      <div className="flex items-center justify-between p-4 border-b border-dm-bg-border/50 last:border-0 hover:bg-dm-bg-raised/50 transition-colors">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{pr.authorLogin[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm text-dm-text-muted">#{pr.number}</span>
                              <Badge variant={pr.state === "open" ? "success" : pr.state === "merged" ? "amber" : "critical"} size="sm">
                                {pr.state}
                              </Badge>
                            </div>
                            <p className="font-medium text-dm-text-primary truncate">{pr.title}</p>
                            <p className="text-sm text-dm-text-muted">
                              by @{pr.authorLogin} • {formatRelativeTime(pr.updatedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-dm-text-muted flex-shrink-0">
                          <span className="font-mono text-dm-text-dim">#{pr.number}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}