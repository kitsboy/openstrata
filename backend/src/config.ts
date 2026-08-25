/**
 * Backend configuration — loaded from the environment. Falls back to the
 * local-dev default values documented in backend/.env.example. Never reads a
 * committed secret.
 */

export interface BackendConfig {
  dbUrl: string;
  host: string;
  port: number;
  ollamaBaseUrl: string;
  ollamaEmbedModel: string;
  ollamaChatModel: string;
  vectorCollection: string;
  crfMandatoryPct: number;
  reconScanDays: number;
}

const int = (v: string | undefined, fallback: number): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): BackendConfig {
  return {
    dbUrl:
      env.DATABASE_URL ??
      'postgres://openstrata:openstrata-dev-only@localhost:5432/openstrata',
    host: env.HOST ?? '127.0.0.1',
    port: int(env.PORT, 8080),
    ollamaBaseUrl: env.OLLAMA_BASE_URL ?? 'http://host.docker.internal:11434',
    ollamaEmbedModel: env.OLLAMA_EMBED_MODEL ?? 'nomic-embed-text',
    ollamaChatModel: env.OLLAMA_CHAT_MODEL ?? 'llama3.2',
    vectorCollection: env.VECTOR_COLLECTION ?? 'bc_spa_rta_crt',
    crfMandatoryPct: int(env.CRF_MANDATORY_PCT, 10),
    reconScanDays: int(env.RECON_SCAN_DAYS, 90)
  };
}