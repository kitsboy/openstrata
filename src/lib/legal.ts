export type LegalSource = {
	title: string;
	authority: string;
	jurisdiction: string;
	url: string;
	kind: string;
};

/** Canonical primary/official source records — English by design until reviewed translations exist. */
export const legalSources: LegalSource[] = [
	{ title: 'BC Strata Property Act', authority: 'BC Laws', jurisdiction: 'BC', url: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/98043_00', kind: 'Primary legislation' },
	{ title: 'BC Strata Property Regulation', authority: 'BC Laws', jurisdiction: 'BC', url: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/12_43_2000', kind: 'Regulation' },
	{ title: 'BC Strata legislation and changes', authority: 'Government of British Columbia', jurisdiction: 'BC', url: 'https://www2.gov.bc.ca/gov/content/housing-tenancy/strata-housing/legislation-and-changes/strata-legislation', kind: 'Official guidance' },
	{ title: 'Information and record keeping', authority: 'Government of British Columbia', jurisdiction: 'BC', url: 'https://www2.gov.bc.ca/gov/content/housing-tenancy/strata-housing/operating-a-strata/information-and-record-keeping', kind: 'Official guidance' },
	{ title: 'Civil Resolution Tribunal — strata disputes', authority: 'Civil Resolution Tribunal', jurisdiction: 'BC', url: 'https://civilresolutionbc.ca/how-the-crt-works/strata-property-disputes/', kind: 'Tribunal information' },
	{ title: 'BC Personal Information Protection Act', authority: 'BC Laws', jurisdiction: 'BC', url: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/03063_01', kind: 'Privacy legislation' },
	{ title: 'BC Electronic Transactions Act', authority: 'BC Laws', jurisdiction: 'BC', url: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/01010_01', kind: 'Electronic records legislation' },
	{ title: 'BC Human Rights Code', authority: 'BC Laws', jurisdiction: 'BC', url: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/00_96210_01', kind: 'Human rights legislation' }
];
