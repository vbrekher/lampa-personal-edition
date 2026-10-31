# Changelog

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
