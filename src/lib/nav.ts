/**
 * Navigation — one authoring home for every top-level destination.
 *
 * Twelve flat links never fit a desktop header: at 1280px the strip had to
 * scroll internally, so half the site was hidden behind a scrollbar nobody
 * notices. The header now keeps the four primary destinations inline and
 * groups the rest behind two menus, while the flat `navItems` list is derived
 * from the same source so the footer column and the breadcrumb trail can never
 * drift out of step with the header.
 *
 * Order matters in two places: it is the header order, and it is the order the
 * footer column and breadcrumbs resolve a parent from.
 */

export type NavLink = { href: string; label: string; hint?: string };
export type NavGroup = { label: string; items: NavLink[]; align?: 'left' | 'right' };
export type NavEntry = NavLink | NavGroup;

export const isNavGroup = (entry: NavEntry): entry is NavGroup => 'items' in entry;

/** Header navigation: four inline destinations, then two grouped menus. */
export const navGroups: NavEntry[] = [
  { href: '/', label: 'Dashboard' },
  { href: '/tools', label: 'Strata Tool' },
  { href: '/compliance', label: 'Compliance' },
  { href: '/docs', label: 'Docs' },
  {
    label: 'Library',
    align: 'left',
    items: [
      { href: '/legal', label: 'Legal library', hint: 'Primary statutes, regulation and guidance' },
      { href: '/templates', label: 'Templates', hint: 'Forms and documents a council can run' },
      {
        href: '/documents',
        label: 'Print-ready documents',
        hint: 'Minutes, notices, Form B and Form F'
      },
      { href: '/faq', label: 'FAQ', hint: 'Straight answers, including the limits' },
      { href: '/changelog', label: 'Changelog', hint: 'Every release, and how it was verified' }
    ]
  },
  {
    label: 'Company',
    align: 'right',
    items: [
      { href: '/about', label: 'About', hint: 'Why this exists, and who builds it' },
      { href: '/pitch', label: 'Pitch', hint: 'The business case, with the numbers' },
      { href: '/roadmap', label: 'Roadmap', hint: 'What is live, in beta, and planned' },
      { href: '/blog', label: 'Blog', hint: 'Longer notes and working-throughs' },
      { href: '/rss', label: 'RSS & API', hint: 'Follow every change without an account' }
    ]
  }
];

/** Flat list — the footer column and the breadcrumb trail both read this. */
export const navItems: NavLink[] = navGroups.flatMap((entry) =>
  isNavGroup(entry) ? entry.items : [entry]
);

export const socialLinks = [
  { href: 'https://github.com/kitsboy/openstrata', label: 'GitHub', icon: 'github' as const },
  { href: 'https://x.com/giveabit', label: 'X', icon: 'x' as const },
  { href: 'mailto:hello@giveabit.io', label: 'hello@giveabit.io', icon: 'mail' as const }
] as const;
