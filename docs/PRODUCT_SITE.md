# Static product website

The complete product page is in `site/`, with local fonts and real application/Builder captures. It shares the visual wizard's colours, mark, typography and spacing. The TV screenshot is a desktop browser capture, not a photograph or claim of Samsung certification. See `site/assets/SCREENSHOTS.md` for provenance.

## Preview

```bash
npm run site:prepare
npm run site:preview
```

Open `http://127.0.0.1:8893`. This serves only static files. The interactive preview at `/demo/` is generated from the same Builder frontend with an explicit demo marker; it does not run the API, compile, upload configuration or offer a fake WGT download. Requirement checks in that preview are illustrative, not measurements of the visitor's computer.

The local compiler is separate: `npm run builder`. Do not expose it through a reverse proxy, Pages or a public network interface.

## GitHub Pages

After this PR is merged, select **Settings → Pages → Build and deployment → GitHub Actions** in the repository. The included `product-pages.yml` workflow deploys only `site/` on relevant pushes to `main`. It follows [GitHub's static Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). It has no server, secrets, personal build files or runtime API.

The workflow is intentionally not a PR preview deployment. This PR prepares the page and tests it locally/CI without changing the publishing source or merging itself. The deployment action reports the actual public URL after a successful main-branch publication; do not advertise a guessed URL as live.

## Maintain the preview

Edit the actual wizard in `personal/web/`, then run `npm run site:prepare` to synchronize its static copy. `tools/prepare-product-site.mjs` also derives the 21 language previews from the unchanged runtime dictionaries. Do not implement a separate frontend compiler or duplicate settings normalizer.

Use actual screenshots. Do not market `QA-001` fixture posters as a real catalogue, or describe a simulated progress screen as a completed build. Keep selected product images small; full test evidence belongs in CI artifacts with a seven-day retention, never a large committed ZIP.
