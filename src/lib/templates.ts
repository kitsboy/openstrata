import type { Translation } from '$lib/i18n';

export type Template = {
	title: keyof Translation;
	descriptionKey: keyof Translation;
	sourceKey: keyof Translation;
	category: keyof Translation;
	icon: string;
};

export const templates: Template[] = [
	{ title: 'formBTemplate', descriptionKey: 'formBDescription', sourceKey: 'formBSource', category: 'templateCategoryLegal', icon: '📄' },
	{ title: 'formFTemplate', descriptionKey: 'formFDescription', sourceKey: 'formFSource', category: 'templateCategoryLegal', icon: '🟢' },
	{ title: 'complaintNoticeTemplate', descriptionKey: 'complaintNoticeDescription', sourceKey: 'complaintNoticeSource', category: 'templateCategoryGovernance', icon: '⚖️' },
	{ title: 'meetingAgendaTemplate', descriptionKey: 'meetingAgendaDescription', sourceKey: 'meetingAgendaSource', category: 'templateCategoryGovernance', icon: '🗳️' },
	{ title: 'meetingMinutesTemplate', descriptionKey: 'meetingMinutesDescription', sourceKey: 'meetingMinutesSource', category: 'templateCategoryGovernance', icon: '📝' },
	{ title: 'budgetTemplate', descriptionKey: 'budgetDescription', sourceKey: 'budgetSource', category: 'templateCategoryFinance', icon: '💰' }
];
