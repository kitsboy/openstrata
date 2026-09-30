import { writable } from 'svelte/store';

/** Lot currently shown on the always-on pay rail. Demo default is Priya in 305. */
export const payerUnitId = writable('305');
