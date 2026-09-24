"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { Github, LogOut, User, LayoutDashboard, FolderGit2, History, Settings, Loader2, Shield, Bell, Database, Code2, Key, Globe, Users, Wrench } from "lucide-react";
import { Background } from "@/components/ui/background";
import { Panel } from "@/components/review/panels";

interface SettingsData {
  automaticReviews: boolean;
  minimumConfidence: number;
  maximumFindings: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    automaticReviews: true,
    minimumConfidence: 0.75,
    maximumFindings: 15,
  });
  const [user, setUser] = useState<{ id: string; login: string; name: string | null; email: string | null; avatarUrl: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await api.auth.me();
        setUser(userRes.user);
        setSettings({
          automaticReviews: true,
          minimumConfidence: 0.75,
          maximumFindings: 15,
        });
      } catch {
        window.location.href = "/auth/github";
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSaving(false);
  };

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
              <Settings className="w-7 h-7 text-dm-accent-amber" />
              <span className="text-lg font-bold text-dm-text-primary">Settings</span>
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

        <main className="container mx-auto px-4 py-6 md:py-8 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-dm-text-primary mb-2">Settings</h1>
            <p className="text-dm-text-secondary">Configure DiffMind AI behavior for your reviews</p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-dm-bg-surface border border-dm-bg-border flex items-center justify-center">
                    <Shield className="w-4 h-4 text-dm-accent-amber" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Review Behavior</CardTitle>
                    <CardDescription>Control how DiffMind reviews your pull requests</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-dm-bg-surface border border-dm-bg-border flex items-center justify-center">
                      <Shield className="w-4 h-4 text-dm-accent-amber" />
                    </div>
                    <div>
                      <Label>Automatic Reviews</Label>
                      <p className="text-sm text-dm-text-muted">Automatically review PRs when opened or updated</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.automaticReviews}
                    onCheckedChange={(checked) => setSettings({ ...settings, automaticReviews: checked })}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-dm-bg-surface border border-dm-bg-border flex items-center justify-center">
                        <Bell className="w-4 h-4 text-dm-warning" />
                      </div>
                      <div>
                        <Label>Minimum Confidence</Label>
                        <p className="text-sm text-dm-text-muted">Only show findings above this confidence threshold</p>
                      </div>
                    </div>
                    <select
                      value={settings.minimumConfidence}
                      onChange={(e) => setSettings({ ...settings, minimumConfidence: parseFloat(e.target.value) })}
                      className="px-3 py-2 bg-dm-bg-raised border border-dm-bg-border rounded-md text-sm text-dm-text-primary focus:outline-none focus:ring-2 focus:ring-dm-focus focus:border-transparent transition-all w-32 appearance-none bg-no-repeat bg-right pr-8"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2374756D' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: "right 8px center" }}
                    >
                      <option value={0.5}>50%</option>
                      <option value={0.6}>60%</option>
                      <option value={0.7}>70%</option>
                      <option value={0.75}>75%</option>
                      <option value={0.8}>80%</option>
                      <option value={0.85}>85%</option>
                      <option value={0.9}>90%</option>
                    </select>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-dm-bg-surface border border-dm-bg-border flex items-center justify-center">
                      <Database className="w-4 h-4 text-dm-success" />
                    </div>
                    <div>
                      <Label>Maximum Findings</Label>
                      <p className="text-sm text-dm-text-muted">Limit the number of findings per review</p>
                    </div>
                  </div>
                  <select
                    value={settings.maximumFindings}
                    onChange={(e) => setSettings({ ...settings, maximumFindings: parseInt(e.target.value, 10) })}
                    className="px-3 py-2 bg-dm-bg-raised border border-dm-bg-border rounded-md text-sm text-dm-text-primary focus:outline-none focus:ring-2 focus:ring-dm-focus focus:border-transparent transition-all w-32 appearance-none bg-no-repeat bg-right pr-8"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2374756D' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: "right 8px center" }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                    <option value={25}>25</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-dm-bg-surface border border-dm-bg-border flex items-center justify-center">
                    <Code2 className="w-4 h-4 text-dm-accent-amber" />
                  </div>
                  <div>
                    <CardTitle className="text-base">AI Model</CardTitle>
                    <CardDescription>Configure the AI model used for reviews</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Panel padding="md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-dm-bg-surface border border-dm-bg-border flex items-center justify-center">
                        <Brain className="w-4 h-4 text-dm-accent-amber" />
                      </div>
                      <div>
                        <p className="font-medium text-dm-text-primary">Nemotron 3 Ultra 550B A55B</p>
                        <p className="text-sm text-dm-text-muted">NVIDIA's flagship reasoning model</p>
                      </div>
                    </div>
                    <Badge variant="amber" size="sm">Active</Badge>
                  </div>
                </Panel>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <Panel padding="sm">
                    <p className="text-xs font-medium text-dm-text-muted uppercase tracking-wider mb-2">Temperature</p>
                    <p className="font-mono text-lg text-dm-text-primary">1.0</p>
                    <p className="text-xs text-dm-text-muted">Higher = more creative reasoning</p>
                  </Panel>
                  <Panel padding="sm">
                    <p className="text-xs font-medium text-dm-text-muted uppercase tracking-wider mb-2">Max Tokens</p>
                    <p className="font-mono text-lg text-dm-text-primary">16,384</p>
                    <p className="text-xs text-dm-text-muted">Maximum response length</p>
                  </Panel>
                  <Panel padding="sm">
                    <p className="text-xs font-medium text-dm-text-muted uppercase tracking-wider mb-2">Reasoning Effort</p>
                    <p className="font-mono text-lg text-dm-text-primary">High</p>
                    <p className="text-xs text-dm-text-muted">Deep analysis mode</p>
                  </Panel>
                  <Panel padding="sm">
                    <p className="text-xs font-medium text-dm-text-muted uppercase tracking-wider mb-2">Reasoning Budget</p>
                    <p className="font-mono text-lg text-dm-text-primary">12,000</p>
                    <p className="text-xs text-dm-text-muted">Token budget for reasoning</p>
                  </Panel>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-dm-bg-surface border border-dm-bg-border flex items-center justify-center">
                    <Key className="w-4 h-4 text-dm-accent-amber" />
                  </div>
                  <div>
                    <CardTitle className="text-base">GitHub Integration</CardTitle>
                    <CardDescription>Manage your GitHub App installation and permissions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Panel padding="md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-dm-bg-surface border border-dm-bg-border flex items-center justify-center">
                        <Github className="w-4 h-4 text-dm-accent-amber" />
                      </div>
                      <div>
                        <p className="font-medium text-dm-text-primary">GitHub App Connected</p>
                        <p className="text-sm text-dm-text-muted">DiffMind AI has access to installed repositories</p>
                      </div>
                    </div>
                    <Badge variant="success" size="sm">Active</Badge>
                  </div>
                </Panel>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-dm-bg-surface border border-dm-bg-border flex items-center justify-center">
                      <Globe className="w-4 h-4 text-dm-accent-amber" />
                    </div>
                    <div>
                      <Label>Repository Access</Label>
                      <p className="text-sm text-dm-text-muted">All repositories (configured in GitHub App settings)</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="https://github.com/settings/apps/diffmind-ai/installations" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Manage in GitHub
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-dm-bg-surface border border-dm-bg-border flex items-center justify-center">
                    <Wrench className="w-4 h-4 text-dm-accent-amber" />
                  </div>
                  <div>
                    <CardTitle className="text-base">About</CardTitle>
                    <CardDescription>DiffMind AI version information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <MetricRow label="Version" value="0.1.0" />
                  <MetricRow label="AI Model" value="Nemotron 3 Ultra 550B A55B" />
                  <MetricRow label="API Endpoint" value="integrate.api.nvidia.com/v1" rightElement={<span className="font-mono text-xs text-dm-text-muted">HTTPS</span>} />
                  <MetricRow label="GitHub API" value="REST API v3" />
                  <MetricRow label="Database" value="PostgreSQL + Prisma" />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end pt-4 border-t border-dm-bg-border/50">
              <Button onClick={handleSave} disabled={saving} variant="amber">
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

import { Brain } from "lucide-react";

interface MetricRowProps {
  label: string;
  value: string;
  rightElement?: React.ReactNode;
}

function MetricRow({ label, value, rightElement }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-dm-bg-border/50 last:border-0">
      <span className="text-sm text-dm-text-secondary">{label}</span>
      <div className="flex items-center gap-3 text-right">
        <span className="font-mono text-sm font-medium text-dm-text-primary">{value}</span>
        {rightElement}
      </div>
    </div>
  );
}