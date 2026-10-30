import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';

export const locales = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'fil', name: 'Filipino', nativeName: 'Filipino' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' }
] as const;

export type LocaleCode = (typeof locales)[number]['code'];

export type Translation = {
  balanceLoading: string; balanceUnavailable: string;
  dashboardDates: string; dashboardHealthTitle: string; dashboardHealthDetail: string; roadmapOffered: string;
  payLineOctober: string; payLineArrears: string; payLineLate: string; payLineFine: string; payLineLevy: string;

  language: string; chooseLanguage: string; workspace: string; overview: string; buildings: string; governance: string; operations: string; finances: string; legal: string; insights: string; runBuilding: string; donate: string; menu: string; close: string; search: string; notifications: string; profile: string; live: string; newStrata: string; goodMorning: string; subtitle: string; communities: string; openActions: string; reserveFunds: string; complianceHealth: string; yourBuildings: string; buildingsSubtitle: string; viewAll: string; quickActions: string; activity: string; upcoming: string; seeCalendar: string; createStrata: string; planMeeting: string; findLegalSource: string; logRequest: string; footerTag: string; product: string; trustLegal: string; resources: string; privacy: string; security: string; accessibility: string; helpCentre: string; contact: string; status: string; legalDisclaimer: string; activeWorkspaces: string; acrossBuildings: string; yearToDate: string; excellent: string; communityHealth: string; allSystemsClear: string; actionsDue: string; reportDue: string; commonWork: string; createStrataHint: string; planMeetingHint: string; findLegalSourceHint: string; logRequestHint: string; acrossWorkspace: string; keepMoving: string; activityHistory: string; builtFor: string; formationWorkspace: string; startNewStrata: string; formationDescription: string; communityName: string; jurisdiction: string; cancel: string; createWorkspace: string; legalReview: string; units: string; health: string; noBuildings: string; productLinks: string; trustLegalLinks: string; resourceLinks: string; roadmap: string; bcSources: string; templates: string; builtEverywhere: string; generalInfo: string; wizardTitle: string; wizardIntro: string; onboardingPhase: string; generatedTitle: string; generatedDescription: string; startNew: string; configJson: string; pickJurisdiction: string; jurisdictionDescription: string; entityAddress: string; entityDescription: string; corporationName: string; buildingAddress: string; fiscalYearStart: string; selfManaged: string; selfManagedHint: string; configureUnits: string; unitsDescription: string; numberOfUnits: string; averageSqFt: string; addUnit: string; parking: string; storage: string; evReady: string; configured: string; configureFunds: string; fundsDescription: string; operatingFundBank: string; crfTrustBank: string; crfAllocation: string; optional: string; toggleServices: string; servicesDescription: string; paymentRails: string; paymentDescription: string; fiatPrimary: string; sovereignPay: string; bylaws: string; bylawsDescription: string; standardBylaws: string; importBylaws: string; reviewGenerate: string; reviewDescription: string; continue: string; back: string; generateConfig: string; complianceConfig: string; knowledgeBase: string; complianceReference: string; complianceIntro: string; disputes: string; agentModel: string; fivePillars: string; bylawFlow: string; formsBf: string; quorumVoting: string; recordRetention: string; bcUsMap: string; buildMandates: string; functionalDomains: string; functionalDomainsHint: string; trustFunds: string; appFeatures: string; moduleDomainMap: string; bylawEnforcementFlow: string; conveyancingForms: string; governanceVoting: string; recordRetentionTitle: string; localizationEngine: string; architectureMandates: string; documentationHub: string; bcFirstMvp: string; strataToolModules: string; allDocsIn: string; complianceKb: string; strataTool: string; documentIndex: string; viewOnSite: string; architecture: string; installSop: string; jurisdictionsCurrencies: string; liveStatus: string; soonStatus: string; spaLicense: string; crfMinimum: string; maxLabel: string; subAccounts: string; active: string; clickToEnable: string; defaultLabel: string; sovereignPayDescription: string; standardBylawsPack: string; standardBylawsDescription: string; importExistingBylaws: string; importBylawsDescription: string; uploadPhase3: string; entitySummary: string; noAddress: string; brokerageManaged: string; parkingSummary: string; evSummary: string; fundsSummary: string; servicesSummary: string; paymentSummary: string; importedBylawsPending: string; trustIsolationSummary: string; formsReady: string; aboutHeroTitle: string; aboutHeroAccent: string; aboutHeroDescription: string; costOfStrata: string; feeFlow: string; annualProcessingCost: string; cardCostWarning: string; managerTimeSavings: string; task: string; traditional: string; openStrataLabel: string; saving: string; smartWithinLaw: string; softwareNotManagement: string; threePaths: string; layersTrust: string; runBuildingProof: string; btcWarChest: string; byNumbers: string; readySmarter: string; exploreStrataTool: string; seeRoadmap: string; pitchProblem: string; pitchSolution: string; sovereigntyStack: string; pitchSolutionDescription: string; liveOperations: string; treasuryEdge: string; monthlyIncomeExpenses: string; incomeExpensesLegend: string; simulatedLedger: string; goToMarket: string; pricingTiers: string; whatsNext: string; buildSovereign: string; pitchCtaDescription: string; tryWizard: string; educationalDisclaimer: string; revenueModel: string; toolsTitle: string; toolsIntro: string; fullManagementScope: string; liveLabel: string; betaLabel: string; plannedLabel: string; bcfsaLabel: string; sovereignMode: string; sovereignModeHint: string; allLabel: string; liveInteractiveDemos: string; formKHub: string; bylawEnforcement: string; formsBfHub: string; unitLabel: string; sovereignStackActive: string; externalMultisig: string; orchestrationNote: string; roadmapTitle: string; roadmapIntro: string; modulesLive: string; inBeta: string; bcfsaRelevant: string; gtmPaths: string; developmentTimeline: string; jurisdictionExpansion: string; ecosystemIntegrations: string; currentStatus: string; phaseStatus: string; rssTitle: string; feedInfrastructure: string; rssIntro: string; feedSources: string; latestItems: string; addCustomFeed: string; customFeedHint: string; apiTitle: string; apiIntro: string; restEndpoints: string; webhooks: string; feedsMarket: string; quickStart: string; specTitle: string; specIntro: string; protocolLayers: string; corePrimitives: string; howItWorks: string; fullWireProtocol: string; fullWireProtocolDescription: string; watchOnGithub: string; legalLibrary: string; sourceLibrary: string; legalLibraryIntro: string; legalLibraryNoticeTitle: string; legalLibraryNotice: string; primarySources: string; primarySourcesHint: string; sourceLinks: string; openOriginalSource: string; jurisdictionCoverage: string; jurisdictionCoverageHint: string; blogTitle: string; blogIntro: string; readMore: string; subscribeRss: string; subscribeRssHint: string; viewRssApi: string; templatesTitle: string; templatesIntro: string; templateNoticeTitle: string; templateNotice: string; templateLibrary: string; templateLibraryHint: string; useTemplate: string; sourceAndReview: string; formBTemplate: string; formFTemplate: string; complaintNoticeTemplate: string; meetingAgendaTemplate: string; meetingMinutesTemplate: string; budgetTemplate: string; templateCategoryLegal: string; templateCategoryGovernance: string; templateCategoryFinance: string; reviewRequired: string; wizardPageTitle: string; copyConfig: string; bcLicenseLabel: string; unnamedStrata: string; unitsSummary: string; statutoryOrderHint: string; formBDescription: string; formFDescription: string; complaintNoticeDescription: string; meetingAgendaDescription: string; meetingMinutesDescription: string; budgetDescription: string; formBSource: string; formFSource: string; complaintNoticeSource: string; meetingAgendaSource: string; meetingMinutesSource: string; budgetSource: string; vsLabel: string; compliancePageTitle: string; complianceMetaDescription: string; agentRoleCallout: string; questionsLabel: string; minimumAllocation: string; moduleHeader: string; domainHeader: string; workflowTriggerHeader: string; crtRiskLabel: string; standardFineCap: string; perStandardBylawInfraction: string; shortTermRentalCap: string; strViolationsBc: string; conveyancingIntro: string; saleBlocking: string; meetingsIntro: string; quorumRulesTitle: string; requirementLabel: string; formulaLabel: string; minuteRuleLabel: string; votingThresholdMatrix: string; typeHeader: string; thresholdHeader: string; denominatorHeader: string; usedForHeader: string; tieBreakerTitle: string; exceptionLabel: string; sourceLabel: string; retentionIntro: string; localizationIntro: string; bcConceptHeader: string; usEquivalentHeader: string; databaseElementHeader: string; architectureIntro: string; kbSourceNote: string; openStrataToolsCta: string; hermesFrameworkDocsCta: string; toolsPageTitle: string; moreAboutLabel: string; whyItMattersLabel: string; docsPageTitle: string; alsoLabel: string; atProjectRoot: string; archMobilePwa: string; archTailscaleGateway: string; archHermesCore: string; archFiatRail: string; archCadCrf: string; archBitcoinRail: string; archPsbtLightning: string; pitchPageTitle: string; pitchMetaDescription: string; liveDataBadge: string; pitchProblemHeading: string; feeFlowScenario: string; perMonth: string; perYear: string; rentalIndexLine: string; avg1brLabel: string; vacancyLabel: string; unitBuildingSuffix: string; openStrataSaves: string; savesSuffix: string; managerHoursTitle: string; legendGrayTeal: string; hrsTraditional: string; hrsWithHermes: string; crfBalanceLabel: string; warChestLabel: string; requiresLicensedBrokerages: string; pitchSoftwareNotManagement: string; githubLabel: string; pitchDataNote: string; homePageTitle: string; homeMetaDescription: string; primaryNavigation: string; mobileNavigation: string; communityOverview: string; closeNavigation: string; openNavigation: string; openProfileMenu: string; openSettings: string; moreOptionsFor: string; closeDialog: string; needAHand: string; visitResourceCentre: string; allSystemsOperational: string; activityFilters: string; activityFiltersToast: string; calendarOptions: string; calendarOptionsToast: string; thisMonth: string; urgent: string; caughtUpToast: string; workspaceSelected: string; workspaceOpened: string; buildingActionsToast: string; meetingPlannerToast: string; legalLibraryToast: string; maintenanceToast: string; activityHistoryToast: string; calendarOpenedToast: string; formationCreatedToast: string; aboutPageTitle: string; warChestIntro: string; warChestMiddle: string; purposeLabel: string; blogPageTitle: string; templatesMetaDescription: string; legalMetaDescription: string; roadmapPageTitle: string; liveBadge: string; phaseLabel: string; rssPageTitle: string; specPageTitle: string; faqTitle: string; faqIntro: string; rssFeedLabel: string; navUnits: string; navAccounting: string; navPay: string; payFees: string; navTaxCra: string; navCalendar: string; navMeetings: string; subscribeViaRss: string; footerCookieNotice: string; openLotList: string; communityNamePlaceholder: string; corpNamePlaceholder: string; addressPlaceholder: string; bcfsaLicensePlaceholder: string; crfLabel: string; subAccountsCount: string; notFoundTitle: string; notFoundSubtitle: string; errorTitle: string; errorSubtitle: string; backHome: string; goBack: string; toggleTheme: string; searchHint: string; searchRecents: string; searchShare: string; searchNoResults: string; searchPages: string; searchPosts: string; searchFaq: string; searchTemplates: string; searchLegal: string; satohashHealth: string; satohashOnline: string; satohashOffline: string; satohashStampTitle: string; satohashVerifyTitle: string; satohashHashPlaceholder: string; satohashStampAction: string; satohashVerifyAction: string; satohashStampDone: string; satohashHashInvalid: string; saveBuilding: string; savedBuildings: string; loadBuilding: string; downloadConfig: string; buildingSavedToast: string; nameRequired: string; printDeck: string; notificationsEmpty: string; etransferTitle: string; etransferIntro: string; etransferMatchBrief: string; etransferMatchFull: string; etransferInbound: string; etransferFootnote: string; reconTotalReceived: string; reconResolved: string; reconAuto: string; reconNeedsReview: string; reconAssignTo: string; reconAmount: string; reconManual: string; reconAmbiguous: string; reconUnmatched: string; reconSelectUnit: string; signIn: string; signOut: string; createAccount: string; email: string; password: string; yourName: string; authSignInTitle: string; authCreateTitle: string; authError: string; demo: string; authIntro: string; authUnavailable: string; authNote: string; operatingFund: string; meetingsQuorumTool: string; quorumCouncil: string; councilSize: string; eligibleVoters: string; presentVoters: string; quorumMet: string; quorumNotMet: string; requiredLabel: string; presentLabel: string; shortfallLabel: string; yesLabel: string; noLabel: string; abstainLabel: string; countQuorum: string; countVote: string; resolutionPassed: string; resolutionFailed: string; denominatorLabel: string; specialLevyLabel: string; chainVerified: string; totalLabel: string; reconImportCsv: string; xpubTitle: string; xpubIntro: string; xpubRegistered: string; xpubRegister: string; xpubPerUnit: string; xpubInvalid: string; xpubDemo: string; evidenceTitle: string; evidenceIntro: string; crtExport: string; formBPrint: string; formFPrint: string; portableExport: string; evidenceDemo: string; unitDetail: string; arBalance: string; unitPayments: string; removeUnit: string; emptySearchTitle: string; emptySearchHint: string; unitPaymentsEmpty: string; onThisPage: string; goodAfternoon: string; goodEvening: string; tourIntro: string; tourIntroText: string; tourSignIn: string; tourSignInText: string; tourCreate: string; tourCreateText: string; tourLive: string; tourLiveText: string; tourSkip: string; tourNext: string; tourDone: string; tourVideoTitle: string; tourVideoSub: string; tourVideoCta: string; tourVideoFallback: string; lastSynced: string; refresh: string; confirmRemoveUnit: string; confirmRemoveUnitMessage: string; confirmSignOut: string; confirmSignOutMessage: string;
 checkoutTitle: string; checkoutHint: string; checkoutAmount: string; checkoutRail: string; checkoutGetQuote: string; checkoutConfirm: string; checkoutPaid: string; checkoutQuoteHint: string; receiptTxid: string; receiptSats: string; receiptRate: string; receiptStamp: string; receiptCopy: string; monthlyCloseTitle: string; monthlyCloseHint: string; monthlyClosePeriod: string; monthlyCloseRun: string; monthlyCloseCharged: string; monthlyCloseNotices: string; monthlyCloseNone: string; monthlyCloseDone: string; bylawCaseTitle: string; bylawCaseHint: string; bylawCaseNew: string; bylawCaseEvidence: string; bylawCaseSubmit: string; bylawCaseNotice: string; bylawCaseLock: string; bylawCaseUnlocked: string; bylawCaseFine: string; bylawCaseNoFine: string; bylawCaseMinutes: string; bylawCaseState: string; membersTitle: string; membersHint: string; membersAdd: string; membersEmail: string; membersRole: string; membersEmpty: string; deadlinesTitle: string; deadlinesHint: string; deadlinesOverdue: string; deadlinesDays: string; deadlinesEmpty: string; railsTitle: string; railsHint: string; railsAsOf: string; railsNode: string; railsNotConnected: string; signingTitle: string; signingHint: string; signingRequired: string; signingBroadcast: string; signingEmpty: string; signingReady: string; signingScan: string; walletTitle: string; walletHint: string; walletAddresses: string; walletCopy: string; walletCopied: string; walletExplorer: string; walletNone: string; ledgerTitle: string; ledgerHint: string; ledgerVerify: string; ledgerVerified: string; ledgerCsv: string; ledgerEmpty: string; exportTitle: string; exportHint: string; managerTitle: string; managerHint: string; managerInvite: string; managerTempPassword: string; managerEmpty: string; rateTitle: string; rateUpdated: string; eduCrf: string; eduCrfText: string; eduMultisig: string; eduMultisigText: string; eduLnurl: string; eduLnurlText: string; eduOts: string; eduOtsText: string; eduDca: string; eduDcaText: string; designTitle: string; designIntro: string; themeBrokerage: string; themeBrand: string; rosaTitle: string; rosaIntro: string; rosaPlaceholder: string; rosaSend: string; rosaUncertain: string; rosaNoMatch: string; rosaDemo: string; demoLabel: string; wizardRegister: string; wizardRegistered: string; scanToPay: string; openInWallet: string; formsTrackerTitle: string; formsTrackerHint: string; formsRequestDate: string; formsDeliverBy: string; formsDaysLeft: string; formsIssueB: string; formsIssueF: string; myUnitTitle: string; myUnitHint: string; myUnitNoMatch: string; ballotTitle: string; ballotHint: string; ballotResolution: string; ballotCast: string; ballotTie: string; ballotExport: string; noticeTitle: string; noticeHint: string; noticeType: string; noticeWhen: string; noticeWhere: string; noticePrint: string; caseFileTitle: string; caseFileHint: string; caseFilePrint: string; minutesTitle: string; healthBasedOn: string; balancesTitle: string; balancesHint: string; balancesReceived: string; balancesConfirmed: string; dcaTitle: string; dcaHint: string; dcaAllocation: string; dcaFrequency: string; dcaProjected: string; dcaDisclosure: string; readinessTitle: string; readinessHint: string; readinessEnv: string; readinessGuide: string; readinessConnected: string; readinessConfigured: string; readinessPending: string; chainViz: string; offlineTitle: string; offlineText: string; installApp: string; connectTitle: string; connectHint: string; connectSteps: string; connectDemo: string; authWelcomeBack: string; authCreateHeading: string; authStepBuilding: string; authStepAccount: string; authContinue: string; authBack: string; authEmailInvalid: string; authPasswordHint: string; authStrengthWeak: string; authStrengthOk: string; authStrengthStrong: string; authShowPassword: string; authHidePassword: string; authDemoBrowse: string; authSecureNote: string; authTrustChain: string; authTrustChainText: string; authTrustRails: string; authTrustRailsText: string; authTrustCompliance: string; authTrustComplianceText: string; authSigningIn: string; authCreating: string; welcomeBackTitle: string; authWelcomeBackText: string; authCreatedText: string; authLoadingWorkspace: string; manualTitle: string; manualIntro: string; manualSections: string; manualReadMore: string; manualWelcomeTitle: string; manualWelcomeIntro: string; manualStartIntro: string; manualStartHere: string, manualStartTitle: string, manualPrereqs: string, manualSixSteps: string, manualCosts: string, manualCostsIntro: string, manualTrouble: string, manualTroubleIntro: string, manualBackToSections: string, manualWhatItDoes: string, manualWhoFor: string, manualWhatNot: string, manualNextStep: string; demoNoticeTitle: string; demoNoticeBody: string; demoNoticeCta: string; demoNoticeLearn: string; devHostLabel: string; devHostPrompt: string; tourFactsTitle: string; tourFact1: string; tourFact2: string; tourFact3: string; tourFact4: string; tourHowTitle: string; tourHow1: string; tourHow2: string; tourHow3: string; journeyTitle: string; journeyStep1: string; journeyHint1: string; journeyStep2: string; journeyHint2: string; journeyStep3: string; journeyHint3: string; setupTitle: string; setupIntro: string; setupStep1: string; setupHint1: string; setupStep2: string; setupHint2: string; setupStep3: string; setupHint3: string; setupStep4: string; setupHint4: string; setupOpen: string; setupHide: string; setupShow: string; setupDone: string; setupDoneHint: string; changelogLink: string; changelogBadge: string; changelogTitle: string; changelogIntro: string; changelogPageTitle: string; changelogMetaDescription: string; changelogLatest: string; changelogReleasesLabel: string; changelogChangesLabel: string; changelogFilterLabel: string; changelogFilterAll: string; changelogFilterHint: string; changelogGroupAdded: string; changelogGroupChanged: string; changelogGroupFixed: string; changelogGroupVerified: string; changelogGroupKnown: string; changelogShowAll: string; changelogShowLess: string; changelogEarlier: string; changelogEarlierHint: string; changelogNotesUnavailable: string; changelogSubscribe: string; changelogSubscribeHint: string; changelogViewRss: string; documentsBadge: string; documentsTitle: string; documentsIntro: string; documentsPageTitle: string; documentsMetaDescription: string; documentsSampleTitle: string; documentsSampleNote: string; documentsPick: string; documentsPrint: string; documentsPrintAll: string; documentsPrintHint: string; documentsPackage: string; documentsPackageHint: string; documentsPackageContents: string; documentsPackagePrepared: string; custodyLink: string; custodyBadge: string; custodyPageTitle: string; custodyMetaDescription: string; custodyTitle: string; custodyIntro: string; custodyFlowTitle: string; custodyCantTitle: string; custodyCheckTitle: string; custodyTodayTitle: string; custodyCta: string; custodyCtaNote: string; checkoutLabelTitle: string; checkoutLabelHint: string; tasksTitle: string; tasksHint: string; tasksEmpty: string; tasksMore: string; tasksHide: string; tasksShow: string; tasksOverdue: string; tasksSoon: string; tasksRoutine: string; tasksSetup: string; startEyebrow: string; startTitle: string; startIntro: string; startExplore: string; startExploreHint: string; startExploreAction: string; startSetup: string; startSetupHint: string; startSetupAction: string; startSignIn: string; startSignInHint: string; startSignInAction: string; startNote: string; resumeTitle: string; resumeOf: string; resumeProgress: string; resumeAction: string; resumeDismiss: string; resumedFromDraft: string; searchDocuments: string; searchManual: string; demoBannerTitle: string; demoBannerBody: string; demoBannerCta: string; demoBannerDismiss: string; searchShortPages: string; searchShortPosts: string; searchShortFaq: string; searchShortTemplates: string; searchShortDocuments: string; searchShortManual: string; searchShortLegal: string; searchShortFeeds: string; searchShortTools: string; searchShortTasks: string; thanksPageTitle: string; thanksMetaDescription: string; thanksBackToWizard: string; thanksSeeEveryModule: string; thanksNextTitle: string; thanksNoHiddenSteps: string; thanksNoHiddenStepsBody: string; thanksFrameworkDocs: string; thanksComplianceRef: string; wizardWhatNext: string; proofCustodyTitle: string; proofCustodyBody: string; proofClocksTitle: string; proofClocksBody: string; terms: string; privacyPageTitle: string; privacyMetaDescription: string; termsPageTitle: string; termsMetaDescription: string; designTypeHeading: string; designTypeBody: string; designMonoLine: string; designEyebrowLine: string; designCardNote: string; designStatesIcons: string; searchPageTitle: string; searchMetaDescription: string; searchPageIntro: string; searchResultsCount: string; helpStartHere: string; tourReplay: string; tasksFilterDone: string; tasksFilterWeek: string; searchHintOpen: string; searchHintClose: string; errorSearchTitle: string; backToTop: string; searchSave: string; fmTitle: string; fmSubtitle: string; fmStep1: string; fmHint1: string; fmStep2: string; fmHint2: string; fmStep3: string; fmHint3: string; fmStep4: string; fmHint4: string; fmStep5: string; fmHint5: string; fmNext: string; fmComplete: string; fmReset: string; fmHide: string; fmShow: string; drillDownNote: string; calTitle: string; calHint: string; calLegendDue: string; calLegendWindow: string; calPrevMonth: string; calNextMonth: string; calPopOpenTools: string; calPopDueIn: string; skipToContent: string; payLot: string; payAmountDue: string; payReference: string; payChooseRail: string; paySendTo: string; payMessage: string; payCopyInstructions: string; payRateLocked: string; payRateExpired: string; payResetLock: string; payOtherWays: string; payOtherWaysHint: string; payNothingDue: string; payRateLine: string; payInteracButton: string; payInteracButtonNote: string; payInteracTitle: string; payInteracLiveBadge: string; payInteracDemoBadge: string; payInteracAmount: string; payInteracReference: string; payInteracRequestLabel: string; payInteracContactTitle: string; payInteracContactHint: string; payInteracContactPlaceholder: string; payInteracContactInvalid: string; payInteracStart: string; payInteracStarting: string; payInteracHandoffTitle: string; payInteracHandoffNote: string; payInteracContinue: string; payInteracUntrusted: string; payInteracCancelNote: string; payInteracSimulated: string; payInteracPickBank: string; payInteracPickBankHint: string; payInteracSearch: string; payInteracNoBank: string; payInteracApprove: string; payInteracDecline: string; payInteracCancel: string; payInteracRequested: string; payInteracWaiting: string; payInteracApproved: string; payInteracDeposited: string; payInteracDeclined: string; payInteracExpired: string; payInteracCancelled: string; payInteracConfirmed: string; payInteracUnconfirmed: string; payInteracUnknownReturn: string; payInteracDone: string; payInteracReturned: string; payInteracUnreachable: string; payLinkChecking: string; payLinkInvalidTitle: string; payLinkInvalidBody: string; payLinkOffline: string; payLinkReason: string; payLinkExpires: string; payLinkLede: string; accPageTitle: string; accKicker: string; accTitle: string; accLede: string; accTabOverview: string; accTabBudget: string; accTabReceivables: string; accTabPayables: string; accTabFunds: string; accTabJournal: string; accOperatingCash: string; accUnrestrictedEquity: string; accReserve: string; accCash: string; accLevyTrust: string; accOfWorkLeft: string; accWarChestAtCost: string; accWarChestValue: string; accTieOk: string; accTieBad: string; accChartTitle: string; accChartSub: string; accChartLegend: string; accYtdTitle: string; accYtdFees: string; accYtdOther: string; accYtdExpenses: string; accYtdSurplus: string; accYtdWarChest: string; accInsuranceTitle: string; accInsuranceBody: string; accDepreciationBody: string; accColAccount: string; accColAnnualBudget: string; accColLeft: string; accRowStrataFees: string; accRowCrfContribution: string; accRowBudgetResult: string; accBudgetNote: string; accReceivablesHint: string; accPastDueOnly: string; accShowEveryLot: string; accColOwner: string; accColOctober: string; accColBehind: string; accColLate: string; accColFine: string; accColLevy: string; accColTotal: string; accColFormF: string; accReceivablesNote: string; accColWho: string; accColFor: string; accColDue: string; accColAmount: string; accPayableCra: string; accPayableCraMemo: string; accStateOpen: string; accContractRenewal: string; accFundOperating: string; accFundReceivables: string; accPrepaidInsurance: string; accBillsPayroll: string; accPrepaidFees: string; accFundBalance: string; accContingencyReserve: string; accCrfOpening: string; accCrfContributions: string; accCrfInterest: string; accCrfNote: string; accParkadeLevy: string; accLevyAssessed: string; accLevyCollected: string; accStillOwing: string; accLevySpent: string; accLevyRemaining: string; accLevyNote: string; accJournalIntro: string; accCloseTitle: string; accCloseHint: string; accCloseCount: string; accCloseAction: string; accCloseBlocked: string; accCloseLocked: string; accCloseTieTitle: string; accCloseTieBody: string; accClosePayrollTitle: string; accClosePayrollBody: string; accCloseReserveTitle: string; accCloseReserveBody: string; accCloseBoardTitle: string; accCloseBoardBody: string; accCloseLockTitle: string; accCloseLockBody: string; accStateDone: string; accStateBlocked: string; accCashLabel: string; next30Title: string; next30Hint: string; next30TaxHint: string; next30Today: string; next30Week: string; next30Later: string; next30Empty: string; next30SeeCalendar: string; next30DueToday: string; next30Tomorrow: string; next30DaysLeft: string; unitsPageTitle: string; unitsKicker: string; unitsTitle: string; unitsLede: string; unitsSearchPlaceholder: string; unitsSearchLabel: string; unitsFloor: string; unitsFilterAll: string; unitsFilterArrears: string; unitsFilterFormK: string; unitsFilterLevy: string; unitsFilterWithheld: string; unitsFilterVacant: string; unitsFilterShortTerm: string; unitsFilterClear: string; unitsFiltersKept: string; unitsNoMatch: string; unitsLotHeading: string; unitsMonthlyFee: string; unitsToClear: string; unitsEntitlement: string; unitsPoints: string; unitsOctoberPaid: string; unitsOctoberDue: string; unitsFeesBehind: string; unitsFeesBehindMonths: string; unitsLateFees: string; unitsFines: string; unitsLevyOwing: string; unitsFeeSplit: string; unitsLives: string; unitsOccOwner: string; unitsOccVacant: string; unitsOccShortTerm: string; unitsTenantSince: string; unitsOwnerIsIn: string; unitsFormK: string; unitsPaysBy: string; unitsParking: string; unitsPets: string; unitsEv: string; unitsEvYes: string; unitsEvNo: string; unitsEht: string; unitsSvt: string; unitsUht: string; unitsPayThisLot: string; unitsFormBNote: string; calPageTitle: string; calKicker: string; calHeading: string; calLede: string; calPrevious: string; calNext: string; calAllDates: string; calNothingDated: string; calEverythingIn: string; calCatFees: string; calCatCouncil: string; calCatCra: string; calCatBcTax: string; calCatMaintenance: string; calCatInsurance: string; calCatCompliance: string; calCatPayroll: string; unitsSpec: string; unitsPerMonth: string; taxPageTitle: string; taxKicker: string; taxHeading: string; taxLede: string; taxPriorYear: string; taxRevenue: string; taxOperating: string; taxReserve: string; taxExcess: string; taxFundsLine: string; taxDueApplies: string; taxInOrder: string; taxChecklist: string; taxDone: string; taxOpen: string; taxReadSteps: string; meetPageTitle: string; meetKicker: string; meetTitle: string; meetLede: string; meetAgmQuorum: string; meetCouncilQuorum: string; meetOfFive: string; meetNoShow: string; meetCouncil: string; meetSince: string; meetLot: string; meetNextMeeting: string; meetMinutes: string; meetAgm: string; meetBylawFile: string; meetWhichVote: string; payPageTitle: string; payPageHeading: string; payExactBitcoin: string; payExactLightning: string; payWatchAddress: string; payInvoice: string; payStandingOffer: string; payMatchingTitle: string; payTapeTitle: string; payTapeNote: string; payColDate: string; payColLot: string; payColRail: string; payColReference: string; payColAmount: string; payVendorTitle: string; payVendorBody: string; meetQuorumOfLots: string; meetNextAgmLine: string; payKicker: string; payLede: string; payFeeSplitLine: string; changelogTrailYouAreHere: string; changelogTrailSince: string; changelogTrailChangeOne: string; changelogTrailChangeMany: string; changelogTrailRunning: string; changelogTrailUpToDate: string; changelogTrailBehindOne: string; changelogTrailBehindMany: string; changelogTrailAhead: string; unitsPlanLine: string; unitsPlanHint: string; unitsPlanCorridor: string; unitsPlanLotAria: string; accColEntry: string; accStatementCash: string; accColRunning: string; accStatementDetails: string; accStatementHash: string; accStatementPostedBy: string; accStatementOpening: string; accStatementClosing: string; accStatementChain: string; accStatementEvidence: string; accAgePastDue: string; accAgePastDueLots: string; accAgeOver90Label: string; accAgeShare: string; accAgeOldestLabel: string; accAgeOldestDays: string; accAgeHint: string; accAgeCurrent: string; accAge30: string; accAge60: string; accAge90: string; accAgeOver90: string; accAgeBucketDays: string; accAgeClear: string; accAgePlanTitle: string; accAgePlanLine: string; accPeriodBanner: string; accPeriodBack: string; accPeriodCloseNote: string; accStatementOpeningAt: string; accStatementClosingAt: string; accStatementNone: string; healthTrendOpenBooks: string; healthTrendCutAll: string; healthTrendCutMonth: string; healthTrendNoDated: string; lotSheetFormKWindow: string; lotSheetKicker: string; lotSheetLede: string; lotSheetFee: string; lotSheetLate: string; lotSheetFine: string; lotSheetLevy: string; lotSheetCharged: string; lotSheetCleared: string; lotSheetStill: string; lotSheetAccount: string; lotSheetAccountHint: string; lotSheetForms: string; lotSheetFormFWithheld: string; lotSheetFormFClear: string; lotSheetNext: string; lotSheetNextEmpty: string; lotSheetPrint: string; lotSheetPrintNote: string; lotSheetTenancy: string; lotSheetOpen: string; healthTrendTitle: string; healthTrendLede: string; healthTrendDeadlines: string; healthTrendArrears: string; healthTrendFormK: string; healthTrendMoved: string; healthTrendFlat: string; healthTrendNote: string; healthTrendOverSix: string; healthTrendSince: string; healthTrendOpenMonth: string; healthTrendClose: string; healthTrendCharges: string; healthTrendNoCharges: string; healthTrendNoFormK: string; accCashAt: string; accCashByMonth: string; accCashByMonthHint: string; accColMonthEnd: string; accColChange: string; accCashNoStatement: string; accCashCloseNote: string; lotSheetFormKDate: string; lotSheetFormKFile: string; lotSheetFormKFiled: string; lotSheetFormKFiledNote: string; lotSheetFormKClear: string; healthTrendPastWindow: string; formKRegisterTitle: string; formKRegisterKicker: string; formKRegisterLede: string; formKRegisterPrint: string; formKRegisterPrintNote: string; formKRegisterBack: string; formKRegisterLink: string; formKRegisterLot: string; formKRegisterTenant: string; formKRegisterSince: string; formKRegisterClosed: string; formKRegisterOpen: string; formKRegisterOnFile: string; formKRegisterDaysPast: string; formKRegisterCost: string; formKRegisterSummary: string; formKRegisterClear: string; formKRegisterNote: string; formKRegisterCapped: string; accTabReserve: string; accReserveTitle: string; accReserveLede: string; accReservePrint: string; accReservePrintNote: string; accReserveColYear: string; accReserveColOpening: string; accReserveColContribution: string; accReserveColInterest: string; accReserveColScheduled: string; accReserveColClosing: string; accReserveReport: string; accReserveRate: string; accReserveFunding: string; accReserveLevy: string; accReserveShortfall: string; accReserveCovers: string; yearSheetKicker: string; yearSheetTitle: string; yearSheetLede: string; yearSheetPrint: string; yearSheetPrintNote: string; yearSheetFiscal: string; yearSheetBooksTo: string; yearSheetYear: string; yearSheetIncome: string; yearSheetExpense: string; yearSheetActual: string; yearSheetSurplus: string; yearSheetHealth: string; yearSheetHealthLine: string; yearSheetHealthDown: string; yearSheetHealthUp: string; yearSheetHealthFlat: string; yearSheetOpen: string; yearSheetOpenEmpty: string; yearSheetDue: string; yearSheetItem: string; yearSheetOpenSummary: string; yearSheetBasis: string; yearSheetFooter: string; yearCatFees: string; yearCatParking: string; yearCatFines: string; yearCatInterest: string; yearCatFobs: string; yearCatInsurance: string; yearCatUtilities: string; yearCatPeople: string; yearCatSystems: string; yearCatGrounds: string; yearCatProfessional: string; yearCatAdministration: string; meetPacketTitle: string; meetPacketLede: string; meetPacketPrint: string; meetPacketPrintNote: string; meetPacketHeading: string; meetPacketNotice: string; meetPacketNoticeLine: string; meetPacketDate: string; meetPacketTime: string; meetPacketPlace: string; meetPacketGiven: string; meetPacketGivenLine: string; meetPacketAgenda: string; meetPacketNextAgm: string; meetPacketFooter: string; searchUnits: string; searchShortUnits: string; searchLedger: string; searchShortLedger: string; searchTax: string; searchShortTax: string; payReceiptTitle: string; payReceiptFor: string; payReceiptAmount: string; payReceiptPaidBy: string; payReceiptOpen: string; payReceiptPrint: string; payReceiptHint: string; payReceiptRateLost: string; payReceiptBasis: string;
  budgetSheetTitle: string;
  budgetSheetLede: string;
  budgetSheetSubtitle: string;
  budgetSheetPrint: string;
  budgetSheetPrintNote: string;
  budgetSheetColVariance: string;
  budgetSheetIncome: string;
  budgetSheetExpenses: string;
  budgetSheetOnPlan: string;
  budgetSheetOver: string;
  budgetSheetUnder: string;
  budgetSheetPlanNote: string;
  budgetSheetBasis: string;
  budgetSheetReasonNote: string;
  budgetSheetFooter: string;
  yearCalHeading: string;
  yearCalLede: string;
  yearCalTitle: string;
  yearCalSubtitle: string;
  yearCalPrint: string;
  yearCalPrintNote: string;
  yearCalGridNote: string;
  yearCalMonth: string;
  yearCalLegend: string;
  yearCalLegendDeadline: string;
  yearCalLegendItem: string;
  yearCalWindows: string;
  yearCalWindowPayroll: string;
  yearCalWindowPayrollRule: string;
  yearCalWindowEpr: string;
  yearCalWindowEprRule: string;
  yearCalWindowT2: string;
  yearCalWindowT2Rule: string;
  yearCalWindowSvt: string;
  yearCalWindowSvtRule: string;
  yearCalWindowT4: string;
  yearCalWindowT4Rule: string;
  yearCalWindowAgm: string;
  yearCalWindowEach: string;
  yearCalDaysIn: string;
  yearCalDaysEach: string;
  yearCalAfter: string;
  yearCalAfterRule: string;
  yearCalItems: string;
  yearCalAfterItems: string;
  yearCalRhythm: string;
  yearCalFooter: string;
  accArrearsSheetTitle: string;
  accArrearsSheetLede: string;
  accArrearsSheetSubtitle: string;
  accArrearsSheetPrint: string;
  accArrearsSheetPrintNote: string;
  accArrearsSheetFormF: string;
  accArrearsSheetWithheld: string;
  accArrearsSheetBook: string;
  accArrearsSheetClear: string;
  accArrearsSheetPlanLine: string;
  accArrearsSheetBasis: string;
  accArrearsSheetFooter: string;
  accCashStatementTitle: string;
  accCashStatementSubtitle: string;
  accCashStatementPrint: string;
  accCashStatementPrintNote: string;
  accCashStatementOpening: string;
  accCashStatementClosing: string;
  accCashStatementMovement: string;
  accCashStatementAccount: string;
  accCashStatementEntries: string;
  accCashStatementNoEntry: string;
  accCashStatementChain: string;
  accCashStatementHead: string;
  accCashStatementBasis: string;
  accCashStatementTie: string;
  accCashStatementPeriod: string;
  accCashStatementFooter: string;
  accReconTitle: string;
  accReconLede: string;
  accReconSubtitle: string;
  accReconPrint: string;
  accReconPrintNote: string;
  accReconCashTitle: string;
  accReconOperatingTitle: string;
  accReconAccounts: string;
  accReconActivity: string;
  accReconDifference: string;
  accReconBills: string;
  accReconPayroll: string;
  accReconOpening: string;
  accReconFees: string;
  accReconOther: string;
  accReconExpenses: string;
  accReconLevyCash: string;
  accReconAssessed: string;
  accReconAgrees: string;
  accReconFails: string;
  accReconOffBy: string;
  accReconJournal: string;
  accReconEntitlement: string;
  accReconBasis: string;
  accReconFooter: string;
  accTabLevy: string;
  accLevySheetLede: string;
  accLevySheetPrint: string;
  accLevySheetPrintNote: string;
  accLevySheetSubtitle: string;
  accLevySheetTrust: string;
  accLevyColAssessed: string;
  accLevyColPaid: string;
  accLevyColPoints: string;
  accLevySheetLots: string;
  accLevySheetPlan: string;
  accLevySettled: string;
  accLevySheetCheck: string;
  accLevyOnePoint: string;
  accLevySheetBasis: string;
  accLevySheetFooter: string;
  formKRegisterSheetFooter: string;
  accLine4000: string;
  accLine3500: string;
  accLine7010: string;
  accLine7020: string;
  accLine7030: string;
  accLine7040: string;
  accLine7050: string;
  accLine7060: string;
  accLine6100: string;
  accLine6110: string;
  accLine6120: string;
  accLine6130: string;
  accLine6140: string;
  accLine6200: string;
  accLine6210: string;
  accLine6215: string;
  accLine6220: string;
  accLine6230: string;
  accLine6240: string;
  accLine6250: string;
  accLine6260: string;
  accLine6270: string;
  accLine6280: string;
  accLine6290: string;
  accLine6300: string;
  accLine6310: string;
  accLine6320: string;
  accLine6330: string;
  accLine6340: string;
  accLine6350: string;
  accLine6360: string;
  accLine6370: string;
  accLine6380: string;
  accLine6390: string;
  accLine6400: string;
  accLine6410: string;
  accLine6490: string;
  accReason6210: string;
  accReason6230: string;
  accReason6240: string;
  accReason6260: string;
  accReason6320: string;
  accReason6340: string;
  accReason6360: string;
  accReason6410: string;
  accPayablesTitle: string;
  accPayablesSubtitle: string;
  accPayablesLede: string;
  accPayablesPrint: string;
  accPayablesPrintNote: string;
  accPayablesDays: string;
  accPayablesLate: string;
  accPayablesWindow: string;
  accPayablesDueBy: string;
  accPayablesAfter: string;
  accPayablesBasis: string;
  accPayablesFooter: string;
  accTrialTitle: string;
  accTrialSubtitle: string;
  accTrialDebit: string;
  accTrialCredit: string;
  accTrialBalance: string;
  accTrialPrintNote: string;
  accTrialAgrees: string;
  accTrialFails: string;
  accTrialUnmoved: string;
  accTrialBasis: string;
  accTrialFooter: string;
  meetProxyHeading: string;
  meetProxySubtitle: string;
  meetProxyDueLabel: string;
  meetProxyAppointee: string;
  meetProxyAppoint: string;
  meetProxyDirection: string;
  meetProxyFor: string;
  meetProxyAgainst: string;
  meetProxyAbstain: string;
  meetProxyDiscretion: string;
  meetProxyDue: string;
  meetProxySignature: string;
  meetProxyDated: string;
  meetProxyBasis: string;
  meetProxyFooter: string;
  unitsFeeSheetTitle: string;
  unitsFeeSheetSubtitle: string;
  unitsFeeSheetLots: string;
  unitsFeeSheetAnnual: string;
  unitsFeeSheetTenant: string;
  unitsFeeSheetTenanted: string;
  unitsFeeSheetBasis: string;
  unitsFeeSheetFooter: string;
  unitsFeeSheetPrint: string;
  unitsFeeSheetPrintNote: string;
  unitsFeeSheetShow: string;
  unitsFeeSheetHide: string;
  unitsFeeSheetLede: string;
  ffCertReference: string;
  ffCertIssued: string;
  ffCertDeliverBy: string;
  ffCertTitle: string;
  ffCertSubtitle: string;
  ffCertBalanceLabel: string;
  ffCertOwing: string;
  ffCertNothing: string;
  ffCertNext: string;
  ffCertIssuedState: string;
  ffCertWithheld: string;
  ffCertWithheldNote: string;
  ffCertClearNote: string;
  ffCertSecretary: string;
  ffCertBasis: string;
  ffCertFooter: string;
  ffCertShow: string;
  ffCertHide: string;
  ffCertPrint: string;
  ffCertPrintNote: string;
  ffCertLede: string;
  agmNoticeTitle: string;
  agmNoticeSubtitle: string;
  agmNoticeIssued: string;
  agmNoticeDueBy: string;
  agmNoticeTo: string;
  agmNoticeLine: string;
  agmNoticeGiven: string;
  agmNoticeLate: string;
  agmNoticeMotions: string;
  agmNoticeVote: string;
  agmNoticeQuorum: string;
  agmNoticeProxy: string;
  agmNoticeBasis: string;
  agmNoticeFooter: string;
  finesSheetTitle: string;
  finesSheetSubtitle: string;
  finesSheetBooksTo: string;
  finesSheetCount: string;
  finesSheetBylaw: string;
  finesSheetNotice: string;
  finesSheetWindow: string;
  finesSheetHearing: string;
  finesSheetVote: string;
  finesSheetPosted: string;
  finesSheetStatus: string;
  finesSheetDefectWindow: string;
  finesSheetDefectVote: string;
  finesSheetDefectPosting: string;
  finesSheetPaid: string;
  finesSheetUnpaidDays: string;
  finesSheetOwingOf: string;
  finesSheetSummary: string;
  finesSheetCeiling: string;
  finesSheetAbove: string;
  finesSheetDefects: string;
  finesSheetNoDefects: string;
  finesSheetEmpty: string;
  finesSheetBasis: string;
  finesSheetFooter: string;
  vendorSheetTitle: string;
  vendorSheetLede: string;
  vendorSheetPrint: string;
  vendorSheetPrintNote: string;
  vendorSheetSubtitle: string;
  vendorSheetBooks: string;
  vendorSheetFiscal: string;
  vendorSheetVendor: string;
  vendorSheetLines: string;
  vendorSheetBudget: string;
  vendorSheetPaid: string;
  vendorSheetLeft: string;
  vendorSheetShare: string;
  vendorSheetContracted: string;
  vendorSheetUnclaimed: string;
  vendorSheetTotals: string;
  vendorSheetBalanced: string;
  vendorSheetUnbalanced: string;
  vendorSheetOutside: string;
  vendorSheetDuplicates: string;
  vendorSheetMissing: string;
  vendorSheetBasis: string;
  vendorSheetFooter: string;
  accTabVendors: string;
  reserveSheetTitle: string;
  reserveSheetLede: string;
  reserveSheetPrint: string;
  reserveSheetPrintNote: string;
  reserveSheetSubtitle: string;
  reserveSheetReport: string;
  reserveSheetRecommended: string;
  reserveSheetDifference: string;
  reserveSheetTotal: string;
  reserveSheetGap: string;
  reserveSheetReceived: string;
  reserveSheetShortfall: string;
  reserveSheetCovers: string;
  reserveSheetBasis: string;
  accTabReserveShares: string;
  arrearsLetterTitle: string;
  arrearsLetterLede: string;
  arrearsLetterPrint: string;
  arrearsLetterPrintNote: string;
  arrearsLetterShow: string;
  arrearsLetterHide: string;
  arrearsLetterReference: string;
  arrearsLetterSubject: string;
  arrearsLetterTo: string;
  arrearsLetterIntro: string;
  arrearsLetterAge: string;
  arrearsLetterSchedule: string;
  arrearsLetterPlan: string;
  arrearsLetterClearShort: string;
  arrearsLetterPlanLine: string;
  arrearsLetterNext: string;
  arrearsLetterNone: string;
  arrearsLetterDeadline: string;
  arrearsLetterPayTitle: string;
  arrearsLetterEtransfer: string;
  arrearsLetterOther: string;
  arrearsLetterQuestions: string;
  arrearsLetterSignature: string;
  arrearsLetterDated: string;
  arrearsLetterBasis: string;
  hearingNoticeTitle: string;
  hearingNoticeSubtitle: string;
  hearingNoticeReference: string;
  hearingNoticeServed: string;
  hearingNoticeHearing: string;
  hearingNoticeTo: string;
  hearingNoticeIntro: string;
  hearingNoticeReceived: string;
  hearingNoticeWindow: string;
  hearingNoticeTime: string;
  hearingNoticePlace: string;
  hearingNoticeEvidence: string;
  hearingNoticeAmount: string;
  hearingNoticeMaximum: string;
  hearingNoticeLevied: string;
  hearingNoticeRights: string;
  hearingNoticeRightsBody: string;
  hearingNoticeOutOfOrder: string;
  hearingNoticeWithheld: string;
  hearingNoticeNoEvidence: string;
  hearingNoticeSequence: string;
  hearingNoticeBasis: string;
  hearingNoticeFooter: string;
  hearingNoticeLede: string;
  accTabPayroll: string;
  payrollTitle: string;
  payrollLede: string;
  payrollPrint: string;
  payrollPrintNote: string;
  payrollSubtitle: string;
  payrollReference: string;
  payrollPayHeading: string;
  payrollHoursLine: string;
  payrollGross: string;
  payrollEiEmployee: string;
  payrollCppEmployee: string;
  payrollNet: string;
  payrollRemitHeading: string;
  payrollEiEmployer: string;
  payrollCppEmployer: string;
  payrollDueTotal: string;
  payrollDueLine: string;
  payrollCostHeading: string;
  payrollCostLine: string;
  payrollChecksHeading: string;
  payrollAgrees: string;
  payrollDiffers: string;
  payrollNoTax: string;
  payrollRatesLine: string;
  payrollRatesDetail: string;
  payrollUnconfirmed: string;
  payrollBasis: string;
  payrollFooter: string;
  accTabInsurance: string;
  insuranceTitle: string;
  insuranceLede: string;
  insurancePrint: string;
  insurancePrintNote: string;
  insuranceSubtitle: string;
  insuranceTerm: string;
  insurancePremium: string;
  insuranceMonthly: string;
  insuranceExpensed: string;
  insuranceDeductibles: string;
  insuranceWater: string;
  insuranceQuake: string;
  insuranceQuakeRule: string;
  insuranceQuakeFigure: string;
  insuranceDates: string;
  insuranceAppraisal: string;
  insuranceRenewal: string;
  insuranceDaysAhead: string;
  insuranceDaysPast: string;
  insuranceOrderOk: string;
  insuranceOrderOff: string;
  insuranceTermOk: string;
  insuranceTermOff: string;
  insurancePremiumOk: string;
  insurancePremiumOff: string;
  insuranceAccrualOk: string;
  insuranceAccrualOff: string;
  insuranceCost: string;
  insuranceCostLine: string;
  insuranceBasis: string;
  insuranceFooter: string;
  arrearsLetterFooter: string;
  levyLetterShow: string;
  levyLetterHide: string;
  levyLetterPrint: string;
  levyLetterTitle: string;
  levyLetterSubtitle: string;
  levyLetterTo: string;
  levyLetterIntro: string;
  levyLetterShare: string;
  levyLetterAsk: string;
  levyLetterPlanLine: string;
  levyLetterDays: string;
  levyLetterDeadline: string;
  levyLetterNoDeadline: string;
  levyLetterTrust: string;
  levyLetterTrustLine: string;
  levyLetterTrustGap: string;
  levyLetterNote: string;
  levyLetterFooter: string;
  insuranceNoticeShow: string;
  insuranceNoticeHide: string;
  insuranceNoticePrint: string;
  insuranceNoticeTitle: string;
  insuranceNoticeSubtitle: string;
  insuranceNoticeTo: string;
  insuranceNoticeIntro: string;
  insuranceNoticeStrata: string;
  insuranceNoticeOwner: string;
  insuranceNoticeDeductibles: string;
  insuranceNoticeDeductibleBody: string;
  insuranceNoticeQuakeNoValue: string;
  insuranceNoticeCharge: string;
  insuranceNoticeNoCharge: string;
  insuranceNoticeTerm: string;
  insuranceNoticeExpired: string;
  insuranceNoticeNote: string;
  insuranceNoticeFooter: string;
  minutesLede: string;
  minutesShow: string;
  minutesHide: string;
  minutesPrint: string;
  minutesPrintNote: string;
  minutesDocTitle: string;
  minutesDocSubtitle: string;
  minutesChair: string;
  minutesPresentLabel: string;
  minutesPresent: string;
  minutesDecision: string;
  minutesCarried: string;
  minutesFailed: string;
  minutesNoQuorum: string;
  minutesNotHeard: string;
  minutesProcess: string;
  minutesFine: string;
  minutesOwing: string;
  minutesOwingNone: string;
  minutesNote: string;
  minutesFooter: string;
  renewalCalShow: string;
  renewalCalHide: string;
  renewalCalPrint: string;
  renewalCalPrintNote: string;
  renewalCalLede: string;
  renewalCalTitle: string;
  renewalCalSubtitle: string;
  renewalCalSummary: string;
  renewalCalNext: string;
  renewalCalColDays: string;
  renewalCalColVendor: string;
  renewalCalColService: string;
  renewalCalColLine: string;
  renewalCalToday: string;
  renewalCalTomorrow: string;
  renewalCalDays: string;
  renewalCalStepTag: string;
  renewalCalContinuing: string;
  renewalCalContinuingNote: string;
  renewalCalUnfunded: string;
  renewalCalPassed: string;
  renewalCalNote: string;
  renewalCalFooter: string;
  lienStatusShow: string;
  lienStatusHide: string;
  lienStatusPrint: string;
  lienStatusPrintNote: string;
  lienStatusTitle: string;
  lienStatusSubtitle: string;
  lienStatusTo: string;
  lienStatusSummary: string;
  lienStatusRegistered: string;
  lienStatusVotedFile: string;
  lienStatusVotedDecline: string;
  lienStatusNotVoted: string;
  lienStatusAmountHeading: string;
  lnColFees: string;
  lnColLate: string;
  lnColLevy: string;
  lienStatusNotDue: string;
  lienStatusStepsHeading: string;
  lienStatusColStep: string;
  lienStatusColState: string;
  lienStatusStepDemand: string;
  lienStatusStepOpinion: string;
  lienStatusStepVote: string;
  lienStatusStepRegistration: string;
  lienStatusDone: string;
  lienStatusAheadIn: string;
  lienStatusWaiting: string;
  lienStatusVoteRule: string;
  lienStatusEffectHeading: string;
  lienStatusEffect: string;
  lienStatusFormF: string;
  lienStatusLegal: string;
  lienStatusNote: string;
  lienStatusFooter: string;
  fkLettersShow: string;
  fkLettersHide: string;
  fkLettersPrint: string;
  fkLettersPrintNote: string;
  fkLettersCover: string;
  fkLettersHeld: string;
  fkLetterTitle: string;
  fkLetterSubject: string;
  fkLetterTo: string;
  fkLetterBylaw: string;
  fkLetterDates: string;
  fkLetterTenantUnknown: string;
  fkLetterWhyHeading: string;
  fkLetterWhy: string;
  fkLetterNoFine: string;
  fkLetterMeeting: string;
  fkLetterNoMeeting: string;
  fkLetterAsk: string;
  fkLetterNote: string;
  fkLetterFooter: string;
};

export const english: Translation = {
  dashboardDates: 'Fees, council, and CRA dates',
  dashboardHealthTitle: 'Compliance health on the dashboard.',
  dashboardHealthDetail: 'Every deadline, Form K gap and AR balance is a tracked item with a stake in the score — not a vanity number.',
  roadmapOffered: 'offered, not started',
  payLineOctober: 'October fee',
  payLineArrears: 'Fees behind',
  payLineLate: 'Late fee',
  payLineFine: 'Fine',
  payLineLevy: 'Parkade levy',
  balanceLoading: "Loading balance…",
  balanceUnavailable: "Live balance unavailable",
  language: 'English', chooseLanguage: 'Choose language', workspace: 'Workspace', overview: 'Overview', buildings: 'Buildings', governance: 'Governance', operations: 'Operations', finances: 'Finances', legal: 'Legal library', insights: 'Insights', runBuilding: 'Run the building', donate: 'Donate', menu: 'Menu', close: 'Close', search: 'Search anything', notifications: 'Notifications', profile: 'Profile', live: 'Live', newStrata: 'New strata', goodMorning: 'Good morning!', subtitle: 'Here is the pulse of your communities.', communities: 'Communities', openActions: 'Open actions', reserveFunds: 'Reserve funds', complianceHealth: 'Compliance health', yourBuildings: 'Your buildings', buildingsSubtitle: 'At a glance, every community you care for.', viewAll: 'View all', quickActions: 'Quick actions', activity: 'Live activity', upcoming: 'Upcoming', seeCalendar: 'See calendar', createStrata: 'Create a strata', planMeeting: 'Plan a meeting', findLegalSource: 'Find a legal source', logRequest: 'Log a request', footerTag: 'The operating system for communities that govern themselves.', product: 'Product', trustLegal: 'Trust & legal', resources: 'Resources', privacy: 'Privacy', security: 'Security', accessibility: 'Accessibility', helpCentre: 'Help centre', contact: 'Contact us', status: 'Status', legalDisclaimer: 'Information is general and not legal advice.', activeWorkspaces: 'Active workspaces', acrossBuildings: 'Across all buildings', yearToDate: 'Year to date', excellent: 'Excellent', communityHealth: 'Community health', allSystemsClear: 'All systems clear', actionsDue: '2 actions due this week', reportDue: 'Depreciation report due', commonWork: 'Common work, made one tap away.', createStrataHint: 'Start a new community workspace', planMeetingHint: 'AGM, council, or special meeting', findLegalSourceHint: 'Official law, forms, and guidance', logRequestHint: 'Repairs, access, or an incident', acrossWorkspace: 'Across your workspace', keepMoving: 'Keep your communities moving.', activityHistory: 'View activity history', builtFor: 'Built for BC. Designed for everywhere.', formationWorkspace: 'FORMATION WORKSPACE', startNewStrata: 'Start a new strata', formationDescription: 'We’ll guide you through the documents, professionals, approvals, and operating setup required for your jurisdiction.', communityName: 'Community name', jurisdiction: 'Jurisdiction', cancel: 'Cancel', createWorkspace: 'Create workspace', legalReview: 'OpenStrata provides workflow support and general information. Legal and professional review is required.', units: 'units', health: 'health', noBuildings: 'No buildings match', productLinks: 'Product', trustLegalLinks: 'Trust & legal', resourceLinks: 'Resources', roadmap: 'Roadmap', bcSources: 'BC sources', templates: 'Templates', builtEverywhere: 'Built for BC. Designed for everywhere.', generalInfo: 'Information is general and not legal advice.', wizardTitle: 'Building Template Wizard', wizardIntro: 'Configure a new strata corporation in 8 steps. Every setting is jurisdiction-aware and BCFSA-compliant by default. Generate a portable building JSON config.', onboardingPhase: 'Phase 2 — Onboarding', generatedTitle: 'Building Template Generated', generatedDescription: 'Your strata configuration is ready. This JSON can be imported into any OpenStrata instance.', startNew: 'Start New', configJson: 'Building Config JSON', pickJurisdiction: 'Pick Jurisdiction', jurisdictionDescription: 'Your strata’s legal framework. BC is fully supported; others coming soon.', entityAddress: 'Entity & Address', entityDescription: 'Legal name, location, and governance model.', corporationName: 'Strata Corporation Name', buildingAddress: 'Building Address', fiscalYearStart: 'Fiscal Year Start', selfManaged: 'Self-Managed', selfManagedHint: 'SPA-permitted self-management', configureUnits: 'Configure Units', unitsDescription: 'Set unit count, square footage, and toggle features.', numberOfUnits: 'Number of Units', averageSqFt: 'Avg Sq Ft', addUnit: 'Add Unit', parking: 'Parking', storage: 'Storage', evReady: 'EV Ready', configured: 'configured', configureFunds: 'Configure Funds', fundsDescription: 'Trust accounts per SPA s.92–96. Operating and CRF are mandatory.', operatingFundBank: 'Operating Fund Bank', crfTrustBank: 'CRF Trust Bank', crfAllocation: 'CRF Allocation', optional: 'optional', toggleServices: 'Toggle Services', servicesDescription: 'Select the services your strata manages.', paymentRails: 'Payment Rails', paymentDescription: 'Fiat primary. Bitcoin additive. Never custody.', fiatPrimary: 'Fiat primary', sovereignPay: 'Sovereign Instant Pay Enabled', bylaws: 'Bylaws', bylawsDescription: 'Use the BC Standard Bylaws pack or import your existing document.', standardBylaws: 'BC Standard Bylaws', importBylaws: 'Import Existing Bylaws', reviewGenerate: 'Review & Generate', reviewDescription: 'Verify everything looks correct.', continue: 'Continue', back: 'Back', generateConfig: 'Generate Building Config JSON', complianceConfig: 'BCFSA-Aware Configuration', knowledgeBase: 'KNOWLEDGE BASE — RETAIN & DO NOT FORGET', complianceReference: 'BC Strata Compliance Reference', complianceIntro: 'End-to-end breakdown of BC strata operations under the Strata Property Act (SPA) and BCFSA licensing. Architecture blueprints, workflow triggers, governance logic, and Canada-to-US localization.', disputes: 'Disputes', agentModel: 'Agent model', fivePillars: 'Five Pillars', bylawFlow: 'Bylaw Flow', formsBf: 'Forms B & F', quorumVoting: 'Quorum & Voting', recordRetention: 'Record Retention', bcUsMap: 'BC → US Map', buildMandates: 'Build Mandates', functionalDomains: 'Five Functional Domains', functionalDomainsHint: 'Every OpenStrata module must cover one of these pillars. Click to expand.', trustFunds: 'Trust Funds (isolated)', appFeatures: 'App Features', moduleDomainMap: 'OpenStrata Module → Domain Map', bylawEnforcementFlow: 'Bylaw Enforcement Flow', conveyancingForms: 'Real Estate Conveyancing — Forms B & F', governanceVoting: 'Governance — Quorum & Voting', recordRetentionTitle: 'SPA s.35 Record Retention', localizationEngine: 'Localization Engine — BC → US', architectureMandates: 'Architecture Mandates', documentationHub: 'Documentation Hub', bcFirstMvp: 'BC-first MVP.', strataToolModules: 'Strata Tool modules.', allDocsIn: 'All docs in', complianceKb: 'Compliance KB', strataTool: 'Strata Tool', documentIndex: 'Document Index', viewOnSite: 'View on site', architecture: 'Architecture', installSop: 'Install SOP', jurisdictionsCurrencies: 'Jurisdictions & Currencies', liveStatus: 'Live', soonStatus: 'Soon', spaLicense: 'BCFSA License #', crfMinimum: 'SPA minimum 10%', maxLabel: 'Max: 25%', subAccounts: 'Sub-Accounts', active: 'Active', clickToEnable: 'Click to enable', defaultLabel: 'Default', sovereignPayDescription: 'LNURL QR codes with 15-min CAD rate lock. Satohash stamp on every receipt.', standardBylawsPack: 'BC Standard Bylaws', standardBylawsDescription: 'Pre-loaded standard pack. CRT-tested. SPA-compliant.', importExistingBylaws: 'Import Existing Bylaws', importBylawsDescription: 'Upload existing registered bylaws. OpenStrata maps them to the compliance engine.', uploadPhase3: 'PDF / DOCX upload (Phase 3)', entitySummary: 'Entity', noAddress: 'No address set', brokerageManaged: 'Brokerage-Managed', parkingSummary: 'parking', evSummary: 'EV ready', fundsSummary: 'Funds', servicesSummary: 'Services', paymentSummary: 'Payment Rails', importedBylawsPending: 'Imported Bylaws (pending upload)', trustIsolationSummary: 'Trust fund isolation · SPA s.35 retention · CRT-proof bylaw workflow · Forms B/F ready', formsReady: 'Forms B/F ready', aboutHeroTitle: 'Trusted Money.', aboutHeroAccent: 'Proven Operations.', aboutHeroDescription: 'OpenStrata is BCFSA-aware software that does everything a management company does — cheaper, faster, with fewer errors. Fiat rails today. Bitcoin sovereignty when you’re ready. Every payment provable on Bitcoin via Satohash.', costOfStrata: 'The Cost of How Strata Pays Today', feeFlow: 'in fee flow', annualProcessingCost: 'Annual Payment Processing Cost', cardCostWarning: 'Credit cards alone cost $9,000+/year per building. That’s CRF money going to Visa, not your roof.', managerTimeSavings: 'Manager Time Savings', task: 'Task', traditional: 'Traditional', openStrataLabel: 'OpenStrata', saving: 'Saving', smartWithinLaw: 'Smart Within the Law', softwareNotManagement: 'OpenStrata is software — not an unlicensed management company.', threePaths: 'Three compliant paths:', layersTrust: 'Three Layers of Trust', runBuildingProof: 'OpenStrata runs your building. Satohash proves it happened. The protocol lets you take your history with you.', btcWarChest: 'BTC War Chest', byNumbers: 'By the Numbers', readySmarter: 'Ready to run smarter?', exploreStrataTool: 'Explore Strata Tool', seeRoadmap: 'See Roadmap', pitchProblem: 'The Problem', pitchSolution: 'The Solution', sovereigntyStack: 'Three-Layer Sovereignty Stack', pitchSolutionDescription: 'We sell software — not unlicensed management services. OpenStrata powers operations; Satohash proves every action; OpenStrata keeps data portable.', liveOperations: 'Live Operations', treasuryEdge: 'Treasury & Competitive Edge', monthlyIncomeExpenses: 'Monthly Income vs Expenses', incomeExpensesLegend: 'Teal = income · Orange = expenses', simulatedLedger: 'Simulated live ledger', goToMarket: 'Go-To-Market', pricingTiers: 'Pricing Tiers', whatsNext: 'What’s Next', buildSovereign: 'Let’s Build Sovereign Strata Operations', pitchCtaDescription: 'Partner with Give A Bit. Fiat rails today. Bitcoin proof when you’re ready.', tryWizard: 'Try Building Wizard', educationalDisclaimer: 'Safe Harbour: Educational purposes only. Consult qualified professionals for legal and financial decisions.', revenueModel: 'Revenue Model', toolsTitle: 'OpenStrata Tool', toolsIntro: 'modules covering everything a BCFSA-licensed management company does — cheaper, faster, fewer errors. BCFSA trust rules built-in.', fullManagementScope: 'Full Management Company Scope', liveLabel: 'Live', betaLabel: 'Beta', plannedLabel: 'Planned', bcfsaLabel: 'BCFSA', sovereignMode: 'Sovereign Mode', sovereignModeHint: 'multisig / JSON / advanced rails', allLabel: 'All', liveInteractiveDemos: 'Live Interactive Demos', formKHub: 'Form K Hub', bylawEnforcement: 'Bylaw Enforcement', formsBfHub: 'Forms B & F', unitLabel: 'Unit', sovereignStackActive: 'Sovereign Stack Active', externalMultisig: 'External multisig (3-of-5 PSBT) · Lightning LNURL · Satohash OTS · Nostr npub per unit', orchestrationNote: 'OpenStrata orchestrates. Never custodies. Keys on council hardware wallets.', roadmapTitle: 'Roadmap & Paths', roadmapIntro: 'Three go-to-market paths. Six development phases. Config-driven jurisdiction expansion.', modulesLive: 'modules live', inBeta: 'in beta', bcfsaRelevant: 'BCFSA-relevant', gtmPaths: 'Go-To-Market Paths', developmentTimeline: 'Development Timeline', jurisdictionExpansion: 'Jurisdiction Expansion', ecosystemIntegrations: 'Ecosystem Integrations', currentStatus: 'Current', phaseStatus: 'Status', rssTitle: 'RSS, Social & API Hub', feedInfrastructure: 'GROWABLE FEED INFRASTRUCTURE', rssIntro: 'Aggregate BC housing regulations, CRT decisions, rental market data, Bitcoin protocol news, and Twitter/X lists. Expose everything through a clean REST API for your strata stack.', feedSources: 'Feed Sources', latestItems: 'Latest Items', addCustomFeed: 'Add Custom Feed', customFeedHint: 'RSS URLs, Twitter/X lists, Nostr relays — plug in via config.yaml', apiTitle: 'OpenStrata REST API', apiIntro: 'Local-first API on your M4 Docker stack · Tailscale-secured', restEndpoints: 'REST Endpoints', webhooks: 'Webhooks', feedsMarket: 'Feeds & Market', quickStart: 'Quick Start', specTitle: 'OpenStrata Specification', specIntro: 'An open standard for sovereign data portability across Bitcoin, Lightning, and Nostr — extended for strata corporation governance, treasury, and compliance.', protocolLayers: 'Protocol Layers', corePrimitives: 'Core Primitives', howItWorks: 'How It Works', fullWireProtocol: 'Full Wire Protocol — Coming Soon', fullWireProtocolDescription: 'Identity layers, data formats, verification rules, and wire protocols. Watch the repo for updates.', watchOnGithub: 'Watch on GitHub', legalLibrary: 'Legal Library', sourceLibrary: 'SOURCE LIBRARY', legalLibraryIntro: 'A curated index of primary legislation, official guidance, and tribunal information used to build OpenStrata workflows.', legalLibraryNoticeTitle: 'Use original sources', legalLibraryNotice: 'OpenStrata provides workflow support and general information, not legal advice. Always verify the current official text, effective date, and jurisdiction before acting. Ask a qualified professional to review decisions and documents.', primarySources: 'Primary and official sources', primarySourcesHint: 'Open the original publisher directly. Links are preserved for auditability.', sourceLinks: 'source links', openOriginalSource: 'Open original source', jurisdictionCoverage: 'Jurisdiction coverage', jurisdictionCoverageHint: 'BC is the active source pack. Other jurisdiction packs are not active until reviewed and published.', blogTitle: 'Blog & Announcements', blogIntro: 'Deep dives, ecosystem updates, and strata sovereignty news from Give A Bit', readMore: 'Read more', subscribeRss: 'Subscribe via RSS', subscribeRssHint: 'Get all posts in your favourite reader', viewRssApi: 'View RSS feeds & API', templatesTitle: 'Templates & Workflows', templatesIntro: 'Practical starting points for strata operations, governance, finance, and conveyancing workflows.', templateNoticeTitle: 'Templates require professional review', templateNotice: 'These are workflow templates and general information. They are not prescribed legal forms and do not replace advice from a qualified lawyer, licensed strata manager, accountant, engineer, or insurer.', templateLibrary: 'Template library', templateLibraryHint: 'Choose a starting point, then adapt it to your jurisdiction, bylaws, records, and professional advice.', useTemplate: 'Use template', sourceAndReview: 'Source and review notes', formBTemplate: 'Form B request and review checklist', formFTemplate: 'Form F payment certificate workflow', complaintNoticeTemplate: 'Bylaw complaint and notice workflow', meetingAgendaTemplate: 'Council or general meeting agenda', meetingMinutesTemplate: 'Meeting minutes and resolution record', budgetTemplate: 'Operating and contingency reserve budget', templateCategoryLegal: 'Legal and conveyancing', templateCategoryGovernance: 'Governance', templateCategoryFinance: 'Finance', reviewRequired: 'Professional review required', wizardPageTitle: 'Building Template Wizard — OpenStrata', copyConfig: 'Copy', bcLicenseLabel: 'BCFSA License #', unnamedStrata: 'Unnamed Strata Corporation', unitsSummary: 'Units', statutoryOrderHint: 'Precise statutory order — skipping steps risks CRT overturn. Backend must enforce locks.', formBDescription: 'Track the request, required records, arrears, pending disputes, reserve information, and delivery deadline for a Form B workflow.', formFDescription: 'Check the unit ledger, record balances, flag withheld status, and document release after payment is confirmed.', complaintNoticeDescription: 'Capture a written complaint, evidence, notice, response window, hearing, council decision, and minutes reference.', meetingAgendaDescription: 'Prepare attendance, quorum, declarations, agenda items, resolutions, voting method, and next steps.', meetingMinutesDescription: 'Record attendees, quorum, motions, votes, abstentions, decisions, conflicts, and assigned actions.', budgetDescription: 'Separate operating, contingency reserve, special levy, and accounts-receivable planning with approval history.', formBSource: 'BC Strata Property Act ss.256–258 and current prescribed-form guidance.', formFSource: 'BC Strata Property Act ss.256–258 and current prescribed-form guidance.', complaintNoticeSource: 'BC Standard Bylaws and applicable Strata Property Act provisions.', meetingAgendaSource: 'Applicable bylaws, Strata Property Act, and meeting rules for the selected jurisdiction.', meetingMinutesSource: 'Strata records requirements and the corporation’s bylaws.', budgetSource: 'Strata Property Act fund and budget requirements for the selected jurisdiction.', vsLabel: 'vs', compliancePageTitle: 'BC Strata Compliance — OpenStrata Knowledge Base', complianceMetaDescription: 'SPA + BCFSA compliance reference: trust accounting, bylaw enforcement workflows, quorum rules, Forms B/F, CRT export, and Canada-to-US localization mapping.', agentRoleCallout: 'OpenStrata modules below map to statutory requirements — Rosa cites sources; Ziggy enforces fund isolation and CRF caps.', questionsLabel: 'Questions', minimumAllocation: 'minimum allocation', moduleHeader: 'Module', domainHeader: 'Domain', workflowTriggerHeader: 'Workflow Trigger', crtRiskLabel: 'CRT risk', standardFineCap: 'Standard Fine Cap', perStandardBylawInfraction: 'Per standard bylaw infraction', shortTermRentalCap: 'Short-Term Rental Cap', strViolationsBc: 'Airbnb / STR violations in BC', conveyancingIntro: 'When an owner sells, their lawyer requests documents. Balance due blocks the sale.', saleBlocking: 'SALE BLOCKING', meetingsIntro: 'Hardcoded thresholds. Abstentions excluded from all calculations.', quorumRulesTitle: 'Quorum Rules', requirementLabel: 'Requirement', formulaLabel: 'Formula', minuteRuleLabel: '30-Minute Rule', votingThresholdMatrix: 'Voting Threshold Matrix', typeHeader: 'Type', thresholdHeader: 'Threshold', denominatorHeader: 'Denominator', usedForHeader: 'Used For', tieBreakerTitle: 'Tie-Breaker', exceptionLabel: 'Exception', sourceLabel: 'Source', retentionIntro: 'Archive module must enforce these timelines. Rosa flags premature deletion.', localizationIntro: 'Decouple core code from regional terminology day one. Database uses neutral keys; UI maps via config.', bcConceptHeader: '🇨🇦 BC Concept', usEquivalentHeader: '🇺🇸 US Equivalent', databaseElementHeader: 'Database Element', architectureIntro: 'Non-negotiable design requirements from compliance review.', kbSourceNote: 'This knowledge base is the source of truth for OpenStrata architecture. Also stored in', openStrataToolsCta: 'Open Strata Tools', hermesFrameworkDocsCta: 'OpenStrata Framework Docs', toolsPageTitle: 'Strata Tool — OpenStrata | 30+ Modules', moreAboutLabel: 'More about', whyItMattersLabel: 'Why it matters', docsPageTitle: 'Docs — OpenStrata', alsoLabel: 'Also', atProjectRoot: 'at project root.', archMobilePwa: 'Mobile PWA / Desktop Console', archTailscaleGateway: '↓ Tailscale Secure Gateway', archHermesCore: 'OpenStrata Core — Rosa (Compliance RAG) · Ziggy (Treasury)', archFiatRail: 'Fiat Rail', archCadCrf: 'CAD + 10% CRF', archBitcoinRail: 'Bitcoin Rail', archPsbtLightning: '3-of-5 PSBT + Lightning', pitchPageTitle: 'Pitch — OpenStrata | Investor Deck', pitchMetaDescription: 'Live investor pitch for OpenStrata — BCFSA-aware strata operations with real cost savings, charts, and roadmap.', liveDataBadge: 'data · synced', pitchProblemHeading: 'BC Strata Management Is Regulated, Labour-Intensive, and Expensive', feeFlowScenario: 'Fee Flow Scenario', perMonth: '/mo', perYear: '/year', rentalIndexLine: 'Metro Vancouver rental index (live trend):', avg1brLabel: 'Avg 1BR', vacancyLabel: 'Vacancy', unitBuildingSuffix: '-unit building', openStrataSaves: 'OpenStrata saves', savesSuffix: '/yr vs credit cards alone', managerHoursTitle: 'Manager Hours per Cycle', legendGrayTeal: 'Grey = traditional · Teal = OpenStrata', hrsTraditional: 'hrs traditional', hrsWithHermes: 'hrs with OpenStrata', crfBalanceLabel: 'CRF Balance', warChestLabel: 'War Chest', requiresLicensedBrokerages: 'requires licensed brokerages for management services.', pitchSoftwareNotManagement: 'OpenStrata is software — not an unlicensed management company.', githubLabel: 'GitHub', pitchDataNote: 'Data synced from marketing.ts — update numbers once, pitch stays current.', homePageTitle: 'Community operations, beautifully organized', homeMetaDescription: 'OpenStrata is the modern operating system for strata and condominium communities.', primaryNavigation: 'Primary navigation', mobileNavigation: 'Mobile navigation', communityOverview: 'Community overview', closeNavigation: 'Close navigation', openNavigation: 'Open navigation', openProfileMenu: 'Open profile menu', openSettings: 'Open settings', moreOptionsFor: 'More options for', closeDialog: 'Close dialog', needAHand: 'Need a hand?', visitResourceCentre: 'Visit the resource centre', allSystemsOperational: 'All systems operational', activityFilters: 'Activity filters', activityFiltersToast: 'Activity filters opened', calendarOptions: 'Calendar options', calendarOptionsToast: 'Calendar options opened', thisMonth: 'this month', urgent: 'urgent', caughtUpToast: 'You are all caught up', workspaceSelected: 'workspace selected', workspaceOpened: 'workspace opened', buildingActionsToast: 'Building actions opened', meetingPlannerToast: 'Meeting planner opened', legalLibraryToast: 'Legal library opened', maintenanceToast: 'Maintenance request started', activityHistoryToast: 'Activity history opened', calendarOpenedToast: 'Calendar opened', formationCreatedToast: 'Formation workspace created', aboutPageTitle: 'About — OpenStrata | Trusted Money for BC Strata', warChestIntro: 'Council votes to allocate', warChestMiddle: 'of annual budget into a multisig treasury hedge. Keys stay on council hardware wallets. OpenStrata watches — never custodies. Disclosed on Form B.', purposeLabel: 'Purpose', blogPageTitle: 'Blog — OpenStrata', templatesMetaDescription: 'OpenStrata strata governance, finance, conveyancing, and workflow templates.', legalMetaDescription: 'Primary legal and official guidance sources for OpenStrata jurisdictions.', roadmapPageTitle: 'Roadmap & Paths — OpenStrata', liveBadge: 'LIVE', phaseLabel: 'Phase', rssPageTitle: 'RSS Feeds & API — OpenStrata', specPageTitle: 'OpenStrata Spec — Sovereign Data Portability', faqTitle: 'Frequently Asked Questions', faqIntro: 'Plain-language answers to the most common BC strata questions, drawn from the compliance knowledge base.', rssFeedLabel: 'RSS feed', navUnits: 'Units', navAccounting: 'Accounting', navPay: 'Pay', payFees: 'Pay fees', navTaxCra: 'Tax & CRA', navCalendar: 'Calendar', navMeetings: 'Meetings', subscribeViaRss: 'Subscribe via RSS', footerCookieNotice: 'No cookies. We use self-hosted, cookie-less analytics. Nothing to consent to.', openLotList: 'Open the lot list', communityNamePlaceholder: 'e.g. Seaside Gardens', corpNamePlaceholder: 'e.g. The Towers Strata Corporation', addressPlaceholder: 'e.g. 1234 Maple Street, Vancouver BC', bcfsaLicensePlaceholder: 'e.g. BCFSA-STR-2026-XXXX', crfLabel: 'CRF', subAccountsCount: 'sub-accounts', notFoundTitle: 'Page not found', notFoundSubtitle: 'The page you are looking for does not exist or has moved.', errorTitle: 'Something went wrong', errorSubtitle: 'An unexpected error occurred. Please try again in a moment.', backHome: 'Back to home', goBack: 'Go back', toggleTheme: 'Toggle dark mode', searchHint: 'Search across pages, lots, ledger entries, tax sections, print-ready documents, the manual, posts, FAQ, templates, legal sources, primary and official sources, the Strata Tool, and what needs doing.', searchRecents: 'Recent searches', searchShare: 'Share results for', searchNoResults: 'No results for', searchPages: 'Pages', searchPosts: 'Posts', searchFaq: 'FAQ', searchTemplates: 'Templates', searchLegal: 'Legal', satohashHealth: 'Satohash API health', satohashOnline: 'Online', satohashOffline: 'Offline', satohashStampTitle: 'Stamp a hash on Bitcoin', satohashVerifyTitle: 'Verify a stamp', satohashHashPlaceholder: 'SHA-256 hash (64 hex characters)', satohashStampAction: 'Stamp', satohashVerifyAction: 'Verify', satohashStampDone: 'Stamped — receipt anchored to Bitcoin', satohashHashInvalid: 'Enter a valid 64-character SHA-256 hash', saveBuilding: 'Save building', savedBuildings: 'My buildings', loadBuilding: 'Load', downloadConfig: 'Download JSON', buildingSavedToast: 'Building saved to My buildings', nameRequired: 'Community name is required', printDeck: 'Print deck', notificationsEmpty: 'No notifications yet', etransferTitle: 'E-Transfer Reconciliation', etransferIntro: 'Auto-match inbound e-transfers to unit accounts by reference code. Reviewable — nothing posts without sign-off.', etransferMatchBrief: 'Match by message', etransferMatchFull: 'Match by message + payer', etransferInbound: 'Inbound transfers', etransferFootnote: 'Prototype. Matches by reference are flagged for human review before any ledger post — reconciliation never guesses.', reconTotalReceived: 'Received', reconResolved: 'Resolved', reconAuto: 'Auto', reconNeedsReview: 'Needs review', reconAssignTo: 'Assign to', reconAmount: 'Amount', reconManual: 'Manual', reconAmbiguous: 'Ambiguous', reconUnmatched: 'Unmatched', reconSelectUnit: 'Select unit', signIn: 'Sign in', signOut: 'Sign out', createAccount: 'Create account', email: 'Email', password: 'Password', yourName: 'Your name', authSignInTitle: 'Sign in to your workspace', authCreateTitle: 'Start your community workspace', authError: 'Unable to sign in. Check your details and try again.', demo: 'Demo', authIntro: 'Sign in to your council workspace, or start a new community — data comes live from your OpenStrata host.', authUnavailable: 'Backend unreachable — showing demo data.', authNote: 'Open signup for now. Invite-only accounts arrive before public launch.', operatingFund: 'Operating fund', meetingsQuorumTool: 'Quorum + voting, per SPA s.48. Live when signed in.', quorumCouncil: 'Council meeting', councilSize: 'Council size', eligibleVoters: 'Eligible voters', presentVoters: 'Present / by proxy', quorumMet: 'Quorum met ✓', quorumNotMet: 'Quorum not met', requiredLabel: 'Required', presentLabel: 'Present', shortfallLabel: 'Shortfall', yesLabel: 'Yes', noLabel: 'No', abstainLabel: 'Abstain', countQuorum: 'Check quorum', countVote: 'Count vote', resolutionPassed: 'Resolution passed ✓', resolutionFailed: 'Resolution failed', denominatorLabel: 'Denominator', specialLevyLabel: 'Special levy', chainVerified: 'Balances chain-verified against the tamper-evident ledger.', totalLabel: 'Total trust funds', reconImportCsv: 'Import CSV', xpubTitle: 'Watch-only xpub (external multisig)', xpubIntro: 'Register your council’s public extended key — keys never leave the hardware wallets; receive paths derive deterministically per unit.', xpubRegistered: 'Registered', xpubRegister: 'Register', xpubPerUnit: 'Per-unit receive paths', xpubInvalid: 'Invalid xpub — expected a public prefix (xpub/ypub/zpub/tpub/vpub).', xpubDemo: 'Demo: sign in to register your council xpub. Expected format: xpub… / zpub… (public prefixes only).', evidenceTitle: 'Evidence & portable export', evidenceIntro: 'Print-ready CRT evidence bundle, Form B/F certificates, and the portable OpenStrata export — all from the live ledger.', crtExport: 'CRT evidence', formBPrint: 'Form B (print)', formFPrint: 'Form F (print)', portableExport: 'Portable JSON', evidenceDemo: 'Sign in to generate live evidence exports from the hash-chained ledger.', unitDetail: 'Unit detail', arBalance: 'AR balance', unitPayments: 'Payments', removeUnit: 'Remove', emptySearchTitle: 'No matches', emptySearchHint: 'Try another name or location — or start a new community.', unitPaymentsEmpty: 'No payments recorded for this unit yet.', onThisPage: 'On this page', goodAfternoon: 'Good afternoon', goodEvening: 'Good evening', tourIntro: 'Welcome to OpenStrata', tourIntroText: 'The operating system for communities that govern themselves.',  tourSignIn: 'Sign in for live data', tourSignInText: 'Your council workspace pulls balances and records straight from your OpenStrata host.', tourCreate: 'Start a new strata', tourCreateText: 'Form a community workspace in minutes — units, funds, rails, bylaws.', tourLive: 'Watch the ledger', tourLiveText: 'Every balance is chain-verified. Bitcoin rails when you’re ready.', tourSkip: 'Skip tour', tourNext: 'Next', tourDone: 'Done', lastSynced: 'Last synced', refresh: 'Refresh', tourVideoTitle: 'See OpenStrata in one minute', tourVideoSub: 'A quick walkthrough of how a strata runs on OpenStrata — ledger, rails, and compliance in one place.', tourVideoCta: 'Watch the intro', tourVideoFallback: 'The video could not load — refresh, or watch it in the tools.', confirmRemoveUnit: 'Remove this unit?', confirmRemoveUnitMessage: 'The unit and its payment history will be removed from this workspace.', confirmSignOut: 'Sign out?', confirmSignOutMessage: 'You’ll need your credentials to get back in.', checkoutTitle: 'Pay fees', checkoutHint: 'Quote a fee payment on any rail, then confirm.', checkoutAmount: 'Amount (CAD)', checkoutRail: 'Payment rail', checkoutGetQuote: 'Get quote', checkoutConfirm: 'Confirm payment', checkoutPaid: 'Payment confirmed', checkoutQuoteHint: 'The quote locks the rate and reference code.', receiptTxid: 'Transaction', receiptSats: 'Sats locked', receiptRate: 'Rate locked', receiptStamp: 'Satohash proof', receiptCopy: 'Copy invoice', monthlyCloseTitle: 'Run the month', monthlyCloseHint: 'Billing → late notices → reconcile, one guided close.', monthlyClosePeriod: 'Period', monthlyCloseRun: 'Run billing cycle', monthlyCloseCharged: 'Total charged', monthlyCloseNotices: 'Late notices', monthlyCloseNone: 'No late notices this cycle', monthlyCloseDone: 'Cycle posted to the ledger', bylawCaseTitle: 'Bylaw enforcement case', bylawCaseHint: 'Complaint → notice → review lock → decision.', bylawCaseNew: 'New complaint', bylawCaseEvidence: 'Evidence attached', bylawCaseSubmit: 'File complaint', bylawCaseNotice: 'Issue notice', bylawCaseLock: 'Review window — fine actions locked', bylawCaseUnlocked: 'Review window passed — decision allowed', bylawCaseFine: 'Impose fine', bylawCaseNoFine: 'No fine', bylawCaseMinutes: 'Council minutes ref', bylawCaseState: 'Case status', membersTitle: 'Member workspace', membersHint: 'Owners per lot — trace unit → payments → forms.', membersAdd: 'Add member', membersEmail: 'Email', membersRole: 'Role', membersEmpty: 'No members yet — add the first owner.', deadlinesTitle: 'What’s due', deadlinesHint: 'Statutory calendar + open quotes for this council.', deadlinesOverdue: 'Overdue', deadlinesDays: 'days', deadlinesEmpty: 'Nothing due right now.', railsTitle: 'Sovereign rails', railsHint: 'Enabled rails, node status, and the live CAD/BTC rate.', railsAsOf: 'as of', railsNode: 'Node', railsNotConnected: 'Host pending — rails configured, not connected.', signingTitle: 'Multisig signing room', signingHint: 'Pending PSBTs, signature progress, broadcast when ready.', signingRequired: 'required', signingBroadcast: 'Broadcast', signingEmpty: 'No pending transactions.', signingReady: 'Ready to broadcast', signingScan: 'Scan with hardware wallet', walletTitle: 'Wallet & addresses', walletHint: 'Registered xpub + per-unit receive addresses.', walletAddresses: 'Receive addresses', walletCopy: 'Copy', walletCopied: 'Copied', walletExplorer: 'View on mempool.space', walletNone: 'Register an xpub to derive receive addresses.', ledgerTitle: 'Ledger explorer', ledgerHint: 'Browse the verified hash chain per fund.', ledgerVerify: 'Verify chain', ledgerVerified: 'Chain verified ✓', ledgerCsv: 'Export CSV', ledgerEmpty: 'No entries in this fund yet.', exportTitle: 'Export center', exportHint: 'Portable JSON, CRT bundle, certificates, ledger CSV.', managerTitle: 'Members & roles', managerHint: 'Invite accounts, assign roles, hand off temp passwords.', managerInvite: 'Invite', managerTempPassword: 'Temporary password', managerEmpty: 'Only you so far — invite your council.', rateTitle: 'Live CAD/BTC', rateUpdated: 'updated', eduCrf: 'What is the CRF?', eduCrfText: 'The Contingency Reserve Fund — at least 10% of annual contributions, held separately for major repairs.', eduMultisig: 'What is multisig?', eduMultisigText: 'A wallet that needs multiple signatures to spend — e.g. 3 of 5 council members.', eduLnurl: 'What is LNURL?', eduLnurlText: 'A Lightning payment standard — scan a QR, the rate locks for 15 minutes.', eduOts: 'What is OTS?', eduOtsText: 'OpenTimestamps — anchors a hash to Bitcoin so you can prove when a record existed.', eduDca: 'CRF % at risk', eduDcaText: 'The share of the reserve fund the DCA plan would move to the BTC war chest.', designTitle: 'Design system', designIntro: 'Tokens, type, and components — the OpenStrata design language.', themeBrokerage: 'Brokerage theme', themeBrand: 'Brand accent', rosaTitle: 'Rosa — compliance assistant', rosaIntro: 'Ask BC strata law questions; Rosa answers with citations only.', rosaPlaceholder: 'Ask Rosa… e.g. “What are the rules for short-term rentals?”', rosaSend: 'Ask', rosaUncertain: 'Rosa flagged this as date/fact-dependent — verify before acting.', rosaNoMatch: 'No controlling source found — Rosa will not guess. Rephrase or ask a licensed professional.', rosaDemo: 'Demo answers draw on the built-in BC compliance knowledge base. Sign in for the live corpus.', demoLabel: 'Demo', wizardRegister: 'Register this building', wizardRegistered: 'Building registered to your workspace', scanToPay: 'Scan to pay', openInWallet: 'Open in wallet', formsTrackerTitle: 'Forms & 7-day tracker', formsTrackerHint: 'Issue Form B/F certificates with the statutory delivery countdown.', formsRequestDate: 'Request date', formsDeliverBy: 'Deliver by', formsDaysLeft: 'days left', formsIssueB: 'Issue Form B', formsIssueF: 'Issue Form F', myUnitTitle: 'My unit', myUnitHint: 'Your lot, its ledger, and your payments — at a glance.', myUnitNoMatch: 'No member record for your account yet.', ballotTitle: 'Ballot voting engine', ballotHint: 'Roll-call resolution with per-unit entitlements.', ballotResolution: 'Resolution text', ballotCast: 'Cast ballot', ballotTie: 'Tie — the chair casts the deciding vote', ballotExport: 'Export minutes', noticeTitle: 'Meeting notice', noticeHint: 'Statutory notice windows — AGM 14 days, council 7 days.', noticeType: 'Meeting type', noticeWhen: 'Date & time', noticeWhere: 'Place', noticePrint: 'Print notice', caseFileTitle: 'Bylaw case file', caseFileHint: 'CRT-ready evidence bundle for this case.', caseFilePrint: 'Print case file', minutesTitle: 'Meeting minutes', healthBasedOn: 'Based on deadlines, Form K gaps, and AR', balancesTitle: 'On-chain balances', balancesHint: 'Per-address sats from the public mempool.space API.', balancesReceived: 'received', balancesConfirmed: 'confirmed', dcaTitle: 'War chest DCA planner', dcaHint: 'Allocate a % of the reserve fund into the BTC war chest.', dcaAllocation: 'Allocation', dcaFrequency: 'Frequency', dcaProjected: 'Projected per period', dcaDisclosure: 'Form B disclosure', readinessTitle: 'Rails readiness', readinessHint: 'What it takes to connect each sovereign daemon.', readinessEnv: 'Env', readinessGuide: 'Deploy guide', readinessConnected: 'connected', readinessConfigured: 'configured', readinessPending: 'pending host', chainViz: 'Chain', offlineTitle: 'You’re offline', offlineText: 'The cached app is still here — reconnect to sync.', installApp: 'Install app', connectTitle: 'Connect your host', connectHint: 'Point the site at your OpenStrata backend to flip from demo to live.', connectSteps: 'Set PUBLIC_API_BASE_URL at build time, or openstrata-api-base in this browser, then sign in.', connectDemo: 'Demo mode — curated sample data shown.', authWelcomeBack: 'Welcome back', authCreateHeading: 'Start your workspace', authStepBuilding: 'Your building', authStepAccount: 'Your account', authContinue: 'Continue', authBack: 'Back', authEmailInvalid: 'Enter a valid email address', authPasswordHint: 'At least 8 characters', authStrengthWeak: 'Weak', authStrengthOk: 'Okay', authStrengthStrong: 'Strong', authShowPassword: 'Show password', authHidePassword: 'Hide password', authDemoBrowse: 'Just exploring? Browse the live demo', authSecureNote: 'No card required · your host, your keys', authTrustChain: 'Chain-verified ledger', authTrustChainText: 'Every balance is tamper-evident against the hash chain.', authTrustRails: 'Sovereign rails', authTrustRailsText: 'Fiat, on-chain and Lightning — keys stay with your council.', authTrustCompliance: 'BC compliance', authTrustComplianceText: 'Rosa answers with citations; statutory deadlines are tracked.', authSigningIn: 'Signing in…', authCreating: 'Creating workspace…', welcomeBackTitle: 'Welcome back', authWelcomeBackText: 'Your workspace is loading — balances, deadlines, and the ledger are on their way.', authCreatedText: 'Your council workspace is ready — we’re pulling in your building now.', manualTitle: 'User Manual', manualIntro: 'A plain-language walkthrough of OpenStrata: what it is, who it is for, how to set a building up, and what it deliberately does not do.', manualSections: 'Manual sections', manualReadMore: 'Read more', manualWelcomeTitle: 'Welcome to OpenStrata', manualWelcomeIntro: 'OpenStrata is operations software for BC strata corporations and the brokerages that serve them — built so a council can run its own building with real records, real deadlines, and keys it keeps.', manualStartIntro: 'Six steps from a new building to a running one. Nothing is registered or published until you deliberately do it.',   manualStartHere: 'Start here', skipToContent: 'Skip to content', payLot: 'Lot', payAmountDue: 'Amount due', payReference: 'Payment reference', payChooseRail: 'Choose how to pay', paySendTo: 'Send to', payMessage: 'Payment message', payCopyInstructions: 'Copy the instructions', payRateLocked: 'CAD rate locked', payRateExpired: 'Rate lock expired — re-price before sending', payResetLock: 'Reset the demo lock', payOtherWays: 'PAD and cheque', payOtherWaysHint: 'Kept for the owners who already use them.', payNothingDue: 'Nothing to collect on this lot.', payRateLine: 'Locked at {rate} per bitcoin, and it does not move while you read.', payInteracButton: 'Open your bank and pay', payInteracButtonNote: 'Interac e-Transfer — the request carries the amount and the reference for you.', payInteracTitle: 'Pay by Interac e-Transfer', payInteracLiveBadge: 'Live request', payInteracDemoBadge: 'Simulation', payInteracAmount: 'Amount', payInteracReference: 'Reference', payInteracRequestLabel: 'Request', payInteracContactTitle: 'Where should Interac send the request?', payInteracContactHint: 'Your email or mobile number. Interac addresses the request to you — OpenStrata never sees your bank login.', payInteracContactPlaceholder: 'owner@example.com or 604 555 0134', payInteracContactInvalid: 'Enter an email address or a 10-digit mobile number.', payInteracStart: 'Create the request', payInteracStarting: 'Creating the request…', payInteracHandoffTitle: 'Your bank, your approval', payInteracHandoffNote: 'Interac shows the request for {amount} with reference {reference}. You choose your financial institution there and approve it from your own banking app.', payInteracContinue: 'Continue to Interac', payInteracUntrusted: 'The host answered with an address that is not Interac’s, so nothing was opened.', payInteracCancelNote: 'A request you never approve expires on its own. The council sees a request, not a payment, until the deposit lands.', payInteracSimulated: 'Simulation: no Interac merchant credentials on this host. Nothing was sent and no bank was contacted.', payInteracPickBank: 'Which bank do you use?', payInteracPickBankHint: 'This is the choice Interac shows. It stays in this browser — the council never learns your bank.', payInteracSearch: 'Search your bank', payInteracNoBank: 'Not listed? Open your own banking app and approve the request there.', payInteracApprove: 'Approve in my bank', payInteracDecline: 'Decline', payInteracCancel: 'Cancel the request', payInteracRequested: 'Request created — waiting for you to approve it', payInteracWaiting: 'Waiting for your bank’s approval', payInteracApproved: 'Approved — the deposit is on its way', payInteracDeposited: 'Approved and deposited', payInteracDeclined: 'Not completed — your bank did not approve it', payInteracExpired: 'Expired — nothing was sent', payInteracCancelled: 'Cancelled — nothing was sent', payInteracConfirmed: 'Confirmed by the council’s host.', payInteracUnconfirmed: 'Your bank’s answer travelled back in the link. The council confirms it when the deposit lands in the operating account — this page does not call it paid on its own.', payInteracUnknownReturn: 'The link carried a status we do not recognise, so the council reconciles it by hand.', payInteracDone: 'Close', payInteracReturned: 'Returned from your bank — waiting for the council to confirm', payInteracUnreachable: 'Your council’s host could not be reached, so no request was started.',
  payLinkChecking: 'Checking this bill link…',
  payLinkInvalidTitle: 'This bill link cannot be used',
  payLinkInvalidBody: 'The link is not signed for this site, was altered, or has expired. Ask your council for a new one — nothing has been charged, and no request was started.',
  payLinkOffline: 'This site is not connected to a council host yet, so it cannot check a signed bill link. Open the link on your council’s own site.',
  payLinkReason: 'The host said',
  payLinkExpires: 'This link is valid until {date}. After that, ask your council for a new one.',
  payLinkLede: 'This bill was signed by {council} for lot {unit}. The amount, the reference and the receiving address below are the council’s own — nothing on this page is a sample.',
  manualStartTitle: 'Getting Started with OpenStrata',
  manualPrereqs: 'Before you start',
  manualSixSteps: 'The six steps',
  manualCosts: 'What it costs',
  manualCostsIntro: 'Three tiers, published in full — the same numbers the pitch deck uses. Self-host is free; paid tiers are per unit per month.',
  manualTrouble: 'If something looks wrong',
  manualTroubleIntro: 'Quick fixes for the most common demo-vs-live confusion. Most of these are expected, not broken.',
  manualBackToSections: 'Back to all sections',
  manualWhatItDoes: 'What the software actually does',
  manualWhoFor: 'Who it is for',
  manualWhatNot: 'What it deliberately does not do',
  manualNextStep: 'Continue to quick start →',
authLoadingWorkspace: 'Loading your workspace…', demoNoticeTitle: 'Demo — sample data', demoNoticeBody: 'You’re exploring a live demo of OpenStrata. Every community, balance, and action here is sample data — no real council data, and no host is connected yet.', demoNoticeCta: 'Request access', demoNoticeLearn: 'See how it works', devHostLabel: 'Running your own host?', devHostPrompt: 'OpenStrata API base URL for this browser (e.g. https://your-host:8080). Leave empty to go back to demo mode.', tourFactsTitle: 'What you get', tourFact1: '0% custody — funds stay in your accounts', tourFact2: 'BCFSA-aware compliance, built for BC', tourFact3: 'Every action gets a Bitcoin proof trail', tourFact4: 'Your history is portable — take it with you', tourHowTitle: 'Where to start', tourHow1: 'Watch the one-minute intro above', tourHow2: 'Create your community workspace', tourHow3: 'Add units, funds and bylaws — then run the month', journeyTitle: 'Your path to live', journeyStep1: 'Explore the modules', journeyHint1: 'Every workflow runs on demo data — poke at it before you commit.', journeyStep2: 'Configure your building', journeyHint2: 'Units, funds, bylaws — generate your strata config in eight steps.', journeyStep3: 'Register and go live', journeyHint3: 'Stand up your host, then run the real building on real books.', setupTitle: 'Finish setting up', setupIntro: 'Four steps between a new workspace and a building that truly runs.', setupStep1: 'Add your units', setupHint1: 'Every unit — fees, ballots and Form K all key off the unit list.', setupStep2: 'Open the two funds', setupHint2: 'Operating and reserve, kept separate. Trust money may not be co-mingled.', setupStep3: 'Load your bylaws', setupHint3: 'The standard set or your filed set, so enforcement has a basis to stand on.', setupStep4: 'Close your first month', setupHint4: 'Bill fees, reconcile payments, and publish one real month to the ledger.', setupOpen: 'Open', setupHide: 'Hide setup checklist', setupShow: 'Show setup checklist', setupDone: 'Setup complete', setupDoneHint: 'The building is running on real books. This panel stays out of the way.', changelogLink: 'Changelog', changelogBadge: 'Release notes', changelogTitle: 'Changelog', changelogIntro: 'Every release in the open — what changed, and how it was verified before it shipped.', changelogPageTitle: 'Changelog — OpenStrata', changelogMetaDescription: 'Every OpenStrata release, newest first, with what changed and how each one was verified.', changelogLatest: 'Latest', changelogReleasesLabel: 'Releases', changelogChangesLabel: 'Changes', changelogFilterLabel: 'Filter by change type', changelogFilterAll: 'All', changelogFilterHint: 'Filtered view — clear the filter to see every note for each release.', changelogGroupAdded: 'Added', changelogGroupChanged: 'Changed', changelogGroupFixed: 'Fixed', changelogGroupVerified: 'Verified', changelogGroupKnown: 'Known issues', changelogShowAll: 'Show full notes', changelogShowLess: 'Show less', changelogEarlier: 'Earlier releases', changelogEarlierHint: 'These shipped before every release kept a full section. The one-line summary is what was recorded at the time.', changelogNotesUnavailable: 'No written summary was recorded for this release.', changelogSubscribe: 'Follow every release', changelogSubscribeHint: 'Releases land in the RSS feed the moment they ship — no newsletter, no account.', changelogViewRss: 'Open the feed', documentsBadge: 'Print-ready documents', documentsTitle: 'Documents a council can sign', documentsIntro: 'Minutes, meeting notices and the conveyancing certificates, laid out for real paper — letterhead, page breaks and signature lines. Open one, print it, file it.', documentsPageTitle: 'Print-ready documents — OpenStrata', documentsMetaDescription: 'Minutes, meeting notices and Form B and Form F certificates, laid out to print like real documents.', documentsSampleTitle: 'Sample data — a template, not a filed record', documentsSampleNote: 'Every name, date and amount on these pages is sample data from one fictional building. What we are showing is the layout and the wording; replace the contents with your own records before anything is signed or filed.', documentsPick: 'Choose a document', documentsPrint: 'Print this document', documentsPrintAll: 'Print the full set', documentsPrintHint: 'Printing hides the website and prints the sheet: your letterhead at the top, the document, then the signature lines.',  documentsPackage: 'Print the AGM package',
  documentsPackageHint: 'One button, four sheets — each on its own page, in this order.',
  accTabLevy: 'Parkade levy',
  accLevySheetLede: 'The trust on one page: what the meeting assessed, what the lots have paid, what the contract has been paid and what is left to spend — reported without the operating books.',
  accLevySheetPrint: 'Print this statement',
  accLevySheetPrintNote: 'One Letter page. The tabs and this control stay on screen.',
  accLevySheetSubtitle: '{project} · assessed at the special general meeting of {date}',
  accLevySheetTrust: 'The trust',
  accLevyColAssessed: 'Assessed',
  accLevyColPaid: 'Paid by the lot',
  accLevyColPoints: 'Points',
  accLevySheetPlan: 'Agreed plan',
  accLevySheetLots: 'Lots',
  accLevySettled: '{lots} lots have paid their share in full: {amount}.',
  accLevySheetCheck: 'Cash plus what is owed',
  accLevyOnePoint: 'Every lot’s share is its entitlement at {amount} a point, so the assessment is the lots added rather than a figure of its own.',
  accLevySheetBasis: 'The levy is a trust, not a fund: the money belongs to the membrane contract until the work is done. Each lot’s share is its entitlement at the rate above, and the owing figures come from the lot records, so assessed less owing is the cash the lots have actually paid. A holdback is withheld from a payment and these books record none, so the page shows the contract billed rather than a retention it cannot support.',
  accLevySheetFooter: 'Sample levy for Strata Plan {plan}. Not a demand for payment and not a trust statement.',
  formKRegisterSheetFooter: 'Sample register for Strata Plan {plan}. A filing recorded on a lot’s sheet in this browser counts from its own day.',
  accLine4000: 'Strata fees',
  accLine3500: 'CRF contribution',
  accLine7010: 'Parking stall rental',
  accLine7020: 'Move-in and move-out fees',
  accLine7030: 'Bylaw fines',
  accLine7040: 'Interest — operating account',
  accLine7050: 'Fobs and keys',
  accLine7060: 'Late fees',
  accLine6100: 'Insurance',
  accLine6110: 'Hydro — common property',
  accLine6120: 'Natural gas',
  accLine6130: 'Water, sewer, and drainage',
  accLine6140: 'Waste and recycling',
  accLine6200: 'Caretaker contract',
  accLine6210: 'Concierge wages',
  accLine6215: 'Employer CPP, EI, and WorkSafeBC',
  accLine6220: 'Elevator maintenance',
  accLine6230: 'Fire and life safety',
  accLine6240: 'Landscaping and snow',
  accLine6250: 'Janitorial',
  accLine6260: 'Repairs and maintenance',
  accLine6270: 'Plumbing and drains',
  accLine6280: 'Envelope and roof repairs',
  accLine6290: 'Pest control',
  accLine6300: 'Enterphone and fobs',
  accLine6310: 'Legal',
  accLine6320: 'Accountant — compilation, T2, T1044',
  accLine6330: 'Insurance appraisal',
  accLine6340: 'Depreciation-report set-aside',
  accLine6350: 'EPR 2026 consultant',
  accLine6360: 'EV electrical load study',
  accLine6370: 'OpenStrata software',
  accLine6380: 'Administration',
  accLine6390: 'AGM and meetings',
  accLine6400: 'Bank and trust fees',
  accLine6410: 'Gutters, windows, dryer vents',
  accLine6490: 'Operating contingency',
  accReason6210: 'Started 1 September',
  accReason6230: 'Inspection is 8 October',
  accReason6240: 'Snow budget untouched',
  accReason6260: 'Parkade gate motor',
  accReason6320: 'Billed at year end',
  accReason6340: 'Plan only, no cash moved',
  accReason6360: 'Load study finished',
  accReason6410: 'Gutter day in November', documentsPackageContents: 'In this package', documentsPackagePrepared: 'Prepared {date}', custodyLink: 'How your money is held', custodyBadge: '0% custody', custodyPageTitle: 'How your money is held — OpenStrata', custodyMetaDescription: 'Where a community’s money sits at every step, what OpenStrata can never do with it, and what a council can check.', custodyTitle: 'How your money is held', custodyIntro: 'OpenStrata is software. It never holds, moves or has access to a community’s money — not in a bank account, not in a wallet, not in anyone’s pocket. Here is where the money actually sits at each step, and what we cannot do.', custodyFlowTitle: 'Where the money sits', custodyCantTitle: 'What OpenStrata cannot do', custodyCheckTitle: 'What your council can check, any time', custodyTodayTitle: 'Where this stands today', custodyCta: 'Ask us the hard question', custodyCtaNote: 'hello@giveabit.io — happy to answer it in plain language.', checkoutLabelTitle: 'Payment name', checkoutLabelHint: 'Unique to OpenStrata. This exact name goes on the transfer, so it can never be mixed up with another building or another project.', tasksTitle: 'What needs doing', tasksHint: 'One list, in the order that matters — deadlines first, then finishing your setup.', tasksEmpty: 'Nothing is due. The building is up to date.', tasksMore: 'more in the full list', tasksHide: 'Hide this list', tasksShow: 'Show what needs doing', tasksOverdue: 'overdue', tasksSoon: 'soon', tasksRoutine: 'routine', tasksSetup: 'setup', startEyebrow: 'Start here', startTitle: 'What would you like to do?', startIntro: 'Three ways in. The demo view is sample data, and nothing is saved to an account.', startExplore: 'I am just looking', startExploreHint: 'See a full working dashboard — units, funds, the ledger and compliance.', startExploreAction: 'Show me around', startSetup: 'I am setting up a building', startSetupHint: 'Generate a building file, its units, funds and bylaws in about ten minutes.', startSetupAction: 'Start the wizard', startSignIn: 'I have an account', startSignInHint: 'Sign in to your own workspace and its live data.', startSignInAction: 'Sign in', startNote: 'Your choice stays on this device. No account needed to look around.', resumeTitle: 'Continue where you left off', resumeOf: 'of', resumeProgress: 'in progress', resumeAction: 'Continue', resumeDismiss: 'Dismiss and discard the draft', resumedFromDraft: 'Draft restored — you are back where you left off.', searchDocuments: 'Print-ready documents', searchManual: 'Manual', demoBannerTitle: 'You are in demo mode', demoBannerBody: 'Everything here is sample data, and nothing you type is saved to an account. Your building draft is kept on this device only.', demoBannerCta: 'Save my building', demoBannerDismiss: 'Dismiss for a week', searchShortPages: 'Pages', searchShortPosts: 'Posts', searchShortFaq: 'FAQ', searchShortTemplates: 'Templates', searchShortDocuments: 'Documents', searchShortManual: 'Manual', searchShortLegal: 'Legal', searchShortFeeds: 'Sources', searchShortTools: 'Tools', searchShortTasks: 'Tasks', thanksPageTitle: 'Thank you — what happens next · OpenStrata', thanksMetaDescription: 'What just happened on OpenStrata, and the four steps that come next: keep your configuration, register the building, connect your host, set the legal baseline.', thanksBackToWizard: 'Back to the wizard', thanksSeeEveryModule: 'See every module', thanksNextTitle: 'What happens next', thanksNoHiddenSteps: 'No hidden steps:', thanksNoHiddenStepsBody: 'nothing was published, emailed, or charged. OpenStrata is software — not an unlicensed management company — and it never holds the money: council keys stay on council hardware wallets.', thanksFrameworkDocs: 'Framework docs', thanksComplianceRef: 'BC compliance reference', wizardWhatNext: 'What happens next', proofCustodyTitle: '0% custody, always.', proofCustodyBody: 'Fiat rails today. Sovereign rails when you’re ready. Keys stay on council hardware wallets.', proofClocksTitle: 'Statutory clocks that don’t slip.', proofClocksBody: '14-day bylaw window and 7-day Form B deadline are tracked as first-class deadlines.', terms: 'Terms', privacyPageTitle: 'Privacy Policy — OpenStrata', privacyMetaDescription: 'How the Give A Bit family handles data: no accounts, no cookies, cookie-less analytics, and how to reach us.', termsPageTitle: 'Terms & Conditions — OpenStrata', termsMetaDescription: 'The terms for using the Give A Bit family sites: informational tools, no advice, no warranty, donations vs paid services.', designTypeHeading: 'Manrope — headings', designTypeBody: 'Body copy reads clean at 16–18px with relaxed leading.', designMonoLine: 'DM Mono — labels, codes, tallies', designEyebrowLine: 'Eyebrow — tiny caps', designCardNote: 'Radius 13 · 2-layer shadow · hairline border.', designStatesIcons: 'States & icons', searchPageTitle: 'Search — OpenStrata', searchMetaDescription: 'Search every page, document, manual section, FAQ, legal source, and tool on OpenStrata.', searchPageIntro: 'This page runs the same index as the ⌘K modal — bookmark it or send the link to a council member.', searchResultsCount: 'results', helpStartHere: 'Start here — the six-step guide', tourReplay: 'Watch the 60-second intro again', tasksFilterDone: 'Done', tasksFilterWeek: 'This week', searchHintOpen: 'open', searchHintClose: 'close', errorSearchTitle: 'Or try searching for it', backToTop: 'Back to top', searchSave: 'Save search', fmTitle: 'Run your first month', fmSubtitle: 'The five steps of a real billing cycle — billed, paid, reconciled, reviewed, closed.', fmStep1: 'Bill the month', fmHint1: 'Run the billing cycle so every unit is charged.', fmStep2: 'Collect a payment', fmHint2: 'Quote and confirm one owner’s fee payment.', fmStep3: 'Reconcile the deposit', fmHint3: 'Match an inbound e-transfer to its unit — it never guesses.', fmStep4: 'Review what’s due', fmHint4: 'Read the statutory calendar and the health score.', fmStep5: 'Close the month', fmHint5: 'Run month-end and watch the ledger verify.', fmNext: 'Up next', fmComplete: 'First month closed — that is the whole loop.', fmReset: 'Reset', fmHide: 'Hide this walkthrough', fmShow: 'Show the first-month walkthrough', drillDownNote: 'Unit balances, payment history and live detail live in Strata Tools.', calTitle: 'Deadline calendar', calHint: 'Due dates, statutory windows shaded, overdue in red.', calLegendDue: 'Due', calLegendWindow: 'Statutory window', calPrevMonth: 'Previous month', calNextMonth: 'Next month', calPopOpenTools: 'Open Strata Tools', calPopDueIn: 'in {n} days',
  accPageTitle: 'Accounting — Evergreen House',
  accKicker: 'Fiscal year {year}',
  accTitle: 'The books',
  accLede: 'Three bank accounts, because the Strata Property Act does not let you mix them. Operating runs the building. The contingency reserve is for repairs the depreciation report already named. The parkade levy is a trust that closes when the membrane is done.',
  accTabOverview: 'Overview',
  accTabBudget: 'Budget',
  accTabReceivables: 'Who owes',
  accTabPayables: 'Who we owe',
  accTabFunds: 'Three funds',
  accTabJournal: 'September journal',
  accOperatingCash: 'Operating cash',
  accUnrestrictedEquity: 'Unrestricted equity {amount}',
  accReserve: 'Reserve',
  accCash: 'Cash {amount}',
  accLevyTrust: 'Levy trust',
  accOfWorkLeft: '{amount} of work left',
  accWarChestAtCost: 'War chest at cost',
  healthTrendTitle: 'Six months of the score', healthTrendLede: 'The same score the gauge shows, rebuilt at each month end from the calendar, the arrears and the Form K register.', healthTrendDeadlines: 'Deadlines', healthTrendArrears: 'AR past due', healthTrendFormK: 'Form K gaps', healthTrendMoved: 'moved in {months}', healthTrendFlat: 'held all six months', healthTrendNote: 'Rebuilt from the dated charges and the lot register at each month end — no number here is stored.', healthTrendOverSix: 'over six months', healthTrendSince: 'since {month}', healthTrendOpenMonth: 'Open {month}', healthTrendClose: 'Close', healthTrendCharges: 'Charges past due', healthTrendNoCharges: 'No charge was past its due date at this month end.', healthTrendNoFormK: 'No Form K window had closed by this month end.', healthTrendPastWindow: '{days} days past the 14-day window',
  accWarChestValue: 'Fair value {value} · {gain} unrealized',
  accTieOk: 'The operating fund, the reserve, and the levy each tie. Budgeted fees plus other income equal operating expenses plus the reserve contribution.',
  accTieBad: 'Out of balance by {cents} operating cents. Do not treat this package as closed.',
  accChartTitle: 'Fees billed vs operating expenses',
  accChartSub: 'April through September. Fees are flat. Expenses move with summer grounds work and the September payroll start.',
  accChartLegend: 'Teal is fees billed. Orange is operating expenses. The reserve contribution is not in the orange bars — it is not an operating expense.',
  accYtdTitle: 'Year to date, operating fund',
  accYtdFees: 'Fee income that belongs to operating: {amount}.',
  accYtdOther: 'Other income: {amount}.',
  accYtdExpenses: 'Operating expenses: {amount}.',
  accYtdSurplus: 'Surplus before the war-chest allocation: {amount}.',
  accYtdWarChest: 'The war chest took {amount} of that surplus. It is a transfer inside the fund, not an expense, and it is not a CRF withdrawal.',
  accInsuranceTitle: 'Insurance and the long repair list',
  accInsuranceBody: '{broker}. Policy {policy}, {term}. Premium {premium} was prepaid and is expensed monthly. Water deductible {water}. Quake: {quake}.',
  accDepreciationBody: '{firm} report dated {dated}. Recommended reserve contribution {recommended}. AGM funded {funded}. Next report {next}.',
  accColAccount: 'Account',
  accColAnnualBudget: 'Annual budget',
  accColLeft: 'Left',
  accRowStrataFees: '4010 / 4020 Strata fees',
  accRowCrfContribution: 'CRF contribution (separate fund)',
  accRowBudgetResult: 'Budget result (fees + other income − expenses − reserve)',
  accBudgetNote: 'A zero result means the fee was set to fund the year, not to build a hidden cushion. The operating surplus you already have is a separate, older balance.',
  accReceivablesHint: 'October is due tomorrow, so almost every lot shows an October number. “Past due only” hides lots whose only item is that upcoming fee.',
  accPastDueOnly: 'Past due only',
  accShowEveryLot: 'Show every lot',
  accColOwner: 'Owner',
  accColOctober: 'October',
  accColBehind: 'Behind',
  accColLate: 'Late',
  accColFine: 'Fine',
  accColLevy: 'Levy',
  accColTotal: 'Total',
  accColFormF: 'Form F',
  accReceivablesNote: 'Form F is withheld when something is already due: fees, late fees, fines, or levy. October, on September 30, is not yet due, so a current lot can still get a clear Form F.',
  accColWho: 'Who',
  accColFor: 'For',
  accColDue: 'Due',
  accColAmount: 'Amount',
  accPayableCra: 'CRA — source deductions',
  accPayableCraMemo: 'September payroll. Confirm monthly vs quarterly on the RP letter.',
  accStateOpen: 'Open',
  accContractRenewal: 'Renews or ends {date}',
  accFundOperating: 'Operating',
  accFundReceivables: 'Receivables',
  accPrepaidInsurance: 'Prepaid insurance',
  accBillsPayroll: 'Bills and payroll',
  accPrepaidFees: 'Prepaid October fees',
  accFundBalance: 'Fund balance',
  accContingencyReserve: 'Contingency reserve',
  accCrfOpening: 'Opening, April 1',
  accCrfContributions: 'Contributions billed',
  accCrfInterest: 'Interest',
  accCrfNote: 'Spend from this account has to be a repair or replacement the report supports. Bitcoin is not that. The war chest is funded from operating surplus by a 3/4 vote.',
  accParkadeLevy: 'Parkade levy',
  accLevyAssessed: 'Assessed ({date})',
  accLevyCollected: 'Collected',
  accStillOwing: 'Still owing',
  accLevySpent: 'Spent on the membrane',
  accLevyRemaining: 'Work remaining',
  accLevyNote: '{project}. $36 per entitlement point. Cash plus what owners still owe equals the work that is left.',
  accJournalIntro: 'These are the September control entries a treasurer would read before signing the month. They are not a dump of every hydro bill. The year-to-date totals live on the Budget tab. Each entry balances.',
  accCloseTitle: 'September close',
  accCloseHint: 'Five checks between the September books and a signed month. Each one reads the ledger, so none of them is a reminder you can dismiss.',
  accCloseCount: '{done} of {total} done',
  accCloseAction: 'Close September',
  accCloseBlocked: 'Close is blocked on: {item}',
  accCloseLocked: 'A close is a snapshot. Once it locks, the entries behind it stay and October starts from it.',
  accCloseTieTitle: 'The three accounts tie',
  accCloseTieBody: 'Operating, reserve and levy agree between the balance sheet and the activity sheet. Off by {delta} cents.',
  accClosePayrollTitle: 'Payroll and source deductions',
  accClosePayrollBody: 'Concierge pay of {net} posted 30 September. {remittance} of CPP and EI remits to the CRA on {due}.',
  accCloseReserveTitle: 'Reserve contribution and interest',
  accCloseReserveBody: '{contributions} billed to the reserve fund, and {interest} of interest posted by the credit union.',
  accCloseBoardTitle: 'Board approval on the minutes',
  accCloseBoardBody: 'A close needs a resolution and a minutes reference. The next council meeting is 20 October, which is why this check is still open.',
  accCloseLockTitle: 'Lock the period',
  accCloseLockBody: 'Locks September once the four checks above pass. Nothing is locked today, so these numbers can still move.',
  accStateDone: 'Done',
  accStateBlocked: 'Blocked',
  accCashLabel: 'Cash',
  accCashAt: 'Cash at {date}',
  accCashByMonth: 'Cash at each month end',
  accCashByMonthHint: 'The credit union’s statements, month by month. September closes on the figures above; the levy falls each month because the membrane is being paid.',
  accCashNoStatement: 'The statements on this book run April to September 2026, so this month has no cash balance to show — the figures are the {close} close.',
  accColMonthEnd: 'Month end',
  accColChange: 'Change',
  accCashCloseNote: 'Receivables, prepaids and payables are read at the {close} close — the statements hold month ends, not the balances behind them.',
  lotSheetFormKDate: 'Date on the Form K',
  lotSheetFormKFile: 'Record the Form K',
  lotSheetFormKFiled: 'On file — recorded {date} in this browser',
  lotSheetFormKFiledNote: 'Recorded on this device only; nothing is sent to a host. The health score and this sheet read it, and every month that closed before the filing keeps its gap.',
  lotSheetFormKClear: 'Remove the record',
  next30Title: 'The next 30 days',
  next30Hint: 'Every dated item from today through the next 30 days, read from the same calendar the month grid uses.',
  next30TaxHint: 'The filings, remittances and compliance dates in the next 30 days. Owner-tax declarations are the sections below.',
  next30Today: 'Today',
  next30Week: 'This week',
  next30Later: 'Later this month',
  next30Empty: 'Nothing dated.',
  next30SeeCalendar: 'Open the calendar',
  next30DueToday: 'today',
  next30Tomorrow: 'tomorrow',
  next30DaysLeft: 'in {n} days',
  unitsPageTitle: 'Units — Evergreen House',
  unitsKicker: '{lots} strata lots · {floors} floors',
  unitsTitle: 'Who lives here',
  unitsLede: 'Pick a lot. The card on the right is the owner file: fees, levy, Form K, and the vacancy-tax notes the secretary actually gets asked for.',
  unitsSearchPlaceholder: 'Search a name or a lot',
  unitsSearchLabel: 'Search lots',
  unitsFloor: 'Floor {n}',
  unitsFilterAll: 'All lots',
  unitsFilterArrears: 'Fees behind',
  unitsFilterFormK: 'Form K missing',
  unitsFilterLevy: 'Levy balance',
  unitsFilterWithheld: 'Form F withheld',
  unitsFilterVacant: 'Vacant',
  unitsFilterShortTerm: 'Short-term', unitsFilterClear: 'Clear filters', unitsFiltersKept: 'These filters stay on this device and come back with you.',
  unitsNoMatch: 'No lot matches that filter.',
  unitsLotHeading: 'Lot {lot} · strata lot {n}',
  unitsMonthlyFee: 'Monthly fee',
  unitsToClear: 'To clear, including October',
  unitsEntitlement: 'Entitlement',
  unitsPoints: '{n} pts',
  unitsOctoberPaid: 'October: already paid',
  unitsOctoberDue: 'October: {amount}',
  unitsFeesBehind: 'Fees behind: {amount}',
  unitsFeesBehindMonths: 'Fees behind: {amount} over {n} months',
  unitsLateFees: 'Late fees: {amount}',
  unitsFines: 'Fines: {amount}',
  unitsLevyOwing: 'Levy still owing: {amount}',
  unitsFeeSplit: 'Of each monthly fee, {operating} is operating and {crf} is reserve.',
  unitsLives: 'Lives:',
  unitsOccOwner: 'Owner',
  unitsOccVacant: 'Vacant',
  unitsOccShortTerm: 'Short-term',
  unitsTenantSince: 'since {date}',
  unitsOwnerIsIn: 'Owner is in:',
  unitsFormK: 'Form K:',
  unitsPaysBy: 'Pays by:',
  unitsParking: 'Parking / locker:',
  unitsPets: 'Pets:',
  unitsEv: 'EV:',
  unitsEvYes: 'Charger installed',
  unitsEvNo: 'No charger',
  unitsEht: 'Empty Homes Tax.',
  unitsSvt: 'Speculation tax.',
  unitsUht: 'Underused housing.',
  unitsPayThisLot: 'Pay this lot',
  unitsFormBNote: 'Form B was requested {requested} and is due {due}. The lot is clear, so Form F can go with it.',
  calPageTitle: 'Calendar — Evergreen House',
  calKicker: 'April 2026 through the May 2027 AGM',
  calHeading: 'Calendar',
  calLede: 'Fees on the 1st, council on the third Tuesday, CRA dates on the day they actually fall, and the inspections that keep Form B boring. September 30 is today in this sample.',
  calPrevious: 'Previous',
  calNext: 'Next',
  calAllDates: 'All',
  calNothingDated: 'Nothing dated on this day. Fees for another month show when that month is open.',
  calEverythingIn: 'Everything in {month}',
  calCatFees: 'Fees',
  calCatCouncil: 'Council',
  calCatCra: 'CRA',
  calCatBcTax: 'BC and City tax',
  calCatMaintenance: 'Maintenance',
  calCatInsurance: 'Insurance',
  calCatCompliance: 'Compliance',
  calCatPayroll: 'Payroll',
  unitsSpec: '{type} · {sqft} sq ft · floor {floor}',
  unitsPerMonth: '{amount}/mo',
  taxPageTitle: 'Tax and CRA — Evergreen House',
  taxKicker: 'Strata returns, and the owner-tax desk',
  taxHeading: 'Tax and CRA',
  taxLede: 'Two returns are due today for the year that ended March 31, 2026. The year the building is living in is not filed until September 30, 2027. Owner taxes — empty homes, speculation, underused housing, property tax — are tracked here and paid by the owners.',
  taxPriorYear: 'Prior year, the one being filed today',
  taxRevenue: 'Revenue',
  taxOperating: 'Operating expenses',
  taxReserve: 'Reserve contribution',
  taxExcess: 'Excess kept in the funds',
  taxFundsLine: 'Assets {assets}. Fund balances {equity}. Interest plus parking {passive}, which is why the T1044 is not optional.',
  taxDueApplies: 'Due {due}. Applies to {appliesTo}.',
  taxInOrder: 'Do it in this order',
  taxChecklist: 'Checklist',
  taxDone: 'Done',
  taxOpen: 'Open',
  taxReadSteps: 'Read the steps',
  meetPageTitle: 'Meetings — Evergreen House',
  meetKicker: 'Council of five · AGM quorum is {need} of {lots}',
  meetTitle: 'Meetings and votes',
  meetLede: 'The next meeting is {next}. The package has to be out on {packageDue}. Last month’s fine is already on the books. The AGM that set this year’s fees was {agm}. The next AGM is {nextAgm}. The statute’s last day is {statutory}.',
  meetAgmQuorum: 'AGM quorum',
  meetCouncilQuorum: 'Council quorum',
  meetOfFive: '{need} of 5',
  meetNoShow: 'If people don’t show',
  meetCouncil: 'Council',
  meetSince: 'since {date}',
  meetLot: 'Lot {lot}',
  meetNextMeeting: 'Next meeting',
  meetMinutes: 'Minutes — {date}',
  meetAgm: 'AGM — {date}',
  meetBylawFile: 'Bylaw file — lot {lot}',
  meetWhichVote: 'Which vote is which',
  payPageTitle: 'Pay — Evergreen House',
  payPageHeading: 'Pay a strata lot',
  payExactBitcoin: 'Exact bitcoin',
  payExactLightning: 'Exact lightning amount',
  payWatchAddress: 'Watch-only address',
  payInvoice: 'Invoice',
  payStandingOffer: 'Standing offer',
  payMatchingTitle: 'How a payment finds its lot',
  payTapeTitle: 'September receipt tape',
  payTapeNote: 'A sample of the month, not a second copy of the cash total. The fund statement is the number that has to tie.',
  payColDate: 'Date',
  payColLot: 'Lot',
  payColRail: 'Rail',
  payColReference: 'Reference',
  payColAmount: 'Amount',
  payVendorTitle: 'Council paying a vendor',
  payVendorBody: '{vendor} is owed {amount} for {memo}, due {due}. The ordinary way out is an e-transfer from the operating account, after the treasurer matches the invoice to account 6250. Bitcoin and Lightning are on the card because the vendor may ask. They are not the default, and they are never paid from the reserve or the levy trust. A bitcoin payment would be a PSBT signed 3 of 5 on hardware wallets. This software watches. It does not hold a key.',
  meetQuorumOfLots: '{need} of {lots}',
  meetNextAgmLine: 'Next AGM {date}.',
  payKicker: 'Same balance, five ways to pay it',
  payLede: 'One amount, then the rail the owner already trusts. Bitcoin and Lightning sit beside e-transfer on every bill — paying in bitcoin does not make an owner less of a full owner. PAD and cheque stay at the bottom for the people who use them. Every destination on this page is a demo and cannot be paid.',
  payFeeSplitLine: 'Of the monthly fee, {operating} is operating and {crf} is reserve. The owner sends one amount.',
  changelogTrailYouAreHere: 'You are here',
  changelogTrailSince: 'since v{version}',
  changelogTrailChangeOne: '1 change',
  changelogTrailChangeMany: '{n} changes',
  changelogTrailRunning: 'You are running v{version}',
  changelogTrailUpToDate: '— the newest release.',
  changelogTrailBehindOne: '— 1 release and {changes} since.',
  changelogTrailBehindMany: '— {releases} releases and {changes} since.',
  changelogTrailAhead: 'This build is v{version}, newer than the newest note here.',
  unitsPlanLine: 'Floor {n} · {lots} lots · {sqft} sq ft',
  unitsPlanHint: 'Each floor drawn as it stands: two rows of lots either side of the corridor, each one as wide as its square footage. The colour is the rule the filters use — fees behind, a missing Form K, or a levy balance.',
  unitsPlanCorridor: 'Corridor',
  unitsPlanLotAria: 'Open lot {lot}, {owner}, {sqft} square feet',
  accColEntry: 'Entry',
  accStatementCash: 'Cash moved',
  accColRunning: 'Cash after',
  accStatementDetails: 'Entry details',
  accStatementHash: 'Hash',
  accStatementPostedBy: 'Posted by',
  accStatementOpening: 'Opening cash on September 1: {amount}.',
  accStatementClosing: 'The last line is {amount} — the operating and reserve cash the Three funds tab reports.',
  accStatementChain: 'Each hash is computed from the entry and the hash above it, so editing one line changes every hash below. This demo runs the chain in the browser; the host keeps the durable copy.',
  accStatementEvidence: 'Evidence',
  accAgePastDue: 'Past due',
  accAgePastDueLots: '{lots} of {all} lots',
  accAgeOver90Label: 'Past due over 90 days',
  accAgeShare: '{share} of what is past due',
  accAgeOldestLabel: 'Oldest money',
  accAgeOldestDays: '{days} days past due',
  accAgeHint: 'Every charge aged from the day it fell due, oldest money first. A fee is due on the 1st and the $50 late fee attaches on the 5th, so at the close a September fee is 29 days late and a July one is 91. October sits in “current”: on September 30 it is owed, but not yet due.',
  accAgeCurrent: 'Current',
  accAge30: '1–30',
  accAge60: '31–60',
  accAge90: '61–90',
  accAgeOver90: '90+',
  accAgeBucketDays: '{n} days',
  accAgeClear: '{clear} of {all} lots have nothing past due.',
  accAgePlanTitle: 'On a payment plan',
  accAgePlanLine: '{amount} a month', accPeriodBanner: 'Opened at {date}. The receivables ladder is aged to that day and the journal stops there.', accPeriodBack: 'Back to today’s books', healthTrendOpenBooks: 'Open in the books',
  lotSheetKicker: 'Lot sheet · as at {date}',
  lotSheetLede: 'One lot on one page: what it owes, the account behind the balance, the forms on file, and what is dated next. The print leaves the tenant off it.',
  lotSheetFee: '{month} strata fee',
  lotSheetLate: 'Late fee — {month}',
  lotSheetFine: 'Bylaw fine',
  lotSheetLevy: 'Parkade levy — still owing',
  lotSheetCharged: 'Charged',
  lotSheetCleared: 'Cleared',
  lotSheetStill: 'Still owing',
  lotSheetAccount: 'The account behind the balance',
  lotSheetAccountHint: 'April to September, in the order the charges fell due, against what cleared them. A month inside the arrears window stands open. The last line is what a payment would have to clear today.',
  lotSheetForms: 'Forms on file',
  lotSheetFormFWithheld: 'Withheld while money is owing: a notary asking for a certificate gets the balance, not a clear one.',
  lotSheetFormFClear: 'Nothing is owing, so Form F can be issued with Form B.',
  lotSheetNext: 'Dated next',
  lotSheetNextEmpty: 'Nothing is dated for this lot.',
  lotSheetPrint: 'Print this sheet',
  lotSheetPrintNote: 'The printed sheet leaves the tenancy off it.',
  lotSheetTenancy: 'Tenancy',
  lotSheetOpen: 'Open the lot’s own sheet',
  accPeriodCloseNote: 'The overview cards, the budget and the payables stay at the {close} close — this page keeps no month-by-month ledger to rebuild them. The funds tab follows the month, because the statements do.',
  accStatementOpeningAt: 'Cash at the start of the fiscal year, {date}: {amount}.',
  accStatementClosingAt: 'The last line is {amount} — operating and reserve cash at {date}.',
  accStatementNone: 'No entry was posted by {date}. The journal in the sample book begins on {first}.',
  healthTrendCutAll: 'All {n}',
  healthTrendCutMonth: 'In {month} ({n})',
  healthTrendNoDated: 'No charge above is dated in {month}: the money was already owing when the month opened.',
  lotSheetFormKWindow: 'Tenant from {since} — the 14-day window closed {closed}',
  formKRegisterTitle: 'Form K register',
  formKRegisterKicker: 'The tenanted lots · as of {date}',
  formKRegisterLede: 'Every lot with a tenant, the day its two-week window closed and whether the form is on file — the list the compliance-health score counts, longest-open window first. The printed page is what a council brings to a meeting.',
  formKRegisterPrint: 'Print the register',
  formKRegisterPrintNote: 'The buttons and this note stay on screen; the register prints on its own.',
  formKRegisterBack: 'Back to the lots',
  formKRegisterLink: 'Form K register',
  formKRegisterLot: 'Lot',
  formKRegisterTenant: 'Tenant',
  formKRegisterSince: 'Moved in',
  formKRegisterClosed: 'Window closed',
  formKRegisterOpen: 'Still open until {date}',
  formKRegisterOnFile: 'On file',
  formKRegisterDaysPast: 'Days past',
  formKRegisterCost: 'Points',
  formKRegisterSummary: '{gaps} of {lots} tenanted lots have no Form K on file. The score charges {points} points for them: 5 a gap, capped at 15.',
  formKRegisterClear: 'Every tenanted lot has its Form K on file. The score charges nothing for paperwork.',
  formKRegisterNote: 'Longest-open window first — the order the score reads them. A form recorded on a lot’s own sheet in this browser closes that lot’s gap here, counting from the day it was recorded, so a month that closed earlier keeps the score it earned.',
  formKRegisterCapped: 'The score stops counting at 15 points, so {n} of these gaps cost nothing.',
  accTabReserve: 'Reserve plan',
  accReserveTitle: 'The reserve fund, five years out',
  accReserveLede: 'The fund’s opening balance, the budget’s contribution and the interest the credit union actually paid, against the projects the depreciation report schedules. The funds tab shows this year only; this is what the plan costs in the years the building will need it.',
  accReservePrint: 'Print this table',
  accReservePrintNote: 'The tabs and this button stay on screen; the table, the report and the basis print together.',
  accReserveColYear: 'Fiscal year',
  accReserveColOpening: 'Opening',
  accReserveColContribution: 'Contributions',
  accReserveColInterest: 'Interest',
  accReserveColScheduled: 'From the report',
  accReserveColClosing: 'Balance at 31 March',
  accReserveReport: 'Depreciation report: {firm}, dated {dated}. The next report is due {due}.',
  accReserveRate: 'Interest is projected at {rate}% a year on the average balance — the rate the credit union paid on this fund in the six months to {date}.',
  accReserveFunding: 'The budget contributes {funded} a year. The report recommends {recommended}; the difference is the gap this table shows.',
  accReserveLevy: '{project} ({amount}) belongs to the parkade levy, not this fund: the levy collected and spent it in its own trust, so it is not counted here.',
  accReserveShortfall: 'The schedule runs past the fund in {year}: that year ends {amount} short.',
  accReserveCovers: 'Every scheduled project is covered, and the fund ends {year} at {amount}.',
  yearSheetKicker: 'For the AGM package',
  yearSheetTitle: 'The year on one page',
  yearSheetLede: 'One printed page for the annual meeting: the year’s income and spend by category, the three fund balances, where the compliance score started and ended, and what is still open. Every figure is read from the books, not retyped.',
  yearSheetPrint: 'Print this page',
  yearSheetPrintNote: 'One page. The dashboard stays on screen.',
  yearSheetFiscal: 'Fiscal year',
  yearSheetBooksTo: 'Books to',
  yearSheetYear: 'Fiscal year {fiscal}. The books close {date}, six months in.',
  yearSheetIncome: 'Income by category',
  yearSheetExpense: 'Spend by category',
  yearSheetActual: 'Actual',
  yearSheetSurplus: 'Operating surplus',
  yearSheetHealth: 'Compliance score',
  yearSheetHealthLine: '{from}: {fromScore} of 100 → {to}: {toScore} of 100.',
  yearSheetHealthDown: 'Down {points} points since {month}.',
  yearSheetHealthUp: 'Up {points} points since {month}.',
  yearSheetHealthFlat: 'Unchanged since {month}.',
  yearSheetOpen: 'What is still open',
  yearSheetOpenEmpty: 'Nothing is tracked as open.',
  yearSheetDue: 'Due',
  yearSheetItem: 'Item',
  yearSheetOpenSummary: '{n} tracked items, {overdue} of them overdue. An overdue item stays on the page, because the meeting is where it gets answered.',
  yearSheetBasis: 'Read from the operating ledger, the three fund balances and the six-month compliance model on this page. Nothing here is retyped, so a figure that changes in the books changes on this sheet.',
  yearSheetFooter: '{name} · prepared from the books at {date} · demo data, not a filed statement.',
  yearCatFees: 'Strata fees (operating share)',
  yearCatParking: 'Parking and move fees',
  yearCatFines: 'Fines and late fees',
  yearCatInterest: 'Interest',
  yearCatFobs: 'Fobs and keys',
  yearCatInsurance: 'Insurance',
  yearCatUtilities: 'Utilities',
  yearCatPeople: 'Caretaking and payroll',
  yearCatSystems: 'Building systems and repairs',
  yearCatGrounds: 'Grounds and cleaning',
  yearCatProfessional: 'Professional and studies',
  yearCatAdministration: 'Administration',
  meetPacketTitle: 'The packet for the next meeting',
  meetPacketLede: 'The notice, the agenda, the last minutes and the quorum maths on one page, at print size rather than shrunk to fit. Print it, hand it round, and file it with the minutes.',
  meetPacketPrint: 'Print the meeting pack',
  meetPacketPrintNote: "Five Letter pages: the packet, the proxy card, the AGM notice, the bylaw hearing notice and the fine register.",
  meetPacketHeading: 'Council meeting packet',
  meetPacketNotice: 'Notice',
  meetPacketNoticeLine: 'Notice is given to all council members that the council will meet as follows.',
  meetPacketDate: 'Date',
  meetPacketTime: 'Time',
  meetPacketPlace: 'Place',
  meetPacketGiven: 'Notice given',
  meetPacketGivenLine: 'By {date} — {days} days ahead of the meeting, inside the {window}-day window.',
  meetPacketAgenda: 'Agenda',
  meetPacketNextAgm: 'Next annual general meeting: {date}. The statute’s last day is {statutory}, and quorum is {need} of {lots}.',
  meetPacketFooter: '{name} · prepared from the meeting record on this page · demo data — check every date against the notice before it is sent.',
  searchUnits: 'Lots',
  searchShortUnits: 'Lots',
  searchLedger: 'Ledger entries',
  searchShortLedger: 'Ledger',
  searchTax: 'Tax sections',
  searchShortTax: 'Tax',
  payReceiptTitle: 'Receipt for payment received',
  payReceiptFor: 'Strata fees · lot {unit}',
  payReceiptAmount: 'Amount received',
  payReceiptPaidBy: 'Paid by',
  payReceiptOpen: 'Receipt',
  payReceiptPrint: 'Print this receipt',
  payReceiptHint: 'Every payment in the tape prints as its own page. Pick a row to put it on paper — the rest of this page is not printed.',
  payReceiptRateLost: 'No rate was recorded when this payment settled on {date}, so the receipt does not re-price it at today’s rate.',
  payReceiptBasis: 'Receipt for payment received against the lot above. It is not a statement of account and not a tax receipt; the council’s books are the record.',
  budgetSheetTitle: 'The budget against the year to date',
  budgetSheetLede: 'The annual budget line by line, the year to date, what is left and how far the year has run from the plan, on one printed page for the table.',
  budgetSheetSubtitle: 'Fiscal {fiscal} · the plan to date is {months} of {year} months, with the books to {date}.',
  budgetSheetPrint: 'Print this budget',
  budgetSheetPrintNote: 'One page. The tabs and this control are not printed.',
  budgetSheetColVariance: 'Variance',
  budgetSheetIncome: 'Income',
  budgetSheetExpenses: 'Expenses',
  budgetSheetOnPlan: 'on plan',
  budgetSheetOver: 'over',
  budgetSheetUnder: 'under',
  budgetSheetPlanNote: 'The plan to date is {share} of each annual line — {months} of the year’s twelve months — because the books stop at {date}.',
  budgetSheetBasis: 'Variance is the year to date less the plan to date, so “over” means more spend or less income than planned. Spending over plan and income short of plan print in bold. The reserve contribution carries no verdict.', budgetSheetReasonNote: 'A line that ran from plan prints the reason beside its variance.',
  budgetSheetFooter: 'Sample books for Strata Plan {plan}. Not an audited statement and not tax advice.',
  yearCalHeading: 'The year on one page',
  yearCalLede: 'Twelve months of the fiscal year in one grid, the statutory windows shaded, and every dated item beneath — pinned to the wall instead of paged through month by month.',
  yearCalTitle: 'The year’s deadlines on one page',
  yearCalSubtitle: 'Fiscal {fiscal} · {months} months, {days} days · {windows} statutory windows and {items} dated items.',
  yearCalPrint: 'Print this year',
  yearCalPrintNote: 'One page. The month view stays on screen.',
  yearCalGridNote: 'Each column is a day of the month. A shaded day is inside a statutory window; the bar across a month is the payroll remittance window (1st to 15th); a dark day is a filing deadline; an orange rule marks a dated item listed below.',
  yearCalMonth: 'Month',
  yearCalLegend: 'Legend',
  yearCalLegendDeadline: 'Filing deadline',
  yearCalLegendItem: 'Dated item',
  yearCalWindows: 'Statutory windows',
  yearCalWindowPayroll: 'Payroll remittance',
  yearCalWindowPayrollRule: 'Source deductions for the previous month are remitted by the 15th. A new employer is sometimes assigned quarterly — read the RP letter.',
  yearCalWindowEpr: 'Energy performance report (EPR)',
  yearCalWindowEprRule: 'The report covers the calendar year and is filed by 31 December. Missing it is disclosed on Form B.',
  yearCalWindowT2: 'T2 and T1044',
  yearCalWindowT2Rule: 'Filed within six months of the 31 March year end.',
  yearCalWindowSvt: 'Speculation and vacancy tax declarations',
  yearCalWindowSvtRule: 'Owners declare; the strata reminds them. Declarations close on 31 March.',
  yearCalWindowT4: 'T4 and T4A slips',
  yearCalWindowT4Rule: 'Filed by the last day of February for the calendar year that ended.',
  yearCalWindowAgm: 'AGM and budget approval',
  yearCalWindowEach: '{from} to {to}, {count} windows of {days} days each',
  yearCalDaysIn: '{days} of {total} days in this year',
  yearCalDaysEach: '{days} days',
  yearCalAfter: 'After the year: the AGM window',
  yearCalAfterRule: 'Held within two months of the 31 March year end, where the budget and the reserve contribution are approved. This is the meeting the year is reviewed at.',
  yearCalItems: 'Dated items ({count})',
  yearCalAfterItems: 'After the year ({count})',
  yearCalRhythm: 'The monthly fee run, late fee, council meeting, bank reconciliation and payroll remittance repeat every month: they are the grid’s rhythm, not separate deadlines, so they are not listed.',
  yearCalFooter: 'Sample calendar for Strata Plan {plan}. Confirm each date against the current bylaw notice or CRA page before relying on it.',
  accArrearsSheetTitle: 'The receivables ladder',
  accArrearsSheetLede: 'Every charge aged from the day it fell due, oldest money first, on one page for the table.',
  accArrearsSheetSubtitle: 'Aged to {date} · {late} of {lots} lots past due.',
  accArrearsSheetPrint: 'Print this ladder',
  accArrearsSheetPrintNote: 'One page. The filters and the cards stay on screen.',
  accArrearsSheetFormF: 'Form F',
  accArrearsSheetWithheld: 'Withheld',
  accArrearsSheetBook: 'The {late} lots above owe {past} past due, plus {current} for the next fee. The other lots owe only that fee — {notDue} not yet due — so {standing} stands on the books in all.',
  accArrearsSheetClear: '{clear} of {lots} lots have nothing on the books at all.',
  accArrearsSheetPlanLine: '{amount} standing on a payment plan',
  accArrearsSheetBasis: 'Ages are counted from each charge’s due date to {date}, never from a status field. “Current” is money owed that is not yet due. A plan balance is a schedule, not overdue debt, so it is not aged.',
  accArrearsSheetFooter: 'Sample receivables for Strata Plan {plan}. Not a statement of account and not a demand for payment.',
  accCashStatementTitle: 'Cash statement — operating account',
  accCashStatementSubtitle: '{account} {name} · {from} to {to}',
  accCashStatementPrint: 'Print this statement',
  accCashStatementPrintNote: 'One Letter page, with the chain on it.',
  accCashStatementOpening: 'Opening balance',
  accCashStatementClosing: 'Closing balance',
  accCashStatementMovement: 'Movement',
  accCashStatementAccount: 'Bank account',
  accCashStatementEntries: '{moved} of {entries} entries on this account',
  accCashStatementNoEntry: 'No entry was posted by {date}. The journal begins on {first}, so this statement has nothing to chain yet.',
  accCashStatementChain: 'The journal prints whole, including entries that did not move this account: a hash covers its entry and the hash above it, so a dropped row would break every hash below it. The chain runs in the browser on these sample books; the host keeps the durable copy.',
  accCashStatementHead: 'Chain head',
  accCashStatementBasis: 'Cash in this statement is account {account} and nothing else. The reserve (1020) and the parkade levy are separate funds with their own pages, and the war chest at cost (1080) is not cash.',
  accCashStatementTie: 'The closing balance is the operating cash the overview and the Three funds tab report.',
  accCashStatementPeriod: 'Stopped at {date}: the statement runs from the journal’s opening balance and includes every entry posted on or before that day. Nothing is estimated.',
  accCashStatementFooter: 'Sample books for Strata Plan {plan}. Not a credit union statement and not a demand for payment.',
  accReconTitle: 'The close, reconciled',
  accReconLede: 'Every fund counted from its own accounts and again from the year’s activity, with the difference between the two counts printed, on one page for the close.',
  accReconSubtitle: 'The books to {date} · each fund counted twice, and every check named.',
  accReconPrint: 'Print the reconciliation',
  accReconPrintNote: 'Two Letter pages: the funds, then the budget and the checks. The tabs and this control stay on screen.',
  accReconCashTitle: 'Cash on deposit',
  accReconOperatingTitle: 'The operating fund',
  accReconAccounts: 'From the accounts',
  accReconActivity: 'From the year’s activity',
  accReconDifference: 'Difference',
  accReconBills: 'Bills payable',
  accReconPayroll: 'Source deductions payable',
  accReconOpening: 'Equity, April 1',
  accReconFees: 'Fees earned',
  accReconOther: 'Other income',
  accReconExpenses: 'Expenses',
  accReconLevyCash: 'Cash in the trust',
  accReconAssessed: 'Assessed at the special meeting',
  accReconAgrees: 'agrees',
  accReconFails: 'does not hold',
  accReconOffBy: 'off by {amount}',
  accReconJournal: 'Every journal entry’s debits equal its credits.',
  accReconEntitlement: 'The {lots} lots add to {points} points, the schedule’s own total.',
  accReconBasis: 'Each count uses only the September books; the difference is the fund balance one way less the fund balance the other, never a figure typed in. The levy trust is restricted and is not fund equity. Board approval of the close is not a number, so this page does not claim it.',
  accReconFooter: 'Sample books for Strata Plan {plan}. Not an audited statement and not an accountant’s report.',
  accPayablesTitle: 'Payables at the close',
  accPayablesSubtitle: 'Every bill the September books carry, and the source deductions due with them.',
  accPayablesLede: 'The bills by vendor and account, the days each one has left, and what falls due inside thirty days. The contracts stay on screen.',
  accPayablesPrint: 'Print the payables',
  accPayablesPrintNote: 'One page. Stay on this tab.',
  accPayablesDays: 'Days',
  accPayablesLate: 'overdue',
  accPayablesWindow: 'Window ends',
  accPayablesDueBy: 'Due by {date}',
  accPayablesAfter: 'After {date}',
  accPayablesBasis: 'Vendor bills are {bills} of the open balance; the source deductions, {deductions}, sit on account 2100 and are remitted to the CRA, not paid to a supplier. Days are counted from the {date} close, so a bill already past due prints a negative count rather than a zero.',
  accPayablesFooter: 'Sample payables for Strata Plan {plan}. Not a payment instruction and not a remittance advice.',
  accTrialTitle: 'Trial balance — September',
  accTrialSubtitle: 'Every account the September journal touched, its debits, its credits and its balance.',
  accTrialDebit: 'Debit',
  accTrialCredit: 'Credit',
  accTrialBalance: 'Balance',
  accTrialPrintNote: 'Two pages: the cash statement, then the trial balance.',
  accTrialAgrees: 'Debits and credits agree',
  accTrialFails: 'Debits and credits do not agree',
  accTrialUnmoved: '{count} accounts carry a year-to-date balance and no entry on this page: {list}.',
  accTrialBasis: 'The columns are the journal’s own lines added by four-digit account code, never typed totals. The cash statement on the preceding page follows the bank accounts; this page follows every account, and the balance column is debits less credits, so a sound book adds to zero.',
  accTrialFooter: 'Sample trial balance for Strata Plan {plan}. Not a filing and not an audit.',
  meetProxyHeading: 'Proxy card',
  meetProxySubtitle: 'Annual general meeting of {date}',
  meetProxyDueLabel: 'Due back',
  meetProxyAppointee: 'Appointee',
  meetProxyAppoint: 'The owner named above appoints the person named above to attend and vote at the meeting of {date}, and at any adjournment of it.',
  meetProxyDirection: 'Direction',
  meetProxyFor: 'In favour',
  meetProxyAgainst: 'Against',
  meetProxyAbstain: 'Abstain',
  meetProxyDiscretion: 'No direction marked means the appointee votes at their discretion. The bylaws do not require a direction.',
  meetProxyDue: 'Return to the secretary by {date}, {days} days before the meeting.',
  meetProxySignature: 'Signature',
  meetProxyDated: 'Date',
  meetProxyBasis: 'One proxy per lot. A card received after {date} is late and does not count. A proxy counts towards quorum: {need} of {lots} lots must be represented.',
  meetProxyFooter: 'Sample proxy for Strata Plan {plan}. Fill it in and hand it to the secretary; nothing here is sent to a host.',
  unitsFeeSheetTitle: 'The fee schedule',
  unitsFeeSheetSubtitle: 'Every lot at the budget’s rate of {rate} a point, for twelve months.',
  unitsFeeSheetLots: 'Lots',
  unitsFeeSheetAnnual: 'Annual',
  unitsFeeSheetTenant: 'Tenant',
  unitsFeeSheetTenanted: '{tenanted} of {lots} lots carry a tenant and are listed first. Every lot is on the schedule.',
  unitsFeeSheetBasis: 'The operating and reserve parts are the lot’s points at their own rates, and the monthly fee is their sum, so the split cannot fail to add back. The annual column is twelve monthly runs, which is the budget’s fee line and its CRF contribution.',
  unitsFeeSheetFooter: 'Sample fee schedule for Strata Plan {plan}. Not a budget and not a notice of a fee increase.',
  unitsFeeSheetPrint: 'Print the fee schedule',
  unitsFeeSheetPrintNote: 'One page. The plan stays on screen.',
  unitsFeeSheetShow: 'The fee schedule',
  unitsFeeSheetHide: 'Back to the plan',
  unitsFeeSheetLede: 'Every lot with its entitlement, its fee and the operating and reserve split, added to the budget’s own totals.',
  ffCertReference: 'Reference',
  ffCertIssued: 'Issued',
  ffCertDeliverBy: 'Deliver by',
  ffCertTitle: 'Form F — Certificate of payment',
  ffCertSubtitle: 'Strata Plan {plan} · lot {lot}',
  ffCertBalanceLabel: 'Balance owing at the statement date',
  ffCertOwing: 'What makes it up',
  ffCertNothing: 'No money is owing on this lot at {date}.',
  ffCertNext: 'Not yet due: {label}, {amount}, due {date}.',
  ffCertIssuedState: 'Issued',
  ffCertWithheld: 'Withheld',
  ffCertWithheldNote: 'Form F is withheld while any money is owing. It is issued when the balance reaches zero.',
  ffCertClearNote: 'The lot is clear. This certificate can be handed to a buyer’s notary.',
  ffCertSecretary: 'Secretary, Strata Plan {plan}',
  ffCertBasis: 'The balance is every charge that had fallen due on the statement date, added; the next month’s fee is printed separately and is not counted. A certificate may be delivered with Form B within seven days — by {date}.',
  ffCertFooter: 'Sample Form F for Strata Plan {plan}. Confirm the balance on the day of issue, not the day of request.',
  ffCertShow: 'Form F certificate',
  ffCertHide: 'Back to the lot',
  ffCertPrint: 'Print the certificate',
  ffCertPrintNote: 'One page. The lot’s working page stays on screen.',
  ffCertLede: 'The certificate a buyer’s notary asks for: the balance at the statement date, what makes it up, and whether Form F is issued or withheld.',
  agmNoticeTitle: 'Notice of annual general meeting',
  agmNoticeSubtitle: 'Strata Plan {plan} · {building}',
  agmNoticeIssued: 'Notice given',
  agmNoticeDueBy: 'Last lawful day',
  agmNoticeTo: 'To every owner of a lot in {corporation}',
  agmNoticeLine: 'Notice is given that the annual general meeting of the owners of {corporation} will be held as follows.',
  agmNoticeGiven: 'Notice given {date} — {days} days ahead of the meeting, inside the {window}-day window.',
  agmNoticeLate: 'Notice given {date} — {days} days ahead of the meeting, under the {window}-day window. This notice is late.',
  agmNoticeMotions: 'Motions to be put',
  agmNoticeVote: 'Vote needed: {vote}',
  agmNoticeQuorum: 'Quorum is {need} of {lots} lots, present in person or by proxy.',
  agmNoticeProxy: 'A proxy card is enclosed. It must reach the secretary by {date}.',
  agmNoticeBasis: 'The {window}-day window is the one the packet and the proxy card use. The budget motion is for the year ending {yearEnd}, the first fiscal year end after the meeting; the figures are in the budget attached to this notice.',
  agmNoticeFooter: 'Sample notice for Strata Plan {plan}. Check every date, the agenda and the motions against the bylaws before it is sent.',
  finesSheetTitle: 'Bylaw fine register',
  finesSheetSubtitle: 'Every fine on the books to {date}, from the notice to the payment.',
  finesSheetBooksTo: 'Books to',
  finesSheetCount: 'Fines',
  finesSheetBylaw: 'Bylaw',
  finesSheetNotice: 'Notice served',
  finesSheetWindow: 'Window closed',
  finesSheetHearing: 'Hearing',
  finesSheetVote: 'Vote (yes–no–abstain)',
  finesSheetPosted: 'Posted',
  finesSheetStatus: 'Status',
  finesSheetDefectWindow: 'Heard too early',
  finesSheetDefectVote: 'No majority',
  finesSheetDefectPosting: 'Not posted',
  finesSheetPaid: 'Paid',
  finesSheetUnpaidDays: 'Unpaid — {days} days',
  finesSheetOwingOf: 'of {levied} levied',
  finesSheetSummary: '{levied} levied, {paid} paid and {owing} still owing across {unpaid} lot.',
  finesSheetCeiling: 'Each fine is checked against the bylaw’s own ceiling — {rate} a day here.',
  finesSheetAbove: 'One fine is above that ceiling.',
  finesSheetDefects: '{count} fines are listed but not on the books: the process did not support them.',
  finesSheetNoDefects: 'Every fine followed its notice, its window, its vote and its posting.',
  finesSheetEmpty: 'No fine is on the books at {date}.',
  finesSheetBasis: 'The register reads the notice, hearing and posting dates the records carry, and counts a fine only when the fourteen days ran out, the vote carried and the posting followed the hearing. Payment is a date, so a payment recorded after the close leaves the fine standing at the close. The owing total is the same fine charges the receivables page ages.',
  finesSheetFooter: 'Sample fine register for Strata Plan {plan}. Not an enforcement decision and not legal advice.',
  vendorSheetTitle: "Vendor spend for the year",
  vendorSheetLede: "What each contracted vendor has been paid this year, against the budget line it is paid from — the first question a council asks of a quote.",
  vendorSheetPrint: "Print the vendor summary",
  vendorSheetPrintNote: "One Letter page. The contracts stay on screen.",
  vendorSheetSubtitle: "{vendors} contracted vendors and the {lines} budget lines no contract claims, against {year}.",
  vendorSheetBooks: "Books to",
  vendorSheetFiscal: "Fiscal year",
  vendorSheetVendor: "Vendor",
  vendorSheetLines: "Ledger line",
  vendorSheetBudget: "Annual budget",
  vendorSheetPaid: "Paid to date",
  vendorSheetLeft: "Left",
  vendorSheetShare: "Used",
  vendorSheetContracted: "Contracted vendors",
  vendorSheetUnclaimed: "{count} budget lines have no contract on the register — {budget} budgeted, {paid} paid.",
  vendorSheetTotals: "Budget {budget}, paid {paid}, difference {difference}.",
  vendorSheetBalanced: "Both columns add to the budget.",
  vendorSheetUnbalanced: "The rows do not add to the budget — the notes above say why.",
  vendorSheetOutside: "{vendor} ({service}) is paid from another fund: {amount} to date, and is not in the operating budget above.",
  vendorSheetDuplicates: "{codes} is claimed by two vendors, so it is printed with the lines no contract claims rather than paid twice.",
  vendorSheetMissing: "{codes} is claimed by a contract but no budget line carries it.",
  vendorSheetBasis: "A vendor’s spend is the books’ own year-to-date figure on the lines it is paid from, never a rate retyped from the contract note. One account belongs to one vendor: a code claimed twice is printed with the lines no contract claims and named above, so no line is paid to two suppliers. The contracted rows and that block add to the operating expense budget on both columns, which is the check at the foot of the page. Money paid from the levy trust is named separately and is not part of this budget.",
  vendorSheetFooter: "Sample vendor summary for Strata Plan {plan}. Not an audited statement and not a payment instruction.",
  accTabVendors: "Vendors",
  reserveSheetTitle: "Contingency reserve contribution",
  reserveSheetLede: "The year’s reserve contribution owner by owner, against the depreciation report’s recommendation — the sentence the AGM votes on.",
  reserveSheetPrint: "Print the contribution statement",
  reserveSheetPrintNote: "One Letter page for all forty lots.",
  reserveSheetSubtitle: "{points} points across {lots} lots, each paying its own share of the year.",
  reserveSheetReport: "Depreciation report",
  reserveSheetRecommended: "Recommended",
  reserveSheetDifference: "Gap",
  reserveSheetTotal: "All lots",
  reserveSheetGap: "The budget funds {funded} a year; the report recommends {recommended}. The gap is {gap} — {perPoint} a point a year.",
  reserveSheetReceived: "The fund has received {received} in {months} months, with {arrears} of the reserve portion still in arrears.",
  reserveSheetShortfall: "The five-year plan first runs short in {year}, by {amount}.",
  reserveSheetCovers: "The five-year plan covers every scheduled project.",
  reserveSheetBasis: "Each lot’s share is its entitlement out of the building’s points, never an equal split. The budget column is the CRF rate the budget charges, multiplied by the lot’s points and twelve months, so the rows add to the budget’s own line. The recommendation is the depreciation report’s annual figure, allocated by the same points with the remainder given out by largest fraction, so no cent is lost between rows. The fund’s receipts and arrears are the books’ own; the shortfall is the five-year reserve plan’s first year below zero.",
  accTabReserveShares: "Reserve shares",
  arrearsLetterTitle: "Your account with the strata",
  arrearsLetterLede: "The council’s ladder, addressed to the owner it is about: each charge and its age, what clears the account, the next fee and the day a plan has to be agreed.",
  arrearsLetterPrint: "Print the letter",
  arrearsLetterPrintNote: "One Letter page, addressed to the owner.",
  arrearsLetterShow: "Letter to the owner",
  arrearsLetterHide: "Back to the lot",
  arrearsLetterReference: "Reference",
  arrearsLetterSubject: "Lot {lot} · arrears at {date}",
  arrearsLetterTo: "To",
  arrearsLetterIntro: "Our records show {amount} past due on your account at {date}. The charges are set out below.",
  arrearsLetterAge: "Days late",
  arrearsLetterSchedule: "Agreed schedule",
  arrearsLetterPlan: "{amount} a month",
  arrearsLetterClearShort: "To clear",
  arrearsLetterPlanLine: "A further {balance} is being paid on an agreed schedule of {amount} a month.",
  arrearsLetterNext: "Your next fee of {amount} is due {date} and is not part of this amount.",
  arrearsLetterNone: "Nothing on your account is past due at {date}. Your next fee of {next} is due {due}.",
  arrearsLetterDeadline: "If you would like to pay this over time, contact the council by {date}. The bylaw adds a {amount} late fee on that day.",
  arrearsLetterPayTitle: "How to pay",
  arrearsLetterEtransfer: "Interac e-Transfer to {address}, with lot {lot} in the message.",
  arrearsLetterOther: "Pre-authorized debit and cheque are also accepted. Ask the treasurer for a PAD form.",
  arrearsLetterQuestions: "Questions about this letter go to the council at {email}.",
  arrearsLetterSignature: "On behalf of the council",
  arrearsLetterDated: "Dated",
  arrearsLetterBasis: "Only charges that have fallen due are asked for; the next fee is printed separately and is not part of the amount to clear. Ages are counted from each charge’s due date to the date of this letter, never from a status. A balance being paid on an agreed schedule is shown with its instalment and is left out of the arrears and the oldest age. The deadline is the day the building’s bylaw adds a late fee.",
  hearingNoticeTitle: "Notice of bylaw complaint and hearing",
  hearingNoticeSubtitle: "Strata Plan {plan} · {building}",
  hearingNoticeReference: "Reference",
  hearingNoticeServed: "Notice served",
  hearingNoticeHearing: "Hearing",
  hearingNoticeTo: "To the owner of lot {lot}",
  hearingNoticeIntro: "A written complaint about lot {lot} under bylaw {bylaw} has been received from {role}. The council will hear the complaint on the date below, and this letter is your notice of that hearing.",
  hearingNoticeReceived: "Complaint received",
  hearingNoticeWindow: "Your response window closes",
  hearingNoticeTime: "Time",
  hearingNoticePlace: "Place",
  hearingNoticeEvidence: "What the complaint is based on",
  hearingNoticeAmount: "What the bylaw allows",
  hearingNoticeMaximum: "The most the bylaw allows for the days in this notice is {amount}: {rate} a day for {days} day. No fine has been decided; the council decides at the hearing.",
  hearingNoticeLevied: "A fine of {amount} was decided on {date}.",
  hearingNoticeRights: "Your right to be heard",
  hearingNoticeRightsBody: "You may attend in person or by the video link, bring evidence and witnesses, and answer the complaint. You may also send a written response to the secretary by {date}. If you do not attend, the council may hear the complaint and decide in your absence. Ask the secretary for copies of the evidence if you do not have them.",
  hearingNoticeOutOfOrder: "This hearing is set for {hearing}, before your response window closes on {window}. It cannot proceed that day; the council has to set a new date.",
  hearingNoticeWithheld: "This notice has not been served: {reason}.",
  hearingNoticeNoEvidence: "the complaint carries no dated evidence and no days of contravention",
  hearingNoticeSequence: "the complaint is dated after this notice",
  hearingNoticeBasis: "The {window}-day response window is the fine register’s own: it starts the day the notice is served, and the register refuses a hearing held before it closes. The amount is the bylaw’s ceiling multiplied by the days the notice covers, or a fine the council has already decided — never a debt before the hearing. The complainant is described by their relationship to the building, not by name; their identity stays in the register. Nothing here is an enforcement decision.",
  hearingNoticeFooter: "Sample notice for Strata Plan {plan}. Confirm the bylaw, the dates and the service before it is delivered.",
  hearingNoticeLede: "The letter an owner receives before a bylaw hearing: the complaint, the evidence behind it, the window to answer, the hearing, and the most the bylaw allows.",
  accTabPayroll: "Payroll",
  payrollTitle: "Payroll remittance worksheet",
  payrollLede: "One month of pay worked through: what the employee takes home, what goes to the CRA on the 15th, and what the building spends, with every share checked against the lines the books post.",
  payrollPrint: "Print the worksheet",
  payrollPrintNote: "One Letter page. The payables stay on their own tab.",
  payrollSubtitle: "{period} · {employee}, {role}",
  payrollReference: "Reference",
  payrollPayHeading: "The pay",
  payrollHoursLine: "Hours worked",
  payrollGross: "Gross wages",
  payrollEiEmployee: "EI withheld",
  payrollCppEmployee: "CPP withheld",
  payrollNet: "Net pay",
  payrollRemitHeading: "The remittance",
  payrollEiEmployer: "EI — employer",
  payrollCppEmployer: "CPP — employer",
  payrollDueTotal: "Due to the CRA",
  payrollDueLine: "Due {date} — {days} days after the close.",
  payrollCostHeading: "What the building pays",
  payrollCostLine: "Wages of {wages} plus the employer’s {employer} is {amount}. The two are different numbers, and both are true.",
  payrollChecksHeading: "The checks",
  payrollAgrees: "Agrees",
  payrollDiffers: "Does not agree",
  payrollNoTax: "No income tax is withheld on this pay. The wage annualises to {annual}, and the TD1 on file is what supports nil tax at that wage; the TD1 itself stays in the employee’s file, not in these books.",
  payrollRatesLine: "Rate basis: the {year} tables.",
  payrollRatesDetail: "Employee EI {ei}, CPP {cpp} with a {exempt} exemption on this pay, and employer EI at the books’ own multiplier.",
  payrollUnconfirmed: "Employee EI {ei}, CPP {cpp} with a {exempt} exemption — the 2025 structure this pay was computed on. This worksheet cannot be filed from until the current T4127 tables confirm those figures.",
  payrollBasis: "Gross is hours times rate and net is gross less the employee’s two deductions, so neither has to be trusted. The remittance is the employee’s shares plus the employer’s, checked against the payable the books carry, and the employer’s EI is the employee’s premium times the multiplier the books use. The cost to the building is wages plus the employer’s share, which is what lines 6210 and 6215 add to. The due date is the 15th of the month after the pay date. The rate basis is the books’ own and is dated: a basis the books call unconfirmed is printed as unconfirmed.",
  payrollFooter: "Sample payroll worksheet for Strata Plan {plan}. Not a T4, not a tax filing, and not an instruction to remit.",
  accTabInsurance: "Insurance",
  insuranceTitle: "Insurance summary",
  insuranceLede: "The policy, the premium against the budget line it is paid from, both deductibles, and the two dates a council has to diarise: the appraisal and the renewal.",
  insurancePrint: "Print the summary",
  insurancePrintNote: "One Letter page. The policy documents stay with the treasurer.",
  insuranceSubtitle: "Policy {policy} · {broker} · {term}",
  insuranceTerm: "Term",
  insurancePremium: "Premium",
  insuranceMonthly: "A month",
  insuranceExpensed: "Expensed to date",
  insuranceDeductibles: "Deductibles",
  insuranceWater: "Water damage",
  insuranceQuake: "Earthquake",
  insuranceQuakeRule: "{rate} of the insured value, minimum {minimum}. These books carry no insured value, so the deductible stays a rule and not a dollar figure.",
  insuranceQuakeFigure: "At an insured value of {value} the deductible would be {amount}.",
  insuranceDates: "Dates",
  insuranceAppraisal: "Appraisal",
  insuranceRenewal: "Renewal",
  insuranceDaysAhead: "in {days} days",
  insuranceDaysPast: "{days} days ago",
  insuranceOrderOk: "The appraisal comes before the broker markets the renewal.",
  insuranceOrderOff: "The appraisal is booked after the renewal marketing starts, so the renewal would be priced off an old value.",
  insuranceTermOk: "The term ends with the fiscal year.",
  insuranceTermOff: "The term ends away from the fiscal year end, so the budget carries cover the building does not hold.",
  insurancePremiumOk: "The premium and the budget line are the same figure.",
  insurancePremiumOff: "The policy premium and the budget line disagree by {difference}.",
  insuranceAccrualOk: "{months} months of the premium — {amount} — is what the ledger carries.",
  insuranceAccrualOff: "The elapsed term and the ledger disagree by {difference}.",
  insuranceCost: "Cost per lot",
  insuranceCostLine: "{amount} a lot a month across {lots} lots, which is what the premium costs each owner before their own contents cover.",
  insuranceBasis: "The premium is the policy’s own figure and is checked against account 6100, the line that pays it; the year to date is the ledger’s, checked against an even spread of the premium across the term. The earthquake deductible is printed as the policy writes it — a percentage with a floor — and as a dollar figure only when a record carries an insured value, which these books do not. The days run from the statement date, and the appraisal is checked against the renewal marketing it has to precede.",
  insuranceFooter: "Sample insurance summary for Strata Plan {plan}. Not a certificate of insurance and not a coverage opinion.",
  arrearsLetterFooter: "Sample letter for Strata Plan {plan}. Not a legal notice and not a demand; check it against the bylaws and your own records before it is sent.",
  levyLetterShow: "Levy letter",
  levyLetterHide: "Back to the lot",
  levyLetterPrint: "Print the levy letter",
  levyLetterTitle: "Your share of the special levy",
  levyLetterSubtitle: "Strata Plan {plan} · a levy of {amount}",
  levyLetterTo: "To the owner of lot {lot}",
  levyLetterIntro: "The owners assessed {amount} at the special general meeting of {approved} for {project}. Your share is {share}, being your entitlement at the resolution's rate.",
  levyLetterShare: "Your share",
  levyLetterAsk: "This letter asks for",
  levyLetterPlanLine: "Your agreed schedule is {amount} a month. This letter does not change it, and at that rate the balance is worked down in {months} months.",
  levyLetterDays: "The levy became payable on {date}, {days} days before this letter.",
  levyLetterDeadline: "If the balance cannot be paid, write to the council before {date}, when it meets to consider a schedule.",
  levyLetterNoDeadline: "No council meeting is booked, so this letter sets no date for a plan.",
  levyLetterTrust: "The levy trust at this date",
  levyLetterTrustLine: "Assessed {assessed}; collected {collected}; paid to the contractor {paid}. Cash in the trust {cash}; work left {remaining}.",
  levyLetterTrustGap: "The trust does not balance: cash plus what owners owe differs from the assessment less the contract by {difference}.",
  levyLetterNote: "No interest is charged: the books record none. A lien is a council decision, and nothing here threatens one.",
  levyLetterFooter: "Strata Plan {plan} · special levy statement",
  insuranceNoticeShow: "Insurance notice",
  insuranceNoticeHide: "Back to the lot",
  insuranceNoticePrint: "Print the notice",
  insuranceNoticeTitle: "What the strata insures, and what you insure",
  insuranceNoticeSubtitle: "Strata Plan {plan} · policy {policy}",
  insuranceNoticeTo: "To the owner of lot {lot}",
  insuranceNoticeIntro: "This is the building's policy with {broker}, policy {policy}, as the records hold it on {date}. It sets out the two sides of the cover; it is not your own policy.",
  insuranceNoticeStrata: "The strata insures",
  insuranceNoticeOwner: "You insure",
  insuranceNoticeDeductibles: "Deductibles",
  insuranceNoticeDeductibleBody: "Water: {water}. Earthquake: {rate} of the insured value, with a floor of {minimum}.",
  insuranceNoticeQuakeNoValue: "These books carry no insured value, so the earthquake figure cannot be stated in dollars.",
  insuranceNoticeCharge: "A bylaw on file makes an owner responsible for the corporation's deductible. Ask the secretary how it is applied before you rely on this page.",
  insuranceNoticeNoCharge: "No bylaw on file charges the corporation's deductible to an owner, so this notice asks you for neither deductible.",
  insuranceNoticeTerm: "The policy runs {start} to {end}, with {days} days of cover left at this date.",
  insuranceNoticeExpired: "The policy term ended on {date}. This notice cannot confirm cover on its own date.",
  insuranceNoticeNote: "The records behind this notice are the policy, its term and the insurance bylaw. Nothing here is a certificate of insurance or a coverage opinion.",
  insuranceNoticeFooter: "Strata Plan {plan} · insurance notice",
  minutesLede: "The one page a lawyer, an adjudicator or a buyer's notary asks for: the vote as cast, what was imposed, and what the lot's account carries.",
  minutesShow: "Minute extract",
  minutesHide: "Back to the packet",
  minutesPrint: "Print the extract",
  minutesPrintNote: "One page, from the fine register and the minutes.",
  minutesDocTitle: "Extract from the minutes — bylaw hearing",
  minutesDocSubtitle: "Council meeting of {date} · Strata Plan {plan}",
  minutesChair: "Chair",
  minutesPresentLabel: "Members present",
  minutesPresent: "{present} of {seats} members, against a quorum of {quorum}.",
  minutesDecision: "What was decided",
  minutesCarried: "The motion carried {yes}–{no}, with {abstain} abstaining. A majority is yes over no, so abstentions are not counted.",
  minutesFailed: "The motion did not carry — {yes}–{no}, with {abstain} abstaining. No fine was imposed.",
  minutesNoQuorum: "The vote was taken without quorum: {present} of {seats} members present, {need} needed. Nothing was decided.",
  minutesNotHeard: "This meeting is dated before the hearing, so there is no minute of a decision.",
  minutesProcess: "The fine register finds the process out of order — {defect} — so nothing is recorded here as imposed.",
  minutesFine: "A fine of {amount} under {bylaw} was posted to lot {lot} on {date}.",
  minutesOwing: "{amount} remains on lot {lot}'s account at {date}, so Form F is withheld.",
  minutesOwingNone: "Nothing remains on lot {lot}'s account at {date}, so Form F can be issued.",
  minutesNote: "The vote, the dates and the amount are the fine register's own; the meeting, the chair and the quorum are the minutes'. The full minutes govern, and this page quotes them.",
  minutesFooter: "Strata Plan {plan} · extract from the minutes. Not the minutes themselves.",
  renewalCalShow: "Renewals ahead",
  renewalCalHide: "Back to the year",
  renewalCalPrint: "Print the renewals",
  renewalCalPrintNote: "One Letter page. The year calendar stays on screen.",
  renewalCalLede: "The next twelve months of contracts, the insurance dates and the one appraisal the renewal depends on, with the days each has left and the line that pays it.",
  renewalCalTitle: "Renewals in the next twelve months",
  renewalCalSubtitle: "Strata Plan {plan} · {from} to {to}",
  renewalCalSummary: "{renewals} renewals and {steps} dated steps fall inside twelve months.",
  renewalCalNext: " The next is {vendor}, in {days} days.",
  renewalCalColDays: "Left",
  renewalCalColVendor: "Vendor",
  renewalCalColService: "What falls due",
  renewalCalColLine: "Paid from",
  renewalCalToday: "Today",
  renewalCalTomorrow: "Tomorrow",
  renewalCalDays: "{days} days",
  renewalCalStepTag: "Step",
  renewalCalContinuing: "No day in the register",
  renewalCalContinuingNote: "These renew without a date — month to month, each fiscal year, or while a file or a project stays open. They are not counted down, because a day nobody wrote down would be this page's invention.",
  renewalCalUnfunded: "No line",
  renewalCalPassed: "Already gone by: {rows}. A renewal still listed after its day is a register nobody updated.",
  renewalCalNote: "Every date here is the register's own. A day that has passed is not a countdown, a step is not a renewal, and no account has been guessed: where the register names no line, the row says so.",
  renewalCalFooter: "Strata Plan {plan} · renewal calendar",
  lienStatusShow: "Lien status",
  lienStatusHide: "Back to the lot",
  lienStatusPrint: "Print the lien file",
  lienStatusPrintNote: "One Letter page for the lawyer, the notary or the owner.",
  lienStatusTitle: "Lien status",
  lienStatusSubtitle: "Strata Plan {plan} · lot {lot} · the file in the order it happened",
  lienStatusTo: "To the owner of lot {lot}",
  lienStatusSummary: "The demand of {date} asked for {amount}, and {days} days have passed.",
  lienStatusRegistered: " A lien was registered against the title on {date}.",
  lienStatusVotedFile: " Council voted to file, and no registration has been recorded yet.",
  lienStatusVotedDecline: " Council voted against filing, so nothing was registered.",
  lienStatusNotVoted: " Council has not voted, so no lien is registered against the title.",
  lienStatusAmountHeading: "What a lien would secure",
  lnColFees: "Strata fees that have fallen due",
  lnColLate: "Late fees",
  lnColLevy: "Special levy",
  lienStatusNotDue: "{amount} of the lot's balance is the next fee, dated {date}. It is not part of this total.",
  lienStatusStepsHeading: "The file, in order",
  lienStatusColStep: "Step",
  lienStatusColState: "State",
  lienStatusStepDemand: "Demand letter",
  lienStatusStepOpinion: "Lawyer directed to draft an opinion",
  lienStatusStepVote: "Council vote",
  lienStatusStepRegistration: "Registration at the land title office",
  lienStatusDone: "Done",
  lienStatusAheadIn: "In {days} days",
  lienStatusWaiting: "Waiting",
  lienStatusVoteRule: "Council has {seats} seats and needs {quorum} for quorum. No three-quarters vote is required to start a lien once the amount is owing; this council promised itself a recorded vote, and that vote is the gate.",
  lienStatusEffectHeading: "What a lien does",
  lienStatusEffect: "A lien registers against the title and has to be discharged before the title can clear, so a buyer's notary sees it before a sale completes.",
  lienStatusFormF: "Form F is withheld at this date.",
  lienStatusLegal: "Legal spend to date {spent}, against a {budget} budget line. No interest is charged, and these books record no registry fee or recoverable cost, so this page adds none to the amount.",
  lienStatusNote: "This is the status of a decision that has not been taken. It is not a demand, and nothing here is filed: the vote is on the agenda, and a registration would be a separate step with its own date.",
  lienStatusFooter: "Strata Plan {plan} · lien file, status only",
  fkLettersShow: "Reminder letters",
  fkLettersHide: "Back to the register",
  fkLettersPrint: "Print the letters",
  fkLettersPrintNote: "One Letter page per lot.",
  fkLettersCover: "{letters} letters print for the {gaps} gaps in the register.",
  fkLettersHeld: " Held out: lot {lots} — a short-term stay has no tenancy to acknowledge, and the bylaw file is its record.",
  fkLetterTitle: "Form K reminder",
  fkLetterSubject: "Lot {lot} · tenant's acknowledgement of the bylaws",
  fkLetterTo: "To the owner of lot {lot}",
  fkLetterBylaw: "Bylaw 2 requires a Form K within {days} days of a tenancy starting. The form is the tenant's acknowledgement that they have been given the bylaws, and the owner stays responsible for the tenancy.",
  fkLetterDates: "{tenant} moved in on {since}. The window closed on {closes}, {days} days before this letter, and no Form K is on file for this lot.",
  fkLetterTenantUnknown: "the tenant of record",
  fkLetterWhyHeading: "Why the form is asked for",
  fkLetterWhy: "The register on this lot's page is what the council reads when it is asked whether a tenancy is on file, and it is one of the three things the building's compliance score counts. A missing form is a gap in the record, not a finding against you.",
  fkLetterNoFine: "This letter imposes no fine. The $200 a day in bylaw 9.2 attaches to a stay under thirty days, not to a late Form K, and no other bylaw here sets a penalty for this.",
  fkLetterMeeting: "Council will have this register at its meeting on {date}, {days} days from now.",
  fkLetterNoMeeting: "No council meeting is booked, so this letter sets no date.",
  fkLetterAsk: "Send the signed form to the secretary at the address above. When it arrives, the lot's page records the day it was filed, and the gap closes from that day.",
  fkLetterNote: "The dates on this letter are the register's own: the tenancy start, the close of the fourteen-day window and the days since. The tenant's name comes from the lot's record, and nothing else about the tenancy is printed.",
  fkLetterFooter: "Strata Plan {plan} · Form K reminder",
};

// Locale chunks load only when selected. English is the prerendered and
// failure fallback; a cancelled load cannot replace a newer selection.
const loaders = {
  fr: () => import('./locales/fr'), es: () => import('./locales/es'),
  zh: () => import('./locales/zh'), hi: () => import('./locales/hi'),
  fil: () => import('./locales/fil'), pl: () => import('./locales/pl'),
  uk: () => import('./locales/uk'), sw: () => import('./locales/sw')
};
let initialLocale: LocaleCode = 'en';
if (browser) {
  try {
    const saved = localStorage.getItem('openstrata-locale');
    if (locales.some((item) => item.code === saved)) initialLocale = saved as LocaleCode;
  } catch { /* storage is optional */ }
}
export const locale = writable<LocaleCode>(initialLocale);
export const copy = derived(locale, ($locale, set) => {
  if ($locale === 'en') { set(english); return; }
  let current = true;
  set(english);
  loaders[$locale]().then(({ default: values }) => {
    if (current) set({ ...english, ...values });
  }).catch((error) => {
    console.error(`Could not load locale ${$locale}`, error);
  });
  return () => { current = false; };
}, english);

const intlLocales: Record<LocaleCode, string> = {
  en: 'en-CA',
  fr: 'fr-CA',
  es: 'es-419',
  zh: 'zh-CN',
  hi: 'hi-IN',
  fil: 'fil-PH',
  pl: 'pl-PL',
  uk: 'uk-UA',
  sw: 'sw-KE'
};

export function formatNumber(value: number, localeCode: LocaleCode = 'en', options: Intl.NumberFormatOptions = {}) {
  return new Intl.NumberFormat(intlLocales[localeCode], options).format(value);
}

export function formatCurrency(value: number, localeCode: LocaleCode = 'en', options: Intl.NumberFormatOptions = {}) {
  return formatNumber(value, localeCode, { style: 'currency', currency: 'CAD', ...options });
}

export function formatDate(value: string | Date, localeCode: LocaleCode = 'en', options: Intl.DateTimeFormatOptions = {}) {
  // A bare `YYYY-MM-DD` is a calendar day, not an instant. `new Date('2026-09-30')`
  // is UTC midnight, which any zone west of UTC renders as the day before, so the
  // day string is anchored at noon UTC instead: no reader loses a day either way.
  const isDay = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = isDay ? new Date(`${value}T12:00:00Z`) : new Date(value);
  return new Intl.DateTimeFormat(intlLocales[localeCode], options).format(date);
}

/**
 * Fill the `{name}` placeholders a catalog string carries.
 *
 * Copy with figures in it lives in the catalog as one translatable sentence with
 * named slots (`{amount}`, `{date}`), and the caller supplies the values. A slot
 * with no value is left exactly as written rather than becoming `undefined`: a
 * missing translation is a visible placeholder, not a silent blank.
 */
export function fill(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match
  );
}

if (browser) locale.subscribe((value) => {
  try { localStorage.setItem('openstrata-locale', value); } catch { /* storage is optional */ }
});
