export const quorum = {
	lots: 40,
	agmNeed: 14,
	agmRule: 'At least one third of the votes. 13 of 40 is 32.5%, which is short of one third. 14 of 40 is a quorum.',
	councilNeed: 3,
	councilRule: 'A majority of the 5 members. Proxies are not used at council.',
	adjourn:
		'If an AGM or SGM is short of quorum after 30 minutes, it adjourns to the same time and place one week later. Whoever attends that second meeting is the quorum.'
};

export const nextAgm = {
	date: 'May 19, 2027',
	statutory: 'May 31, 2027',
	note: 'The Strata Property Act wants the AGM within two months of the March 31 year end. May 19 is the night council reserved. May 31 is the last lawful day. Quorum is 14 of 40.'
};

export const agm = {
	date: 'May 20, 2026',
	attendance: '22 of 40 lots, in person or by proxy',
	quorum: 'Met at 6:42 pm',
	resolutions: [
		{ vote: 'Majority', result: 'Passed 18–3, 1 abstention', text: 'Elect Helen Cho, Andre Bouchard, David Singh, Nora Ibrahim, and Carmen Alvarez to council.' },
		{ vote: 'Majority', result: 'Passed 20–2', text: 'Approve the April 1, 2026 – March 31, 2027 budget. Strata fees $324,000. Operating expenses $287,280. Other income $6,480.' },
		{ vote: 'Majority', result: 'Passed 19–3', text: 'Set the CRF contribution at $43,200. That is 15% of operating expenses and about 90% of the $48,000 in the depreciation report. Owners were shown the gap before they voted.' },
		{ vote: '3/4', result: 'Passed 17–4', text: 'Keep the war chest at 1.5% of fees ($405 a month, $4,860 a year), paid only from operating surplus, 3-of-5 multisig, watch-only in this software, disclosed on Form B. The CRF is not a source of bitcoin.' },
		{ vote: 'Majority', result: 'Passed 16–5', text: 'Waive a review engagement. North Shore Tax Co-op will compile the statements and prepare the T2 and T1044. Confirm this still matches the filed bylaws before relying on it.' },
		{ vote: 'Majority', result: 'Passed', text: 'Adopt the insurance renewal at $48,600 and record the $25,000 water deductible in the minutes so Form B can quote it.' }
	]
};

export const lastCouncil = {
	date: 'September 15, 2026',
	attendance: '5 of 5. Quorum met.',
	minutes: [
		'Approved the August bank reconciliations for operating, CRF, and the levy trust.',
		'Heard the lot 309 complaint. Notice had been served August 29. The 14-day window closed September 12. Marcus Webb did not attend. Fine of $200 under bylaw 9.2 passed 4–0. David Singh abstained and was not counted. Abstentions are ignored in a majority count.',
		'Directed the lawyer to draft a lien opinion for lot 207. No lien filing until the October 20 vote.',
		'Accepted Samira El-Masri’s first timesheet. Payroll remittance frequency still has to be read off the CRA letter.',
		'EPR consultant is at $4,200 of $6,500. Draft report promised December 15.',
		'Form B request for lot 201 logged. Secretary to issue Form B and Form F by October 5. Lot is clear.'
	]
};

export const nextCouncil = {
	date: 'October 20, 2026',
	time: '7:00–8:30 pm',
	place: 'Amenity room and the hybrid link in the notice',
	packageDue: 'October 16, 2026',
	agenda: [
		{ item: 'Quorum and conflicts', detail: 'Carmen Alvarez leaves for the levy-plan update. Helen Cho does not vote on her own prepaid status. Nobody else has a money conflict tonight.' },
		{ item: 'Release the T2 and T1044', detail: 'If they were not released on September 30, this is the makeup. Tax is zero. The returns still have to be filed. Late T1044 penalty is a daily amount with a floor and a cap — do not sit on a finished return.' },
		{ item: 'September financials', detail: 'Treasurer walks operating, CRF, levy, and the war chest. The three funds tie. Unmatched cash, if any, is named.' },
		{ item: 'Receivables', detail: 'Lot 104 promise date was October 3. Lot 207 lien vote. Lots 108 and 403 are on levy plans and are current on monthly fees. Lot 309 fine is unpaid.' },
		{ item: 'Lot 207 lien', detail: '3/4 vote is not required to start a lien under the SPA once the amount is owing, but this council promised itself a recorded vote. The lawyer attends by phone for ten minutes.' },
		{ item: 'Form K chase', detail: 'Lots 209 and 407 are past the two-week Form K deadline. Lot 309 has no Form K because the use is short-term and already fined.' },
		{ item: 'Insurance appraisal', detail: 'October 22 walk-through. Treasurer sends the loss history the next morning.' },
		{ item: 'EPR and EV', detail: 'Load study is finished. Four chargers are in. No new charger approval until the EPR draft is in, unless a statutory request forces a written answer inside three months.' },
		{ item: 'War chest', detail: '0.05000000 BTC, cost $6,885, fair value about $6,791. Unrealized loss is disclosed, not hidden. No sale is proposed.' }
	]
};

export const bylawCase = {
	lot: '309',
	bylaw: '9.2 — no stays under 30 days',
	fine: '$200 for one proven day',
	ceiling: 'This bylaw sets $200 a day. The regulation would allow a vacation-rental bylaw to go as high as $1,000 a day. Council did not adopt the higher number.',
	steps: [
		{ date: 'August 28, 2026', label: 'Written complaint', detail: 'Ingrid Solberg, lot 310. Dates, photos of luggage, and two nights of enterphone logs.' },
		{ date: 'August 29, 2026', label: 'Notice of complaint served', detail: 'Starts the 14 days. The software locks fine actions until that window closes.' },
		{ date: 'September 12, 2026', label: 'Window closed', detail: 'Owner did not ask for a hearing date of his own. Council had already set September 15.' },
		{ date: 'September 15, 2026', label: 'Hearing and fine', detail: 'Owner absent. 4 yes, 0 no, 1 abstention. Fine posted September 16. Unpaid at September 30, so Form F is withheld.' },
		{ date: 'Next breach', label: 'Daily fine, if proven', detail: 'A second notice is required for a new contravention. Do not stack days that were not in the notice.' }
	]
};

export const voteGuide = [
	{ kind: 'Majority', use: 'Budget, council election, ordinary decisions', count: 'Yes votes are more than no votes. Abstentions are not counted.' },
	{ kind: '3/4', use: 'Bylaw amendments, special levy, some CRF decisions', count: 'At least 3/4 of the votes cast by people present or by proxy, and the bylaw text has to match what was in the notice.' },
	{ kind: 'Unanimous', use: 'A few heavy SPA decisions, including some changes to unit entitlement', count: 'Every eligible vote has to be in favour. An owner who stays home defeats it. Read the section that demands it before the meeting is called.' },
	{ kind: '80%', use: 'Wind-up and a few other heavy decisions', count: '80% of all eligible votes, not just the people in the room. Abstentions and absences count as not-in-favour.' }
];
