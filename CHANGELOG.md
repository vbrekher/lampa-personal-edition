# Changelog

## v0.2.0 — Product Experience 2.0 (release candidate)

- Added a local nine-step visual WGT wizard with complete English, Russian and Dutch UI, 21 TV language choices and RTL previews.
- Shared the existing compiler/normalizer between CLI and wizard; retained terminal flags and interactive setup.
- Added live compiler stages, cancellation/process-group cleanup, retry, archive verification, SHA-256, private job downloads and atomic output.
- Added loopback-only serving, Host/Origin/session checks, fixed file boundaries, explicit plugin consent and cross-process build locking.
- Added a unified product README, static Pages-ready website and an explicitly non-compiling interactive preview.
- Added macOS/Linux browser E2E for real builds, failure/recovery, cancellation and downloads, with short-lived screenshot evidence.
- Added focused community translation guidance and a translation PR template. All 21 Lampa dictionaries and RTL runtime code are preserved.

No Samsung hardware certification, signed binary release or hosted compilation service is claimed. Personal WGTs are never published by this workflow.

## Unreleased — language consistency

- Localized builder prompts, help, warnings and validation errors into English, Russian and Dutch.
- Separated terminal setup language (`--builder-language`) from the on-TV language (`--language`).
- Updated all three entry-point guides to show prompts in their own language.
- Added localization regression tests and a documentation-language audit.

## v0.1.0 — initial developer preview

- Added local Mac/Linux personal builder for Samsung Tizen WGT.
- Introduced user-selected language, optional TorrServer URL, and opt-in plugins.
- Compiles upstream Lampa 3.x assets in a temporary directory and strips the public app loader from the staged package.
- Added separate Tizen app ID, branded icon and visual GitHub documentation.
- Added eleven source/packaging tests and CI that compiles a credential-free generic smoke WGT, verifies its ZIP and discards the result.
- Added English, Russian and Dutch installation guides and security notes.

**Not certified:** physical Samsung install/playback, codec support and TorrServer live connectivity remain unverified. No personalized WGT binary is published.
