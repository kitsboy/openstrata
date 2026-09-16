#!/usr/bin/env python3
"""Add the demo-honest visitor-notice i18n keys to every locale block + the type.

Modelled on scripts/add-i18n-keys.py (same insertion mechanics, same idempotency
guard) so the fr-parity benchmark in scripts/audit-i18n.mjs keeps passing.
"""
import re

path = 'src/lib/i18n.ts'
src = open(path).read()

# key -> (en, fr, es, zh, hi, fil, pl, uk, sw)
KEYS = {
  'demoNoticeTitle': (
    'Demo — sample data',
    'Démo — données d’exemple',
    'Demo — datos de muestra',
    '演示 — 示例数据',
    'डेमो — नमूना डेटा',
    'Demo — sample na data',
    'Demo — dane przykładowe',
    'Демо — зразкові дані',
    'Demo — data ya sampuli'),
  'demoNoticeBody': (
    'You’re exploring a live demo of OpenStrata. Every community, balance, and action here is sample data — no real council data, and no host is connected yet.',
    'Vous explorez une démo en direct d’OpenStrata. Chaque communauté, solde et action ici sont des données d’exemple — aucune donnée réelle de conseil, et aucun hôte n’est connecté pour l’instant.',
    'Estás explorando una demo en vivo de OpenStrata. Cada comunidad, saldo y acción aquí son datos de muestra — no hay datos reales de ningún consejo y ningún host está conectado todavía.',
    '您正在浏览 OpenStrata 的在线演示。这里的每个社区、余额和操作都是示例数据——没有真实的理事会数据，也尚未连接任何主机。',
    'आप OpenStrata का लाइव डेमो देख रहे हैं। यहाँ हर समुदाय, शेष और कार्रवाई नमूना डेटा है — कोई वास्तविक परिषद डेटा नहीं, और अभी कोई होस्ट जुड़ा नहीं है।',
    'Tinitignan mo ang live na demo ng OpenStrata. Lahat ng komunidad, balanse, at aksyon dito ay sample data — walang tunay na data ng konseho, at wala pang nakakonektang host.',
    'Przeglądasz demonstrację OpenStrata na żywo. Każda wspólnota, saldo i działanie to dane przykładowe — brak rzeczywistych danych rady i żaden host nie jest jeszcze podłączony.',
    'Ви переглядаєте демонстрацію OpenStrata. Кожна спільнота, баланс і дія тут — зразкові дані: реальних даних ради немає, і жоден хост ще не підключено.',
    'Unachunguza demo ya OpenStrata. Kila jumuiya, salio na kitendo hapa ni data ya sampuli — hakuna data halisi ya baraza, na hakuna host iliyounganishwa bado.'),
  'demoNoticeCta': (
    'Request access',
    'Demander l’accès',
    'Solicitar acceso',
    '申请访问',
    'पहुँच का अनुरोध करें',
    'Humiling ng access',
    'Poproś o dostęp',
    'Запросити доступ',
    'Omba ufikiaji'),
  'demoNoticeLearn': (
    'See how it works',
    'Voir comment ça marche',
    'Ver cómo funciona',
    '了解运作方式',
    'यह कैसे काम करता है देखें',
    'Tingnan kung paano ito gumagana',
    'Zobacz, jak to działa',
    'Подивіться, як це працює',
    'Ona jinsi inavyofanya kazi'),
  'devHostLabel': (
    'Running your own host?',
    'Vous hébergez votre propre hôte ?',
    '¿Ejecutas tu propio host?',
    '自己搭建主机？',
    'अपना होस्ट चला रहे हैं?',
    'Nagpapatakbo ka ng sariling host?',
    'Prowadzisz własny host?',
    'Запускаєте власний хост?',
    'Unaendesha hosti yako mwenyewe?'),
  'devHostPrompt': (
    'OpenStrata API base URL for this browser (e.g. https://your-host:8080). Leave empty to go back to demo mode.',
    'URL de base de l’API OpenStrata pour ce navigateur (p. ex. https://votre-hote:8080). Laissez vide pour revenir en mode démo.',
    'URL base de la API de OpenStrata para este navegador (p. ej. https://tu-host:8080). Déjalo vacío para volver al modo demo.',
    '此浏览器的 OpenStrata API 基础地址（例如 https://your-host:8080）。留空即返回演示模式。',
    'इस ब्राउज़र के लिए OpenStrata API बेस URL (जैसे https://your-host:8080)। डेमो मोड में लौटने के लिए खाली छोड़ें।',
    'OpenStrata API base URL para sa browser na ito (hal. https://your-host:8080). Iwanang blangko para bumalik sa demo mode.',
    'Bazowy adres API OpenStrata dla tej przeglądarki (np. https://twoj-host:8080). Pozostaw puste, aby wrócić do trybu demo.',
    'Базова адреса API OpenStrata для цього браузера (напр. https://your-host:8080). Залиште порожнім, щоб повернутися в демо-режим.',
    'Anwani ya msingi ya API ya OpenStrata kwa kivinjari hiki (mf. https://hosti-yako:8080). Acha wazi kurudi kwenye hali ya demo.'),
}

# Idempotency: drop keys already present in the English block.
EN_HEAD = src.index('export const english: Translation = {')
EN_TAIL = src.index('\n};', EN_HEAD)
en_existing = set(re.findall(r"([A-Za-z]+): '", src[EN_HEAD:EN_TAIL]))
KEYS = {k: v for k, v in KEYS.items() if k not in en_existing}
if not KEYS:
    print('nothing to do — all keys already present')
    raise SystemExit(0)

type_keys = ' '.join(f'{k}: string;' for k in KEYS)
en_keys = ' '.join(f"{k}: '{v[0]}'," for k, v in KEYS.items())

# 1. Type — insert before the closing of the Translation type.
type_idx = src.find('};\n\nexport const english')
assert type_idx > 0, 'Translation type closing not found'
src = src[:type_idx] + ' ' + type_keys + src[type_idx:]

# 2. English — append before the closing of the english object.
en_start = src.index('export const english: Translation = {')
en_body_end = src.index('\n};', en_start)
en_body = src[en_start:en_body_end].rstrip()
if not en_body.endswith(','):
    en_body += ','
src = src[:en_start] + en_body + ' ' + en_keys + '\n};' + src[en_body_end + 3:]

# 3. Locale blocks — insert per-locale translations before each block's final ' }'.
locale_codes = ['fr', 'es', 'zh', 'hi', 'fil', 'pl', 'uk', 'sw']
for idx, code in enumerate(locale_codes):
    block_re = re.compile(rf"^  {code}: \{{ \.\.\.english,(.*?)( \}},?)$", re.M | re.S)
    m = block_re.search(src)
    assert m, f'locale block {code} not found'
    trans = ' '.join(f"{k}: '{v[idx+1]}'," for k, v in KEYS.items())
    closing = m.group(2).strip()
    indent = m.group(0)[:2]
    content = m.group(1).rstrip()
    if not content.endswith(','):
        content += ','
    new_block = indent + code + ': { ...english,' + content + ' ' + trans + ' ' + closing
    src = src[:m.start()] + new_block + src[m.end():]

open(path, 'w').write(src)
print(f'added {len(KEYS)} keys x 9 locales: {", ".join(KEYS)}')
