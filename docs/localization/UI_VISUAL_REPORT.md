# Browser visual checkpoint

**The required 182-scenario matrix is NOT_COMPLETE.** No screenshots were generated as mockups. A real English WGT was unpacked and served on `127.0.0.1`; the application loaded its catalogue, settings and local Hebrew language module in the desktop in-app browser.

Evidence files in `screenshots/`:

- `en-settings.jpg`: English settings at the initial browser size; Parser and TorrServer present.
- `en-interface-1920x1080.jpg`: English interface settings.
- `language-selector-1920x1080.jpg`: runtime selector with the 13 existing languages.
- `he-home-1920x1080.jpg`: application after keyboard Down/Enter selection and restart.
- `he-settings-1920x1080.jpg` and `he-settings-3840x2160.jpg`: Hebrew settings; RTL failure evidence.

The browser console query returned no error entries at the inspected moment after the language restart; this is not proof of no errors across all states. Desktop keyboard navigation was exercised only in the language selector. A Samsung remote was not tested. Long-text clipping, all text sizes, all scripts, player/subtitles, errors and modal matrices remain unverified.

Known visible defects: Hebrew remains in an LTR layout, root language remains English, Parser is English, and the preserved activity URL displayed the old English Home title after switching. Metadata language changed with the interface in this default configuration; independent metadata/search/audio/subtitle language behavior requires investigation.
