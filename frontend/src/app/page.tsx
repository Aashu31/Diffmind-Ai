import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Github, Shield, Zap, Brain, Code2, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">DiffMind AI</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/github">
              <Button variant="ghost">Sign in with GitHub</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            AI-powered code review for <span className="text-primary">GitHub Pull Requests</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            DiffMind uses NVIDIA Nemotron 3 Ultra to analyse code changes, reason about potential issues,
            and publish actionable review feedback directly on GitHub.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/github">
              <Button size="lg" className="gap-2">
                <Github className="h-5 w-5" />
                Start with GitHub
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline">
                How it works
              </Button>
            </Link>
          </div>
        </section>

        <section id="how-it-works" className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How it works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              DiffMind integrates with your GitHub repositories through a GitHub App.
              When a Pull Request is opened or updated, DiffMind analyses the changes and posts a review.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <Code2 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>1. PR Opened</CardTitle>
                <CardDescription>Developer opens a Pull Request on GitHub</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Brain className="h-10 w-10 text-primary mb-2" />
                <CardTitle>2. AI Analysis</CardTitle>
                <CardDescription>Nemotron 3 Ultra reviews the diff with read-only repository inspection tools</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle2 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>3. Review Posted</CardTitle>
                <CardDescription>Findings appear as inline comments and a summary review on GitHub</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 bg-muted/50 rounded-xl my-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What V0 can do</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              DiffMind V0 focuses on the core review loop: reliable, secure, and useful.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Github, title: "GitHub PR Integration", desc: "Automatic review trigger on open/sync" },
              { icon: Brain, title: "Nemotron 3 Ultra", desc: "Advanced reasoning for code analysis" },
              { icon: Shield, title: "Read-only Tools", desc: "Safe repository inspection only" },
              { icon: Zap, title: "Structured Findings", desc: "Severity, category, confidence scores" },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title}>
                <CardContent className="pt-6">
                  <Icon className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Tech Stack</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto text-center">
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-2">Frontend</h3>
              <p className="text-muted-foreground">Next.js 14 • React 18 • TypeScript • Tailwind CSS • shadcn/ui</p>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-2">Backend</h3>
              <p className="text-muted-foreground">Fastify • TypeScript • Prisma • PostgreSQL • Octokit</p>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-2">AI</h3>
              <p className="text-muted-foreground">NVIDIA Nemotron 3 Ultra 550B • OpenAI-compatible SDK</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>DiffMind AI V0 — Built with Nemotron 3 Ultra</p>
        </div>
      </footer>
    </div>
  );
}