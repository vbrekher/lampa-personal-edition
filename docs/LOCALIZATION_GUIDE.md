# Improve a Translation

You do not need to audit all 21 languages to improve a few phrases. Keep your PR focused and explain the context.

## Find the text

Runtime dictionaries live in `src/lang/<code>.js`. The complete authoring mirrors are in `i18n/drafts/<code>.json`. For example:

```bash
rg -n 'phrase you want to improve' src/lang/nl.js
rg -n 'title_left' src/interaction src/templates
```

Inspect where the key is used. A word such as “left” can mean remaining playback time rather than physical direction. Prefer natural interface terminology over literal translation.

## Make a focused correction

1. Change the value in the runtime dictionary and its JSON mirror.
2. If the key has an exact context override in `i18n/glossaries/<code>.json`, update that override too. Keep the glossary's terminology consistent.
3. Keep placeholders such as `{name}` and `#{count}` byte-for-byte intact, including their counts. Preserve HTML tags/attributes, literal code, paths and product names.
4. Do not add English copies just to satisfy coverage. Exact identical cognates, brands or native proper names may be justified in `i18n/reviewed-exceptions.json`; explain the reason rather than exempting a whole locale.
5. If an existing exception becomes stale because of your correction, remove or update only that exact reviewed value.

## Check the change

Use Node.js 22+:

```bash
npm ci
npm run i18n:strict
npm run test:personal
npm run i18n:source-check
```

These fast checks run automatically in CI. A small wording correction does not require the full multi-hour visual matrix. If your text affects wrapping, fonts, direction or focus, attach a screenshot of the affected locale and screen. For browser matrix work, the existing `localization-ui.yml` workflow accepts a locale and test-title filter for a targeted run.

For a new UI expression, add the canonical key to all supported dictionaries and update any source-context review decision. Explain which screen it belongs to. Propose new terminology through an issue or a focused glossary PR with examples.

## RTL contributions

Arabic, Urdu and Hebrew use the common root direction and RTL styles in the shared direction utilities (`src/utils/direction.js`) and local UI styles. Verify actual physical navigation and mixed technical text. URLs/IPs/paths stay LTR; video, posters, QR codes and caption content must not be globally mirrored. Limit screenshots to the changed area unless a shared layout change requires broader coverage.

## Open a PR

Fork the repository, create a branch from current `main`, commit the focused change and open a pull request using the [translation template](../.github/PULL_REQUEST_TEMPLATE/translation.md). Include locale, keys, old/new meaning, context and checks. State whether you are a native speaker; automated or model-assisted edits are welcome but must not be described as native certification.

Builder UI messages are separate: `personal/web/messages.js` contains complete EN/RU/NL dictionaries. Run `npm run site:prepare` after changing them so the static preview stays in sync. Terminal strings live in `personal/i18n.mjs`.

Respect original authors, licenses and attribution. Do not include personal WGTs, authenticated addresses, credentials or unlicensed media.
