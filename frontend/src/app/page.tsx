import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Github, Shield, Zap, Brain, Code2, CheckCircle2, ArrowRight, ExternalLink } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <div className="relative z-10 min-h-screen bg-dm-bg-deep">
        <header className="border-b border-dm-bg-border/50 backdrop-blur-sm bg-dm-bg-deep/80 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-dm-accent-amber to-dm-accent-amber-bright flex items-center justify-center">
                <Brain className="w-5 h-5 text-dm-bg-deep" />
              </div>
              <span className="text-xl font-bold text-dm-text-primary">DiffMind AI</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="#features" className="text-sm text-dm-text-secondary hover:text-dm-text-primary transition-colors">Features</Link>
              <Link href="#how-it-works" className="text-sm text-dm-text-secondary hover:text-dm-text-primary transition-colors">How it Works</Link>
              <Link href="#tech-stack" className="text-sm text-dm-text-secondary hover:text-dm-text-primary transition-colors">Tech Stack</Link>
              <Link href="/auth/github" className="text-sm text-dm-text-secondary hover:text-dm-text-primary transition-colors">Sign In</Link>
              <Button asChild variant="amber" size="sm">
                <Link href="/auth/github" className="flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  Connect GitHub
                </Link>
              </Button>
            </nav>
          </div>
        </header>

        <main>
          <section className="relative py-24 md:py-32 lg:py-40">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dm-accent-amber/15 border border-dm-accent-amber/30 text-dm-accent-amber text-sm font-medium mb-6">
                    <span className="w-2 h-2 rounded-full bg-dm-accent-amber animate-pulse-slow" />
                    V0 \u2014 Foundation Release
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-dm-text-primary leading-[1.1] mb-6">
                    AI code review that{' '}
                    <span className="text-dm-accent-amber">actually helps</span>.
                  </h1>
                  <p className="text-lg md:text-xl text-dm-text-secondary leading-relaxed mb-8 max-w-xl">
                    DiffMind uses NVIDIA Nemotron 3 Ultra to analyse code changes, reason about potential issues,
                    and publish actionable review feedback directly on GitHub.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
                    <Button asChild size="lg" variant="amber">
                      <Link href="/auth/github" className="flex items-center gap-2">
                        <Github className="w-5 h-5" />
                        Start with GitHub
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link href="#how-it-works" className="flex items-center gap-2">
                        View Demo
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-dm-text-muted">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-dm-success" />
                      GitHub App integration
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-dm-success" />
                      Read-only repository inspection
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-dm-success" />
                      Structured findings with confidence
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-[4/3] max-w-[600px] mx-auto bg-dm-bg-raised border border-dm-bg-border rounded-xl p-6">
                    <svg viewBox="0 0 400 300" className="w-full h-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                      <defs>
                        <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#D8A84E" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#E8C36A" stopOpacity="0.05" />
                        </linearGradient>
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      <rect x="30" y="30" width="340" height="240" rx="8" fill="url(#amberGrad)" stroke="#2A2C25" strokeWidth="0.5" filter="url(#glow)" />
                      <rect x="50" y="50" width="140" height="180" rx="6" fill="#10120F" stroke="#2A2C25" strokeWidth="0.5" strokeDasharray="4 4" />
                      <rect x="210" y="50" width="140" height="85" rx="6" fill="#10120F" stroke="#78B887" strokeWidth="0.5" />
                      <rect x="210" y="155" width="140" height="75" rx="6" fill="#10120F" stroke="#D85B4F" strokeWidth="0.5" strokeDasharray="4 4" />

                      <g stroke="#2A2C25" strokeWidth="0.4" fill="none">
                        <line x1="190" y1="140" x2="210" y2="140" />
                        <line x1="190" y1="170" x2="210" y2="170" />
                        <line x1="190" y1="200" x2="210" y2="200" />
                      </g>

                      <g stroke="#D8A84E" strokeWidth="1" fill="none" strokeDasharray="6 4">
                        <path d="M190 140 Q250 100 320 120" />
                        <path d="M190 170 Q250 150 320 160" />
                        <path d="M190 200 Q250 200 320 190" />
                      </g>

                      <g stroke="#78B887" strokeWidth="1" fill="none" strokeDasharray="6 4">
                        <path d="M190 140 Q200 80 250 60" />
                      </g>

                      <g stroke="#D85B4F" strokeWidth="1" fill="none" strokeDasharray="4 6">
                        <path d="M190 200 Q200 240 250 260" />
                      </g>

                      <circle cx="320" cy="120" r="4" fill="#D8A84E" opacity="0.8" />
                      <circle cx="250" cy="60" r="3" fill="#78B887" opacity="0.8" />
                      <circle cx="250" cy="260" r="3" fill="#D85B4F" opacity="0.8" />

                      <g font-family="monospace" font-size="7" fill="#74756D">
                        <text x="60" y="70">function</text>
                        <text x="60" y="85">authenticate(</text>
                        <text x="75" y="100">token:</text>
                        <text x="60" y="115">string</text>
                        <text x="60" y="130">)</text>
                        <text x="60" y="145">{"{"}</text>
                        <text x="75" y="160">const</text>
                        <text x="60" y="175">user</text>
                        <text x="60" y="190">{"}"}</text>
                      </g>

                      <g font-family="monospace" font-size="7" fill="#74756D">
                        <text x="220" y="70">+ const user =</text>
                        <text x="235" y="85">await db.users.</text>
                        <text x="220" y="100">find(...)</text>
                        <text x="220" y="115">+ if (!user)</text>
                        <text x="235" y="130">throw</text>
                        <text x="220" y="145">Error</text>
                      </g>

                      <g font-family="monospace" font-size="7" fill="#74756D">
                        <text x="220" y="165">+ authorize(</text>
                        <text x="235" y="180">user, resource</text>
                        <text x="220" y="195">)</text>
                        <text x="220" y="210">+ if (!perms.</text>
                        <text x="220" y="225">includes(resource))</text>
                      </g>
                    </svg>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 text-xs text-dm-text-muted">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-dm-success" />
                        Original Code
                      </span>
                      <span className="w-px h-4 bg-dm-bg-border" />
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-dm-accent-amber" />
                        Your Changes
                      </span>
                      <span className="w-px h-4 bg-dm-bg-border" />
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-dm-success" />
                        AI Analysis
                      </span>
                      <span className="w-px h-4 bg-dm-bg-border" />
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-dm-critical" />
                        Insights
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="how-it-works" className="py-24 md:py-32">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-dm-text-primary mb-4">How it works</h2>
                <p className="text-lg text-dm-text-secondary">
                  DiffMind integrates with your GitHub repositories through a GitHub App.
                  When a Pull Request is opened or updated, DiffMind analyses the changes and posts a review.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <Card className="group">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-dm-bg-surface border border-dm-bg-border flex items-center justify-center group-hover:bg-dm-accent-amber/10 group-hover:border-dm-accent-amber/30 transition-all">
                        <Code2 className="w-5 h-5 text-dm-accent-amber" />
                      </div>
                      <span className="px-2 py-1 text-xs font-medium rounded border border-dm-bg-border bg-dm-bg-raised text-dm-text-muted">1</span>
                    </div>
                    <h3 className="font-semibold text-dm-text-primary mb-2">PR Opened</h3>
                    <p className="text-sm text-dm-text-secondary">Developer opens a Pull Request on GitHub</p>
                  </CardContent>
                </Card>

                <Card className="group">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-dm-bg-surface border border-dm-bg-border flex items-center justify-center group-hover:bg-dm-accent-amber/10 group-hover:border-dm-accent-amber/30 transition-all">
                        <Brain className="w-5 h-5 text-dm-accent-amber" />
                      </div>
                      <span className="px-2 py-1 text-xs font-medium rounded border border-dm-bg-border bg-dm-bg-raised text-dm-text-muted">2</span>
                    </div>
                    <h3 className="font-semibold text-dm-text-primary mb-2">AI Analysis</h3>
                    <p className="text-sm text-dm-text-secondary">Nemotron 3 Ultra reviews the diff with read-only repository inspection tools</p>
                  </CardContent>
                </Card>

                <Card className="group">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-dm-bg-surface border border-dm-bg-border flex items-center justify-center group-hover:bg-dm-success/10 group-hover:border-dm-success/30 transition-all">
                        <CheckCircle2 className="w-5 h-5 text-dm-success" />
                      </div>
                      <span className="px-2 py-1 text-xs font-medium rounded border border-dm-bg-border bg-dm-bg-raised text-dm-text-muted">3</span>
                    </div>
                    <h3 className="font-semibold text-dm-text-primary mb-2">Review Posted</h3>
                    <p className="text-sm text-dm-text-secondary">Findings appear as inline comments and a summary review on GitHub</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section id="features" className="py-24 md:py-32 bg-dm-bg-surface/50">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-dm-text-primary mb-4">What V0 can do</h2>
                <p className="text-lg text-dm-text-secondary">
                  DiffMind V0 focuses on the core review loop: reliable, secure, and useful.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {[
                  { icon: Github, title: "GitHub PR Integration", desc: "Automatic review trigger on open/sync", accent: "amber" },
                  { icon: Brain, title: "Nemotron 3 Ultra", desc: "Advanced reasoning for code analysis", accent: "amber" },
                  { icon: Shield, title: "Read-only Tools", desc: "Safe repository inspection only", accent: "success" },
                  { icon: Zap, title: "Structured Findings", desc: "Severity, category, confidence scores", accent: "critical" },
                ].map(({ icon: Icon, title, desc, accent }) => (
                  <Card key={title} className="group h-full">
                    <CardContent className="pt-6">
                      <div className="w-10 h-10 rounded-lg bg-dm-bg-surface border border-dm-bg-border flex items-center justify-center group-hover:bg-dm-accent-amber/10 group-hover:border-dm-accent-amber/30 transition-all mb-4">
                        <Icon className="w-5 h-5 text-dm-accent-amber" />
                      </div>
                      <h3 className="font-semibold text-dm-text-primary mb-2">{title}</h3>
                      <p className="text-sm text-dm-text-secondary">{desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <section id="tech-stack" className="py-24 md:py-32">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-dm-text-primary mb-4">Tech Stack</h2>
                <p className="text-lg text-dm-text-secondary">
                  Built with modern, production-ready technologies.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <Card>
                  <CardContent className="pt-6 pb-6 text-center">
                    <h3 className="font-semibold text-dm-text-primary mb-2">Frontend</h3>
                    <p className="text-sm text-dm-text-secondary">Next.js 14 \u2022 React 18 \u2022 TypeScript \u2022 Tailwind CSS \u2022 shadcn/ui \u2022 Radix UI</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 pb-6 text-center">
                    <h3 className="font-semibold text-dm-text-primary mb-2">Backend</h3>
                    <p className="text-sm text-dm-text-secondary">Fastify \u2022 TypeScript \u2022 Prisma \u2022 PostgreSQL \u2022 Octokit \u2022 Pino</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 pb-6 text-center">
                    <h3 className="font-semibold text-dm-text-primary mb-2">AI & Infrastructure</h3>
                    <p className="text-sm text-dm-text-secondary">NVIDIA Nemotron 3 Ultra 550B \u2022 OpenAI-compatible SDK \u2022 GitHub App \u2022 Webhooks</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section className="py-24 md:py-32 bg-dm-bg-surface/50">
            <div className="container mx-auto px-4 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-dm-text-primary mb-4">Ready to improve your code reviews?</h2>
              <p className="text-lg text-dm-text-secondary mb-8">
                Connect DiffMind to your GitHub repositories and start getting actionable AI-powered reviews on every Pull Request.
              </p>
              <Button asChild size="lg" variant="amber">
                <Link href="/auth/github" className="flex items-center gap-2 mx-auto">
                  <Github className="w-5 h-5" />
                  Connect GitHub & Start Reviewing
                </Link>
              </Button>
            </div>
          </section>
        </main>

        <footer className="border-t border-dm-bg-border/50 py-12 bg-dm-bg-deep/80 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-dm-accent-amber to-dm-accent-amber-bright flex items-center justify-center">
                    <Brain className="w-5 h-5 text-dm-bg-deep" />
                  </div>
                  <span className="text-xl font-bold text-dm-text-primary">DiffMind AI</span>
                </div>
                <p className="text-sm text-dm-text-secondary">AI-powered code review for GitHub Pull Requests.</p>
              </div>
              <div>
                <h4 className="font-semibold text-dm-text-primary mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-dm-text-secondary">
                  <li><a href="#features" className="hover:text-dm-text-primary transition-colors">Features</a></li>
                  <li><a href="#how-it-works" className="hover:text-dm-text-primary transition-colors">How it Works</a></li>
                  <li><a href="#tech-stack" className="hover:text-dm-text-primary transition-colors">Tech Stack</a></li>
                  <li><a href="/auth/github" className="hover:text-dm-text-primary transition-colors">Get Started</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-dm-text-primary mb-4">Resources</h4>
                <ul className="space-y-2 text-sm text-dm-text-secondary">
                  <li><a href="/dashboard" className="hover:text-dm-text-primary transition-colors">Dashboard</a></li>
                  <li><a href="/repositories" className="hover:text-dm-text-primary transition-colors">Repositories</a></li>
                  <li><a href="/reviews" className="hover:text-dm-text-primary transition-colors">Reviews</a></li>
                  <li><a href="/settings" className="hover:text-dm-text-primary transition-colors">Settings</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-dm-text-primary mb-4">Connect</h4>
                <ul className="space-y-2 text-sm text-dm-text-secondary">
                  <li><a href="https://github.com/Aashu31/Diffmind-Ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-dm-text-primary transition-colors"><ExternalLink className="w-4 h-4" /> GitHub</a></li>
                  <li><a href="#" className="hover:text-dm-text-primary transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-dm-text-primary transition-colors">Support</a></li>
                </ul>
              </div>
            </div>
            <Separator className="mb-8" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-dm-text-muted">
              <p>DiffMind AI V0 \u2014 Built with Nemotron 3 Ultra</p>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-dm-text-primary transition-colors">Privacy</a>
                <a href="#" className="hover:text-dm-text-primary transition-colors">Terms</a>
                <a href="#" className="hover:text-dm-text-primary transition-colors">License</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}