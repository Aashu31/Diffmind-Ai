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
import { formatRelativeTime } from "@/lib/utils";
import { Github, LogOut, User, LayoutDashboard, FolderGit2, History, Settings, Loader2, AlertTriangle, CheckCircle2, XCircle, ExternalLink } from "lucide-react";

interface Repository {
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

export default function RepositoriesPage() {
  const router = useRouter();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [user, setUser] = useState<{ id: string; login: string; name: string | null; email: string | null; avatarUrl: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [userRes, reposRes] = await Promise.all([api.auth.me(), api.repositories.list()]);
        setUser(userRes.user);
        setRepositories(reposRes.repositories);
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderGit2 className="h-8 w-8 text-primary" />
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
          <h1 className="text-3xl font-bold">Repositories</h1>
          <p className="text-muted-foreground">Connected GitHub repositories with DiffMind AI</p>
        </div>

        {repositories.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 pb-6 text-center">
              <FolderGit2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No repositories connected</h2>
              <p className="text-muted-foreground mb-6">
                Install the DiffMind GitHub App on your repositories to start receiving automated code reviews.
              </p>
              <Button asChild variant="outline">
                <Link href="https://github.com/apps/diffmind-ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  Install GitHub App
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {repositories.map((repo) => (
              <Card key={repo.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={repo.ownerAvatarUrl ?? undefined} alt={repo.ownerLogin} />
                        <AvatarFallback>{repo.ownerLogin[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <Link href={`/repositories/${repo.id}`} className="font-semibold hover:text-primary transition-colors">
                          {repo.fullName}
                        </Link>
                        <p className="text-sm text-muted-foreground">@{repo.ownerLogin} • {repo.defaultBranch}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={repo.private ? "secondary" : "default"}>{repo.private ? "Private" : "Public"}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {repo.pullRequests.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No recent pull requests</p>
                    ) : (
                      repo.pullRequests.slice(0, 5).map((pr) => (
                        <Link key={pr.id} href={`/repositories/${repo.id}`} className="block">
                          <div className="flex items-center justify-between p-2 hover:bg-accent rounded transition-colors">
                            <div className="flex-1 min-w-0">
                              <p className="font-mono text-sm truncate">#{pr.number} {pr.title}</p>
                              <p className="text-xs text-muted-foreground">by @{pr.authorLogin} • {formatRelativeTime(pr.updatedAt)}</p>
                            </div>
                            <Badge variant={pr.state === "open" ? "default" : pr.state === "merged" ? "secondary" : "destructive"} className="text-xs">
                              {pr.state}
                            </Badge>
                          </div>
                        </Link>
                      ))
                    )}
                    {repo.pullRequests.length > 5 && (
                      <Link href={`/repositories/${repo.id}`} className="text-sm text-primary hover:underline">
                        View all {repo.pullRequests.length} pull requests →
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="text-sm text-muted-foreground">Installed via @{repo.installation.accountLogin}</span>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`https://github.com/${repo.fullName}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        View on GitHub
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}