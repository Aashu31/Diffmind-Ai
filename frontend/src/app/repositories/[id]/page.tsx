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
import { api } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import { Github, LogOut, User, LayoutDashboard, FolderGit2, History, Settings, Loader2, ExternalLink, GitPullRequest } from "lucide-react";

interface RepositoryDetail {
  id: string;
  name: string;
  fullName: string;
  ownerLogin: string;
  ownerAvatarUrl: string | null;
  private: boolean;
  defaultBranch: string;
  installation: { id: string; accountLogin: string };
  pullRequests: Array<{ id: string; number: number; title: string; state: string; authorLogin: string; authorAvatarUrl?: string | null; sourceBranch?: string; targetBranch?: string; additions?: number; deletions?: number; changedFiles?: number; updatedAt: string }>;
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
        // redirect handled by layout
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [repoId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !repository) {
    return null;
  }

  const openPRs = repository.pullRequests.filter((pr) => pr.state === "open");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/repositories" className="text-muted-foreground hover:text-foreground">
              <FolderGit2 className="h-5 w-5" />
            </Link>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <span className="text-xl font-bold">{repository.fullName}</span>
            <Badge variant={repository.private ? "secondary" : "default"}>{repository.private ? "Private" : "Public"}</Badge>
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{repository.name}</h1>
            <p className="text-muted-foreground">@{repository.ownerLogin} • Default branch: {repository.defaultBranch}</p>
          </div>
          <Button asChild variant="outline">
            <Link href={`https://github.com/${repository.fullName}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              View on GitHub
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{repository.pullRequests.length}</div>
              <p className="text-sm text-muted-foreground">Total Pull Requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{openPRs.length}</div>
              <p className="text-sm text-muted-foreground">Open Pull Requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{repository.installation.accountLogin}</div>
              <p className="text-sm text-muted-foreground">Installed via</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pull Requests</CardTitle>
              <Badge variant="outline">{openPRs.length} open</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {repository.pullRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <GitPullRequest className="h-12 w-12 mx-auto mb-4" />
                <p>No pull requests yet</p>
              </div>
            ) : (
              <div className="space-y-0">
                {repository.pullRequests.map((pr) => (
                  <Link key={pr.id} href={`/reviews/${pr.id}`} className="block">
                    <div className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={pr.authorAvatarUrl ?? undefined} alt={pr.authorLogin} />
                          <AvatarFallback>{pr.authorLogin[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-muted-foreground">#{pr.number}</span>
                            <Badge variant={pr.state === "open" ? "default" : pr.state === "merged" ? "secondary" : "destructive"} className="text-xs">
                              {pr.state}
                            </Badge>
                          </div>
                          <p className="font-medium truncate">{pr.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {pr.sourceBranch} → {pr.targetBranch} • by @{pr.authorLogin} • {formatRelativeTime(pr.updatedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>+{pr.additions} -{pr.deletions}</span>
                        <span className="font-mono">{pr.changedFiles} files</span>
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
  );
}