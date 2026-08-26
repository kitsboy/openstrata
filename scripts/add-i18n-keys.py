#!/usr/bin/env python3
"""Add the Batch 1-4 GUI/Bitcoin i18n keys to every locale block + the type."""
import re, sys

path = 'src/lib/i18n.ts'
src = open(path).read()

# key -> (en, fr, es, zh, hi, fil, pl, uk, sw)
KEYS = {
  'checkoutTitle': ('Pay fees', 'Payer les frais', 'Pagar cuotas', '缴纳费用', 'शुल्क का भुगतान करें', 'Magbayad ng bayarin', 'Opłać opłaty', 'Сплатити внески', 'Lipa ada'),
  'checkoutHint': ('Quote a fee payment on any rail, then confirm.', 'Obtenez un devis sur n’importe quel rail, puis confirmez.', 'Cotiza un pago en cualquier rail y confirma.', '在任意通道获取费用报价，然后确认。', 'किसी भी रेल पर शुल्क उद्धरण लें, फिर पुष्टि करें।', 'Kumuha ng quote sa anumang rail, pagkatapos kumpirmahin.', 'Uzyskaj wycenę na dowolnym torze, a następnie potwierdź.', 'Отримайте котирування на будь-якому рейлі, потім підтвердьте.', 'Pata quote ya malipo kwenye reli yoyote, kisha thibitisha.'),
  'checkoutAmount': ('Amount (CAD)', 'Montant (CAD)', 'Monto (CAD)', '金额（加元）', 'राशि (CAD)', 'Halaga (CAD)', 'Kwota (CAD)', 'Сума (CAD)', 'Kiasi (CAD)'),
  'checkoutRail': ('Payment rail', 'Rail de paiement', 'Rail de pago', '支付通道', 'भुगतान रेल', 'Rail ng pagbabayad', 'Tor płatności', 'Платіжний рейл', 'Reli ya malipo'),
  'checkoutGetQuote': ('Get quote', 'Obtenir un devis', 'Obtener cotización', '获取报价', 'उद्धरण लें', 'Kumuha ng quote', 'Uzyskaj wycenę', 'Отримати котирування', 'Pata quote'),
  'checkoutConfirm': ('Confirm payment', 'Confirmer le paiement', 'Confirmar pago', '确认付款', 'भुगतान की पुष्टि करें', 'Kumpirmahin ang pagbabayad', 'Potwierdź płatność', 'Підтвердити платіж', 'Thibitisha malipo'),
  'checkoutPaid': ('Payment confirmed', 'Paiement confirmé', 'Pago confirmado', '付款已确认', 'भुगतान की पुष्टि हो गई', 'Kinumpirma ang pagbabayad', 'Płatność potwierdzona', 'Платіж підтверджено', 'Malipo yamethibitishwa'),
  'checkoutQuoteHint': ('The quote locks the rate and reference code.', 'Le devis verrouille le taux et le code de référence.', 'La cotización fija la tasa y el código de referencia.', '报价锁定汇率和参考代码。', 'उद्धरण दर और संदर्भ कोड को लॉक करता है।', 'Ina-lock ng quote ang rate at reference code.', 'Wycena blokuje kurs i kod referencyjny.', 'Котирування фіксує курс і код посилання.', 'Quote inafunga kiwango na msimbo wa marejeleo.'),
  'receiptTxid': ('Transaction', 'Transaction', 'Transacción', '交易', 'लेन-देन', 'Transaksyon', 'Transakcja', 'Транзакція', 'Muamala'),
  'receiptSats': ('Sats locked', 'Sats verrouillés', 'Sats fijados', '锁定的聪', 'लॉक किए गए सैट्स', 'Mga sats na naka-lock', 'Zablokowane satsy', 'Заблоковано сатів', 'Sats zimefungwa'),
  'receiptRate': ('Rate locked', 'Taux verrouillé', 'Tasa fijada', '锁定的汇率', 'लॉक की गई दर', 'Na-lock na rate', 'Zablokowany kurs', 'Заблокований курс', 'Kiwango kimefungwa'),
  'receiptStamp': ('Satohash proof', 'Preuve Satohash', 'Prueba Satohash', 'Satohash 证明', 'Satohash प्रमाण', 'Patunay ng Satohash', 'Dowód Satohash', 'Доказ Satohash', 'Uthibitisho wa Satohash'),
  'receiptCopy': ('Copy invoice', 'Copier la facture', 'Copiar factura', '复制发票', 'इनवॉइस कॉपी करें', 'Kopyahin ang invoice', 'Skopiuj fakturę', 'Скопіювати рахунок', 'Nakili ankara'),
  'monthlyCloseTitle': ('Run the month', 'Clôture du mois', 'Cierre mensual', '月度结算', 'माह चलाएँ', 'Isagawa ang buwan', 'Zamknij miesiąc', 'Закрити місяць', 'Funga mwezi'),
  'monthlyCloseHint': ('Billing → late notices → reconcile, one guided close.', 'Facturation → avis de retard → rapprochement.', 'Facturación → avisos de mora → conciliación.', '账单 → 逾期通知 → 对账，一次完成。', 'बिलिंग → विलंब सूचना → समाधान।', 'Billing → mga abiso sa huli → pagkakasundo.', 'Fakturowanie → wezwania → uzgodnienie.', 'Виставлення рахунків → повідомлення → звірка.', 'Billing → notisi za kuchelewa → upatanisho.'),
  'monthlyClosePeriod': ('Period', 'Période', 'Período', '期间', 'अवधि', 'Panahon', 'Okres', 'Період', 'Kipindi'),
  'monthlyCloseRun': ('Run billing cycle', 'Lancer le cycle de facturation', 'Ejecutar ciclo de facturación', '运行计费周期', 'बिलिंग चक्र चलाएँ', 'Patakbuhin ang cycle ng billing', 'Uruchom cykl fakturowania', 'Запустити цикл виставлення рахунків', 'Endesha mzunguko wa billing'),
  'monthlyCloseCharged': ('Total charged', 'Total facturé', 'Total cobrado', '收费总额', 'कुल शुल्क', 'Kabuuang sinisingil', 'Łącznie naliczono', 'Всього нараховано', 'Jumla inayotozwa'),
  'monthlyCloseNotices': ('Late notices', 'Avis de retard', 'Avisos de mora', '逾期通知', 'विलंब सूचनाएँ', 'Mga abiso sa pagkahuli', 'Wezwania do zapłaty', 'Повідомлення про прострочення', 'Notisi za kuchelewa'),
  'monthlyCloseNone': ('No late notices this cycle', 'Aucun avis de retard ce cycle', 'Sin avisos de mora este ciclo', '本期无逾期通知', 'इस चक्र में कोई विलंब सूचना नहीं', 'Walang abiso ng pagkahuli sa cycle na ito', 'Brak wezwań w tym cyklu', 'Немає прострочень цього циклу', 'Hakuna notisi za kuchelewa mzunguko huu'),
  'monthlyCloseDone': ('Cycle posted to the ledger', 'Cycle publié au grand livre', 'Ciclo registrado en el libro mayor', '周期已记入账本', 'चक्र लेजर में दर्ज हुआ', 'Nai-post ang cycle sa ledger', 'Cykl zaksięgowany', 'Цикл опубліковано в реєстрі', 'Mzunguko umewekwa kwenye leja'),
  'bylawCaseTitle': ('Bylaw enforcement case', 'Cas d’application des règlements', 'Caso de aplicación de reglamentos', '附例执行案件', 'उपनियम प्रवर्तन मामला', 'Kaso ng pagpapatupad ng bylaw', 'Sprawa egzekucji regulaminu', 'Справа про порушення статуту', 'Kesi ya utekelezaji wa sheria ndogo'),
  'bylawCaseHint': ('Complaint → notice → review lock → decision.', 'Plainte → avis → verrou d’examen → décision.', 'Queja → aviso → bloqueo de revisión → decisión.', '投诉 → 通知 → 审查锁定 → 决定。', 'शिकायत → सूचना → समीक्षा लॉक → निर्णय।', 'Reklamo → abiso → lock ng pagsusuri → desisyon.', 'Skarga → wezwanie → blokada przeglądu → decyzja.', 'Скарга → повідомлення → блокування → рішення.', 'Malalamiko → notisi → kufuli la uhakiki → uamuzi.'),
  'bylawCaseNew': ('New complaint', 'Nouvelle plainte', 'Nueva queja', '新投诉', 'नई शिकायत', 'Bagong reklamo', 'Nowa skarga', 'Нова скарга', 'Malalamiko mapya'),
  'bylawCaseEvidence': ('Evidence attached', 'Preuves jointes', 'Evidencia adjunta', '已附证据', 'साक्ष्य संलग्न', 'Nakalakip na ebidensya', 'Dowody dołączone', 'Докази додано', 'Ushahidi umeambatanishwa'),
  'bylawCaseSubmit': ('File complaint', 'Déposer la plainte', 'Presentar queja', '提交投诉', 'शिकायत दर्ज करें', 'Maghain ng reklamo', 'Złóż skargę', 'Подати скаргу', 'Wasilisha malalamiko'),
  'bylawCaseNotice': ('Issue notice', 'Émettre l’avis', 'Emitir aviso', '发出通知', 'सूचना जारी करें', 'Maglabas ng abiso', 'Wydaj wezwanie', 'Видати повідомлення', 'Toa notisi'),
  'bylawCaseLock': ('Review window — fine actions locked', 'Fenêtre d’examen — amendes bloquées', 'Ventana de revisión — multas bloqueadas', '审查期 — 罚款已锁定', 'समीक्षा अवधि — जुर्माना लॉक', 'Window ng pagsusuri — naka-lock ang multa', 'Okno przeglądu — kary zablokowane', 'Вікно перегляду — штрафи заблоковано', 'Dirisha la uhakiki — faini zimefungwa'),
  'bylawCaseUnlocked': ('Review window passed — decision allowed', 'Fenêtre passée — décision possible', 'Ventana pasada — decisión permitida', '审查期已过 — 允许决定', 'समीक्षा अवधि समाप्त — निर्णय संभव', 'Lumipas ang window — pinapayagan ang desisyon', 'Okno minęło — decyzja możliwa', 'Вікно минуло — рішення дозволено', 'Dirisha limepita — uamuzi unaruhusiwa'),
  'bylawCaseFine': ('Impose fine', 'Imposer une amende', 'Imponer multa', '处以罚款', 'जुर्माना लगाएँ', 'Magpataw ng multa', 'Nałóż karę', 'Накласти штраф', 'Weka faini'),
  'bylawCaseNoFine': ('No fine', 'Pas d’amende', 'Sin multa', '不罚款', 'कोई जुर्माना नहीं', 'Walang multa', 'Bez kary', 'Без штрафу', 'Hakuna faini'),
  'bylawCaseMinutes': ('Council minutes ref', 'Réf. procès-verbal du conseil', 'Ref. acta del consejo', '理事会纪要编号', 'परिषद कार्यवृत्त संदर्भ', 'Ref ng minuto ng konseho', 'Ref. protokołu rady', 'Посилання на протокол ради', 'Ref ya kumbukumbu ya baraza'),
  'bylawCaseState': ('Case status', 'État du dossier', 'Estado del caso', '案件状态', 'मामले की स्थिति', 'Katayuan ng kaso', 'Status sprawy', 'Статус справи', 'Hali ya kesi'),
  'membersTitle': ('Member workspace', 'Espace membres', 'Espacio de miembros', '成员工作区', 'सदस्य कार्यक्षेत्र', 'Workspace ng mga miyembro', 'Obszar członków', 'Робочий простір членів', 'Nafasi ya wanachama'),
  'membersHint': ('Owners per lot — trace unit → payments → forms.', 'Propriétaires par lot — tracez unité → paiements → formulaires.', 'Propietarios por lote — trace unidad → pagos → formularios.', '每套业主 — 追踪单元 → 付款 → 表格。', 'प्रति लॉट मालिक — इकाई → भुगतान → फॉर्म।', 'Mga may-ari bawat lote — sundan unit → bayad → form.', 'Właściciele na lokal — śledź jednostkę → płatności → formularze.', 'Власники на лот — прослідкуйте одиницю → платежі → форми.', 'Wamiliki kwa kila loti — fuatilia unit → malipo → fomu.'),
  'membersAdd': ('Add member', 'Ajouter un membre', 'Añadir miembro', '添加成员', 'सदस्य जोड़ें', 'Magdagdag ng miyembro', 'Dodaj członka', 'Додати члена', 'Ongeza mwanachama'),
  'membersEmail': ('Email', 'Courriel', 'Correo', '邮箱', 'ईमेल', 'Email', 'E-mail', 'Ел. пошта', 'Barua pepe'),
  'membersRole': ('Role', 'Rôle', 'Rol', '角色', 'भूमिका', 'Tungkulin', 'Rola', 'Роль', 'Jukumu'),
  'membersEmpty': ('No members yet — add the first owner.', 'Aucun membre — ajoutez le premier propriétaire.', 'Sin miembros — añade al primer propietario.', '暂无成员 — 添加第一位业主。', 'अभी कोई सदस्य नहीं — पहला मालिक जोड़ें।', 'Wala pang miyembro — idagdag ang unang may-ari.', 'Brak członków — dodaj pierwszego właściciela.', 'Немає членів — додайте першого власника.', 'Hakuna wanachama bado — ongeza mmiliki wa kwanza.'),
  'deadlinesTitle': ('What’s due', 'Échéances', 'Qué vence', '待办事项', 'क्या बकाया है', 'Ano ang dapat bayaran', 'Co zalega', 'Що на черзі', 'Nini kinachodaiwa'),
  'deadlinesHint': ('Statutory calendar + open quotes for this council.', 'Calendrier légal + devis ouverts de ce conseil.', 'Calendario legal + cotizaciones abiertas.', '法定日历 + 本理事会的开放报价。', 'वैधानिक कैलेंडर + इस परिषद के खुले उद्धरण।', 'Kalendaryo ng batas + mga bukas na quote para sa konsehong ito.', 'Kalendarz ustawowy + otwarte wyceny.', 'Статутний календар + відкриті котирування.', 'Kalenda ya kisheria + quotes wazi za baraza hili.'),
  'deadlinesOverdue': ('Overdue', 'En retard', 'Vencido', '已逾期', 'अतिदेय', 'Huli na', 'Zaległe', 'Прострочено', 'Imechelewa'),
  'deadlinesDays': ('days', 'jours', 'días', '天', 'दिन', 'araw', 'dni', 'днів', 'siku'),
  'deadlinesEmpty': ('Nothing due right now.', 'Rien à échéance pour l’instant.', 'Nada vence ahora mismo.', '当前没有到期事项。', 'अभी कुछ बकाया नहीं।', 'Wala pang dapat bayaran ngayon.', 'Nic nie zalega.', 'Нічого на черзі.', 'Hakuna kinachodaiwa sasa.'),
  'railsTitle': ('Sovereign rails', 'Rails souverains', 'Rails soberanos', '自主通道', 'सॉवरेन रेल्स', 'Mga sovereign rail', 'Suwerenne tory', 'Суверенні рейли', 'Reli huru'),
  'railsHint': ('Enabled rails, node status, and the live CAD/BTC rate.', 'Rails activés, état des nœuds, taux CAD/BTC en direct.', 'Rails activos, estado de nodos y tasa CAD/BTC en vivo.', '已启用通道、节点状态和实时加元/比特币汇率。', 'सक्षम रेल्स, नोड स्थिति, लाइव CAD/BTC दर।', 'Mga aktibong rail, estado ng node, live na CAD/BTC.', 'Aktywne tory, status węzłów, kurs CAD/BTC.', 'Увімкнені рейли, стан вузлів, курс CAD/BTC.', 'Reli zilizowezeshwa, hali ya node, kiwango cha moja kwa moja cha CAD/BTC.'),
  'railsAsOf': ('as of', 'en date du', 'a partir de', '截至', 'अनुसार', 'mula noong', 'na dzień', 'станом на', 'kufikia'),
  'railsNode': ('Node', 'Nœud', 'Nodo', '节点', 'नोड', 'Node', 'Węzeł', 'Вузол', 'Node'),
  'railsNotConnected': ('Host pending — rails configured, not connected.', 'Hôte en attente — rails configurés, non connectés.', 'Host pendiente — rails configurados, no conectados.', '主机待定 — 通道已配置，未连接。', 'होस्ट लंबित — रेल्स कॉन्फ़िगर, जुड़ी नहीं।', 'Nakabinbin ang host — naka-configure ang rails, hindi pa konektado.', 'Host w przygotowaniu — tory skonfigurowane, niepodłączone.', 'Хост очікує — рейли налаштовані, не підключені.', 'Host inasubiri — reli zimesanidiwa, hazijaunganishwa.'),
  'signingTitle': ('Multisig signing room', 'Salle de signature multisig', 'Sala de firma multisig', '多签签名室', 'मल्टीसिग हस्ताक्षर कक्ष', 'Silid ng pagpirma ng multisig', 'Pokój podpisywania multisig', 'Кімната підписання multisig', 'Chumba cha kusaini multisig'),
  'signingHint': ('Pending PSBTs, signature progress, broadcast when ready.', 'PSBT en attente, progression des signatures.', 'PSBT pendientes, progreso de firmas.', '待处理 PSBT、签名进度、就绪后广播。', 'लंबित PSBT, हस्ताक्षर प्रगति, तैयार होने पर प्रसारण।', 'Mga nakabinbing PSBT, progreso ng pirma, i-broadcast kapag handa.', 'Oczekujące PSBT, postęp podpisów, transmisja gdy gotowe.', 'Очікувані PSBT, прогрес підписів, трансляція.', 'PSBT zinazosubiri, maendeleo ya sahihi, tangaza zikishatayarishwa.'),
  'signingRequired': ('required', 'requis', 'requeridas', '需要', 'आवश्यक', 'kailangan', 'wymagane', 'потрібно', 'inahitajika'),
  'signingBroadcast': ('Broadcast', 'Diffuser', 'Transmitir', '广播', 'प्रसारण', 'I-broadcast', 'Transmisja', 'Трансляція', 'Tangaza'),
  'signingEmpty': ('No pending transactions.', 'Aucune transaction en attente.', 'Sin transacciones pendientes.', '无待处理交易。', 'कोई लंबित लेन-देन नहीं।', 'Walang nakabinbing transaksyon.', 'Brak oczekujących transakcji.', 'Немає очікуваних транзакцій.', 'Hakuna miamala inayosubiri.'),
  'signingReady': ('Ready to broadcast', 'Prêt à diffuser', 'Listo para transmitir', '可以广播', 'प्रसारण के लिए तैयार', 'Handa nang i-broadcast', 'Gotowy do transmisji', 'Готово до трансляції', 'Tayari kutangaza'),
  'signingScan': ('Scan with hardware wallet', 'Scanner avec le portefeuille matériel', 'Escanear con cartera de hardware', '用硬件钱包扫描', 'हार्डवेयर वॉलेट से स्कैन करें', 'I-scan gamit ang hardware wallet', 'Zeskanuj portfelem sprzętowym', 'Сканувати апаратним гаманцем', 'Changanua kwa pochi ya vifaa'),
  'walletTitle': ('Wallet & addresses', 'Portefeuille et adresses', 'Cartera y direcciones', '钱包和地址', 'वॉलेट और पते', 'Wallet at mga address', 'Portfel i adresy', 'Гаманець та адреси', 'Pochi na anwani'),
  'walletHint': ('Registered xpub + per-unit receive addresses.', 'Xpub enregistré + adresses par unité.', 'Xpub registrado + direcciones por unidad.', '已注册 xpub + 每套收款地址。', 'पंजीकृत xpub + प्रति-इकाई प्राप्ति पते।', 'Nakarehistrong xpub + mga address ng pagtanggap bawat unit.', 'Zarejestrowany xpub + adresy odbioru.', 'Зареєстрований xpub + адреси прийому.', 'Xpub iliyosajiliwa + anwani za kupokea kwa kila unit.'),
  'walletAddresses': ('Receive addresses', 'Adresses de réception', 'Direcciones de recepción', '收款地址', 'प्राप्ति पते', 'Mga address ng pagtanggap', 'Adresy odbioru', 'Адреси отримання', 'Anwani za kupokea'),
  'walletCopy': ('Copy', 'Copier', 'Copiar', '复制', 'कॉपी करें', 'Kopyahin', 'Kopiuj', 'Копіювати', 'Nakili'),
  'walletCopied': ('Copied', 'Copié', 'Copiado', '已复制', 'कॉपी हुआ', 'Nakopya', 'Skopiowano', 'Скопійовано', 'Imenakiliwa'),
  'walletExplorer': ('View on mempool.space', 'Voir sur mempool.space', 'Ver en mempool.space', '在 mempool.space 查看', 'mempool.space पर देखें', 'Tingnan sa mempool.space', 'Zobacz na mempool.space', 'Переглянути на mempool.space', 'Tazama kwenye mempool.space'),
  'walletNone': ('Register an xpub to derive receive addresses.', 'Enregistrez un xpub pour dériver les adresses.', 'Registra un xpub para derivar direcciones.', '注册 xpub 以派生收款地址。', 'प्राप्ति पते निकालने के लिए xpub पंजीकृत करें।', 'Magrehistro ng xpub para makakuha ng mga address.', 'Zarejestruj xpub, aby wyprowadzić adresy.', 'Зареєструйте xpub для отримання адрес.', 'Sajili xpub kupata anwani.'),
  'ledgerTitle': ('Ledger explorer', 'Explorateur du grand livre', 'Explorador del libro mayor', '账本浏览器', 'लेजर एक्सप्लोरर', 'Explorer ng ledger', 'Przeglądarka rejestru', 'Оглядач реєстру', 'Kichunguzi cha leja'),
  'ledgerHint': ('Browse the verified hash chain per fund.', 'Parcourez la chaîne de hachage vérifiée par fonds.', 'Explora la cadena de hash verificada por fondo.', '按基金浏览已验证的哈希链。', 'प्रति फंड सत्यापित हैश चेन ब्राउज़ करें।', 'I-browse ang na-verify na hash chain bawat fund.', 'Przeglądaj zweryfikowany łańcuch skrótów.', 'Перегляньте перевірений ланцюг хешів.', 'Vinjari mnyororo wa hashi uliothibitishwa kwa kila mfuko.'),
  'ledgerVerify': ('Verify chain', 'Vérifier la chaîne', 'Verificar cadena', '验证链', 'चेन सत्यापित करें', 'I-verify ang chain', 'Zweryfikuj łańcuch', 'Перевірити ланцюг', 'Thibitisha mnyororo'),
  'ledgerVerified': ('Chain verified ✓', 'Chaîne vérifiée ✓', 'Cadena verificada ✓', '链已验证 ✓', 'चेन सत्यापित ✓', 'Na-verify ang chain ✓', 'Łańcuch zweryfikowany ✓', 'Ланцюг перевірено ✓', 'Mnyororo umethibitishwa ✓'),
  'ledgerCsv': ('Export CSV', 'Exporter CSV', 'Exportar CSV', '导出 CSV', 'CSV निर्यात करें', 'I-export ang CSV', 'Eksportuj CSV', 'Експорт CSV', 'Hamisha CSV'),
  'ledgerEmpty': ('No entries in this fund yet.', 'Aucune entrée dans ce fonds.', 'Sin entradas en este fondo.', '该基金暂无记录。', 'इस फंड में अभी कोई प्रविष्टि नहीं।', 'Wala pang entry sa fund na ito.', 'Brak wpisów w tym funduszu.', 'Немає записів у цьому фонді.', 'Hakuna maingizo katika mfuko huu bado.'),
  'exportTitle': ('Export center', 'Centre d’export', 'Centro de exportación', '导出中心', 'निर्यात केंद्र', 'Export center', 'Centrum eksportu', 'Центр експорту', 'Kituo cha uhamishaji'),
  'exportHint': ('Portable JSON, CRT bundle, certificates, ledger CSV.', 'JSON portable, lot CRT, certificats, CSV du grand livre.', 'JSON portátil, paquete CRT, certificados, CSV.', '可移植 JSON、CRT 包、证书、账本 CSV。', 'पोर्टेबल JSON, CRT बंडल, प्रमाणपत्र, लेजर CSV।', 'Portable JSON, CRT bundle, certificates, ledger CSV.', 'Przenośny JSON, pakiet CRT, certyfikaty, CSV rejestru.', 'Портативний JSON, пакет CRT, сертифікати, CSV реєстру.', 'JSON inayobebeka, kifurushi cha CRT, hati, CSV ya leja.'),
  'managerTitle': ('Members & roles', 'Membres et rôles', 'Miembros y roles', '成员和角色', 'सदस्य और भूमिकाएँ', 'Mga miyembro at tungkulin', 'Członkowie i role', 'Члени та ролі', 'Wanachama na majukumu'),
  'managerHint': ('Invite accounts, assign roles, hand off temp passwords.', 'Invitez, attribuez des rôles, remettez les mots de passe.', 'Invita, asigna roles, entrega contraseñas temporales.', '邀请账户、分配角色、移交临时密码。', 'खाते आमंत्रित करें, भूमिकाएँ दें, अस्थायी पासवर्ड दें।', 'Mag-imbita, magtalaga ng tungkulin, ibigay ang temp password.', 'Zaproś, przydziel role, przekaż hasła tymczasowe.', 'Запрошуйте, призначайте ролі, передавайте тимчасові паролі.', 'Alika, gawa majukumu, kaba nywila za muda.'),
  'managerInvite': ('Invite', 'Inviter', 'Invitar', '邀请', 'आमंत्रित करें', 'Mag-imbita', 'Zaproś', 'Запросити', 'Alika'),
  'managerTempPassword': ('Temporary password', 'Mot de passe temporaire', 'Contraseña temporal', '临时密码', 'अस्थायी पासवर्ड', 'Pansamantalang password', 'Hasło tymczasowe', 'Тимчасовий пароль', 'Nywila ya muda'),
  'managerEmpty': ('Only you so far — invite your council.', 'Vous seul pour l’instant — invitez votre conseil.', 'Solo tú por ahora — invita a tu consejo.', '目前只有你 — 邀请你的理事会。', 'अभी केवल आप — अपनी परिषद को आमंत्रित करें।', 'Ikaw lang sa ngayon — imbitahin ang iyong konseho.', 'Na razie tylko Ty — zaproś swoją radę.', 'Поки лише ви — запросіть свою раду.', 'Ni wewe pekee kwa sasa — alika baraza lako.'),
  'rateTitle': ('Live CAD/BTC', 'CAD/BTC en direct', 'CAD/BTC en vivo', '实时加元/比特币', 'लाइव CAD/BTC', 'Live na CAD/BTC', 'CAD/BTC na żywo', 'CAD/BTC наживо', 'CAD/BTC moja kwa moja'),
  'rateUpdated': ('updated', 'mis à jour', 'actualizado', '已更新', 'अपडेट हुआ', 'na-update', 'zaktualizowano', 'оновлено', 'imesasishwa'),
  'eduCrf': ('What is the CRF?', 'Qu’est-ce que le CRF ?', '¿Qué es el CRF?', '什么是 CRF？', 'CRF क्या है?', 'Ano ang CRF?', 'Czym jest CRF?', 'Що таке CRF?', 'CRF ni nini?'),
  'eduCrfText': ('The Contingency Reserve Fund — at least 10% of annual contributions, held separately for major repairs.', 'Le fonds de réserve — au moins 10 % des cotisations annuelles, séparé pour les grosses réparations.', 'El fondo de reserva — al menos 10 % de las contribuciones anuales, separado.', '应急储备金 — 每年至少 10% 的供款，专用于重大维修。', 'आकस्मिक आरक्षित कोष — वार्षिक योगदान का कम से कम 10%, प्रमुख मरम्मत के लिए।', 'Ang Contingency Reserve Fund — hindi bababa sa 10% ng taunang kontribusyon.', 'Fundusz rezerwowy — co najmniej 10% rocznych składek.', 'Резервний фонд — щонайменше 10% річних внесків.', 'Mfuko wa Akiba — angalau 10% ya michango ya kila mwaka.'),
  'eduMultisig': ('What is multisig?', 'Qu’est-ce que le multisig ?', '¿Qué es multisig?', '什么是多重签名？', 'मल्टीसिग क्या है?', 'Ano ang multisig?', 'Czym jest multisig?', 'Що таке multisig?', 'Multisig ni nini?'),
  'eduMultisigText': ('A wallet that needs multiple signatures to spend — e.g. 3 of 5 council members.', 'Un portefeuille nécessitant plusieurs signatures — ex. 3 sur 5 membres.', 'Una cartera que requiere varias firmas — p. ej. 3 de 5.', '需要多重签名才能使用的钱包 — 例如 5 人中 3 人。', 'एक वॉलेट जिसे खर्च करने के लिए कई हस्ताक्षर चाहिए — जैसे 5 में से 3।', 'Isang wallet na nangangailangan ng maraming pirma — hal. 3 sa 5.', 'Portfel wymagający wielu podpisów — np. 3 z 5.', 'Гаманець, що потребує кількох підписів — напр., 3 з 5.', 'Pochi inayohitaji sahihi nyingi — mf. 3 kati ya 5.'),
  'eduLnurl': ('What is LNURL?', 'Qu’est-ce que LNURL ?', '¿Qué es LNURL?', '什么是 LNURL？', 'LNURL क्या है?', 'Ano ang LNURL?', 'Czym jest LNURL?', 'Що таке LNURL?', 'LNURL ni nini?'),
  'eduLnurlText': ('A Lightning payment standard — scan a QR, the rate locks for 15 minutes.', 'Un standard de paiement Lightning — scannez un QR, taux verrouillé 15 min.', 'Un estándar Lightning — escanea un QR, tasa fijada 15 min.', '一种闪电支付标准 — 扫描二维码，汇率锁定 15 分钟。', 'एक लाइटनिंग भुगतान मानक — QR स्कैन करें, दर 15 मिनट लॉक।', 'Isang Lightning standard — i-scan ang QR, naka-lock ang rate ng 15 min.', 'Standard Lightning — skanuj QR, kurs blokowany na 15 min.', 'Стандарт Lightning — скануйте QR, курс фіксується на 15 хв.', 'Kiwango cha Lightning — changanua QR, kiwango hufungwa kwa dakika 15.'),
  'eduOts': ('What is OTS?', 'Qu’est-ce que l’OTS ?', '¿Qué es OTS?', '什么是 OTS？', 'OTS क्या है?', 'Ano ang OTS?', 'Czym jest OTS?', 'Що таке OTS?', 'OTS ni nini?'),
  'eduOtsText': ('OpenTimestamps — anchors a hash to Bitcoin so you can prove when a record existed.', 'OpenTimestamps — ancre un hachage sur Bitcoin pour prouver l’existence.', 'OpenTimestamps — ancla un hash a Bitcoin para probar cuándo existió.', 'OpenTimestamps — 将哈希锚定到比特币以证明记录存在的时间。', 'OpenTimestamps — हैश को बिटकॉइन पर एंकर करता है।', 'OpenTimestamps — ina-angkla ang hash sa Bitcoin.', 'OpenTimestamps — zakotwicza skrót na Bitcoin.', 'OpenTimestamps — закріплює хеш у Bitcoin.', 'OpenTimestamps — huweka hashi kwenye Bitcoin.'),
  'eduDca': ('CRF % at risk', 'CRF % en jeu', 'CRF % en riesgo', '风险 CRF 百分比', 'जोखिम में CRF %', 'CRF % na nakataya', 'CRF % zagrożony', 'CRF % під ризиком', 'CRF % hatarini'),
  'eduDcaText': ('The share of the reserve fund the DCA plan would move to the BTC war chest.', 'La part du fonds de réserve que le DCA déplacerait vers le coffre BTC.', 'La parte del fondo que el DCA movería al cofre BTC.', 'DCA 计划将转入 BTC 金库的储备金份额。', 'आरक्षित कोष का हिस्सा जो DCA BTC कोष में भेजेगा।', 'Ang bahagi ng reserba na ililipat ng DCA sa BTC war chest.', 'Część funduszu, którą DCA przeniósłby do skarbca BTC.', 'Частка фонду, яку DCA перемістить у BTC-скарбницю.', 'Sehemu ya mfuko ambayo DCA ingehamisha kwa hazina ya BTC.'),
  'designTitle': ('Design system', 'Système de design', 'Sistema de diseño', '设计系统', 'डिज़ाइन सिस्टम', 'Design system', 'System projektowania', 'Дизайн-система', 'Mfumo wa muundo'),
  'designIntro': ('Tokens, type, and components — the OpenStrata design language.', 'Jetons, typographie et composants — le langage OpenStrata.', 'Tokens, tipografía y componentes — el lenguaje OpenStrata.', '令牌、字体和组件 — OpenStrata 设计语言。', 'टोकन, टाइप और घटक — OpenStrata डिज़ाइन भाषा।', 'Tokens, type, at components — ang wika ng disenyo ng OpenStrata.', 'Tokeny, typografia i komponenty — język OpenStrata.', 'Токени, типографіка та компоненти — мова OpenStrata.', 'Tokeni, fonti na vipengele — lugha ya muundo ya OpenStrata.'),
  'themeBrokerage': ('Brokerage theme', 'Thème courtier', 'Tema de corretaje', '经纪主题', 'ब्रोकरेज थीम', 'Tema ng brokerage', 'Motyw brokerski', 'Брокерська тема', 'Mandhari ya wakala'),
  'themeBrand': ('Brand accent', 'Accent de marque', 'Acento de marca', '品牌强调色', 'ब्रांड एक्सेंट', 'Brand accent', 'Akcent marki', 'Акцент бренду', 'Rangi ya chapa'),
}

# Build insertion strings.
type_keys = ' '.join(f'{k}: string;' for k in KEYS)
en_keys = ' '.join(f"{k}: '{v[0]}'," for k, v in KEYS.items())

# 1. Type — insert before the closing ";\n}" of the Translation type.
type_idx = src.find('};\n\nexport const english')
assert type_idx > 0
src = src[:type_idx] + ' ' + type_keys + src[type_idx:]

# 2. English — insert before "\n};\n\nexport const overrides".
en_marker = "confirmSignOutMessage: 'You’ll need your credentials to get back in.'\n};"
assert en_marker in src
src = src.replace(en_marker, f"confirmSignOutMessage: 'You’ll need your credentials to get back in.', {en_keys}\n}};")

# 3. Locale blocks — insert per-locale translations before each block's final ' }'.
locale_codes = ['fr', 'es', 'zh', 'hi', 'fil', 'pl', 'uk', 'sw']
for idx, code in enumerate(locale_codes):
    block_re = re.compile(rf"^  {code}: \{{ \.\.\.english,(.*?)( \}},?)$", re.M | re.S)
    m = block_re.search(src)
    assert m, f'locale block {code} not found'
    trans = ' '.join(f"{k}: '{v[idx+1]}'," for k, v in KEYS.items())
    closing = m.group(2).strip()  # '}' or '},'
    indent = m.group(0)[:2]  # '  ' leading indent
    new_block = indent + code + ': { ...english,' + m.group(1) + ', ' + trans + ' ' + closing
    src = src[:m.start()] + new_block + src[m.end():]

open(path, 'w').write(src)
print(f'added {len(KEYS)} keys x 9 locales')
