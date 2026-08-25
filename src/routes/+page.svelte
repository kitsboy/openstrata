<script>
  import packageJson from '../../package.json';

  const appVersion = packageJson.version;

  const languages = [
    ['en', 'English'],
    ['fr', 'Français'],
    ['es', 'Español'],
    ['zh', '中文'],
    ['hi', 'हिन्दी'],
    ['fil', 'Filipino'],
    ['pl', 'Polski'],
    ['uk', 'Українська'],
    ['sw', 'Kiswahili']
  ];

  const translations = {
    en: { workspace: 'Workspace', overview: 'Overview', buildings: 'Buildings', governance: 'Governance', operations: 'Operations', finances: 'Finances', legal: 'Legal library', insights: 'Insights', newStrata: 'New strata', viewAll: 'View all', goodMorning: 'Good morning, Camille', subtitle: 'Here is the pulse of your communities.', actions: 'Quick actions', activity: 'Live activity', upcoming: 'Upcoming', seeCalendar: 'See calendar', footerTag: 'The operating system for communities that govern themselves.' },
    fr: { workspace: 'Espace de travail', overview: 'Vue d’ensemble', buildings: 'Immeubles', governance: 'Gouvernance', operations: 'Opérations', finances: 'Finances', legal: 'Bibliothèque juridique', insights: 'Analyses', newStrata: 'Nouvelle copropriété', viewAll: 'Tout voir', goodMorning: 'Bonjour, Camille', subtitle: 'Voici l’état de vos communautés.', actions: 'Actions rapides', activity: 'Activité en direct', upcoming: 'À venir', seeCalendar: 'Voir le calendrier', footerTag: 'Le système d’exploitation des communautés autonomes.' },
    es: { workspace: 'Espacio de trabajo', overview: 'Resumen', buildings: 'Edificios', governance: 'Gobernanza', operations: 'Operaciones', finances: 'Finanzas', legal: 'Biblioteca legal', insights: 'Análisis', newStrata: 'Nueva comunidad', viewAll: 'Ver todo', goodMorning: 'Buenos días, Camille', subtitle: 'Este es el estado de tus comunidades.', actions: 'Acciones rápidas', activity: 'Actividad en vivo', upcoming: 'Próximamente', seeCalendar: 'Ver calendario', footerTag: 'El sistema operativo para comunidades autónomas.' },
    zh: { workspace: '工作区', overview: '总览', buildings: '楼宇', governance: '治理', operations: '运营', finances: '财务', legal: '法律资料库', insights: '洞察', newStrata: '新建社区', viewAll: '查看全部', goodMorning: '早上好，Camille', subtitle: '这是您的社区状态。', actions: '快捷操作', activity: '实时活动', upcoming: '即将到来', seeCalendar: '查看日历', footerTag: '为自治社区打造的运营系统。' },
    hi: { workspace: 'कार्यस्थल', overview: 'अवलोकन', buildings: 'इमारतें', governance: 'शासन', operations: 'संचालन', finances: 'वित्त', legal: 'कानूनी पुस्तकालय', insights: 'अंतर्दृष्टि', newStrata: 'नई सोसायटी', viewAll: 'सभी देखें', goodMorning: 'सुप्रभात, Camille', subtitle: 'आपकी समुदायों की स्थिति यहाँ है।', actions: 'त्वरित कार्य', activity: 'लाइव गतिविधि', upcoming: 'आगामी', seeCalendar: 'कैलेंडर देखें', footerTag: 'स्वशासित समुदायों के लिए ऑपरेटिंग सिस्टम।' },
    fil: { workspace: 'Workspace', overview: 'Pangkalahatang-ideya', buildings: 'Mga gusali', governance: 'Pamamahala', operations: 'Operasyon', finances: 'Pananalapi', legal: 'Aklatan ng batas', insights: 'Mga insight', newStrata: 'Bagong strata', viewAll: 'Tingnan lahat', goodMorning: 'Magandang umaga, Camille', subtitle: 'Narito ang kalagayan ng iyong mga komunidad.', actions: 'Mabilis na aksyon', activity: 'Live na aktibidad', upcoming: 'Paparating', seeCalendar: 'Tingnan ang kalendaryo', footerTag: 'Operating system para sa mga komunidad na namamahala sa sarili.' },
    pl: { workspace: 'Obszar roboczy', overview: 'Przegląd', buildings: 'Budynki', governance: 'Zarządzanie', operations: 'Operacje', finances: 'Finanse', legal: 'Biblioteka prawna', insights: 'Analizy', newStrata: 'Nowa wspólnota', viewAll: 'Zobacz wszystko', goodMorning: 'Dzień dobry, Camille', subtitle: 'Oto stan Twoich wspólnot.', actions: 'Szybkie akcje', activity: 'Aktywność na żywo', upcoming: 'Nadchodzące', seeCalendar: 'Zobacz kalendarz', footerTag: 'System operacyjny dla samorządnych wspólnot.' },
    uk: { workspace: 'Робочий простір', overview: 'Огляд', buildings: 'Будинки', governance: 'Управління', operations: 'Операції', finances: 'Фінанси', legal: 'Правова бібліотека', insights: 'Аналітика', newStrata: 'Нова спільнота', viewAll: 'Переглянути все', goodMorning: 'Доброго ранку, Camille', subtitle: 'Ось стан ваших спільнот.', actions: 'Швидкі дії', activity: 'Активність наживо', upcoming: 'Найближчі події', seeCalendar: 'Відкрити календар', footerTag: 'Операційна система для спільнот із самоврядуванням.' },
    sw: { workspace: 'Nafasi ya kazi', overview: 'Muhtasari', buildings: 'Majengo', governance: 'Utawala', operations: 'Uendeshaji', finances: 'Fedha', legal: 'Maktaba ya sheria', insights: 'Maarifa', newStrata: 'Jumuiya mpya', viewAll: 'Tazama zote', goodMorning: 'Habari za asubuhi, Camille', subtitle: 'Hii ndiyo hali ya jumuiya zako.', actions: 'Vitendo vya haraka', activity: 'Shughuli za moja kwa moja', upcoming: 'Yanayokuja', seeCalendar: 'Tazama kalenda', footerTag: 'Mfumo wa uendeshaji kwa jumuiya zinazojitawala.' }
  };

  const navGroups = [
    { label: 'Workspace', items: [['overview', 'Overview', '⌂'], ['buildings', 'Buildings', '▦'], ['governance', 'Governance', '◈']] },
    { label: 'Run the building', items: [['operations', 'Operations', '⌁'], ['finances', 'Finances', '$'], ['legal', 'Legal library', '§'], ['insights', 'Insights', '◒']] }
  ];

  const buildings = [
    { name: 'Harbour House', location: 'Vancouver, BC', units: '72 units', health: 96, tone: 'green', issue: 'All systems clear', glyph: 'HH' },
    { name: 'Cedar Lane', location: 'Burnaby, BC', units: '48 units', health: 82, tone: 'amber', issue: '2 actions due this week', glyph: 'CL' },
    { name: 'Northline Lofts', location: 'Victoria, BC', units: '31 units', health: 74, tone: 'red', issue: 'Depreciation report due', glyph: 'NL' }
  ];

  const activities = [
    { icon: '✓', tone: 'green', title: 'AGM minutes approved', meta: 'Harbour House · 12 min ago' },
    { icon: '$', tone: 'blue', title: 'Reserve fund transfer reconciled', meta: 'Cedar Lane · 46 min ago' },
    { icon: '!', tone: 'amber', title: 'Insurance renewal reminder sent', meta: 'Northline Lofts · 2 hrs ago' },
    { icon: '↗', tone: 'purple', title: 'Form B request received', meta: 'Harbour House · 3 hrs ago' }
  ];

  const upcoming = [
    { date: '24', month: 'JUN', title: 'Council meeting', place: 'Harbour House · 6:30 PM', tone: 'orange' },
    { date: '28', month: 'JUN', title: 'Depreciation report review', place: 'Northline Lofts · 10:00 AM', tone: 'purple' },
    { date: '02', month: 'JUL', title: 'Quarterly financial package', place: 'All communities · Due date', tone: 'blue' }
  ];

  let selectedLanguage = 'en';
  let active = 'overview';
  let showLanguageMenu = false;
  let showMobileMenu = false;
  let showNewStrata = false;
  let search = '';
  let toast = '';

  $: copy = translations[selectedLanguage];
  $: selectedLanguageName = languages.find(([code]) => code === selectedLanguage)?.[1] ?? 'English';
  $: filteredBuildings = buildings.filter((building) => `${building.name} ${building.location}`.toLowerCase().includes(search.toLowerCase()));

  function selectNav(id) {
    active = id;
    showMobileMenu = false;
    toast = `${id.charAt(0).toUpperCase() + id.slice(1)} workspace selected`;
    setTimeout(() => (toast = ''), 2400);
  }

  function selectLanguage(code) {
    selectedLanguage = code;
    showLanguageMenu = false;
    toast = `Language: ${languages.find(([item]) => item === code)?.[1]}`;
    setTimeout(() => (toast = ''), 2400);
  }

  function openAction(message) {
    toast = message;
    setTimeout(() => (toast = ''), 2600);
  }
</script>

<svelte:head>
  <title>OpenStrata · Community operations, beautifully organized</title>
  <meta name="description" content="OpenStrata is the modern operating system for strata and condominium communities." />
</svelte:head>

<div class="app-shell">
  <aside class:mobile-open={showMobileMenu} class="sidebar" aria-label="Primary navigation">
    <div class="brand-lockup">
      <div class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></div>
      <div>
        <div class="brand-name">open<span>strata</span></div>
        <div class="brand-subtitle">community operations</div>
      </div>
      <button class="icon-button sidebar-close" aria-label="Close navigation" onclick={() => (showMobileMenu = false)}>×</button>
    </div>

    <div class="workspace-switcher">
      <div class="workspace-avatar">OS</div>
      <div class="workspace-copy"><span class="eyebrow">{copy.workspace}</span><strong>Give A Bit workspace</strong></div>
      <span class="chevron">⌄</span>
    </div>

    <nav class="nav-groups">
      {#each navGroups as group}
        <div class="nav-group">
          <div class="nav-label">{group.label === 'Workspace' ? copy.workspace : 'Run the building'}</div>
          {#each group.items as item}
            <button class:active={active === item[0]} class="nav-item" onclick={() => selectNav(item[0])}>
              <span class="nav-icon">{item[2]}</span><span>{copy[item[0]]}</span>
              {#if item[0] === 'legal'}<span class="nav-count">12</span>{/if}
            </button>
          {/each}
        </div>
      {/each}
    </nav>

    <div class="sidebar-spacer"></div>
    <div class="sidebar-help">
      <div class="help-orbit">?</div>
      <div><strong>Need a hand?</strong><span>Visit the resource centre</span></div>
      <span class="arrow">↗</span>
    </div>
    <div class="sidebar-footer"><span class="status-dot"></span><span>All systems operational</span><button class="mini-settings" aria-label="Open settings">⚙</button></div>
  </aside>

  {#if showMobileMenu}<button class="scrim" aria-label="Close navigation" onclick={() => (showMobileMenu = false)}></button>{/if}

  <div class="main-column">
    <header class="topbar">
      <div class="mobile-brand"><button class="icon-button menu-button" aria-label="Open navigation" onclick={() => (showMobileMenu = true)}>☰</button><div class="brand-mark small" aria-hidden="true"><span></span><span></span><span></span></div><strong>open<span>strata</span></strong></div>
      <div class="breadcrumbs"><span>Give A Bit workspace</span><b>/</b><strong>{copy.overview}</strong></div>
      <div class="topbar-actions">
        <label class="search-box"><span aria-hidden="true">⌕</span><input aria-label="Search OpenStrata" bind:value={search} placeholder="Search anything" /><kbd>⌘ K</kbd></label>
        <div class="language-wrap">
          <button class="language-button" aria-expanded={showLanguageMenu} onclick={() => (showLanguageMenu = !showLanguageMenu)}><span class="globe">◎</span><span class="language-current">{selectedLanguageName}</span><span class="chevron">⌄</span></button>
          {#if showLanguageMenu}
            <div class="language-menu">
              <div class="menu-heading">Choose language</div>
              {#each languages as language}
                <button class:chosen={language[0] === selectedLanguage} onclick={() => selectLanguage(language[0])}><span>{language[1]}</span>{#if language[0] === selectedLanguage}<b>✓</b>{/if}</button>
              {/each}
            </div>
          {/if}
        </div>
        <button class="icon-button notification-button" aria-label="Notifications" onclick={() => openAction('You are all caught up')}><span>♢</span><i></i></button>
        <button class="profile-button" aria-label="Open profile menu"><span class="profile-avatar">CM</span><span class="profile-name">Camille</span><span class="chevron">⌄</span></button>
      </div>
    </header>

    <main class="content">
      <section class="welcome-row">
        <div><div class="date-kicker">TUESDAY, JUNE 18, 2026 <span class="live-pill"><span class="status-dot"></span> LIVE</span></div><h1>{copy.goodMorning}</h1><p>{copy.subtitle}</p></div>
        <button class="primary-button" onclick={() => (showNewStrata = true)}><span class="plus">+</span>{copy.newStrata}<span class="button-arrow">↗</span></button>
      </section>

      <section class="metric-grid" aria-label="Community overview">
        <article class="metric-card metric-primary"><div class="metric-top"><span class="metric-label">COMMUNITIES</span><span class="metric-icon">⌂</span></div><strong>03</strong><div class="metric-foot"><span class="trend up">↗ 1 this month</span><span>Active workspaces</span></div></article>
        <article class="metric-card"><div class="metric-top"><span class="metric-label">OPEN ACTIONS</span><span class="metric-icon amber-icon">!</span></div><strong>07</strong><div class="metric-foot"><span class="trend warning">2 urgent</span><span>Across all buildings</span></div></article>
        <article class="metric-card"><div class="metric-top"><span class="metric-label">RESERVE FUNDS</span><span class="metric-icon blue-icon">$</span></div><strong>$248.5k</strong><div class="metric-foot"><span class="trend up">↗ 4.8%</span><span>Year to date</span></div></article>
        <article class="metric-card"><div class="metric-top"><span class="metric-label">COMPLIANCE HEALTH</span><span class="metric-icon purple-icon">◈</span></div><strong>91<span class="metric-unit">/100</span></strong><div class="health-bar"><span style="width: 91%"></span></div><div class="metric-foot"><span class="trend up">Excellent</span><span>Across all buildings</span></div></article>
      </section>

      <section class="main-grid">
        <div class="left-stack">
          <div class="section-heading"><div><h2>Your buildings</h2><p>At a glance, every community you care for.</p></div><button class="text-button" onclick={() => selectNav('buildings')}>{copy.viewAll}<span>→</span></button></div>
          <div class="building-grid">
            {#each filteredBuildings as building}
              <div class="building-card" onclick={() => openAction(`${building.name} workspace opened`)} role="button" tabindex="0" onkeydown={(event) => event.key === 'Enter' && openAction(`${building.name} workspace opened`)}>
                <div class="building-top"><div class={`building-avatar ${building.tone}`}>{building.glyph}</div><span class={`health-chip ${building.tone}`}><i></i>{building.health}% health</span><button class="more-button" aria-label={`More options for ${building.name}`} onclick={(event) => { event.stopPropagation(); openAction('Building actions opened'); }}>•••</button></div>
                <div class="building-info"><h3>{building.name}</h3><p>{building.location} <span>·</span> {building.units}</p></div>
                <div class="building-progress"><div class="progress-label"><span>Community health</span><strong>{building.health}%</strong></div><div class="progress-track"><span class={building.tone} style={`width: ${building.health}%`}></span></div></div>
                <div class={`building-status ${building.tone}`}><span class="status-symbol">{building.tone === 'green' ? '✓' : building.tone === 'amber' ? '!' : '↗'}</span>{building.issue}<span class="status-arrow">→</span></div>
              </div>
            {:else}
              <div class="empty-state">No buildings match “{search}”.</div>
            {/each}
          </div>

          <div class="section-heading action-heading"><div><h2>{copy.actions}</h2><p>Common work, made one tap away.</p></div></div>
          <div class="action-grid">
            <button class="action-card orange" onclick={() => (showNewStrata = true)}><span class="action-glyph">＋</span><span><strong>Create a strata</strong><small>Start a new community workspace</small></span><b>→</b></button>
            <button class="action-card purple" onclick={() => openAction('Meeting planner opened')}><span class="action-glyph">◴</span><span><strong>Plan a meeting</strong><small>AGM, council, or special meeting</small></span><b>→</b></button>
            <button class="action-card blue" onclick={() => openAction('Legal library opened')}><span class="action-glyph">§</span><span><strong>Find a legal source</strong><small>Official law, forms, and guidance</small></span><b>→</b></button>
            <button class="action-card green" onclick={() => openAction('Maintenance request started')}><span class="action-glyph">⌁</span><span><strong>Log a request</strong><small>Repairs, access, or an incident</small></span><b>→</b></button>
          </div>
        </div>

        <aside class="right-stack">
          <section class="panel"><div class="panel-heading"><div><h2>{copy.activity}</h2><p>Across your workspace</p></div><button class="icon-button" aria-label="Activity filters" onclick={() => openAction('Activity filters opened')}>•••</button></div><div class="activity-list">{#each activities as activity}<button class="activity-item" onclick={() => openAction(activity.title)}><span class={`activity-icon ${activity.tone}`}>{activity.icon}</span><span class="activity-copy"><strong>{activity.title}</strong><small>{activity.meta}</small></span><span class="activity-chevron">›</span></button>{/each}</div><button class="panel-link" onclick={() => openAction('Activity history opened')}>View activity history <span>→</span></button></section>
          <section class="panel upcoming-panel"><div class="panel-heading"><div><h2>{copy.upcoming}</h2><p>Keep your communities moving.</p></div><button class="icon-button" aria-label="Calendar options" onclick={() => openAction('Calendar options opened')}>•••</button></div><div class="upcoming-list">{#each upcoming as event}<button class="upcoming-item" onclick={() => openAction(event.title)}><span class={`event-date ${event.tone}`}><b>{event.date}</b><small>{event.month}</small></span><span class="event-copy"><strong>{event.title}</strong><small>{event.place}</small></span><span class="activity-chevron">›</span></button>{/each}</div><button class="panel-link" onclick={() => openAction('Calendar opened')}>{copy.seeCalendar} <span>→</span></button></section>
        </aside>
      </section>
    </main>

    <footer class="site-footer">
      <div class="footer-top"><div class="footer-brand"><div class="brand-lockup footer-lockup"><div class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></div><div><div class="brand-name">open<span>strata</span></div><div class="brand-subtitle">community operations</div></div></div><p>{copy.footerTag}</p><span class="footer-note">Built for BC. Designed for everywhere.</span></div><div class="footer-links"><div><h3>Product</h3><a href="/">Overview</a><a href="/">Buildings</a><a href="/">Governance</a><a href="/">Roadmap</a></div><div><h3>Trust & legal</h3><a href="/">Legal library</a><a href="/">Privacy</a><a href="/">Security</a><a href="/">Accessibility</a></div><div><h3>Resources</h3><a href="/">Help centre</a><a href="/">BC sources</a><a href="/">Templates</a><a href="/">Contact us</a></div></div></div><div class="footer-bottom"><span>© 2026 OpenStrata · A Give A Bit project · v{appVersion}</span><span>Information is general and not legal advice.</span><span><a href="/">Status</a> <a href="/">GitHub ↗</a></span></div>
    </footer>
  </div>

  <nav class="mobile-nav" aria-label="Mobile navigation"><button class:active={active === 'overview'} onclick={() => selectNav('overview')}><span>⌂</span>{copy.overview}</button><button class:active={active === 'buildings'} onclick={() => selectNav('buildings')}><span>▦</span>{copy.buildings}</button><button class="mobile-add" onclick={() => (showNewStrata = true)} aria-label={copy.newStrata}><span>＋</span></button><button class:active={active === 'operations'} onclick={() => selectNav('operations')}><span>⌁</span>{copy.operations}</button><button onclick={() => (showMobileMenu = true)}><span>☰</span>Menu</button></nav>
</div>

{#if showNewStrata}
  <div class="modal-backdrop" role="presentation" onclick={(event) => event.target === event.currentTarget && (showNewStrata = false)}>
    <dialog open class="modal" aria-labelledby="new-strata-title"><button class="modal-close" aria-label="Close dialog" onclick={() => (showNewStrata = false)}>×</button><div class="modal-icon">＋</div><div class="eyebrow">FORMATION WORKSPACE</div><h2 id="new-strata-title">Start a new strata</h2><p>We’ll guide you through the documents, professionals, approvals, and operating setup required for your jurisdiction.</p><label>Community name<input placeholder="e.g. Seaside Gardens" /></label><label>Jurisdiction<select><option>British Columbia, Canada</option><option>Alberta, Canada</option><option>Ontario, Canada</option></select></label><div class="modal-actions"><button class="secondary-button" onclick={() => (showNewStrata = false)}>Cancel</button><button class="primary-button" onclick={() => { showNewStrata = false; openAction('Formation workspace created'); }}>Create workspace <span>→</span></button></div><small>OpenStrata provides workflow support and general information. Legal and professional review is required.</small></dialog>
  </div>
{/if}

{#if toast}<div class="toast" role="status"><span>✓</span>{toast}</div>{/if}
