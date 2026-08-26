<script lang="ts">
  import packageJson from '../../package.json';
  import { copy, locale, locales, formatCurrency, formatDate, formatNumber } from '$lib/i18n';
  import { auth, signOut } from '$lib/api/auth';
  import { fetchLedgerBalance, fetchLedgerSeries } from '$lib/api/ledger';
  import { theme, toggleTheme } from '$lib/theme';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';

  const appVersion = packageJson.version;

  /* Dashboard copy is centralized in $lib/i18n. */
  /* Legacy catalog removed; keep this route as the first fully localized surface. */
  /* const translations = {
    en: { workspace: 'Workspace', overview: 'Overview', buildings: 'Buildings', governance: 'Governance', operations: 'Operations', finances: 'Finances', legal: 'Legal library', insights: 'Insights', newStrata: 'New strata', viewAll: 'View all', goodMorning: 'Good morning, Camille', subtitle: 'Here is the pulse of your communities.', actions: 'Quick actions', activity: 'Live activity', upcoming: 'Upcoming', seeCalendar: 'See calendar', footerTag: 'The operating system for communities that govern themselves.' },
    fr: { workspace: 'Espace de travail', overview: 'Vue d’ensemble', buildings: 'Immeubles', governance: 'Gouvernance', operations: 'Opérations', finances: 'Finances', legal: 'Bibliothèque juridique', insights: 'Analyses', newStrata: 'Nouvelle copropriété', viewAll: 'Tout voir', goodMorning: 'Bonjour, Camille', subtitle: 'Voici l’état de vos communautés.', actions: 'Actions rapides', activity: 'Activité en direct', upcoming: 'À venir', seeCalendar: 'Voir le calendrier', footerTag: 'Le système d’exploitation des communautés autonomes.' },
    es: { workspace: 'Espacio de trabajo', overview: 'Resumen', buildings: 'Edificios', governance: 'Gobernanza', operations: 'Operaciones', finances: 'Finanzas', legal: 'Biblioteca legal', insights: 'Análisis', newStrata: 'Nueva comunidad', viewAll: 'Ver todo', goodMorning: 'Buenos días, Camille', subtitle: 'Este es el estado de tus comunidades.', actions: 'Acciones rápidas', activity: 'Actividad en vivo', upcoming: 'Próximamente', seeCalendar: 'Ver calendario', footerTag: 'El sistema operativo para comunidades autónomas.' },
    zh: { workspace: '工作区', overview: '总览', buildings: '楼宇', governance: '治理', operations: '运营', finances: '财务', legal: '法律资料库', insights: '洞察', newStrata: '新建社区', viewAll: '查看全部', goodMorning: '早上好，Camille', subtitle: '这是您的社区状态。', actions: '快捷操作', activity: '实时活动', upcoming: '即将到来', seeCalendar: '查看日历', footerTag: '为自治社区打造的运营系统。' },
    hi: { workspace: 'कार्यस्थल', overview: 'अवलोकन', buildings: 'इमारतें', governance: 'शासन', operations: 'संचालन', finances: 'वित्त', legal: 'कानूनी पुस्तकालय', insights: 'अंतर्दृष्टि', newStrata: 'नई सोसायटी', viewAll: 'सभी देखें', goodMorning: 'सुप्रभात, Camille', subtitle: 'आपकी समुदायों की स्थिति यहाँ है।', actions: 'त्वरित कार्य', activity: 'लाइव गतिविधि', upcoming: 'आगामी', seeCalendar: 'कैलेंडर देखें', footerTag: 'स्वशासित समुदायों के लिए ऑपरेटिंग सिस्टम।' },
    fil: { workspace: 'Workspace', overview: 'Pangkalahatang-ideya', buildings: 'Mga gusali', governance: 'Pamamahala', operations: 'Operasyon', finances: 'Pananalapi', legal: 'Aklatan ng batas', insights: 'Mga insight', newStrata: 'Bagong strata', viewAll: 'Tingnan lahat', goodMorning: 'Magandang umaga, Camille', subtitle: 'Narito ang kalagayan ng iyong mga komunidad.', actions: 'Mabilis na aksyon', activity: 'Live na aktibidad', upcoming: 'Paparating', seeCalendar: 'Tingnan ang kalendaryo', footerTag: 'Operating system para sa mga komunidad na namamahala sa sarili.' },
    pl: { workspace: 'Obszar roboczy', overview: 'Przegląd', buildings: 'Budynki', governance: 'Zarządzanie', operations: 'Operacje', finances: 'Finanse', legal: 'Biblioteka prawna', insights: 'Analizy', newStrata: 'Nowa wspólnota', viewAll: 'Zobacz wszystko', goodMorning: 'Dzień dobry, Camille', subtitle: 'Oto stan Twoich wspólnot.', actions: 'Szybkie akcje', activity: 'Aktywność na żywo', upcoming: 'Nadchodzące', seeCalendar: 'Zobacz kalendarz', footerTag: 'System operacyjny dla samorządnych wspólnot.' },
    uk: { workspace: 'Робочий простір', overview: 'Огляд', buildings: 'Будинки', governance: 'Управління', operations: 'Операції', finances: 'Фінанси', legal: 'Правова бібліотека', insights: 'Аналітика', newStrata: 'Нова спільнота', viewAll: 'Переглянути все', goodMorning: 'Доброго ранку, Camille', subtitle: 'Ось стан ваших спільнот.', actions: 'Швидкі дії', activity: 'Активність наживо', upcoming: 'Найближчі події', seeCalendar: 'Відкрити календар', footerTag: 'Операційна система для спільнот із самоврядуванням.' },
    sw: { workspace: 'Nafasi ya kazi', overview: 'Muhtasari', buildings: 'Majengo', governance: 'Utawala', operations: 'Uendeshaji', finances: 'Fedha', legal: 'Maktaba ya sheria', insights: 'Maarifa', newStrata: 'Jumuiya mpya', viewAll: 'Tazama zote', goodMorning: 'Habari za asubuhi, Camille', subtitle: 'Hii ndiyo hali ya jumuiya zako.', actions: 'Vitendo vya haraka', activity: 'Shughuli za moja kwa moja', upcoming: 'Yanayokuja', seeCalendar: 'Tazama kalenda', footerTag: 'Mfumo wa uendeshaji kwa jumuiya zinazojitawala.' }
  }; */

  // Sidebar navigation: key, i18n key, icon name (single SVG icon system).
  const navGroups = [
    { label: 'Workspace', items: [['overview', 'Overview', 'home'], ['buildings', 'Buildings', 'building'], ['governance', 'Governance', 'shield']] },
    { label: 'Run the building', items: [['operations', 'Operations', 'wrench'], ['finances', 'Finances', 'coins'], ['legal', 'Legal library', 'scale'], ['insights', 'Insights', 'chart']] }
  ] as const;

  // Every sidebar / footer nav item maps to a real page so links work end to end.
  const navTargets: Record<string, string> = {
    overview: '/',
    buildings: '/tools',
    governance: '/compliance',
    operations: '/tools',
    finances: '/tools',
    legal: '/legal',
    insights: '/roadmap'
  };
  const isActive = (href: string) => $page.url.pathname === href;

  const buildings = [
    { name: 'Harbour House', location: 'Vancouver, BC', units: '72 units', health: 96, tone: 'green', issue: 'All systems clear', glyph: 'HH' },
    { name: 'Cedar Lane', location: 'Burnaby, BC', units: '48 units', health: 82, tone: 'amber', issue: '2 actions due this week', glyph: 'CL' },
    { name: 'Northline Lofts', location: 'Victoria, BC', units: '31 units', health: 74, tone: 'red', issue: 'Depreciation report due', glyph: 'NL' }
  ];

  const activities = [
    { icon: 'check', tone: 'green', title: 'AGM minutes approved', meta: 'Harbour House · 12 min ago' },
    { icon: 'dollar', tone: 'blue', title: 'Reserve fund transfer reconciled', meta: 'Cedar Lane · 46 min ago' },
    { icon: 'alert', tone: 'amber', title: 'Insurance renewal reminder sent', meta: 'Northline Lofts · 2 hrs ago' },
    { icon: 'arrow-up-right', tone: 'purple', title: 'Form B request received', meta: 'Harbour House · 3 hrs ago' }
  ] as const;

  const upcoming = [
    { date: '24', month: 'JUN', title: 'Council meeting', place: 'Harbour House · 6:30 PM', tone: 'orange' },
    { date: '28', month: 'JUN', title: 'Depreciation report review', place: 'Northline Lofts · 10:00 AM', tone: 'purple' },
    { date: '02', month: 'JUL', title: 'Quarterly financial package', place: 'All communities · Due date', tone: 'blue' }
  ];

  import SatohashStatus from '$lib/components/SatohashStatus.svelte';
  import AuthModal from '$lib/components/AuthModal.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import Skeleton from '$lib/components/Skeleton.svelte';
  import Sparkline from '$lib/components/Sparkline.svelte';
  import Tour from '$lib/components/Tour.svelte';
  import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
  import DeadlinesPanel from '$lib/components/DeadlinesPanel.svelte';
  import RailsStatus from '$lib/components/RailsStatus.svelte';
  import HealthScore from '$lib/components/HealthScore.svelte';
  import RateSparkline from '$lib/components/RateSparkline.svelte';
  import ChainViz from '$lib/components/ChainViz.svelte';
  import NotificationsFeed from '$lib/components/NotificationsFeed.svelte';
  import { accent, cycleAccent } from '$lib/theme';
  import { onMount } from 'svelte';

  let showLanguageMenu = $state(false);
  let showMobileMenu = $state(false);
  let showNewStrata = $state(false);
  let search = $state('');
  let toast = $state('');
  let toastType = $state<'ok' | 'error'>('ok');
  let showTour = $state(false);
  let showSignOutConfirm = $state(false);
  let newStrataName = $state('');
  let newStrataError = $state('');
  let selectedBuilding = $state<typeof buildings[number] | null>(null);
  let notifications = $state<string[]>([]);
  let showNotifications = $state(false);
  let showAuth = $state(false);
  let showAuthMenu = $state(false);
  let crfBalance = $state<number | null>(null);
  let operatingBalance = $state<number | null>(null);
  let balancesLoading = $state(false);
  // Sparkline feeds: demo walk for signed-out visitors, live series when a
  // session resolves (skeleton + no demo flash in between).
  const demoSpark = [34, 36, 35, 39, 41, 40];
  let reserveSpark = $state<number[]>(demoSpark);
  let incomeSpark = $state<number[]>([12, 14, 13, 15, 16, 15]);

  const NOTIFICATIONS_KEY = 'openstrata-notifications';

  onMount(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) ?? '[]');
      if (Array.isArray(saved)) notifications = saved.map(String).slice(0, 12);
    } catch {
      /* corrupt storage — start fresh */
    }
    // First-run tour: show the 4-step overlay to signed-out visitors who have
    // never dismissed it. A live session skips it entirely.
    try {
      showTour = localStorage.getItem('openstrata-tour-seen') !== '1' && get(auth).status !== 'signed-in';
    } catch {
      /* storage unavailable — no tour */
    }
    // Watch the auth session: when a live session lands, pull the trust-fund
    // balances + series from the backend and close the sign-in modal. Every
    // fetch is best-effort — a failure just leaves the demo fallbacks. A
    // short safety timer guarantees the skeleton never hangs forever when the
    // host is unreachable.
    const unsubscribe = auth.subscribe((session) => {
      if (session.status === 'signed-in') {
        balancesLoading = true;
        fetchLedgerBalance('crf').then((b) => (crfBalance = b.balanceBasis)).catch(() => {});
        fetchLedgerBalance('operating').then((b) => (operatingBalance = b.balanceBasis)).catch(() => {});
        fetchLedgerSeries('crf', 6)
          .then((points) => {
            if (points.length >= 2) reserveSpark = points.map((p) => p.netBasis / 100);
          })
          .catch(() => {});
        fetchLedgerSeries('operating', 6)
          .then((points) => {
            if (points.length >= 2) incomeSpark = points.map((p) => p.incomeBasis / 100);
          })
          .catch(() => {});
        setTimeout(() => (balancesLoading = false), 2500);
        Promise.allSettled([fetchLedgerBalance('crf'), fetchLedgerBalance('operating')]).then(() => {
          balancesLoading = false;
        });
      }
    });
    return unsubscribe;
  });

  function rememberNotification(message: string) {
    notifications = [message, ...notifications.filter((n) => n !== message)].slice(0, 12);
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch {
      /* storage full or unavailable */
    }
  }

  // Dynamic dashboard header: time-of-day greeting + real date + signed-in name.
  const greetingKey = $derived.by((): 'goodMorning' | 'goodAfternoon' | 'goodEvening' => {
    const hour = new Date().getHours();
    if (hour < 12) return 'goodMorning';
    if (hour < 18) return 'goodAfternoon';
    return 'goodEvening';
  });
  const greeting = $derived(
    $auth.user ? `${$copy[greetingKey]}, ${$auth.user.displayName.split(/\s+/)[0]}` : $copy[greetingKey]
  );

  const selectedLanguage = $derived($locale);
  const selectedLanguageName = $derived(
    locales.find((item) => item.code === selectedLanguage)?.nativeName ?? 'English'
  );
  const liveMode = $derived($auth.status === 'signed-in');
  const workspaceName = $derived(liveMode && $auth.council ? $auth.council.name : 'Give A Bit');
  const profileInitials = $derived(
    $auth.user
      ? $auth.user.displayName.split(/\s+/).map((part) => part[0] ?? '').join('').slice(0, 2).toUpperCase()
      : 'OS'
  );
  const filteredBuildings = $derived(
    buildings.filter((building) =>
      `${building.name} ${building.location}`.toLowerCase().includes(search.toLowerCase())
    )
  );

  function openAction(message: string) {
    toast = message;
    toastType = 'ok';
    rememberNotification(message);
    setTimeout(() => (toast = ''), 2600);
  }

  function openError(message: string) {
    toast = message;
    toastType = 'error';
    setTimeout(() => (toast = ''), 3600);
  }

  function submitNewStrata() {
    const name = newStrataName.trim();
    if (!name) {
      newStrataError = $copy.nameRequired;
      openError($copy.nameRequired);
      return;
    }
    newStrataError = '';
    showNewStrata = false;
    newStrataName = '';
    openAction($copy.formationCreatedToast);
  }

  function requestSignOut() {
    showAuthMenu = false;
    showSignOutConfirm = true;
  }
</script>

<svelte:head>
  <title>OpenStrata v{appVersion} · {$copy.homePageTitle}</title>
  <meta name="description" content={$copy.homeMetaDescription} />
</svelte:head>

<div class="app-shell">
  <aside class:mobile-open={showMobileMenu} class="sidebar" aria-label={$copy.primaryNavigation}>
    <div class="brand-lockup">
      <div class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></div>
      <div>
        <div class="brand-name">open<span>strata</span></div>
        <div class="brand-subtitle">community operations</div>
      </div>
      <button class="icon-button sidebar-close" aria-label={$copy.closeNavigation} onclick={() => (showMobileMenu = false)}>×</button>
    </div>

    <div class="workspace-switcher">
      <div class="workspace-avatar">OS</div>
      <div class="workspace-copy"><span class="eyebrow">{$copy.workspace}</span><strong>{workspaceName} {$copy.workspace}</strong></div>
      <Icon name="chevron-down" class="h-3 w-3" />
    </div>

    <nav class="nav-groups">
      {#each navGroups as group}
        <div class="nav-group">
          <div class="nav-label">{group.label === 'Workspace' ? $copy.workspace : $copy.runBuilding}</div>
          {#each group.items as item}
            <a href={navTargets[item[0]]} class:active={isActive(navTargets[item[0]])} class="nav-item no-underline">
              <Icon name={item[2]} class="h-[19px] w-[19px] nav-icon" /><span>{$copy[item[0]]}</span>
              {#if item[0] === 'legal'}<span class="nav-count">12</span>{/if}
            </a>
          {/each}
        </div>
      {/each}
    </nav>

    <div class="sidebar-spacer"></div>
    <a href="/faq" class="sidebar-help no-underline">
      <div class="help-orbit"><Icon name="help" class="h-3.5 w-3.5" /></div>
      <div><strong>{$copy.needAHand}</strong><span>{$copy.visitResourceCentre}</span></div>
      <Icon name="arrow-up-right" class="h-3.5 w-3.5 arrow" />
    </a>
    <div class="sidebar-footer"><span class="status-dot"></span><span>{$copy.allSystemsOperational}</span><button class="mini-settings" aria-label={$copy.openSettings}><Icon name="settings" class="h-3.5 w-3.5" /></button></div>
  </aside>

  {#if showMobileMenu}<button class="scrim" aria-label={$copy.closeNavigation} onclick={() => (showMobileMenu = false)}></button>{/if}

  <div class="main-column">
    <header class="topbar">
      <div class="mobile-brand"><button class="icon-button menu-button" aria-label={$copy.openNavigation} onclick={() => (showMobileMenu = true)}><Icon name="menu" class="h-4 w-4" /></button><div class="brand-mark small" aria-hidden="true"><span></span><span></span><span></span></div><strong>open<span>strata</span></strong></div>
      <div class="breadcrumbs"><span>Give A Bit {$copy.workspace}</span><b>/</b><strong>{$copy.overview}</strong></div>
      <div class="topbar-actions">
        <label class="search-box"><Icon name="search" class="h-4 w-4" /><input aria-label={$copy.search} bind:value={search} placeholder={$copy.search} /><kbd>⌘ K</kbd></label>
        <button class="icon-button" onclick={toggleTheme} aria-label={$copy.toggleTheme} title={$copy.toggleTheme}>{#if $theme === 'dark'}<Icon name="sun" class="h-4 w-4" />{:else}<Icon name="moon" class="h-4 w-4" />{/if}</button>
        <button class="icon-button accent-toggle" onclick={cycleAccent} aria-label={$copy.themeBrokerage} title="{$copy.themeBrand}: {$accent === 'orange' ? 'orange' : 'green'}">{#if $accent === 'orange'}<span class="h-3.5 w-3.5 rounded-full border border-border" style="background:#f97348"></span>{:else}<span class="h-3.5 w-3.5 rounded-full border border-border" style="background:#2d6a4f"></span>{/if}</button>
        <div class="language-wrap">
          <button class="language-button" aria-expanded={showLanguageMenu} onclick={() => (showLanguageMenu = !showLanguageMenu)}><Icon name="globe" class="h-4 w-4" /><span class="language-current">{selectedLanguageName}</span><Icon name="chevron-down" class="h-3 w-3" /></button>
          {#if showLanguageMenu}
            <div class="language-menu">
              <div class="menu-heading">{$copy.chooseLanguage}</div>
              {#each locales as language}
                <button class:chosen={language.code === selectedLanguage} onclick={() => { locale.set(language.code); showLanguageMenu = false; }}><span>{language.nativeName}</span>{#if language.code === selectedLanguage}<b>✓</b>{/if}</button>
              {/each}
            </div>
          {/if}
        </div>
        <button class="icon-button notification-button" aria-expanded={showNotifications} aria-label={$copy.notifications} onclick={() => (showNotifications = !showNotifications)}><Icon name="bell" class="h-4 w-4" /><i></i></button>
        {#if showNotifications}
          <div class="notifications-panel" role="menu" aria-label={$copy.notifications}>
            <NotificationsFeed />
          </div>
        {/if}
        {#if liveMode && $auth.user}
          <div class="auth-wrap">
            <button class="profile-button" aria-expanded={showAuthMenu} aria-label={$copy.openProfileMenu} onclick={() => (showAuthMenu = !showAuthMenu)}><span class="profile-avatar">{profileInitials}</span><span class="profile-name">{$auth.council?.name ?? $auth.user.displayName}</span><Icon name="chevron-down" class="h-3 w-3" /></button>
            {#if showAuthMenu}
              <div class="auth-menu" role="menu" aria-label={$copy.profile}>
                <div class="auth-menu-user"><strong>{$auth.user.displayName}</strong><span>{$auth.user.email}</span>{#if $auth.council}<em>{$auth.council.name} · {$auth.user.role}</em>{/if}</div>
                <button role="menuitem" onclick={requestSignOut}><span>{$copy.signOut}</span><Icon name="arrow-up-right" class="h-3 w-3" /></button>
              </div>
            {/if}
          </div>
        {:else}
          <button class="signin-button" onclick={() => (showAuth = true)}>{$copy.signIn}</button>
        {/if}
      </div>
    </header>

    <main class="content">
      <section class="welcome-row">
        <div><div class="date-kicker">{formatDate(new Date(), $locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} <span class:demo={!liveMode} class="live-pill"><span class="status-dot"></span> {liveMode ? $copy.live : $copy.demo}</span></div><h1>{greeting}</h1><p>{$copy.subtitle}</p></div>
        <button class="primary-button" onclick={() => (showNewStrata = true)}><span class="plus">+</span>{$copy.newStrata}<span class="button-arrow">↗</span></button>
      </section>

      <section class="metric-grid" aria-label={$copy.communityOverview}>
        <article class="metric-card metric-primary"><div class="metric-top"><span class="metric-label">{$copy.communities}</span><span class="metric-icon"><Icon name="home" class="h-4 w-4" /></span></div><strong>{formatNumber(3, $locale, { minimumIntegerDigits: 2 })}</strong><Sparkline values={incomeSpark} tone="orange" /><div class="metric-foot">		<span class="trend up">↗ 1 {$copy.thisMonth}</span><span>{$copy.activeWorkspaces}</span></div></article>
        <article class="metric-card"><div class="metric-top"><span class="metric-label">{$copy.openActions}</span><span class="metric-icon amber-icon"><Icon name="alert" class="h-4 w-4" /></span></div><strong>{formatNumber(7, $locale, { minimumIntegerDigits: 2 })}</strong><div class="metric-foot">		<span class="trend warning">2 {$copy.urgent}</span><span>{$copy.acrossBuildings}</span></div></article>
        <article class="metric-card"><div class="metric-top"><span class="metric-label">{$copy.reserveFunds}</span><span class="metric-icon blue-icon"><Icon name="dollar" class="h-4 w-4" /></span></div>{#if balancesLoading && crfBalance === null}<div class="metric-skeleton"><Skeleton height="26px" width="120px" /></div>{:else}<strong>{formatCurrency(crfBalance ?? 248500, $locale, { maximumFractionDigits: 0 })}</strong>{/if}<Sparkline values={reserveSpark} tone="blue" /><div class="metric-foot">{#if operatingBalance !== null}<span>{formatCurrency(operatingBalance, $locale, { maximumFractionDigits: 0 })} {$copy.operatingFund}</span>{:else}<span class="trend up">↗ 4.8%</span>{/if}<span>{$copy.yearToDate}</span></div></article>
        <article class="metric-card"><div class="metric-top"><span class="metric-label">{$copy.complianceHealth}</span><span class="metric-icon purple-icon"><Icon name="shield" class="h-4 w-4" /></span></div><strong>91<span class="metric-unit">/100</span></strong><div class="health-bar"><span style="width: 91%"></span></div><div class="metric-foot"><span class="trend up">{$copy.excellent}</span><span>{$copy.acrossBuildings}</span></div></article>
      </section>

      <section class="main-grid">
        <div class="left-stack">
          <div class="section-heading"><div><h2>{$copy.yourBuildings}</h2><p>{$copy.buildingsSubtitle}</p></div><button class="text-button" onclick={() => goto('/tools')}>{$copy.viewAll}<span>→</span></button></div>
          <div class="building-grid">
            {#each filteredBuildings as building}
              <div class="building-card" onclick={() => (selectedBuilding = building)} role="button" tabindex="0" onkeydown={(event) => event.key === 'Enter' && (selectedBuilding = building)}>				<div class="building-top"><div class={`building-avatar ${building.tone}`}>{building.glyph}</div><span class={`health-chip ${building.tone}`}><i></i>{building.health}% {$copy.health}</span><button class="more-button" aria-label="{$copy.moreOptionsFor} {building.name}" onclick={(event) => { event.stopPropagation(); openAction($copy.buildingActionsToast); }}>•••</button></div>
                <div class="building-info"><h3>{building.name}</h3><p>{building.location} <span>·</span> {building.units}</p></div>
                <div class="building-progress"><div class="progress-label"><span>{$copy.communityHealth}</span><strong>{building.health}%</strong></div><div class="progress-track"><span class={building.tone} style={`width: ${building.health}%`}></span></div></div>
                <div class={`building-status ${building.tone}`}><span class="status-symbol"><Icon name={building.tone === 'green' ? 'check' : building.tone === 'amber' ? 'alert' : 'arrow-up-right'} class="h-2.5 w-2.5" /></span>{building.issue}<span class="status-arrow">→</span></div>
              </div>
            {:else}			  <EmptyState scene="empty" icon="search" title="{$copy.noBuildings} “{search}”" message={$copy.emptySearchHint} actionLabel={$copy.newStrata} onAction={() => (showNewStrata = true)} />
            {/each}
          </div>

          <div class="section-heading action-heading"><div><h2>{$copy.quickActions}</h2><p>Common work, made one tap away.</p></div></div>
          <div class="action-grid">
            <button class="action-card orange" onclick={() => (showNewStrata = true)}><span class="action-glyph"><Icon name="plus" class="h-4 w-4" /></span><span><strong>{$copy.createStrata}</strong><small>{$copy.createStrataHint}</small></span><b>→</b></button>			<button class="action-card purple" onclick={() => openAction($copy.meetingPlannerToast)}><span class="action-glyph"><Icon name="calendar" class="h-4 w-4" /></span><span><strong>{$copy.planMeeting}</strong><small>{$copy.planMeetingHint}</small></span><b>→</b></button>			<button class="action-card blue" onclick={() => openAction($copy.legalLibraryToast)}><span class="action-glyph"><Icon name="scale" class="h-4 w-4" /></span><span><strong>{$copy.findLegalSource}</strong><small>{$copy.findLegalSourceHint}</small></span><b>→</b></button>			<button class="action-card green" onclick={() => openAction($copy.maintenanceToast)}><span class="action-glyph"><Icon name="wrench" class="h-4 w-4" /></span><span><strong>{$copy.logRequest}</strong><small>{$copy.logRequestHint}</small></span><b>→</b></button>
          </div>
        </div>

        <aside class="right-stack">		  <section class="panel"><div class="panel-heading"><div><h2>{$copy.activity}</h2><p>{$copy.acrossWorkspace}</p></div><button class="icon-button" aria-label={$copy.activityFilters} onclick={() => openAction($copy.activityFiltersToast)}>•••</button></div><div class="activity-list">{#each activities as activity}<button class="activity-item" onclick={() => openAction(activity.title)}><span class={`activity-icon ${activity.tone}`}><Icon name={activity.icon} class="h-3.5 w-3.5" /></span><span class="activity-copy"><strong>{activity.title}</strong><small>{activity.meta}</small></span><Icon name="chevron-right" class="h-3.5 w-3.5 activity-chevron" /></button>{/each}</div><button class="panel-link" onclick={() => openAction($copy.activityHistoryToast)}>{$copy.activityHistory} <span>→</span></button></section>		  <RailsStatus />
		  <DeadlinesPanel />
		  <HealthScore />
		  <RateSparkline />
		  <ChainViz />
		  <section class="panel upcoming-panel"><div class="panel-heading"><div><h2>{$copy.upcoming}</h2><p>{$copy.keepMoving}</p></div><button class="icon-button" aria-label={$copy.calendarOptions} onclick={() => openAction($copy.calendarOptionsToast)}>•••</button></div><div class="upcoming-list">{#each upcoming as event}<button class="upcoming-item" onclick={() => openAction(event.title)}><span class={`event-date ${event.tone}`}><b>{event.date}</b><small>{event.month}</small></span><span class="event-copy"><strong>{event.title}</strong><small>{event.place}</small></span><span class="activity-chevron">›</span></button>{/each}</div><button class="panel-link" onclick={() => openAction($copy.calendarOpenedToast)}>{$copy.seeCalendar} <span>→</span></button></section>
		  <section><SatohashStatus /></section>
        </aside>
      </section>
    </main>

    <footer class="site-footer">
      <div class="footer-top"><div class="footer-brand"><div class="brand-lockup footer-lockup"><div class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></div><div><div class="brand-name">open<span>strata</span></div><div class="brand-subtitle">community operations</div></div></div><p>{$copy.footerTag}</p><span class="footer-note">{$copy.builtEverywhere}</span></div>			<div class="footer-links"><div><h3>{$copy.product}</h3><a href="/">{$copy.overview}</a><a href="/tools">{$copy.buildings}</a><a href="/compliance">{$copy.governance}</a><a href="/roadmap">{$copy.roadmap}</a></div><div><h3>{$copy.trustLegal}</h3><a href="/legal">{$copy.legal}</a><a href="/compliance">{$copy.complianceKb}</a><a href="/templates">{$copy.templates}</a><a href="/faq">{$copy.faqTitle}</a></div><div><h3>{$copy.resources}</h3><a href="/blog">{$copy.blogTitle}</a><a href="/rss">{$copy.rssTitle}</a><a href="/spec">{$copy.specTitle}</a><a href="mailto:hello@giveabit.io">{$copy.contact}</a></div></div></div><div class="footer-bottom"><span>© 2026 OpenStrata · A Give A Bit project · v{appVersion}</span><span>{$copy.legalDisclaimer}</span><span><a href="/docs">{$copy.status}</a> <a href="https://github.com/kitsboy/openstrata" target="_blank" rel="noopener noreferrer">{$copy.githubLabel} ↗</a></span></div>
    </footer>
  </div>        <nav class="mobile-nav" aria-label={$copy.mobileNavigation}><a href="/" class:active={isActive('/')}><Icon name="home" class="h-4 w-4" />{$copy.overview}</a><a href="/tools" class:active={isActive('/tools')}><Icon name="building" class="h-4 w-4" />{$copy.buildings}</a><button class="mobile-add" onclick={() => (showNewStrata = true)} aria-label={$copy.newStrata}><Icon name="plus" class="h-4 w-4" /></button><a href="/tools" class:active={isActive('/tools')}><Icon name="wrench" class="h-4 w-4" />{$copy.operations}</a><button onclick={() => (showMobileMenu = true)}><Icon name="menu" class="h-4 w-4" />{$copy.menu}</button></nav>
</div>

{#if selectedBuilding}
  <div class="modal-backdrop" role="presentation" onclick={(event) => event.target === event.currentTarget && (selectedBuilding = null)}>
    <dialog open class="modal" aria-labelledby="building-detail-title">
      <button class="modal-close" aria-label={$copy.closeDialog} onclick={() => (selectedBuilding = null)}><Icon name="close" class="h-3.5 w-3.5" /></button>
      <div class="modal-icon"><Icon name="building" class="h-5 w-5" /></div>
      <div class="eyebrow">{$copy.yourBuildings}</div>
      <h2 id="building-detail-title">{selectedBuilding.name}</h2>
      <p>{selectedBuilding.location} <span>·</span> {selectedBuilding.units}</p>
      <div class="building-detail-row">
        <div><span class="metric-label">{$copy.communityHealth}</span><strong>{selectedBuilding.health}%</strong><div class="health-bar"><span style="width: {selectedBuilding.health}%"></span></div></div>
        <div><span class="metric-label">{$copy.reserveFunds}</span><strong>{formatCurrency(Math.round(selectedBuilding.health * 2400), $locale, { maximumFractionDigits: 0 })}</strong></div>
        <div><span class="metric-label">{$copy.openActions}</span><strong>{formatNumber(selectedBuilding.tone === 'green' ? 0 : selectedBuilding.tone === 'amber' ? 2 : 4, $locale)}</strong></div>
      </div>
      <div class="building-detail-issue {selectedBuilding.tone}"><span class="status-symbol"><Icon name="alert" class="h-2.5 w-2.5" /></span>{selectedBuilding.issue}</div>
      <div class="modal-actions">
        <button class="secondary-button" onclick={() => (selectedBuilding = null)}>{$copy.close}</button>
        <button class="primary-button" onclick={() => { openAction($copy.buildingActionsToast); selectedBuilding = null; }}>{$copy.openActions} <span>→</span></button>
      </div>
    </dialog>
  </div>
{/if}

{#if showAuth}
  <AuthModal close={() => (showAuth = false)} />
{/if}

{#if showNewStrata}
  <div class="modal-backdrop" role="presentation" onclick={(event) => event.target === event.currentTarget && (showNewStrata = false)}>
    <dialog open class="modal" aria-labelledby="new-strata-title"><button class="modal-close" aria-label={$copy.closeDialog} onclick={() => (showNewStrata = false)}><Icon name="close" class="h-3.5 w-3.5" /></button><div class="modal-icon"><Icon name="plus" class="h-5 w-5" /></div><div class="eyebrow">{$copy.formationWorkspace}</div><h2 id="new-strata-title">{$copy.startNewStrata}</h2><p>{$copy.formationDescription}</p>		<label for="new-strata-name">{$copy.communityName}<input id="new-strata-name" bind:value={newStrataName} class:input-invalid={!!newStrataError} aria-invalid={!!newStrataError} placeholder={$copy.communityNamePlaceholder} /></label>{#if newStrataError}<p class="inline-error" role="alert"><Icon name="alert" class="h-3 w-3" /> {newStrataError}</p>{/if}<label>{$copy.jurisdiction}<select><option>British Columbia, Canada</option><option>Alberta, Canada</option><option>Ontario, Canada</option></select></label><div class="modal-actions"><button class="secondary-button" onclick={() => { showNewStrata = false; newStrataError = ''; }}>{$copy.cancel}</button>	<button class="primary-button" onclick={submitNewStrata}>{$copy.createWorkspace} <span>→</span></button></div><small>{$copy.legalReview}</small></dialog>
  </div>
{/if}

{#if toast}<div class="toast {toastType === 'error' ? 'toast-error' : ''}" role="status" aria-live="polite"><span><Icon name={toastType === 'error' ? 'alert' : 'check'} class="h-2.5 w-2.5" /></span>{toast}</div>{/if}

{#if showTour}<Tour onFinish={() => (showTour = false)} />{/if}

{#if showSignOutConfirm}
  <ConfirmDialog
    title={$copy.confirmSignOut}
    message={$copy.confirmSignOutMessage}
    confirmLabel={$copy.signOut}
    bind:open={showSignOutConfirm}
    onConfirm={() => signOut()}
  />
{/if}
