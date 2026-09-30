/**
 * Navigation — one authoring home for every top-level destination.
 *
 * Twelve flat links never fit a desktop header: at 1280px the strip had to
 * scroll internally, so half the site was hidden behind a scrollbar nobody
 * notices. The header now keeps two primary destinations inline and groups
 * everything else behind two menus, while the flat `navItems` list is derived
 * from the same source so the footer column and the breadcrumb trail can never
 * drift out of step with the header.
 *
 * **Why four items and not six.** Compliance and Docs used to sit in the bar as
 * their own destinations. They are not: a council reads compliance material and
 * documentation — it does not *go to compliance* the way it goes to its own
 * dashboard. Both now live in the Library menu beside the legal sources, the
 * templates and the printable documents, which is what they actually are. The
 * bar went from six things to scan to four, and nothing became unreachable.
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
  {
    label: 'Library',
    align: 'left',
    items: [
      { href: '/compliance', label: 'Compliance', hint: 'The BC rules this software enforces' },
      { href: '/docs', label: 'Docs', hint: 'How it is built, and how to run your own' },
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

/**
 * The nav destination a pathname belongs to — the deepest one that matches.
 *
 * Breadcrumbs used to take the *first* item whose href the pathname started
 * with, which quietly mislabelled `/documents` as `Docs` (because
 * `/documents`.startsWith('/docs')) with a link to the wrong page. Matching on a
 * segment boundary and preferring the longest href fixes that, and keeps a
 * nested route like `/docs/manual` landing on `Docs` rather than on nothing.
 */
export function navParentFor(pathname: string, items: NavLink[] = navItems): NavLink | null {
  const matches = items.filter(
    (item) =>
      item.href !== '/' && (pathname === item.href || pathname.startsWith(`${item.href}/`))
  );
  return matches.reduce<NavLink | null>(
    (deepest, item) => (!deepest || item.href.length > deepest.href.length ? item : deepest),
    null
  );
}

export const socialLinks = [
  { href: 'https://github.com/kitsboy/openstrata', label: 'GitHub', icon: 'github' as const },
  { href: 'https://x.com/giveabit', label: 'X', icon: 'x' as const },
  { href: 'mailto:hello@giveabit.io', label: 'hello@giveabit.io', icon: 'mail' as const }
] as const;
