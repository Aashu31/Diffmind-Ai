import Fastify from "fastify";
import { fastifyCookie } from "@fastify/cookie";
import { fastifySession } from "@fastify/session";
import { fastifyCors } from "@fastify/cors";
import { handleGitHubWebhook } from "./github/webhooks/handler";
import { env } from "./config";
import { prisma } from "./db/client";

const server = Fastify({
  logger: {
    level: env.LOG_LEVEL,
    transport: process.env.NODE_ENV !== "production" ? { target: "pino-pretty" } : undefined,
  },
});

async function registerPlugins() {
  await server.register(fastifyCors, {
    origin: env.APP_URL,
    credentials: true,
  });

  await server.register(fastifyCookie, {
    secret: env.SESSION_SECRET,
    parseOptions: {},
  });

  await server.register(fastifySession, {
    secret: env.SESSION_SECRET,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
    saveUninitialized: false,
  });
}

server.addContentTypeParser("application/json", { parseAs: "string" }, (req, body, done) => {
  try {
    done(null, JSON.parse(body as string));
  } catch {
    done(new Error("Invalid JSON"), undefined);
  }
});

server.post("/api/webhooks/github", handleGitHubWebhook);

server.get("/api/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

server.get("/api/installations", async (request) => {
  const session = request.session as { userId?: string };
  if (!session.userId) {
    return { installations: [] };
  }

  const installations = await prisma.gitHubInstallation.findMany({
    where: { users: { some: { id: session.userId } } },
    include: { repositories: true },
  });

  return { installations };
});

server.get("/api/repositories", async (request) => {
  const session = request.session as { userId?: string };
  if (!session.userId) {
    return { repositories: [] };
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId }, include: { installations: true } });
  if (!user) {
    return { repositories: [] };
  }

  const installationIds = user.installations.map((i) => i.id);
  const repositories = await prisma.repository.findMany({
    where: { installationId: { in: installationIds } },
    include: { installation: true },
    orderBy: { updatedAt: "desc" },
  });

  return { repositories };
});

server.get("/api/repositories/:id", async (request, reply) => {
  const session = request.session as { userId?: string };
  if (!session.userId) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  const { id } = request.params as { id: string };
  const repository = await prisma.repository.findFirst({
    where: { id, installation: { users: { some: { id: session.userId } } } },
    include: { installation: true, pullRequests: { orderBy: { updatedAt: "desc" }, take: 20 } },
  });

  if (!repository) {
    return reply.code(404).send({ error: "Not found" });
  }

  return { repository };
});

server.get("/api/reviews", async (request, reply) => {
  const session = request.session as { userId?: string };
  if (!session.userId) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId }, include: { installations: true } });
  if (!user) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  const installationIds = user.installations.map((i) => i.id);
  const repositoryIds = (await prisma.repository.findMany({ where: { installationId: { in: installationIds } }, select: { id: true } })).map((r) => r.id);

  const reviews = await prisma.review.findMany({
    where: { repositoryId: { in: repositoryIds } },
    include: { pr: true, repository: true, findings: true, job: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return { reviews };
});

server.get("/api/reviews/:id", async (request, reply) => {
  const session = request.session as { userId?: string };
  if (!session.userId) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  const { id } = request.params as { id: string };
  const user = await prisma.user.findUnique({ where: { id: session.userId }, include: { installations: true } });
  if (!user) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  const installationIds = user.installations.map((i) => i.id);
  const repositoryIds = (await prisma.repository.findMany({ where: { installationId: { in: installationIds } }, select: { id: true } })).map((r) => r.id);

  const review = await prisma.review.findFirst({
    where: { id, repositoryId: { in: repositoryIds } },
    include: { pr: true, repository: true, findings: true, job: true },
  });

  if (!review) {
    return reply.code(404).send({ error: "Not found" });
  }

  return { review };
});

server.get("/api/dashboard/stats", async (request, reply) => {
  const session = request.session as { userId?: string };
  if (!session.userId) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId }, include: { installations: true } });
  if (!user) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  const installationIds = user.installations.map((i) => i.id);
  const repositoryIds = (await prisma.repository.findMany({ where: { installationId: { in: installationIds } }, select: { id: true } })).map((r) => r.id);

  const [totalRepos, totalReviews, recentReviews, openFindings] = await Promise.all([
    prisma.repository.count({ where: { installationId: { in: installationIds } } }),
    prisma.review.count({ where: { repositoryId: { in: repositoryIds } } }),
    prisma.review.findMany({
      where: { repositoryId: { in: repositoryIds } },
      include: { pr: true, repository: true, findings: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.finding.count({
      where: { review: { repositoryId: { in: repositoryIds } } },
    }),
  ]);

  return { totalRepos, totalReviews, recentReviews, openFindings };
});

server.get("/auth/github", async (request, reply) => {
  const state = crypto.randomUUID();
  (request.session as any).oauthState = state;

  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: `${env.API_URL}/auth/github/callback`,
    scope: "read:user user:email",
    state,
    allow_signup: "true",
  });

  return reply.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

server.get("/auth/github/callback", async (request, reply) => {
  const { code, state } = request.query as { code: string; state: string };
  const session = request.session as { oauthState?: string };

  if (state !== session.oauthState) {
    return reply.code(400).send({ error: "Invalid state" });
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenResponse.json() as { access_token: string; error?: string };
  if (tokenData.error) {
    return reply.code(400).send({ error: tokenData.error });
  }

  const userResponse = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: "application/vnd.github+json" },
  });
  const githubUser = await userResponse.json() as { id: number; login: string; name: string | null; email: string | null; avatar_url: string };

  const emailsResponse = await fetch("https://api.github.com/user/emails", {
    headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: "application/vnd.github+json" },
  });
  const emails = await emailsResponse.json() as Array<{ email: string; primary: boolean; verified: boolean }>;
  const primaryEmail = emails.find((e) => e.primary && e.verified)?.email ?? githubUser.email;

  let user = await prisma.user.findUnique({ where: { githubId: githubUser.id } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        githubId: githubUser.id,
        login: githubUser.login,
        name: githubUser.name,
        email: primaryEmail,
        avatarUrl: githubUser.avatar_url,
        accessToken: tokenData.access_token,
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        login: githubUser.login,
        name: githubUser.name,
        email: primaryEmail,
        avatarUrl: githubUser.avatar_url,
        accessToken: tokenData.access_token,
      },
    });
  }

  const installationsResponse = await fetch("https://api.github.com/user/installations", {
    headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: "application/vnd.github+json" },
  });
  const installationsData = await installationsResponse.json() as { installations: Array<{ id: number; account: { login: string; type: string; avatar_url: string }; target_type: string; permissions: Record<string, string> }> };

  for (const inst of installationsData.installations) {
    let dbInstallation = await prisma.gitHubInstallation.findUnique({ where: { installationId: inst.id } });

    if (!dbInstallation) {
      dbInstallation = await prisma.gitHubInstallation.create({
        data: {
          installationId: inst.id,
          accountLogin: inst.account.login,
          accountType: inst.account.type,
          accountAvatarUrl: inst.account.avatar_url,
          targetType: inst.target_type,
          permissions: inst.permissions,
          users: { connect: { id: user.id } },
        },
      });
    } else {
      await prisma.gitHubInstallation.update({
        where: { id: dbInstallation.id },
        data: {
          accountLogin: inst.account.login,
          accountType: inst.account.type,
          accountAvatarUrl: inst.account.avatar_url,
          targetType: inst.target_type,
          permissions: inst.permissions,
          users: { connect: { id: user.id } },
        },
      });
    }
  }

  (request.session as any).userId = user.id;
  delete (request.session as any).oauthState;

  return reply.redirect(`${env.APP_URL}/dashboard`);
});

server.post("/auth/logout", async (request, reply) => {
  await request.session.destroy();
  return reply.send({ ok: true });
});

server.get("/auth/me", async (request, reply) => {
  const session = request.session as { userId?: string };
  if (!session.userId) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  return { user: { id: user.id, login: user.login, name: user.name, email: user.email, avatarUrl: user.avatarUrl } };
});

const start = async () => {
  try {
    await registerPlugins();
    await server.listen({ port: 4000, host: "0.0.0.0" });
    console.log("Server running on http://localhost:4000");
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();