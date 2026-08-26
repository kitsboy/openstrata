/**
 * Backend configuration — loaded from the environment. Falls back to the
 * local-dev default values documented in backend/.env.example. Never reads a
 * committed secret.
 */

import type { RailRegistry } from './rails/rails.js';

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
  /** HS256 JWT signing secret — MUST be a strong random value in production. */
  authSecret: string;
  /** Bearer token lifetime in seconds (default 12h). */
  authTokenTtl: number;
  /** Sovereign payment rails — which are enabled and where their daemons live. */
  rails: RailRegistry;
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
    reconScanDays: int(env.RECON_SCAN_DAYS, 90),
    authSecret: env.AUTH_SECRET ?? 'dev-only-insecure-secret-change-me',
    authTokenTtl: int(env.AUTH_TOKEN_TTL, 12 * 60 * 60),
    rails: {
      fiat: { enabled: true },
      onchain: { enabled: env.BITCOIN_RAIL_ENABLED === 'true', endpoint: env.LND_URL || env.BITCOIN_NODE_URL },
      lightning: { enabled: env.LIGHTNING_RAIL_ENABLED === 'true', endpoint: env.LND_URL, network: (env.LIGHTNING_NETWORK as never) || 'mainnet' },
      liquid: { enabled: env.LIQUID_RAIL_ENABLED === 'true', endpoint: env.LIQUID_URL },
      paynym_bip47: { enabled: env.PAYNYM_RAIL_ENABLED === 'true', endpoint: env.PAYNYM_NOTIFIER_URL },
      nostr: { enabled: env.NOSTR_RAIL_ENABLED === 'true', endpoint: env.NOSTR_RELAYS }
    }
  };
}