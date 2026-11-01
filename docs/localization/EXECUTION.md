# Implementation checkpoints

## A — Dutch, German, Turkish runtime packages

Completed dictionaries contain 1,351 nonempty keys each. Missing keys, broken placeholders, malformed HTML/Unicode, missing named products and unreviewed source-copy signals: zero. Exact value-bound exceptions document country/language names, established UI words, products and technical units. Three terminology glossaries are included.

Initial machine translation was followed by a separate Codex contextual pass: over 190 targeted corrections, including player/actor confusion, time offset, torrent peers, watch history, extension status, subtitle backgrounds, input modes and technical names. Native-speaker certification is not claimed.

All three modules are packaged locally and present in both runtime selection and builder validation. Actual browser switching `nl → de → tr → nl` via Settings and arrow/Enter keys was observed without rebuilding. Startup text and the main-page title now follow the selected language. Switching the interface no longer overwrites the independently chosen TMDB language. Bootstrap seeding preserves metadata language, favorites, history and plugin data.

Real home/settings screenshots at 1920×1080 and 3840×2160 are stored in `screenshots/stage1/`. Dutch settings and Turkish parser inspected text did not overflow horizontally. The Turkish Jackett translation defect was repaired and rechecked in the live parser settings. These smoke checks are a checkpoint, not the final full 364-case visual matrix or physical Samsung acceptance.

Unit and packaging tests: 45/45. A real Dutch WGT build and ZIP integrity verification passed. The full 13-configuration build matrix remains a later acceptance step. Older localization reports describe the historical 428fd7f5 snapshot and will be replaced after the remaining implementation checkpoints.

## B — Hindi, Bengali, Indonesian runtime packages

All three packages contain 1,351 keys and are active in the language picker and builder. Structural checks, product checks, exact-value copy review and 50 automated tests pass. Each locale has a 21-term glossary and a separate contextual correction pass. Initial translations came from a pinned, locally run NLLB model; this is not native-speaker certification. Fragment translations, player/account terminology, subtitle source descriptions and account URL suffixes were manually corrected. The model is an authoring aid outside the repository and is not shipped.

Static, licensed Noto Devanagari and Bengali WOFF assets are bundled locally, with source hashes and OFL notices. Tests check every used script code point and shaping tables. Hindi settings/subtitle settings and Bengali/Indonesian settings/parser were opened in production components with controlled catalog fixtures. Bengali/Indonesian smoke captures at both target resolutions are retained in `screenshots/stage2/`. These are fixtures, not proof of live TorrServer or plugin integrations. A Hindi subtitle capture was initially premature and is excluded from acceptance pending the full stable matrix.

Actual Hindi, Bengali and Indonesian WGT builds and ZIP checks passed. The final 13-locale build matrix will rebuild these after subsequent changes. Seeding now updates each builder-managed setting independently, preserving TV-side server/parser changes when only the builder language changes.
