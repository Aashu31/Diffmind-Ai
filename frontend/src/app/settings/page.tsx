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
import { Github, LogOut, User, LayoutDashboard, FolderGit2, History, Settings, Loader2, Shield, Bell, Database } from "lucide-react";

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
        // In a real app, fetch from backend
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
    // In a real app, save to backend
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSaving(false);
  };

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
            <Settings className="h-8 w-8 text-primary" />
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

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure DiffMind AI behavior for your reviews</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Review Behavior</CardTitle>
            <CardDescription>Control how DiffMind reviews your pull requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Automatic Reviews</Label>
                  <p className="text-sm text-muted-foreground">Automatically review PRs when opened or updated</p>
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
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label>Minimum Confidence</Label>
                    <p className="text-sm text-muted-foreground">Only show findings above this confidence threshold</p>
                  </div>
                </div>
                <select
                  value={settings.minimumConfidence}
                  onChange={(e) => setSettings({ ...settings, minimumConfidence: parseFloat(e.target.value) })}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring w-32"
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
                <Database className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Maximum Findings</Label>
                  <p className="text-sm text-muted-foreground">Limit the number of findings per review</p>
                </div>
              </div>
              <select
                value={settings.maximumFindings}
                onChange={(e) => setSettings({ ...settings, maximumFindings: parseInt(e.target.value, 10) })}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring w-32"
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

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>DiffMind AI version information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span>0.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">AI Model</span>
              <span>NVIDIA Nemotron 3 Ultra 550B A55B</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">API Endpoint</span>
              <span className="font-mono">https://integrate.api.nvidia.com/v1</span>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </main>
    </div>
  );
}