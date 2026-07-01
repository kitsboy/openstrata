export const navItems = [
	{ href: '/', label: 'Dashboard' },
	{ href: '/compliance', label: 'BC Compliance' },
	{ href: '/docs', label: 'Docs' },
	{ href: '/rss', label: 'RSS & API' },
	{ href: '/tools', label: 'Strata Tools' },
	{ href: '/spec', label: 'OpenStrata Spec' },
	{ href: '/blog', label: 'Blog' }
] as const;

export const socialLinks = [
	{ href: 'https://github.com/kitsboy/openstrata', label: 'GitHub', icon: 'github' as const },
	{ href: 'https://x.com/giveabit', label: 'X', icon: 'x' as const },
	{ href: 'mailto:hello@giveabit.io', label: 'hello@giveabit.io', icon: 'mail' as const }
] as const;