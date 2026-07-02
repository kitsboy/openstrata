export const navItems = [
	{ href: '/', label: 'Dashboard' },
	{ href: '/about', label: 'About' },
	{ href: '/tools', label: 'Strata Tool' },
	{ href: '/compliance', label: 'Compliance' },
	{ href: '/roadmap', label: 'Roadmap' },
	{ href: '/docs', label: 'Docs' },
	{ href: '/rss', label: 'RSS & API' }
] as const;

export const socialLinks = [
	{ href: 'https://github.com/kitsboy/openstrata', label: 'GitHub', icon: 'github' as const },
	{ href: 'https://x.com/giveabit', label: 'X', icon: 'x' as const },
	{ href: 'mailto:hello@giveabit.io', label: 'hello@giveabit.io', icon: 'mail' as const }
] as const;