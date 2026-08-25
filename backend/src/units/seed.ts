/**
 * Seeded unit registry for the scaffold + tests.
 *
 * The live product replaces this with a DB-backed `UnitRegistry` (the `unit`
 * table + SQL lookups), but the seam is identical: everything upstream talks to
 * `UnitRegistry`. Seeding keeps the API configurable before a real deployment.
 */

import { createRegistry, demoUnits, type UnitRegistry } from './model.js';

/** Process-wide default registry (demo building). */
export const DEFAULT_UNITS: UnitRegistry = createRegistry(demoUnits());