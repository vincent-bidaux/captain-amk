// Types minimaux des bindings du Worker (voir wrangler.jsonc). Écrit à la main plutôt que via
// `wrangler types` : les types runtime complets de Workers écrasent ceux du DOM
// (ex. Response.json() typé `unknown`) et cassent le type-check de Next.

interface FeedbackKVNamespace {
  get<T = unknown>(key: string, type: "json"): Promise<T | null>;
  put(key: string, value: string): Promise<void>;
  list(options?: { cursor?: string; prefix?: string; limit?: number }): Promise<{
    keys: { name: string }[];
    list_complete: boolean;
    cursor?: string;
  }>;
}

interface CloudflareEnv {
  FEEDBACK_KV: FeedbackKVNamespace;
  ANTHROPIC_API_KEY?: string;
}
