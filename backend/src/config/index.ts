import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),

  GITHUB_APP_ID: z.string().min(1),
  GITHUB_APP_PRIVATE_KEY: z.string().min(1),
  GITHUB_WEBHOOK_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),

  APP_URL: z.string().url(),
  API_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),

  NVIDIA_API_KEY: z.string().min(1),
  NVIDIA_BASE_URL: z.string().url().default("https://integrate.api.nvidia.com/v1"),
  NVIDIA_MODEL: z.string().default("nvidia/nemotron-3-ultra-550b-a55b"),
  NVIDIA_TEMPERATURE: z.coerce.number().default(1),
  NVIDIA_TOP_P: z.coerce.number().default(0.95),
  NVIDIA_MAX_TOKENS: z.coerce.number().default(16384),
  NVIDIA_TIMEOUT_MS: z.coerce.number().default(180000),
  NVIDIA_REASONING_EFFORT: z.enum(["low", "medium", "high"]).default("high"),
  NVIDIA_REASONING_BUDGET: z.coerce.number().default(12000),

  DIFFMIND_MAX_AGENT_STEPS: z.coerce.number().default(6),
  DIFFMIND_MIN_CONFIDENCE: z.coerce.number().default(0.75),
  DIFFMIND_MAX_FINDINGS: z.coerce.number().default(15),

  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid environment variables:", result.error.flatten().fieldErrors);
    process.exit(1);
  }
  cachedEnv = result.data;
  return cachedEnv;
}

export const env = getEnv();