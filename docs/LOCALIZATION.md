# Lampa Personal Edition — in-app localization work

**Status: translation groundwork, not a multilingual release.** The requested languages are not all fully translated yet. Do not claim the eight new language packs are available on Samsung or introduce them in `src/lang/meta.js` before completion.

## Requested scope

The user requested **Dutch, German and Turkish**, plus the **ten most spoken languages worldwide** (first- and second-language speakers; Ethnologue 2026 as summarized by Visual Capitalist): **English, Mandarin Chinese, Hindi, Spanish, Modern Standard Arabic, French, Bengali, Portuguese, Indonesian, Urdu**.

| Code | Language | Current source | State |
|---|---|---|---|
| nl | Nederlands | `i18n/drafts/nl.json` | DRAFT — not exposed |
| de | Deutsch | `i18n/drafts/de.json` | DRAFT — not exposed |
| tr | Türkçe | `i18n/drafts/tr.json` | DRAFT — not exposed |
| en | English | `src/lang/en.js` | 100% canonical keys; linguistic review pending |
| zh | 简体中文 | `src/lang/zh.js` | 100% canonical keys; linguistic review pending |
| hi | हिन्दी | `i18n/drafts/hi.json` | DRAFT — not exposed |
| es | Español | `src/lang/es.js` | 100% canonical keys; linguistic review pending |
| ar | العربية | `i18n/drafts/ar.json` | DRAFT — RTL untested |
| fr | Français | `src/lang/fr.js` | 100% canonical keys; linguistic review pending |
| bn | বাংলা | `i18n/drafts/bn.json` | DRAFT — not exposed |
| pt | Português | `src/lang/pt.js` | 100% canonical keys; linguistic review pending |
| id | Bahasa Indonesia | `i18n/drafts/id.json` | DRAFT — not exposed |
| ur | اردو | `i18n/drafts/ur.json` | DRAFT — RTL untested |

`src/lang/en.js` has 1,327 declared translation entries and `src/lang/ru.js` has 1,345. The canonical target is the **union of both**, not whichever file is shorter. English and Russian may not have identical keys; the checked inventory is authoritative. A word-for-word key set alone does **not** establish that translations are idiomatic.

## Commands

```sh
npm run i18n:report
node tools/i18n-export.mjs nl > nl-missing.json
npm run test:personal
npm run i18n:strict
```

`i18n:report` prints exact counts, missing keys, placeholders and matches with the source languages. `i18n:strict` intentionally fails while any requested language is incomplete, including incomplete upstream language files. Never downgrade, disable, or fake this gate to make a release look complete.

## Acceptance criteria for activating a language

1. Translate **every key** in the reference union with native, context-appropriate UI copy. Use consistent media terminology for `parser`, `torrent`, `TorrServer`, `playlist`, `subtitle`, `player`, and account/privacy messaging. Preserve proper nouns as proper nouns.
2. Confirm text placeholders (`{name}`, `{q}`, etc.), HTML markup, URLs, key identifiers, quotation marks, and syntax. No use of string concatenation that can lose parameters.
3. Walk through **first launch, Settings, interface controls, TorrServer/Parser, subtitles, search, film and TV cards, player, errors, installed plugins and Popular plugin catalogue** in the selected language, including remote navigation and long-text clipping.
4. Update language enumeration in `src/lang/meta.js` and the Personal builder `LANGUAGES` list only after passing all QA. The build must copy the actual `src/lang/<code>.js` module into `lang/<code>.js`, and `loadLang()` must fetch the local WGT asset rather than a remote copy.
5. For **Arabic and Urdu**, test RTL focus order, directionality of numbers/URL/magnet strings and Tizen font coverage; ensure bidirectional text does not corrupt server URLs or numeric labels.
6. Confirm switching language preserves stored favorites, plugins and TorrServer URL. Confirm TMDB locale codes independently: subtitle languages and content metadata are not the same as app interface language.
7. Run at least one real Tizen WGT smoke test per script family and native-speaker review for grammatical accuracy. A machine-generated draft is not automatically approved.
8. Do not silently substitute Russian or English in an otherwise fully translated interface. If a string is missing, keep the language out of the released selector and explain why.

## Scope exclusions

Third-party remotely hosted plugins own their own UI strings; Lampa Personal Edition cannot guarantee all their settings are translated unless the plugin author supplies localization. Metadata (film titles, synopses, subtitles, streaming site labels) is supplied by external providers and has independent language coverage. The builder's terminal UI in English/Russian/Dutch is separate from the TV app's language selection.

## Work completed in this branch

Eight first-pass core translation dictionaries (97 UI terms each) are authored under `i18n/drafts/`; these are **starting points** for comprehensive translations, not language packs claimed complete. The bundled curated plugin catalogue now has category headings and all six plugin descriptions in every requested language; that component's metadata is independently covered by tests. No new draft is loaded at runtime. A dependency-free audit and tests make incomplete language claims detectable. Five pre-existing top-ten language files have also been completed to the reference key union (English, Chinese, Spanish, French and Portuguese), and both known dynamic-placeholder mismatches repaired. This provides structural coverage, not a native-speaker quality certification.

## Roadmap for completion

1. Complete and native-review Dutch, German and Turkish with all canonical keys and media terms.
2. Audit existing English, Chinese, Spanish, French and Portuguese for missing/legacy keys.
3. Finish Hindi, Modern Standard Arabic, Bengali, Indonesian and Urdu; audit fonts, line wrapping, and RTL.
4. Convert each fully reviewed draft to `src/lang/<code>.js`, extend `meta.js`, builder language validation and Tizen packaging checks; run strict CI + real TV smoke tests.

**Do not merge draft-only language selection flags as if this were a full translation release.**
