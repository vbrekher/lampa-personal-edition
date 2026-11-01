# Translation QA

Every shipped locale has the full 1,399-key canonical union and a 20-term glossary. The JSON files under `i18n/drafts/` are authoring mirrors of the complete runtime dictionaries, not unpublished partial language packs. Runtime JS remains the audited source of truth.

Checks parse dictionaries as data without executing them, reject duplicate/empty/non-string values, malformed Unicode/control characters, unfinished markers, placeholder name/count changes, HTML tag/attribute changes, translated service paths and altered literal code examples. Product names are compared at word boundaries. Identical English/Russian values and suspicious script/language mixes remain visible; approved cognates/brands/native proper names are exact-value exceptions with reasons, not blanket locale exemptions.

A pinned local NLLB-200 distilled 600M model assisted initial authoring (research-only model files are not shipped in WGT or repository). Codex separately reviewed terminology and source context, repaired mistranslations/omissions and maintained native context overrides. This is not an independent native-speaker certification. Native editorial review: NOT_RUN.

The source review started with 1,601 candidate occurrences / 85 dynamic calls; 261 original candidates were fixed or migrated. All 1,344 current candidate occurrences and 88 dynamic calls have explicit categories/reasons in `i18n/source-review.json`. The ledger retains every baseline resolution, each exact string/expression location and source SHA256. `i18n:source-check` rejects new text, stale decisions and changes to surrounding code. Metadata matching tokens, codec/provider brands, raw SDK/developer diagnostics and code fragments remain intentional. User-facing waiting, error, information, notice, promotion and plugin copy is canonical.

Local static Noto fonts carry OFL licenses and hashes. Tests inspect script glyph coverage and shaping tables, Chinese subset coverage, Latin/Cyrillic coverage, and byte-exact binary packaging. Regenerate the Chinese subset when own Chinese text changes. Browser checks additionally require the expected font face to report loaded.

Automated/Codex contextual review and structural completeness are software evidence. Native grammar/style acceptance and actual Samsung font rendering remain explicitly external.
