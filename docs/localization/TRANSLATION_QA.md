# Translation QA

## Implemented checks

- Parse JS and JSON dictionaries as data using `@babel/parser`; never execute translation files.
- Detect duplicate declarations before JavaScript overwrites them; prefer the shipped source when a draft with the same locale exists.
- Compare placeholder names and multiplicities, including `#{key}` references.
- Detect empty values, non-string properties, invalid Unicode, replacement characters, control characters, unfinished markers and unbalanced HTML tags.
- Record directional control characters for review, identical English/Russian values, unexpected Cyrillic, long Latin phrases in non-Latin locales, and expansion over 1.7 times the source for strings longer than 80 characters.
- Parse all `src/**/*.js`; record literal `Lang.translate` and `Lampa.Lang.translate` calls, multiline calls, template tokens, dynamic calls and registration sites (`add`, `AddTranslation`, `codes`, `addCodes`). HTML attributes and SVG paths are removed from the visible-text candidate queue.
- Mandatory regression tests reject malformed shipped dictionaries and unresolved static UI references.

The inventory contains 1,522 hardcoded-text candidates. These include false positives, brands, content and technical strings. **They have not all been classified.** This heuristic cannot certify language identity or meaning. Registered translations and conditional code need manual review; aliases and computed lookups are not exhaustively resolved. Plugins outside `src/` are not included in this inventory.

## Repairs

Removed 21 shadowed declarations across seven shipped dictionaries, retaining each effective final value. A comparison against the base commit verified that no original key was removed and only 11 Hebrew and five Polish existing values changed. Three added reference keys have text in all 21 locales, including drafts. About screen hash/build labels now use localization tokens.

Hebrew repairs restore the ScraperAPI URL and `{q}` placeholders, `{ip}` spelling/braces, empty notification/account/bookmark strings and the broken device-code message. Polish repairs restore complete diagnostic messages and `{ip}`, `{count}`, `{site}` values.

These texts were authored and checked automatically. Independent linguistic review and native-speaker review: **NOT_RUN**. Complete per-language glossaries: **NOT_DONE**. RTL appearance, font coverage and navigation cannot be certified by dictionary checks.

## Known remaining source text

`src/templates/activity_wait_refresh.js` contains Russian copy. `src/templates/torrent/errors/nocheck.js` and `noconnect.js` contain Russian diagnostics and a Cyrillic address mask. These templates are registered by the app; reachability under every runtime state is not yet established. IPTV `Lang.add()` overrides are a separate translation surface. Inspect `source-inventory.json` before declaring the canonical set final.
