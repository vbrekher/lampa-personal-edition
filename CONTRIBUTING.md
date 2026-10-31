# Contributing

Thanks for helping improve Lampa Personal Edition. Original Lampa and its code are maintained by [Yumata](https://github.com/yumata/lampa-source); this fork focuses on local Samsung personal builds.

Before submitting a pull request, run:

~~~bash
npm run test:personal
npm run build:personal -- --language ru --plugins off
~~~

For build-system changes, include a test and name the upstream commit used. For TV compatibility reports, give the Samsung model, Tizen version, installation method and a safe reproduction. Distinguish a desktop/browser test from testing on a real TV.

**Do not submit** user-specific WGTs, private TorrServer URLs, authenticated streams, passwords, tokens, certificates, bundled copyrighted media or unlicensed third-party plugins.

Keep original Lampa attribution and licensing notices. Changes here should not be marketed as an official release from Lampa's author.
