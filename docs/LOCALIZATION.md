# Interface localization

All 21 supported locales ship complete 1,399-key dictionaries: nl, de, tr, en, zh, hi, es, ar, fr, bn, pt, id, ur, ru, uk, be, bg, cs, he, pl, ro. The first 13 are the requested independent WGT build configurations. Every WGT includes all 21; the selected build language is an initial preference, not a restriction.

The first launch offers native language names. Later changes use Settings → Interface → Language and reload the app. Existing bookmarks, playback progress, plugins, parser/server values and metadata preferences are preserved. Builder seeding changes each managed setting only when its corresponding build input changes.

Arabic, Urdu and Hebrew set root language/direction and use shared direction-aware layouts and physical remote navigation. Technical URLs, IPs, paths and code are isolated left-to-right. Native text inputs follow the content; URL editors stay left-to-right. Video, subtitles' media content, posters and QR images are not globally flipped.

Local licensed static fonts cover Devanagari, Bengali, Arabic/Urdu, Hebrew and Chinese UI characters. Gulp copies binaries without UTF-8 conversion; packaging verifies font/image bytes against source. Every locale has a terminology glossary and exact context overrides. Independent native-speaker review remains a separate acceptance task; automated translation assistance is not native certification.

Run with Node.js 22+:

```sh
npm ci --no-fund
npm run i18n:strict
npm run i18n:source-check
npm run test:personal
npm test -- --run
node tools/i18n-evidence.mjs --strict
npm audit --audit-level=low
npm run build:personal -- --language nl --plugins off
```

Strict checks cover all 21 locales, duplicates, missing keys, placeholder counts, HTML tags/attributes, service paths, code literals, product spelling and unreviewed English/Russian copies. Legitimate identical native cognates, language/country names and brands have exact value-bound reasons. Candidate detection is heuristic; the source-context ledger explicitly classifies all occurrences and records the original inventory resolutions. A changed source file or new/changed candidate requires review rather than automatic approval.

Browser fixture QA uses the actual compiled WGT app with controlled catalog/player/server responses. It is not evidence of live third-party playback, physical Samsung compatibility or native-language editorial approval. See the [execution checkpoints](localization/EXECUTION.md), [visual results](localization/UI_VISUAL_REPORT.md), [regression results](localization/BUILD_REGRESSION.md) and [hardware procedure](localization/SAMSUNG_TIZEN_ACCEPTANCE.md).
