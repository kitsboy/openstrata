/**
 * Rosa's BC SPA/RTA corpus — a small starter set of strict source records.
 * This mirrors the structured BC compliance KB (src/lib/compliance.ts and
 * docs/BC-STRATA-COMPLIANCE.md) as citation-first records. In production the
 * full corpus is indexed into pgvector and retrieved by embedding; Rosa only
 * answers from whatever is loaded here (citation-only, never fabricated).
 */

import type { SourceRecord } from './rosa.js';

export const BC_CORPUS: SourceRecord[] = [
  {
    citation: 'SPA s.146',
    title: 'Form K — Owner/tenant information',
    url: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/98243_00',
    text: 'Every strata corporation must request from each owner the name of every occupant of the owner\u2019s strata lot and the date occupancy began. Form K is used for this; a 14-day reminder loop triggers while forms are outstanding.'
  },
  {
    citation: 'SPA s.92\u201396',
    title: 'Operating fund and contingency reserve fund',
    url: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/98243_00',
    text: 'A strata corporation must have an operating fund and a contingency reserve fund. Unless the owners resolve otherwise, at least 10% of the annual contribution to the operating fund must be paid into the contingency reserve fund each year. Funds must not be co-mingled; ledger accounts must be kept separately.'
  },
  {
    citation: 'SPA s.256 & s.257',
    title: 'Form B (Information Certificate) and Form F (Certificate of Payment)',
    url: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/98243_00',
    text: 'Form B must be delivered within 7 days of a request and discloses fees, arrears, pending CRT/court cases and CRF balance. Form F certifies payment of all strata fees and other amounts for a unit; if the balance is greater than $0 the certificate is WITHHELD and the sale is blocked.'
  },
  {
    citation: 'SPA s.48',
    title: 'AGM quorum and the 30-minute rule',
    url: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/98243_00',
    text: 'Quorum for an AGM is persons holding or representing at least 1/3 of the strata corporation\u2019s strata lots (voters) or, for council, a majority of council members. If quorum is not met within 30 minutes of the meeting start the meeting must be rescheduled to occur at least 7 days later; at that meeting the persons present constitute quorum.'
  },
  {
    citation: 'SPA s.48 (voting)',
    title: 'Voting thresholds and abstentions',
    url: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/98243_00',
    text: 'Votes are calculated on yes/no from those present or by proxy; abstentions are completely excluded. Majority means more than half, 3/4 means at least 75%, 80% uses all eligible voters, and unanimous requires all owners voting in favour.'
  },
  {
    citation: 'Standard Bylaws — fines',
    title: 'Bylaw enforcement fines',
    url: 'https://www2.gov.bc.ca/gov/content/housing-tenancy/strata-housing',
    text: 'A strata corporation may impose a fine on an owner or tenant for contravening a bylaw. The maximum fine for a bylaw contravention is $200, except for short-term rental contraventions where the fine may be up to $1,000 per day. A written notice of complaint must be given first and at least 14 days must pass before a fine can be imposed without a hearing.'
  },
  {
    citation: 'SPA s.35',
    title: 'Records retention',
    url: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/98243_00',
    text: 'A strata corporation must keep records, including meeting minutes, minutes of council meetings, financial statements, notices of complaints and is required to retain them in accordance with SPA s.35. Some records are retained permanently.'
  }
];