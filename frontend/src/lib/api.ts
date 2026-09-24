const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  auth: {
    me: () => fetchApi<{ user: { id: string; login: string; name: string | null; email: string | null; avatarUrl: string } }>("/auth/me"),
    logout: () => fetchApi<{ ok: boolean }>("/auth/logout", { method: "POST" }),
    githubUrl: () => `${API_BASE}/auth/github`,
  },

  installations: {
    list: () => fetchApi<{ installations: Array<{ id: string; installationId: number; accountLogin: string; accountAvatarUrl: string | null; repositories: Array<{ id: string; name: string; fullName: string; private: boolean }> }> }>("/api/installations"),
  },

  repositories: {
    list: () => fetchApi<{ repositories: Array<{ id: string; name: string; fullName: string; ownerLogin: string; ownerAvatarUrl: string | null; private: boolean; defaultBranch: string; installation: { id: string; accountLogin: string }; pullRequests: Array<{ id: string; number: number; title: string; state: string; authorLogin: string; updatedAt: string }> }> }>("/api/repositories"),
    get: (id: string) => fetchApi<{ repository: { id: string; name: string; fullName: string; ownerLogin: string; ownerAvatarUrl: string | null; private: boolean; defaultBranch: string; installation: { id: string; accountLogin: string }; pullRequests: Array<{ id: string; number: number; title: string; state: string; authorLogin: string; updatedAt: string }> } }>(`/api/repositories/${id}`),
  },

  reviews: {
    list: () => fetchApi<{ reviews: Array<{ id: string; summary: string; assessment: string; model: string; agentSteps: number; githubReviewId: number | null; createdAt: string; pr: { id: string; number: number; title: string; authorLogin: string; authorAvatarUrl: string | null; sourceBranch: string; targetBranch: string; headSha: string }; repository: { id: string; name: string; fullName: string }; findings: Array<{ id: string; file: string; line: number | null; severity: string; category: string; title: string; confidence: number }>; job: { id: string; status: string; agentSteps: number } }> }>("/api/reviews"),
    get: (id: string) => fetchApi<{ review: { id: string; summary: string; assessment: string; model: string; agentSteps: number; githubReviewId: number | null; createdAt: string; pr: { id: string; number: number; title: string; body: string | null; authorLogin: string; authorAvatarUrl: string | null; sourceBranch: string; targetBranch: string; headSha: string; additions: number; deletions: number; changedFiles: number }; repository: { id: string; name: string; fullName: string }; findings: Array<{ id: string; file: string; line: number | null; side: string | null; severity: string; category: string; title: string; description: string; recommendation: string | null; confidence: number; githubCommentId: number | null }>; job: { id: string; status: string; agentSteps: number; errorMessage: string | null } } }>(`/api/reviews/${id}`),
  },

  dashboard: {
    stats: () => fetchApi<{ totalRepos: number; totalReviews: number; recentReviews: Array<{ id: string; summary: string; assessment: string; createdAt: string; pr: { number: number; title: string; authorLogin: string }; repository: { name: string; fullName: string }; findings: Array<{ severity: string }> }>; openFindings: number }>("/api/dashboard/stats"),
  },
};