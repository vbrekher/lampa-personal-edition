# Implementation checkpoints

## A — Dutch, German, Turkish runtime packages

Completed dictionaries contain 1,351 nonempty keys each. Missing keys, broken placeholders, malformed HTML/Unicode, missing named products and unreviewed source-copy signals: zero. Exact value-bound exceptions document country/language names, established UI words, products and technical units. Three terminology glossaries are included.

Initial machine translation was followed by a separate Codex contextual pass: over 190 targeted corrections, including player/actor confusion, time offset, torrent peers, watch history, extension status, subtitle backgrounds, input modes and technical names. Native-speaker certification is not claimed.

All three modules are packaged locally and present in both runtime selection and builder validation. Actual browser switching `nl → de → tr → nl` via Settings and arrow/Enter keys was observed without rebuilding. Startup text and the main-page title now follow the selected language. Switching the interface no longer overwrites the independently chosen TMDB language. Bootstrap seeding preserves metadata language, favorites, history and plugin data.

Real home/settings screenshots at 1920×1080 and 3840×2160 are stored in `screenshots/stage1/`. Dutch settings and Turkish parser inspected text did not overflow horizontally. The Turkish Jackett translation defect was repaired and rechecked in the live parser settings. These smoke checks are a checkpoint, not the final full 364-case visual matrix or physical Samsung acceptance.

Unit and packaging tests: 45/45. A real Dutch WGT build and ZIP integrity verification passed. The full 13-configuration build matrix remains a later acceptance step. Older localization reports describe the historical 428fd7f5 snapshot and will be replaced after the remaining implementation checkpoints.
