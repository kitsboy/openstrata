/**
 * Postgres BIGINT → JS number mapping.
 *
 * node-postgres returns int8 (BIGINT) columns as strings by default. The ledger
 * model treats `seq`, `amount_basis`, account ids and every balance as numbers
 * (strict === comparisons, Number.isInteger checks, arithmetic), so strings
 * leak through and break chain verification and the API contract. Registering
 * the parser once (globally, per pg module) makes every store + query return
 * numbers for int8/int4 columns. Small values here (seq, sats/bp amounts,
 * identity ids) are well within Number.MAX_SAFE_INTEGER.
 */
import pg from 'pg';

const toNumber = (v: string): number => Number(v);
pg.types.setTypeParser(pg.types.builtins.INT8, toNumber);
pg.types.setTypeParser(pg.types.builtins.INT4, toNumber);

export {};
